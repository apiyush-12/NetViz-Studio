import type { OspfRouter, OspfLink } from "./ospf.types";

export interface OspfValidationError {
  id: string;
  field: string;
  severity: "error" | "warning";
  title: string;
  message: string;
  recommendation: string;
  affectedNodeIds: string[];
}

export function validateOspfConfiguration(
  routers: OspfRouter[],
  links: OspfLink[]
): OspfValidationError[] {
  const errors: OspfValidationError[] = [];

  // 1. Check for Duplicate Router IDs
  const routerIdMap = new Map<string, string[]>();
  routers.forEach((r) => {
    if (r.state === "Disabled") return;
    const existing = routerIdMap.get(r.routerId) ?? [];
    existing.push(r.nodeId);
    routerIdMap.set(r.routerId, existing);
  });

  routerIdMap.forEach((nodeIds, routerId) => {
    if (nodeIds.length > 1) {
      errors.push({
        id: `err-dup-rid-${routerId}`,
        field: "routerId",
        severity: "error",
        title: "Duplicate OSPF Router ID",
        message: `Routers ${nodeIds.join(", ")} both use Router ID ${routerId}. OSPF requires each router within an autonomous domain to have a unique 32-bit Router ID.`,
        recommendation: "Assign a unique Router ID (e.g. 1.1.1.1, 2.2.2.2) to each router.",
        affectedNodeIds: nodeIds,
      });
    }
  });

  // 2. Check Link-level properties between adjacent interfaces
  links.forEach((link) => {
    if (!link.enabled || link.status === "down") return;

    const routerA = routers.find((r) => r.nodeId === link.sourceRouterId);
    const routerB = routers.find((r) => r.nodeId === link.targetRouterId);
    if (!routerA || !routerB) return;

    const ifaceA = routerA.interfaces.find((i) => i.id === link.sourceInterfaceId);
    const ifaceB = routerB.interfaces.find((i) => i.id === link.targetInterfaceId);
    if (!ifaceA || !ifaceB) return;

    // Area mismatch
    if (ifaceA.areaId !== ifaceB.areaId) {
      errors.push({
        id: `err-area-mismatch-${link.id}`,
        field: "areaId",
        severity: "error",
        title: "OSPF Area Mismatch",
        message: `Link ${link.id} connects ${routerA.name} in Area ${ifaceA.areaId} with ${routerB.name} in Area ${ifaceB.areaId}.`,
        recommendation: "Configure both interface endpoints in the same OSPF Area (e.g. Area 0).",
        affectedNodeIds: [routerA.nodeId, routerB.nodeId],
      });
    }

    // Hello Timer Mismatch
    if (ifaceA.helloInterval !== ifaceB.helloInterval) {
      errors.push({
        id: `err-hello-mismatch-${link.id}`,
        field: "helloInterval",
        severity: "error",
        title: "Hello Timer Mismatch",
        message: `${routerA.name} uses Hello interval ${ifaceA.helloInterval}s while ${routerB.name} uses ${ifaceB.helloInterval}s.`,
        recommendation: "Set identical Hello timers on both sides of the link.",
        affectedNodeIds: [routerA.nodeId, routerB.nodeId],
      });
    }

    // Dead Timer Mismatch
    if (ifaceA.deadInterval !== ifaceB.deadInterval) {
      errors.push({
        id: `err-dead-mismatch-${link.id}`,
        field: "deadInterval",
        severity: "error",
        title: "Dead Timer Mismatch",
        message: `${routerA.name} uses Dead interval ${ifaceA.deadInterval}s while ${routerB.name} uses ${ifaceB.deadInterval}s.`,
        recommendation: "Ensure Dead timer is typically 4x Hello interval and identical on both sides.",
        affectedNodeIds: [routerA.nodeId, routerB.nodeId],
      });
    }

    // Passive interface on peering link
    if (ifaceA.passive || ifaceB.passive) {
      errors.push({
        id: `warn-passive-${link.id}`,
        field: "passive",
        severity: "warning",
        title: "Passive Interface on Inter-Router Link",
        message: `Interface is marked passive. Passive interfaces do not send Hello packets, preventing adjacency formation.`,
        recommendation: "Only mark edge/access LAN interfaces connected to end hosts as passive.",
        affectedNodeIds: [routerA.nodeId, routerB.nodeId],
      });
    }
  });

  return errors;
}

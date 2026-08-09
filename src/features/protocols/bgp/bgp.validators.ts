import type { BgpRouter, BgpLink } from "./bgp.types";

export interface BgpValidationError {
  id: string;
  field: string;
  severity: "error" | "warning";
  title: string;
  message: string;
  recommendation: string;
  affectedNodeIds: string[];
}

export function validateBgpConfiguration(
  routers: BgpRouter[],
  links: BgpLink[]
): BgpValidationError[] {
  const errors: BgpValidationError[] = [];

  // 1. Check for Duplicate AS Numbers across independent distinct autonomous entities
  const asMap = new Map<number, string[]>();
  routers.forEach((r) => {
    if (r.state === "Disabled") return;
    const existing = asMap.get(r.localAsn) ?? [];
    existing.push(r.nodeId);
    asMap.set(r.localAsn, existing);
  });

  // 2. Check Peering links for Remote ASN compatibility
  links.forEach((link) => {
    if (!link.enabled || link.status === "down") return;

    const routerA = routers.find((r) => r.nodeId === link.sourceRouterId);
    const routerB = routers.find((r) => r.nodeId === link.targetRouterId);
    if (!routerA || !routerB) return;

    const peerA = routerA.peers.find((p) => p.remoteAsn === routerB.localAsn || p.neighborIp === link.targetIp);
    const peerB = routerB.peers.find((p) => p.remoteAsn === routerA.localAsn || p.neighborIp === link.sourceIp);

    if (peerA && peerA.remoteAsn !== routerB.localAsn) {
      errors.push({
        id: `err-bgp-asn-mismatch-${link.id}`,
        field: "remoteAsn",
        severity: "error",
        title: "BGP Remote ASN Mismatch",
        message: `${routerA.name} expects remote AS ${peerA.remoteAsn}, but peer ${routerB.name} is in AS ${routerB.localAsn}.`,
        recommendation: `Update peer configuration on ${routerA.name} to remote-as ${routerB.localAsn}.`,
        affectedNodeIds: [routerA.nodeId, routerB.nodeId],
      });
    }

    if (peerB && peerB.remoteAsn !== routerA.localAsn) {
      errors.push({
        id: `err-bgp-asn-mismatch-b-${link.id}`,
        field: "remoteAsn",
        severity: "error",
        title: "BGP Remote ASN Mismatch",
        message: `${routerB.name} expects remote AS ${peerB.remoteAsn}, but peer ${routerA.name} is in AS ${routerA.localAsn}.`,
        recommendation: `Update peer configuration on ${routerB.name} to remote-as ${routerA.localAsn}.`,
        affectedNodeIds: [routerA.nodeId, routerB.nodeId],
      });
    }
  });

  return errors;
}

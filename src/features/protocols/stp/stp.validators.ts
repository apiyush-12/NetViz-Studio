import type { StpSwitchNode, StpLink } from "./stp.types";

export interface StpValidationError {
  code: string;
  message: string;
  severity: "error" | "warning";
  nodeId?: string;
  linkId?: string;
}

export function validateStpConfiguration(
  switches: StpSwitchNode[],
  links: StpLink[]
): StpValidationError[] {
  const errors: StpValidationError[] = [];

  // 1. Check for valid bridge priority (multiples of 4096)
  for (const sw of switches) {
    if (sw.bridgeId.priority % 4096 !== 0) {
      errors.push({
        code: "INVALID_PRIORITY_INCREMENT",
        message: `Switch ${sw.label} priority (${sw.bridgeId.priority}) is not a multiple of 4096 (IEEE 802.1t requirement).`,
        severity: "error",
        nodeId: sw.id,
      });
    }

    if (sw.bridgeId.priority < 0 || sw.bridgeId.priority > 61440) {
      errors.push({
        code: "PRIORITY_OUT_OF_RANGE",
        message: `Switch ${sw.label} priority must be between 0 and 61440.`,
        severity: "error",
        nodeId: sw.id,
      });
    }
  }

  // 2. Check for duplicate MAC addresses
  const seenMacs = new Set<string>();
  for (const sw of switches) {
    if (seenMacs.has(sw.bridgeId.macAddress)) {
      errors.push({
        code: "DUPLICATE_MAC_ADDRESS",
        message: `Duplicate MAC address detected on ${sw.label}: ${sw.bridgeId.macAddress}.`,
        severity: "error",
        nodeId: sw.id,
      });
    }
    seenMacs.add(sw.bridgeId.macAddress);
  }

  // 3. Check for isolated switches (switches with no enabled links)
  for (const sw of switches) {
    const connectedLinks = links.filter(
      (l) => l.enabled && (l.sourceSwitchId === sw.id || l.targetSwitchId === sw.id)
    );
    if (connectedLinks.length === 0) {
      errors.push({
        code: "ISOLATED_SWITCH",
        message: `Switch ${sw.label} has no active connections in this topology.`,
        severity: "warning",
        nodeId: sw.id,
      });
    }
  }

  // 4. Check for invalid link cost
  for (const link of links) {
    if (link.cost < 1) {
      errors.push({
        code: "INVALID_LINK_COST",
        message: `Link ${link.id} has invalid cost ${link.cost}. Must be >= 1.`,
        severity: "error",
        linkId: link.id,
      });
    }
  }

  return errors;
}

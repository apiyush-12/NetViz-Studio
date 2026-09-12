import type { ArpNode, ArpLink, ArpConfig } from "./arp.types";

export interface ArpValidationError {
  code: string;
  message: string;
  severity: "error" | "warning";
  nodeId?: string;
  linkId?: string;
}

export function validateArpConfiguration(
  nodes: ArpNode[],
  links: ArpLink[],
  config?: ArpConfig
): ArpValidationError[] {
  const errors: ArpValidationError[] = [];

  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

  if (config && config.targetIp && !ipv4Regex.test(config.targetIp)) {
    errors.push({
      code: "INVALID_TARGET_IP",
      message: `Configured Target IP address is invalid: ${config.targetIp}`,
      severity: "error",
    });
  }

  // 1. Check IP and MAC formats
  for (const node of nodes) {
    if (node.type !== "switch") {
      if (!ipv4Regex.test(node.ipAddress)) {
        errors.push({
          code: "INVALID_IP_FORMAT",
          message: `Node ${node.label} has invalid IPv4 address: ${node.ipAddress}`,
          severity: "error",
          nodeId: node.id,
        });
      }
    }

    if (!macRegex.test(node.macAddress)) {
      errors.push({
        code: "INVALID_MAC_FORMAT",
        message: `Node ${node.label} has invalid MAC address: ${node.macAddress}`,
        severity: "error",
        nodeId: node.id,
      });
    }
  }

  // 2. Check for duplicate IP addresses on same subnet (unless intentional VRRP)
  const ipMap = new Map<string, string>();
  for (const node of nodes) {
    if (node.type === "host" || node.type === "server") {
      if (ipMap.has(node.ipAddress)) {
        errors.push({
          code: "DUPLICATE_IP_DETECTED",
          message: `Duplicate IP address ${node.ipAddress} detected between ${ipMap.get(node.ipAddress)} and ${node.label}`,
          severity: "warning",
          nodeId: node.id,
        });
      } else {
        ipMap.set(node.ipAddress, node.label);
      }
    }
  }

  // 3. Check for isolated nodes
  for (const node of nodes) {
    const connected = links.filter(
      (l) => l.enabled && (l.sourceNodeId === node.id || l.targetNodeId === node.id)
    );
    if (connected.length === 0) {
      errors.push({
        code: "ISOLATED_NODE",
        message: `Node ${node.label} has no active physical links.`,
        severity: "warning",
        nodeId: node.id,
      });
    }
  }

  return errors;
}

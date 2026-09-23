import type { VlanNode, VlanLink, VlanConfig } from "./vlan.types";

export interface VlanValidationError {
  code: string;
  message: string;
  severity: "error" | "warning";
  nodeId?: string;
  linkId?: string;
}

export function validateVlanConfiguration(
  nodes: VlanNode[],
  links: VlanLink[],
  config?: VlanConfig
): VlanValidationError[] {
  const errors: VlanValidationError[] = [];

  // 1. Check VLAN ID ranges (1 to 4094)
  for (const node of nodes) {
    if (node.type === "host" || node.type === "server") {
      if (node.vlanId < 1 || node.vlanId > 4094) {
        errors.push({
          code: "INVALID_VLAN_ID",
          message: `Node ${node.label} has invalid VLAN ID ${node.vlanId}. Valid range is 1-4094.`,
          severity: "error",
          nodeId: node.id,
        });
      }
    }

    if (node.ports) {
      for (const port of node.ports) {
        if (port.pvid < 1 || port.pvid > 4094) {
          errors.push({
            code: "INVALID_PORT_PVID",
            message: `Port ${port.name} on ${node.label} has invalid PVID ${port.pvid}.`,
            severity: "error",
            nodeId: node.id,
          });
        }
      }
    }
  }

  // 2. Check for Native VLAN mismatches on trunk links
  for (const link of links) {
    if (link.linkType === "trunk" && link.enabled) {
      const nodeA = nodes.find((n) => n.id === link.sourceNodeId);
      const nodeB = nodes.find((n) => n.id === link.targetNodeId);
      const portA = nodeA?.ports?.find((p) => p.name === link.sourcePortName);
      const portB = nodeB?.ports?.find((p) => p.name === link.targetPortName);

      if (portA && portB && portA.nativeVlanId !== portB.nativeVlanId) {
        errors.push({
          code: "NATIVE_VLAN_MISMATCH",
          message: `Native VLAN Mismatch on trunk link between ${nodeA?.label} (${portA.name}: VLAN ${portA.nativeVlanId}) and ${nodeB?.label} (${portB.name}: VLAN ${portB.nativeVlanId}). Untagged traffic will leak between VLANs!`,
          severity: "error",
          linkId: link.id,
        });
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
        message: `Node ${node.label} has no active physical links connected.`,
        severity: "warning",
        nodeId: node.id,
      });
    }
  }

  // 4. Check target/source node validity in config
  if (config) {
    const src = nodes.find((n) => n.id === config.sourceNodeId);
    const tgt = nodes.find((n) => n.id === config.targetNodeId);
    if (!src) {
      errors.push({
        code: "INVALID_SOURCE_NODE",
        message: `Configured source node ${config.sourceNodeId} not found in topology.`,
        severity: "error",
      });
    }
    if (!tgt) {
      errors.push({
        code: "INVALID_TARGET_NODE",
        message: `Configured target node ${config.targetNodeId} not found in topology.`,
        severity: "error",
      });
    }
  }

  return errors;
}

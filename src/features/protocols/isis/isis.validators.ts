import type { IsisConfig, IsisNode, IsisLink } from "./isis.types";

export interface ValidationIssue {
  type: "error" | "warning";
  message: string;
  nodeId?: string;
  linkId?: string;
}

/**
 * Validate IS-IS Topology and Configuration rules
 */
export function validateIsisTopologyAndConfig(
  config: IsisConfig,
  nodes: IsisNode[],
  links: IsisLink[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!nodes || nodes.length === 0) {
    issues.push({
      type: "error",
      message: "Topology contains no routers. At least 2 IS-IS routers are required.",
    });
    return issues;
  }

  // Check for node duplicates and NET address format
  const nodeIds = new Set<string>();
  const systemIds = new Set<string>();

  for (const node of nodes) {
    if (nodeIds.has(node.id)) {
      issues.push({
        type: "error",
        message: `Duplicate router ID detected: ${node.id}`,
        nodeId: node.id,
      });
    }
    nodeIds.add(node.id);

    if (systemIds.has(node.systemId)) {
      issues.push({
        type: "error",
        message: `Duplicate System ID detected: ${node.systemId} on router ${node.name}`,
        nodeId: node.id,
      });
    }
    systemIds.add(node.systemId);

    // Validate NET address format (e.g. 49.0001.0000.0000.0001.00)
    if (!node.netAddress || !node.netAddress.endsWith(".00")) {
      issues.push({
        type: "warning",
        message: `Router ${node.name} NET address ${node.netAddress} should terminate with N-Selector '00'.`,
        nodeId: node.id,
      });
    }
  }

  // Check link validity and Level consistency
  for (const link of links) {
    if (!nodeIds.has(link.sourceNodeId)) {
      issues.push({
        type: "error",
        message: `Link ${link.id} references non-existent source router: ${link.sourceNodeId}`,
        linkId: link.id,
      });
    }
    if (!nodeIds.has(link.targetNodeId)) {
      issues.push({
        type: "error",
        message: `Link ${link.id} references non-existent target router: ${link.targetNodeId}`,
        linkId: link.id,
      });
    }
  }

  return issues;
}

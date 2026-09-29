import type { RipConfig, RipNode, RipLink } from "./rip.types";

export interface ValidationIssue {
  type: "error" | "warning";
  message: string;
  nodeId?: string;
  linkId?: string;
}

/**
 * Validate RIP Configuration and Topology rules
 */
export function validateRipTopologyAndConfig(
  config: RipConfig,
  nodes: RipNode[],
  links: RipLink[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!nodes || nodes.length === 0) {
    issues.push({
      type: "error",
      message: "Topology contains no routers. At least 2 RIP routers are required.",
    });
    return issues;
  }

  // Check for node duplicates
  const nodeIds = new Set<string>();
  for (const node of nodes) {
    if (nodeIds.has(node.id)) {
      issues.push({
        type: "error",
        message: `Duplicate router ID detected: ${node.id}`,
        nodeId: node.id,
      });
    }
    nodeIds.add(node.id);

    // Check interface IP addresses
    if (!node.interfaces || node.interfaces.length === 0) {
      issues.push({
        type: "warning",
        message: `Router ${node.name} has no configured interfaces.`,
        nodeId: node.id,
      });
    }
  }

  // Check for broken link references
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

  // Warn if Count-to-Infinity scenario is selected with Split Horizon enabled
  if (config.scenarioId === "count_to_infinity_loop" && config.splitHorizon) {
    issues.push({
      type: "warning",
      message:
        "Count-to-Infinity demonstration requires Split Horizon to be DISABLED to trigger the routing loop.",
    });
  }

  // Warn if RIPv1 is used with VLSM subnets
  if (config.version === "ripv1" && config.scenarioId === "ripv2_vlsm_cidr_tagging") {
    issues.push({
      type: "warning",
      message:
        "RIPv1 (RFC 1058) is classful and does not carry subnet masks in route table entries.",
    });
  }

  return issues;
}

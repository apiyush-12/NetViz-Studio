import { NetworkTopology, NetworkNode, NetworkLink } from "@/features/topology/topology-types";
import { findLongestPrefixMatch } from "@/features/forwarding/longest-prefix-match";

export interface PathHop {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  ingressInterfaceName?: string;
  egressInterfaceName?: string;
  linkId?: string;
  actionSummary: string;
}

export interface CalculatedPath {
  success: boolean;
  hops: PathHop[];
  totalLatencyMs: number;
  totalCost: number;
  failureReason?: string;
}

export function calculateNetworkPath(
  topology: NetworkTopology,
  sourceNodeId: string,
  destinationNodeId: string
): CalculatedPath {
  const srcNode = topology.nodes.find((n) => n.id === sourceNodeId);
  const dstNode = topology.nodes.find((n) => n.id === destinationNodeId);

  if (!srcNode || !dstNode) {
    return {
      success: false,
      hops: [],
      totalLatencyMs: 0,
      totalCost: 0,
      failureReason: "Source or destination node not found in topology.",
    };
  }

  const srcIface = srcNode.interfaces.find((i) => i.ipv4?.address) || srcNode.interfaces[0];
  const dstIface = dstNode.interfaces.find((i) => i.ipv4?.address) || dstNode.interfaces[0];

  const destIp = dstIface?.ipv4?.address;

  const hops: PathHop[] = [];
  let totalLatency = 0;
  let totalCost = 0;

  let currentNode: NetworkNode = srcNode;
  const visitedNodeIds = new Set<string>();

  hops.push({
    nodeId: srcNode.id,
    nodeName: srcNode.name,
    nodeType: srcNode.type,
    egressInterfaceName: srcIface?.name,
    actionSummary: `Source host ${srcNode.name} initiated packet transmission to ${dstNode.name} (${destIp || "IP unknown"}).`,
  });

  visitedNodeIds.add(srcNode.id);

  let currentHopCount = 0;
  const MAX_HOPS = 30;

  while (currentNode.id !== destinationNodeId && currentHopCount < MAX_HOPS) {
    currentHopCount++;

    let nextLink: NetworkLink | undefined;
    let nextHopNodeId: string | undefined;
    let egressInterfaceName: string | undefined;

    // Check if currentNode is a Router / L3 Device
    if (currentNode.type === "router" || currentNode.type === "l3-switch" || currentNode.type === "firewall") {
      if (!destIp) {
        return {
          success: false,
          hops,
          totalLatencyMs: totalLatency,
          totalCost,
          failureReason: `Destination device ${dstNode.name} has no IPv4 address configured.`,
        };
      }

      // Check firewall rules if firewall
      if (currentNode.protocolConfiguration.firewall?.enabled) {
        const rules = currentNode.protocolConfiguration.firewall.rules;
        const denyRule = rules.find((r) => r.action === "deny" || r.action === "reject");
        if (denyRule && denyRule.destinationNetwork === "any") {
          return {
            success: false,
            hops,
            totalLatencyMs: totalLatency,
            totalCost,
            failureReason: `Firewall ${currentNode.name} blocked traffic matching rule #${denyRule.order} (${denyRule.action.toUpperCase()}).`,
          };
        }
      }

      // Longest Prefix Match
      const lpmResult = findLongestPrefixMatch(destIp, currentNode.routingTable || []);
      if (!lpmResult.selectedRoute) {
        return {
          success: false,
          hops,
          totalLatencyMs: totalLatency,
          totalCost,
          failureReason: `Router ${currentNode.name} has no route to destination IP ${destIp}. Packet dropped.`,
        };
      }

      const route = lpmResult.selectedRoute;
      egressInterfaceName = route.exitInterfaceName;

      const egressIface = currentNode.interfaces.find((i) => i.name === egressInterfaceName);
      nextLink = topology.links.find(
        (l) =>
          (l.sourceNodeId === currentNode.id && l.sourceInterfaceId === egressIface?.id) ||
          (l.targetNodeId === currentNode.id && l.targetInterfaceId === egressIface?.id)
      );

      if (!nextLink || nextLink.administrativeState === "down" || nextLink.operationalState === "down") {
        return {
          success: false,
          hops,
          totalLatencyMs: totalLatency,
          totalCost,
          failureReason: `Router ${currentNode.name} route points to exit interface ${egressInterfaceName}, but attached link is down or missing.`,
        };
      }

      nextHopNodeId = nextLink.sourceNodeId === currentNode.id ? nextLink.targetNodeId : nextLink.sourceNodeId;
    } else {
      // Host or Switch - find link pointing towards next unvisited step
      const activeLinks = topology.links.filter(
        (l) =>
          (l.sourceNodeId === currentNode.id || l.targetNodeId === currentNode.id) &&
          l.administrativeState === "up" &&
          l.operationalState === "up"
      );

      if (activeLinks.length === 0) {
        return {
          success: false,
          hops,
          totalLatencyMs: totalLatency,
          totalCost,
          failureReason: `Device ${currentNode.name} has no active connected links.`,
        };
      }

      // Direct link to destination if available
      const directLink = activeLinks.find(
        (l) => l.sourceNodeId === destinationNodeId || l.targetNodeId === destinationNodeId
      );

      if (directLink) {
        nextLink = directLink;
        nextHopNodeId = destinationNodeId;
      } else {
        // Take link to unvisited neighbor
        const unvisitedLink = activeLinks.find((l) => {
          const nId = l.sourceNodeId === currentNode.id ? l.targetNodeId : l.sourceNodeId;
          return !visitedNodeIds.has(nId);
        });

        if (!unvisitedLink) {
          return {
            success: false,
            hops,
            totalLatencyMs: totalLatency,
            totalCost,
            failureReason: `Dead end reached at ${currentNode.name}.`,
          };
        }

        nextLink = unvisitedLink;
        nextHopNodeId = nextLink.sourceNodeId === currentNode.id ? nextLink.targetNodeId : nextLink.sourceNodeId;
      }
    }

    if (!nextLink || !nextHopNodeId) {
      return {
        success: false,
        hops,
        totalLatencyMs: totalLatency,
        totalCost,
        failureReason: `No valid forwarding link found at ${currentNode.name}.`,
      };
    }

    if (visitedNodeIds.has(nextHopNodeId)) {
      return {
        success: false,
        hops,
        totalLatencyMs: totalLatency,
        totalCost,
        failureReason: `Routing loop detected! Packet returned to already visited node ${nextHopNodeId}.`,
      };
    }

    const nextNode = topology.nodes.find((n) => n.id === nextHopNodeId);
    if (!nextNode) {
      return {
        success: false,
        hops,
        totalLatencyMs: totalLatency,
        totalCost,
        failureReason: `Next hop node ${nextHopNodeId} does not exist in topology.`,
      };
    }

    totalLatency += nextLink.latencyMs || 1;
    totalCost += nextLink.cost || 1;

    visitedNodeIds.add(nextNode.id);

    hops.push({
      nodeId: nextNode.id,
      nodeName: nextNode.name,
      nodeType: nextNode.type,
      linkId: nextLink.id,
      actionSummary: `Packet traversed link ${nextLink.id} (${nextLink.bandwidthMbps} Mbps, ${nextLink.latencyMs} ms) to ${nextNode.name}.`,
    });

    currentNode = nextNode;
  }

  return {
    success: currentNode.id === destinationNodeId,
    hops,
    totalLatencyMs: totalLatency,
    totalCost,
  };
}

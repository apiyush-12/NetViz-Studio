import { NetworkTopology, NetworkNode, NetworkLink, NetworkInterface } from "@/features/topology/topology-types";

export function getConnectedLinksForNode(topology: NetworkTopology, nodeId: string): NetworkLink[] {
  return topology.links.filter((l) => l.sourceNodeId === nodeId || l.targetNodeId === nodeId);
}

export function getInterfaceForLink(
  node: NetworkNode,
  link: NetworkLink
): NetworkInterface | undefined {
  return node.interfaces.find(
    (i) => i.id === link.sourceInterfaceId || i.id === link.targetInterfaceId
  );
}

export function getTopologyStats(topology: NetworkTopology) {
  const totalNodes = topology.nodes.length;
  const totalLinks = topology.links.length;
  const endDevices = topology.nodes.filter(
    (n) => n.type === "pc" || n.type === "laptop" || n.type === "mobile" || n.type === "host" || n.type === "printer"
  ).length;
  const routers = topology.nodes.filter((n) => n.type === "router" || n.type === "l3-switch").length;
  const switches = topology.nodes.filter((n) => n.type === "l2-switch").length;
  const servers = topology.nodes.filter((n) => n.type.includes("server")).length;

  return {
    totalNodes,
    totalLinks,
    endDevices,
    routers,
    switches,
    servers,
  };
}

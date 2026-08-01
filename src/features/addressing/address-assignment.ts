import { NetworkTopology, NetworkNode } from "@/features/topology/topology-types";

function ipToLong(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function longToIp(long: number): string {
  return [
    (long >>> 24) & 255,
    (long >>> 16) & 255,
    (long >>> 8) & 255,
    long & 255,
  ].join(".");
}

export interface SubnetAssignmentResult {
  updatedTopology: NetworkTopology;
  assignmentsSummary: Array<{
    segmentName: string;
    subnet: string;
    routerIp?: string;
    assignedHosts: Array<{ nodeName: string; ip: string }>;
  }>;
}

export function autoAssignIpAddresses(
  topology: NetworkTopology,
  baseNetwork: string = "192.168.1.0"
): SubnetAssignmentResult {
  const updatedTopology: NetworkTopology = JSON.parse(JSON.stringify(topology));
  const assignmentsSummary: SubnetAssignmentResult["assignmentsSummary"] = [];

  const baseLong = ipToLong(baseNetwork);
  let currentOffset = 0;

  const visitedNodes = new Set<string>();
  let segmentIndex = 1;

  updatedTopology.nodes.forEach((node) => {
    if (visitedNodes.has(node.id)) return;
    if (node.type === "l2-switch" || node.type === "access-point") return;

    const segmentNodes: NetworkNode[] = [];
    const queue = [node.id];
    const segmentVisited = new Set<string>();

    while (queue.length > 0) {
      const currId = queue.shift()!;
      if (segmentVisited.has(currId)) continue;
      segmentVisited.add(currId);

      const currNode = updatedTopology.nodes.find((n) => n.id === currId);
      if (!currNode) continue;

      if (currNode.type !== "l2-switch" && currNode.type !== "access-point") {
        segmentNodes.push(currNode);
      }

      const links = updatedTopology.links.filter((l) => l.sourceNodeId === currId || l.targetNodeId === currId);
      links.forEach((l) => {
        const neighborId = l.sourceNodeId === currId ? l.targetNodeId : l.sourceNodeId;
        const neighborNode = updatedTopology.nodes.find((n) => n.id === neighborId);
        if (neighborNode && neighborNode.type !== "router" && neighborNode.type !== "l3-switch" && neighborNode.type !== "firewall") {
          queue.push(neighborId);
        } else if (neighborNode && currNode.type !== "router" && currNode.type !== "l3-switch") {
          segmentNodes.push(neighborNode);
        }
      });
    }

    if (segmentNodes.length === 0) return;

    const hostBits = Math.ceil(Math.log2(segmentNodes.length + 3));
    const prefixLength = Math.min(30, 32 - Math.max(2, hostBits));
    const subnetSize = Math.pow(2, 32 - prefixLength);

    const segmentBaseLong = baseLong + currentOffset;
    currentOffset += subnetSize;

    const gatewayIp = longToIp(segmentBaseLong + 1);
    const assignedHosts: Array<{ nodeName: string; ip: string }> = [];
    let hostOffset = 2;

    const segmentName = `Subnet ${segmentIndex++} (${longToIp(segmentBaseLong)}/${prefixLength})`;

    segmentNodes.forEach((segNode) => {
      visitedNodes.add(segNode.id);

      if (segNode.type === "router" || segNode.type === "l3-switch" || segNode.type === "firewall") {
        const connLink = updatedTopology.links.find(
          (l) => l.sourceNodeId === segNode.id || l.targetNodeId === segNode.id
        );
        if (connLink) {
          const ifaceId = connLink.sourceNodeId === segNode.id ? connLink.sourceInterfaceId : connLink.targetInterfaceId;
          const iface = segNode.interfaces.find((i) => i.id === ifaceId);
          if (iface) {
            iface.ipv4 = { address: gatewayIp, prefixLength };
          }
        }
      } else {
        const hostIp = longToIp(segmentBaseLong + hostOffset++);
        const primaryIface = segNode.interfaces[0];
        if (primaryIface) {
          primaryIface.ipv4 = { address: hostIp, prefixLength };
          segNode.configuration.defaultGateway = gatewayIp;
          segNode.configuration.addressMode = "static";
          assignedHosts.push({ nodeName: segNode.name, ip: hostIp });
        }
      }
    });

    assignmentsSummary.push({
      segmentName,
      subnet: `${longToIp(segmentBaseLong)}/${prefixLength}`,
      routerIp: gatewayIp,
      assignedHosts,
    });
  });

  return { updatedTopology, assignmentsSummary };
}

export function suggestNextAvailableIp(
  topology: NetworkTopology,
  subnetIp: string = "192.168.1.0",
  prefixLength: number = 24
): string {
  const baseLong = ipToLong(subnetIp);
  const mask = ((0xffffffff << (32 - prefixLength)) >>> 0);
  const subnetBase = baseLong & mask;
  const broadcast = subnetBase | (~mask >>> 0);

  const usedIps = new Set<string>();
  topology.nodes.forEach((node) => {
    node.interfaces.forEach((iface) => {
      if (iface.ipv4?.address) usedIps.add(iface.ipv4.address);
    });
  });

  for (let candidate = subnetBase + 1; candidate < broadcast; candidate++) {
    const ipStr = longToIp(candidate);
    if (!usedIps.has(ipStr)) {
      return ipStr;
    }
  }

  return "192.168.1.254";
}

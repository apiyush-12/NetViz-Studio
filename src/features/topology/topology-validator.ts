import {
  NetworkTopology,
  TopologyValidationIssue,
} from "@/features/topology/topology-types";

function isValidIpv4(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    const num = Number(part);
    return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString();
  });
}

function ipToLong(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function isSameSubnet(ip1: string, ip2: string, prefixLength: number): boolean {
  if (!isValidIpv4(ip1) || !isValidIpv4(ip2)) return false;
  const mask = ((0xffffffff << (32 - prefixLength)) >>> 0);
  return (ipToLong(ip1) & mask) === (ipToLong(ip2) & mask);
}

export function validateTopology(topology: NetworkTopology): TopologyValidationIssue[] {
  const issues: TopologyValidationIssue[] = [];

  const ipMap = new Map<string, { nodeId: string; nodeName: string; interfaceName: string }>();
  const macMap = new Map<string, { nodeId: string; nodeName: string; interfaceName: string }>();
  const routerIds = new Map<string, string>();

  topology.nodes.forEach((node) => {
    if (node.type === "pc" || node.type === "laptop" || node.type === "host" || node.type === "server") {
      const primaryIface = node.interfaces.find((i) => i.ipv4?.address);
      if (!primaryIface && node.configuration.addressMode === "static") {
        issues.push({
          id: `no-ip-${node.id}`,
          severity: "warning",
          category: "addressing",
          nodeId: node.id,
          title: `Missing IP Address on ${node.name}`,
          description: `Device is in static address mode but has no IPv4 address assigned to any interface.`,
          suggestedFix: `Assign an IP address in the Inspector tab or enable DHCP.`,
          canAutoFix: true,
        });
      }

      if (node.configuration.defaultGateway && primaryIface?.ipv4) {
        const gw = node.configuration.defaultGateway;
        const ip = primaryIface.ipv4.address;
        const prefix = primaryIface.ipv4.prefixLength;

        if (!isValidIpv4(gw)) {
          issues.push({
            id: `invalid-gw-${node.id}`,
            severity: "error",
            category: "addressing",
            nodeId: node.id,
            title: `Invalid Default Gateway on ${node.name}`,
            description: `Default Gateway '${gw}' is not a valid IPv4 address.`,
            suggestedFix: `Correct the IPv4 address format for default gateway.`,
            canAutoFix: false,
          });
        } else if (!isSameSubnet(ip, gw, prefix)) {
          issues.push({
            id: `gw-outside-subnet-${node.id}`,
            severity: "error",
            category: "addressing",
            nodeId: node.id,
            title: `Default Gateway Outside Subnet on ${node.name}`,
            description: `Gateway '${gw}' is outside the subnet of interface ${primaryIface.name} (${ip}/${prefix}).`,
            suggestedFix: `Set gateway address to match local router interface in same subnet.`,
            canAutoFix: true,
          });
        }
      }
    }

    node.interfaces.forEach((iface) => {
      if (iface.macAddress) {
        if (macMap.has(iface.macAddress)) {
          const prev = macMap.get(iface.macAddress)!;
          issues.push({
            id: `dup-mac-${iface.id}`,
            severity: "critical",
            category: "interfaces-links",
            nodeId: node.id,
            interfaceId: iface.id,
            title: `Duplicate MAC Address`,
            description: `Interface ${iface.name} on ${node.name} shares MAC ${iface.macAddress} with ${prev.nodeName} (${prev.interfaceName}).`,
            suggestedFix: `Regenerate unique MAC address for interface.`,
            canAutoFix: true,
          });
        } else {
          macMap.set(iface.macAddress, { nodeId: node.id, nodeName: node.name, interfaceName: iface.name });
        }
      }

      if (iface.ipv4?.address) {
        const ip = iface.ipv4.address;
        const prefix = iface.ipv4.prefixLength;

        if (!isValidIpv4(ip)) {
          issues.push({
            id: `invalid-ip-${iface.id}`,
            severity: "error",
            category: "addressing",
            nodeId: node.id,
            interfaceId: iface.id,
            title: `Invalid IPv4 Address`,
            description: `Interface ${iface.name} has invalid IPv4 address '${ip}'.`,
            suggestedFix: `Enter a valid IPv4 address (e.g. 192.168.1.10).`,
            canAutoFix: false,
          });
        } else if (prefix < 8 || prefix > 30) {
          issues.push({
            id: `invalid-prefix-${iface.id}`,
            severity: "error",
            category: "addressing",
            nodeId: node.id,
            interfaceId: iface.id,
            title: `Invalid Prefix Length`,
            description: `Prefix length /${prefix} on ${iface.name} is out of standard range (8 to 30).`,
            suggestedFix: `Set prefix length between /8 and /30 (e.g. /24).`,
            canAutoFix: true,
          });
        }

        if (ipMap.has(ip)) {
          const prev = ipMap.get(ip)!;
          issues.push({
            id: `dup-ip-${iface.id}`,
            severity: "critical",
            category: "addressing",
            nodeId: node.id,
            interfaceId: iface.id,
            title: `Duplicate IP Address (${ip})`,
            description: `IP ${ip} on ${node.name} (${iface.name}) conflicts with ${prev.nodeName} (${prev.interfaceName}).`,
            suggestedFix: `Assign a non-conflicting IP address.`,
            canAutoFix: true,
          });
        } else {
          ipMap.set(ip, { nodeId: node.id, nodeName: node.name, interfaceName: iface.name });
        }
      }
    });

    if (node.protocolConfiguration.ospf?.enabled) {
      const rid = node.protocolConfiguration.ospf.routerId;
      if (routerIds.has(rid)) {
        const conflictNodeId = routerIds.get(rid)!;
        const conflictNode = topology.nodes.find((n) => n.id === conflictNodeId);
        issues.push({
          id: `ospf-dup-rid-${node.id}`,
          severity: "error",
          category: "routing",
          nodeId: node.id,
          title: `Duplicate OSPF Router ID`,
          description: `Router ${node.name} shares OSPF Router ID ${rid} with ${conflictNode?.name || conflictNodeId}.`,
          suggestedFix: `Set a unique Router ID (e.g. unique IPv4 formatted ID).`,
          canAutoFix: true,
        });
      } else {
        routerIds.set(rid, node.id);
      }
    }
  });

  topology.links.forEach((link) => {
    const srcNode = topology.nodes.find((n) => n.id === link.sourceNodeId);
    const dstNode = topology.nodes.find((n) => n.id === link.targetNodeId);
    const srcIface = srcNode?.interfaces.find((i) => i.id === link.sourceInterfaceId);
    const dstIface = dstNode?.interfaces.find((i) => i.id === link.targetInterfaceId);

    if (!srcNode || !dstNode || !srcIface || !dstIface) {
      issues.push({
        id: `broken-link-${link.id}`,
        severity: "critical",
        category: "interfaces-links",
        linkId: link.id,
        title: `Dangling Link`,
        description: `Link connects to non-existent node or interface.`,
        suggestedFix: `Remove dangling link or reconnect interfaces.`,
        canAutoFix: true,
      });
      return;
    }

    if (link.administrativeState === "down" || srcIface.administrativeState === "down" || dstIface.administrativeState === "down") {
      issues.push({
        id: `link-down-${link.id}`,
        severity: "warning",
        category: "interfaces-links",
        linkId: link.id,
        title: `Disabled Link or Interface`,
        description: `Link '${link.id}' or connected interfaces (${srcNode.name}:${srcIface.name} / ${dstNode.name}:${dstIface.name}) are administratively shut down.`,
        suggestedFix: `Enable link and interfaces in Inspector panel.`,
        canAutoFix: true,
      });
    }

    if (srcIface.mtu !== dstIface.mtu) {
      issues.push({
        id: `mtu-mismatch-${link.id}`,
        severity: "warning",
        category: "interfaces-links",
        linkId: link.id,
        title: `MTU Mismatch`,
        description: `${srcNode.name} (${srcIface.name}: MTU ${srcIface.mtu}) mismatched with ${dstNode.name} (${dstIface.name}: MTU ${dstIface.mtu}).`,
        suggestedFix: `Align MTU settings across link to 1500 bytes.`,
        canAutoFix: true,
      });
    }

    if (srcIface.ipv4?.address && dstIface.ipv4?.address) {
      const ip1 = srcIface.ipv4.address;
      const prefix1 = srcIface.ipv4.prefixLength;
      const ip2 = dstIface.ipv4.address;
      const prefix2 = dstIface.ipv4.prefixLength;

      if (prefix1 !== prefix2 || !isSameSubnet(ip1, ip2, prefix1)) {
        issues.push({
          id: `subnet-mismatch-${link.id}`,
          severity: "error",
          category: "addressing",
          linkId: link.id,
          title: `Subnet Mismatch Across Link`,
          description: `${srcNode.name} (${ip1}/${prefix1}) and ${dstNode.name} (${ip2}/${prefix2}) are on different subnets.`,
          suggestedFix: `Reconfigure IPs to belong to the same subnet segment.`,
          canAutoFix: true,
        });
      }
    }
  });

  topology.nodes.forEach((node) => {
    const connectedLinks = topology.links.filter(
      (l) => l.sourceNodeId === node.id || l.targetNodeId === node.id
    );

    if (connectedLinks.length === 0) {
      issues.push({
        id: `isolated-node-${node.id}`,
        severity: "information",
        category: "general",
        nodeId: node.id,
        title: `Isolated Device`,
        description: `Device ${node.name} has no connected links.`,
        suggestedFix: `Drag links from interface handles to connect device to network.`,
        canAutoFix: false,
      });
    }
  });

  return issues;
}

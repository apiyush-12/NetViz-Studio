import { NetworkTopology } from "@/features/topology/topology-types";

export interface DnsQueryResult {
  success: boolean;
  resolvedIp?: string;
  recordType?: string;
  explanation: string;
  events: Array<{
    step: number;
    summary: string;
    explanation: string;
    protocol: "DNS";
    sourceNodeId: string;
    destNodeId?: string;
  }>;
}

export function resolveDnsHostname(
  topology: NetworkTopology,
  clientNodeId: string,
  hostname: string
): DnsQueryResult {
  const clientNode = topology.nodes.find((n) => n.id === clientNodeId);

  // Locate DNS server
  const dnsServer = topology.nodes.find(
    (n) => n.type === "dns-server" || n.protocolConfiguration.dns?.enabled
  );

  if (!clientNode || !dnsServer || !dnsServer.protocolConfiguration.dns?.enabled) {
    return {
      success: false,
      explanation: `DNS resolution failed: No reachable DNS server node found in network topology.`,
      events: [
        {
          step: 1,
          summary: "DNS Query Failed",
          explanation: "No DNS server active in network.",
          protocol: "DNS",
          sourceNodeId: clientNodeId,
        },
      ],
    };
  }

  const records = dnsServer.protocolConfiguration.dns.records || [];
  const match = records.find((r) => r.hostname.toLowerCase() === hostname.toLowerCase());

  const dnsServerIp = dnsServer.interfaces[0]?.ipv4?.address || "8.8.8.8";

  if (!match) {
    return {
      success: false,
      explanation: `DNS Server ${dnsServer.name} (${dnsServerIp}) responded with NXDOMAIN for '${hostname}'. Record not found.`,
      events: [
        {
          step: 1,
          summary: `DNS Standard Query A ${hostname}`,
          explanation: `Client ${clientNode.name} sent UDP DNS Query to server ${dnsServer.name} (${dnsServerIp}).`,
          protocol: "DNS",
          sourceNodeId: clientNode.id,
          destNodeId: dnsServer.id,
        },
        {
          step: 2,
          summary: "DNS Standard Response: NXDOMAIN",
          explanation: `Server ${dnsServer.name} replied that hostname '${hostname}' does not exist in domain records.`,
          protocol: "DNS",
          sourceNodeId: dnsServer.id,
          destNodeId: clientNode.id,
        },
      ],
    };
  }

  return {
    success: true,
    resolvedIp: match.value,
    recordType: match.type,
    explanation: `DNS Server ${dnsServer.name} resolved '${hostname}' → ${match.type} ${match.value} (TTL=${match.ttl}s).`,
    events: [
      {
        step: 1,
        summary: `DNS Standard Query A ${hostname}`,
        explanation: `Client ${clientNode.name} sent UDP port 53 DNS Query for '${hostname}' to server ${dnsServer.name}.`,
        protocol: "DNS",
        sourceNodeId: clientNode.id,
        destNodeId: dnsServer.id,
      },
      {
        step: 2,
        summary: `DNS Response: ${match.type} ${match.value}`,
        explanation: `Server ${dnsServer.name} returned A record matching '${hostname}' to IP ${match.value}. Client cached response.`,
        protocol: "DNS",
        sourceNodeId: dnsServer.id,
        destNodeId: clientNode.id,
      },
    ],
  };
}

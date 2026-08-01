import {
  NetworkPacket,
  NetworkTopology,
  SimulationScenario,
} from "@/features/topology/topology-types";

let packetIdCounter = 1;

export function buildPacket(
  topology: NetworkTopology,
  scenario: SimulationScenario
): NetworkPacket {
  const srcNode = topology.nodes.find((n) => n.id === scenario.sourceNodeId);
  const dstNode = topology.nodes.find((n) => n.id === scenario.destinationNodeId);

  const srcIface = srcNode?.interfaces.find((i) => i.ipv4?.address) || srcNode?.interfaces[0];
  const dstIface = dstNode?.interfaces.find((i) => i.ipv4?.address) || dstNode?.interfaces[0];

  const sourceIp = srcIface?.ipv4?.address || "192.168.1.10";
  const destinationIp = dstIface?.ipv4?.address || "192.168.1.20";
  const sourceMac = srcIface?.macAddress || "02:00:00:00:00:01";
  const destinationMac = dstIface?.macAddress || "ff:ff:ff:ff:ff:ff";

  const num = packetIdCounter++;

  let payloadSummary = `${scenario.trafficType.toUpperCase()} test payload`;
  if (scenario.trafficType === "ping") {
    payloadSummary = `ICMP Echo Request (seq=${num})`;
  } else if (scenario.trafficType === "traceroute") {
    payloadSummary = `Traceroute UDP probe (TTL=${scenario.ttl || 1})`;
  } else if (scenario.trafficType === "tcp") {
    payloadSummary = `TCP [SYN] Seq=0 Win=64240 Len=0 MSS=1460`;
  } else if (scenario.trafficType === "udp") {
    payloadSummary = `UDP Datagram Len=${scenario.payloadSize || 64}`;
  } else if (scenario.trafficType === "dns") {
    payloadSummary = `DNS Standard Query A example.com`;
  } else if (scenario.trafficType === "http") {
    payloadSummary = `HTTP GET / HTTP/1.1 Host: ${dstNode?.name || "server"}`;
  }

  return {
    id: `pkt-${Date.now()}-${num}`,
    packetNumber: num,
    protocol: scenario.protocol || "ICMP",
    sourceNodeId: scenario.sourceNodeId,
    destinationNodeId: scenario.destinationNodeId,
    sourceIp,
    destinationIp,
    currentHopNodeId: scenario.sourceNodeId,
    ttl: scenario.ttl || 64,
    status: "queued",
    progressPercent: 0,
    headers: {
      sourceMac,
      destinationMac,
      sourceIp,
      destinationIp,
      ttl: scenario.ttl || 64,
      protocol: scenario.protocol || "ICMP",
      sourcePort: scenario.sourcePort || 49152,
      destinationPort: scenario.destinationPort || 80,
      payloadSummary,
    },
    payload: {
      type: scenario.trafficType,
      payloadSize: scenario.payloadSize || 64,
      createdTime: Date.now(),
    },
  };
}

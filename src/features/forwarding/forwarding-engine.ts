import {
  NetworkTopology,
  SimulationScenario,
  SimulationEvent,
  NetworkPacket,
  PacketProtocol,
} from "@/features/topology/topology-types";
import { buildPacket } from "@/features/forwarding/packet-builder";
import { calculateNetworkPath } from "@/features/forwarding/path-calculator";
import { resolveArpAddress } from "@/features/forwarding/arp-engine";
import { processSwitchFrame } from "@/features/forwarding/switching-engine";
import { resolveDnsHostname } from "@/features/protocols/dns/dns-engine";
import { runHttpSimulation } from "@/features/protocols/http/http-engine";

export interface ForwardingSimulationResult {
  packet: NetworkPacket;
  events: SimulationEvent[];
  success: boolean;
  totalHops: number;
  explanation: string;
}

export function runForwardingSimulation(
  topology: NetworkTopology,
  scenario: SimulationScenario
): ForwardingSimulationResult {
  const events: SimulationEvent[] = [];
  let stepNumber = 1;

  const srcNode = topology.nodes.find((n) => n.id === scenario.sourceNodeId);
  const dstNode = topology.nodes.find((n) => n.id === scenario.destinationNodeId);

  if (!srcNode || !dstNode) {
    return {
      packet: buildPacket(topology, scenario),
      events: [
        {
          id: `evt-err-1`,
          stepNumber: 1,
          timestamp: new Date().toISOString(),
          category: "error",
          protocol: scenario.protocol || "ICMP",
          sourceDeviceId: scenario.sourceNodeId,
          summary: "Invalid Scenario Endpoint",
          explanation: "Source or Destination node was not found in the topology canvas.",
          status: "error",
        },
      ],
      success: false,
      totalHops: 0,
      explanation: "Source or Destination device missing.",
    };
  }

  if (scenario.trafficType === "dns") {
    const dnsResult = resolveDnsHostname(topology, srcNode.id, "example.com");
    dnsResult.events.forEach((e) => {
      events.push({
        id: `evt-dns-${stepNumber}`,
        stepNumber: stepNumber++,
        timestamp: new Date().toISOString(),
        category: "application",
        protocol: "DNS",
        sourceDeviceId: e.sourceNodeId,
        destinationDeviceId: e.destNodeId,
        summary: e.summary,
        explanation: e.explanation,
        status: dnsResult.success ? "delivered" : "dropped",
      });
    });
    const pkt = buildPacket(topology, scenario);
    pkt.status = dnsResult.success ? "delivered" : "dropped";
    return {
      packet: pkt,
      events,
      success: dnsResult.success,
      totalHops: 2,
      explanation: dnsResult.explanation,
    };
  }

  if (scenario.trafficType === "http") {
    const httpResult = runHttpSimulation(topology, srcNode.id, dstNode.id, "/", false);
    httpResult.events.forEach((e) => {
      events.push({
        id: `evt-http-${stepNumber}`,
        stepNumber: stepNumber++,
        timestamp: new Date().toISOString(),
        category: e.protocol === "TCP" ? "transport" : "application",
        protocol: e.protocol as PacketProtocol,
        sourceDeviceId: e.sourceNodeId,
        destinationDeviceId: e.destNodeId,
        summary: e.summary,
        explanation: e.explanation,
        status: httpResult.success ? "delivered" : "dropped",
      });
    });
    const pkt = buildPacket(topology, scenario);
    pkt.status = httpResult.success ? "delivered" : "dropped";
    return {
      packet: pkt,
      events,
      success: httpResult.success,
      totalHops: 3,
      explanation: httpResult.explanation,
    };
  }

  const initialPacket = buildPacket(topology, scenario);

  events.push({
    id: `evt-${stepNumber}`,
    stepNumber: stepNumber++,
    timestamp: new Date().toISOString(),
    category: "application",
    protocol: scenario.protocol || "ICMP",
    sourceDeviceId: srcNode.id,
    destinationDeviceId: dstNode.id,
    summary: `${scenario.trafficType.toUpperCase()} Application Payload Generated`,
    explanation: `Host ${srcNode.name} initialized ${scenario.trafficType.toUpperCase()} test traffic destined for ${dstNode.name} (${initialPacket.destinationIp}).`,
    status: "queued",
    relatedPacketId: initialPacket.id,
  });

  const arpResult = resolveArpAddress(srcNode, initialPacket.destinationIp, srcNode.interfaces[0]?.name || "eth0");
  if (arpResult.needsArpBroadcast) {
    events.push({
      id: `evt-${stepNumber}`,
      stepNumber: stepNumber++,
      timestamp: new Date().toISOString(),
      category: "ARP",
      protocol: "ARP",
      sourceDeviceId: srcNode.id,
      summary: `ARP Cache Miss → Broadcasting ARP Request`,
      explanation: arpResult.explanation,
      status: "forwarded",
      relatedPacketId: initialPacket.id,
    });

    events.push({
      id: `evt-${stepNumber}`,
      stepNumber: stepNumber++,
      timestamp: new Date().toISOString(),
      category: "ARP",
      protocol: "ARP",
      sourceDeviceId: dstNode.id,
      destinationDeviceId: srcNode.id,
      summary: `ARP Reply Sent → Resolved MAC ${dstNode.interfaces[0]?.macAddress}`,
      explanation: `Device ${dstNode.name} replied with MAC address ${dstNode.interfaces[0]?.macAddress}. ARP cache on ${srcNode.name} updated.`,
      status: "delivered",
      relatedPacketId: initialPacket.id,
      tableChanges: [
        {
          nodeId: srcNode.id,
          tableName: "arp",
          action: "added",
          entry: { ip: initialPacket.destinationIp, mac: dstNode.interfaces[0]?.macAddress },
        },
      ],
    });
  }

  const pathResult = calculateNetworkPath(topology, srcNode.id, dstNode.id);

  if (!pathResult.success) {
    events.push({
      id: `evt-${stepNumber}`,
      stepNumber: stepNumber++,
      timestamp: new Date().toISOString(),
      category: "routing",
      protocol: scenario.protocol || "ICMP",
      sourceDeviceId: srcNode.id,
      destinationDeviceId: dstNode.id,
      summary: "Forwarding Failed / Path Unreachable",
      explanation: pathResult.failureReason || "No route available.",
      status: "dropped",
      relatedPacketId: initialPacket.id,
    });

    initialPacket.status = "dropped";
    return {
      packet: initialPacket,
      events,
      success: false,
      totalHops: pathResult.hops.length,
      explanation: pathResult.failureReason || "Forwarding path failed.",
    };
  }

  pathResult.hops.forEach((hop, index) => {
    if (index === 0) return;

    const isLastHop = index === pathResult.hops.length - 1;
    const currentHopNode = topology.nodes.find((n) => n.id === hop.nodeId);

    if (currentHopNode?.type === "l2-switch") {
      const switchDecision = processSwitchFrame(
        currentHopNode,
        "GigabitEthernet0/1",
        initialPacket.headers.sourceMac,
        initialPacket.headers.destinationMac,
        1
      );

      events.push({
        id: `evt-${stepNumber}`,
        stepNumber: stepNumber++,
        timestamp: new Date().toISOString(),
        category: "switching",
        protocol: scenario.protocol || "ICMP",
        sourceDeviceId: hop.nodeId,
        summary: `Layer 2 Switch Frame ${switchDecision.action.toUpperCase()}`,
        explanation: switchDecision.explanation,
        status: "forwarded",
        relatedPacketId: initialPacket.id,
        affectedLinkId: hop.linkId,
        tableChanges: [
          {
            nodeId: currentHopNode.id,
            tableName: "mac",
            action: "added",
            entry: { mac: initialPacket.headers.sourceMac, port: "GigabitEthernet0/1" },
          },
        ],
      });
    } else {
      events.push({
        id: `evt-${stepNumber}`,
        stepNumber: stepNumber++,
        timestamp: new Date().toISOString(),
        category: isLastHop ? "transport" : "routing",
        protocol: scenario.protocol || "ICMP",
        sourceDeviceId: hop.nodeId,
        summary: isLastHop ? `Packet Delivered to Destination ${hop.nodeName}` : `Hop ${index}: Forwarded to ${hop.nodeName}`,
        explanation: hop.actionSummary,
        status: isLastHop ? "delivered" : "forwarded",
        relatedPacketId: initialPacket.id,
        affectedLinkId: hop.linkId,
      });
    }
  });

  if (scenario.trafficType === "ping") {
    events.push({
      id: `evt-${stepNumber}`,
      stepNumber: stepNumber++,
      timestamp: new Date().toISOString(),
      category: "application",
      protocol: "ICMP",
      sourceDeviceId: dstNode.id,
      destinationDeviceId: srcNode.id,
      summary: "ICMP Echo Reply (200 OK)",
      explanation: `Destination ${dstNode.name} processed ICMP Echo Request and transmitted Echo Reply back to ${srcNode.name}. RTT = ${pathResult.totalLatencyMs * 2} ms.`,
      status: "delivered",
      relatedPacketId: initialPacket.id,
    });
  }

  initialPacket.status = "delivered";

  return {
    packet: initialPacket,
    events,
    success: true,
    totalHops: pathResult.hops.length,
    explanation: `Successfully forwarded packet across ${pathResult.hops.length} network hops. Total latency: ${pathResult.totalLatencyMs} ms.`,
  };
}

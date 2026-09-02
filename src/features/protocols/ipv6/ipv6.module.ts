import type { ProtocolModule, ExplanationSection } from "@/features/protocols/shared/protocol-types";
import type { SimulationEventType } from "@/features/simulation/simulation-types";
import type { Ipv6Config, Ipv6ScenarioId } from "./ipv6.types";
import { defaultIpv6Config, defaultIpv6Nodes, defaultIpv6Links } from "./ipv6.defaults";
import { simulateIpv6Transaction } from "./ipv6.simulator";
import { ipv6ConfigSchema } from "./ipv6.schema";

const IPV6_EXPLANATION_SECTIONS: ExplanationSection[] = [
  {
    eventType: "packet-forwarded",
    beginner: {
      whatHappened: "A 128-bit IPv6 packet was transmitted across native IPv6 and dual-stack routers.",
      whyItHappened: "IPv6 is the next-generation Internet Protocol providing an enormous 128-bit address space ($3.4 \\times 10^{38}$ addresses) and simplified routing.",
      protocolRule: "RFC 8200: Fixed 40-byte header with no header checksum; Hop Limit is decremented at each router hop.",
      fieldsChanged: ["hopLimit"],
      whatHappensNext: "The packet is delivered to the destination host or decapsulated if passing through a 6to4 transition tunnel.",
      misconception: "IPv6 is just IPv4 with longer addresses. (IPv6 completely redesigns headers, eliminates broadcast with multicast, and introduces SLAAC autoconfiguration).",
      realWorldUse: "Powers modern 5G mobile networks, cloud providers (AWS, GCP, Cloudflare), and global tier-1 ISP backbones.",
    },
    advanced: {
      whatHappened: "20-bit Flow Label forwarding & Next Header extension header chaining.",
      whyItHappened: "Eliminates need for routers to inspect Layer 4 TCP/UDP ports or perform in-flight packet fragmentation.",
      protocolRule: "RFC 6437 / RFC 4861: Flow Label preserved end-to-end; ICMPv6 Neighbor Discovery replaces ARP.",
      fieldsChanged: ["hopLimit", "nextHeader"],
      whatHappensNext: "Destination validates 128-bit TCP/UDP pseudo-header checksum and delivers data to listening socket.",
      misconception: "IPv6 routers can fragment packets if MTU is too small. (Only the sending host fragments packets in IPv6).",
      realWorldUse: "Segment Routing over IPv6 (SRv6) uses Routing Extension Headers for software-defined traffic engineering.",
    },
  },
];

export const ipv6Module: ProtocolModule = {
  id: "ipv6",
  name: "IPv6",
  category: "network",
  layer: "Network (Layer 3)",
  summary: "Internet Protocol version 6 — 128-bit addressing, streamlined 40-byte fixed header, Flow Label QoS, Extension Headers chaining, and SLAAC / NDP.",
  status: "implemented",
  learningObjectives: [
    "Understand the 128-bit IPv6 address architecture and hexadecimal zero-compression notation (`2001:db8::1`).",
    "Analyze the streamlined 40-byte fixed header (Traffic Class, Flow Label, Payload Length, Next Header, Hop Limit).",
    "Inspect Extension Header chaining (Hop-by-Hop Options, Routing, Fragment, ESP/AH) via Next Header pointers.",
    "Evaluate Neighbor Discovery Protocol (NDP / SLAAC) and Router Advertisements (ICMPv6 Type 134) replacing broadcast ARP.",
    "Compare Dual-Stack native routing and 6to4 automatic tunneling (IPv6-in-IPv4 encapsulation, Protocol 41).",
  ],
  simplificationNotes: [
    "Simulates real-time 128-bit packet routing, Flow Label QoS forwarding, Extension Header inspection, and SLAAC autoconfiguration.",
  ],
  defaultTopology: {
    nodes: defaultIpv6Nodes.map((n) => ({
      id: n.id,
      type: n.type,
      label: n.name,
      position: n.position,
    })),
    edges: defaultIpv6Links.map((l) => ({
      id: l.id,
      source: l.sourceNodeId,
      target: l.targetNodeId,
      label: l.label,
    })),
  },
  configurationSchema: ipv6ConfigSchema,
  defaultConfiguration: {
    sourceIpv6: defaultIpv6Config.sourceIpv6,
    destinationIpv6: defaultIpv6Config.destinationIpv6,
    payloadSize: defaultIpv6Config.payloadSize,
    flowLabel: defaultIpv6Config.flowLabel,
    trafficClass: defaultIpv6Config.trafficClass,
    initialHopLimit: defaultIpv6Config.initialHopLimit,
    useExtensionHeader: defaultIpv6Config.useExtensionHeader,
  },
  generateSimulation: (_topology, configOverride) => {
    const customConfig = { ...defaultIpv6Config, ...(configOverride as Partial<Ipv6Config>) };
    let scenarioId: Ipv6ScenarioId = "ipv6_unicast_transit";
    if (configOverride?.scenarioId) {
      scenarioId = configOverride.scenarioId as Ipv6ScenarioId;
    } else if (customConfig.useExtensionHeader) {
      scenarioId = "ipv6_extension_headers";
    }

    const outcome = simulateIpv6Transaction(customConfig, scenarioId);
    return {
      events: outcome.events.map((e, idx) => ({
        id: `ipv6-evt-${e.step}`,
        timestamp: e.step * 50,
        sequenceNumber: idx + 1,
        type: "packet-forwarded" as SimulationEventType,
        sourceNodeId: e.sourceNodeId,
        destinationNodeId: e.destNodeId,
        protocol: e.protocol,
        title: e.title,
        description: e.explanation,
        status: "completed" as const,
        severity: "info" as const,
        packetId: `pkt-v6-${e.step}`,
      })),
      packets: outcome.packets.map((p) => ({
        id: p.id,
        protocol: p.protocol,
        label: p.label,
        source: p.sourceId,
        destination: p.targetId,
        headers: {
          ipv6: {
            srcIp: p.header.sourceIp,
            dstIp: p.header.destinationIp,
            flowLabel: p.header.flowLabel,
            nextHeader: p.header.nextHeaderName,
          },
        },
        size: p.header.payloadLength + 40,
        status: "delivered" as const,
        colorKey: p.isTunneled ? "#a855f7" : "#06b6d4",
        createdAt: p.stepIndex * 50,
      })),
      initialState: {
        config: customConfig,
        scenarioId,
        hopsTraversed: outcome.hopsTraversed,
        extensionHeaderCount: outcome.extensionHeaderCount,
        isDelivered: outcome.isDelivered,
      },
    };
  },
  packetFields: [
    { layer: "Network", name: "version", description: "IP Version (6)" },
    { layer: "Network", name: "trafficClass", description: "8-bit Traffic Class (DSCP + ECN)" },
    { layer: "Network", name: "flowLabel", description: "20-bit QoS Flow Identifier for ECMP load balancing" },
    { layer: "Network", name: "payloadLength", description: "16-bit payload length excluding 40-byte fixed header" },
    { layer: "Network", name: "nextHeader", description: "Protocol number or Extension Header type" },
    { layer: "Network", name: "hopLimit", description: "8-bit hop counter decremented at each router" },
    { layer: "Network", name: "sourceIp", description: "128-bit Source IPv6 Address" },
    { layer: "Network", name: "destinationIp", description: "128-bit Destination IPv6 Address" },
  ],
  explanationSections: IPV6_EXPLANATION_SECTIONS,
};

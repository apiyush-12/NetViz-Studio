import type { ProtocolModule, ExplanationSection } from "@/features/protocols/shared/protocol-types";
import type { SimulationEventType } from "@/features/simulation/simulation-types";
import type { Ipv4Config, Ipv4ScenarioId } from "./ipv4.types";
import { defaultIpv4Config, defaultIpv4Nodes, defaultIpv4Links } from "./ipv4.defaults";
import { simulateIpv4Transaction } from "./ipv4.simulator";
import { ipv4ConfigSchema } from "./ipv4.schema";

const IPV4_EXPLANATION_SECTIONS: ExplanationSection[] = [
  {
    eventType: "packet-forwarded",
    beginner: {
      whatHappened: "An IPv4 datagram was routed across multiple routers to reach its destination.",
      whyItHappened: "IPv4 is the core network layer protocol responsible for logical addressing and routing packets across subnets.",
      protocolRule: "RFC 791: Every router decrements the Time to Live (TTL) by 1 and updates the header checksum.",
      fieldsChanged: ["ttl", "checksum", "fragmentOffset"],
      whatHappensNext: "If the packet exceeds an interface MTU, it is either fragmented or dropped (if DF=1).",
      misconception: "IPv4 guarantees delivery. (In reality, IPv4 is best-effort and relies on TCP for reliability).",
      realWorldUse: "Powers legacy Internet routing, enterprise LANs, and standard IPv4 dual-stack environments.",
    },
    advanced: {
      whatHappened: "In-flight MTU fragmentation & 8-byte aligned offset recalculation: 1500B datagram split into 3 fragments.",
      whyItHappened: "Edge interface MTU (576B) is smaller than the ingress datagram total length.",
      protocolRule: "RFC 815 / RFC 1191: Fragment offset measured in 8-octet units; More Fragments (MF) flag set on non-final fragments.",
      fieldsChanged: ["totalLength", "flags.mf", "fragmentOffset", "headerChecksum"],
      whatHappensNext: "Destination reassembly buffer collects all slices using (Source IP, Destination IP, ID) tuple.",
      misconception: "Routers in IPv6 also perform in-flight fragmentation. (Only the source host can fragment in IPv6 via PMTUD).",
      realWorldUse: "Crucial for VPN tunneling (IPsec, GRE, WireGuard) where encapsulation reduces effective MTU.",
    },
  },
];

export const ipv4Module: ProtocolModule = {
  id: "ipv4",
  name: "IPv4",
  category: "network",
  layer: "Network (Layer 3)",
  summary: "Internet Protocol version 4 — 32-bit logical addressing, 20-byte fixed header, TTL decrement, MTU in-flight fragmentation, and CIDR routing.",
  status: "implemented",
  learningObjectives: [
    "Understand the 20-byte IPv4 fixed header structure (IHL, Total Length, Identification, Flags, Fragment Offset, TTL, Protocol, Checksum).",
    "Master in-flight MTU fragmentation calculations, 8-byte offset alignments, and More Fragments (MF) flag behavior.",
    "Inspect Time-to-Live (TTL) decrements, incremental RFC 1624 checksum recalculation, and ICMP Time Exceeded (Type 11).",
    "Analyze Longest Prefix Match (LPM) CIDR routing table lookups across subnets.",
    "Evaluate Path MTU Discovery (PMTUD) and the Don't Fragment (DF=1) packet dropping mechanism.",
  ],
  simplificationNotes: [
    "Simulates real-time packet transit across multi-hop router links with live MTU bottleneck slicing and buffer reassembly.",
  ],
  defaultTopology: {
    nodes: defaultIpv4Nodes.map((n) => ({
      id: n.id,
      type: n.type,
      label: n.name,
      position: n.position,
    })),
    edges: defaultIpv4Links.map((l) => ({
      id: l.id,
      source: l.sourceNodeId,
      target: l.targetNodeId,
      label: l.label,
    })),
  },
  configurationSchema: ipv4ConfigSchema,
  defaultConfiguration: {
    sourceIp: defaultIpv4Config.sourceIp,
    destinationIp: defaultIpv4Config.destinationIp,
    packetSize: defaultIpv4Config.packetSize,
    initialTtl: defaultIpv4Config.initialTtl,
    dfFlag: defaultIpv4Config.dfFlag,
    routerMtu: defaultIpv4Config.routerMtu,
  },
  generateSimulation: (_topology, configOverride) => {
    const customConfig = { ...defaultIpv4Config, ...(configOverride as Partial<Ipv4Config>) };
    let scenarioId: Ipv4ScenarioId = "standard_forwarding";
    if (configOverride?.scenarioId) {
      scenarioId = configOverride.scenarioId as Ipv4ScenarioId;
    } else if (customConfig.packetSize > customConfig.routerMtu) {
      scenarioId = customConfig.dfFlag ? "checksum_error" : "fragmentation_mtu";
    }

    const outcome = simulateIpv4Transaction(customConfig, scenarioId);
    return {
      events: outcome.events.map((e, idx) => ({
        id: `ipv4-evt-${e.step}`,
        timestamp: e.step * 50,
        sequenceNumber: idx + 1,
        type: (e.type === "ttl-expired" ? "packet-dropped" : "packet-forwarded") as SimulationEventType,
        sourceNodeId: e.sourceNodeId,
        destinationNodeId: e.destNodeId,
        protocol: e.protocol,
        title: e.title,
        description: e.explanation,
        status: "completed" as const,
        severity: e.type === "ttl-expired" ? ("error" as const) : ("info" as const),
        packetId: `pkt-${e.step}`,
      })),
      packets: outcome.packets.map((p) => ({
        id: p.id,
        protocol: p.protocol,
        label: p.label,
        source: p.sourceId,
        destination: p.targetId,
        headers: {
          ipv4: {
            srcIp: p.header.sourceIp,
            dstIp: p.header.destinationIp,
          },
        },
        size: p.header.totalLength,
        status: (p.status === "dropped" ? "dropped" : "delivered") as "delivered" | "dropped",
        colorKey: p.isFragmented ? "#f59e0b" : "#38bdf8",
        createdAt: p.stepIndex * 50,
      })),
      initialState: {
        config: customConfig,
        scenarioId,
        fragmentsGenerated: outcome.fragmentsGenerated,
        hopsTraversed: outcome.hopsTraversed,
        isDelivered: outcome.isDelivered,
      },
    };
  },
  packetFields: [
    { layer: "Network", name: "version", description: "IP Version (4)" },
    { layer: "Network", name: "ihl", description: "Internet Header Length (20-60 Bytes)" },
    { layer: "Network", name: "totalLength", description: "Total Datagram Length in Bytes" },
    { layer: "Network", name: "identification", description: "16-bit Datagram Identifier for Fragmentation" },
    { layer: "Network", name: "flags", description: "Control Flags: Reserved, DF (Don't Fragment), MF (More Fragments)" },
    { layer: "Network", name: "fragmentOffset", description: "Offset in 8-byte units from beginning of original datagram" },
    { layer: "Network", name: "ttl", description: "Time-to-Live hop counter decremented at each router" },
    { layer: "Network", name: "protocol", description: "Layer 4 Protocol Number (6=TCP, 17=UDP, 1=ICMP)" },
    { layer: "Network", name: "headerChecksum", description: "16-bit One's Complement Checksum of IPv4 Header" },
  ],
  explanationSections: IPV4_EXPLANATION_SECTIONS,
};

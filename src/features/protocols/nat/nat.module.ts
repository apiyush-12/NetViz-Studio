import type { ProtocolModule, ExplanationSection } from "@/features/protocols/shared/protocol-types";
import type { SimulationEventType } from "@/features/simulation/simulation-types";
import type { NatConfig, NatScenarioId } from "./nat.types";
import { defaultNatConfig, defaultNatNodes, defaultNatLinks } from "./nat.defaults";
import { simulateNatTransaction } from "./nat.simulator";
import { natConfigSchema } from "./nat.schema";

const NAT_EXPLANATION_SECTIONS: ExplanationSection[] = [
  {
    eventType: "handshake-step",
    beginner: {
      whatHappened: "A private LAN host sent a packet across the NAT Gateway out to the public Internet.",
      whyItHappened: "Private IP addresses (RFC 1918) are non-routable on the global IPv4 internet.",
      protocolRule: "RFC 3022: Network Address Translation (NAT) modifies IP headers in-place.",
      fieldsChanged: ["srcIp", "srcPort", "checksum"],
      whatHappensNext: "The NAT Gateway saves the socket mapping in its translation table and forwards the packet.",
      misconception: "NAT is not a replacement for IPv6, but a temporary solution to IPv4 address exhaustion.",
      realWorldUse: "Used by every home Wi-Fi router, enterprise firewall, and cloud network gateway.",
    },
    advanced: {
      whatHappened: "Outbound PAT/NAPT header modification: 192.168.1.10:54321 -> 203.0.113.1:40001.",
      whyItHappened: "Allocates ephemeral public WAN port for socket-level multiplexing.",
      protocolRule: "RFC 4787: NAT Behavioral Requirements for Unicast UDP and TCP.",
      fieldsChanged: ["ip.src", "tcp.srcport", "ip.checksum", "tcp.checksum"],
      whatHappensNext: "Return WAN traffic matches stateful 4-tuple translation entry.",
      misconception: "NAT does not encrypt traffic; it only rewrites layer 3 and layer 4 headers.",
      realWorldUse: "Essential for cloud VPC internet gateways (AWS NAT Gateway, Azure NAT).",
    },
  },
];

export const natModule: ProtocolModule = {
  id: "nat",
  name: "NAT / PAT",
  category: "network",
  layer: "Network (Layer 3/4)",
  summary: "Network Address Translation (NAT/PAT) — IPv4 header rewriting, stateful translation tables, port overload multiplexing, and port forwarding.",
  status: "implemented",
  learningObjectives: [
    "Understand RFC 1918 private IPv4 address spaces (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16).",
    "Compare Static 1:1 NAT, Dynamic NAT, PAT / NAPT (Port Overload), and DNAT (Port Forwarding).",
    "Inspect in-place IP & TCP/UDP header modification and incremental 16-bit checksum recalculation (RFC 1624).",
    "Analyze stateful NAT translation tables, 4-tuple socket lookups, and session idle timeout expirations.",
    "Evaluate firewall interaction, Application Layer Gateways (ALGs), and Carrier-Grade NAT (CGNAT / NAT444).",
  ],
  simplificationNotes: [
    "Simulates real-time 4-tuple translation table lookups and header rewrites across LAN/WAN zone boundaries.",
    "Models port overload multiplexing, port forwarding rules, and ephemeral port pool exhaustion.",
  ],
  defaultTopology: {
    nodes: defaultNatNodes.map((n) => ({
      id: n.id,
      type: n.type === "inside-host" ? "host" : n.type === "nat-router" || n.type === "isp-router" ? "router" : "server",
      label: n.name,
      position: n.position,
    })),
    edges: defaultNatLinks.map((l) => ({
      id: l.id,
      source: l.sourceNodeId,
      target: l.targetNodeId,
      label: l.label,
    })),
  },
  configurationSchema: natConfigSchema,
  defaultConfiguration: {
    mode: defaultNatConfig.mode,
    publicIp: defaultNatConfig.publicIp,
    privateSubnet: defaultNatConfig.privateSubnet,
    timeoutSeconds: defaultNatConfig.timeoutSeconds,
  },
  generateSimulation: (_topology, configOverride) => {
    const customConfig = { ...defaultNatConfig, ...(configOverride as Partial<NatConfig>) };
    let scenarioId: NatScenarioId = "pat_web_browse";
    if (configOverride?.scenarioId) {
      scenarioId = configOverride.scenarioId as NatScenarioId;
    } else if (customConfig.mode === "dnat") {
      scenarioId = "static_server_dnat";
    } else if (customConfig.mode === "dynamic") {
      scenarioId = "dynamic_ip_pool";
    } else if (customConfig.mode === "cgnat") {
      scenarioId = "cgnat_double_nat";
    } else if (customConfig.mode === "pat") {
      scenarioId = "pat_web_browse";
    }

    const outcome = simulateNatTransaction(customConfig, scenarioId);
    return {
      events: outcome.events.map((e, idx) => ({
        id: `nat-evt-${e.step}`,
        timestamp: e.step * 50,
        sequenceNumber: idx + 1,
        type: (e.type === "packet-dropped" ? "packet-dropped" : "handshake-step") as SimulationEventType,
        sourceNodeId: e.sourceNodeId,
        destinationNodeId: e.destNodeId,
        protocol: e.protocol,
        title: e.title,
        description: e.explanation,
        status: "completed" as const,
        severity: e.type === "packet-dropped" ? ("error" as const) : ("info" as const),
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
            srcIp: p.srcIp,
            dstIp: p.dstIp,
          },
        },
        size: 120,
        status: "delivered" as const,
        colorKey: p.isTranslated ? "#10b981" : "#38bdf8",
        createdAt: p.stepIndex * 50,
      })),
      initialState: {
        config: customConfig,
        scenarioId,
        translationTable: outcome.translationTable,
      },
    };
  },
  packetFields: [
    { layer: "Network", name: "srcIp", description: "Source IPv4 Address (Inside Local vs Inside Global)" },
    { layer: "Transport", name: "srcPort", description: "Source TCP/UDP Port (Local Client Port vs PAT Public Port)" },
    { layer: "Network", name: "dstIp", description: "Destination IPv4 Address (Outside Global)" },
  ],
  explanationSections: NAT_EXPLANATION_SECTIONS,
};

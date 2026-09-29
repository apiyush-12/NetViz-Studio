import type { ProtocolModule } from "@/features/protocols/shared/protocol-types";
import { defaultRipConfig } from "./rip.defaults";
import { ripConfigSchema } from "./rip.schema";
import { generateRipSimulation } from "./rip.simulator";
import { RIP_EXPLANATION_SECTIONS } from "./rip.explanations";

export const ripModule: ProtocolModule = {
  id: "rip",
  name: "RIP",
  category: "routing",
  layer: "Network / Application (UDP 520)",
  summary:
    "Routing Information Protocol (RFC 1058 / RFC 2453) — Distance-Vector routing using Bellman-Ford algorithm, Split Horizon, Poison Reverse, and a 15-hop limit.",
  status: "implemented",
  learningObjectives: [
    "Understand Bellman-Ford Distance-Vector calculation and hop count metric relaxation ($D = \\min(c + D_v)$).",
    "Analyze why Metric 16 is defined as Infinity / Unreachable and how it limits network diameter.",
    "Observe Split Horizon and Poison Reverse mechanisms preventing two-node and multi-node routing loops.",
    "Simulate the infamous Count-to-Infinity problem and understand why distance-vector protocols require loop prevention.",
    "Compare RIPv1 (Classful Broadcast) vs RIPv2 (Classless Multicast 224.0.0.9, Subnet Masks, Route Tags).",
    "Examine RIP route timer state machines (30s Update, 180s Invalid, 180s Holddown, 240s Flush).",
  ],
  defaultTopology: {
    nodes: [
      { id: "r1", type: "router", label: "Router R1", position: { x: 120, y: 220 } },
      { id: "r2", type: "router", label: "Router R2", position: { x: 380, y: 220 } },
      { id: "r3", type: "router", label: "Router R3", position: { x: 640, y: 220 } },
      { id: "r4", type: "router", label: "Router R4", position: { x: 900, y: 220 } },
    ],
    edges: [
      { id: "link-r1-r2", source: "r1", target: "r2", cost: 1 },
      { id: "link-r2-r3", source: "r2", target: "r3", cost: 1 },
      { id: "link-r3-r4", source: "r3", target: "r4", cost: 1 },
    ],
  },
  configurationSchema: ripConfigSchema,
  defaultConfiguration: defaultRipConfig as unknown as Record<string, unknown>,
  generateSimulation: generateRipSimulation,
  packetFields: [
    {
      layer: "Application / Routing",
      name: "Command",
      description: "1 = Request (Query for routing table), 2 = Response (Periodic or triggered advertisement).",
    },
    {
      layer: "Application / Routing",
      name: "Version",
      description: "1 for RIPv1 (RFC 1058), 2 for RIPv2 (RFC 2453 classless), 3 for RIPng (IPv6).",
    },
    {
      layer: "Application / Routing",
      name: "Routing Domain",
      description: "16-bit identifier for routing domain or multi-instance process separation.",
    },
    {
      layer: "Route Table Entry (RTE)",
      name: "Address Family Identifier (AFI)",
      description: "2 for IPv4 addresses; 0xFFFF indicates an Authentication entry.",
    },
    {
      layer: "Route Table Entry (RTE)",
      name: "Route Tag",
      description: "16-bit field used to carry external AS numbers or redistribution tags (e.g. from BGP/OSPF).",
    },
    {
      layer: "Route Table Entry (RTE)",
      name: "IP Address Prefix",
      description: "Destination IPv4 network address (e.g. 192.168.1.0).",
    },
    {
      layer: "Route Table Entry (RTE)",
      name: "Subnet Mask",
      description: "32-bit subnet mask (RIPv2 only) enabling Variable Length Subnet Masking (VLSM).",
    },
    {
      layer: "Route Table Entry (RTE)",
      name: "Next Hop IP",
      description: "Immediate next-hop router address. 0.0.0.0 indicates the sending router is the next hop.",
    },
    {
      layer: "Route Table Entry (RTE)",
      name: "Metric",
      description: "Hop count to destination (1 to 15 hops; 16 = Infinity / Unreachable).",
    },
  ],
  explanationSections: RIP_EXPLANATION_SECTIONS,
  simplificationNotes: [
    "Simulation models up to 4 routers per topology for optimal pedagogical clarity.",
    "Timer tick intervals are accelerated for interactive instant scrubbing and playback.",
  ],
};

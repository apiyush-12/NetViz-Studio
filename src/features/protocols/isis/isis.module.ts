import type { ProtocolModule } from "@/features/protocols/shared/protocol-types";
import { defaultIsisConfig } from "./isis.defaults";
import { isisConfigSchema } from "./isis.schema";
import { generateIsisSimulation } from "./isis.simulator";
import { ISIS_EXPLANATION_SECTIONS } from "./isis.explanations";

export const isisModule: ProtocolModule = {
  id: "isis",
  name: "IS-IS",
  category: "routing",
  layer: "Data-Link / OSI Network (SAP 0xFEFE)",
  summary:
    "Intermediate System to Intermediate System (ISO/IEC 10589 / RFC 1195 / RFC 5308) — Link-State 2-level hierarchical routing with pure Layer 2 framing, TLVs, DIS election, ATT-bit default routing, and dual-stack IPv4/IPv6.",
  status: "implemented",
  learningObjectives: [
    "Understand OSI Network Entity Title (NET) addressing and System ID structure.",
    "Master the 2-Level hierarchy: Level 1 (Intra-Area) vs Level 2 (Inter-Area Backbone) vs L1/L2 Border Routers.",
    "Observe Attached Bit (ATT=1) dynamic default route injection and Level 1 path isolation.",
    "Inspect DIS (Designated Intermediate System) election on broadcast Ethernet LANs and Pseudonode LSP generation.",
    "Analyze RFC 2966 Route Leaking with Up/Down (U/D) bit for loop-free optimal inter-area pathing.",
    "Explore Integrated IS-IS dual-stack multi-topology routing (IPv4 TLV 135 and IPv6 TLV 236).",
    "Evaluate the Overload Bit (OL-Bit) for zero-downtime maintenance traffic diversion.",
  ],
  defaultTopology: {
    nodes: [
      { id: "r1", type: "router", label: "Router R1 (L1)", position: { x: 100, y: 220 } },
      { id: "r2", type: "router", label: "Router R2 (L1/L2)", position: { x: 340, y: 220 } },
      { id: "r3", type: "router", label: "Router R3 (L2)", position: { x: 580, y: 220 } },
      { id: "r4", type: "router", label: "Router R4 (L1/L2)", position: { x: 820, y: 220 } },
      { id: "r5", type: "router", label: "Router R5 (L1)", position: { x: 1060, y: 220 } },
    ],
    edges: [
      { id: "link-r1-r2", source: "r1", target: "r2", cost: 10 },
      { id: "link-r2-r3", source: "r2", target: "r3", cost: 10 },
      { id: "link-r3-r4", source: "r3", target: "r4", cost: 10 },
      { id: "link-r4-r5", source: "r4", target: "r5", cost: 10 },
    ],
  },
  configurationSchema: isisConfigSchema,
  defaultConfiguration: defaultIsisConfig as unknown as Record<string, unknown>,
  generateSimulation: generateIsisSimulation,
  packetFields: [
    {
      layer: "OSI Data Link",
      name: "NLPID (Protocol Discriminator)",
      description: "0x83 for IS-IS Intradomain Routing Protocol.",
    },
    {
      layer: "IS-IS Header",
      name: "PDU Type",
      description: "15/16 (LAN IIH), 17 (P2P IIH), 18/20 (L1/L2 LSP), 24/25 (CSNP), 26/27 (PSNP).",
    },
    {
      layer: "Link State PDU",
      name: "LSP ID",
      description: "SystemID (6B) + Pseudonode ID (1B) + Fragment Number (1B), e.g. 0000.0000.0001.00-00.",
    },
    {
      layer: "Link State PDU",
      name: "Attached Bit (ATT)",
      description: "Set by L1/L2 routers to signal inter-area backbone connectivity and prompt L1 default routing.",
    },
    {
      layer: "Link State PDU",
      name: "Overload Bit (OL)",
      description: "Set during maintenance to exclude this router from transit Dijkstra SPF calculations.",
    },
    {
      layer: "TLV Payload",
      name: "TLV 1 (Area Addresses)",
      description: "Carries the router's configured Area ID(s) (e.g. 49.0001).",
    },
    {
      layer: "TLV Payload",
      name: "TLV 135 (Extended IP Reachability)",
      description: "RFC 5305 wide metric IPv4 prefix dissemination (24-bit link cost, Up/Down bit).",
    },
    {
      layer: "TLV Payload",
      name: "TLV 236 (IPv6 Reachability)",
      description: "RFC 5308 128-bit IPv6 prefix reachability for dual-stack IS-IS.",
    },
    {
      layer: "TLV Payload",
      name: "TLV 137 (Dynamic Hostname)",
      description: "RFC 5307 human-readable router hostname mapping (e.g. R1, R2).",
    },
  ],
  explanationSections: ISIS_EXPLANATION_SECTIONS,
  simplificationNotes: [
    "Simulation models 3 distinct areas across up to 5 routers for optimal architectural clarity.",
    "Fletcher-16 checksums and LSP lifetime countdowns are modeled with accelerated ticks for interactive scrubbing.",
  ],
};

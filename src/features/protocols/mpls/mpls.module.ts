import type {
  ProtocolModule,
  PacketFieldDefinition,
} from "@/features/protocols/shared/protocol-types";
import { mplsConfigSchema } from "./mpls.schema";
import { defaultMplsConfig, STANDARD_CORE_NODES, STANDARD_CORE_LINKS } from "./mpls.defaults";
import { generateMplsSimulation } from "./mpls.simulator";
import { MPLS_EXPLANATION_SECTIONS } from "./mpls.explanations";

const MPLS_PACKET_FIELDS: PacketFieldDefinition[] = [
  {
    layer: "Data Link (Layer 2 - Ethernet II)",
    name: "EtherType (0x8847 / 0x8848)",
    description: "0x8847 identifies MPLS Unicast frames; 0x8848 identifies MPLS Multicast.",
  },
  {
    layer: "MPLS Shim Header (RFC 3032 - 4 Bytes)",
    name: "Label Value (20 Bits)",
    description: "20-bit index (0 to 1,048,575) indicating the Forwarding Equivalence Class (FEC). Labels 0-15 are reserved (0=IPv4 Explicit Null, 3=Implicit Null, 1=Router Alert).",
  },
  {
    layer: "MPLS Shim Header (RFC 3032 - 4 Bytes)",
    name: "Traffic Class / EXP (3 Bits)",
    description: "3-bit Quality of Service (QoS) / Class of Service field (RFC 3270 / RFC 5462) mapping to IP DSCP / 802.1p CoS.",
  },
  {
    layer: "MPLS Shim Header (RFC 3032 - 4 Bytes)",
    name: "Bottom of Stack (S-Bit - 1 Bit)",
    description: "1-bit flag: set to 1 if this is the bottom (last) label in the stack; set to 0 if additional inner MPLS labels follow.",
  },
  {
    layer: "MPLS Shim Header (RFC 3032 - 4 Bytes)",
    name: "Time to Live (TTL - 8 Bits)",
    description: "8-bit loop prevention hop counter decremented by 1 at each LSR (RFC 3443 Uniform vs Pipe mode).",
  },
  {
    layer: "Network Layer (Layer 3 - Encapsulated Payload)",
    name: "IPv4 / IPv6 / L2VPN Payload",
    description: "The underlying customer or transit datagram encapsulated underneath the MPLS label stack.",
  },
];

export const mplsModule: ProtocolModule = {
  id: "mpls",
  name: "MPLS",
  category: "network",
  layer: "Network (Layer 2.5)",
  summary:
    "Multiprotocol Label Switching (RFC 3031 / RFC 3032) — High-performance Layer 2.5 label switching protocol that replaces hop-by-hop IP routing with exact-match 20-bit label indexing, hierarchical multi-label stacking, Penultimate Hop Popping (PHP), BGP/MPLS L3VPN multi-tenancy, and sub-50ms Fast Reroute (FRR).",
  status: "implemented",
  learningObjectives: [
    "Master the 32-bit RFC 3032 MPLS Shim Header: 20-bit Label, 3-bit Traffic Class (EXP), 1-bit Bottom-of-Stack (S-bit), and 8-bit TTL.",
    "Understand Ingress LER Label Imposition (PUSH), Core LSR Label Switching (SWAP), and Egress LER Label Removal (POP).",
    "Analyze Penultimate Hop Popping (PHP) and the signaling of Implicit Null (Label 3) to eliminate double lookups at the egress PE.",
    "Explore Multi-Tenant BGP/MPLS IP VPNs (RFC 4364) with 2-Label Stacking (Outer Transport + Inner VRF VPN Label) and BGP-Free Core.",
    "Observe sub-50ms MPLS Traffic Engineering Fast Reroute (FRR) link protection bypass detours.",
    "Compare RFC 3443 TTL Uniform Mode (Traceroute Core Visibility) vs Pipe Mode (Core Topology Privacy).",
    "Contrast Traditional IP Hop-by-Hop LPM routing vs MPLS Label Switching vs Segment Routing (SR-MPLS / SRv6).",
  ],
  simplificationNotes: [
    "Includes animated multi-label stack packet inspectors, live Cisco-style `show mpls forwarding-table` (LFIB) & `show mpls ldp bindings` (LIB), and dual-track explanations.",
  ],
  defaultTopology: {
    nodes: STANDARD_CORE_NODES.map((node) => ({
      id: node.id,
      type: (node.role === "ce" ? "host" : "router") as "host" | "switch" | "router" | "server",
      label: node.label,
      position: node.position,
    })),
    edges: STANDARD_CORE_LINKS.map((link) => ({
      id: link.id,
      source: link.sourceNodeId,
      target: link.targetNodeId,
      cost: link.metric,
    })),
  },
  configurationSchema: mplsConfigSchema,
  defaultConfiguration: defaultMplsConfig as unknown as Record<string, unknown>,
  generateSimulation: generateMplsSimulation,
  packetFields: MPLS_PACKET_FIELDS,
  explanationSections: MPLS_EXPLANATION_SECTIONS,
};

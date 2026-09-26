import type {
  ProtocolModule,
  PacketFieldDefinition,
} from "@/features/protocols/shared/protocol-types";
import { icmpConfigSchema } from "./icmp.schema";
import { defaultIcmpConfig, STANDARD_INTERNET_NODES, STANDARD_INTERNET_LINKS } from "./icmp.defaults";
import { generateIcmpSimulation } from "./icmp.simulator";
import { ICMP_EXPLANATION_SECTIONS } from "./icmp.explanations";

const ICMP_PACKET_FIELDS: PacketFieldDefinition[] = [
  {
    layer: "Network (Layer 3 - IPv4 Protocol 1)",
    name: "Type (8 Bits)",
    description: "Defines the ICMP message category: 8 = Echo Request, 0 = Echo Reply, 11 = Time Exceeded, 3 = Destination Unreachable, 5 = Redirect.",
  },
  {
    layer: "Network (Layer 3 - IPv4 Protocol 1)",
    name: "Code (8 Bits)",
    description: "Sub-type parameter specifying exact diagnostic error (e.g. Type 3 Code 4 = Fragmentation Needed, Type 11 Code 0 = TTL Expired in Transit).",
  },
  {
    layer: "Network (Layer 3 - IPv4 Protocol 1)",
    name: "Checksum (16 Bits)",
    description: "16-bit one's complement checksum computed over the entire ICMP header and payload (RFC 1071).",
  },
  {
    layer: "Network (Layer 3 - Message Specific Header)",
    name: "Identifier & Sequence Number (32 Bits)",
    description: "For Echo Request/Reply: 16-bit process ID + 16-bit sequence number to match outgoing ping probes with incoming answers.",
  },
  {
    layer: "Network (Layer 3 - Message Specific Header)",
    name: "Next-Hop MTU (16 Bits)",
    description: "For Type 3 Code 4 (RFC 1191 PMTUD): supplies the exact maximum transmission unit of the bottleneck link to the sender.",
  },
  {
    layer: "Network (Layer 3 - Error Message Quoting)",
    name: "Quoted Original IP Header + 64 Bits of Payload",
    description: "For all error messages: includes the original IPv4 header and the first 8 bytes of the offending transport payload so sockets can demultiplex errors.",
  },
];

export const icmpModule: ProtocolModule = {
  id: "icmp",
  name: "ICMP",
  category: "network",
  layer: "Network (Layer 3)",
  summary:
    "Internet Control Message Protocol (RFC 792 / RFC 4443 / RFC 1191) — Essential Layer 3 network diagnostics and error-reporting protocol providing Ping (Echo Request/Reply), Traceroute (TTL Exceeded), Path MTU Discovery (PMTUD), Destination Unreachable, and Router Redirects.",
  status: "implemented",
  learningObjectives: [
    "Master the RFC 792 ICMP Header structure: Type (8b), Code (8b), Checksum (16b), and 32-bit Message-Specific fields.",
    "Analyze Ping Echo Request (Type 8) and Echo Reply (Type 0) mechanisms, round-trip time (RTT) calculation, and payload mirroring.",
    "Understand hop-by-hop Traceroute discovery via TTL Expiration in Transit (Type 11 Code 0) and Error Datagram Quoting.",
    "Explore Path MTU Discovery (PMTUD — RFC 1191), 'Fragmentation Needed & DF Set' (Type 3 Code 4), and kernel Route Cache MTU adaptation.",
    "Examine Destination Port Unreachable (Type 3 Code 3) and Firewall ACL Drops (Type 3 Code 13 Administratively Prohibited).",
    "Evaluate ICMP Redirects (Type 5 Code 1) for dynamic first-hop local subnet routing optimization.",
    "Contrast ICMPv4 (RFC 792) with ICMPv6 (RFC 4443 / NDP / SLAAC / MLD).",
  ],
  simplificationNotes: [
    "Includes animated topology canvas, live interactive CLI terminal (ping & traceroute), 32-bit aligned header inspectors, and error payload quote decoders.",
  ],
  defaultTopology: {
    nodes: STANDARD_INTERNET_NODES.map((node) => ({
      id: node.id,
      type: (node.type === "server" ? "server" : node.type === "host" ? "host" : "router") as "host" | "switch" | "router" | "server",
      label: node.label,
      position: node.position,
    })),
    edges: STANDARD_INTERNET_LINKS.map((link) => ({
      id: link.id,
      source: link.sourceNodeId,
      target: link.targetNodeId,
      latency: link.latencyMs,
      bandwidth: link.bandwidthMbps,
    })),
  },
  configurationSchema: icmpConfigSchema,
  defaultConfiguration: defaultIcmpConfig as unknown as Record<string, unknown>,
  generateSimulation: generateIcmpSimulation,
  packetFields: ICMP_PACKET_FIELDS,
  explanationSections: ICMP_EXPLANATION_SECTIONS,
};

import type {
  ProtocolModule,
  PacketFieldDefinition,
} from "@/features/protocols/shared/protocol-types";
import { arpConfigSchema } from "./arp.schema";
import { defaultArpConfig, STANDARD_LAN_NODES, STANDARD_LAN_LINKS } from "./arp.defaults";
import { generateArpSimulation } from "./arp.simulator";
import { ARP_EXPLANATION_SECTIONS } from "./arp.explanations";

const ARP_PACKET_FIELDS: PacketFieldDefinition[] = [
  {
    layer: "Data Link (Layer 2 - Ethernet II)",
    name: "Ethernet Destination & Source MAC",
    description: "Broadcast (FF:FF:FF:FF:FF:FF) for requests or Unicast destination for replies, with Sender's 48-bit MAC.",
  },
  {
    layer: "Data Link (Layer 2 - Ethernet II)",
    name: "EtherType (0x0806)",
    description: "Standard IEEE EtherType indicating Address Resolution Protocol (ARP) payload.",
  },
  {
    layer: "ARP Header (RFC 826 - 28 Bytes)",
    name: "Hardware Type (HTYPE: 0x0001)",
    description: "Network link protocol type; 1 indicates 10/100/1000/10000 Mbps Ethernet.",
  },
  {
    layer: "ARP Header (RFC 826 - 28 Bytes)",
    name: "Protocol Type (PTYPE: 0x0800)",
    description: "Internetwork layer protocol being resolved; 0x0800 specifies IPv4.",
  },
  {
    layer: "ARP Header (RFC 826 - 28 Bytes)",
    name: "Hardware Address Length (HLEN: 6)",
    description: "Length in octets of a hardware address (6 bytes for 48-bit Ethernet MAC).",
  },
  {
    layer: "ARP Header (RFC 826 - 28 Bytes)",
    name: "Protocol Address Length (PLEN: 4)",
    description: "Length in octets of a protocol address (4 bytes for 32-bit IPv4 address).",
  },
  {
    layer: "ARP Header (RFC 826 - 28 Bytes)",
    name: "Operation Code (OPER: 1, 2, 3, 4)",
    description: "Specifies packet function: 1 = ARP Request, 2 = ARP Reply, 3 = RARP Request, 4 = RARP Reply.",
  },
  {
    layer: "ARP Header (RFC 826 - 28 Bytes)",
    name: "Sender Hardware Address (SHA: 6 Bytes)",
    description: "MAC address of the device sending the ARP message.",
  },
  {
    layer: "ARP Header (RFC 826 - 28 Bytes)",
    name: "Sender Protocol Address (SPA: 4 Bytes)",
    description: "IPv4 address of the device sending the ARP message.",
  },
  {
    layer: "ARP Header (RFC 826 - 28 Bytes)",
    name: "Target Hardware Address (THA: 6 Bytes)",
    description: "MAC address of target device. In an ARP Request, this is set to 00:00:00:00:00:00 (unknown).",
  },
  {
    layer: "ARP Header (RFC 826 - 28 Bytes)",
    name: "Target Protocol Address (TPA: 4 Bytes)",
    description: "IPv4 address of the device whose MAC address is being requested.",
  },
];

export const arpModule: ProtocolModule = {
  id: "arp",
  name: "ARP",
  category: "data-link",
  layer: "Data-Link (Layer 2)",
  summary:
    "Address Resolution Protocol (RFC 826, RFC 5227, RFC 1027) — Resolves 32-bit IPv4 addresses to 48-bit Ethernet MAC addresses via local broadcast requests and unicast replies, featuring Gratuitous ARP, Proxy ARP, and Dynamic ARP Inspection (DAI).",
  status: "implemented",
  learningObjectives: [
    "Understand the core IP-to-MAC resolution mechanism across Ethernet local area networks (RFC 826).",
    "Inspect the standard 28-byte RFC 826 ARP packet format (HTYPE, PTYPE, HLEN, PLEN, OPER, SHA, SPA, THA, TPA).",
    "Observe Layer 2 switch CAM table learning and broadcast flooding vs unicast reply forwarding.",
    "Evaluate Gratuitous ARP (RFC 5227) for IP conflict detection, clustering / VRRP failover, and vMotion migration.",
    "Demonstrate Proxy ARP (RFC 1027) where routers reply on behalf of remote subnets.",
    "Analyze ARP Cache Poisoning / Spoofing Man-in-the-Middle attacks and switch-level Dynamic ARP Inspection (DAI) defenses.",
    "Compare IPv4 ARP with IPv6 Neighbor Discovery Protocol (NDP / RFC 4861) multicasting.",
  ],
  simplificationNotes: [
    "Provides interactive step-by-step cache inspection (`arp -a`), live 28-byte packet decoding, broadcast ripple animations, and scenario toggles.",
  ],
  defaultTopology: {
    nodes: STANDARD_LAN_NODES.map((node) => ({
      id: node.id,
      type: (node.type === "attacker" ? "host" : node.type) as "host" | "switch" | "router" | "server",
      label: node.label,
      position: node.position,
    })),
    edges: STANDARD_LAN_LINKS.map((link) => ({
      id: link.id,
      source: link.sourceNodeId,
      target: link.targetNodeId,
      cost: 1,
    })),
  },
  configurationSchema: arpConfigSchema,
  defaultConfiguration: defaultArpConfig as unknown as Record<string, unknown>,
  generateSimulation: generateArpSimulation,
  packetFields: ARP_PACKET_FIELDS,
  explanationSections: ARP_EXPLANATION_SECTIONS,
};

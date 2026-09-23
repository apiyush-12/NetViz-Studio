import type {
  ProtocolModule,
  PacketFieldDefinition,
} from "@/features/protocols/shared/protocol-types";
import { vlanConfigSchema } from "./vlan.schema";
import { defaultVlanConfig, ACCESS_SWITCH_NODES, ACCESS_SWITCH_LINKS } from "./vlan.defaults";
import { generateVlanSimulation } from "./vlan.simulator";
import { VLAN_EXPLANATION_SECTIONS } from "./vlan.explanations";

const VLAN_PACKET_FIELDS: PacketFieldDefinition[] = [
  {
    layer: "Data Link (Layer 2 - Ethernet II)",
    name: "Destination & Source MAC",
    description: "Standard 48-bit hardware Ethernet addresses of destination and transmitter.",
  },
  {
    layer: "IEEE 802.1Q Tag (4 Bytes)",
    name: "Tag Protocol Identifier (TPID: 0x8100)",
    description: "16-bit field set to 0x8100 identifying the frame as an IEEE 802.1Q tagged frame.",
  },
  {
    layer: "IEEE 802.1Q Tag (4 Bytes)",
    name: "Priority Code Point (PCP: 3 Bits)",
    description: "IEEE 802.1p Class of Service (CoS) priority (0 = Best Effort up to 7 = Network Control / Voice).",
  },
  {
    layer: "IEEE 802.1Q Tag (4 Bytes)",
    name: "Drop Eligible Indicator (DEI: 1 Bit)",
    description: "1-bit flag (formerly CFI) indicating whether the frame can be dropped during network congestion.",
  },
  {
    layer: "IEEE 802.1Q Tag (4 Bytes)",
    name: "VLAN Identifier (VID: 12 Bits)",
    description: "12-bit number identifying the specific VLAN (1 to 4,094) to which the frame belongs.",
  },
  {
    layer: "Data Link (Layer 2 - Payload Header)",
    name: "Original EtherType (0x0800 / 0x0806)",
    description: "Specifies payload protocol: 0x0800 for IPv4 Datagrams, 0x0806 for ARP messages.",
  },
];

export const vlanModule: ProtocolModule = {
  id: "vlan",
  name: "VLAN",
  category: "data-link",
  layer: "Data-Link (Layer 2)",
  summary:
    "Virtual Local Area Network (IEEE 802.1Q) — Logically partitions physical Layer 2 broadcast domains, multiplexes multi-VLAN traffic across 802.1Q Trunks, enforces Access/Trunk port boundaries, and enables Inter-VLAN routing via Router-on-a-Stick (ROAS) and Layer 3 Switch SVIs.",
  status: "implemented",
  learningObjectives: [
    "Understand Layer 2 broadcast domain isolation and PVID access port membership.",
    "Master the 4-byte IEEE 802.1Q Tag structure (TPID 0x8100, 3-bit PCP CoS, 1-bit DEI, 12-bit VID).",
    "Analyze Trunk port multiplexing, Tag Insertion, Egress Tag Stripping, and Trunk Allowed VLAN filtering.",
    "Explore Native VLAN untagged transit and evaluate Native VLAN mismatch security hazards.",
    "Compare Inter-VLAN Routing methods: Router-on-a-Stick (ROAS / 802.1Q sub-interfaces) vs Layer 3 Switch SVIs.",
    "Demonstrate Double Tagging VLAN Hopping attacks and implement enterprise trunk security hardening.",
    "Contrast IEEE 802.1Q VLANs with cloud-scale RFC 7348 VXLAN (24-bit VNI overlays).",
  ],
  simplificationNotes: [
    "Provides interactive real-time visual VLAN zones, animated 802.1Q tagged frame inspectors, live `show vlan brief` databases, and scenario toggles.",
  ],
  defaultTopology: {
    nodes: ACCESS_SWITCH_NODES.map((node) => ({
      id: node.id,
      type: (node.type === "attacker" ? "host" : node.type === "layer3-switch" ? "switch" : node.type) as "host" | "switch" | "router" | "server",
      label: node.label,
      position: node.position,
    })),
    edges: ACCESS_SWITCH_LINKS.map((link) => ({
      id: link.id,
      source: link.sourceNodeId,
      target: link.targetNodeId,
      cost: 1,
    })),
  },
  configurationSchema: vlanConfigSchema,
  defaultConfiguration: defaultVlanConfig as unknown as Record<string, unknown>,
  generateSimulation: generateVlanSimulation,
  packetFields: VLAN_PACKET_FIELDS,
  explanationSections: VLAN_EXPLANATION_SECTIONS,
};

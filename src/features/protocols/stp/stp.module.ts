import type {
  ProtocolModule,
  PacketFieldDefinition,
} from "@/features/protocols/shared/protocol-types";
import { stpConfigSchema } from "./stp.schema";
import { defaultStpConfig, TRIANGLE_SWITCHES, TRIANGLE_LINKS } from "./stp.defaults";
import { generateStpSimulation } from "./stp.simulator";
import { STP_EXPLANATION_SECTIONS } from "./stp.explanations";

const STP_PACKET_FIELDS: PacketFieldDefinition[] = [
  {
    layer: "Data Link (Layer 2 - IEEE 802.3 LLC)",
    name: "Destination MAC (01:80:C2:00:00:00)",
    description: "Standard IEEE Spanning Tree Bridge Group multicast destination address.",
  },
  {
    layer: "Data Link (Layer 2 - IEEE 802.3 LLC)",
    name: "LLC Control (0x424203)",
    description: "Logical Link Control header specifying Spanning Tree Protocol entity.",
  },
  {
    layer: "Protocol Control (BPDU Header)",
    name: "Protocol Identifier (0x0000)",
    description: "Always 0x0000 for IEEE 802.1D Spanning Tree Protocol.",
  },
  {
    layer: "Protocol Control (BPDU Header)",
    name: "Protocol Version (0 or 2)",
    description: "0 for IEEE 802.1D Classic STP, 2 for IEEE 802.1w Rapid STP (RSTP).",
  },
  {
    layer: "Protocol Control (BPDU Header)",
    name: "BPDU Type",
    description: "0x00 for Configuration BPDU, 0x80 for Topology Change Notification (TCN), 0x02 for RSTP.",
  },
  {
    layer: "BPDU Flags (1 Byte)",
    name: "BPDU Flags (TCA, Agr, Fwd, Lrn, Role, Prop, TC)",
    description: "8-bit flags encoding Topology Change, RSTP Port Role, and Proposal/Agreement state machine.",
  },
  {
    layer: "STP Vectors (8 Bytes)",
    name: "Root Bridge Identifier (Root BID)",
    description: "2-byte priority + 6-byte MAC address of the currently acknowledged Root Bridge.",
  },
  {
    layer: "STP Vectors (4 Bytes)",
    name: "Root Path Cost (RPC)",
    description: "Cumulative path cost from transmitting bridge to the Root Bridge.",
  },
  {
    layer: "STP Vectors (8 Bytes)",
    name: "Sender Bridge Identifier (Sender BID)",
    description: "Bridge ID of the switch that transmitted this specific BPDU frame.",
  },
  {
    layer: "STP Vectors (2 Bytes)",
    name: "Port Identifier (PID)",
    description: "Port Priority (default 128) + Port Number (e.g., 128.1 for Gi0/1).",
  },
  {
    layer: "STP Timers (2 Bytes each)",
    name: "Message Age, Max Age, Hello Time, Forward Delay",
    description: "Timers in 1/256ths of a second governing BPDU lifetime, timeout, and state transitions.",
  },
];

export const stpModule: ProtocolModule = {
  id: "stp",
  name: "STP",
  category: "data-link",
  layer: "Data-Link (Layer 2)",
  summary:
    "Spanning Tree Protocol (IEEE 802.1D / IEEE 802.1w RSTP) — Prevents bridging loops, executes Root Bridge election, computes Root Path Costs, designates Port Roles (RP/DP/AP), and provides rapid fault recovery.",
  status: "implemented",
  learningObjectives: [
    "Understand the complete Root Bridge election mechanism using 8-byte Bridge IDs (Priority + Extended System ID + MAC).",
    "Master the 4-step STP tie-breaking vector hierarchy (Lowest RPC -> Lowest Sender BID -> Lowest Sender PID -> Lowest Self PID).",
    "Inspect BPDU frame fields including LLC 0x424203, Type 0x00 / 0x80 / 0x02, and 8-bit flag status bits.",
    "Evaluate 802.1D port state progression (Blocking -> Listening 15s -> Learning 15s -> Forwarding) vs RSTP sub-second Proposal/Agreement sync.",
    "Analyze Topology Change Notifications (TCN), TC broadcast propagation, and MAC table aging timer reduction (300s -> 15s).",
    "Explore enterprise Layer 2 security mitigations including Root Guard, BPDU Guard, and PortFast / Edge Ports.",
  ],
  simplificationNotes: [
    "Provides real-time interactive switching loops, link cut simulations, step-by-step vector breakdowns, and RSTP sync demonstrations.",
  ],
  defaultTopology: {
    nodes: TRIANGLE_SWITCHES.map((sw) => ({
      id: sw.id,
      type: "switch" as const,
      label: sw.label,
      position: sw.position,
    })),
    edges: TRIANGLE_LINKS.map((link) => ({
      id: link.id,
      source: link.sourceSwitchId,
      target: link.targetSwitchId,
      cost: link.cost,
    })),
  },
  configurationSchema: stpConfigSchema,
  defaultConfiguration: defaultStpConfig as unknown as Record<string, unknown>,
  generateSimulation: generateStpSimulation,
  packetFields: STP_PACKET_FIELDS,
  explanationSections: STP_EXPLANATION_SECTIONS,
};

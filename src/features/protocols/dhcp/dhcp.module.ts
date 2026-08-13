import type { ProtocolModule } from "@/features/protocols/shared/protocol-types";
import { generateDhcpSimulation } from "./dhcp.simulator";
import { dhcpConfigSchema } from "./dhcp.schema";
import { defaultDhcpConfig, SIMPLE_LAN_NODES, SIMPLE_LAN_LINKS } from "./dhcp.defaults";
import { DHCP_EXPLANATION_SECTIONS } from "./dhcp.explanations";

export const dhcpModule: ProtocolModule = {
  id: "dhcp",
  name: "DHCP",
  category: "services",
  layer: "Application (Layer 7)",
  summary: "Dynamic Host Configuration Protocol — automatic IP address assignment, subnet masks, default gateways, and DNS servers via DORA handshake.",
  status: "implemented",
  learningObjectives: [
    "Understand the 4-step DORA handshake: DISCOVER, OFFER, REQUEST, ACK.",
    "Inspect the 8-state client finite state machine (INIT, SELECTING, REQUESTING, BOUND, RENEWING, REBINDING, RELEASE, DECLINE).",
    "Explore DHCP Options: Option 53 (Message Type), Option 1 (Subnet Mask), Option 3 (Router), Option 6 (DNS), Option 51 (Lease Time), and Option 82 (Relay Agent).",
    "Analyze lease timers: T1 Renewal (50%) and T2 Rebinding (87.5%).",
    "Examine network security challenges including DHCP pool exhaustion, IP address conflicts (DHCPDECLINE), and Rogue DHCP server mitigation (DHCP Snooping).",
  ],
  simplificationNotes: [
    "UDP port 67 (Server) and port 68 (Client) broadcast mechanics are simulated deterministically.",
    "ARP probes and Gratuitous ARP checks for conflict detection are integrated into the step sequence.",
  ],
  defaultTopology: {
    nodes: SIMPLE_LAN_NODES.map((n) => ({
      id: n.id,
      type: n.type === "server" ? "server" : n.type === "switch" ? "switch" : n.type === "relay" ? "router" : "host",
      label: n.name,
      position: n.position,
    })),
    edges: SIMPLE_LAN_LINKS.map((l) => ({ id: l.id, source: l.sourceNodeId, target: l.targetNodeId })),
  },
  configurationSchema: dhcpConfigSchema,
  defaultConfiguration: defaultDhcpConfig,
  generateSimulation: generateDhcpSimulation,
  packetFields: [
    { layer: "Application", name: "messageType", description: "DHCP message type (DISCOVER, OFFER, REQUEST, ACK, NAK, DECLINE)" },
    { layer: "Application", name: "xid", description: "Random transaction ID to match requests and responses" },
    { layer: "Application", name: "ciaddr", description: "Client IP address (used during renewal)" },
    { layer: "Application", name: "yiaddr", description: "Offered client IP address" },
    { layer: "Application", name: "siaddr", description: "Next server IP address" },
    { layer: "Application", name: "chaddr", description: "Client MAC address" },
  ],
  explanationSections: DHCP_EXPLANATION_SECTIONS,
};

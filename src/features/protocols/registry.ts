import type { ProtocolModule } from "@/features/protocols/shared/protocol-types";
import { tcpModule } from "./tcp/tcp.module";
import { udpModule } from "./udp/udp.module";

const plannedProtocols: Omit<ProtocolModule, "generateSimulation" | "configurationSchema" | "defaultConfiguration" | "defaultTopology" | "packetFields" | "explanationSections">[] = [
  { id: "icmp", name: "ICMP", category: "network", layer: "Network (Layer 3)", summary: "Internet Control Message Protocol — diagnostics and error reporting.", status: "planned", learningObjectives: [], simplificationNotes: [] },
  { id: "arp", name: "ARP", category: "data-link", layer: "Data-Link (Layer 2)", summary: "Address Resolution Protocol — maps IP to MAC addresses.", status: "planned", learningObjectives: [], simplificationNotes: [] },
  { id: "dhcp", name: "DHCP", category: "services", layer: "Application (Layer 7)", summary: "Dynamic Host Configuration Protocol — automatic IP assignment.", status: "planned", learningObjectives: [], simplificationNotes: [] },
  { id: "dns", name: "DNS", category: "services", layer: "Application (Layer 7)", summary: "Domain Name System — hostname to IP resolution.", status: "planned", learningObjectives: [], simplificationNotes: [] },
  { id: "http", name: "HTTP/HTTPS", category: "application", layer: "Application (Layer 7)", summary: "Hypertext Transfer Protocol — web communication.", status: "planned", learningObjectives: [], simplificationNotes: [] },
  { id: "tls", name: "TLS", category: "security", layer: "Application (Layer 7)", summary: "Transport Layer Security — encrypted communication.", status: "planned", learningObjectives: [], simplificationNotes: [] },
  { id: "ipv4", name: "IPv4", category: "network", layer: "Network (Layer 3)", summary: "Internet Protocol version 4 — packet forwarding and addressing.", status: "planned", learningObjectives: [], simplificationNotes: [] },
  { id: "ipv6", name: "IPv6", category: "network", layer: "Network (Layer 3)", summary: "Internet Protocol version 6 — next-generation addressing.", status: "planned", learningObjectives: [], simplificationNotes: [] },
  { id: "nat", name: "NAT", category: "network", layer: "Network (Layer 3)", summary: "Network Address Translation — private to public address mapping.", status: "planned", learningObjectives: [], simplificationNotes: [] },
  { id: "vlan", name: "VLAN", category: "data-link", layer: "Data-Link (Layer 2)", summary: "Virtual LAN — logical network segmentation.", status: "planned", learningObjectives: [], simplificationNotes: [] },
  { id: "stp", name: "STP", category: "data-link", layer: "Data-Link (Layer 2)", summary: "Spanning Tree Protocol — loop-free switching.", status: "planned", learningObjectives: [], simplificationNotes: [] },
  { id: "ospf", name: "OSPF", category: "routing", layer: "Network (Layer 3)", summary: "Open Shortest Path First — link-state routing.", status: "planned", learningObjectives: [], simplificationNotes: [] },
  { id: "bgp", name: "BGP", category: "routing", layer: "Network (Layer 3)", summary: "Border Gateway Protocol — inter-domain routing.", status: "planned", learningObjectives: [], simplificationNotes: [] },
  { id: "rip", name: "RIP", category: "routing", layer: "Network (Layer 3)", summary: "Routing Information Protocol — distance-vector routing.", status: "planned", learningObjectives: [], simplificationNotes: [] },
  { id: "isis", name: "IS-IS", category: "routing", layer: "Network (Layer 3)", summary: "Intermediate System to Intermediate System routing.", status: "planned", learningObjectives: [], simplificationNotes: [] },
  { id: "mpls", name: "MPLS", category: "network", layer: "Network (Layer 2.5)", summary: "Multiprotocol Label Switching.", status: "planned", learningObjectives: [], simplificationNotes: [] },
  { id: "quic", name: "QUIC", category: "transport", layer: "Transport (Layer 4)", summary: "Quick UDP Internet Connections.", status: "planned", learningObjectives: [], simplificationNotes: [] },
];

function createPlaceholderModule(
  meta: (typeof plannedProtocols)[0]
): ProtocolModule {
  return {
    ...meta,
    defaultTopology: { nodes: [], edges: [] },
    configurationSchema: {} as ProtocolModule["configurationSchema"],
    defaultConfiguration: {},
    generateSimulation: () => ({ events: [], packets: [] }),
    packetFields: [],
    explanationSections: [],
  };
}

const implementedModules: ProtocolModule[] = [tcpModule, udpModule];
const placeholderModules: ProtocolModule[] = plannedProtocols.map(createPlaceholderModule);

const allModules: ProtocolModule[] = [...implementedModules, ...placeholderModules];

export function getProtocol(id: string): ProtocolModule | undefined {
  return allModules.find((p) => p.id === id);
}

export function getAllProtocols(): ProtocolModule[] {
  return allModules;
}

export function getImplementedProtocols(): ProtocolModule[] {
  return implementedModules;
}

export function getProtocolsByCategory(category: string): ProtocolModule[] {
  return allModules.filter((p) => p.category === category);
}

export { allModules as protocolRegistry };

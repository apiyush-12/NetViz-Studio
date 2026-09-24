import type { ProtocolModule } from "@/features/protocols/shared/protocol-types";
import { tcpModule } from "./tcp/tcp.module";
import { udpModule } from "./udp/udp.module";
import { ospfModule } from "./ospf/ospf.module";
import { bgpModule } from "./bgp/bgp.module";
import { dhcpModule } from "./dhcp/dhcp.module";
import { dnsModule } from "./dns/dns.module";
import { httpModule } from "./http/http.module";
import { natModule } from "./nat/nat.module";
import { ipv4Module } from "./ipv4/ipv4.module";
import { ipv6Module } from "./ipv6/ipv6.module";
import { stpModule } from "./stp/stp.module";
import { arpModule } from "./arp/arp.module";
import { vlanModule } from "./vlan/vlan.module";
import { mplsModule } from "./mpls/mpls.module";

const plannedProtocols: Omit<ProtocolModule, "generateSimulation" | "configurationSchema" | "defaultConfiguration" | "defaultTopology" | "packetFields" | "explanationSections">[] = [
  { id: "icmp", name: "ICMP", category: "network", layer: "Network (Layer 3)", summary: "Internet Control Message Protocol — diagnostics and error reporting.", status: "planned", learningObjectives: [], simplificationNotes: [] },
  { id: "tls", name: "TLS", category: "security", layer: "Application (Layer 7)", summary: "Transport Layer Security — encrypted communication.", status: "planned", learningObjectives: [], simplificationNotes: [] },
  { id: "rip", name: "RIP", category: "routing", layer: "Network (Layer 3)", summary: "Routing Information Protocol — distance-vector routing.", status: "planned", learningObjectives: [], simplificationNotes: [] },
  { id: "isis", name: "IS-IS", category: "routing", layer: "Network (Layer 3)", summary: "Intermediate System to Intermediate System routing.", status: "planned", learningObjectives: [], simplificationNotes: [] },
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

const implementedModules: ProtocolModule[] = [
  tcpModule,
  udpModule,
  ospfModule,
  bgpModule,
  dhcpModule,
  dnsModule,
  httpModule,
  natModule,
  ipv4Module,
  ipv6Module,
  stpModule,
  arpModule,
  vlanModule,
  mplsModule,
];

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

import type { ProtocolModule } from "@/features/protocols/shared/protocol-types";
import { getAllProtocols } from "@/features/protocols/registry";

export interface ProtocolCatalogEntry {
  id: string;
  name: string;
  category: ProtocolModule["category"];
  status: ProtocolModule["status"];
  summary: string;
}

export const protocolCatalog: ProtocolCatalogEntry[] = getAllProtocols().map((p) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  status: p.status,
  summary: p.summary,
}));

export const featuredLabs = [
  { id: "tcp-vs-udp", title: "Compare TCP and UDP", phase: 3 },
  { id: "tcp-retransmit", title: "TCP Retransmission on Packet Loss", phase: 3 },
  { id: "arp-resolve", title: "Resolve IP with ARP", phase: 3 },
  { id: "cidr-subnet", title: "Calculate a /27 Subnet", phase: 3 },
  { id: "ospf-cost", title: "Change OSPF Cost", phase: 3 },
];

export const platformStats = {
  protocolsTotal: protocolCatalog.length,
  implemented: protocolCatalog.filter((p) => p.status === "implemented").length,
  labsAvailable: 0,
  simulationsRun: 0,
};

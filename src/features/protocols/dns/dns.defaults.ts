import type { TopologyDefinition } from "@/features/simulation/simulation-types";
import type { DnsNode, DnsLink, DnsConfig } from "./dns.types";

// =========================================================================
// 1. FULL ITERATIVE HIERARCHY TOPOLOGY (Root → TLD → Authoritative)
// =========================================================================
export const HIERARCHY_NODES: DnsNode[] = [
  {
    id: "client-1",
    name: "Client Resolver (PC-1)",
    type: "client",
    ipAddress: "192.168.1.105",
    records: [],
    position: { x: 80, y: 280 },
    enabled: true,
  },
  {
    id: "resolver-1",
    name: "Recursive Resolver (8.8.8.8)",
    type: "resolver",
    ipAddress: "8.8.8.8",
    records: [],
    position: { x: 230, y: 280 },
    enabled: true,
  },
  {
    id: "root-server",
    name: "Root Nameserver (a.root-servers.net)",
    type: "root-server",
    zone: ".",
    ipAddress: "198.41.0.4",
    records: [
      { id: "rec-root-com", name: "com.", type: "NS", value: "a.gtld-servers.net", ttl: 172800, section: "authority" },
      { id: "rec-glue-tld", name: "a.gtld-servers.net", type: "A", value: "192.5.6.30", ttl: 172800, section: "additional" },
    ],
    position: { x: 380, y: 130 },
    enabled: true,
  },
  {
    id: "tld-server",
    name: "TLD Nameserver (.com)",
    type: "tld-server",
    zone: ".com",
    ipAddress: "192.5.6.30",
    records: [
      { id: "rec-tld-example", name: "example.com.", type: "NS", value: "ns1.example.com", ttl: 86400, section: "authority" },
      { id: "rec-glue-auth", name: "ns1.example.com", type: "A", value: "93.184.216.1", ttl: 86400, section: "additional" },
    ],
    position: { x: 490, y: 280 },
    enabled: true,
  },
  {
    id: "auth-server",
    name: "Auth Server (ns1.example.com)",
    type: "authoritative-server",
    zone: "example.com",
    ipAddress: "93.184.216.1",
    records: [
      { id: "rec-a-www", name: "www.example.com", type: "A", value: "93.184.216.34", ttl: 3600, section: "answer" },
      { id: "rec-aaaa-www", name: "www.example.com", type: "AAAA", value: "2606:2800:220:1:248:1893:25c8:1946", ttl: 3600, section: "answer" },
      { id: "rec-mx-mail", name: "example.com", type: "MX", value: "mail.example.com", priority: 10, ttl: 3600, section: "answer" },
      { id: "rec-txt-spf", name: "example.com", type: "TXT", value: "v=spf1 include:_spf.example.com ~all", ttl: 3600, section: "answer" },
    ],
    position: { x: 380, y: 430 },
    enabled: true,
  },
];

export const HIERARCHY_LINKS: DnsLink[] = [
  { id: "link-client-resolver", sourceNodeId: "client-1", targetNodeId: "resolver-1", enabled: true, status: "up" },
  { id: "link-resolver-root", sourceNodeId: "resolver-1", targetNodeId: "root-server", enabled: true, status: "up" },
  { id: "link-resolver-tld", sourceNodeId: "resolver-1", targetNodeId: "tld-server", enabled: true, status: "up" },
  { id: "link-resolver-auth", sourceNodeId: "resolver-1", targetNodeId: "auth-server", enabled: true, status: "up" },
];

// =========================================================================
// 2. RECURSIVE CACHING (Cache HIT vs MISS)
// =========================================================================
export const CACHING_NODES: DnsNode[] = [
  { id: "client-1", name: "Client PC-1", type: "client", ipAddress: "192.168.1.105", records: [], position: { x: 100, y: 280 }, enabled: true },
  { id: "resolver-1", name: "Local DNS Resolver (Cache)", type: "resolver", ipAddress: "192.168.1.1", records: [], position: { x: 280, y: 280 }, enabled: true },
  {
    id: "auth-server",
    name: "Authoritative Server (ns1.example.com)",
    type: "authoritative-server",
    zone: "example.com",
    ipAddress: "93.184.216.1",
    records: [
      { id: "rec-a-www", name: "www.example.com", type: "A", value: "93.184.216.34", ttl: 3600, section: "answer" },
    ],
    position: { x: 460, y: 280 },
    enabled: true,
  },
];

export const CACHING_LINKS: DnsLink[] = [
  { id: "link-client-resolver", sourceNodeId: "client-1", targetNodeId: "resolver-1", enabled: true, status: "up" },
  { id: "link-resolver-auth", sourceNodeId: "resolver-1", targetNodeId: "auth-server", enabled: true, status: "up" },
];

// =========================================================================
// 3. CNAME ALIAS CHAIN (store.example.com → cdn.shop.net → IP)
// =========================================================================
export const CNAME_CHAIN_NODES: DnsNode[] = [
  { id: "client-1", name: "Client PC-1", type: "client", ipAddress: "192.168.1.105", records: [], position: { x: 80, y: 280 }, enabled: true },
  { id: "resolver-1", name: "Recursive Resolver", type: "resolver", ipAddress: "8.8.8.8", records: [], position: { x: 220, y: 280 }, enabled: true },
  {
    id: "auth-server-1",
    name: "Example DNS (ns1.example.com)",
    type: "authoritative-server",
    zone: "example.com",
    ipAddress: "93.184.216.1",
    records: [
      { id: "rec-cname-store", name: "store.example.com", type: "CNAME", value: "cdn.shopcloud.net", ttl: 300, section: "answer" },
    ],
    position: { x: 390, y: 170 },
    enabled: true,
  },
  {
    id: "auth-server-2",
    name: "CDN DNS (ns1.shopcloud.net)",
    type: "authoritative-server",
    zone: "shopcloud.net",
    ipAddress: "198.51.100.1",
    records: [
      { id: "rec-a-cdn", name: "cdn.shopcloud.net", type: "A", value: "198.51.100.42", ttl: 60, section: "answer" },
    ],
    position: { x: 390, y: 390 },
    enabled: true,
  },
];

export const CNAME_CHAIN_LINKS: DnsLink[] = [
  { id: "link-client-resolver", sourceNodeId: "client-1", targetNodeId: "resolver-1", enabled: true, status: "up" },
  { id: "link-resolver-auth1", sourceNodeId: "resolver-1", targetNodeId: "auth-server-1", enabled: true, status: "up" },
  { id: "link-resolver-auth2", sourceNodeId: "resolver-1", targetNodeId: "auth-server-2", enabled: true, status: "up" },
];

// =========================================================================
// 4. SPLIT-BRAIN DNS (Internal vs External Views)
// =========================================================================
export const SPLIT_BRAIN_NODES: DnsNode[] = [
  { id: "client-internal", name: "Internal Corp PC", type: "client", ipAddress: "10.0.1.50", records: [], position: { x: 100, y: 170 }, enabled: true },
  { id: "client-external", name: "External Internet User", type: "client", ipAddress: "198.51.100.99", records: [], position: { x: 100, y: 390 }, enabled: true },
  {
    id: "resolver-internal",
    name: "Internal DNS Resolver",
    type: "resolver",
    ipAddress: "10.0.1.2",
    records: [
      { id: "rec-a-int", name: "portal.corp.com", type: "A", value: "10.0.1.5 (Private IP)", ttl: 300, section: "answer" },
    ],
    position: { x: 360, y: 170 },
    enabled: true,
  },
  {
    id: "resolver-external",
    name: "Public Authoritative DNS",
    type: "authoritative-server",
    ipAddress: "203.0.113.1",
    records: [
      { id: "rec-a-ext", name: "portal.corp.com", type: "A", value: "203.0.113.5 (Public IP)", ttl: 300, section: "answer" },
    ],
    position: { x: 360, y: 390 },
    enabled: true,
  },
];

export const SPLIT_BRAIN_LINKS: DnsLink[] = [
  { id: "link-int-resolver", sourceNodeId: "client-internal", targetNodeId: "resolver-internal", enabled: true, status: "up" },
  { id: "link-ext-resolver", sourceNodeId: "client-external", targetNodeId: "resolver-external", enabled: true, status: "up" },
];

export const defaultDnsConfig: DnsConfig = {
  topologyPreset: "iterative-hierarchy",
  queryHostname: "www.example.com",
  queryType: "A",
  enableCache: true,
  labelMode: "simple",
  failureScenario: "none",
};

export function getDnsPresetData(preset: string = "iterative-hierarchy"): {
  nodes: DnsNode[];
  links: DnsLink[];
  topology: TopologyDefinition;
} {
  switch (preset) {
    case "recursive-caching":
      return {
        nodes: JSON.parse(JSON.stringify(CACHING_NODES)),
        links: JSON.parse(JSON.stringify(CACHING_LINKS)),
        topology: {
          nodes: CACHING_NODES.map((n) => ({
            id: n.id,
            type: n.type === "client" ? "host" : "server",
            label: n.name,
            position: n.position,
          })),
          edges: CACHING_LINKS.map((l) => ({ id: l.id, source: l.sourceNodeId, target: l.targetNodeId })),
        },
      };
    case "cname-chain":
      return {
        nodes: JSON.parse(JSON.stringify(CNAME_CHAIN_NODES)),
        links: JSON.parse(JSON.stringify(CNAME_CHAIN_LINKS)),
        topology: {
          nodes: CNAME_CHAIN_NODES.map((n) => ({
            id: n.id,
            type: n.type === "client" ? "host" : "server",
            label: n.name,
            position: n.position,
          })),
          edges: CNAME_CHAIN_LINKS.map((l) => ({ id: l.id, source: l.sourceNodeId, target: l.targetNodeId })),
        },
      };
    case "split-brain-lan":
      return {
        nodes: JSON.parse(JSON.stringify(SPLIT_BRAIN_NODES)),
        links: JSON.parse(JSON.stringify(SPLIT_BRAIN_LINKS)),
        topology: {
          nodes: SPLIT_BRAIN_NODES.map((n) => ({
            id: n.id,
            type: n.type === "client" ? "host" : "server",
            label: n.name,
            position: n.position,
          })),
          edges: SPLIT_BRAIN_LINKS.map((l) => ({ id: l.id, source: l.sourceNodeId, target: l.targetNodeId })),
        },
      };
    case "iterative-hierarchy":
    default:
      return {
        nodes: JSON.parse(JSON.stringify(HIERARCHY_NODES)),
        links: JSON.parse(JSON.stringify(HIERARCHY_LINKS)),
        topology: {
          nodes: HIERARCHY_NODES.map((n) => ({
            id: n.id,
            type: n.type === "client" ? "host" : "server",
            label: n.name,
            position: n.position,
          })),
          edges: HIERARCHY_LINKS.map((l) => ({ id: l.id, source: l.sourceNodeId, target: l.targetNodeId })),
        },
      };
  }
}

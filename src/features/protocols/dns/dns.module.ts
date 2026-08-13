import type { ProtocolModule } from "@/features/protocols/shared/protocol-types";
import { generateDnsSimulation } from "./dns.simulator";
import { dnsConfigSchema } from "./dns.schema";
import { defaultDnsConfig, HIERARCHY_NODES, HIERARCHY_LINKS } from "./dns.defaults";
import { DNS_EXPLANATION_SECTIONS } from "./dns.explanations";

export const dnsModule: ProtocolModule = {
  id: "dns",
  name: "DNS",
  category: "services",
  layer: "Application (Layer 7)",
  summary: "Domain Name System — hierarchical hostname-to-IP resolution across Root, TLD, and Authoritative nameservers with TTL caching.",
  status: "implemented",
  learningObjectives: [
    "Understand Recursive vs Iterative DNS resolution traversal.",
    "Explore the DNS hierarchy: Root Servers (.), TLD Servers (.com), and Authoritative Nameservers.",
    "Inspect Resource Record types: A, AAAA, CNAME aliases, MX mail servers, NS delegations, TXT verification, and SOA records.",
    "Analyze resolver caching mechanics and TTL (Time-To-Live) expiration countdowns.",
    "Evaluate DNS response codes (RCODEs) including NOERROR, NXDOMAIN (Non-Existent Domain), and SERVFAIL.",
  ],
  simplificationNotes: [
    "UDP port 53 packet flows are simulated with standard DNS query/response formats and EDNS0 headers.",
  ],
  defaultTopology: {
    nodes: HIERARCHY_NODES.map((n) => ({
      id: n.id,
      type: n.type === "client" ? "host" : "server",
      label: n.name,
      position: n.position,
    })),
    edges: HIERARCHY_LINKS.map((l) => ({ id: l.id, source: l.sourceNodeId, target: l.targetNodeId })),
  },
  configurationSchema: dnsConfigSchema,
  defaultConfiguration: defaultDnsConfig,
  generateSimulation: generateDnsSimulation,
  packetFields: [
    { layer: "Application", name: "queryHostname", description: "Fully Qualified Domain Name (FQDN) being looked up" },
    { layer: "Application", name: "queryType", description: "Record type requested (A, AAAA, CNAME, MX, TXT, NS)" },
    { layer: "Application", name: "rcode", description: "DNS return code (NOERROR, NXDOMAIN, SERVFAIL)" },
    { layer: "Application", name: "flags", description: "QR, AA (Authoritative), RD (Recursion Desired), RA (Recursion Available)" },
  ],
  explanationSections: DNS_EXPLANATION_SECTIONS,
};

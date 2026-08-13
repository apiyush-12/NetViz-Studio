import type { DnsNode, DnsResourceRecord } from "./dns.types";

export interface DnsValidationError {
  id: string;
  severity: "error" | "warning" | "info";
  title: string;
  message: string;
  recommendation: string;
}

export function validateDnsConfiguration(
  nodes: DnsNode[],
  queryHostname?: string,
  resolvedRecords?: DnsResourceRecord[]
): DnsValidationError[] {
  const errors: DnsValidationError[] = [];

  // Check 1: Resolver node presence
  const resolver = nodes.find((n) => n.type === "resolver" && n.enabled);
  if (!resolver) {
    errors.push({
      id: "no-resolver",
      severity: "error",
      title: "No Active Recursive Resolver",
      message: "No enabled DNS recursive resolver found to process client queries.",
      recommendation: "Enable a local resolver (e.g. 192.168.1.1) or public recursive resolver (e.g. 8.8.8.8).",
    });
  }

  // Check 2: Authoritative server presence
  const authServers = nodes.filter((n) => n.type === "authoritative-server" && n.enabled);
  if (authServers.length === 0) {
    errors.push({
      id: "no-auth-server",
      severity: "warning",
      title: "No Authoritative Nameserver",
      message: "Network contains no authoritative nameserver hosting domain zone files.",
      recommendation: "Configure authoritative nameservers for the domain zone.",
    });
  }

  // Check 3: Query hostname validity
  if (queryHostname && !queryHostname.includes(".")) {
    errors.push({
      id: "unqualified-hostname",
      severity: "info",
      title: "Unqualified Domain Name",
      message: `Query "${queryHostname}" is a single-label domain without a TLD.`,
      recommendation: "Use a Fully Qualified Domain Name (FQDN) like example.com or app.internal.net.",
    });
  }

  // Check 4: Unresolved records notice
  if (queryHostname && resolvedRecords && resolvedRecords.length === 0) {
    errors.push({
      id: "unresolved-domain",
      severity: "warning",
      title: "Unresolved DNS Query",
      message: `No active resource records matched query hostname "${queryHostname}".`,
      recommendation: "Verify that authoritative nameservers host valid A, AAAA, or CNAME records for this zone.",
    });
  }

  // Check 3: CNAME apex conflict check
  const allRecords = nodes.flatMap((n) => n.records);
  const cnameRecords = allRecords.filter((r) => r.type === "CNAME");
  for (const cname of cnameRecords) {
    const conflicting = allRecords.filter(
      (r) => r.name.toLowerCase() === cname.name.toLowerCase() && r.type !== "CNAME"
    );
    if (conflicting.length > 0) {
      errors.push({
        id: `cname-conflict-${cname.id}`,
        severity: "error",
        title: `CNAME Co-existence Violation (${cname.name})`,
        message: `Domain '${cname.name}' has both a CNAME record and other record types (${conflicting.map((c) => c.type).join(", ")}).`,
        recommendation: "RFC 1034 §3.6.2 prohibits CNAME records from co-existing with other data at the same node label.",
      });
    }
  }

  return errors;
}

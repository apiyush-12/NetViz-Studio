import type {
  DnsNode,
  DnsRecordType,
  DnsResourceRecord,
  DnsResolutionStep,
  DnsRcode,
  DnsHeaderFlags,
} from "./dns.types";

export interface DnsResolutionOutcome {
  success: boolean;
  rcode: DnsRcode;
  resolvedRecords: DnsResourceRecord[];
  steps: DnsResolutionStep[];
  flags: DnsHeaderFlags;
  isCacheHit: boolean;
}

export function performDnsResolution(
  queryHostname: string,
  queryType: DnsRecordType,
  nodes: DnsNode[],
  isCached: boolean = false,
  cachedRecord?: DnsResourceRecord,
  failureScenario: string = "none"
): DnsResolutionOutcome {
  const steps: DnsResolutionStep[] = [];
  const normalizedQuery = queryHostname.trim().toLowerCase();

  // 1. CACHE HIT SCENARIO
  if (isCached && cachedRecord) {
    steps.push({
      stepIndex: 1,
      fromNodeId: "client-1",
      toNodeId: "resolver-1",
      queryType,
      targetDomain: normalizedQuery,
      responseType: "CACHE_HIT",
      resolvedValue: cachedRecord.value,
      description: `Resolver cache hit for '${normalizedQuery}' → ${cachedRecord.type} ${cachedRecord.value} (0ms network delay).`,
    });

    return {
      success: true,
      rcode: "NOERROR",
      resolvedRecords: [cachedRecord],
      steps,
      flags: { qr: true, opcode: 0, aa: false, tc: false, rd: true, ra: true, rcode: "NOERROR" },
      isCacheHit: true,
    };
  }

  // 2. TIMEOUT / SERVFAIL SCENARIO
  if (failureScenario === "authoritative_timeout_servfail") {
    steps.push(
      { stepIndex: 1, fromNodeId: "client-1", toNodeId: "resolver-1", queryType, targetDomain: normalizedQuery, responseType: "REFERRAL", description: `Client sends recursive query for '${normalizedQuery}' to local resolver.` },
      { stepIndex: 2, fromNodeId: "resolver-1", toNodeId: "auth-server", queryType, targetDomain: normalizedQuery, responseType: "SERVFAIL", description: "Authoritative server unresponsive (UDP packet timeout); resolver returns SERVFAIL." }
    );

    return {
      success: false,
      rcode: "SERVFAIL",
      resolvedRecords: [],
      steps,
      flags: { qr: true, opcode: 0, aa: false, tc: false, rd: true, ra: true, rcode: "SERVFAIL" },
      isCacheHit: false,
    };
  }

  // 3. NXDOMAIN SCENARIO
  if (failureScenario === "nxdomain_not_found" || normalizedQuery.includes("unknown") || normalizedQuery.includes("invalid")) {
    steps.push(
      { stepIndex: 1, fromNodeId: "client-1", toNodeId: "resolver-1", queryType, targetDomain: normalizedQuery, responseType: "REFERRAL", description: `Client requests '${normalizedQuery}' from resolver.` },
      { stepIndex: 2, fromNodeId: "resolver-1", toNodeId: "root-server", queryType, targetDomain: normalizedQuery, responseType: "REFERRAL", description: "Root nameserver provides referral to .com TLD nameserver." },
      { stepIndex: 3, fromNodeId: "resolver-1", toNodeId: "tld-server", queryType, targetDomain: normalizedQuery, responseType: "NXDOMAIN", description: `TLD Server responds with NXDOMAIN: '${normalizedQuery}' is not registered.` }
    );

    return {
      success: false,
      rcode: "NXDOMAIN",
      resolvedRecords: [],
      steps,
      flags: { qr: true, opcode: 0, aa: true, tc: false, rd: true, ra: true, rcode: "NXDOMAIN" },
      isCacheHit: false,
    };
  }

  // 4. CNAME ALIAS SCENARIO
  if (failureScenario === "cname_resolution" || normalizedQuery.includes("store.example.com")) {
    const cnameRecord: DnsResourceRecord = {
      id: "rec-cname-1",
      name: "store.example.com",
      type: "CNAME",
      value: "cdn.shopcloud.net",
      ttl: 300,
      section: "answer",
    };
    const cdnARecord: DnsResourceRecord = {
      id: "rec-a-cdn",
      name: "cdn.shopcloud.net",
      type: "A",
      value: "198.51.100.42",
      ttl: 60,
      section: "answer",
    };

    steps.push(
      { stepIndex: 1, fromNodeId: "client-1", toNodeId: "resolver-1", queryType: "A", targetDomain: "store.example.com", responseType: "REFERRAL", description: "Client queries A record for store.example.com." },
      { stepIndex: 2, fromNodeId: "resolver-1", toNodeId: "auth-server-1", queryType: "A", targetDomain: "store.example.com", responseType: "CNAME_ALIAS", resolvedValue: "cdn.shopcloud.net", description: "Authoritative server returns CNAME alias → cdn.shopcloud.net." },
      { stepIndex: 3, fromNodeId: "resolver-1", toNodeId: "auth-server-2", queryType: "A", targetDomain: "cdn.shopcloud.net", responseType: "ANSWER", resolvedValue: "198.51.100.42", description: "CDN nameserver resolves cdn.shopcloud.net → A 198.51.100.42." }
    );

    return {
      success: true,
      rcode: "NOERROR",
      resolvedRecords: [cnameRecord, cdnARecord],
      steps,
      flags: { qr: true, opcode: 0, aa: true, tc: false, rd: true, ra: true, rcode: "NOERROR" },
      isCacheHit: false,
    };
  }

  // 5. STANDARD ITERATIVE HIERARCHY RESOLUTION
  const authServer = nodes.find((n) => n.type === "authoritative-server") ?? nodes[nodes.length - 1];
  const matchingRecords = authServer.records.filter(
    (r) => r.name.toLowerCase() === normalizedQuery && (r.type === queryType || queryType === "A")
  );

  const finalRecords: DnsResourceRecord[] = matchingRecords.length > 0
    ? matchingRecords
    : [
        {
          id: "rec-dynamic-a",
          name: normalizedQuery,
          type: queryType,
          value: queryType === "AAAA" ? "2606:2800:220:1:248:1893:25c8:1946" : queryType === "MX" ? "mail.example.com" : "93.184.216.34",
          ttl: 3600,
          section: "answer",
        },
      ];

  if (nodes.some((n) => n.type === "root-server")) {
    steps.push(
      { stepIndex: 1, fromNodeId: "client-1", toNodeId: "resolver-1", queryType, targetDomain: normalizedQuery, responseType: "REFERRAL", description: `Client PC sends recursive query for '${normalizedQuery}' (Type: ${queryType}) to Local Resolver.` },
      { stepIndex: 2, fromNodeId: "resolver-1", toNodeId: "root-server", queryType, targetDomain: normalizedQuery, responseType: "REFERRAL", description: "Root Server (.) returns referral to .com TLD Nameserver (a.gtld-servers.net)." },
      { stepIndex: 3, fromNodeId: "resolver-1", toNodeId: "tld-server", queryType, targetDomain: normalizedQuery, responseType: "REFERRAL", description: "TLD Server (.com) returns NS delegation to authoritative server ns1.example.com." },
      { stepIndex: 4, fromNodeId: "resolver-1", toNodeId: "auth-server", queryType, targetDomain: normalizedQuery, responseType: "ANSWER", resolvedValue: finalRecords[0].value, description: `Authoritative Server (ns1.example.com) returns Authoritative Answer: ${finalRecords[0].type} ${finalRecords[0].value}.` }
    );
  } else {
    steps.push(
      { stepIndex: 1, fromNodeId: "client-1", toNodeId: "resolver-1", queryType, targetDomain: normalizedQuery, responseType: "REFERRAL", description: `Client requests '${normalizedQuery}' from resolver.` },
      { stepIndex: 2, fromNodeId: "resolver-1", toNodeId: "auth-server", queryType, targetDomain: normalizedQuery, responseType: "ANSWER", resolvedValue: finalRecords[0].value, description: `Authoritative server replies with ${finalRecords[0].type} ${finalRecords[0].value}.` }
    );
  }

  return {
    success: true,
    rcode: "NOERROR",
    resolvedRecords: finalRecords,
    steps,
    flags: { qr: true, opcode: 0, aa: true, tc: false, rd: true, ra: true, rcode: "NOERROR" },
    isCacheHit: false,
  };
}

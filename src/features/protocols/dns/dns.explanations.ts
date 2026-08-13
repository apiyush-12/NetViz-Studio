import type { ExplanationSection } from "@/features/protocols/shared/protocol-types";

export interface DnsExplanation {
  title: string;
  summary: string;
  rfcReference: string;
  technicalDetails: string[];
  troubleshootingTips: string[];
}

export const DNS_EXPLANATION_SECTIONS: ExplanationSection[] = [
  {
    eventType: "packet-sent",
    beginner: {
      whatHappened: "A DNS query was sent to resolve a domain name into an IP address.",
      whyItHappened: "Applications use human-readable hostnames (e.g. www.example.com), but network routing requires IP addresses.",
      protocolRule: "RFC 1035: Standard DNS queries use UDP port 53 with Question section specifying Name, Type (A/AAAA), and Class (IN).",
      fieldsChanged: ["queryQueue", "txPackets"],
      whatHappensNext: "The nameserver checks its local cache or zone records and returns an answer or referral.",
      misconception: "DNS does not just return IPv4; it supports IPv6 (AAAA), mail routing (MX), and aliases (CNAME).",
      realWorldUse: "Every web page load, API call, and email delivery starts with one or more DNS queries.",
    },
    advanced: {
      whatHappened: "DNS PDU sent over UDP port 53 with recursion desired (RD=1) flag.",
      whyItHappened: "Client stub resolver invoking local recursive resolver for domain resolution.",
      protocolRule: "RFC 1035 Section 4.1.1: 16-bit Header ID, Flags (QR, Opcode, AA, TC, RD, RA, RCODE), Question Count.",
      fieldsChanged: ["dns.header.id", "dns.question.name", "dns.question.type"],
      whatHappensNext: "Resolver performs iterative traversal from Root (.) -> TLD (.com) -> Authoritative.",
      misconception: "Recursive resolvers do the heavy lifting of traversing the hierarchy; clients only send a single recursive query.",
      realWorldUse: "Anycast recursive resolvers like 8.8.8.8 and 1.1.1.1 handle trillions of daily global queries with low latency.",
    },
  },
  {
    eventType: "route-calculated",
    beginner: {
      whatHappened: "DNS name resolution completed successfully (RCODE: NOERROR).",
      whyItHappened: "The authoritative server or local cache returned the matching Resource Record.",
      protocolRule: "RFC 1035: Answers include TTL parameter defining how long resolvers may cache the response.",
      fieldsChanged: ["resolvedIp", "cacheRecord"],
      whatHappensNext: "The client establishes a TCP/TLS connection to the resolved destination IP.",
      misconception: "A DNS response with multiple A records allows the client to load-balance or failover automatically.",
      realWorldUse: "Powers global CDNs (Cloudflare, Akamai, Fastly) using GeoDNS and latency-based routing.",
    },
    advanced: {
      whatHappened: "Answer section populated with Authoritative or Non-Authoritative Resource Records (RRs).",
      whyItHappened: "Successful traversal down delegation hierarchy or cache hit.",
      protocolRule: "RFC 1034 Section 3.6: RR structure contains NAME, TYPE, CLASS, TTL, RDLENGTH, RDATA.",
      fieldsChanged: ["dns.answer.count", "dns.answer.rdata", "dns.flags.aa"],
      whatHappensNext: "Resolver commits entry into local cache with TTL countdown timer.",
      misconception: "TTL countdown happens dynamically; cached responses decrement TTL until reaching 0 for eviction.",
      realWorldUse: "Low TTLs (60s) allow rapid IP failover; higher TTLs (86400s) reduce DNS server load.",
    },
  },
];

export function getDnsEventExplanation(
  eventType: string,
  recordType?: string,
  rcode?: string,
  _mode: "simple" | "advanced" = "simple"
): DnsExplanation {
  if (rcode === "NXDOMAIN") {
    return {
      title: "DNS NXDOMAIN (Non-Existent Domain)",
      summary: "The queried hostname does not exist in the authoritative nameserver's zone database.",
      rfcReference: "RFC 1035 §4.1.1 (RCODE 3 - Name Error)",
      technicalDetails: [
        "RCODE: 3 (NXDOMAIN / Name Error).",
        "Authoritative server returns SOA record in Authority section with Negative Caching TTL (RFC 2308).",
        "Resolvers cache negative responses to prevent flooding queries for non-existent domains.",
      ],
      troubleshootingTips: [
        "Verify spelling of the FQDN.",
        "Check if DNS propagation has completed or if the record was deleted.",
      ],
    };
  }

  if (rcode === "SERVFAIL") {
    return {
      title: "DNS SERVFAIL (Server Failure)",
      summary: "The recursive resolver was unable to obtain an answer due to an upstream nameserver timeout, DNSSEC validation failure, or network unreachable error.",
      rfcReference: "RFC 1035 §4.1.1 (RCODE 2 - Server Failure)",
      technicalDetails: [
        "RCODE: 2 (SERVFAIL).",
        "Indicates resolver reached retry limits without receiving a valid response.",
        "Commonly caused by firewalled UDP port 53, offline authoritative NS, or expired DNSSEC keys.",
      ],
      troubleshootingTips: [
        "Check network reachability to authoritative nameservers (`dig @ns1.example.com`).",
        "Verify DNSSEC signature validity.",
      ],
    };
  }

  if (recordType === "CNAME") {
    return {
      title: "CNAME (Canonical Name) Alias Resolution",
      summary: "A CNAME record maps an alias hostname to another canonical domain name, requiring the resolver to restart query traversal for the canonical target.",
      rfcReference: "RFC 1034 §3.6.2 & RFC 2181",
      technicalDetails: [
        "Type: CNAME (Option 5).",
        "Points an alias (e.g. store.example.com) to a canonical name (e.g. cdn.shopcloud.net).",
        "Resolvers follow the CNAME chain recursively until reaching a terminating A or AAAA record.",
      ],
      troubleshootingTips: [
        "Avoid CNAME loops or excessive chain depth (> 8 hops).",
        "A domain name cannot have both a CNAME and other records (like MX or TXT) at the apex.",
      ],
    };
  }

  return {
    title: "DNS Resolution Event (RFC 1035)",
    summary: "Domain Name System hostname-to-IP resolution using UDP port 53 protocol hierarchy.",
    rfcReference: "RFC 1034 / RFC 1035 (Domain Names System)",
    technicalDetails: [
      "UDP Port 53 transport for standard queries (switches to TCP 53 if response > 512 bytes / EDNS0 limits).",
      "Recursive resolution traverses Root (.) → TLD (.com) → Authoritative (example.com).",
      "Resolvers cache records according to the TTL (Time to Live) parameter.",
    ],
    troubleshootingTips: [
      "Use `dig +trace example.com` or `nslookup` to diagnose hierarchy delegation path.",
      "Check resolver cache status if old IP addresses persist.",
    ],
  };
}

export type DnsRecordType =
  | "A"
  | "AAAA"
  | "CNAME"
  | "MX"
  | "NS"
  | "PTR"
  | "TXT"
  | "SOA";

export type DnsQueryMode = "recursive" | "iterative";

export type DnsRcode =
  | "NOERROR"
  | "FORMERR"
  | "SERVFAIL"
  | "NXDOMAIN"
  | "NOTIMP"
  | "REFUSED";

export interface DnsResourceRecord {
  id: string;
  name: string; // e.g. "www.example.com"
  type: DnsRecordType;
  value: string; // e.g. "93.184.216.34" or "mail.example.com"
  ttl: number; // in seconds
  priority?: number; // for MX
  section: "answer" | "authority" | "additional";
}

export interface DnsHeaderFlags {
  qr: boolean; // Query (false) or Response (true)
  opcode: number; // 0 for Standard Query
  aa: boolean; // Authoritative Answer
  tc: boolean; // Truncated Message
  rd: boolean; // Recursion Desired
  ra: boolean; // Recursion Available
  rcode: DnsRcode; // Response Code
}

export interface DnsMessage {
  id: number; // 16-bit Transaction ID
  flags: DnsHeaderFlags;
  question: {
    name: string;
    type: DnsRecordType;
    class: "IN";
  };
  answers: DnsResourceRecord[];
  authorities: DnsResourceRecord[];
  additionals: DnsResourceRecord[];
}

export interface DnsCacheEntry {
  hostname: string;
  type: DnsRecordType;
  value: string;
  ttlRemaining: number;
  initialTtl: number;
  cachedAt: number;
  hits: number;
}

export interface DnsNode {
  id: string;
  name: string;
  type: "client" | "resolver" | "root-server" | "tld-server" | "authoritative-server";
  zone?: string; // e.g. ".", ".com", "example.com"
  ipAddress: string;
  records: DnsResourceRecord[];
  position: { x: number; y: number };
  enabled: boolean;
}

export interface DnsLink {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  enabled: boolean;
  status: "up" | "down";
}

export interface DnsResolutionStep {
  stepIndex: number;
  fromNodeId: string;
  toNodeId: string;
  queryType: DnsRecordType;
  targetDomain: string;
  responseType: "REFERRAL" | "ANSWER" | "CNAME_ALIAS" | "NXDOMAIN" | "CACHE_HIT" | "SERVFAIL";
  resolvedValue?: string;
  description: string;
}

export interface DnsConfig {
  [key: string]: unknown;
  topologyPreset?: "iterative-hierarchy" | "recursive-caching" | "cname-chain" | "split-brain-lan";
  queryHostname?: string;
  queryType?: DnsRecordType;
  enableCache?: boolean;
  labelMode?: "simple" | "technical";
  failureScenario?:
    | "none"
    | "cache_hit"
    | "nxdomain_not_found"
    | "cname_resolution"
    | "authoritative_timeout_servfail"
    | "ttl_expiry"
    | "dns_hijack_poisoning";
}

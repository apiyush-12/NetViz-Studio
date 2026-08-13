import { z } from "zod";

export const dnsConfigSchema = z.object({
  topologyPreset: z
    .enum(["iterative-hierarchy", "recursive-caching", "cname-chain", "split-brain-lan"])
    .default("iterative-hierarchy"),
  queryHostname: z.string().default("www.example.com"),
  queryType: z.enum(["A", "AAAA", "CNAME", "MX", "NS", "PTR", "TXT", "SOA"]).default("A"),
  enableCache: z.boolean().default(true),
  labelMode: z.enum(["simple", "technical"]).default("simple"),
  failureScenario: z
    .enum([
      "none",
      "cache_hit",
      "nxdomain_not_found",
      "cname_resolution",
      "authoritative_timeout_servfail",
      "ttl_expiry",
      "dns_hijack_poisoning",
    ])
    .default("none"),
});

export type DnsConfigSchema = z.infer<typeof dnsConfigSchema>;

import { z } from "zod";

export const bgpPeerConfigSchema = z.object({
  id: z.string(),
  remoteAsn: z.number().min(1).max(4294967295),
  neighborIp: z.string(),
  enabled: z.boolean().default(true),
  localPreference: z.number().min(0).max(4294967295).default(100),
  med: z.number().min(0).max(4294967295).default(0),
  asPathPrependCount: z.number().min(0).max(10).default(0),
});

export const bgpRouterConfigSchema = z.object({
  nodeId: z.string(),
  routerId: z.string().regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, "Invalid Router ID IPv4 format"),
  localAsn: z.number().min(1).max(4294967295),
  enabled: z.boolean().default(true),
  advertisedPrefixes: z.array(z.string()).default([]),
  peers: z.array(bgpPeerConfigSchema).default([]),
});

export const bgpLinkConfigSchema = z.object({
  id: z.string(),
  enabled: z.boolean().default(true),
});

export const bgpConfigSchema = z.object({
  topologyPreset: z.enum(["multi-homed", "tier1-hub", "triangle", "ibgp-ebgp"]).default("multi-homed"),
  routers: z.array(bgpRouterConfigSchema).default([]),
  links: z.array(bgpLinkConfigSchema).default([]),
  labelMode: z.enum(["simple", "technical"]).default("simple"),
  failureScenario: z
    .enum([
      "none",
      "break_as65001_as65002",
      "as_path_prepend_as65002",
      "withdraw_prefix",
      "as_loop_injection",
      "invalid_remote_asn",
      "med_influence",
      "tier1_failover",
      "peer_as_down",
    ])
    .default("none"),
});

export type BgpConfigSchema = z.infer<typeof bgpConfigSchema>;

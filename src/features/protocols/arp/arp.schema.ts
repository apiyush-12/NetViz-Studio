import { z } from "zod";

export const arpConfigSchema = z.object({
  topologyPreset: z
    .enum(["standard_lan", "cross_subnet_router", "vrrp_failover", "security_dai_lan"])
    .default("standard_lan"),
  scenarioId: z
    .enum([
      "standard_local_arp",
      "gateway_cross_subnet",
      "gratuitous_arp_conflict",
      "proxy_arp_wan",
      "arp_spoofing_dai",
    ])
    .default("standard_local_arp"),
  sourceNodeId: z.string().default("host-a"),
  targetIp: z.string().default("192.168.1.20"),
  gratuitousArp: z.boolean().default(false),
  proxyArpEnabled: z.boolean().default(false),
  attackerEnabled: z.boolean().default(false),
  daiEnabled: z.boolean().default(false),
  cacheTimeoutSeconds: z.number().min(10).max(1800).default(300),
});

export type ArpConfigSchema = z.infer<typeof arpConfigSchema>;

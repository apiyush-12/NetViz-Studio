import { z } from "zod";

export const icmpTopologyPresetSchema = z.enum([
  "standard_internet_path",
  "pmtud_bottleneck_path",
  "unreachable_firewall_network",
  "local_redirect_subnet",
]);

export const icmpScenarioSchema = z.enum([
  "echo_ping_roundtrip",
  "traceroute_ttl_exceeded",
  "pmtud_df_fragmentation_needed",
  "dest_port_unreachable",
  "firewall_admin_prohibited",
  "icmp_redirect_gateway",
]);

export const icmpConfigSchema = z.object({
  topologyPreset: icmpTopologyPresetSchema.default("standard_internet_path"),
  scenarioId: icmpScenarioSchema.default("echo_ping_roundtrip"),
  sourceNodeId: z.string().default("host-a"),
  targetNodeId: z.string().default("server-b"),
  packetSizeBytes: z.number().int().min(28).max(9000).default(64),
  dontFragmentFlag: z.boolean().default(true),
  startingTtl: z.number().int().min(1).max(255).default(64),
  pingCount: z.number().int().min(1).max(10).default(4),
  targetPort: z.number().int().min(1).max(65535).default(33434),
});

export type IcmpConfigInput = z.input<typeof icmpConfigSchema>;
export type IcmpConfigOutput = z.output<typeof icmpConfigSchema>;

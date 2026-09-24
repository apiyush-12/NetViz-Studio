import { z } from "zod";

export const mplsTopologyPresetSchema = z.enum([
  "standard_core_lsp",
  "penultimate_hop_popping",
  "l3vpn_two_label_stack",
  "mpls_fast_reroute_frr",
  "ttl_uniform_vs_pipe",
]);

export const mplsScenarioSchema = z.enum([
  "basic_push_swap_pop",
  "php_implicit_null",
  "l3vpn_multi_tenant_traffic",
  "frr_link_failure_detour",
  "traceroute_uniform_mode",
  "traceroute_pipe_mode",
]);

export const ttlPropagationModeSchema = z.enum(["uniform", "pipe", "short-pipe"]);

export const mplsConfigSchema = z.object({
  topologyPreset: mplsTopologyPresetSchema.default("standard_core_lsp"),
  scenarioId: mplsScenarioSchema.default("basic_push_swap_pop"),
  sourceNodeId: z.string().default("ce-1"),
  targetNodeId: z.string().default("ce-2"),
  phpEnabled: z.boolean().default(true),
  ttlMode: ttlPropagationModeSchema.default("uniform"),
  trafficClassExp: z.number().int().min(0).max(7).default(0),
  stackDepth: z.enum(["single", "double", "triple"]).default("single"),
  simulateLinkFailure: z.boolean().default(false),
  customerVrf: z.enum(["VRF_RED_CUSTOMER_A", "VRF_BLUE_CUSTOMER_B", "GLOBAL_IP"]).default("GLOBAL_IP"),
});

export type MplsConfigInput = z.input<typeof mplsConfigSchema>;
export type MplsConfigOutput = z.output<typeof mplsConfigSchema>;

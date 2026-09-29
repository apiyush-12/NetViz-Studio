import { z } from "zod";

export const ripConfigSchema = z.object({
  version: z.enum(["ripv1", "ripv2", "ripng"]).default("ripv2"),
  scenarioId: z
    .enum([
      "bellman_ford_convergence",
      "link_failure_split_horizon",
      "count_to_infinity_loop",
      "ripv2_vlsm_cidr_tagging",
      "next_hop_optimization",
      "route_timers_lifecycle",
    ])
    .default("bellman_ford_convergence"),
  topologyPreset: z
    .enum([
      "linear_4_router",
      "triangle_redundant",
      "shared_ethernet_lan",
      "discontinuous_subnets",
    ])
    .default("linear_4_router"),
  splitHorizon: z.boolean().default(true),
  poisonReverse: z.boolean().default(true),
  triggeredUpdates: z.boolean().default(true),
  holddownEnabled: z.boolean().default(true),
  authentication: z.enum(["none", "simple_password", "md5"]).default("none"),
  updateIntervalSec: z.number().min(5).max(60).default(30),
  failedLinkId: z.string().optional(),
});

export type RipConfigSchema = z.infer<typeof ripConfigSchema>;

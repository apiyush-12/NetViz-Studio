import { z } from "zod";

export const stpConfigSchema = z.object({
  version: z.enum(["stp", "rstp"]).default("stp"),
  topologyPreset: z
    .enum(["triangle_loop", "diamond_core", "hierarchical_campus", "ring_network"])
    .default("triangle_loop"),
  scenarioId: z
    .enum([
      "standard_convergence",
      "root_link_failure",
      "root_election_tiebreak",
      "rstp_rapid_convergence",
      "rogue_root_attack",
    ])
    .default("standard_convergence"),
  switches: z
    .array(
      z.object({
        id: z.string(),
        priority: z.number().min(0).max(61440),
      })
    )
    .optional(),
  customLinkCosts: z
    .array(
      z.object({
        linkId: z.string(),
        cost: z.number().min(1).max(2000000),
      })
    )
    .optional(),
  rootGuardOnAccess: z.boolean().default(false),
});

export type StpConfigSchema = z.infer<typeof stpConfigSchema>;

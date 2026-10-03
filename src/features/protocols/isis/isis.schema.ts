import { z } from "zod";

export const isisConfigSchema = z.object({
  scenarioId: z
    .enum([
      "multi_area_hierarchy",
      "attached_bit_default_route",
      "dis_pseudonode_election",
      "route_leaking_up_down",
      "dual_stack_ipv4_ipv6",
      "overload_bit_maintenance",
    ])
    .default("multi_area_hierarchy"),
  topologyPreset: z
    .enum([
      "multi_area_hierarchy",
      "broadcast_lan_dis",
      "dual_stack_multi_topology",
      "redundant_backbone_mesh",
    ])
    .default("multi_area_hierarchy"),
  metricStyle: z.enum(["narrow", "wide"]).default("wide"),
  routeLeakingEnabled: z.boolean().default(false),
  overloadBitNodeId: z.string().optional(),
  disPriorityOverride: z
    .object({
      nodeId: z.string(),
      priority: z.number().min(0).max(127),
    })
    .optional(),
  dualStackEnabled: z.boolean().default(false),
});

export type IsisConfigSchema = z.infer<typeof isisConfigSchema>;

import { z } from "zod";

export const ospfInterfaceConfigSchema = z.object({
  id: z.string(),
  cost: z.number().min(1).max(65535).default(10),
  helloInterval: z.number().min(1).max(60).default(10),
  deadInterval: z.number().min(1).max(240).default(40),
  passive: z.boolean().default(false),
  enabled: z.boolean().default(true),
});

export const ospfRouterConfigSchema = z.object({
  nodeId: z.string(),
  routerId: z.string().regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, "Invalid Router ID IPv4 format"),
  processId: z.number().min(1).max(65535).default(1),
  areaId: z.string().default("0"),
  enabled: z.boolean().default(true),
  interfaces: z.array(ospfInterfaceConfigSchema).default([]),
});

export const ospfLinkConfigSchema = z.object({
  id: z.string(),
  cost: z.number().min(1).max(65535).default(10),
  enabled: z.boolean().default(true),
});

export const ospfConfigSchema = z.object({
  topologyPreset: z.enum(["diamond", "ring", "multi-area", "triangle"]).default("diamond"),
  rootRouterId: z.string().default("R1"),
  routers: z.array(ospfRouterConfigSchema).default([]),
  links: z.array(ospfLinkConfigSchema).default([]),
  labelMode: z.enum(["simple", "technical"]).default("simple"),
  failureScenario: z
    .enum([
      "none",
      "r2_r4_cost_high",
      "r2_r4_break",
      "area_mismatch",
      "timer_mismatch",
      "duplicate_rid",
      "ring_break",
      "abr_failure",
    ])
    .default("none"),
});

export type OspfConfigSchema = z.infer<typeof ospfConfigSchema>;

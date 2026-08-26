import { z } from "zod";

export const natConfigSchema = z.object({
  mode: z.enum(["pat", "static", "dynamic", "dnat", "cgnat"]).default("pat"),
  publicIp: z.string().default("203.0.113.1"),
  privateSubnet: z.string().default("192.168.1.0/24"),
  publicPoolStart: z.string().optional().default("203.0.113.10"),
  publicPoolEnd: z.string().optional().default("203.0.113.15"),
  timeoutSeconds: z.number().default(300),
});

export type NatConfigSchema = z.infer<typeof natConfigSchema>;

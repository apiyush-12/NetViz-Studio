import { z } from "zod";

export const ipv4ConfigSchema = z.object({
  sourceIp: z.string().ip({ version: "v4" }),
  destinationIp: z.string().ip({ version: "v4" }),
  packetSize: z.number().int().min(64).max(65535),
  initialTtl: z.number().int().min(1).max(255),
  dfFlag: z.boolean(),
  routerMtu: z.number().int().min(68).max(9000),
});

export type Ipv4ConfigSchema = z.infer<typeof ipv4ConfigSchema>;

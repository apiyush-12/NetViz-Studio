import { z } from "zod";

export const ipv6ConfigSchema = z.object({
  sourceIpv6: z.string().ip({ version: "v6" }),
  destinationIpv6: z.string().ip({ version: "v6" }),
  payloadSize: z.number().int().min(1).max(65535),
  flowLabel: z.number().int().min(0).max(1048575), // 20 bits
  trafficClass: z.number().int().min(0).max(255),
  initialHopLimit: z.number().int().min(1).max(255),
  useExtensionHeader: z.boolean(),
});

export type Ipv6ConfigSchema = z.infer<typeof ipv6ConfigSchema>;

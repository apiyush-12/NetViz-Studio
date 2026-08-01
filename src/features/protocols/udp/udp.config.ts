import { z } from "zod";

export const udpConfigSchema = z.object({
  datagramCount: z.number().min(1).max(15).default(5),
  payloadSize: z.number().min(8).max(1472).default(64),
  latencyMs: z.number().min(0).max(5000).default(80),
  dropIndices: z.array(z.number()).default([]),
  outOfOrder: z.boolean().default(false),
  sendIntervalMs: z.number().min(50).max(2000).default(150),
});

export type UdpConfig = z.infer<typeof udpConfigSchema>;

export const defaultUdpConfig: UdpConfig = {
  datagramCount: 5,
  payloadSize: 64,
  latencyMs: 80,
  dropIndices: [],
  outOfOrder: false,
  sendIntervalMs: 150,
};

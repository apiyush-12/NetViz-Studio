import { z } from "zod";

export const dhcpConfigSchema = z.object({
  topologyPreset: z
    .enum(["simple-lan", "dual-server", "relay-agent", "exhaustion-rogue"])
    .default("simple-lan"),
  clientMac: z
    .string()
    .regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, "Invalid MAC address format")
    .default("00:1A:2B:3C:4D:5E"),
  clientHostname: z.string().default("workstation-01"),
  requestedIp: z.string().optional(),
  leaseDurationSeconds: z.number().min(60).max(86400 * 30).default(86400),
  poolStart: z.string().default("192.168.1.100"),
  poolEnd: z.string().default("192.168.1.200"),
  labelMode: z.enum(["simple", "technical"]).default("simple"),
  failureScenario: z
    .enum([
      "none",
      "pool_exhausted",
      "ip_conflict_decline",
      "rogue_server",
      "dhcp_nak",
      "lease_renewal_t1",
      "server_down_rebind",
    ])
    .default("none"),
});

export type DhcpConfigSchema = z.infer<typeof dhcpConfigSchema>;

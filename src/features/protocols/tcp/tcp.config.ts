import { z } from "zod";

export const tcpConfigSchema = z.object({
  packetCount: z.number().min(1).max(10).default(3),
  initialSeqNum: z.number().min(0).max(4294967295).default(1000),
  windowSize: z.number().min(512).max(65535).default(4096),
  mss: z.number().min(536).max(1460).default(1460),
  latencyMs: z.number().min(0).max(5000).default(100),
  timeoutMs: z.number().min(500).max(30000).default(3000),
  dropPacketIndex: z.number().min(-1).max(20).default(-1),
  dropAckIndex: z.number().min(-1).max(20).default(-1),
  orderedDelivery: z.boolean().default(true),
  includeClose: z.boolean().default(true),
});

export type TcpConfig = z.infer<typeof tcpConfigSchema>;

export const defaultTcpConfig: TcpConfig = {
  packetCount: 3,
  initialSeqNum: 1000,
  windowSize: 4096,
  mss: 1460,
  latencyMs: 100,
  timeoutMs: 3000,
  dropPacketIndex: -1,
  dropAckIndex: -1,
  orderedDelivery: true,
  includeClose: true,
};

export type TcpState =
  | "CLOSED"
  | "LISTEN"
  | "SYN-SENT"
  | "SYN-RECEIVED"
  | "ESTABLISHED"
  | "FIN-WAIT-1"
  | "FIN-WAIT-2"
  | "CLOSE-WAIT"
  | "LAST-ACK"
  | "TIME-WAIT";

export const TCP_FLAGS = ["SYN", "ACK", "FIN", "RST", "PSH", "URG"] as const;

import { z } from "zod";

export const httpConfigSchema = z.object({
  scheme: z.enum(["http", "https"]).default("https"),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"]).default("GET"),
  version: z.enum(["HTTP/1.1", "HTTP/2", "HTTP/3"]).default("HTTP/2"),
  url: z.string().default("https://api.network.local/v1/users"),
  tlsVersion: z.enum(["TLS 1.2", "TLS 1.3"]).default("TLS 1.3"),
  enableCache: z.boolean().default(true),
  simulateLatency: z.boolean().default(true),
});

export type HttpConfigSchema = z.infer<typeof httpConfigSchema>;

import { z } from "zod";

export const tlsConfigSchema = z.object({
  scenarioId: z.enum([
    "tls13_full_handshake",
    "tls12_vs_tls13_latency",
    "tls13_zero_rtt_psk",
    "mtls_mutual_authentication",
    "pki_cert_chain_validation",
    "mitm_untrusted_cert_attack",
  ]),
  version: z.enum(["TLS 1.3", "TLS 1.2"]),
  cipherSuite: z.enum([
    "TLS_AES_128_GCM_SHA256",
    "TLS_AES_256_GCM_SHA384",
    "TLS_CHACHA20_POLY1305_SHA256",
    "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
    "TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384",
    "TLS_RSA_WITH_AES_128_CBC_SHA",
  ]),
  namedGroup: z.enum(["x25519", "secp256r1", "secp384r1"]),
  sniHostname: z.string().min(1).default("api.secure-bank.io"),
  zeroRttEnabled: z.boolean().default(false),
  mTlsEnabled: z.boolean().default(false),
  certStatus: z.enum([
    "valid",
    "expired",
    "self_signed",
    "hostname_mismatch",
    "revoked",
  ]).default("valid"),
  ocspStaplingEnabled: z.boolean().default(true),
  alpnProtocol: z.enum(["h2", "http/1.1", "none"]).default("h2"),
});

export type TlsConfigSchema = z.infer<typeof tlsConfigSchema>;

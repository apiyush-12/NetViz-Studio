import type { ProtocolModule } from "@/features/protocols/shared/protocol-types";
import { defaultTlsConfig } from "./tls.defaults";
import { tlsConfigSchema } from "./tls.schema";
import { generateTlsSimulationBridge } from "./tls.simulator";

import { TLS_EXPLANATION_SECTIONS } from "./tls.explanations";

export const tlsModule: ProtocolModule = {
  id: "tls",
  name: "TLS (Transport Layer Security)",
  category: "security",
  layer: "Presentation / Security (Layer 6-7)",
  summary:
    "Transport Layer Security (RFC 8446 TLS 1.3 / RFC 5246 TLS 1.2) — 1-RTT & 0-RTT Cryptographic Handshake, HKDF Key Schedule, X.509 PKI Chain Validation, and AEAD Record Layer.",
  status: "implemented",
  learningObjectives: [
    "Understand how the 1-RTT handshake in TLS 1.3 eliminates round trips compared to TLS 1.2 2-RTT",
    "Analyze how Ephemeral Diffie-Hellman (ECDHE X25519) provides Perfect Forward Secrecy (PFS)",
    "Trace the HKDF key derivation from ECDHE shared secret to Handshake and Application Traffic Keys",
    "Inspect X.509 Certificate Chain of Trust validation (Leaf -> Intermediate CA -> Root CA) and OCSP Stapling",
    "Explore 0-RTT Early Data with Pre-Shared Keys (PSK) and learn about anti-replay security risks",
    "Simulate Mutual TLS (mTLS) client certificate verification and Man-in-the-Middle (MITM) untrusted CA detection",
  ],
  simplificationNotes: [
    "Simulates real 256-bit ECDHE X25519 scalar multiplication and HKDF key derivation using deterministic RFC test vectors",
    "Models authentic X.509 certificate fields, SAN matching, and real-time OCSP stapling status",
    "Renders wire-aligned hex dumps conforming to RFC 8446 Section 5 Record Layer framing",
  ],
  defaultTopology: {
    nodes: [
      { id: "client", type: "host", label: "Client (Browser / API)", position: { x: 120, y: 180 } },
      { id: "server", type: "server", label: "Server (api.secure-bank.io)", position: { x: 620, y: 180 } },
    ],
    edges: [
      { id: "link-client-server", source: "client", target: "server" },
    ],
  },
  configurationSchema: tlsConfigSchema,
  defaultConfiguration: defaultTlsConfig as unknown as Record<string, unknown>,
  generateSimulation: generateTlsSimulationBridge,
  packetFields: [
    {
      layer: "TLS Record Layer",
      name: "Content Type",
      description: "20=ChangeCipherSpec, 21=Alert, 22=Handshake, 23=ApplicationData",
    },
    {
      layer: "TLS Record Layer",
      name: "Legacy Version",
      description: "Wire value 0x0303 (TLS 1.2) preserved for middlebox compatibility",
    },
    {
      layer: "TLS Record Layer",
      name: "Length",
      description: "Length of the following TLS Plaintext or Ciphertext in octets",
    },
    {
      layer: "TLS Handshake",
      name: "Handshake Type",
      description: "1=ClientHello, 2=ServerHello, 8=EncryptedExtensions, 11=Certificate, 15=CertificateVerify, 20=Finished",
    },
    {
      layer: "TLS Handshake",
      name: "Handshake Length",
      description: "24-bit length of handshake message body",
    },
    {
      layer: "TLS Extensions",
      name: "Extensions",
      description: "TLV-encoded extensions (SNI, Key Share, Supported Groups, ALPN, PSK)",
    },
  ],
  explanationSections: TLS_EXPLANATION_SECTIONS,
};

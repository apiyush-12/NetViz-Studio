import { describe, it, expect } from "vitest";
import { simulateTlsTransaction } from "@/features/protocols/tls/tls.simulator";
import {
  deriveHkdfKeySchedule,
  validateCertificateChain,
  createClientHelloRecord,
} from "@/features/protocols/tls/tls-engine";
import {
  DEFAULT_TLS_CHAIN,
  DEFAULT_EXPIRED_CERTIFICATE,
  defaultTlsConfig,
} from "@/features/protocols/tls/tls.defaults";

describe("TLS 1.3 & 1.2 Simulation Engine", () => {
  it("should generate a successful 1-RTT TLS 1.3 full handshake", () => {
    const outcome = simulateTlsTransaction({
      scenarioId: "tls13_full_handshake",
      version: "TLS 1.3",
      cipherSuite: "TLS_AES_128_GCM_SHA256",
      namedGroup: "x25519",
    });

    expect(outcome.isHandshakeSuccess).toBe(true);
    expect(outcome.totalRtt).toBe(1.0);
    expect(outcome.securityRating).toBe("A+");
    expect(outcome.steps.length).toBeGreaterThanOrEqual(6);

    // Verify key derivation
    expect(outcome.finalKeySchedule.sharedSecretDhe).toBeDefined();
    expect(outcome.finalKeySchedule.handshakeSecret).toBeDefined();
    expect(outcome.finalKeySchedule.masterSecret).toBeDefined();
    expect(outcome.finalKeySchedule.clientAppKey).toBeDefined();
    expect(outcome.finalKeySchedule.serverAppKey).toBeDefined();
  });

  it("should simulate TLS 1.2 legacy handshake requiring 2-RTT round trips", () => {
    const outcome = simulateTlsTransaction({
      scenarioId: "tls12_vs_tls13_latency",
      version: "TLS 1.2",
      cipherSuite: "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
    });

    expect(outcome.totalRtt).toBe(2.0);
    expect(outcome.isHandshakeSuccess).toBe(true);
    expect(outcome.securityRating).toBe("B");

    // Must include ClientKeyExchange and ChangeCipherSpec in step titles
    const titles = outcome.steps.map((s) => s.title);
    expect(titles.some((t) => t.includes("ClientKeyExchange"))).toBe(true);
    expect(titles.some((t) => t.includes("ChangeCipherSpec"))).toBe(true);
  });

  it("should simulate 0-RTT Early Data resumption in Flight 1", () => {
    const outcome = simulateTlsTransaction({
      scenarioId: "tls13_zero_rtt_psk",
      version: "TLS 1.3",
      zeroRttEnabled: true,
    });

    expect(outcome.isHandshakeSuccess).toBe(true);
    const flight1Steps = outcome.steps.filter((s) => s.flight === 1);
    expect(flight1Steps.some((s) => s.phase === "early_data_0rtt")).toBe(true);
  });

  it("should simulate Mutual TLS (mTLS) with client certificate verification", () => {
    const outcome = simulateTlsTransaction({
      scenarioId: "mtls_mutual_authentication",
      version: "TLS 1.3",
      mTlsEnabled: true,
    });

    expect(outcome.isHandshakeSuccess).toBe(true);
    const titles = outcome.steps.map((s) => s.title);
    expect(titles.some((t) => t.includes("CertificateRequest"))).toBe(true);
    expect(titles.some((t) => t.includes("Client Certificate"))).toBe(true);
  });

  it("should reject expired certificates and abort with fatal alert", () => {
    const outcome = simulateTlsTransaction({
      scenarioId: "mitm_untrusted_cert_attack",
      version: "TLS 1.3",
      certStatus: "expired",
    });

    expect(outcome.isHandshakeSuccess).toBe(false);
    expect(outcome.securityRating).toBe("F (Insecure)");
    const lastStep = outcome.steps[outcome.steps.length - 1];
    expect(lastStep.activeRecord?.contentTypeName).toBe("Alert");
  });

  it("should derive deterministic HKDF key schedule from test vectors", () => {
    const schedule = deriveHkdfKeySchedule("x25519", "TLS_AES_128_GCM_SHA256");
    expect(schedule.sharedSecretDhe).toHaveLength(64);
    expect(schedule.handshakeSecret).toHaveLength(64);
    expect(schedule.masterSecret).toHaveLength(64);
    expect(schedule.clientHandshakeKey).toHaveLength(32);
    expect(schedule.clientAppKey).toHaveLength(32);
  });

  it("should validate valid X.509 chain and reject expired leaf certificate", () => {
    const validResult = validateCertificateChain(DEFAULT_TLS_CHAIN);
    expect(validResult.isValid).toBe(true);
    expect(validResult.error).toBeUndefined();

    const expiredChain = {
      ...DEFAULT_TLS_CHAIN,
      leaf: DEFAULT_EXPIRED_CERTIFICATE,
    };
    const invalidResult = validateCertificateChain(expiredChain);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.error).toContain("expired");
  });

  it("should construct valid ClientHello TLS record structure", () => {
    const record = createClientHelloRecord(defaultTlsConfig);
    expect(record.contentTypeName).toBe("Handshake");
    expect(record.handshakeMessage?.type).toBe(1); // ClientHello
    expect(record.handshakeMessage?.extensions.length).toBeGreaterThanOrEqual(4);
    expect(record.phase).toBe("cleartext");
  });
});

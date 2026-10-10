import type { TlsConfig, TlsCertificateChain } from "./tls.types";
import { validateCertificateChain } from "./tls-engine";

export interface TlsValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateTlsConfig(
  config: TlsConfig,
  chain: TlsCertificateChain
): TlsValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Version and Cipher Suite Compatibility (RFC 8446 Appendix B)
  if (config.version === "TLS 1.3") {
    if (
      config.cipherSuite === "TLS_RSA_WITH_AES_128_CBC_SHA" ||
      config.cipherSuite === "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256" ||
      config.cipherSuite === "TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384"
    ) {
      errors.push(
        `Cipher suite ${config.cipherSuite} is a TLS 1.2 legacy suite and is forbidden in TLS 1.3 (RFC 8446 Section 1.2). Only modern AEAD suites (TLS_AES_*) are allowed.`
      );
    }
  } else {
    // TLS 1.2
    if (
      config.cipherSuite === "TLS_AES_128_GCM_SHA256" ||
      config.cipherSuite === "TLS_AES_256_GCM_SHA384" ||
      config.cipherSuite === "TLS_CHACHA20_POLY1305_SHA256"
    ) {
      errors.push(
        `Cipher suite ${config.cipherSuite} is exclusive to TLS 1.3 and cannot be negotiated over TLS 1.2.`
      );
    }
  }

  // 2. 0-RTT check
  if (config.zeroRttEnabled && config.version === "TLS 1.2") {
    errors.push("0-RTT Early Data is a TLS 1.3 feature (RFC 8446 Section 4.2.10) and is not supported in TLS 1.2.");
  }

  // 3. Certificate validation check
  const certCheck = validateCertificateChain(chain, config.sniHostname, config.certStatus);
  if (!certCheck.isValid && config.scenarioId !== "mitm_untrusted_cert_attack") {
    warnings.push(`Certificate issue: ${certCheck.error}`);
  }

  // 4. CBC mode warning in TLS 1.2
  if (config.cipherSuite === "TLS_RSA_WITH_AES_128_CBC_SHA") {
    warnings.push(
      "Static RSA key exchange does NOT provide Forward Secrecy. CBC mode is vulnerable to Lucky13 and Padding Oracle attacks."
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

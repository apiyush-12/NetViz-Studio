import type {
  TlsConfig,
  TlsCertificate,
  TlsCertificateChain,
  TlsKeySchedule,
  TlsScenarioId,
} from "./tls.types";

export const DEFAULT_ROOT_CA: TlsCertificate = {
  id: "root-ca",
  commonName: "GlobalTrust Root CA X1",
  organization: "GlobalTrust Certification Authority",
  issuerCommonName: "GlobalTrust Root CA X1",
  issuerOrganization: "GlobalTrust Certification Authority",
  san: ["globaltrust.org", "*.globaltrust.org"],
  validFrom: "2015-06-04 11:04:38 UTC",
  validTo: "2035-06-04 11:04:38 UTC",
  serialNumber: "04:00:00:00:00:01:15:4B:5A:3B",
  signatureAlgorithm: "sha256WithRSAEncryption",
  publicKeyType: "RSA",
  keySize: 4096,
  fingerprintSha256: "27:94:BA:AC:34:B6:A9:C9:C3:41:69:CA:45:B2:19:22:9C:A3:62:94",
  isCa: true,
  status: "valid",
};

export const DEFAULT_INTERMEDIATE_CA: TlsCertificate = {
  id: "intermediate-ca",
  commonName: "GlobalTrust Secure Server CA G3",
  organization: "GlobalTrust Certification Authority",
  issuerCommonName: "GlobalTrust Root CA X1",
  issuerOrganization: "GlobalTrust Certification Authority",
  san: ["ca.globaltrust.org"],
  validFrom: "2020-09-15 00:00:00 UTC",
  validTo: "2030-09-15 23:59:59 UTC",
  serialNumber: "07:22:98:A4:1F:D3:55:BC:90:EE",
  signatureAlgorithm: "sha256WithRSAEncryption",
  publicKeyType: "RSA",
  keySize: 2048,
  fingerprintSha256: "6E:A4:82:5F:99:3B:11:07:AD:42:C8:DE:52:84:6A:11:03:77:F1:C9",
  isCa: true,
  status: "valid",
};

export const DEFAULT_LEAF_CERTIFICATE: TlsCertificate = {
  id: "leaf-server-cert",
  commonName: "api.secure-bank.io",
  organization: "SecureBank Financial Services Inc.",
  issuerCommonName: "GlobalTrust Secure Server CA G3",
  issuerOrganization: "GlobalTrust Certification Authority",
  san: ["api.secure-bank.io", "*.secure-bank.io", "secure-bank.io"],
  validFrom: "2026-01-01 00:00:00 UTC",
  validTo: "2027-01-01 23:59:59 UTC",
  serialNumber: "14:8A:F3:02:9B:44:EE:21:5C:88",
  signatureAlgorithm: "ecdsa-with-SHA256",
  publicKeyType: "ECDSA",
  keySize: 256,
  fingerprintSha256: "B8:11:42:F0:8A:2C:99:7E:D5:19:64:30:EF:83:2A:49:10:BC:7E:55",
  isCa: false,
  status: "valid",
  ocspStapled: true,
};

export const EXPIRED_CERTIFICATE: TlsCertificate = {
  ...DEFAULT_LEAF_CERTIFICATE,
  id: "expired-leaf-cert",
  validFrom: "2023-01-01 00:00:00 UTC",
  validTo: "2024-01-01 23:59:59 UTC",
  status: "expired",
  statusReason: "Certificate expired on Jan 1, 2024. Browser will reject TLS handshake with SEC_ERROR_EXPIRED_CERTIFICATE.",
};

export const DEFAULT_EXPIRED_CERTIFICATE = EXPIRED_CERTIFICATE;

export const SELF_SIGNED_CERTIFICATE: TlsCertificate = {
  ...DEFAULT_LEAF_CERTIFICATE,
  id: "self-signed-cert",
  issuerCommonName: "api.secure-bank.io (Self-Signed)",
  issuerOrganization: "Untrusted Private Entity",
  status: "self_signed",
  statusReason: "Issuer is not trusted by system Root CA trust store. Potential Man-in-the-Middle proxy attack (SEC_ERROR_UNKNOWN_ISSUER).",
};

export const HOSTNAME_MISMATCH_CERTIFICATE: TlsCertificate = {
  ...DEFAULT_LEAF_CERTIFICATE,
  id: "hostname-mismatch-cert",
  commonName: "other-domain.xyz",
  san: ["other-domain.xyz", "*.other-domain.xyz"],
  status: "hostname_mismatch",
  statusReason: "Requested SNI 'api.secure-bank.io' does not match Certificate Subject Alternative Names (SSL_ERROR_BAD_CERT_DOMAIN).",
};

export const DEFAULT_CLIENT_CERTIFICATE: TlsCertificate = {
  id: "client-cert-mtls",
  commonName: "client-user-9942@secure-bank.io",
  organization: "Enterprise API Partner",
  issuerCommonName: "GlobalTrust Secure Server CA G3",
  issuerOrganization: "GlobalTrust Certification Authority",
  san: ["client-user-9942@secure-bank.io"],
  validFrom: "2026-01-01 00:00:00 UTC",
  validTo: "2027-01-01 23:59:59 UTC",
  serialNumber: "3C:99:11:44:88:AA:BC:54:10:02",
  signatureAlgorithm: "ecdsa-with-SHA256",
  publicKeyType: "ECDSA",
  keySize: 256,
  fingerprintSha256: "91:E2:44:AC:77:19:0B:44:DE:62:38:1A:FC:49:2B:11:80:CC:5F:AA",
  isCa: false,
  status: "valid",
};

export const DEFAULT_TLS_CHAIN: TlsCertificateChain = {
  leaf: DEFAULT_LEAF_CERTIFICATE,
  intermediate: DEFAULT_INTERMEDIATE_CA,
  root: DEFAULT_ROOT_CA,
  isValidChain: true,
};

export const DEFAULT_TLS_KEY_SCHEDULE: TlsKeySchedule = {
  sharedSecretDhe: "d4a8e2f1839210bc947e62a15f02bc7390a8276f5b3098d7b38c29184910cf4a",
  earlySecret: "33ad89bc441098e210fa487e6b129845cd7820ab9384726150ef927483019284",
  handshakeSecret: "7b4019af8402bc569348e021cb59284a10df8372648102938475620194857261",
  masterSecret: "f9018247ca829103bc482019ef84726190ab7462534102938475618293049182",
  clientHandshakeTrafficSecret: "88a10bc4729104bc827102938471029384719283746152435465768798091a2b",
  serverHandshakeTrafficSecret: "99c21ef5830215cd9382130495821304958203948572635465768798091a2b3c",
  clientAppTrafficSecret: "aa321fa6941326de04932415069324150693140596837465768798091a2b3c4d",
  serverAppTrafficSecret: "bb4320b7052437ef150435261704352617042516079485768798091a2b3c4d5e",
  clientHandshakeKey: "73fa0982bc4e1074a382947160284759",
  serverHandshakeKey: "9910ac8253719482bf47285910283746",
  clientHandshakeIv: "10bc947e5830",
  serverHandshakeIv: "21cd058f6941",
  clientAppKey: "33a92847190284759182736450192847",
  serverAppKey: "44b03958201395860293847561203958",
  clientAppIv: "847291048291",
  serverAppIv: "958302159302",
};

export const defaultTlsConfig: TlsConfig = {
  scenarioId: "tls13_full_handshake",
  version: "TLS 1.3",
  cipherSuite: "TLS_AES_128_GCM_SHA256",
  namedGroup: "x25519",
  sniHostname: "api.secure-bank.io",
  zeroRttEnabled: false,
  mTlsEnabled: false,
  certStatus: "valid",
  ocspStaplingEnabled: true,
  alpnProtocol: "h2",
};

export const TLS_SCENARIOS: Record<
  TlsScenarioId,
  {
    id: TlsScenarioId;
    title: string;
    description: string;
    version: "TLS 1.3" | "TLS 1.2";
    category: "handshake" | "latency" | "resumption" | "auth" | "pki" | "security";
    rfc: string;
  }
> = {
  tls13_full_handshake: {
    id: "tls13_full_handshake",
    title: "1. TLS 1.3 1-RTT Full Handshake (X25519 + AES-GCM)",
    description:
      "Observe modern 1-RTT handshake where ClientHello immediately speculates key_share (ECDHE X25519) and encrypts all server responses.",
    version: "TLS 1.3",
    category: "handshake",
    rfc: "RFC 8446",
  },
  tls12_vs_tls13_latency: {
    id: "tls12_vs_tls13_latency",
    title: "2. TLS 1.2 (2-RTT) vs TLS 1.3 (1-RTT) Latency Compare",
    description:
      "Compare legacy 2-RTT round trips (ServerKeyExchange, ClientKeyExchange, ChangeCipherSpec) with TLS 1.3 1-RTT zero-overhead connection establishment.",
    version: "TLS 1.2",
    category: "latency",
    rfc: "RFC 5246 vs RFC 8446",
  },
  tls13_zero_rtt_psk: {
    id: "tls13_zero_rtt_psk",
    title: "3. TLS 1.3 0-RTT Early Data (Session Resumption)",
    description:
      "Client re-connecting with Pre-Shared Key (PSK) sends encrypted application request in Flight 1 before receiving ServerHello (0-RTT), plus replay protection.",
    version: "TLS 1.3",
    category: "resumption",
    rfc: "RFC 8446 Section 4.2.10",
  },
  mtls_mutual_authentication: {
    id: "mtls_mutual_authentication",
    title: "4. Mutual TLS (mTLS) Client Certificate Auth",
    description:
      "Server sends CertificateRequest; Client submits its own X.509 certificate and signs the handshake transcript with CertificateVerify for zero-trust API security.",
    version: "TLS 1.3",
    category: "auth",
    rfc: "RFC 8446 Section 4.4.2",
  },
  pki_cert_chain_validation: {
    id: "pki_cert_chain_validation",
    title: "5. X.509 PKI Chain of Trust & OCSP Stapling",
    description:
      "Step through the cryptographic chain validation: Leaf Cert &rarr; Intermediate CA &rarr; Trust Anchor Root CA, SAN matching, and real-time OCSP Stapling.",
    version: "TLS 1.3",
    category: "pki",
    rfc: "RFC 5280 / RFC 6066",
  },
  mitm_untrusted_cert_attack: {
    id: "mitm_untrusted_cert_attack",
    title: "6. MITM Proxy & Untrusted/Expired Certificate Alert",
    description:
      "Simulate an attacker intercepting the TLS stream with a rogue self-signed or expired certificate, triggering browser trust store rejection and TLS fatal alerts.",
    version: "TLS 1.3",
    category: "security",
    rfc: "RFC 8446 Section 6 (Alerts)",
  },
};

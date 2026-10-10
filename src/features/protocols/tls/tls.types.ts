/**
 * TLS (Transport Layer Security - RFC 8446 TLS 1.3 / RFC 5246 TLS 1.2)
 * Core Domain Types & Cryptographic Data Models
 */

export type TlsVersion = "TLS 1.3" | "TLS 1.2";

export type TlsContentType =
  | 20 // ChangeCipherSpec
  | 21 // Alert
  | 22 // Handshake
  | 23; // ApplicationData

export type TlsHandshakeType =
  | 1 // ClientHello
  | 2 // ServerHello
  | 4 // NewSessionTicket
  | 8 // EncryptedExtensions (TLS 1.3)
  | 11 // Certificate
  | 12 // ServerKeyExchange (TLS 1.2)
  | 13 // CertificateRequest
  | 14 // ServerHelloDone (TLS 1.2)
  | 15 // CertificateVerify
  | 16 // ClientKeyExchange (TLS 1.2)
  | 20; // Finished

export type TlsNamedGroup = "x25519" | "secp256r1" | "secp384r1";

export type TlsCipherSuite =
  // TLS 1.3 Cipher Suites (AEAD only)
  | "TLS_AES_128_GCM_SHA256"
  | "TLS_AES_256_GCM_SHA384"
  | "TLS_CHACHA20_POLY1305_SHA256"
  // TLS 1.2 Legacy Cipher Suites
  | "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256"
  | "TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384"
  | "TLS_RSA_WITH_AES_128_CBC_SHA";

export type TlsEncryptionPhase =
  | "cleartext"
  | "early_data_0rtt"
  | "handshake_traffic"
  | "application_traffic";

export type TlsCertificateStatus =
  | "valid"
  | "expired"
  | "self_signed"
  | "hostname_mismatch"
  | "revoked";

export type TlsScenarioId =
  | "tls13_full_handshake"
  | "tls12_vs_tls13_latency"
  | "tls13_zero_rtt_psk"
  | "mtls_mutual_authentication"
  | "pki_cert_chain_validation"
  | "mitm_untrusted_cert_attack";

export interface TlsExtension {
  type: number;
  name: string;
  length: number;
  data: Record<string, unknown>;
  description: string;
}

export interface TlsCertificate {
  id: string;
  commonName: string;
  organization: string;
  issuerCommonName: string;
  issuerOrganization: string;
  san: string[];
  validFrom: string;
  validTo: string;
  serialNumber: string;
  signatureAlgorithm: string;
  publicKeyType: "RSA" | "ECDSA";
  keySize: number; // e.g. 2048, 4096, 256
  fingerprintSha256: string;
  isCa: boolean;
  status: TlsCertificateStatus;
  statusReason?: string;
  ocspStapled?: boolean;
}

export interface TlsCertificateChain {
  leaf: TlsCertificate;
  intermediate: TlsCertificate;
  root: TlsCertificate;
  isValidChain: boolean;
  validationError?: string;
}

export interface TlsKeySchedule {
  sharedSecretDhe?: string; // e.g. 32-byte hex from ECDHE X25519
  earlySecret?: string;
  handshakeSecret?: string;
  masterSecret?: string;
  clientHandshakeTrafficSecret?: string;
  serverHandshakeTrafficSecret?: string;
  clientAppTrafficSecret?: string;
  serverAppTrafficSecret?: string;
  clientHandshakeKey?: string;
  serverHandshakeKey?: string;
  clientHandshakeIv?: string;
  serverHandshakeIv?: string;
  clientAppKey?: string;
  serverAppKey?: string;
  clientAppIv?: string;
  serverAppIv?: string;
}

export interface TlsHandshakeMessage {
  type: TlsHandshakeType;
  typeName: string;
  length: number;
  clientRandom?: string;
  serverRandom?: string;
  sessionId?: string;
  selectedVersion?: TlsVersion;
  cipherSuite?: TlsCipherSuite;
  namedGroup?: TlsNamedGroup;
  keySharePublic?: string;
  extensions: TlsExtension[];
  certificateChain?: TlsCertificate[];
  signatureAlgorithm?: string;
  signatureHex?: string;
  verifyData?: string;
}

export interface TlsRecordData {
  contentType: TlsContentType;
  contentTypeName: "ChangeCipherSpec" | "Alert" | "Handshake" | "ApplicationData";
  legacyVersion: string; // e.g. "0x0303" (TLS 1.2 legacy wire value)
  length: number;
  phase: TlsEncryptionPhase;
  isEncrypted: boolean;
  authTag?: string; // 16-byte AEAD authentication tag
  handshakeMessage?: TlsHandshakeMessage;
  applicationPayload?: string;
}

export interface TlsNode {
  id: string;
  name: string;
  role: "client" | "server" | "attacker";
  ipAddress: string;
  port: number;
  status: "idle" | "negotiating" | "connected" | "failed";
}

export interface TlsConfig {
  scenarioId: TlsScenarioId;
  version: TlsVersion;
  cipherSuite: TlsCipherSuite;
  namedGroup: TlsNamedGroup;
  sniHostname: string;
  zeroRttEnabled: boolean;
  mTlsEnabled: boolean;
  certStatus: TlsCertificateStatus;
  ocspStaplingEnabled: boolean;
  alpnProtocol: "h2" | "http/1.1" | "none";
}

export interface TlsCliLine {
  nodeId?: string;
  text: string;
  level?: "info" | "warning" | "error" | "success";
  type?: "command" | "info" | "success" | "warning" | "error";
}

export interface TlsSimulationStepState {
  stepIndex: number;
  title: string;
  description: string;
  flight: number; // 1, 2, 3, etc.
  rttLabel: string; // e.g. "0.5 RTT", "1.0 RTT", "1.5 RTT"
  from: "Client" | "Server" | "Attacker";
  to: "Client" | "Server" | "Attacker";
  phase: TlsEncryptionPhase;
  activeRecord?: TlsRecordData;
  activePacketId?: string;
  keySchedule: TlsKeySchedule;
  certChain: TlsCertificateChain;
  clientState: {
    handshakeState: string;
    keysReady: TlsEncryptionPhase;
  };
  serverState: {
    handshakeState: string;
    keysReady: TlsEncryptionPhase;
  };
  cliOutputs: TlsCliLine[];
  eventExplanation: {
    beginner: string;
    advanced: string;
    securityNote?: string;
    fieldsChanged?: string[];
  };
}

export interface TlsSimulationOutcome {
  steps: TlsSimulationStepState[];
  finalKeySchedule: TlsKeySchedule;
  finalCertChain: TlsCertificateChain;
  totalRtt: number; // e.g. 1.0 RTT (TLS 1.3) or 2.0 RTT (TLS 1.2)
  isHandshakeSuccess: boolean;
  securityRating: "A+" | "A" | "B" | "F (Insecure)";
}

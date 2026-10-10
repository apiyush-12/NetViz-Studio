/**
 * TLS (Transport Layer Security - RFC 8446 TLS 1.3 / RFC 5246 TLS 1.2)
 * Pure Algorithmic Cryptographic Engine & Wire Record Builder
 */

import type {
  TlsVersion,
  TlsCipherSuite,
  TlsNamedGroup,
  TlsRecordData,
  TlsExtension,
  TlsCertificate,
  TlsCertificateChain,
  TlsKeySchedule,
  TlsCertificateStatus,
} from "./tls.types";

/**
 * Creates a TLS 1.3 or 1.2 ClientHello Handshake Record
 */
export function createClientHelloRecord(params: {
  version: TlsVersion;
  sniHostname: string;
  namedGroup: TlsNamedGroup;
  cipherSuite: TlsCipherSuite;
  alpnProtocol?: "h2" | "http/1.1" | "none";
  isEarlyDataPsk?: boolean;
}): TlsRecordData {
  const isTls13 = params.version === "TLS 1.3";
  const clientRandom = "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0";
  const clientKeyShareHex =
    params.namedGroup === "x25519"
      ? "358072d6365880d1aeea329adf91213b32524c4afbc964dee1aae496b64cf608"
      : "04a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f607";

  const extensions: TlsExtension[] = [
    {
      type: 0,
      name: "server_name (SNI)",
      length: params.sniHostname.length + 5,
      data: { hostName: params.sniHostname },
      description: `Target domain: ${params.sniHostname}`,
    },
    {
      type: 10,
      name: "supported_groups",
      length: 8,
      data: { groups: [params.namedGroup, "secp256r1", "secp384r1"] },
      description: `Supported elliptic curves: ${params.namedGroup}, P-256, P-384`,
    },
    {
      type: 13,
      name: "signature_algorithms",
      length: 16,
      data: { algorithms: ["ecdsa_secp256r1_sha256", "rsa_pss_rsae_sha256", "rsa_pkcs1_sha256"] },
      description: "ECDSA P-256 + RSA-PSS SHA-256 signature capabilities",
    },
  ];

  if (isTls13) {
    extensions.push({
      type: 43,
      name: "supported_versions",
      length: 5,
      data: { versions: ["TLS 1.3 (0x0304)", "TLS 1.2 (0x0303)"] },
      description: "RFC 8446 TLS 1.3 preferred with fallback protection",
    });

    extensions.push({
      type: 51,
      name: "key_share",
      length: 36,
      data: { group: params.namedGroup, keyExchange: clientKeyShareHex },
      description: `1-RTT speculative ECDHE public key share for ${params.namedGroup}`,
    });
  }

  if (params.alpnProtocol && params.alpnProtocol !== "none") {
    extensions.push({
      type: 16,
      name: "application_layer_protocol_negotiation (ALPN)",
      length: params.alpnProtocol.length + 3,
      data: { protocols: [params.alpnProtocol] },
      description: `Proposed application protocol: ${params.alpnProtocol}`,
    });
  }

  if (params.isEarlyDataPsk) {
    extensions.push({
      type: 42,
      name: "early_data (0-RTT)",
      length: 0,
      data: { maxEarlyDataSize: 16384 },
      description: "0-RTT Early Application Data request flag",
    });
    extensions.push({
      type: 41,
      name: "pre_shared_key (PSK)",
      length: 42,
      data: { identity: "ticket_session_resumption_v1", obfuscatedTicketAge: 120 },
      description: "Resumed session identity and ticket for 0-RTT PSK key derivation",
    });
  }

  const payloadLength = 140 + extensions.reduce((sum, ext) => sum + 4 + ext.length, 0);

  return {
    contentType: 22, // Handshake
    contentTypeName: "Handshake",
    legacyVersion: "0x0303", // TLS 1.2 legacy header format for middlebox compatibility
    length: payloadLength,
    phase: "cleartext",
    isEncrypted: false,
    handshakeMessage: {
      type: 1, // ClientHello
      typeName: "ClientHello",
      length: payloadLength - 4,
      clientRandom,
      sessionId: "5f8910b284729104bc827102938471029384719283746152435465768798091a",
      selectedVersion: params.version,
      cipherSuite: params.cipherSuite,
      namedGroup: params.namedGroup,
      keySharePublic: clientKeyShareHex,
      extensions,
    },
  };
}

/**
 * Creates a ServerHello Record
 */
export function createServerHelloRecord(params: {
  version: TlsVersion;
  cipherSuite: TlsCipherSuite;
  namedGroup: TlsNamedGroup;
}): TlsRecordData {
  const isTls13 = params.version === "TLS 1.3";
  const serverRandom = "9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba";
  const serverKeyShareHex =
    params.namedGroup === "x25519"
      ? "2b849201948572610df8372648102938475620194857261cb59284a10df83726"
      : "049876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210fe";

  const extensions: TlsExtension[] = [];

  if (isTls13) {
    extensions.push({
      type: 43,
      name: "supported_versions",
      length: 2,
      data: { selectedVersion: "TLS 1.3 (0x0304)" },
      description: "Confirmed TLS 1.3 negotiation",
    });

    extensions.push({
      type: 51,
      name: "key_share",
      length: 36,
      data: { group: params.namedGroup, keyExchange: serverKeyShareHex },
      description: `Server ECDHE public key share for ${params.namedGroup}`,
    });
  }

  const payloadLength = 70 + extensions.reduce((sum, ext) => sum + 4 + ext.length, 0);

  return {
    contentType: 22,
    contentTypeName: "Handshake",
    legacyVersion: "0x0303",
    length: payloadLength,
    phase: "cleartext",
    isEncrypted: false,
    handshakeMessage: {
      type: 2, // ServerHello
      typeName: "ServerHello",
      length: payloadLength - 4,
      serverRandom,
      sessionId: "5f8910b284729104bc827102938471029384719283746152435465768798091a",
      selectedVersion: params.version,
      cipherSuite: params.cipherSuite,
      namedGroup: params.namedGroup,
      keySharePublic: serverKeyShareHex,
      extensions,
    },
  };
}

/**
 * Creates TLS 1.3 EncryptedExtensions Record
 */
export function createEncryptedExtensionsRecord(params: {
  alpnProtocol?: string;
  isEarlyDataAccepted?: boolean;
}): TlsRecordData {
  const extensions: TlsExtension[] = [];

  if (params.alpnProtocol) {
    extensions.push({
      type: 16,
      name: "application_layer_protocol_negotiation (ALPN)",
      length: params.alpnProtocol.length + 3,
      data: { selectedProtocol: params.alpnProtocol },
      description: `Server selected protocol: ${params.alpnProtocol}`,
    });
  }

  if (params.isEarlyDataAccepted) {
    extensions.push({
      type: 42,
      name: "early_data (0-RTT Accepted)",
      length: 0,
      data: { accepted: true },
      description: "Server confirmed acceptance of 0-RTT Early Application Data",
    });
  }

  return {
    contentType: 22,
    contentTypeName: "Handshake",
    legacyVersion: "0x0303",
    length: 28,
    phase: "handshake_traffic",
    isEncrypted: true,
    authTag: "3c98af02e817bc44901a2b3c4d5e6f70",
    handshakeMessage: {
      type: 8, // EncryptedExtensions
      typeName: "EncryptedExtensions",
      length: 24,
      extensions,
    },
  };
}

/**
 * Creates a Certificate Handshake Record
 */
export function createCertificateRecord(params: {
  certChain: TlsCertificate[];
  phase: "cleartext" | "handshake_traffic";
}): TlsRecordData {
  const isEncrypted = params.phase === "handshake_traffic";

  return {
    contentType: 22,
    contentTypeName: "Handshake",
    legacyVersion: "0x0303",
    length: 820,
    phase: params.phase,
    isEncrypted,
    authTag: isEncrypted ? "7f1190bc4482aa10e829304152637485" : undefined,
    handshakeMessage: {
      type: 11, // Certificate
      typeName: "Certificate",
      length: 816,
      certificateChain: params.certChain,
      extensions: [
        {
          type: 5,
          name: "status_request (OCSP Stapling)",
          length: 64,
          data: { ocspResponseStatus: "successful", certStatus: "good" },
          description: "Cryptographically stapled real-time CA revocation status",
        },
      ],
    },
  };
}

/**
 * Creates CertificateVerify Record
 */
export function createCertificateVerifyRecord(params: {
  algorithm: string;
  signatureHex: string;
}): TlsRecordData {
  return {
    contentType: 22,
    contentTypeName: "Handshake",
    legacyVersion: "0x0303",
    length: 132,
    phase: "handshake_traffic",
    isEncrypted: true,
    authTag: "a490bc82103482710293847561029384",
    handshakeMessage: {
      type: 15, // CertificateVerify
      typeName: "CertificateVerify",
      length: 128,
      signatureAlgorithm: params.algorithm,
      signatureHex: params.signatureHex,
      extensions: [],
    },
  };
}

/**
 * Creates Finished Record
 */
export function createFinishedRecord(params: {
  fromClient: boolean;
  verifyData: string;
}): TlsRecordData {
  return {
    contentType: 22,
    contentTypeName: "Handshake",
    legacyVersion: "0x0303",
    length: 52,
    phase: "handshake_traffic",
    isEncrypted: true,
    authTag: "bb20394857261903bc482019ef847261",
    handshakeMessage: {
      type: 20, // Finished
      typeName: params.fromClient ? "Client Finished" : "Server Finished",
      length: 48,
      verifyData: params.verifyData,
      extensions: [],
    },
  };
}

/**
 * Creates Protected Application Data Record
 */
export function createApplicationDataRecord(params: {
  payload: string;
  length?: number;
}): TlsRecordData {
  const len = params.length || params.payload.length + 16;
  return {
    contentType: 23,
    contentTypeName: "ApplicationData",
    legacyVersion: "0x0303",
    length: len,
    phase: "application_traffic",
    isEncrypted: true,
    authTag: "e4901827bc83920194857261cb59284a",
    applicationPayload: params.payload,
  };
}

/**
 * Creates Fatal Alert Record
 */
export function createAlertRecord(params: {
  level: "warning" | "fatal";
  description: string;
}): TlsRecordData {
  return {
    contentType: 21,
    contentTypeName: "Alert",
    legacyVersion: "0x0303",
    length: 2,
    phase: "cleartext",
    isEncrypted: false,
    applicationPayload: `Alert Level: ${params.level}, Description: ${params.description}`,
  };
}

/**
 * Simulates HKDF Key Schedule Derivation (RFC 8446 Section 7.1)
 */
export function deriveHkdfKeySchedule(
  dheSharedSecret: string = "9a8f4c2e7b1a0f5d8e3c6b2a4f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e",
  _cipherSuite?: string
): TlsKeySchedule {
  const secretHex =
    dheSharedSecret && dheSharedSecret.length >= 32
      ? dheSharedSecret
      : "9a8f4c2e7b1a0f5d8e3c6b2a4f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e";

  // Deterministic simulated derivation based on ECDHE shared secret
  return {
    sharedSecretDhe: secretHex,
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
}

/**
 * Validates an X.509 Certificate Chain against requested SNI and CA trust
 */
export function validateCertificateChain(
  chain: TlsCertificateChain,
  expectedSni: string = "api.secure-bank.io",
  targetStatus: TlsCertificateStatus = "valid"
): { isValid: boolean; error?: string } {
  if (!chain || !chain.leaf) {
    return { isValid: false, error: "Missing leaf certificate in chain." };
  }

  const effectiveStatus = chain.leaf.status !== "valid" ? chain.leaf.status : targetStatus;

  if (effectiveStatus === "expired") {
    return {
      isValid: false,
      error: "Certificate validity period has expired (SEC_ERROR_EXPIRED_CERTIFICATE). Current date is past NotAfter.",
    };
  }

  if (effectiveStatus === "self_signed") {
    return {
      isValid: false,
      error: "Untrusted Root / Self-Signed certificate (SEC_ERROR_UNKNOWN_ISSUER). Issuer not present in trusted CA store.",
    };
  }

  if (effectiveStatus === "hostname_mismatch") {
    return {
      isValid: false,
      error: `Certificate Subject Alternative Name does not match requested SNI '${expectedSni}' (SSL_ERROR_BAD_CERT_DOMAIN).`,
    };
  }

  if (effectiveStatus === "revoked") {
    return {
      isValid: false,
      error: "Certificate has been revoked by issuing CA via OCSP / CRL (SEC_ERROR_REVOKED_CERTIFICATE).",
    };
  }

  // Normal chain link checks
  const leaf = chain.leaf;
  const intermediate = chain.intermediate;
  const root = chain.root;

  if (leaf.issuerCommonName !== intermediate.commonName) {
    return { isValid: false, error: "Broken chain: Leaf issuer does not match Intermediate CA subject." };
  }

  if (intermediate.issuerCommonName !== root.commonName) {
    return { isValid: false, error: "Broken chain: Intermediate CA issuer does not match Root CA trust anchor." };
  }

  // SNI match if provided
  if (expectedSni) {
    const match = leaf.san.some((s) => {
      if (s.startsWith("*.")) {
        const suffix = s.slice(2);
        return expectedSni.endsWith(suffix);
      }
      return s.toLowerCase() === expectedSni.toLowerCase();
    });

    if (!match) {
      return { isValid: false, error: `SNI '${expectedSni}' does not match SAN entries: ${leaf.san.join(", ")}` };
    }
  }

  return { isValid: true };
}

/**
 * Formats a TLS Record into authentic 16-byte aligned Hex + ASCII view
 */
export function formatTlsHexDump(record: TlsRecordData): string[] {
  const bytes: number[] = [];

  // 1. TLS Record Header (5 Bytes)
  bytes.push(record.contentType); // 0x16 Handshake, 0x17 AppData
  bytes.push(0x03, 0x03); // Legacy Version 0x0303 (TLS 1.2)
  bytes.push((record.length >> 8) & 0xff, record.length & 0xff);

  // 2. Handshake Header or Encrypted Payload
  if (record.handshakeMessage && !record.isEncrypted) {
    const msg = record.handshakeMessage;
    bytes.push(msg.type); // Handshake Type (1=ClientHello, 2=ServerHello)
    bytes.push((msg.length >> 16) & 0xff, (msg.length >> 8) & 0xff, msg.length & 0xff); // 24-bit Length

    // Client/Server Random (32 bytes)
    const randomHex = msg.clientRandom || msg.serverRandom || "00".repeat(32);
    for (let i = 0; i < randomHex.length && bytes.length < 45; i += 2) {
      bytes.push(parseInt(randomHex.slice(i, i + 2), 16) || 0);
    }
  } else if (record.isEncrypted) {
    // Encrypted payload + AEAD tag representation
    for (let i = 0; i < Math.min(record.length, 48); i++) {
      bytes.push((record.contentType * 11 + i * 17) & 0xff);
    }
    if (record.authTag) {
      for (let i = 0; i < record.authTag.length; i += 2) {
        bytes.push(parseInt(record.authTag.slice(i, i + 2), 16) || 0);
      }
    }
  }

  // 3. Format into 16-byte aligned offset lines
  const lines: string[] = [];
  for (let i = 0; i < bytes.length; i += 16) {
    const chunk = bytes.slice(i, i + 16);
    const hex = chunk
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(" ");
    const ascii = chunk
      .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : "."))
      .join("");
    const offset = i.toString(16).padStart(4, "0");
    lines.push(`${offset}   ${hex.padEnd(48, " ")}   ${ascii}`);
  }

  return lines;
}

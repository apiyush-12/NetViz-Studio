/**
 * TLS (Transport Layer Security - RFC 8446 / RFC 5246)
 * Pedagogical Explanations (Beginner Analogies vs RFC Technical Deep Dive)
 */

export interface TlsStepExplanation {
  beginner: string;
  advanced: string;
  securityNote?: string;
  fieldsChanged?: string[];
}

export const TLS_EXPLANATIONS: Record<string, TlsStepExplanation> = {
  client_hello: {
    beginner:
      "The Client knocks on the Server's door and says: 'Hello! I want to speak securely. Here are the languages I speak (Cipher Suites), the website name I want to visit (SNI), and half of an open padlock (ECDHE Key Share) so you can lock your response immediately without waiting!'",
    advanced:
      "RFC 8446 Section 4.1.2: ClientHello initiates 1-RTT handshake. Client generates a 32-byte Client Random and an ephemeral Diffie-Hellman key pair over curve X25519. It populates extension 'key_share' (51) with its public key, 'supported_versions' (43) specifying TLS 1.3 (0x0304), and 'server_name' (SNI). In TLS 1.3, speculative key_share eliminates the full round-trip previously required in TLS 1.2.",
    securityNote:
      "Speculative ECDHE key sharing guarantees Perfect Forward Secrecy (PFS). If the server's long-term private key is compromised years later, past recorded traffic remains un-decryptable.",
    fieldsChanged: [
      "Client Random initialized (32 bytes)",
      "Ephemeral private/public key pair generated (X25519)",
      "Extension key_share populated with client public key",
      "Handshake State -> Waiting for ServerHello",
    ],
  },

  server_hello: {
    beginner:
      "The Server picks the strongest matching encryption method (e.g., AES-128-GCM), completes the cryptographic key exchange by generating its own open padlock (Server Key Share), and clicks them together. From this exact millisecond forward, all further conversation is locked!",
    advanced:
      "RFC 8446 Section 4.1.3: ServerHello confirms selected Cipher Suite (TLS_AES_128_GCM_SHA256) and responds with extension 'key_share' carrying its X25519 public key. Both endpoints execute scalar multiplication: SharedSecret = X25519(privA, pubB). Endpoints immediately feed SharedSecret into HKDF-Extract to derive Early Secret and Handshake Secret.",
    securityNote:
      "Downgrade Protection: If a legacy version is negotiated, the Server Random's last 8 bytes are replaced with a fixed sentinel value (RFC 8446 Section 4.1.3). Any MITM attempting to downgrade to TLS 1.2 is immediately rejected.",
    fieldsChanged: [
      "Server Random generated",
      "ECDHE Shared Secret computed via X25519 scalar multiplication",
      "HKDF Handshake Secret derived",
      "Client & Server Handshake Traffic Keys and IVs installed",
      "Record Layer encryption active -> Handshake Traffic Phase",
    ],
  },

  encrypted_extensions: {
    beginner:
      "Now that temporary encryption is turned on, the Server whispers its private connection parameters (like ALPN choosing HTTP/2) inside an encrypted envelope so eavesdroppers on the Wi-Fi cannot see them.",
    advanced:
      "RFC 8446 Section 4.3.1: EncryptedExtensions is the very first encrypted handshake message under server_handshake_traffic_secret. It transports non-certificate extensions (such as ALPN confirming HTTP/2 or EarlyData acceptance) without leaking metadata to eavesdroppers on the wire.",
    securityNote:
      "In TLS 1.2, extensions were sent in cleartext ServerHello. TLS 1.3 encrypts them, preventing middlebox tampering and privacy leaks.",
    fieldsChanged: [
      "Encrypted with server_handshake_key (AES-128-GCM)",
      "ALPN negotiated -> 'h2' (HTTP/2 binary framing)",
    ],
  },

  certificate: {
    beginner:
      "The Server presents its digital passport (X.509 Certificate Chain). This passport is signed by an internationally trusted Authority (Intermediate and Root CA), proving the server truly owns the domain name you requested.",
    advanced:
      "RFC 8446 Section 4.4.2: Certificate message carries the server's X.509 v3 certificate chain (Leaf -> Intermediate CA -> Root CA trust anchor). In TLS 1.3, this entire certificate structure is sent fully encrypted under server_handshake_traffic_secret, and carries an optional OCSP Stapling response (status_request) proving real-time non-revocation.",
    securityNote:
      "Encrypting the certificate hides the server's identity and subject alternative names from passive network surveillance.",
    fieldsChanged: [
      "Server Certificate Chain received",
      "Chain verified against Root CA trust store",
      "OCSP Stapling verified -> Status Good",
    ],
  },

  certificate_verify: {
    beginner:
      "Having a passport isn't enough; the Server must prove it holds the secret key matching the passport. It creates a digital signature over everything said so far using its private key, which only the genuine server can produce.",
    advanced:
      "RFC 8446 Section 4.4.3: CertificateVerify provides authentication. The server hashes the entire handshake transcript up to this point and signs it using its private key (ECDSA P-256 or RSA-PSS). The client verifies this signature using the public key extracted from the Server Certificate.",
    securityNote:
      "Transcript Binding: Signing the full cumulative transcript prevents Man-in-the-Middle attackers from replaying signatures from previous sessions.",
    fieldsChanged: [
      "Handshake transcript hash computed (SHA-256)",
      "Digital signature verified via server public key",
      "Server authentication confirmed",
    ],
  },

  server_finished: {
    beginner:
      "The Server computes a cryptographic seal (HMAC) over the complete handshake and says: 'I am finished setting up! If anything was tampered with by a hacker, this seal will break.'",
    advanced:
      "RFC 8446 Section 4.4.4: Finished verifies that the key exchange and authentication were not modified. The server computes verify_data = HMAC-SHA256(finished_key, Transcript-Hash). At this point, the server derives the Master Secret and its client/server Application Traffic Keys.",
    securityNote:
      "Key Confirmation: Guarantees that both parties possess identical handshake transcripts and identical cryptographic keys.",
    fieldsChanged: [
      "Server Finished HMAC verified",
      "HKDF Master Secret derived",
      "Server Application Traffic Key & IV installed",
    ],
  },

  client_finished: {
    beginner:
      "The Client verifies the Server's seal, responds with its own matching seal, and immediately transitions into full Application Data encryption. The 1-RTT handshake is complete!",
    advanced:
      "RFC 8446 Section 4.4.4: Client sends its own Finished message under client_handshake_traffic_secret. Both endpoints transition the TLS Record Layer to client_application_traffic_secret and server_application_traffic_secret. Full duplex encrypted HTTP communication begins.",
    securityNote:
      "Connection reaches final 1-RTT mutual cryptographic lock. Both directions are protected by authenticated encryption with associated data (AEAD).",
    fieldsChanged: [
      "Client Finished verified by Server",
      "Client Application Traffic Key & IV installed",
      "Handshake state -> CONNECTED / 1-RTT Complete",
    ],
  },

  app_data_request: {
    beginner:
      "The Client sends its actual HTTP request (e.g. GET /api/v1/account). The data is scrambled with AES-GCM; nobody on the internet can read or tamper with the sensitive financial request.",
    advanced:
      "ApplicationData record (Content Type 23) carrying HTTP/2 GET frame. Encrypted using client_app_key and AES-128-GCM with a 16-byte authentication tag preventing payload bit-flipping.",
    securityNote:
      "Confidentiality & Integrity guaranteed. AES-GCM guarantees that if even a single bit of ciphertext is modified in transit, decryption will immediately fail with a fatal bad_record_mac alert.",
    fieldsChanged: [
      "Plaintext HTTP request encrypted",
      "TLS Record Layer transmitted (AES-128-GCM)",
    ],
  },

  app_data_response: {
    beginner:
      "The Server responds with the confidential data (e.g. HTTP 200 OK with bank balance JSON), encrypted under server_app_key. Only the client can decrypt it.",
    advanced:
      "ApplicationData record carrying HTTP/2 200 OK response with JSON body. Encrypted using server_app_key and incremented per-record sequence number preventing replay attacks.",
    securityNote:
      "End-to-end zero-trust encryption completed in 1 round-trip time.",
    fieldsChanged: [
      "HTTP response decrypted by Client",
      "Full TLS transaction finished successfully",
    ],
  },

  tls12_server_key_exchange: {
    beginner:
      "In older TLS 1.2, the Server had to send an extra message explaining its Diffie-Hellman parameters, adding an extra round trip of waiting before keys could be computed.",
    advanced:
      "RFC 5246 Section 7.4.3: ServerKeyExchange in TLS 1.2 sends the ephemeral ECDH parameters and public key, signed with the server's RSA/ECDSA key. Unlike TLS 1.3, this occurs in Flight 2, requiring 2-RTT before application data can be sent.",
    securityNote:
      "Extra RTT adds 50-100ms latency on mobile connections compared to TLS 1.3.",
    fieldsChanged: [
      "TLS 1.2 ServerKeyExchange received",
      "Curve params & signature verified",
    ],
  },

  tls12_client_key_exchange: {
    beginner:
      "In TLS 1.2, the Client now responds with its Diffie-Hellman public key in ClientKeyExchange, followed by ChangeCipherSpec to announce it is switching to encryption.",
    advanced:
      "RFC 5246 Section 7.4.7: ClientKeyExchange conveys client ECDH public key. Endpoints compute pre-master secret, PRF derives master_secret, and Client sends ChangeCipherSpec (Content Type 20) and Finished.",
    securityNote:
      "ChangeCipherSpec is an independent content type in TLS 1.2 that was deprecated in TLS 1.3 (retained only as a dummy record for middlebox compatibility).",
    fieldsChanged: [
      "Pre-Master Secret computed",
      "TLS 1.2 PRF derives Master Secret",
      "ChangeCipherSpec received",
    ],
  },

  zero_rtt_early_data: {
    beginner:
      "With 0-RTT, because the Client already visited this site earlier, it uses the cached session ticket to encrypt and send its HTTP request in the very first packet, without waiting for the server at all!",
    advanced:
      "RFC 8446 Section 4.2.10: Client derives early_traffic_secret from pre-shared key (PSK) and transmits early ApplicationData alongside ClientHello in Flight 1. The server can process and respond immediately in ServerHello flight, achieving 0-RTT latency.",
    securityNote:
      "Replay Attack Warning: 0-RTT Early Data is NOT protected against network replay attacks. An attacker can record the packet and replay it to the server. Consequently, RFC 8446 specifies 0-RTT MUST only be used for idempotent requests (GET, not POST funds transfers).",
    fieldsChanged: [
      "PSK Early Secret derived from session ticket",
      "Early Application Data encrypted & transmitted (0-RTT)",
      "Anti-replay freshness ticket verified by server",
    ],
  },

  mtls_certificate_request: {
    beginner:
      "In Mutual TLS (mTLS), the Server doesn't just show its own passport; it demands to see the Client's passport too! This ensures only authorized client apps or microservices can connect.",
    advanced:
      "RFC 8446 Section 4.3.2: Server sends CertificateRequest inside encrypted handshake flight, specifying acceptable certificate authorities and signature algorithms. The Client must provide its X.509 certificate and sign the handshake transcript with CertificateVerify.",
    securityNote:
      "Zero-Trust Security: Authenticates both client identity and server identity at the transport layer, eliminating reliance on vulnerable API tokens or passwords.",
    fieldsChanged: [
      "CertificateRequest received by Client",
      "Client selects client certificate and private key",
    ],
  },

  mitm_alert_rejection: {
    beginner:
      "The Client detected a fake or expired certificate! A Man-in-the-Middle attacker is trying to intercept the connection. The browser terminates the connection immediately with a red alert and refuses to send any data.",
    advanced:
      "RFC 8446 Section 6.2: Client PKI validation fails (SEC_ERROR_UNKNOWN_ISSUER or SEC_ERROR_EXPIRED_CERTIFICATE). Client transmits a fatal TLS Alert record (Level 2: Fatal, Description 48: unknown_ca / 45: certificate_expired) and abruptly tears down the TCP connection.",
    securityNote:
      "Strict PKI enforcement prevents credential theft, session hijacking, and eavesdropping by rogue proxies or compromised network hardware.",
    fieldsChanged: [
      "Certificate validation failed",
      "Fatal TLS Alert (unknown_ca / bad_certificate) generated",
      "Connection aborted; 0 bytes of sensitive data leaked",
    ],
  },
};

export const TLS_EXPLANATION_SECTIONS = [
  {
    eventType: "CLIENT_HELLO",
    beginner: {
      whatHappened:
        "The Client knocks on the Server's door offering supported ciphers and speculative public key share.",
      whyItHappened:
        "Client sends its ECDHE public key immediately in ClientHello to complete the handshake in 1 round trip.",
      protocolRule: "RFC 8446 Section 4.1.2: ClientHello initiates TLS 1.3 handshake.",
      fieldsChanged: ["Client Random", "key_share (X25519)", "SNI"],
      whatHappensNext: "The Server responds with ServerHello and matching key share.",
      realWorldUse: "Used in every modern HTTPS browser session connecting to cloud websites.",
    },
    advanced: {
      whatHappened:
        "ClientHello specifying TLS 1.3 supported_versions, AEAD ciphersuites, and X25519 key_share.",
      whyItHappened:
        "Eliminates the legacy 2-RTT round trip by optimistically providing the client's Diffie-Hellman public key.",
      protocolRule: "RFC 8446 Section 4.1.2: Client offers cipher suites and supported groups.",
      fieldsChanged: ["Random: 32 bytes", "CipherSuites: TLS_AES_128_GCM_SHA256", "Groups: x25519"],
      whatHappensNext: "Server verifies groups, derives DHE shared secret, and sends ServerHello.",
      realWorldUse: "Modern HTTP/2 and HTTP/3 / QUIC default transport cryptography.",
    },
  },
  {
    eventType: "SERVER_HELLO",
    beginner: {
      whatHappened:
        "The Server agrees on the encryption cipher and shares its matching key padlock.",
      whyItHappened:
        "Both sides derive matching symmetric keys from this point without ever sending the key itself over the internet.",
      protocolRule: "RFC 8446 Section 4.1.3: ServerHello confirms selected cipher and key share.",
      fieldsChanged: ["Server Random", "Cipher Suite selected", "Server Key Share"],
      whatHappensNext: "All following handshake messages are encrypted under handshake traffic keys.",
      realWorldUse: "Protects sensitive credentials and financial transactions over public Wi-Fi.",
    },
    advanced: {
      whatHappened:
        "ServerHello selects TLS_AES_128_GCM_SHA256 and supplies server X25519 key share.",
      whyItHappened:
        "Enables HKDF derivation of Handshake Secrets and transitions to handshake traffic encryption.",
      protocolRule: "RFC 8446 Section 4.1.3 & 7.1: HKDF-Extract derives Handshake Secret from DHE shared secret.",
      fieldsChanged: ["server_handshake_traffic_secret", "client_handshake_traffic_secret"],
      whatHappensNext: "Server sends EncryptedExtensions, Certificate, and CertificateVerify.",
      realWorldUse: "RFC 8446 standard protocol compliance across OpenSSL, BoringSSL, and Rustls.",
    },
  },
  {
    eventType: "CERTIFICATE_VERIFY",
    beginner: {
      whatHappened:
        "The Server proves its digital identity using an X.509 certificate chain and cryptographic signature.",
      whyItHappened:
        "Guarantees the client is connecting to the authentic server and not a Man-in-the-Middle attacker.",
      protocolRule: "RFC 5280 / RFC 8446: Hierarchical signature verification from Leaf to Root CA.",
      fieldsChanged: ["Certificate Status: Verified", "Subject: api.secure-bank.io"],
      whatHappensNext: "Endpoints exchange Finished seals and transition to Application Data keys.",
      realWorldUse: "Underpins the global Web PKI trusted by billions of browsers.",
    },
    advanced: {
      whatHappened:
        "X.509 Certificate Chain verification, CertificateVerify signature check, and OCSP Stapling check.",
      whyItHappened:
        "Validates digital signatures along the PKI hierarchy and checks real-time revocation status.",
      protocolRule: "RFC 8446 Section 4.4.2 & RFC 6066 status_request OCSP validation.",
      fieldsChanged: ["Chain Valid: True", "Trust Anchor: Root CA", "OCSP: Valid"],
      whatHappensNext: "Client verifies Finished message and installs application traffic keys.",
      realWorldUse: "Enterprise zero-trust architecture and PCI-DSS compliance.",
    },
  },
];


/**
 * TLS (Transport Layer Security - RFC 8446 / RFC 5246)
 * Deterministic Simulation Event Sequence Generators
 */

import type {
  TlsConfig,
  TlsSimulationStepState,
  TlsSimulationOutcome,
  TlsCertificateChain,
  TlsRecordData,
} from "./tls.types";
import {
  DEFAULT_TLS_CHAIN,
  DEFAULT_TLS_KEY_SCHEDULE,
  EXPIRED_CERTIFICATE,
  SELF_SIGNED_CERTIFICATE,
  HOSTNAME_MISMATCH_CERTIFICATE,
  DEFAULT_CLIENT_CERTIFICATE,
} from "./tls.defaults";
import {
  createClientHelloRecord,
  createServerHelloRecord,
  createEncryptedExtensionsRecord,
  createCertificateRecord,
  createCertificateVerifyRecord,
  createFinishedRecord,
  createApplicationDataRecord,
  createAlertRecord,
  deriveHkdfKeySchedule,
} from "./tls-engine";
import { TLS_EXPLANATIONS } from "./tls.explanations";

export function generateTlsSimulation(config: TlsConfig): TlsSimulationOutcome {
  let certChain: TlsCertificateChain = { ...DEFAULT_TLS_CHAIN };

  if (config.certStatus === "expired") {
    certChain = { ...DEFAULT_TLS_CHAIN, leaf: EXPIRED_CERTIFICATE, isValidChain: false };
  } else if (config.certStatus === "self_signed") {
    certChain = { ...DEFAULT_TLS_CHAIN, leaf: SELF_SIGNED_CERTIFICATE, isValidChain: false };
  } else if (config.certStatus === "hostname_mismatch") {
    certChain = { ...DEFAULT_TLS_CHAIN, leaf: HOSTNAME_MISMATCH_CERTIFICATE, isValidChain: false };
  }

  switch (config.scenarioId) {
    case "tls12_vs_tls13_latency":
      return generateTls12LatencySimulation(config, certChain);
    case "tls13_zero_rtt_psk":
      return generateZeroRttPskSimulation(config, certChain);
    case "mtls_mutual_authentication":
      return generateMtlsSimulation(config, certChain);
    case "pki_cert_chain_validation":
      return generatePkiChainValidationSimulation(config, certChain);
    case "mitm_untrusted_cert_attack":
      return generateMitmUntrustedCertSimulation(config, certChain);
    case "tls13_full_handshake":
    default:
      return generateTls13FullHandshakeSimulation(config, certChain);
  }
}

/**
 * 1. Standard TLS 1.3 1-RTT Full Handshake (RFC 8446)
 */
function generateTls13FullHandshakeSimulation(
  config: TlsConfig,
  certChain: TlsCertificateChain
): TlsSimulationOutcome {
  const steps: TlsSimulationStepState[] = [];
  const keySchedule = deriveHkdfKeySchedule("d4a8e2f1839210bc947e62a15f02bc7390a8276f5b3098d7b38c29184910cf4a");

  // Step 0: ClientHello
  const clientHelloRecord = createClientHelloRecord({
    version: "TLS 1.3",
    sniHostname: config.sniHostname,
    namedGroup: config.namedGroup,
    cipherSuite: config.cipherSuite,
    alpnProtocol: config.alpnProtocol,
  });

  steps.push({
    stepIndex: 0,
    title: "1. ClientHello & Speculative Key Share",
    description: "Client sends ClientHello with supported cipher suites and X25519 key share (Flight 1).",
    flight: 1,
    rttLabel: "0.5 RTT",
    from: "Client",
    to: "Server",
    phase: "cleartext",
    activeRecord: clientHelloRecord,
    keySchedule: { sharedSecretDhe: undefined },
    certChain,
    clientState: { handshakeState: "ClientHelloSent", keysReady: "cleartext" },
    serverState: { handshakeState: "Listening", keysReady: "cleartext" },
    cliOutputs: [
      { text: `CLIENT: Generated 32-byte ClientRandom`, type: "info" },
      { text: `CLIENT: Generated ephemeral ECDHE X25519 key pair`, type: "info" },
      { text: `CLIENT -> SERVER: ClientHello [SNI: ${config.sniHostname}, Cipher: ${config.cipherSuite}]`, type: "command" },
    ],
    eventExplanation: TLS_EXPLANATIONS.client_hello,
  });

  // Step 1: ServerHello
  const serverHelloRecord = createServerHelloRecord({
    version: "TLS 1.3",
    cipherSuite: config.cipherSuite,
    namedGroup: config.namedGroup,
  });

  steps.push({
    stepIndex: 1,
    title: "2. ServerHello & Key Share (Shared Secret Computed)",
    description: "Server selects cipher suite, provides server key share, and derives Handshake Secrets (Flight 2).",
    flight: 2,
    rttLabel: "1.0 RTT",
    from: "Server",
    to: "Client",
    phase: "cleartext",
    activeRecord: serverHelloRecord,
    keySchedule: {
      sharedSecretDhe: keySchedule.sharedSecretDhe,
      earlySecret: keySchedule.earlySecret,
      handshakeSecret: keySchedule.handshakeSecret,
      clientHandshakeKey: keySchedule.clientHandshakeKey,
      serverHandshakeKey: keySchedule.serverHandshakeKey,
      clientHandshakeIv: keySchedule.clientHandshakeIv,
      serverHandshakeIv: keySchedule.serverHandshakeIv,
    },
    certChain,
    clientState: { handshakeState: "KeysDeriving", keysReady: "handshake_traffic" },
    serverState: { handshakeState: "ServerHelloSent", keysReady: "handshake_traffic" },
    cliOutputs: [
      { text: `SERVER: Selected cipher suite ${config.cipherSuite}`, type: "success" },
      { text: `SERVER: Computed ECDHE Shared Secret via X25519`, type: "info" },
      { text: `SERVER: HKDF-Extract -> HandshakeSecret: ${keySchedule.handshakeSecret?.slice(0, 16)}...`, type: "info" },
      { text: `SERVER -> CLIENT: ServerHello [Supported Version: TLS 1.3]`, type: "command" },
    ],
    eventExplanation: TLS_EXPLANATIONS.server_hello,
  });

  // Step 2: EncryptedExtensions
  const encExtRecord = createEncryptedExtensionsRecord({
    alpnProtocol: config.alpnProtocol !== "none" ? config.alpnProtocol : undefined,
  });

  steps.push({
    stepIndex: 2,
    title: "3. EncryptedExtensions (Encrypted Handshake Flight)",
    description: "Server transmits non-certificate extensions encrypted under server_handshake_traffic_secret.",
    flight: 2,
    rttLabel: "1.0 RTT",
    from: "Server",
    to: "Client",
    phase: "handshake_traffic",
    activeRecord: encExtRecord,
    keySchedule,
    certChain,
    clientState: { handshakeState: "ReadingEncryptedHandshake", keysReady: "handshake_traffic" },
    serverState: { handshakeState: "EncryptedExtensionsSent", keysReady: "handshake_traffic" },
    cliOutputs: [
      { text: `SERVER: Installed server_handshake_key (AES-128-GCM)`, type: "info" },
      { text: `SERVER -> CLIENT: {EncryptedExtensions} [ALPN: ${config.alpnProtocol}]`, type: "command" },
    ],
    eventExplanation: TLS_EXPLANATIONS.encrypted_extensions,
  });

  // Step 3: Certificate
  const certRecord = createCertificateRecord({
    certChain: [certChain.leaf, certChain.intermediate, certChain.root],
    phase: "handshake_traffic",
  });

  steps.push({
    stepIndex: 3,
    title: "4. Encrypted Certificate & OCSP Stapling",
    description: "Server sends X.509 certificate chain encrypted; client verifies issuer trust anchor & OCSP.",
    flight: 2,
    rttLabel: "1.0 RTT",
    from: "Server",
    to: "Client",
    phase: "handshake_traffic",
    activeRecord: certRecord,
    keySchedule,
    certChain,
    clientState: { handshakeState: "CertChainVerifying", keysReady: "handshake_traffic" },
    serverState: { handshakeState: "CertificateSent", keysReady: "handshake_traffic" },
    cliOutputs: [
      { text: `SERVER -> CLIENT: {Certificate} [Subject: ${certChain.leaf.commonName}]`, type: "command" },
      { text: `CLIENT: Verified chain -> Intermediate CA -> Root CA [Valid]`, type: "success" },
      { text: `CLIENT: OCSP Stapling response verified (Status: Good)`, type: "info" },
    ],
    eventExplanation: TLS_EXPLANATIONS.certificate,
  });

  // Step 4: CertificateVerify
  const certVerifyRecord = createCertificateVerifyRecord({
    algorithm: "ecdsa_secp256r1_sha256",
    signatureHex: "30450221008b84920194857261cb59284a10df8372648102938475620194857261cb59284a02206f",
  });

  steps.push({
    stepIndex: 4,
    title: "5. CertificateVerify (Server Authentication)",
    description: "Server signs the cumulative handshake transcript with its private key proving ownership.",
    flight: 2,
    rttLabel: "1.0 RTT",
    from: "Server",
    to: "Client",
    phase: "handshake_traffic",
    activeRecord: certVerifyRecord,
    keySchedule,
    certChain,
    clientState: { handshakeState: "SignatureVerified", keysReady: "handshake_traffic" },
    serverState: { handshakeState: "CertificateVerifySent", keysReady: "handshake_traffic" },
    cliOutputs: [
      { text: `SERVER: Generated transcript signature over SHA-256(ClientHello...Certificate)`, type: "info" },
      { text: `SERVER -> CLIENT: {CertificateVerify} [ecdsa_secp256r1_sha256]`, type: "command" },
      { text: `CLIENT: Signature verified via Leaf public key. Server authenticated!`, type: "success" },
    ],
    eventExplanation: TLS_EXPLANATIONS.certificate_verify,
  });

  // Step 5: Server Finished
  const serverFinishedRecord = createFinishedRecord({
    fromClient: false,
    verifyData: "7f920194857261cb59284a10df83726481029384",
  });

  steps.push({
    stepIndex: 5,
    title: "6. Server Finished (Master Secret Derived)",
    description: "Server completes its handshake portion, sends Finished HMAC, and derives Application Keys.",
    flight: 2,
    rttLabel: "1.0 RTT",
    from: "Server",
    to: "Client",
    phase: "handshake_traffic",
    activeRecord: serverFinishedRecord,
    keySchedule,
    certChain,
    clientState: { handshakeState: "ServerFinishedVerified", keysReady: "application_traffic" },
    serverState: { handshakeState: "HandshakeComplete", keysReady: "application_traffic" },
    cliOutputs: [
      { text: `SERVER -> CLIENT: {Finished} [verify_data HMAC computed]`, type: "command" },
      { text: `SERVER: HKDF-Expand -> MasterSecret & ServerAppKey installed`, type: "success" },
      { text: `CLIENT: Verified Server Finished HMAC seal`, type: "success" },
    ],
    eventExplanation: TLS_EXPLANATIONS.server_finished,
  });

  // Step 6: Client Finished
  const clientFinishedRecord = createFinishedRecord({
    fromClient: true,
    verifyData: "b84920194857261cb59284a10df8372648102938",
  });

  steps.push({
    stepIndex: 6,
    title: "7. Client Finished (1-RTT Handshake Complete)",
    description: "Client transmits Finished seal under handshake key and immediately switches to Application Key.",
    flight: 3,
    rttLabel: "1.5 RTT",
    from: "Client",
    to: "Server",
    phase: "handshake_traffic",
    activeRecord: clientFinishedRecord,
    keySchedule,
    certChain,
    clientState: { handshakeState: "CONNECTED", keysReady: "application_traffic" },
    serverState: { handshakeState: "CONNECTED", keysReady: "application_traffic" },
    cliOutputs: [
      { text: `CLIENT -> SERVER: {Finished} [verify_data]`, type: "command" },
      { text: `CLIENT: Installed client_application_traffic_secret (AES-128-GCM)`, type: "success" },
      { text: `TLS 1.3 1-RTT Handshake successfully locked in 1 round trip!`, type: "success" },
    ],
    eventExplanation: TLS_EXPLANATIONS.client_finished,
  });

  // Step 7: Application Data (HTTP Request)
  const appDataReqRecord = createApplicationDataRecord({
    payload: "GET /api/v1/accounts/summary HTTP/2\r\nHost: api.secure-bank.io\r\nAuthorization: Bearer sec_tok_994",
  });

  steps.push({
    stepIndex: 7,
    title: "8. Protected Application Data (HTTP/2 Request)",
    description: "Client sends confidential HTTP/2 request encrypted under client_app_key with AEAD authentication tag.",
    flight: 3,
    rttLabel: "1.5 RTT",
    from: "Client",
    to: "Server",
    phase: "application_traffic",
    activeRecord: appDataReqRecord,
    keySchedule,
    certChain,
    clientState: { handshakeState: "DataTransmitting", keysReady: "application_traffic" },
    serverState: { handshakeState: "DataReceiving", keysReady: "application_traffic" },
    cliOutputs: [
      { text: `CLIENT -> SERVER: [ApplicationData] (Ciphertext: 104 bytes + 16-byte GCM Tag)`, type: "command" },
      { text: `SERVER: AEAD Tag verified; HTTP/2 GET frame decrypted successfully`, type: "success" },
    ],
    eventExplanation: TLS_EXPLANATIONS.app_data_request,
  });

  // Step 8: Application Data (HTTP Response)
  const appDataRespRecord = createApplicationDataRecord({
    payload: "HTTP/2 200 OK\r\ncontent-type: application/json\r\n\r\n{\"balance\": 148290.50, \"status\": \"secure\"}",
  });

  steps.push({
    stepIndex: 8,
    title: "9. Protected Application Data (HTTP/2 Response)",
    description: "Server returns encrypted JSON response payload under server_app_key (End-to-End Encrypted).",
    flight: 4,
    rttLabel: "2.0 RTT",
    from: "Server",
    to: "Client",
    phase: "application_traffic",
    activeRecord: appDataRespRecord,
    keySchedule,
    certChain,
    clientState: { handshakeState: "TransactionComplete", keysReady: "application_traffic" },
    serverState: { handshakeState: "TransactionComplete", keysReady: "application_traffic" },
    cliOutputs: [
      { text: `SERVER -> CLIENT: [ApplicationData] (HTTP/2 200 OK JSON response)`, type: "command" },
      { text: `CLIENT: Decrypted bank response. Full transaction secure and complete!`, type: "success" },
    ],
    eventExplanation: TLS_EXPLANATIONS.app_data_response,
  });

  return {
    steps,
    finalKeySchedule: keySchedule,
    finalCertChain: certChain,
    totalRtt: 1.0,
    isHandshakeSuccess: true,
    securityRating: "A+",
  };
}

/**
 * 2. TLS 1.2 (2-RTT) vs TLS 1.3 Latency Simulation (RFC 5246 vs RFC 8446)
 */
function generateTls12LatencySimulation(
  config: TlsConfig,
  certChain: TlsCertificateChain
): TlsSimulationOutcome {
  const steps: TlsSimulationStepState[] = [];
  const keySchedule = deriveHkdfKeySchedule("7b4019af8402bc569348e021cb59284a10df8372648102938475620194857261");

  // Flight 1: TLS 1.2 ClientHello
  const clientHelloRecord = createClientHelloRecord({
    version: "TLS 1.2",
    sniHostname: config.sniHostname,
    namedGroup: "secp256r1",
    cipherSuite: "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
  });

  steps.push({
    stepIndex: 0,
    title: "1. TLS 1.2 ClientHello (Flight 1)",
    description: "Client sends ClientHello without speculative key share (requires server response before keys can be made).",
    flight: 1,
    rttLabel: "0.5 RTT",
    from: "Client",
    to: "Server",
    phase: "cleartext",
    activeRecord: clientHelloRecord,
    keySchedule: {},
    certChain,
    clientState: { handshakeState: "ClientHelloSent", keysReady: "cleartext" },
    serverState: { handshakeState: "Listening", keysReady: "cleartext" },
    cliOutputs: [
      { text: `CLIENT -> SERVER: ClientHello (TLS 1.2) [No Key Share included]`, type: "command" },
    ],
    eventExplanation: TLS_EXPLANATIONS.client_hello,
  });

  // Flight 2: ServerHello + Certificate + ServerKeyExchange + ServerHelloDone
  const serverHelloRecord = createServerHelloRecord({
    version: "TLS 1.2",
    cipherSuite: "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
    namedGroup: "secp256r1",
  });

  steps.push({
    stepIndex: 1,
    title: "2. ServerHello & Certificate (Cleartext in TLS 1.2)",
    description: "Server sends ServerHello and Certificate in plain cleartext (exposed to passive network eavesdroppers).",
    flight: 2,
    rttLabel: "1.0 RTT",
    from: "Server",
    to: "Client",
    phase: "cleartext",
    activeRecord: serverHelloRecord,
    keySchedule: {},
    certChain,
    clientState: { handshakeState: "ServerHelloReceived", keysReady: "cleartext" },
    serverState: { handshakeState: "CertificateSent", keysReady: "cleartext" },
    cliOutputs: [
      { text: `SERVER -> CLIENT: ServerHello [TLS 1.2 Selected]`, type: "command" },
      { text: `SERVER -> CLIENT: Certificate [Cleartext transmission in TLS 1.2]`, type: "warning" },
    ],
    eventExplanation: TLS_EXPLANATIONS.certificate,
  });

  // Flight 2 Cont: ServerKeyExchange
  steps.push({
    stepIndex: 2,
    title: "3. ServerKeyExchange & ServerHelloDone (Flight 2)",
    description: "Server sends its ephemeral ECDHE parameters and waits for client response (1.0 RTT consumed).",
    flight: 2,
    rttLabel: "1.0 RTT",
    from: "Server",
    to: "Client",
    phase: "cleartext",
    activeRecord: {
      contentType: 22,
      contentTypeName: "Handshake",
      legacyVersion: "0x0303",
      length: 120,
      phase: "cleartext",
      isEncrypted: false,
      handshakeMessage: {
        type: 12,
        typeName: "ServerKeyExchange",
        length: 116,
        namedGroup: "secp256r1",
        extensions: [],
      },
    },
    keySchedule: {},
    certChain,
    clientState: { handshakeState: "ServerKeyExchangeReceived", keysReady: "cleartext" },
    serverState: { handshakeState: "ServerHelloDoneSent", keysReady: "cleartext" },
    cliOutputs: [
      { text: `SERVER -> CLIENT: ServerKeyExchange (secp256r1 Curve Params + RSA Signature)`, type: "command" },
      { text: `SERVER -> CLIENT: ServerHelloDone`, type: "info" },
    ],
    eventExplanation: TLS_EXPLANATIONS.tls12_server_key_exchange,
  });

  // Flight 3: ClientKeyExchange + ChangeCipherSpec + Finished
  steps.push({
    stepIndex: 3,
    title: "4. ClientKeyExchange & ChangeCipherSpec (Flight 3)",
    description: "Client sends ECDHE public key, ChangeCipherSpec, and Finished. Still cannot send application data!",
    flight: 3,
    rttLabel: "1.5 RTT",
    from: "Client",
    to: "Server",
    phase: "cleartext",
    activeRecord: {
      contentType: 22,
      contentTypeName: "Handshake",
      legacyVersion: "0x0303",
      length: 70,
      phase: "cleartext",
      isEncrypted: false,
      handshakeMessage: {
        type: 16,
        typeName: "ClientKeyExchange",
        length: 66,
        namedGroup: "secp256r1",
        extensions: [],
      },
    },
    keySchedule,
    certChain,
    clientState: { handshakeState: "ClientFinishedSent", keysReady: "handshake_traffic" },
    serverState: { handshakeState: "ClientKeyExchangeReceived", keysReady: "cleartext" },
    cliOutputs: [
      { text: `CLIENT -> SERVER: ClientKeyExchange [Client ECDH public key]`, type: "command" },
      { text: `CLIENT -> SERVER: ChangeCipherSpec (0x01)`, type: "info" },
      { text: `CLIENT -> SERVER: Finished (Encrypted Handshake Check)`, type: "command" },
    ],
    eventExplanation: TLS_EXPLANATIONS.tls12_client_key_exchange,
  });

  // Flight 4: Server ChangeCipherSpec + Finished (2.0 RTT Complete!)
  steps.push({
    stepIndex: 4,
    title: "5. Server ChangeCipherSpec & Finished (2.0 RTT Handshake Complete)",
    description: "Server verifies Client Finished and sends its own Finished. Handshake took 2 full round-trips (2-RTT).",
    flight: 4,
    rttLabel: "2.0 RTT",
    from: "Server",
    to: "Client",
    phase: "application_traffic",
    activeRecord: createFinishedRecord({ fromClient: false, verifyData: "88a10bc4729104bc" }),
    keySchedule,
    certChain,
    clientState: { handshakeState: "CONNECTED", keysReady: "application_traffic" },
    serverState: { handshakeState: "CONNECTED", keysReady: "application_traffic" },
    cliOutputs: [
      { text: `SERVER -> CLIENT: ChangeCipherSpec (0x01)`, type: "info" },
      { text: `SERVER -> CLIENT: Finished`, type: "command" },
      { text: `TLS 1.2 Handshake Complete after 2.0 RTT (double the latency of TLS 1.3!)`, type: "warning" },
    ],
    eventExplanation: TLS_EXPLANATIONS.server_finished,
  });

  return {
    steps,
    finalKeySchedule: keySchedule,
    finalCertChain: certChain,
    totalRtt: 2.0,
    isHandshakeSuccess: true,
    securityRating: "B",
  };
}

/**
 * 3. TLS 1.3 0-RTT Early Data Resumption (RFC 8446 Section 4.2.10)
 */
function generateZeroRttPskSimulation(
  config: TlsConfig,
  certChain: TlsCertificateChain
): TlsSimulationOutcome {
  const steps: TlsSimulationStepState[] = [];
  const keySchedule = deriveHkdfKeySchedule("33ad89bc441098e210fa487e6b129845cd7820ab9384726150ef927483019284");

  // Flight 1: ClientHello + 0-RTT Early Data sent TOGETHER
  const clientHelloRecord = createClientHelloRecord({
    version: "TLS 1.3",
    sniHostname: config.sniHostname,
    namedGroup: config.namedGroup,
    cipherSuite: config.cipherSuite,
    alpnProtocol: config.alpnProtocol,
    isEarlyDataPsk: true,
  });

  steps.push({
    stepIndex: 0,
    title: "1. ClientHello + 0-RTT Early Data (Flight 1)",
    description: "Client sends ClientHello with PSK identity AND immediately transmits encrypted HTTP GET in 0.0 RTT!",
    flight: 1,
    rttLabel: "0.0 RTT",
    from: "Client",
    to: "Server",
    phase: "early_data_0rtt",
    activeRecord: clientHelloRecord,
    keySchedule,
    certChain,
    clientState: { handshakeState: "0RttDataSent", keysReady: "early_data_0rtt" },
    serverState: { handshakeState: "Listening", keysReady: "cleartext" },
    cliOutputs: [
      { text: `CLIENT: Loaded cached Session Ticket from previous TLS connection`, type: "info" },
      { text: `CLIENT: Derived early_traffic_secret from PSK`, type: "success" },
      { text: `CLIENT -> SERVER: ClientHello + [0-RTT EarlyData: GET /api/v1/feed]`, type: "command" },
    ],
    eventExplanation: TLS_EXPLANATIONS.zero_rtt_early_data,
  });

  // Flight 2: ServerHello + EncryptedExtensions (EarlyData Accepted) + Finished
  const serverHelloRecord = createServerHelloRecord({
    version: "TLS 1.3",
    cipherSuite: config.cipherSuite,
    namedGroup: config.namedGroup,
  });

  steps.push({
    stepIndex: 1,
    title: "2. ServerHello & 0-RTT Acceptance (Flight 2)",
    description: "Server accepts the 0-RTT early data ticket, confirms PSK cipher, and responds with ServerHello.",
    flight: 2,
    rttLabel: "0.5 RTT",
    from: "Server",
    to: "Client",
    phase: "handshake_traffic",
    activeRecord: serverHelloRecord,
    keySchedule,
    certChain,
    clientState: { handshakeState: "HandshakeKeysReady", keysReady: "handshake_traffic" },
    serverState: { handshakeState: "ServerHelloSent", keysReady: "handshake_traffic" },
    cliOutputs: [
      { text: `SERVER: Validated PSK ticket freshness (No replay detected)`, type: "success" },
      { text: `SERVER -> CLIENT: ServerHello + {EncryptedExtensions: early_data_accepted}`, type: "command" },
    ],
    eventExplanation: TLS_EXPLANATIONS.server_hello,
  });

  // Flight 2 Cont: Server App Response
  const appDataResp = createApplicationDataRecord({
    payload: "HTTP/2 200 OK\r\ncontent-type: application/json\r\n\r\n{\"feed\": [\"item1\", \"item2\"], \"latency\": \"0-rtt\"}",
  });

  steps.push({
    stepIndex: 2,
    title: "3. Server Response to 0-RTT Request",
    description: "Server processes the early request and returns HTTP 200 OK without waiting for handshake completion!",
    flight: 2,
    rttLabel: "0.5 RTT",
    from: "Server",
    to: "Client",
    phase: "application_traffic",
    activeRecord: appDataResp,
    keySchedule,
    certChain,
    clientState: { handshakeState: "CONNECTED", keysReady: "application_traffic" },
    serverState: { handshakeState: "CONNECTED", keysReady: "application_traffic" },
    cliOutputs: [
      { text: `SERVER -> CLIENT: [ApplicationData] HTTP 200 OK response received in 0.5 RTT!`, type: "success" },
    ],
    eventExplanation: TLS_EXPLANATIONS.app_data_response,
  });

  return {
    steps,
    finalKeySchedule: keySchedule,
    finalCertChain: certChain,
    totalRtt: 0.0,
    isHandshakeSuccess: true,
    securityRating: "A",
  };
}

/**
 * 4. Mutual TLS (mTLS) Client Certificate Authentication
 */
function generateMtlsSimulation(
  config: TlsConfig,
  certChain: TlsCertificateChain
): TlsSimulationOutcome {
  const steps: TlsSimulationStepState[] = [];
  const outcome = generateTls13FullHandshakeSimulation(config, certChain);

  // Take the standard handshake and insert CertificateRequest & Client Certificate
  const certReqRecord: TlsRecordData = {
    contentType: 22,
    contentTypeName: "Handshake",
    legacyVersion: "0x0303",
    length: 64,
    phase: "handshake_traffic",
    isEncrypted: true,
    handshakeMessage: {
      type: 13,
      typeName: "CertificateRequest",
      length: 60,
      extensions: [],
    },
  };

  steps.push(...outcome.steps.slice(0, 3));

  steps.push({
    stepIndex: 3,
    title: "4. CertificateRequest (Server Demands Client Identity)",
    description: "Server sends CertificateRequest requiring the Client to prove its enterprise identity via X.509.",
    flight: 2,
    rttLabel: "1.0 RTT",
    from: "Server",
    to: "Client",
    phase: "handshake_traffic",
    activeRecord: certReqRecord,
    keySchedule: outcome.finalKeySchedule,
    certChain,
    clientState: { handshakeState: "ClientCertRequested", keysReady: "handshake_traffic" },
    serverState: { handshakeState: "CertificateRequestSent", keysReady: "handshake_traffic" },
    cliOutputs: [
      { text: `SERVER -> CLIENT: {CertificateRequest} [mTLS Enforcement Active]`, type: "command" },
    ],
    eventExplanation: TLS_EXPLANATIONS.mtls_certificate_request,
  });

  const clientCertRecord = createCertificateRecord({
    certChain: [DEFAULT_CLIENT_CERTIFICATE],
    phase: "handshake_traffic",
  });

  steps.push({
    stepIndex: 4,
    title: "5. Client Certificate & Client CertificateVerify",
    description: "Client presents its X.509 certificate and signs the handshake transcript with its private key.",
    flight: 3,
    rttLabel: "1.5 RTT",
    from: "Client",
    to: "Server",
    phase: "handshake_traffic",
    activeRecord: clientCertRecord,
    keySchedule: outcome.finalKeySchedule,
    certChain,
    clientState: { handshakeState: "ClientCertSent", keysReady: "handshake_traffic" },
    serverState: { handshakeState: "VerifyingClientCert", keysReady: "handshake_traffic" },
    cliOutputs: [
      { text: `CLIENT -> SERVER: {Certificate} [CommonName: ${DEFAULT_CLIENT_CERTIFICATE.commonName}]`, type: "command" },
      { text: `CLIENT -> SERVER: {CertificateVerify} [Client ECDSA signature over transcript]`, type: "command" },
      { text: `SERVER: Verified Client Certificate and Signature. Mutual authentication locked!`, type: "success" },
    ],
    eventExplanation: TLS_EXPLANATIONS.certificate_verify,
  });

  steps.push(...outcome.steps.slice(6));

  return {
    steps: steps.map((s, idx) => ({ ...s, stepIndex: idx })),
    finalKeySchedule: outcome.finalKeySchedule,
    finalCertChain: certChain,
    totalRtt: 1.0,
    isHandshakeSuccess: true,
    securityRating: "A+",
  };
}

/**
 * 5. PKI Chain of Trust & OCSP Stapling Validation
 */
function generatePkiChainValidationSimulation(
  config: TlsConfig,
  certChain: TlsCertificateChain
): TlsSimulationOutcome {
  return generateTls13FullHandshakeSimulation(config, certChain);
}

/**
 * 6. MITM Untrusted / Expired Certificate Attack Simulation
 */
function generateMitmUntrustedCertSimulation(
  config: TlsConfig,
  certChain: TlsCertificateChain
): TlsSimulationOutcome {
  const steps: TlsSimulationStepState[] = [];
  const clientHelloRecord = createClientHelloRecord({
    version: "TLS 1.3",
    sniHostname: config.sniHostname,
    namedGroup: config.namedGroup,
    cipherSuite: config.cipherSuite,
  });

  steps.push({
    stepIndex: 0,
    title: "1. ClientHello to Target Domain",
    description: `Client initiates connection to ${config.sniHostname}. An attacker proxy intercepts the TCP connection!`,
    flight: 1,
    rttLabel: "0.5 RTT",
    from: "Client",
    to: "Attacker",
    phase: "cleartext",
    activeRecord: clientHelloRecord,
    keySchedule: {},
    certChain,
    clientState: { handshakeState: "ClientHelloSent", keysReady: "cleartext" },
    serverState: { handshakeState: "Intercepted", keysReady: "cleartext" },
    cliOutputs: [
      { text: `CLIENT -> [NETWORK]: ClientHello [SNI: ${config.sniHostname}]`, type: "command" },
      { text: `ATTACKER: Intercepted TCP SYN/ACK stream! Presenting rogue certificate...`, type: "warning" },
    ],
    eventExplanation: TLS_EXPLANATIONS.client_hello,
  });

  const rogueCert = {
    ...SELF_SIGNED_CERTIFICATE,
    commonName: config.certStatus === "hostname_mismatch" ? "attacker-proxy.com" : config.sniHostname,
    status: config.certStatus,
  };

  const serverHelloRecord = createServerHelloRecord({
    version: "TLS 1.3",
    cipherSuite: config.cipherSuite,
    namedGroup: config.namedGroup,
  });

  steps.push({
    stepIndex: 1,
    title: "2. Attacker Returns Rogue Certificate",
    description: "Attacker transmits a rogue self-signed or expired certificate attempting to proxy credentials.",
    flight: 2,
    rttLabel: "1.0 RTT",
    from: "Attacker",
    to: "Client",
    phase: "cleartext",
    activeRecord: serverHelloRecord,
    keySchedule: {},
    certChain: {
      ...certChain,
      leaf: rogueCert,
      isValidChain: false,
    },
    clientState: { handshakeState: "CertChainVerifying", keysReady: "cleartext" },
    serverState: { handshakeState: "RogueCertInjected", keysReady: "cleartext" },
    cliOutputs: [
      { text: `ATTACKER -> CLIENT: ServerHello + {Certificate} [Untrusted Issuer / Bad Domain]`, type: "error" },
    ],
    eventExplanation: TLS_EXPLANATIONS.certificate,
  });

  const alertRecord = createAlertRecord({
    level: "fatal",
    description: "unknown_ca (48) / bad_certificate",
  });

  steps.push({
    stepIndex: 2,
    title: "3. Fatal TLS Alert: Handshake Rejected!",
    description: "Client PKI verification fails. Connection is aborted with a Fatal Alert; zero credentials leaked!",
    flight: 3,
    rttLabel: "1.5 RTT",
    from: "Client",
    to: "Attacker",
    phase: "cleartext",
    activeRecord: alertRecord,
    keySchedule: {},
    certChain: {
      ...certChain,
      leaf: rogueCert,
      isValidChain: false,
    },
    clientState: { handshakeState: "FAILED (SEC_ERROR_UNKNOWN_ISSUER)", keysReady: "cleartext" },
    serverState: { handshakeState: "CONNECTION_TERMINATED", keysReady: "cleartext" },
    cliOutputs: [
      { text: `CLIENT PKI: Failed trust anchor verification! Issuer is untrusted.`, type: "error" },
      { text: `CLIENT -> ATTACKER: Fatal Alert: unknown_ca (Code 48)`, type: "error" },
      { text: `CLIENT: Terminated TCP socket. Man-in-the-Middle attack blocked!`, type: "success" },
    ],
    eventExplanation: TLS_EXPLANATIONS.mitim_alert_rejection || TLS_EXPLANATIONS.mitm_alert_rejection,
  });

  return {
    steps,
    finalKeySchedule: {},
    finalCertChain: { ...certChain, leaf: rogueCert, isValidChain: false },
    totalRtt: 1.5,
    isHandshakeSuccess: false,
    securityRating: "F (Insecure)",
  };
}

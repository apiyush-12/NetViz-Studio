import type {
  HttpRequestData,
  HttpResponseData,
  HttpSimulationEvent,
  TlsHandshakeStep,
  HttpSimulationPacket,
  HttpSimulationOutcome,
  HttpScenarioId,
} from "./http.types";
import { defaultTlsCertificate, expiredTlsCertificate } from "./http.defaults";

export function simulateHttpRequest(
  request: HttpRequestData,
  scenarioId: HttpScenarioId = "https_tls13_handshake"
): HttpSimulationOutcome {
  const isExpiredScenario = scenarioId === "cert_expired_error";
  const isCacheScenario = scenarioId === "browser_cache_304";
  const isCorsScenario = scenarioId === "cors_preflight";
  const isCdnScenario = scenarioId === "cdn_edge_cache";

  const useHttps = request.scheme === "https" || request.useTls;
  const isHttp2 = request.version === "HTTP/2";
  const isHttp3 = request.version === "HTTP/3";
  const protocolName = isHttp3 ? "QUIC" : useHttps ? "HTTPS" : "HTTP";
  const port = useHttps ? 443 : 80;

  const events: HttpSimulationEvent[] = [];
  const tlsSteps: TlsHandshakeStep[] = [];
  const packets: HttpSimulationPacket[] = [];

  let stepCounter = 1;
  let totalRttMs = 0;

  // ── Step 1: TCP Handshake (or QUIC Handshake if HTTP/3) ──
  if (!isHttp3) {
    events.push({
      step: stepCounter,
      type: "tcp-handshake",
      title: `TCP SYN (Port ${port})`,
      summary: `Client initiates 3-way TCP handshake to ${request.host}:${port}.`,
      explanation: `Client sends TCP SYN packet with initial sequence number to establish reliable stream delivery.`,
      sourceNodeId: "client",
      destNodeId: isCdnScenario ? "cdn" : "web-server",
      protocol: "TCP",
      isEncrypted: false,
      rfcReference: "RFC 9293 (Transmission Control Protocol)",
      technicalDetails: [
        `Destination Port: ${port}`,
        "SYN Flag = 1, ACK Flag = 0",
        "Window Size: 65535, MSS: 1460 bytes",
      ],
    });

    packets.push({
      id: `pkt-${stepCounter}`,
      stepIndex: stepCounter - 1,
      sourceId: "client",
      targetId: isCdnScenario ? "cdn" : "web-server",
      protocol: "TCP",
      label: `TCP [SYN] :${port}`,
      isEncrypted: false,
      progress: 0,
      status: "delivered",
    });

    stepCounter++;
    totalRttMs += 15;

    events.push({
      step: stepCounter,
      type: "tcp-handshake",
      title: `TCP SYN-ACK & ACK (Connection Established)`,
      summary: `Server acknowledges SYN; 3-way handshake established on port ${port}.`,
      explanation: `Web server returns SYN+ACK; client confirms with ACK. Full-duplex byte stream is now open.`,
      sourceNodeId: isCdnScenario ? "cdn" : "web-server",
      destNodeId: "client",
      protocol: "TCP",
      isEncrypted: false,
      rfcReference: "RFC 9293 §3.4",
      technicalDetails: [
        "Server allocates socket buffer and returns ACK=ISN+1.",
        "Connection State: ESTABLISHED",
      ],
    });

    packets.push({
      id: `pkt-${stepCounter}`,
      stepIndex: stepCounter - 1,
      sourceId: isCdnScenario ? "cdn" : "web-server",
      targetId: "client",
      protocol: "TCP",
      label: "TCP [SYN, ACK]",
      isEncrypted: false,
      progress: 0,
      status: "delivered",
    });

    stepCounter++;
    totalRttMs += 15;
  }

  // ── Step 2: TLS 1.3 / 1.2 Handshake (if HTTPS) ──
  if (useHttps && !isExpiredScenario) {
    // 1. ClientHello
    tlsSteps.push({
      stepNumber: 1,
      name: "ClientHello",
      from: "Client Browser",
      to: isCdnScenario ? "Cloud Edge CDN" : "Origin Web Server",
      summary: "Transmits supported cipher suites, TLS 1.3 version, SNI, ALPN, and ECDHE key share (Curve25519).",
      protocol: request.tlsVersion,
      isEncrypted: false,
      rtt: 0.5,
      details: [
        `Server Name Indication (SNI): ${request.host}`,
        `ALPN: ${isHttp2 ? "h2, http/1.1" : "http/1.1"}`,
        "Supported Groups: X25519, secp256r1",
        "Key Share: Public Key X (32 bytes)",
        "Cipher Suites: TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256",
      ],
    });

    events.push({
      step: stepCounter,
      type: "tls-handshake",
      title: "TLS 1.3 ClientHello (SNI + Key Share)",
      summary: `Client initiates cryptographic handshake with Server Name Indication "${request.host}".`,
      explanation: `Client proposes TLS 1.3 parameters, sends ephemeral ECDHE key share, and requests ALPN negotiation.`,
      sourceNodeId: "client",
      destNodeId: isCdnScenario ? "cdn" : "web-server",
      protocol: "TLS",
      isEncrypted: false,
      rfcReference: "RFC 8446 §4.1.2 (Client Hello)",
      technicalDetails: [
        `SNI: ${request.host}`,
        "Cipher: TLS_AES_256_GCM_SHA384",
        "Key Exchange: ECDHE (Curve25519)",
      ],
    });

    packets.push({
      id: `pkt-${stepCounter}`,
      stepIndex: stepCounter - 1,
      sourceId: "client",
      targetId: isCdnScenario ? "cdn" : "web-server",
      protocol: "TLS",
      label: "TLS 1.3 ClientHello [KeyShare]",
      isEncrypted: false,
      progress: 0,
      status: "delivered",
    });

    stepCounter++;
    totalRttMs += 15;

    // 2. ServerHello & EncryptedExtensions
    tlsSteps.push({
      stepNumber: 2,
      name: "ServerHello & EncryptedExtensions",
      from: isCdnScenario ? "Cloud Edge CDN" : "Origin Web Server",
      to: "Client Browser",
      summary: "Selects cipher suite, provides server key share Y, and transmits X.509 Certificate and Signature.",
      protocol: request.tlsVersion,
      isEncrypted: true,
      rtt: 1.0,
      details: [
        "Cipher Selected: TLS_AES_256_GCM_SHA384",
        "Key Share: Server Public Key Y (32 bytes)",
        "Derived Master Secret & Handshake Traffic Keys",
        `Certificate: Subject CN=${defaultTlsCertificate.commonName}, Issuer=${defaultTlsCertificate.issuer}`,
        "CertificateVerify: ECDSA-SHA256 signature over handshake transcript",
        "Finished: HMAC authentication tag",
      ],
    });

    events.push({
      step: stepCounter,
      type: "tls-handshake",
      title: "TLS 1.3 ServerHello + Certificate Verified",
      summary: `Server completes 1-RTT key exchange; certificate validated against Root CA.`,
      explanation: `Client and Server derive shared symmetric session key (AES-256-GCM). Tunnel is now fully encrypted.`,
      sourceNodeId: isCdnScenario ? "cdn" : "web-server",
      destNodeId: "client",
      protocol: "TLS",
      isEncrypted: true,
      rfcReference: "RFC 8446 §4.1.3 & §4.4",
      technicalDetails: [
        "X.509 Chain Verified via Let's Encrypt CA",
        "Cipher: AES-256-GCM (Authenticated Encryption with Associated Data - AEAD)",
        "Symmetric Encryption Keys active for all application data",
      ],
    });

    packets.push({
      id: `pkt-${stepCounter}`,
      stepIndex: stepCounter - 1,
      sourceId: isCdnScenario ? "cdn" : "web-server",
      targetId: "client",
      protocol: "TLS",
      label: "TLS 1.3 ServerHello [Encrypted]",
      isEncrypted: true,
      progress: 0,
      status: "delivered",
    });

    stepCounter++;
    totalRttMs += 15;
  }

  // ── Step 3: Certificate Expired Failure Condition ──
  if (isExpiredScenario) {
    events.push({
      step: stepCounter,
      type: "error",
      title: "SEC_ERROR_EXPIRED_CERTIFICATE",
      summary: `TLS Handshake Aborted: Server certificate expired on ${expiredTlsCertificate.validTo}.`,
      explanation: `Client browser validates X.509 notAfter timestamp and rejects connection to prevent Man-in-the-Middle attacks.`,
      sourceNodeId: "client",
      destNodeId: "web-server",
      protocol: "TLS",
      isEncrypted: false,
      rfcReference: "RFC 5280 §4.1.2.5 (Validity Period)",
      technicalDetails: [
        `Certificate Valid: ${expiredTlsCertificate.validFrom} to ${expiredTlsCertificate.validTo}`,
        "Status: EXPIRED (Trust verification failed)",
        "Browser Alert: NET::ERR_CERT_DATE_INVALID",
      ],
    });

    const errorResponse: HttpResponseData = {
      statusCode: 0,
      statusText: "SSL Certificate Error",
      version: request.version,
      headers: {
        "Error-Code": "SEC_ERROR_EXPIRED_CERTIFICATE",
        "Certificate-Status": "Expired",
      },
      body: JSON.stringify({ error: "SSL Certificate Expired", code: "ERR_CERT_DATE_INVALID" }, null, 2),
      contentType: "application/json",
      contentLength: 68,
      timeMs: totalRttMs,
      cached: false,
      tlsSessionEstablished: false,
    };

    return {
      request,
      response: errorResponse,
      events,
      tlsHandshakeSteps: tlsSteps,
      packets,
      totalRttMs,
      isSecure: false,
    };
  }

  // ── Step 4: CORS Preflight (if OPTIONS or cross-origin scenario) ──
  if (isCorsScenario || request.method === "OPTIONS") {
    events.push({
      step: stepCounter,
      type: "cors-check",
      title: `CORS Preflight: OPTIONS ${request.path}`,
      summary: "Browser checks if cross-origin endpoint allows custom headers and methods.",
      explanation: "Sends Access-Control-Request-Method and Origin headers before dispatching actual mutation payload.",
      sourceNodeId: "client",
      destNodeId: "web-server",
      protocol: protocolName,
      isEncrypted: useHttps,
      rfcReference: "W3C Cross-Origin Resource Sharing",
      technicalDetails: [
        "Origin: https://shop.external.com",
        "Access-Control-Request-Method: POST",
        "Access-Control-Request-Headers: X-Custom-Auth",
      ],
    });

    packets.push({
      id: `pkt-${stepCounter}`,
      stepIndex: stepCounter - 1,
      sourceId: "client",
      targetId: "web-server",
      protocol: protocolName,
      label: "OPTIONS (CORS Preflight)",
      isEncrypted: useHttps,
      progress: 0,
      status: "delivered",
    });

    stepCounter++;
    totalRttMs += 20;

    const corsResponse: HttpResponseData = {
      statusCode: 204,
      statusText: "No Content",
      version: request.version,
      headers: {
        "Access-Control-Allow-Origin": "https://shop.external.com",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Custom-Auth",
        "Access-Control-Max-Age": "86400",
        Server: "Nginx/1.24",
      },
      body: "",
      contentType: "text/plain",
      contentLength: 0,
      timeMs: totalRttMs,
      cached: false,
      tlsSessionEstablished: useHttps,
    };

    return {
      request,
      response: corsResponse,
      events,
      tlsHandshakeSteps: tlsSteps,
      packets,
      totalRttMs,
      isSecure: useHttps,
    };
  }

  // ── Step 5: HTTP Request Transmission ──
  const requestHeadersSnapshot: Record<string, string> = {};
  request.headers.filter((h) => h.enabled).forEach((h) => {
    requestHeadersSnapshot[h.name] = h.value;
  });

  events.push({
    step: stepCounter,
    type: "http-request",
    title: `${request.method} ${request.path} (${request.version})`,
    summary: `Client dispatches ${request.method} request over ${useHttps ? "TLS tunnel" : "plaintext stream"}.`,
    explanation: `HTTP application request serialized with ${request.headers.length} headers and payload body.`,
    sourceNodeId: "client",
    destNodeId: isCdnScenario ? "cdn" : "web-server",
    protocol: protocolName,
    isEncrypted: useHttps,
    rfcReference: "RFC 9110 §9 (Method Definitions)",
    technicalDetails: [
      `Method: ${request.method}`,
      `URI: ${request.path}`,
      `Host: ${request.host}`,
      `Content-Length: ${request.body ? request.body.length : 0} bytes`,
    ],
    headersSnapshot: requestHeadersSnapshot,
    payloadSnapshot: request.body || undefined,
  });

  packets.push({
    id: `pkt-${stepCounter}`,
    stepIndex: stepCounter - 1,
    sourceId: "client",
    targetId: isCdnScenario ? "cdn" : "web-server",
    protocol: protocolName,
    label: `${request.method} ${request.path}`,
    isEncrypted: useHttps,
    progress: 0,
    status: "delivered",
  });

  stepCounter++;
  totalRttMs += isCdnScenario ? 15 : 45;

  // ── Step 6: Backend / Edge Resolution & Response ──
  let statusCode = 200;
  let statusText = "OK";
  let responseBody = "";
  let contentType = "application/json; charset=utf-8";
  const responseHeaders: Record<string, string> = {
    Date: new Date().toUTCString(),
    Server: isCdnScenario ? "cloudflare-edge" : "nginx/1.24.0 (Ubuntu)",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  };

  if (isCdnScenario) {
    responseHeaders["X-Cache"] = "HIT";
    responseHeaders["Age"] = "1420";
    responseHeaders["CF-Ray"] = "89e24a91b4028c11-IAD";
    responseHeaders["Cache-Control"] = "public, max-age=86400, immutable";
    contentType = "image/svg+xml";
    responseBody = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><text y="30" font-size="20" fill="#38bdf8">NetViz Studio CDN Asset</text></svg>`;
  } else if (isCacheScenario) {
    statusCode = 304;
    statusText = "Not Modified";
    responseHeaders["ETag"] = '"w/33a2-44512"';
    responseHeaders["Cache-Control"] = "public, max-age=3600, must-revalidate";
    responseBody = "";
  } else if (request.method === "POST") {
    statusCode = 201;
    statusText = "Created";
    responseHeaders["Location"] = `/v1/users/usr_${Math.floor(1000 + Math.random() * 9000)}`;
    responseBody = JSON.stringify(
      {
        id: "usr_9482",
        name: "Alex Mercer",
        email: "alex@network.local",
        role: "Network Architect",
        createdAt: new Date().toISOString(),
        status: "active",
      },
      null,
      2
    );
  } else if (request.method === "DELETE") {
    statusCode = 204;
    statusText = "No Content";
    responseBody = "";
  } else if (request.path.includes("invalid") || request.path.includes("missing")) {
    statusCode = 404;
    statusText = "Not Found";
    responseBody = JSON.stringify(
      {
        error: "Resource Not Found",
        message: `Endpoint ${request.path} does not exist on origin server.`,
        statusCode: 404,
      },
      null,
      2
    );
  } else {
    // Standard GET response
    statusCode = 200;
    statusText = "OK";
    responseHeaders["ETag"] = '"w/7f8a-98124"';
    responseHeaders["Cache-Control"] = "private, max-age=120";
    responseBody = JSON.stringify(
      {
        page: 1,
        totalUsers: 4,
        users: [
          { id: "usr_101", name: "Alice Zhang", role: "Core Engineer", ip: "10.0.1.10" },
          { id: "usr_102", name: "Bob Martin", role: "DevOps Lead", ip: "10.0.1.11" },
          { id: "usr_103", name: "Charlie Davis", role: "Security SecOps", ip: "10.0.1.12" },
          { id: "usr_104", name: "Dana White", role: "Cloud Architect", ip: "10.0.1.13" },
        ],
        serverCluster: "us-east-cluster-01",
      },
      null,
      2
    );
  }

  responseHeaders["Content-Type"] = contentType;
  responseHeaders["Content-Length"] = String(responseBody.length);

  events.push({
    step: stepCounter,
    type: "http-response",
    title: `HTTP ${statusCode} ${statusText}`,
    summary: `Server returns HTTP ${statusCode} response with ${responseBody.length} bytes payload.`,
    explanation: `Response delivered back to client with status headers, security policies, and entity body.`,
    sourceNodeId: isCdnScenario ? "cdn" : "web-server",
    destNodeId: "client",
    protocol: protocolName,
    isEncrypted: useHttps,
    rfcReference: `RFC 9110 §15 (Status Code ${statusCode})`,
    technicalDetails: [
      `Status: ${statusCode} ${statusText}`,
      `Content-Type: ${contentType}`,
      `Payload Size: ${responseBody.length} bytes`,
      `Protocol: ${request.version}`,
    ],
    headersSnapshot: responseHeaders,
    payloadSnapshot: responseBody || undefined,
    statusCode,
  });

  packets.push({
    id: `pkt-${stepCounter}`,
    stepIndex: stepCounter - 1,
    sourceId: isCdnScenario ? "cdn" : "web-server",
    targetId: "client",
    protocol: protocolName,
    label: `${statusCode} ${statusText}`,
    isEncrypted: useHttps,
    progress: 0,
    status: "delivered",
  });

  const finalResponse: HttpResponseData = {
    statusCode,
    statusText,
    version: request.version,
    headers: responseHeaders,
    body: responseBody,
    contentType,
    contentLength: responseBody.length,
    timeMs: totalRttMs,
    cached: isCdnScenario || isCacheScenario,
    tlsSessionEstablished: useHttps,
  };

  return {
    request,
    response: finalResponse,
    events,
    tlsHandshakeSteps: tlsSteps,
    packets,
    totalRttMs,
    isSecure: useHttps,
  };
}

import type { ProtocolModule, ExplanationSection } from "@/features/protocols/shared/protocol-types";
import type { SimulationEventType } from "@/features/simulation/simulation-types";
import { defaultHttpRequestData, defaultHttpNodes, defaultHttpLinks } from "./http.defaults";
import { simulateHttpRequest } from "./http.simulator";
import { httpConfigSchema } from "./http.schema";

const HTTP_EXPLANATION_SECTIONS: ExplanationSection[] = [
  {
    eventType: "handshake-step",
    beginner: {
      whatHappened: "A client established a TCP connection and negotiated a TLS 1.3 cryptographic session.",
      whyItHappened: "HTTPS requires mutual authentication and symmetric encryption keys before sending HTTP requests.",
      protocolRule: "RFC 8446: TLS 1.3 achieves 1-RTT handshake using Elliptic-Curve Diffie-Hellman (ECDHE).",
      fieldsChanged: ["tlsState", "cipherSuite", "sessionKey"],
      whatHappensNext: "The client sends encrypted HTTP GET/POST request frames across the TLS record layer.",
      misconception: "TLS encryption does not noticeably slow down modern connections thanks to hardware AES-NI acceleration.",
      realWorldUse: "Protects online banking, passwords, e-commerce, and API requests from eavesdropping.",
    },
    advanced: {
      whatHappened: "ClientHello / ServerHello exchanged with SupportedVersions, KeyShare (X25519), and Server Certificate.",
      whyItHappened: "Derives ephemeral Master Secrets and Handshake Traffic Keys using HKDF-Extract and HKDF-Expand.",
      protocolRule: "RFC 8446 Section 4: 1-RTT cryptographic handshake with AEAD cipher AES-256-GCM-SHA384.",
      fieldsChanged: ["tls.client_random", "tls.key_share", "tls.server_cert", "tls.finished"],
      whatHappensNext: "Application traffic is encapsulated in TLS InnerPlaintext encrypted with AEAD keys.",
      misconception: "TLS 1.3 completely removed insecure legacy ciphers (RSA static key exchange, CBC mode, RC4).",
      realWorldUse: "Global web security standard powering 99%+ of modern internet traffic.",
    },
  },
  {
    eventType: "packet-created",
    beginner: {
      whatHappened: "The web server processed the HTTP request and returned a status code and payload.",
      whyItHappened: "The client requested an API endpoint or web resource (/v1/users or /index.html).",
      protocolRule: "RFC 9110: HTTP response consists of a status line, response headers, and optional body payload.",
      fieldsChanged: ["statusCode", "responseHeaders", "responseBody"],
      whatHappensNext: "The browser parses the payload, applies security headers, and caches the content according to Cache-Control.",
      misconception: "HTTP 304 Not Modified does not send a body; it tells the client to use its cached version.",
      realWorldUse: "Powers all REST APIs, Single Page Applications, and web document retrieval worldwide.",
    },
    advanced: {
      whatHappened: "HTTP/2 stream frame delivered with HEADERS and DATA frames carrying status and payload.",
      whyItHappened: "Endpoint resolved and payload serialized with Content-Type application/json or text/html.",
      protocolRule: "RFC 9113: HTTP/2 binary framing multiplexes multiple concurrent streams across a single connection.",
      fieldsChanged: ["http2.stream_id", "http2.flags", "http.status_code"],
      whatHappensNext: "Stream transitions to half-closed/closed state while maintaining underlying TCP socket.",
      misconception: "HTTP/2 multiplexing eliminates Head-of-Line blocking at application layer, though packet loss still affects TCP.",
      realWorldUse: "High-performance microservices and modern web frontends.",
    },
  },
];

export const httpModule: ProtocolModule = {
  id: "http",
  name: "HTTP / HTTPS",
  category: "services",
  layer: "Application (Layer 7)",
  summary: "Hypertext Transfer Protocol (Secure) — client-server web requests, TLS 1.3 encryption, HTTP/2 multiplexing, headers & caching.",
  status: "implemented",
  learningObjectives: [
    "Understand the complete HTTP request/response transaction lifecycle and status code families (2xx, 3xx, 4xx, 5xx).",
    "Trace 1-RTT cryptographic TLS 1.3 handshakes, ECDHE key exchange, and X.509 certificate validation.",
    "Compare plaintext HTTP (Port 80) against TLS-encrypted HTTPS (Port 443).",
    "Explore HTTP/1.1 head-of-line blocking vs HTTP/2 binary framing and stream multiplexing.",
    "Inspect security headers (HSTS, CORS, CSP) and conditional caching with ETags (304 Not Modified).",
  ],
  simplificationNotes: [
    "Simulates TLS 1.3 Curve25519 ECDHE key derivation and modern AES-256-GCM AEAD encryption.",
    "Models browser request building, header inspection, and edge reverse proxy caching behavior.",
  ],
  defaultTopology: {
    nodes: defaultHttpNodes.map((n) => ({
      id: n.id,
      type: n.type === "client" ? "host" : "server",
      label: n.name,
      position: n.position,
    })),
    edges: defaultHttpLinks.map((l) => ({
      id: l.id,
      source: l.sourceNodeId,
      target: l.targetNodeId,
    })),
  },
  configurationSchema: httpConfigSchema,
  defaultConfiguration: {
    scheme: defaultHttpRequestData.scheme,
    method: defaultHttpRequestData.method,
    version: defaultHttpRequestData.version,
    url: defaultHttpRequestData.url,
  },
  generateSimulation: () => {
    const outcome = simulateHttpRequest(defaultHttpRequestData);
    return {
      events: outcome.events.map((e, idx) => ({
        id: `http-evt-${e.step}`,
        timestamp: e.step * 50,
        sequenceNumber: idx + 1,
        type: (e.type === "error" ? "packet-dropped" : "handshake-step") as SimulationEventType,
        sourceNodeId: e.sourceNodeId,
        destinationNodeId: e.destNodeId,
        protocol: e.protocol,
        title: e.title,
        description: e.explanation,
        status: "completed" as const,
        severity: e.type === "error" ? ("error" as const) : ("info" as const),
        packetId: `pkt-${e.step}`,
      })),
      packets: outcome.packets.map((p) => ({
        id: p.id,
        protocol: p.protocol,
        label: p.label,
        source: p.sourceId,
        destination: p.targetId,
        headers: {
          application: {
            method: p.method || p.label,
            encrypted: String(p.isEncrypted),
          },
        },
        size: 120,
        status: "delivered" as const,
        colorKey: p.isEncrypted ? "#10b981" : "#38bdf8",
        createdAt: p.stepIndex * 50,
      })),
      initialState: {
        request: defaultHttpRequestData,
        response: outcome.response,
      },
    };
  },
  packetFields: [
    { layer: "Application", name: "protocol", description: "Application or transport protocol layer" },
    { layer: "Application", name: "method", description: "HTTP verb or response code" },
    { layer: "Application", name: "encrypted", description: "Whether payload is protected by AEAD session keys" },
  ],
  explanationSections: HTTP_EXPLANATION_SECTIONS,
};

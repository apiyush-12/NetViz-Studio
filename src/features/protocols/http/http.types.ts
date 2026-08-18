export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";

export type HttpVersion = "HTTP/1.1" | "HTTP/2" | "HTTP/3";

export type HttpScheme = "http" | "https";

export type HttpScenarioId =
  | "simple_get"
  | "https_tls13_handshake"
  | "rest_api_post"
  | "browser_cache_304"
  | "cors_preflight"
  | "cert_expired_error"
  | "http2_multiplexing"
  | "cdn_edge_cache";

export type HttpNodeType = "client" | "cdn" | "web-server" | "api-server" | "ca-server";

export interface HttpNode {
  id: string;
  name: string;
  type: HttpNodeType;
  ipAddress: string;
  port: number;
  position: { x: number; y: number };
  roleDescription: string;
  status: "active" | "degraded" | "down";
  tlsCertificate?: TlsCertificate;
}

export interface HttpLink {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  latencyMs: number;
  label?: string;
  encrypted: boolean;
}

export interface HttpHeader {
  name: string;
  value: string;
  enabled: boolean;
  category?: "general" | "security" | "caching" | "auth" | "cors";
  description?: string;
}

export interface HttpRequestData {
  scheme: HttpScheme;
  method: HttpMethod;
  url: string;
  host: string;
  path: string;
  version: HttpVersion;
  headers: HttpHeader[];
  body: string;
  useTls: boolean;
  tlsVersion: "TLS 1.2" | "TLS 1.3";
}

export interface HttpResponseData {
  statusCode: number;
  statusText: string;
  version: HttpVersion;
  headers: Record<string, string>;
  body: string;
  contentType: string;
  contentLength: number;
  timeMs: number;
  cached: boolean;
  tlsSessionEstablished: boolean;
}

export interface TlsCertificate {
  commonName: string;
  subjectAltNames: string[];
  issuer: string;
  validFrom: string;
  validTo: string;
  isExpired?: boolean;
  keyAlgorithm: string;
  cipherSuite: string;
  fingerprint: string;
}

export interface TlsHandshakeStep {
  stepNumber: number;
  name: string;
  from: string;
  to: string;
  summary: string;
  details: string[];
  protocol: "TLS 1.2" | "TLS 1.3" | "TCP" | "QUIC";
  isEncrypted: boolean;
  rtt: number;
}

export interface HttpSimulationPacket {
  id: string;
  stepIndex: number;
  sourceId: string;
  targetId: string;
  protocol: "TCP" | "TLS" | "HTTP" | "HTTPS" | "QUIC";
  label: string;
  method?: string;
  isEncrypted: boolean;
  progress: number;
  status: "in-flight" | "delivered" | "failed";
}

export interface HttpSimulationEvent {
  step: number;
  type: "tcp-handshake" | "tls-handshake" | "http-request" | "http-response" | "caching" | "cors-check" | "error";
  title: string;
  summary: string;
  explanation: string;
  sourceNodeId: string;
  destNodeId: string;
  protocol: "TCP" | "TLS" | "HTTP" | "HTTPS" | "QUIC";
  isEncrypted: boolean;
  rfcReference: string;
  technicalDetails: string[];
  headersSnapshot?: Record<string, string>;
  payloadSnapshot?: string;
  statusCode?: number;
}

export interface HttpSimulationOutcome {
  request: HttpRequestData;
  response: HttpResponseData;
  events: HttpSimulationEvent[];
  tlsHandshakeSteps: TlsHandshakeStep[];
  packets: HttpSimulationPacket[];
  totalRttMs: number;
  isSecure: boolean;
}

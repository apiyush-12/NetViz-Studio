import type {
  HttpNode,
  HttpLink,
  HttpRequestData,
  TlsCertificate,
  HttpScenarioId,
} from "./http.types";

export const defaultTlsCertificate: TlsCertificate = {
  commonName: "api.network.local",
  subjectAltNames: ["api.network.local", "www.network.local", "network.local"],
  issuer: "Let's Encrypt Authority X3",
  validFrom: "2026-01-01",
  validTo: "2027-01-01",
  isExpired: false,
  keyAlgorithm: "ECDSA (secp256r1) with SHA-256",
  cipherSuite: "TLS_AES_256_GCM_SHA384",
  fingerprint: "7B:4E:2A:91:D4:5C:88:99:3F:12:0A:45:67:89:BC:DE",
};

export const expiredTlsCertificate: TlsCertificate = {
  ...defaultTlsCertificate,
  validFrom: "2024-01-01",
  validTo: "2025-01-01",
  isExpired: true,
};

export const defaultHttpNodes: HttpNode[] = [
  {
    id: "client",
    name: "Client Browser",
    type: "client",
    ipAddress: "192.168.1.100",
    port: 54321,
    position: { x: 70, y: 240 },
    roleDescription: "User Browser initiating HTTP/HTTPS requests & rendering responses",
    status: "active",
  },
  {
    id: "cdn",
    name: "Cloud Edge (CDN / WAF)",
    type: "cdn",
    ipAddress: "104.16.123.45",
    port: 443,
    position: { x: 210, y: 150 },
    roleDescription: "Anycast Edge Reverse Proxy with SSL termination & static caching",
    status: "active",
    tlsCertificate: defaultTlsCertificate,
  },
  {
    id: "web-server",
    name: "Origin Web Server",
    type: "web-server",
    ipAddress: "10.0.1.50",
    port: 443,
    position: { x: 360, y: 240 },
    roleDescription: "Nginx / Node.js Backend processing API requests & dynamic responses",
    status: "active",
    tlsCertificate: defaultTlsCertificate,
  },
  {
    id: "api-server",
    name: "Database & Microservice",
    type: "api-server",
    ipAddress: "10.0.2.100",
    port: 5432,
    position: { x: 490, y: 150 },
    roleDescription: "Internal database & microservice storing persistent resources",
    status: "active",
  },
  {
    id: "ca-server",
    name: "Root CA (PKI / Trust)",
    type: "ca-server",
    ipAddress: "198.51.100.1",
    port: 443,
    position: { x: 280, y: 350 },
    roleDescription: "Certificate Authority validating digital certificates & CRLs",
    status: "active",
  },
];

export const defaultHttpLinks: HttpLink[] = [
  {
    id: "link-client-cdn",
    sourceNodeId: "client",
    targetNodeId: "cdn",
    latencyMs: 15,
    label: "Edge 15ms",
    encrypted: true,
  },
  {
    id: "link-client-web",
    sourceNodeId: "client",
    targetNodeId: "web-server",
    latencyMs: 45,
    label: "Direct 45ms",
    encrypted: true,
  },
  {
    id: "link-cdn-web",
    sourceNodeId: "cdn",
    targetNodeId: "web-server",
    latencyMs: 30,
    label: "Origin Fetch 30ms",
    encrypted: true,
  },
  {
    id: "link-web-api",
    sourceNodeId: "web-server",
    targetNodeId: "api-server",
    latencyMs: 2,
    label: "LAN 2ms",
    encrypted: false,
  },
  {
    id: "link-client-ca",
    sourceNodeId: "client",
    targetNodeId: "ca-server",
    latencyMs: 25,
    label: "OCSP / PKI 25ms",
    encrypted: true,
  },
];

export const defaultHttpRequestData: HttpRequestData = {
  scheme: "https",
  method: "GET",
  url: "https://api.network.local/v1/users",
  host: "api.network.local",
  path: "/v1/users",
  version: "HTTP/2",
  headers: [
    { name: "Host", value: "api.network.local", enabled: true, category: "general", description: "Target domain name" },
    { name: "User-Agent", value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) NetViz/1.0", enabled: true, category: "general" },
    { name: "Accept", value: "application/json, text/plain, */*", enabled: true, category: "general" },
    { name: "Authorization", value: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", enabled: true, category: "auth", description: "JWT Access Token" },
    { name: "Accept-Encoding", value: "gzip, deflate, br", enabled: true, category: "general" },
    { name: "Cache-Control", value: "no-cache", enabled: false, category: "caching" },
  ],
  body: "",
  useTls: true,
  tlsVersion: "TLS 1.3",
};

export const samplePostRequestData: HttpRequestData = {
  scheme: "https",
  method: "POST",
  url: "https://api.network.local/v1/users",
  host: "api.network.local",
  path: "/v1/users",
  version: "HTTP/2",
  headers: [
    { name: "Host", value: "api.network.local", enabled: true, category: "general" },
    { name: "Content-Type", value: "application/json", enabled: true, category: "general" },
    { name: "Authorization", value: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", enabled: true, category: "auth" },
    { name: "Origin", value: "https://app.network.local", enabled: true, category: "cors" },
  ],
  body: JSON.stringify(
    {
      name: "Alex Mercer",
      email: "alex@network.local",
      role: "Network Architect",
      department: "Infrastructure & Security",
    },
    null,
    2
  ),
  useTls: true,
  tlsVersion: "TLS 1.3",
};

export const httpScenarios: Array<{
  id: HttpScenarioId;
  name: string;
  badge: string;
  description: string;
  request: Partial<HttpRequestData>;
}> = [
  {
    id: "https_tls13_handshake",
    name: "HTTPS + TLS 1.3 Handshake",
    badge: "RFC 8446",
    description: "1-RTT TLS 1.3 cryptographic key exchange (ECDHE) with AES-GCM encryption.",
    request: {
      scheme: "https",
      method: "GET",
      url: "https://api.network.local/v1/users",
      path: "/v1/users",
      useTls: true,
      tlsVersion: "TLS 1.3",
      version: "HTTP/2",
    },
  },
  {
    id: "simple_get",
    name: "Plaintext HTTP/1.1 (Port 80)",
    badge: "RFC 9112",
    description: "Standard unencrypted HTTP/1.1 GET request over cleartext TCP port 80.",
    request: {
      scheme: "http",
      method: "GET",
      url: "http://api.network.local/index.html",
      path: "/index.html",
      useTls: false,
      version: "HTTP/1.1",
      headers: [
        { name: "Host", value: "api.network.local", enabled: true, category: "general" },
        { name: "Accept", value: "text/html, application/xhtml+xml", enabled: true, category: "general" },
      ],
      body: "",
    },
  },
  {
    id: "rest_api_post",
    name: "REST API POST with JSON & JWT",
    badge: "201 Created",
    description: "Authenticated POST request creating a new user record with JSON payload.",
    request: samplePostRequestData,
  },
  {
    id: "browser_cache_304",
    name: "Conditional Cache (ETag / 304)",
    badge: "RFC 9111",
    description: "Browser sends If-None-Match header; server returns 304 Not Modified without payload.",
    request: {
      scheme: "https",
      method: "GET",
      url: "https://api.network.local/assets/app.js",
      path: "/assets/app.js",
      useTls: true,
      version: "HTTP/2",
      headers: [
        { name: "Host", value: "api.network.local", enabled: true, category: "general" },
        { name: "If-None-Match", value: '"w/33a2-44512"', enabled: true, category: "caching" },
      ],
      body: "",
    },
  },
  {
    id: "cors_preflight",
    name: "CORS Preflight (OPTIONS)",
    badge: "W3C CORS",
    description: "Cross-Origin preflight request checking allowed methods & headers before POST.",
    request: {
      scheme: "https",
      method: "OPTIONS",
      url: "https://api.network.local/v1/payments",
      path: "/v1/payments",
      useTls: true,
      version: "HTTP/2",
      headers: [
        { name: "Host", value: "api.network.local", enabled: true, category: "general" },
        { name: "Origin", value: "https://shop.external.com", enabled: true, category: "cors" },
        { name: "Access-Control-Request-Method", value: "POST", enabled: true, category: "cors" },
        { name: "Access-Control-Request-Headers", value: "X-Custom-Auth", enabled: true, category: "cors" },
      ],
      body: "",
    },
  },
  {
    id: "cert_expired_error",
    name: "TLS Certificate Expired (SEC_ERROR)",
    badge: "PKI Alert",
    description: "Browser rejects connection due to expired X.509 certificate timestamp.",
    request: {
      scheme: "https",
      method: "GET",
      url: "https://expired.network.local/secure",
      path: "/secure",
      useTls: true,
      tlsVersion: "TLS 1.3",
      version: "HTTP/2",
    },
  },
  {
    id: "http2_multiplexing",
    name: "HTTP/2 Binary Stream Multiplexing",
    badge: "RFC 9113",
    description: "Multiple parallel streams (HTML, CSS, JS, Images) interleaved over a single TCP connection.",
    request: {
      scheme: "https",
      method: "GET",
      url: "https://api.network.local/dashboard",
      path: "/dashboard",
      useTls: true,
      version: "HTTP/2",
    },
  },
  {
    id: "cdn_edge_cache",
    name: "CDN Edge Cache HIT (X-Cache: HIT)",
    badge: "Cloud Edge",
    description: "Edge reverse proxy intercepts request and serves static asset from cache memory.",
    request: {
      scheme: "https",
      method: "GET",
      url: "https://api.network.local/static/logo.svg",
      path: "/static/logo.svg",
      useTls: true,
      version: "HTTP/2",
    },
  },
];

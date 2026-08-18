export interface HttpExplanation {
  title: string;
  summary: string;
  rfcReference: string;
  technicalDetails: string[];
  troubleshootingTips: string[];
  securityNotes?: string[];
}

export function getHttpEventExplanation(
  eventType: string,
  statusCode?: number,
  mode: "simple" | "advanced" = "simple"
): HttpExplanation {
  const isAdvanced = mode === "advanced";

  if (eventType === "tls-handshake") {
    return {
      title: "TLS 1.3 Cryptographic Handshake",
      summary: isAdvanced
        ? "1-RTT handshake negotiating ephemeral Elliptic Curve Diffie-Hellman key exchange (ECDHE) and authenticating server identity via X.509 certificate."
        : "The client and server establish an encrypted, secure connection before sending any web data.",
      rfcReference: "RFC 8446 (The Transport Layer Security (TLS) Protocol Version 1.3)",
      technicalDetails: [
        "ClientHello transmits supported cipher suites and key share (Curve25519 / secp256r1).",
        "ServerHello chooses the cipher suite (e.g. TLS_AES_256_GCM_SHA384) and sends server key share.",
        "Server sends encrypted Certificate and CertificateVerify signature.",
        "Handshake completes in 1 Round-Trip Time (1-RTT) vs 2-RTT in legacy TLS 1.2.",
        "All subsequent HTTP traffic is encrypted with symmetric session keys.",
      ],
      troubleshootingTips: [
        "Verify Server Name Indication (SNI) matches domain name on the certificate.",
        "Ensure client trust store contains the Root CA issuing the intermediate certificate.",
        "Check ALPN (Application-Layer Protocol Negotiation) for 'h2' or 'http/1.1' support.",
      ],
      securityNotes: [
        "Forward Secrecy: Compromising the server's long-term private key cannot decrypt past recorded sessions.",
        "Plaintext eavesdroppers see only randomized ciphertext.",
      ],
    };
  }

  if (eventType === "cors-check") {
    return {
      title: "CORS Preflight Check (Cross-Origin Resource Sharing)",
      summary: isAdvanced
        ? "Browser-enforced security mechanism using HTTP OPTIONS to verify if cross-origin server permits the requested method and custom headers."
        : "A security check made by your browser before sending data to a different website or domain.",
      rfcReference: "W3C Fetch Standard / RFC 6454 (The Web Origin Concept)",
      technicalDetails: [
        "Browser automatically dispatches OPTIONS request when request is not 'simple'.",
        "Headers include Origin, Access-Control-Request-Method, Access-Control-Request-Headers.",
        "Server replies with Access-Control-Allow-Origin, Allow-Methods, and Max-Age cache duration.",
      ],
      troubleshootingTips: [
        "Ensure server sets 'Access-Control-Allow-Origin: <origin>' instead of omitting it.",
        "For credentialed requests (cookies/Authorization), origin must be explicit (not '*').",
      ],
      securityNotes: [
        "Prevents malicious third-party websites from reading sensitive intranet or API data.",
      ],
    };
  }

  if (eventType === "caching") {
    return {
      title: "HTTP Conditional Cache Validation (304 Not Modified)",
      summary: isAdvanced
        ? "Revalidation of cached client representation using ETag validator or Last-Modified timestamps."
        : "The browser already has this file saved; the server confirms it has not changed, saving bandwidth.",
      rfcReference: "RFC 9111 (HTTP Caching)",
      technicalDetails: [
        "Client sends 'If-None-Match: <etag>' or 'If-Modified-Since: <timestamp>'.",
        "Server compares hash against current entity state.",
        "Server sends 304 Not Modified with no response body, preserving data transfer.",
      ],
      troubleshootingTips: [
        "Use strong ETags (e.g. SHA-256 hash of content) for reliable cache invalidation.",
        "Set Cache-Control: max-age, s-maxage, immutable on static content.",
      ],
    };
  }

  if (statusCode === 200) {
    return {
      title: "200 OK (Successful Request)",
      summary: "The request has succeeded and the payload body contains the requested resource.",
      rfcReference: "RFC 9110 §15.3.1 (200 OK)",
      technicalDetails: [
        "Standard response for successful HTTP GET, POST, or PUT actions.",
        "Response includes Content-Type (e.g. application/json, text/html) and Content-Length.",
      ],
      troubleshootingTips: [
        "Verify JSON schema or HTML markup matches client consumer expectations.",
      ],
    };
  }

  if (statusCode === 201) {
    return {
      title: "201 Created (Resource Created)",
      summary: "The request has succeeded and led to the creation of a new resource on the server.",
      rfcReference: "RFC 9110 §15.3.2 (201 Created)",
      technicalDetails: [
        "Primary response to successful REST API POST requests.",
        "Location header typically indicates URI of the newly created resource.",
      ],
      troubleshootingTips: [
        "Include newly created entity identifier and representation in response body.",
      ],
    };
  }

  if (statusCode === 304) {
    return {
      title: "304 Not Modified (Cache Validated)",
      summary: "The server indicates that the client's cached copy of the resource is up to date.",
      rfcReference: "RFC 9110 §15.4.5 (304 Not Modified)",
      technicalDetails: [
        "Response contains only headers (ETag, Cache-Control, Date), zero message body.",
        "Significantly decreases page load times and bandwidth consumption.",
      ],
      troubleshootingTips: [
        "Ensure web servers (Nginx, Cloudflare) preserve ETag headers across gzip compression.",
      ],
    };
  }

  if (statusCode === 401) {
    return {
      title: "401 Unauthorized (Authentication Required)",
      summary: "The request lacks valid authentication credentials for the target resource.",
      rfcReference: "RFC 9110 §15.5.2 (401 Unauthorized)",
      technicalDetails: [
        "Server requires an Authorization header (e.g. Bearer JWT token, API key, Basic auth).",
        "Server includes WWW-Authenticate header defining the challenge scheme.",
      ],
      troubleshootingTips: [
        "Check if JWT token has expired or if API key is invalid.",
      ],
    };
  }

  if (statusCode === 404) {
    return {
      title: "404 Not Found (Resource Missing)",
      summary: "The origin server did not find a current representation for the target resource URI.",
      rfcReference: "RFC 9110 §15.5.5 (404 Not Found)",
      technicalDetails: [
        "Indicates the endpoint URI path does not exist on the server router.",
        "May be temporary or permanent; does not imply whether condition is transient.",
      ],
      troubleshootingTips: [
        "Check URL route spelling, path parameters, and HTTP method matching.",
      ],
    };
  }

  if (statusCode && statusCode >= 500) {
    return {
      title: `${statusCode} Server Error`,
      summary: "The server encountered an unexpected condition or gateway failure preventing request completion.",
      rfcReference: "RFC 9110 §15.6 (Server Errors 5xx)",
      technicalDetails: [
        "500 Internal Error: Unhandled exception in backend application code.",
        "502 Bad Gateway: Reverse proxy failed to get valid response from upstream service.",
        "503 Service Unavailable: Server overloaded or undergoing maintenance.",
      ],
      troubleshootingTips: [
        "Inspect backend application logs and database connection pool health.",
      ],
    };
  }

  return {
    title: "HTTP Request / Response Transaction",
    summary: isAdvanced
      ? "Stateless application-layer client-server request/response protocol operating over TCP/TLS."
      : "Standard communication between a web browser and an internet server.",
    rfcReference: "RFC 9110 (HTTP Semantics) & RFC 9112 (HTTP/1.1)",
    technicalDetails: [
      "Client specifies Method, Path, Protocol Version, and Headers.",
      "Server processes request and returns 3-digit Status Code, Headers, and Payload.",
    ],
    troubleshootingTips: [
      "Use Network Developer Tools (F12) to inspect request and response headers.",
    ],
  };
}

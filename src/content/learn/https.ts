import type { LearningTopic } from "@/data/learning-content";

export const httpsTopic: LearningTopic = {
  id: "https",
  title: "HTTPS",
  subtitle: "Hypertext Transfer Protocol Secure — HTTP encapsulated inside TLS encryption (TCP Port 443)",
  category: "security",
  readTime: "8 min",
  summary:
    "HTTPS (HTTP Secure, RFC 2818) is the secure version of HTTP. Operating over TCP port 443, HTTPS wraps standard HTTP request and response messages inside a TLS (Transport Layer Security) encrypted session.",
  keyTakeaways: [
    "Operates at Layer 7 over TCP port 443 by default.",
    "Combines HTTP application semantics with TLS cryptographic security.",
    "Protects web traffic with Encryption, Server Authentication, and Data Integrity.",
    "Prevents Wi-Fi eavesdropping, ISP traffic monitoring, and Man-in-the-Middle tampering.",
    "Critical Note: HTTPS protects data IN TRANSIT, but does NOT guarantee that the website content itself is trustworthy or malware-free.",
  ],
  diagram: {
    title: "HTTPS Encrypted Connection Flow",
    textRepresentation: `HTTPS Session Setup Flow:
Browser                                                    Web Server
   │ ─────────── 1. TCP 3-Way Handshake (Port 443) ───────────► │
   │ ─────────── 2. TLS Handshake & Cert Validation ──────────► │
   │                                                            │
   [ Secure TLS Session Established — Symmetric Key Active ]   │
   │                                                            │
   │ ═══════════ 3. Encrypted GET /index.html ════════════════► │
   │ ◄══════════ 4. Encrypted 200 OK Response ═════════════════ │`,
  },
  importantTerms: [
    { term: "Port 443", definition: "The default TCP port for HTTPS encrypted web connections." },
    { term: "TLS Encapsulation", definition: "Encrypting HTTP headers and body bytes before sending over TCP." },
    { term: "Secure Cookies", definition: "Cookies flagged with 'Secure' attribute, instructing browsers never to send them over unencrypted HTTP." },
    { term: "Mixed Content Error", definition: "A browser security warning occurring when an HTTPS page loads unencrypted HTTP scripts or images." },
    { term: "HSTS (HTTP Strict Transport Security)", definition: "A security header instructing browsers to automatically upgrade all connections to HTTPS." },
  ],
  sections: [
    {
      id: "why-https-needed",
      title: "Why HTTPS is Essential",
      body: "On unencrypted HTTP, anyone on the same Wi-Fi network, ISP router, or Internet backbone can read your passwords, view session cookies, or inject malicious advertisements into web pages. HTTPS renders all transmitted data completely unreadable to interceptors.",
    },
    {
      id: "how-https-works",
      title: "How HTTPS Operates Step-by-Step",
      body: "An HTTPS session is established in three distinct phases:",
      bullets: [
        "1. TCP Connection: Browser initiates standard TCP 3-way handshake on Port 443.",
        "2. TLS Negotiation: Client and server exchange certificates, validate identity, and generate symmetric session keys.",
        "3. Encrypted HTTP Exchange: Standard HTTP requests (GET, POST) and responses (HTML, JSON) are encrypted before hitting the wire.",
      ],
    },
    {
      id: "https-trustworthiness-misconception",
      title: "HTTPS != Website Content Trustworthy",
      body: "A common user misconception is assuming a website with a padlock icon (HTTPS) is safe and honest. HTTPS guarantees that your connection to the server is encrypted and authenticated. However, malicious phishing sites and scam stores can easily obtain free HTTPS certificates.",
    },
  ],
  advantages: [
    "Complete confidentiality — encrypts form submissions, login credentials, and session tokens.",
    "Authenticates server identity via CA certificates.",
    "Ensures data integrity — prevents ISPs or attackers from injecting ads or malware into pages.",
    "Required for modern browser features (Geolocation, Service Workers, HTTP/2, HTTP/3).",
  ],
  disadvantages: [
    "Minor computational overhead for TLS handshake and cryptographic encryption.",
    "Requires managing and renewing TLS certificates.",
  ],
  commonUseCases: [
    "Mandatory for all modern websites, e-commerce stores, online banking, and web APIs.",
  ],
  commonMistakes: [
    "Thinking HTTPS makes a website safe from scams — HTTPS encrypts the connection, but doesn't verify if the website owner is legitimate.",
    "Allowing mixed content (loading HTTP images on an HTTPS page) — compromises the page's security state.",
  ],
  comparison: {
    headers: ["Aspect", "HTTPS", "HTTP"],
    rows: [
      { label: "Default Port", classful: "Port 443", cidr: "Port 80" },
      { label: "Encryption Layer", classful: "HTTP wrapped inside TLS Session", cidr: "No Encryption (Plaintext)" },
      { label: "Data Integrity", classful: "Protected by TLS HMAC checksums", cidr: "Unprotected (Can be altered in transit)" },
      { label: "Browser Behavior", classful: "Padlock Icon / Allowed Features", cidr: "Displays 'Not Secure' warning" },
    ],
  },
  beginnerSummary:
    "HTTPS is HTTP with a security shield. It encrypts all data sent between your web browser and a website using TLS, ensuring nobody can snoop on your passwords or tamper with the pages you see.",
  relatedLinks: [
    { label: "HTTP", href: "/learn/http" },
    { label: "TLS", href: "/learn/tls" },
    { label: "DNS", href: "/learn/dns" },
    { label: "Ports", href: "/learn/ports" },
  ],
};

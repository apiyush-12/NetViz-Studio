import type { LearningTopic } from "@/data/learning-content";

export const tlsTopic: LearningTopic = {
  id: "tls",
  title: "TLS",
  subtitle: "Transport Layer Security — Cryptographic protocol for encrypted, authenticated network communications",
  category: "security",
  readTime: "8 min",
  summary:
    "TLS (Transport Layer Security, RFC 8446) is a cryptographic protocol operating at the Presentation/Application layer that provides end-to-end communication security over IP networks. TLS provides Data Encryption, Server Authentication, and Data Integrity.",
  keyTakeaways: [
    "Protects network traffic with three core pillars: Encryption, Authentication, Data Integrity.",
    "Uses asymmetric encryption (public/private keys) for key exchange and symmetric encryption (AES/GCM) for fast bulk data transfer.",
    "Validates server identities using X.509 digital certificates issued by trusted Certificate Authorities (CAs).",
    "Powers secure web browsing (HTTPS), email security (STARTTLS), and secure VPN tunnels.",
    "Note: The exact handshake message flow depends on the TLS version (e.g. TLS 1.2 vs 1.3) and negotiated cipher suite.",
  ],
  diagram: {
    title: "Simplified TLS Handshake & Encrypted Data Flow",
    textRepresentation: `Simplified TLS Handshake Sequence:
Client                                                   Server
  │ ───────────── 1. Client Hello (TLS Version, Ciphers) ──────────► │
  │ ◄──────────── 2. Server Hello & Certificate (Public Key) ─────── │
  │                                                                  │
  [ Client Validates Certificate via CA Trust Store ]                │
  │                                                                  │
  │ ───────────── 3. Key Exchange / Key Agreement ─────────────────► │
  │                                                                  │
  [ Both Peers Derive Identical Symmetric Session Keys ]             │
  │                                                                  │
  │ ◄════════════ 4. Encrypted Session Data (AES-GCM) ═════════════► │`,
  },
  importantTerms: [
    { term: "Symmetric Encryption", definition: "Encryption method using the same single secret key for both encryption and decryption (fast bulk transfer)." },
    { term: "Asymmetric Encryption", definition: "Encryption method using a Public Key for encryption and a Private Key for decryption (used during key exchange)." },
    { term: "Session Keys", definition: "Temporary symmetric encryption keys generated dynamically per TLS session." },
    { term: "Certificate Authority (CA)", definition: "A trusted third-party organization that digitally signs X.509 public key certificates." },
    { term: "Cipher Suite", definition: "A set of algorithms used for authentication, key exchange, encryption, and message integrity." },
    { term: "SNI (Server Name Indication)", definition: "A TLS extension allowing the client to specify the target hostname during the initial Client Hello." },
  ],
  sections: [
    {
      id: "why-tls-needed",
      title: "Why TLS is Needed",
      body: "Unencrypted network protocols (like HTTP or FTP) transmit passwords, credit card numbers, and session cookies in clear plain text. Anyone sniffing network traffic could read or tamper with the payload. TLS encrypts all payload data in transit.",
    },
    {
      id: "how-tls-works",
      title: "How TLS Operates: Authentication & Key Agreement",
      body: "A TLS connection is established through a structured sequence:",
      bullets: [
        "1. Cipher Negotiation: Client and server agree on TLS version (TLS 1.2 or TLS 1.3) and supported cipher suites.",
        "2. Server Authentication: Server sends its X.509 certificate. The client verifies the digital signature against its built-in CA root certificates.",
        "3. Key Agreement: Client and server execute Diffie-Hellman key exchange to derive symmetric session keys without sending keys over the wire.",
        "4. Encrypted Data Transfer: All subsequent HTTP/Application payload is encrypted with high-speed symmetric ciphers.",
      ],
    },
    {
      id: "certificate-errors",
      title: "Common Certificate Errors & Warnings",
      body: "Why browsers raise security alerts for TLS certificates:",
      bullets: [
        "Expired Certificate: The certificate validity date range has passed.",
        "Untrusted CA: The certificate was self-signed or issued by an unrecognized CA.",
        "Hostname Mismatch: The domain in the browser URL (e.g. site.com) does not match the Subject Alternative Name (SAN) in the certificate.",
      ],
    },
  ],
  advantages: [
    "Strong cryptographic security protecting against eavesdropping and tampering.",
    "Cryptographic identity verification via trusted Certificate Authorities.",
    "TLS 1.3 reduces handshake latency to just 1 Round-Trip Time (1-RTT).",
  ],
  disadvantages: [
    "Slight CPU overhead for cryptographic math operations.",
    "Requires ongoing management to renew digital certificates before expiration.",
  ],
  commonUseCases: [
    "Securing web traffic over HTTPS (Port 443).",
    "Securing mail transmission via SMTPS, IMAPS, and STARTTLS.",
    "Encrypting OpenVPN and WireGuard VPN tunnels.",
  ],
  commonMistakes: [
    "Calling modern web encryption 'SSL' — SSL is obsolete; modern applications strictly use TLS.",
    "Assuming TLS protects against web application software bugs — TLS encrypts data in transit, but does not fix SQL injection or server vulnerabilities.",
  ],
  comparison: {
    headers: ["Aspect", "TLS (Transport Layer Security)", "SSL (Secure Sockets Layer)"],
    rows: [
      { label: "Current Status", classful: "Modern Active Global Standard (TLS 1.2 & 1.3)", cidr: "Obsolete & Insecure (Deprecated by IETF)" },
      { label: "Security Vulnerabilities", classful: "Secure against modern cryptographic attacks", cidr: "Vulnerable to POODLE, BEAST, and DROWN attacks" },
      { label: "Handshake Efficiency", classful: "TLS 1.3 completes in 1-RTT (or 0-RTT resumption)", cidr: "Multi-step slow handshake" },
      { label: "Recommendation", classful: "Mandatory for all secure systems", cidr: "MUST be disabled on all servers" },
    ],
  },
  beginnerSummary:
    "TLS is the security engine of the Internet. When you see the padlock icon in your browser, TLS has authenticated the website's digital certificate and scrambled all traffic into an unbreakable code so hackers cannot read your passwords or banking details.",
  relatedLinks: [
    { label: "SSL — Historical Predecessor", href: "/learn/ssl" },
    { label: "HTTPS", href: "/learn/https" },
    { label: "Firewall", href: "/learn/firewall" },
  ],
};

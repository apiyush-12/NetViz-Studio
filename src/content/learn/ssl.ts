import type { LearningTopic } from "@/data/learning-content";

export const sslTopic: LearningTopic = {
  id: "ssl",
  title: "SSL — Historical Predecessor to TLS",
  subtitle: "Historical security protocol standard now superseded and rendered obsolete by TLS",
  category: "security",
  readTime: "6 min",
  warningCallout:
    "⚠️ SSL is included as a historical networking topic. Modern secure systems should use supported TLS versions (TLS 1.2 or TLS 1.3). Legacy SSL versions (SSL 2.0 / SSL 3.0) contain severe cryptographic flaws and MUST NOT be enabled on production servers.",
  summary:
    "SSL (Secure Sockets Layer) was the original security protocol developed by Netscape in the 1990s to encrypt web traffic. Though superseded by TLS in 1999, the term 'SSL' persists today in marketing phrases like 'SSL certificate'.",
  keyTakeaways: [
    "SSL 1.0 was never released publicly due to severe design flaws.",
    "SSL 2.0 (1995) and SSL 3.0 (1996) were widely deployed historically, but are now completely obsolete.",
    "All versions of SSL are deprecated by the IETF (RFC 7568) and disabled in modern web browsers.",
    "Modern encrypted websites use TLS, even when referred to casually as 'SSL certificates'.",
  ],
  diagram: {
    title: "Historical Timeline from SSL to TLS",
    textRepresentation: `Protocol Evolution Timeline:
[ 1995: SSL 2.0 ] ──► [ 1996: SSL 3.0 ] ──► [ 1999: TLS 1.0 ] ──► [ 2008: TLS 1.2 ] ──► [ 2018: TLS 1.3 ]
  (OBSOLETE)            (DEPRECATED)          (DEPRECATED)          (ACTIVE)              (RECOMMENDED)

Security Status:
SSL 2.0 / 3.0: ❌ Broken Cryptography (POODLE Attack Vulnerable)
TLS 1.2 / 1.3:  ✅ Secure Cryptography (Modern Standard)`,
  },
  importantTerms: [
    { term: "Netscape", definition: "The web browser company that created original SSL protocols in the 1990s." },
    { term: "POODLE Attack", definition: "Padding Oracle On Downgraded Legacy Encryption attack that completely broke SSL 3.0." },
    { term: "Deprecation", definition: "Official declaration by standards bodies that a protocol is unsafe for use." },
    { term: "SSL Certificate Terminology", definition: "Historical legacy term commonly used in business marketing to refer to modern TLS X.509 certificates." },
  ],
  sections: [
    {
      id: "why-ssl-was-created",
      title: "Why SSL Was Created",
      body: "In the early days of the World Wide Web (1994), e-commerce required a method to protect credit card transactions from eavesdroppers. Netscape designed SSL to wrap unencrypted HTTP connections with public-key encryption.",
    },
    {
      id: "why-ssl-became-obsolete",
      title: "Why SSL Was Replaced by TLS",
      body: "Over time, security researchers discovered critical vulnerabilities in SSL protocol logic:",
      bullets: [
        "POODLE Attack: Exploited SSL 3.0 cipher-block chaining padding to decrypt sensitive cookies.",
        "BEAST & DROWN Attacks: Exploited legacy SSL 2.0/3.0 fallback mechanisms.",
        "IETF Standardization: In 1999, the Internet Engineering Task Force (IETF) took over protocol development and released TLS 1.0 (RFC 2246), officially deprecating SSL.",
      ],
    },
    {
      id: "why-term-persists",
      title: "Why the Term 'SSL' Persists Today",
      body: "Even though modern web servers use TLS 1.2 or TLS 1.3, domain registrars and Certificate Authorities still advertise 'SSL Certificates' because non-technical users recognize the term.",
    },
  ],
  advantages: [
    "Pioneered the foundation of modern web encryption and digital certificate PKI infrastructure.",
  ],
  disadvantages: [
    "Critically vulnerable to modern cryptographic exploits — MUST NOT be used.",
  ],
  commonUseCases: [
    "Historical computer science study and legacy system migration auditing.",
  ],
  commonMistakes: [
    "Enabling SSL 3.0 on web servers for 'backward compatibility' — creates severe security vulnerabilities.",
    "Thinking buying an 'SSL Certificate' forces your server to use obsolete SSL protocols — certificates work identically with modern TLS.",
  ],
  comparison: {
    headers: ["Aspect", "SSL (Legacy)", "TLS (Modern)"],
    rows: [
      { label: "Developer", classful: "Netscape Communications", cidr: "IETF (Internet Engineering Task Force)" },
      { label: "Security Status", classful: "Cryptographically broken / Obsolete", cidr: "Current active global security standard" },
      { label: "Browser Support", classful: "Disabled in all modern browsers", cidr: "Required for HTTPS connections" },
      { label: "Key Exchange", classful: "Legacy RSA key exchange", cidr: "Ephemeral Diffie-Hellman (PFS guaranteed)" },
    ],
  },
  beginnerSummary:
    "SSL is the historic predecessor to TLS. Created in the 1990s, SSL pioneered web encryption, but was later found to have security flaws. Today, all modern websites use TLS, even though people still casually call digital certificates 'SSL certificates'.",
  relatedLinks: [
    { label: "TLS", href: "/learn/tls" },
    { label: "HTTPS", href: "/learn/https" },
  ],
};

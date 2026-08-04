import type { LearningTopic } from "@/data/learning-content";

export const vpnTopic: LearningTopic = {
  id: "vpn",
  title: "VPN",
  subtitle: "Virtual Private Network — Encrypted point-to-point tunnel connecting remote users or sites across public networks",
  category: "security",
  readTime: "8 min",
  summary:
    "A Virtual Private Network (VPN) creates an encrypted point-to-point software tunnel across an untrusted public network (like the Internet). It encapsulates and encrypts data payloads, allowing remote users or branch offices to securely access internal private network resources.",
  keyTakeaways: [
    "Creates an encrypted tunnel over public networks using protocols like OpenVPN, IPsec, or WireGuard.",
    "Remote-Access VPNs connect individual user devices to a corporate private network.",
    "Site-to-Site VPNs connect two entire static office networks across the Internet.",
    "Full Tunnel routes ALL device traffic through the VPN; Split Tunnel routes only internal corporate subnets.",
    "VPNs protect data in transit from local Wi-Fi eavesdroppers, but do NOT grant 100% complete online anonymity.",
  ],
  diagram: {
    title: "Remote Access VPN Encrypted Tunnel Topology",
    textRepresentation: `Remote Access VPN Flow:
[ Remote User Laptop ]
         │
  ( Encrypted VPN Tunnel / IPsec / WireGuard )
         ▼
[ Public Internet ] ──► [ VPN Gateway / Firewall ] ──► [ Internal Corporate Network ]
                             (Decrypts Traffic)            (Access Web / DB Servers)`,
  },
  importantTerms: [
    { term: "VPN Gateway", definition: "The server or firewall at the network edge that terminates VPN tunnels and decrypts incoming traffic." },
    { term: "Tunneling / Encapsulation", definition: "Wrapping an entire original IP packet inside a new encrypted IP transport header." },
    { term: "Remote-Access VPN", definition: "Software client enabling mobile employees to securely connect back to an office network." },
    { term: "Site-to-Site VPN", definition: "A permanent encrypted bridge connecting two physical branch office routers." },
    { term: "Split Tunneling", definition: "Directing only corporate IP subnets through the VPN while sending general internet traffic out the local ISP link." },
    { term: "Full Tunneling", definition: "Directing 100% of all host traffic through the encrypted VPN tunnel." },
  ],
  sections: [
    {
      id: "why-vpn-needed",
      title: "Why VPNs Are Needed",
      body: "When employees work remotely from coffee shops or home networks, connecting directly to unencrypted internal servers exposes corporate credentials to eavesdropping. A VPN establishes a secure encrypted extension of the corporate private LAN.",
    },
    {
      id: "how-vpn-works",
      title: "How VPN Tunneling & Encapsulation Works",
      body: "A VPN operates by encapsulating data packets:",
      bullets: [
        "1. Authentication: The VPN client authenticates with the gateway using certificates, MFA, or credentials.",
        "2. Encapsulation: The user's original IP packet (e.g. Dest 10.0.1.50) is encrypted and wrapped inside a new public IP packet (Dest Gateway Public IP).",
        "3. Transmission: Encrypted packets travel safely across public ISP routers.",
        "4. Decryption: The VPN Gateway decrypts the outer envelope and forwards the original packet to the internal destination server.",
      ],
    },
    {
      id: "privacy-realities",
      title: "Trust Considerations & Anonymity Realities",
      body: "Addressing common commercial marketing misconceptions about VPN privacy:",
      bullets: [
        "In-Transit Security: A VPN encrypts traffic between your device and the VPN server, preventing local Wi-Fi sniffing.",
        "Not 100% Anonymous: The VPN provider still sees your IP address and web traffic unless no-log policies are independently audited.",
        "Web Tracking: Websites can still track you using browser cookies, device fingerprinting, and logged accounts regardless of VPN usage.",
      ],
    },
  ],
  advantages: [
    "Encrypts network traffic across untrusted public Wi-Fi networks.",
    "Provides secure access to internal enterprise servers without exposing them directly to the public Internet.",
    "Bridges geographically separated office networks securely.",
  ],
  disadvantages: [
    "Adds encryption CPU overhead and slight latency increases due to longer routing paths.",
    "Requires trusting the VPN provider or managing on-premise gateway hardware.",
  ],
  commonUseCases: [
    "Remote corporate employees accessing internal files, databases, and intranets.",
    "Securing mobile laptop traffic when connected to public hotel Wi-Fi.",
    "Connecting two branch offices via a permanent router Site-to-Site IPsec tunnel.",
  ],
  commonMistakes: [
    "Believing commercial VPNs grant total immunity from law enforcement or malware — VPNs do not stop malware downloads or browser tracking.",
    "Confusing a VPN with a Proxy — proxies forward specific application traffic (like HTTP); VPNs encapsulate all system-level network IP packets.",
  ],
  comparison: {
    headers: ["Aspect", "Virtual Private Network (VPN)", "Proxy Server"],
    rows: [
      { label: "Operating Scope", classful: "System-wide IP layer encapsulation (Layer 3)", cidr: "Application layer specific (Layer 7 HTTP/SOCKS)" },
      { label: "Encryption", classful: "Full end-to-end tunnel encryption (IPsec/TLS)", cidr: "Optional / Varies by proxy protocol" },
      { label: "Authentication", classful: "Strong certificate & MFA client authentication", cidr: "Basic IP or username/password" },
    ],
  },
  beginnerSummary:
    "A VPN creates a secure, encrypted software tunnel between your device and a remote private network across the Internet. It protects your data from local eavesdroppers and allows remote workers to access internal company servers safely.",
  relatedLinks: [
    { label: "TLS", href: "/learn/tls" },
    { label: "Firewall", href: "/learn/firewall" },
    { label: "Router", href: "/learn/router" },
  ],
};

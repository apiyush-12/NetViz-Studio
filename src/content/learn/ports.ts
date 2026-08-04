import type { LearningTopic } from "@/data/learning-content";

export const portsTopic: LearningTopic = {
  id: "ports",
  title: "Ports",
  subtitle: "16-bit logical transport numbers (0–65535) for process multiplexing and socket addressing",
  category: "services",
  readTime: "7 min",
  summary:
    "A network port is a 16-bit logical number (ranging from 0 to 65535) used by transport layer protocols (TCP and UDP) to direct incoming and outgoing network traffic to specific software applications or services running on a host.",
  keyTakeaways: [
    "Ports operate at Layer 4 (Transport Layer) of the OSI model.",
    "A Socket is the combination of an IP Address and a Port Number (e.g. 192.168.1.10:443).",
    "Ports are categorized into Well-Known (0–1023), Registered (1024–49151), and Dynamic/Ephemeral (49152–65535).",
    "Server daemons listen on fixed well-known ports; client browsers use dynamic ephemeral ports.",
    "Network logical ports are NOT physical RJ-45 switch ports.",
    "Common service ports are defaults and can be configured to custom non-standard numbers.",
  ],
  diagram: {
    title: "Socket Address Multiplexing & Common Ports Table",
    textRepresentation: `Socket Address Concept:
  [ Host IP: 192.168.1.10 ] ──► Port 80   (Web Server / HTTP)
                           ──► Port 22   (SSH Terminal)
                           ──► Port 53   (DNS Service)

Common Service Ports Table:
+---------+-------------+-----------+-----------------------------------+
| Service | Common Port | Transport | Purpose                           |
+---------+-------------+-----------+-----------------------------------+
| HTTP    | 80          | TCP       | Unencrypted Web Browsing          |
| HTTPS   | 443         | TCP       | Encrypted Web Browsing (TLS)      |
| DNS     | 53          | TCP / UDP | Domain Name Resolution            |
| SSH     | 22          | TCP       | Secure Remote Terminal Access     |
| DHCP    | 67 (Server) | UDP       | Dynamic Address Assignment        |
| DHCP    | 68 (Client) | UDP       | Dynamic Address Assignment        |
+---------+-------------+-----------+-----------------------------------+`,
  },
  importantTerms: [
    { term: "Socket", definition: "The complete endpoint pair combining an IP address and a Port number (e.g. 172.16.0.5:80)." },
    { term: "Well-Known Ports (0–1023)", definition: "Reserved port numbers assigned by IANA for standard system daemons and core protocols." },
    { term: "Registered Ports (1024–49151)", definition: "Port numbers assigned for specific vendor applications (e.g. 3306 MySQL)." },
    { term: "Ephemeral Ports (49152–65535)", definition: "Temporary short-lived port numbers allocated dynamically by a client operating system for outgoing requests." },
    { term: "Port Multiplexing", definition: "Allowing a single IP address to host dozens of distinct network services simultaneously." },
  ],
  sections: [
    {
      id: "why-ports-needed",
      title: "Why Ports Are Needed",
      body: "An IP address brings data to a specific computer hardware device. However, a modern computer runs dozens of network programs simultaneously (browser, Spotify, Discord, SSH). Port numbers act as internal apartment numbers, ensuring data reaches the correct application.",
    },
    {
      id: "how-ports-work-multiplexing",
      title: "How Client-Server Socket Multiplexing Works",
      body: "When you open a web browser to visit https://example.com:",
      bullets: [
        "1. Your OS assigns a random Ephemeral Source Port (e.g. Port 52140) to your browser tab.",
        "2. The request targets Destination Port 443 (HTTPS) on example.com's web server IP.",
        "3. The web server receives the request on Port 443 and replies back targeting your client IP and Ephemeral Port 52140.",
        "4. Your OS uses Port 52140 to deliver the response to the exact browser tab that requested it.",
      ],
    },
    {
      id: "custom-non-default-ports",
      title: "Custom Non-Default Port Configuration",
      body: "While port 80 is the default for HTTP and 22 for SSH, administrators can configure web servers or SSH services to listen on custom non-default ports (e.g. Port 8080 or 2222) for security or port-forwarding requirements.",
    },
  ],
  advantages: [
    "Allows multiple network applications to run on a single IP address simultaneously.",
    "Enables granular port-based firewall filtering and port forwarding.",
  ],
  disadvantages: [
    "Open unmonitored ports increase attack surface for port scanning attacks.",
  ],
  commonUseCases: [
    "Configuring web servers (Ports 80/443), database servers (Port 3306), and SSH servers (Port 22).",
    "Setting up Port Forwarding on home routers.",
  ],
  commonMistakes: [
    "Confusing logical Transport Layer port numbers with physical Ethernet switch ports — logical ports are software numbers, while switch ports are physical cable jacks.",
    "Assuming port numbers cannot be changed — any service can be configured to listen on a non-default port.",
  ],
  comparison: {
    headers: ["Aspect", "Logical Transport Port", "Physical Switch Port"],
    rows: [
      { label: "Nature", classful: "Software 16-bit number (0–65535)", cidr: "Hardware cable socket / RJ-45 jack" },
      { label: "OSI Layer", classful: "Layer 4 (Transport Layer)", cidr: "Layer 1 / Layer 2 (Physical & Data Link)" },
      { label: "Function", classful: "Directs traffic to OS software processes", cidr: "Connects physical Ethernet cables to switches" },
    ],
  },
  beginnerSummary:
    "Think of an IP address as a building's street address, and a network port as the apartment number inside. Port numbers ensure that incoming data is delivered to the exact program (like your browser or game) meant to receive it.",
  relatedLinks: [
    { label: "TCP", href: "/learn/tcp" },
    { label: "UDP", href: "/learn/udp" },
    { label: "Firewall", href: "/learn/firewall" },
    { label: "HTTP", href: "/learn/http" },
  ],
};

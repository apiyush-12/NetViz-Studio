import type { LearningTopic } from "@/data/learning-content";

export const udpTopic: LearningTopic = {
  id: "udp",
  title: "UDP",
  subtitle: "User Datagram Protocol — Lightweight, connectionless, low-overhead transport layer protocol (IP Protocol 17)",
  category: "services",
  readTime: "7 min",
  summary:
    "UDP (User Datagram Protocol, RFC 768) is a minimal, connectionless Layer 4 Transport Layer protocol. UDP transmits independent datagrams without establishing a prior connection, offering ultra-low overhead and minimal latency for time-sensitive applications.",
  keyTakeaways: [
    "Operates at Layer 4 (Transport Layer) of the OSI model.",
    "Connectionless: No 3-way handshake or setup state.",
    "No native reliability: UDP does NOT send acknowledgements or retransmit lost packets.",
    "Small fixed 8-byte header overhead compared to TCP's 20-byte header.",
    "Ideal for real-time voice, video streaming, online gaming, and quick DNS/DHCP queries.",
    "Important Rule: Any acknowledgement or retransmission used over UDP belongs to the application protocol, NOT UDP itself.",
  ],
  diagram: {
    title: "UDP Datagram Transmission & Header Structure",
    textRepresentation: `UDP Fire-and-Forget Transmission:
Sender ────────── Datagram 1 (No Handshake) ──────────► Receiver
Sender ────────── Datagram 2 (No ACK Required) ────────► Receiver

UDP Header Structure (Fixed 8 Bytes Total):
+-------------------------------+-------------------------------+
|     Source Port (16 Bits)     |   Destination Port (16 Bits)  |
+-------------------------------+-------------------------------+
|        Length (16 Bits)       |       Checksum (16 Bits)      |
+-------------------------------+-------------------------------+`,
  },
  importantTerms: [
    { term: "Datagram", definition: "An independent, self-contained message packet sent over UDP." },
    { term: "Connectionless", definition: "Transmitting data without establishing a pre-session connection state with the receiver." },
    { term: "UDP Header", definition: "A tiny 8-byte header containing only Source Port, Destination Port, Length, and Checksum." },
    { term: "Best-Effort Delivery", definition: "Transmitting packets onto the network without guaranteeing delivery, order, or error recovery." },
  ],
  sections: [
    {
      id: "why-udp-needed",
      title: "Why UDP is Needed",
      body: "For real-time applications like VoIP telephone calls or online multiplayer video games, receiving a delayed packet via TCP retransmission is useless because the audio moment or game frame has already passed. UDP prioritizes immediate, low-latency delivery over absolute packet completeness.",
    },
    {
      id: "how-udp-works",
      title: "How UDP Works",
      body: "UDP provides a direct pathway for application code to send raw packets to remote sockets:",
      bullets: [
        "1. Application hands payload to UDP layer with Source and Destination port numbers.",
        "2. UDP appends an 8-byte header and passes the datagram directly to IP.",
        "3. Packets are transmitted instantly without waiting for connection handshakes.",
        "4. Receiver checks optional checksum and delivers datagram to application socket.",
      ],
    },
    {
      id: "app-level-acks-clarification",
      title: "Application-Level Reliability over UDP",
      body: "Protocols like QUIC (HTTP/3) or DNS over UDP build custom loss detection into application code. However, any acknowledgement or packet retransmission used over UDP belongs entirely to the application layer, NOT to UDP itself.",
    },
  ],
  advantages: [
    "Ultra-low latency with zero connection setup delay.",
    "Minimal header overhead (only 8 bytes).",
    "Supports IP Multicast and Broadcast transmissions (TCP cannot broadcast).",
  ],
  disadvantages: [
    "No native guarantee of delivery — dropped packets are lost permanently unless handled by app code.",
    "No guaranteed packet ordering — datagrams may arrive out of order.",
    "No native congestion control — high-rate UDP streams can saturate network links.",
  ],
  commonUseCases: [
    "Domain Name System (DNS queries on UDP 53).",
    "Dynamic Host Configuration Protocol (DHCP on UDP 67/68).",
    "Voice over IP (VoIP) and live video conferencing (RTP / WebRTC).",
    "Online multiplayer video game state synchronization.",
  ],
  commonMistakes: [
    "Assuming UDP has no error checking — UDP includes a 16-bit checksum to detect corrupted payload bits.",
    "Thinking UDP can be used for file downloads or web transactions without app-layer recovery — missing bytes break files.",
  ],
  comparison: {
    headers: ["Aspect", "UDP", "TCP"],
    rows: [
      { label: "Connection Model", classful: "Connectionless (Fire-and-forget)", cidr: "Connection-Oriented (3-Way Handshake)" },
      { label: "Reliability", classful: "No native ACKs or retransmissions", cidr: "Guaranteed via ACKs & RTO timers" },
      { label: "Header Size", classful: "8 Bytes Fixed", cidr: "20 to 60 Bytes Variable" },
      { label: "Multicast / Broadcast", classful: "Supported", cidr: "Not Supported (Unicast only)" },
      { label: "Best For", classful: "Voice, Video, Gaming, DNS, DHCP", cidr: "Web browsing, File Transfer, Database, Email" },
    ],
  },
  beginnerSummary:
    "UDP is like sending a regular postcard in the mail. It is fast, lightweight, and requires no initial connection. If a postcard gets lost in transit, it is not re-sent, making it perfect for live video streams where speed is more important than absolute perfection.",
  relatedLinks: [
    { label: "TCP", href: "/learn/tcp" },
    { label: "Ports", href: "/learn/ports" },
    { label: "DNS", href: "/learn/dns" },
    { label: "Interactive UDP Visualizer", href: "/protocols/udp" },
  ],
};

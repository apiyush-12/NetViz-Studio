import type { LearningTopic } from "@/data/learning-content";

export const tcpTopic: LearningTopic = {
  id: "tcp",
  title: "TCP",
  subtitle: "Transmission Control Protocol — Connection-oriented, reliable, ordered transport layer protocol (IP Protocol 6)",
  category: "services",
  readTime: "9 min",
  summary:
    "TCP (Transmission Control Protocol, RFC 793) is a core Layer 4 Transport Layer protocol. It provides reliable, ordered, error-checked, connection-oriented byte-stream delivery between application processes running on hosts in an IP network.",
  keyTakeaways: [
    "Operates at Layer 4 (Transport Layer) of the OSI model.",
    "Connection-oriented: Establishes a 3-way handshake (SYN, SYN-ACK, ACK) before data transfer.",
    "Reliable delivery: Uses Sequence numbers, Acknowledgements (ACKs), and Retransmission timers.",
    "Flow control & Congestion control: Uses Sliding Windows to prevent receiver buffer overflow.",
    "Supports graceful connection termination using FIN / ACK handshakes.",
  ],
  diagram: {
    title: "TCP 3-Way Handshake & Sequence Tracking",
    textRepresentation: `TCP 3-Way Handshake:
Client                                           Server
  │ ────── 1. SYN (Seq = 100, ACK = 0) ──────────► │
  │ ◄───── 2. SYN-ACK (Seq = 300, ACK = 101) ───── │
  │ ────── 3. ACK (Seq = 101, ACK = 301) ─────────► │  (Session ESTABLISHED)

TCP Header Structure:
+-------------------------------+-------------------------------+
|     Source Port (16 Bits)     |   Destination Port (16 Bits)  |
+-------------------------------+-------------------------------+
|                  Sequence Number (32 Bits)                    |
+-------------------------------+-------------------------------+
|               Acknowledgement Number (32 Bits)                |
+-------+---------------+-------+-------------------------------+
|Offset | Reserved      | Flags |      Window Size (16 Bits)    |
+-------+---------------+-------+-------------------------------+`,
  },
  importantTerms: [
    { term: "3-Way Handshake", definition: "The 3-step initialization exchange (SYN, SYN-ACK, ACK) used to establish a TCP session." },
    { term: "Sequence Number (Seq)", definition: "A 32-bit counter tracking the exact byte offset of transmitted data payload." },
    { term: "Acknowledgement Number (ACK)", definition: "Indicates the next expected byte sequence number from the remote peer." },
    { term: "Sliding Window", definition: "A flow control mechanism advertising how many unacknowledged bytes a receiver can accept." },
    { term: "Retransmission Timeout (RTO)", definition: "Timer triggering segment re-sending if no ACK is received." },
    { term: "TCP Flags", definition: "Control bits in the header: SYN, ACK, FIN, RST, PSH, URG." },
  ],
  sections: [
    {
      id: "why-tcp-needed",
      title: "Why TCP is Needed",
      body: "IP networks are inherently connectionless and best-effort: packets can be dropped, delayed, duplicated, or delivered out of order. TCP handles packet recovery, correct ordering, and stream reconstruction transparently for application developers.",
    },
    {
      id: "how-tcp-works-reliability",
      title: "How TCP Guarantees Reliability & Ordering",
      body: "TCP guarantees flawless delivery through three main mechanisms:",
      bullets: [
        "1. Ordered Assembly: Every byte of payload is numbered with a Sequence Number. The receiver reassembles out-of-order packets before delivering data to the application.",
        "2. Acknowledgement & Retransmission: Receivers ACK every received sequence block. If an ACK does not arrive before the RTO timer expires, TCP retransmits the missing segment.",
        "3. Sliding Window Flow Control: The receiver informs the sender how much buffer space remains (Window Size), preventing fast senders from swamping slow receivers.",
      ],
    },
    {
      id: "tcp-connection-termination",
      title: "Connection Teardown (FIN Handshake)",
      body: "When an application closes a connection, TCP performs a 4-step termination sequence (FIN, ACK, FIN, ACK) to ensure all pending data in transit is acknowledged before closing sockets.",
    },
  ],
  advantages: [
    "100% reliable data transmission — no dropped bytes.",
    "Guaranteed in-order application payload assembly.",
    "Built-in flow control and network congestion avoidance.",
  ],
  disadvantages: [
    "Higher latency due to initial handshake and ACK round trips.",
    "Larger header overhead (20 to 60 bytes) compared to UDP (8 bytes).",
    "Head-of-Line blocking — missing packets halt processing of subsequent packets.",
  ],
  commonUseCases: [
    "Web browsing (HTTP / HTTPS).",
    "File transfers (FTP / SFTP) and database queries.",
    "Remote terminal access (SSH) and email protocols (IMAP / SMTP).",
  ],
  commonMistakes: [
    "Using TCP for real-time multiplayer gaming or live voice streaming — TCP retransmissions cause audio distortion and lag spikes.",
    "Confusing TCP Sequence Numbers with Packet Count — sequence numbers count individual payload BYTES, not packets.",
  ],
  comparison: {
    headers: ["Aspect", "TCP", "UDP"],
    rows: [
      { label: "Connection Model", classful: "Connection-Oriented (3-Way Handshake)", cidr: "Connectionless (No Handshake)" },
      { label: "Reliability", classful: "Guaranteed (ACKs & Retransmissions)", cidr: "Best-Effort (No native ACKs)" },
      { label: "Packet Ordering", classful: "Guaranteed in-order assembly", cidr: "No ordering guarantees" },
      { label: "Header Size", classful: "20 – 60 Bytes", cidr: "8 Bytes" },
      { label: "Speed / Latency", classful: "Slower (Handshake & ACK overhead)", cidr: "Fast / Ultra-low latency" },
    ],
  },
  beginnerSummary:
    "TCP is the registered mail protocol of the Internet. Before sending data, it establishes a formal connection with the receiver. It tracks every byte sent, requests retransmission if a packet is lost, and ensures data arrives in exact order.",
  relatedLinks: [
    { label: "UDP", href: "/learn/udp" },
    { label: "Ports", href: "/learn/ports" },
    { label: "HTTP", href: "/learn/http" },
    { label: "Interactive TCP Visualizer", href: "/protocols/tcp" },
  ],
  advancedNotes:
    "Modern TCP implementations use sophisticated congestion control algorithms (such as CUBIC, BBR, or Reno) to dynamically adjust sender Congestion Window (cwnd) sizes based on packet loss and round-trip delay feedback.",
};

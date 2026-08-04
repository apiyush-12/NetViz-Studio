import type { LearningTopic } from "@/data/learning-content";

export const ethernetTopic: LearningTopic = {
  id: "ethernet",
  title: "Ethernet",
  subtitle: "The foundational wired Local Area Network (LAN) protocol standard (IEEE 802.3)",
  category: "fundamentals",
  readTime: "7 min",
  summary:
    "Ethernet is the primary technology used for wired local area networks (LANs). It defines physical cabling standards, physical network interface signaling, and Data Link layer frame structures that transport data payloads across connected local network devices.",
  keyTakeaways: [
    "Ethernet operates primarily at Layer 1 (Physical) and Layer 2 (Data Link) of the OSI model.",
    "Data is transmitted across Ethernet in discrete chunks called frames.",
    "Frames identify source and destination hardware devices using 48-bit MAC addresses.",
    "Modern Ethernet uses twisted-pair or fiber cables operating in full-duplex mode.",
    "Switches forward Ethernet frames using a MAC address table.",
  ],
  diagram: {
    title: "Simple Ethernet Communication",
    textRepresentation: `PC-1 → Ethernet Cable → Switch → Ethernet Cable → PC-2

Ethernet Frame Representation:
+-------------------+------------+----------+--------------+-----+
| Destination MAC   | Source MAC | EtherType| Data Payload | FCS |
| (6 Bytes)         | (6 Bytes)  | (2 Bytes)| (46-1500 B)  |(4 B)|
+-------------------+------------+----------+--------------+-----+`,
  },
  importantTerms: [
    { term: "Ethernet Frame", definition: "The Protocol Data Unit (PDU) at Layer 2 containing headers, payload, and error checking bytes." },
    { term: "EtherType", definition: "A 2-byte field in an Ethernet frame indicating which Layer 3 protocol (e.g. 0x0800 for IPv4) is carried inside." },
    { term: "NIC (Network Interface Card)", definition: "Hardware component inside a device providing a physical connection port to an Ethernet network." },
    { term: "FCS (Frame Check Sequence)", definition: "A 4-byte CRC checksum at the end of an Ethernet frame used to detect transmission corruption." },
    { term: "Full Duplex", definition: "Bidirectional communication allowing data to be transmitted and received simultaneously." },
    { term: "Collision Domain", definition: "A network segment where transmitted frames can collide with one another (eliminated in full-duplex switches)." },
  ],
  sections: [
    {
      id: "why-ethernet-needed",
      title: "Why Ethernet is Needed",
      body: "Before Ethernet standards were established, networking hardware used proprietary, incompatible signaling methods. Ethernet established a universal standard allowing network hardware from any vendor to interoperate over twisted-pair copper cables and fiber optics.",
    },
    {
      id: "how-ethernet-works",
      title: "How Ethernet Works",
      body: "Ethernet encapsulates higher-layer data (such as IP packets) into Layer 2 frames. When PC-1 sends data to PC-2 over Ethernet, it packages the payload into a frame, prepends its own MAC address and PC-2's MAC address, and converts the binary payload into electrical or optical signals.",
      bullets: [
        "1. Application data is encapsulated into an IP packet at Layer 3.",
        "2. The IP packet is wrapped inside an Ethernet frame with Source and Destination MAC addresses.",
        "3. The physical Network Interface Card (NIC) transmits bits over copper wire or fiber optical cable.",
        "4. The receiving NIC validates the Frame Check Sequence (FCS) checksum to verify data integrity.",
      ],
    },
    {
      id: "ethernet-speeds-cables",
      title: "Ethernet Cables & Speed Standards",
      body: "Ethernet has evolved through several standardized speed tiers over Cat5e, Cat6, Cat6a copper cabling and fiber optics:",
      bullets: [
        "10BASE-T: Legacy 10 Mbps Ethernet",
        "100BASE-TX (Fast Ethernet): 100 Mbps transmission speed",
        "1000BASE-T (Gigabit Ethernet): 1 Gbps standard speed for office and residential networks",
        "10GBASE-T (10-Gigabit Ethernet): 10 Gbps high-performance server and backbone connections",
      ],
    },
    {
      id: "duplex-and-domains",
      title: "Full Duplex, Half Duplex & Domains",
      body: "Legacy hubs operated in Half Duplex, where devices had to share media and listen for collisions (CSMA/CD). Modern Ethernet switches operate in Full Duplex, isolating every port into its own collision domain and allowing simultaneous sending and receiving without collisions.",
    },
  ],
  advantages: [
    "High performance with predictable low latency and high bandwidth (up to 100 Gbps+).",
    "Extremely reliable and immune to wireless radio interference.",
    "Standardized IEEE 802.3 protocols ensure vendor interoperability.",
    "Power over Ethernet (PoE) allows single-cable power and data delivery.",
  ],
  disadvantages: [
    "Requires physical cables, limiting mobility for mobile devices like smartphones.",
    "Cable runs are limited to 100 meters (328 feet) for copper cabling without repeaters.",
    "Installation and maintenance costs for physical cabling infrastructures.",
  ],
  commonUseCases: [
    "Connecting enterprise desktop PCs, servers, and network printers to switches.",
    "Connecting wireless access points and security cameras to central networks.",
    "High-speed inter-switch trunks and data center server racks.",
  ],
  commonMistakes: [
    "Confusing Ethernet with the Internet — Ethernet is a local wiring/framing standard, while the Internet is a global network of networks.",
    "Assuming Ethernet cables can run indefinitely — standard copper cables degrade beyond 100 meters.",
    "Believing MAC addresses are routed across the global Internet — MAC addresses are stripped and rewritten at every router hop.",
  ],
  comparison: {
    headers: ["Aspect", "Ethernet (Wired)", "Wi-Fi (Wireless)"],
    rows: [
      { label: "Medium", classful: "Physical twisted-pair copper or fiber cables", cidr: "Radio frequency signals (2.4 GHz, 5 GHz, 6 GHz)" },
      { label: "Standard", classful: "IEEE 802.3", cidr: "IEEE 802.11" },
      { label: "Mobility", classful: "Stationary (tethered by cable)", cidr: "High mobility within signal range" },
      { label: "Interference", classful: "Very low / Immune to radio noise", cidr: "Susceptible to walls, radio interference, and distance" },
      { label: "Max Speed", classful: "1 Gbps to 400 Gbps", cidr: "300 Mbps to 9.6 Gbps (Wi-Fi 6)" },
    ],
  },
  beginnerSummary:
    "Ethernet is the industry standard for sending data over physical network cables. It packages your data into frames stamped with hardware MAC addresses, ensuring fast, interference-free, and reliable communication inside a local home or enterprise network.",
  relatedLinks: [
    { label: "MAC Address", href: "/learn/mac-address" },
    { label: "Switch", href: "/learn/switch" },
    { label: "Wi-Fi", href: "/learn/wifi" },
  ],
  advancedNotes:
    "Standard Ethernet frames carry up to 1500 bytes of payload (Maximum Transmission Unit - MTU). Enterprise data centers often use Jumbo Frames with an MTU of 9000 bytes to reduce CPU overhead during large data transfers.",
};

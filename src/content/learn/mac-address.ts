import type { LearningTopic } from "@/data/learning-content";

export const macAddressTopic: LearningTopic = {
  id: "mac-address",
  title: "MAC Address",
  subtitle: "48-bit Media Access Control hardware address burned into network interfaces",
  category: "fundamentals",
  readTime: "6 min",
  summary:
    "A MAC address (Media Access Control address) is a unique 48-bit physical identifier assigned to a Network Interface Card (NIC) at the factory. It operates at Layer 2 (Data Link Layer) to ensure frames reach the correct physical hardware device on a local network segment.",
  keyTakeaways: [
    "MAC addresses operate at Layer 2 (Data Link) of the OSI model.",
    "Formatted as 6 pairs of hexadecimal digits separated by colons or hyphens (e.g. 00:1A:2B:3C:4D:5E).",
    "First 24 bits represent the Organizationally Unique Identifier (OUI) identifying the vendor.",
    "Last 24 bits represent the manufacturer's unique Network Interface Controller serial number.",
    "MAC addresses deliver frames within a single local Layer 2 broadcast domain; they change at every router hop.",
  ],
  diagram: {
    title: "MAC Address 48-Bit Structure & Local Frame Flow",
    textRepresentation: `Example MAC Address: 00:1A:2B:3C:4D:5E

+-------------------------------+-------------------------------+
|    OUI (Vendor Identifier)    |   NIC Serial / Controller ID  |
|       First 24 Bits (3 Bytes) |        Last 24 Bits (3 Bytes) |
|           (e.g., Cisco/Intel) |        (Unique hardware ID)   |
+-------------------------------+-------------------------------+

Local Frame Delivery:
[PC-1: MAC A] ──(Ethernet Frame: Dest MAC B)──► [Switch] ──► [PC-2: MAC B]`,
  },
  importantTerms: [
    { term: "OUI (Organizationally Unique Identifier)", definition: "The first 24 bits of a MAC address assigned by IEEE to identify the hardware manufacturer." },
    { term: "Unicast MAC", definition: "A MAC address targeting a single specific network interface card." },
    { term: "Broadcast MAC", definition: "The special address FF:FF:FF:FF:FF:FF targeting all interfaces on the local subnet." },
    { term: "Multicast MAC", definition: "An address (e.g. starting with 01:00:5E) targeting a specific group of subscribed devices." },
    { term: "Burned-In Address (BIA)", definition: "The permanent factory hardware MAC address flashed into the NIC ROM." },
  ],
  sections: [
    {
      id: "why-mac-needed",
      title: "Why MAC Addresses Are Needed",
      body: "An IP address identifies a device logically on a global network, but physical hardware circuits (Ethernet ports, Wi-Fi chips) require a physical hardware identity to receive electrical or radio signals intended specifically for them.",
    },
    {
      id: "how-mac-works",
      title: "How MAC Addresses Work in Local Communications",
      body: "When a PC sends data to another PC on the same Ethernet switch, it constructs an Ethernet frame with the target device's MAC address as the Destination MAC. The switch checks its internal MAC address table and outputs the frame directly to the port where that MAC address resides.",
    },
    {
      id: "mac-address-types",
      title: "Types of MAC Addresses",
      body: "MAC addresses fall into three functional destination categories:",
      bullets: [
        "Unicast: Addresses a single destination interface (e.g. 00:1A:2B:3C:4D:5E).",
        "Broadcast: Addressed to FF:FF:FF:FF:FF:FF, forcing every switch port to receive and inspect the frame.",
        "Multicast: Addressed to a subset of devices listening for specific stream protocols.",
      ],
    },
    {
      id: "mac-vs-ip-router-boundary",
      title: "What Happens at a Router Boundary?",
      body: "When a packet crosses a router, the router strips the incoming Layer 2 Ethernet frame containing the original MAC addresses. The router then wraps the IP packet into a brand-new Layer 2 frame with its own egress MAC address as the Source, and the next-hop router's MAC address as the Destination.",
    },
  ],
  commonMistakes: [
    "Thinking MAC addresses remain on a packet across the Internet — MAC addresses are discarded and replaced at every router hop.",
    "Confusing MAC addresses with IP addresses — MAC is physical hardware (Layer 2), while IP is logical location (Layer 3).",
    "Believing MAC spoofing permanently alters hardware — MAC spoofing only changes the address reported by the operating system software driver.",
  ],
  comparison: {
    headers: ["Aspect", "MAC Address", "IP Address"],
    rows: [
      { label: "OSI Layer", classful: "Layer 2 (Data Link)", cidr: "Layer 3 (Network)" },
      { label: "Address Format", classful: "48-bit hexadecimal (e.g. 00:1A:2B:3C:4D:5E)", cidr: "32-bit decimal (IPv4) or 128-bit hex (IPv6)" },
      { label: "Assignment", classful: "Burned into hardware by manufacturer", cidr: "Assigned dynamically (DHCP) or statically" },
      { label: "Scope", classful: "Local link / subnet boundary only", cidr: "Global / cross-network routing" },
      { label: "Permanence", classful: "Permanent hardware address", cidr: "Changes when moving to a different network" },
    ],
  },
  beginnerSummary:
    "A MAC address is like a computer's physical serial number or fingerprint burned into its network card. It ensures that data frames sent over an Ethernet cable or Wi-Fi radio land on the exact physical device intended on the local network.",
  relatedLinks: [
    { label: "Ethernet", href: "/learn/ethernet" },
    { label: "Switch", href: "/learn/switch" },
    { label: "IP Address", href: "/learn/ip-address" },
  ],
};

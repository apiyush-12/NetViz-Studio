import type { LearningTopic } from "@/data/learning-content";

export const switchTopic: LearningTopic = {
  id: "switch",
  title: "Switch",
  subtitle: "Layer 2 hardware device that connects local network nodes using MAC address learning",
  category: "security",
  readTime: "7 min",
  summary:
    "A network switch is a Layer 2 Data Link device that connects multiple computers, printers, and servers on a local area network (LAN). It dynamically learns MAC addresses and inspects incoming frame headers to forward data exclusively to the destination port, eliminating collisions.",
  keyTakeaways: [
    "Operates primarily at Layer 2 (Data Link) of the OSI reference model.",
    "Maintains an internal MAC Address Table mapping MAC addresses to physical switch ports.",
    "Uses Source MAC learning to populate its MAC table automatically.",
    "Performs Known Unicast forwarding, Unknown Unicast flooding, and Broadcast forwarding.",
    "Creates separate collision domains on every port while sharing a single broadcast domain (without VLANs).",
  ],
  diagram: {
    title: "Switch Physical Star Topology & Sample MAC Table",
    textRepresentation: `PC-1 (Port 1: MAC 00:11:22..10) ──┐
PC-2 (Port 2: MAC 00:11:22..20) ──┼── [Layer 2 Switch]
PC-3 (Port 3: MAC 00:11:22..30) ──┘

Sample Switch MAC Address Table:
+-------------------+--------+
|    MAC Address    | Port   |
+-------------------+--------+
| 00:11:22:33:44:10 | Port 1 |
| 00:11:22:33:44:20 | Port 2 |
| 00:11:22:33:44:30 | Port 3 |
+-------------------+--------+`,
  },
  importantTerms: [
    { term: "MAC Address Table (CAM Table)", definition: "High-speed lookup memory inside a switch storing active MAC addresses and their associated physical port numbers." },
    { term: "Ingress Port", definition: "The physical switch port where an incoming frame enters the device." },
    { term: "Egress Port", definition: "The physical switch port where an outgoing frame is transmitted." },
    { term: "Unknown Unicast Flooding", definition: "When a switch receives a frame for an unlisted MAC address, it forwards the frame out all active ports except the ingress port." },
    { term: "VLAN (Virtual LAN)", definition: "Logical broadcast domain created inside a switch to segment traffic without separate physical hardware." },
  ],
  sections: [
    {
      id: "why-switch-needed",
      title: "Why Network Switches Are Needed",
      body: "Legacy network hubs broadcast every incoming packet to every single port, resulting in frequent packet collisions, poor bandwidth utilization, and serious security risks. Switches inspect frame headers and send data only to the specific port where the recipient is connected.",
    },
    {
      id: "how-switch-works",
      title: "How a Switch Works: Learning & Forwarding Mechanics",
      body: "A switch performs three primary functions on every frame it processes:",
      bullets: [
        "1. Learning: Inspects the Source MAC address of incoming frames and records the MAC-to-Port entry into its CAM table.",
        "2. Forwarding (Known Unicast): If the Destination MAC exists in the MAC table, the frame is forwarded only to that specific egress port.",
        "3. Flooding (Unknown Unicast / Broadcast): If the Destination MAC is not in the table or is FF:FF:FF:FF:FF:FF, the frame is flooded out all other active ports.",
      ],
    },
    {
      id: "switch-vs-hub-router",
      title: "Switch vs Hub vs Router",
      body: "Understanding the operational differences between network interconnect devices:",
      bullets: [
        "Hub (Layer 1): Simple repeater. Repeats all signals out all ports. Shared collision domain.",
        "Switch (Layer 2): Intelligent frame forwarder. Isolates collision domains per port. Connects devices within the same IP subnet.",
        "Router (Layer 3): Network boundary device. Connects different IP subnets together and routes packets based on IP addresses.",
      ],
    },
  ],
  advantages: [
    "Dedicated bandwidth per port with full-duplex transmission (no collisions).",
    "High data security compared to hubs because traffic is not broadcast to unintended ports.",
    "Plug-and-play installation with automatic self-learning MAC tables.",
    "Supports VLAN segmentation to separate department traffic.",
  ],
  disadvantages: [
    "Cannot route traffic between different IP subnets without a Layer 3 router or Layer 3 switch.",
    "Susceptible to broadcast storms if physical loops exist (prevented using Spanning Tree Protocol - STP).",
  ],
  commonUseCases: [
    "Interconnecting workstations, access points, and IP phones in enterprise office buildings.",
    "Forming high-speed switching backbones in data centers.",
    "Powering network security cameras and wireless access points via Power over Ethernet (PoE).",
  ],
  commonMistakes: [
    "Thinking a Layer 2 switch can route traffic between different subnets — a Layer 2 switch only forwards within the same IP subnet.",
    "Confusing physical switch ports with TCP/UDP software port numbers.",
    "Confusing collision domains with broadcast domains — a switch divides collision domains per port, but maintains a single shared broadcast domain unless VLANs are configured.",
  ],
  comparison: {
    headers: ["Aspect", "Network Switch (Layer 2)", "Router (Layer 3)"],
    rows: [
      { label: "OSI Layer", classful: "Layer 2 (Data Link)", cidr: "Layer 3 (Network)" },
      { label: "Forwarding Table", classful: "MAC Address Table (CAM Table)", cidr: "IP Routing Table" },
      { label: "Header Inspected", classful: "Source & Destination MAC Address", cidr: "Source & Destination IP Address" },
      { label: "Scope", classful: "Connects devices inside the SAME subnet", cidr: "Connects DIFFERENT IP subnets together" },
      { label: "Broadcast Handling", classful: "Forwards broadcast frames out all ports", cidr: "Blocks / terminates broadcast frames" },
    ],
  },
  beginnerSummary:
    "A network switch is an intelligent multiport box that connects all computers in an office or home network. It remembers which computer is plugged into which port by its MAC address, sending data directly to the receiver without slowing down other devices.",
  relatedLinks: [
    { label: "Ethernet", href: "/learn/ethernet" },
    { label: "MAC Address", href: "/learn/mac-address" },
    { label: "Router", href: "/learn/router" },
  ],
};

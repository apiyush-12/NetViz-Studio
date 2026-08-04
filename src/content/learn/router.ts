import type { LearningTopic } from "@/data/learning-content";

export const routerTopic: LearningTopic = {
  id: "router",
  title: "Router",
  subtitle: "Layer 3 hardware boundary device that forwards packets across different IP subnets",
  category: "routing",
  readTime: "8 min",
  summary:
    "A router is a Layer 3 Network Layer device that connects two or more distinct IP networks or subnets together. Routers inspect incoming packet destination IP addresses, look up paths in an internal Routing Table, and forward traffic hop-by-hop toward its destination.",
  keyTakeaways: [
    "Operates at Layer 3 (Network Layer) of the OSI model.",
    "Connects different IP subnets and isolates Layer 2 broadcast domains.",
    "Maintains an internal Routing Table to select the optimal path for packets.",
    "Uses Longest Prefix Matching (LPM) to look up destination IP routes.",
    "Decrements the IP Time-To-Live (TTL) header by 1 and rewrites Layer 2 MAC headers at every hop.",
  ],
  diagram: {
    title: "Router Network Boundary & Packet Forwarding Flow",
    textRepresentation: `[ Subnet A: 192.168.1.0/24 ]               [ Subnet B: 10.0.0.0/24 ]
  PC-1 (192.168.1.10)                        Server (10.0.0.50)
         │                                          ▲
         ▼                                          │
(Eth Interface G0/0)                     (Eth Interface G0/1)
[ 192.168.1.1 MAC-R1-A ] ──► [ ROUTER ] ──► [ 10.0.0.1 MAC-R1-B ]

Packet Header Transformation:
Incoming Frame:  Dest MAC: MAC-R1-A | Dest IP: 10.0.0.50 | TTL: 64
Outgoing Frame:  Dest MAC: MAC-Server| Dest IP: 10.0.0.50 | TTL: 63`,
  },
  importantTerms: [
    { term: "Routing Table", definition: "A database stored in router memory listing known destination networks, prefix masks, next-hop IPs, and exit interfaces." },
    { term: "Next Hop", definition: "The IP address of the adjacent router interface to which a packet should be passed next." },
    { term: "TTL (Time-To-Live)", definition: "An 8-bit counter in the IP header decremented by 1 at every router hop to prevent infinite routing loops." },
    { term: "L2 Frame Stripping", definition: "The router process of discarding the incoming Layer 2 frame and constructing a brand-new frame for the egress link." },
    { term: "LPM (Longest Prefix Match)", definition: "The algorithmic rule where a router chooses the routing table entry with the most specific (longest) mask." },
  ],
  sections: [
    {
      id: "why-router-needed",
      title: "Why Routers Are Needed",
      body: "Switches only forward traffic between devices on the same local subnet. Routers are essential to interconnect different subnets, branch offices, and connect local home or office networks to the global Internet.",
    },
    {
      id: "how-router-forwards-packets",
      title: "Step-by-Step Packet Forwarding Process",
      body: "When a router receives an Ethernet frame on an ingress interface:",
      bullets: [
        "1. Validates the Frame Check Sequence (FCS) and strips the incoming Layer 2 Ethernet header.",
        "2. Inspects the Destination IP address in the Layer 3 header.",
        "3. Decrements the IP TTL counter by 1 (drops packet with ICMP Time Exceeded if TTL reaches 0).",
        "4. Performs Longest Prefix Match lookup in its Routing Table to determine the next-hop IP and exit interface.",
        "5. Resolves the next-hop MAC address using ARP and encapsulates the IP packet into a new Layer 2 frame.",
        "6. Transmits the frame out the egress interface.",
      ],
    },
    {
      id: "router-vs-switch-gateway",
      title: "Router vs Switch vs Gateway",
      body: "Clarifying device roles in a network architecture:",
      bullets: [
        "Switch (Layer 2): Forwards frames inside a single subnet based on MAC addresses.",
        "Router (Layer 3): Forwards packets across subnets based on IP addresses.",
        "Default Gateway: The specific router interface IP assigned to local hosts for outbound traffic.",
      ],
    },
  ],
  advantages: [
    "Connects disparate media types (Ethernet, Fiber, Serial links).",
    "Completely blocks Layer 2 broadcast storms from spreading to other subnets.",
    "Enables traffic filtering, NAT, and security policy enforcement.",
  ],
  disadvantages: [
    "Slightly higher processing latency per packet compared to pure Layer 2 switching.",
    "Requires proper routing table configuration (static or dynamic routing protocols).",
  ],
  commonUseCases: [
    "Connecting home networks to Internet Service Providers (ISPs).",
    "Connecting enterprise corporate office branches via VPN or leased lines.",
    "Routing traffic between corporate VLAN subnets inside data centers.",
  ],
  commonMistakes: [
    "Thinking a router changes the source or destination IP addresses — IP addresses remain unchanged end-to-end (unless NAT is applied).",
    "Expecting a router to forward Layer 2 broadcast frames across subnets — routers block broadcasts by default.",
  ],
  comparison: {
    headers: ["Aspect", "Router (Layer 3)", "Switch (Layer 2)"],
    rows: [
      { label: "OSI Layer", classful: "Layer 3 (Network)", cidr: "Layer 2 (Data Link)" },
      { label: "Addressing Used", classful: "IP Addresses (e.g. 192.168.1.1)", cidr: "MAC Addresses (e.g. 00:1A:2B:3C:4D:5E)" },
      { label: "Primary Decision Table", classful: "Routing Table", cidr: "MAC Address Table (CAM Table)" },
      { label: "Broadcast Boundary", classful: "Blocks / Terminates Broadcasts", cidr: "Floods Broadcasts out all ports" },
    ],
  },
  beginnerSummary:
    "A router is a network gateway director that connects different IP networks together. When you send a request to a website outside your home, your router strips off local framing, picks the best path across the Internet, and forwards your packets toward their target.",
  relatedLinks: [
    { label: "Default Gateway", href: "/learn/default-gateway" },
    { label: "Routes", href: "/learn/routes" },
    { label: "Static Routing", href: "/learn/static-routing" },
    { label: "OSPF", href: "/learn/ospf" },
  ],
};

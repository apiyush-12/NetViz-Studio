export type LearningSection = {
  id: string;
  title: string;
  body: string;
  bullets?: string[];
};

export type LearningTopic = {
  id: string;
  title: string;
  subtitle: string;
  category: "fundamentals" | "addressing" | "routing" | "services" | "security";
  readTime: string;
  summary: string;
  keyTakeaways: string[];
  sections: LearningSection[];
  relatedLinks?: { label: string; href: string }[];
  layers?: { number: number | string; name: string; pdu: string; description: string; examples: string[] }[];
  comparison?: { label: string; classful: string; cidr: string }[];
};

export const learningTopics: LearningTopic[] = [
  // 1. OSI Model (Updated & Formatted)
  {
    id: "osi-model",
    title: "OSI 7-Layer Reference Model",
    subtitle: "Complete architectural breakdown of the Open Systems Interconnection stack",
    category: "fundamentals",
    readTime: "8 min",
    summary:
      "The OSI model divides network communication into seven distinct structural layers (Physical to Application). Each layer provides standardized services to the layer above and receives services from the layer below.",
    keyTakeaways: [
      "Layer 1 through Layer 7 span physical signals up to end-user software applications.",
      "Data traveling down the stack undergoes encapsulation by prepending headers at each layer.",
      "The Protocol Data Unit (PDU) changes per layer: Bits → Frame → Packet → Segment → Data.",
      "Layered isolation allows vendor interoperability and structured bottom-up troubleshooting.",
    ],
    layers: [
      { number: 7, name: "Application", pdu: "Data", description: "Provides network interface services directly to end-user software applications.", examples: ["HTTP", "DNS", "SMTP", "SSH"] },
      { number: 6, name: "Presentation", pdu: "Data", description: "Handles data formatting, syntax translation, encryption, and compression.", examples: ["TLS/SSL", "JPEG", "JSON/XML"] },
      { number: 5, name: "Session", pdu: "Data", description: "Establishes, manages, checkpoints, and terminates application communication sessions.", examples: ["RPC", "NetBIOS", "PPTP"] },
      { number: 4, name: "Transport", pdu: "Segment / Datagram", description: "Ensures end-to-end delivery, port multiplexing, flow control, and error recovery.", examples: ["TCP", "UDP"] },
      { number: 3, name: "Network", pdu: "Packet", description: "Handles logical IP addressing, path determination, and packet routing across networks.", examples: ["IPv4", "IPv6", "ICMP", "OSPF"] },
      { number: 2, name: "Data Link", pdu: "Frame", description: "Delivers frames between adjacent nodes on a shared physical link via MAC addressing.", examples: ["Ethernet (802.3)", "Wi-Fi (802.11)", "ARP"] },
      { number: 1, name: "Physical", pdu: "Bits", description: "Transmits raw binary streams over physical media (electrical, optical, or radio signals).", examples: ["Cat6 RJ45", "Single-Mode Fiber", "Radio Waves"] },
    ],
    sections: [
      {
        id: "encapsulation-workflow",
        title: "Encapsulation & De-Encapsulation Mechanics",
        body: "As application payload moves down the OSI stack, each layer wraps the payload from the layer above with its control header. On reception, the destination host strips headers layer by layer in reverse.",
        bullets: [
          "Data Payload → TCP Header (Layer 4 Segment)",
          "TCP Segment → IP Header (Layer 3 Packet)",
          "IP Packet → Ethernet Header & Trailer CRC (Layer 2 Frame)",
          "Layer 2 Frame → Physical Bits on Media (Layer 1 Signal)",
        ],
      },
      {
        id: "mnemonics-guide",
        title: "Layer Order Memory Aids",
        body: "Top-to-bottom mnemonic (L7 to L1): 'All People Seem To Need Data Processing'. Bottom-to-top mnemonic (L1 to L7): 'Please Do Not Throw Sausage Pizza Away'.",
      },
      {
        id: "troubleshooting-methodology",
        title: "Structured Layer-Based Diagnostics",
        body: "Network engineers isolate faults by testing layers methodically. Link light down? Layer 1 physical cable error. Cannot resolve hostname? Layer 7 DNS failure. Connection timeout? Layer 4 firewall drop.",
      },
    ],
    relatedLinks: [
      { label: "Compare with TCP/IP Model", href: "/learn/tcp-ip-model" },
      { label: "Interactive TCP Visualizer", href: "/protocols/tcp" },
      { label: "Layer 2/3 Topology Builder", href: "/topology" },
    ],
  },

  // 2. TCP/IP Model (Updated & Formatted)
  {
    id: "tcp-ip-model",
    title: "TCP/IP Architecture & Protocol Suite",
    subtitle: "The practical four-layer stack powering the global Internet",
    category: "fundamentals",
    readTime: "7 min",
    summary:
      "The TCP/IP suite (RFC 1122 / RFC 4632) is the operational architectural model of the Internet. It consolidates OSI layers into four practical tiers: Network Access, Internet, Transport, and Application.",
    keyTakeaways: [
      "Four operational layers: Network Access, Internet, Transport, Application.",
      "Engineered for practical hardware and packet-switched routing rather than pure theory.",
      "Matches Wireshark packet captures directly (Ethernet → IP → TCP/UDP → Application Payload).",
    ],
    layers: [
      { number: 4, name: "Application", pdu: "Data / Payload", description: "Consolidates OSI Layers 5–7 into unified user and protocol services.", examples: ["HTTP", "DNS", "DHCP", "BGP"] },
      { number: 3, name: "Transport", pdu: "Segment / Datagram", description: "Provides port-to-port process communication, sequence tracking, and connection control.", examples: ["TCP", "UDP"] },
      { number: 2, name: "Internet", pdu: "IP Packet", description: "Handles global IP addressing, packet forwarding, ICMP diagnostics, and routing.", examples: ["IPv4", "IPv6", "ICMP"] },
      { number: 1, name: "Network Access", pdu: "Frame / Bits", description: "Encompasses physical media drivers, MAC hardware addressing, and local framing.", examples: ["Ethernet", "Wi-Fi", "ARP"] },
    ],
    sections: [
      {
        id: "osi-tcpip-comparison",
        title: "OSI to TCP/IP Layer Mapping",
        body: "The TCP/IP model simplifies the 7 OSI layers into 4 functional levels. OSI Session and Presentation functions are handled inside application code or transport libraries like TLS.",
        bullets: [
          "OSI Application + Presentation + Session → TCP/IP Application Tier",
          "OSI Transport → TCP/IP Transport Tier",
          "OSI Network → TCP/IP Internet Tier",
          "OSI Data Link + Physical → TCP/IP Network Access Tier",
        ],
      },
      {
        id: "port-multiplexing",
        title: "Transport Port Multiplexing",
        body: "TCP/IP uses 16-bit Port Numbers (0–65535) to direct traffic to specific software processes on a single IP address. Well-known ports (0–1023) serve core daemons (e.g. 80 HTTP, 443 HTTPS, 53 DNS).",
      },
    ],
    relatedLinks: [
      { label: "OSI Reference Model", href: "/learn/osi-model" },
      { label: "TCP 3-Way Handshake Simulation", href: "/protocols/tcp" },
      { label: "UDP Datagram Visualizer", href: "/protocols/udp" },
    ],
  },

  // 3. CIDR vs Classful (Updated & Formatted)
  {
    id: "cidr-vs-classful",
    title: "CIDR vs Classful Addressing",
    subtitle: "Evolution from rigid Class A/B/C blocks to Classless Inter-Domain Routing",
    category: "addressing",
    readTime: "7 min",
    summary:
      "Classful addressing (1981) allocated IPv4 space in fixed Class A, B, and C chunks, causing massive address waste. CIDR (1993, RFC 4632) introduced arbitrary prefix lengths (/0 to /32) and route aggregation.",
    keyTakeaways: [
      "Classful addressing inferred subnet mask strictly from the first octet.",
      "CIDR explicit prefix notation (/N) allows flexible variable-length subnet masks (VLSM).",
      "CIDR supernetting merges thousands of route entries into single aggregate routes.",
      "Modern routing tables enforce CIDR longest prefix matching.",
    ],
    comparison: [
      { label: "Network Allocation", classful: "Fixed by Class (A=/8, B=/16, C=/24)", cidr: "Flexible prefix lengths (/0 to /32)" },
      { label: "Address Efficiency", classful: "High waste (e.g. Class B = 65,534 hosts minimum)", cidr: "Tailored blocks (e.g. /26 = 62 hosts)" },
      { label: "Subnet Mask Representation", classful: "Implicit from first octet range", cidr: "Explicit slash prefix notation (/24)" },
      { label: "Routing Table Scale", classful: "Explosive entry growth per network", cidr: "Supernet aggregation (/16 replaces 256 /24s)" },
      { label: "Current Industry Status", classful: "Obsolete since 1993", cidr: "Current global internet standard" },
    ],
    sections: [
      {
        id: "classful-waste-problem",
        title: "The Historical Classful Exhaustion Problem",
        body: "In classful networking, a business requiring 300 IP addresses was forced to request a Class B block (/16), locking up 65,534 usable IPs. Because Class C (/24, 254 hosts) was too small, IPv4 addresses depleted rapidly.",
        bullets: [
          "Class A (0.0.0.0 – 127.255.255.255): /8 prefix (16.7M hosts/net)",
          "Class B (128.0.0.0 – 191.255.255.255): /16 prefix (65,534 hosts/net)",
          "Class C (192.0.0.0 – 223.255.255.255): /24 prefix (254 hosts/net)",
        ],
      },
      {
        id: "cidr-prefix-mechanics",
        title: "CIDR Prefix Mechanics & Supernetting",
        body: "CIDR decouples IP addresses from class boundaries. A router uses explicit prefix masks (e.g. 255.255.255.192 for /26) and summarizes contiguous routes into single BGP advertisements.",
      },
    ],
    relatedLinks: [
      { label: "Interactive CIDR Calculator", href: "/cidr" },
      { label: "Subnetting Math Guide", href: "/learn/subnetting" },
      { label: "Subnet Challenge Lab", href: "/labs/split-24-into-4-subnets" },
    ],
  },

  // 4. Subnetting (Updated & Formatted)
  {
    id: "subnetting",
    title: "Subnetting & IP Address Mathematics",
    subtitle: "Binary arithmetic, network boundaries, broadcast calculation, and VLSM",
    category: "addressing",
    readTime: "10 min",
    summary:
      "Subnetting divides a larger IP network into smaller broadcast domains by borrowing bits from the host portion. It enhances network security, reduces broadcast noise, and optimizes address space.",
    keyTakeaways: [
      "Formula for total subnets: 2^S (where S is borrowed subnet bits).",
      "Formula for usable hosts per subnet: 2^H - 2 (where H is remaining host bits).",
      "Network Address has all host bits set to 0; Broadcast Address has all host bits set to 1.",
      "VLSM allocates subnets starting from largest host requirement to smallest.",
    ],
    sections: [
      {
        id: "binary-subnetting-rules",
        title: "Fundamental Binary Bitmask Rules",
        body: "Every IPv4 address consists of 32 binary bits. The prefix length /N specifies that N bits are reserved for Network ID, while (32 - N) bits represent Host ID.",
        bullets: [
          "/24 = 24 Network bits + 8 Host bits (2^8 = 256 total, 254 usable hosts)",
          "/26 = 26 Network bits + 6 Host bits (2^6 = 64 total, 62 usable hosts)",
          "/30 = 30 Network bits + 2 Host bits (2^2 = 4 total, 2 usable hosts for point-to-point links)",
        ],
      },
      {
        id: "worked-subnetting-example",
        title: "Worked Example: Subnetting 192.168.1.0/24 into /26",
        body: "Borrowing 2 host bits (/24 + 2 = /26) yields 2^2 = 4 subnets with a step size of 64:",
        bullets: [
          "Subnet 1: 192.168.1.0/26 — Network .0, Usable .1 – .62, Broadcast .63",
          "Subnet 2: 192.168.1.64/26 — Network .64, Usable .65 – .126, Broadcast .127",
          "Subnet 3: 192.168.1.128/26 — Network .128, Usable .129 – .190, Broadcast .191",
          "Subnet 4: 192.168.1.192/26 — Network .192, Usable .193 – .254, Broadcast .255",
        ],
      },
      {
        id: "vlsm-best-practices",
        title: "Variable Length Subnet Masking (VLSM)",
        body: "VLSM allows different prefix lengths within the same enterprise topology. Always sort subnets by host demand from largest to smallest before assigning binary boundaries.",
      },
    ],
    relatedLinks: [
      { label: "Interactive CIDR Subnet Calculator", href: "/cidr" },
      { label: "CIDR Fundamentals Lab", href: "/labs/cidr-fundamentals" },
      { label: "4-Subnetting Challenge Lab", href: "/labs/split-24-into-4-subnets" },
    ],
  },

  // 5. Routing Basics (Updated & Formatted)
  {
    id: "routing-basics",
    title: "IP Routing & Longest Prefix Match",
    subtitle: "How routers select paths and forward packets across hop boundaries",
    category: "routing",
    readTime: "9 min",
    summary:
      "Routing is the Layer 3 process of evaluating destination IP addresses against a local routing table and forwarding packets hop-by-hop toward their final destination.",
    keyTakeaways: [
      "Hosts deliver locally using ARP; remote traffic is forwarded to a Default Gateway.",
      "Routers choose active paths based on Longest Prefix Matching (LPM).",
      "Administrative Distance (AD) breaks ties between different routing protocol sources.",
      "At every router hop, TTL decrements by 1 and Layer 2 MAC headers are rewritten.",
    ],
    sections: [
      {
        id: "host-routing-decision",
        title: "Host Routing Decision Tree",
        body: "When an application transmits an IP packet, the source host compares the destination IP against its local subnet mask using binary AND logic.",
        bullets: [
          "Same Subnet: Resolve destination MAC via ARP and transmit frame directly.",
          "Different Subnet: Encapsulate packet and forward frame to Default Gateway MAC.",
        ],
      },
      {
        id: "longest-prefix-matching",
        title: "Longest Prefix Match (LPM) Rule",
        body: "When a router receives a packet for 10.1.5.25, it compares the IP against all routing table entries. The route with the most specific (longest) prefix length wins.",
        bullets: [
          "Entry 1: 10.0.0.0/8",
          "Entry 2: 10.1.0.0/16",
          "Entry 3: 10.1.5.0/24 (WINS - Most Specific /24 Match)",
          "Default Route: 0.0.0.0/0 (Catch-all fallback when no specific prefix matches)",
        ],
      },
      {
        id: "hop-by-hop-header-rewrite",
        title: "L2 Header Rewriting & TTL Decrementing",
        body: "IP addresses remain unchanged end-to-end. However, at every router hop, the router strips the incoming Ethernet frame, decrements Time To Live (TTL), recalculates IP checksum, and encapsulates the packet into a new Layer 2 frame.",
      },
    ],
    relatedLinks: [
      { label: "Static Routing Lab", href: "/labs/static-routing" },
      { label: "Missing Return Route Lab", href: "/labs/troubleshoot-missing-return-route" },
      { label: "OSPF Routing Engineering", href: "/learn/ospf-routing" },
    ],
  },

  // 6. Ethernet & ARP (NEW)
  {
    id: "ethernet-arp",
    title: "Ethernet, MAC Addressing & ARP Resolution",
    subtitle: "Layer 2 frame structure, 48-bit hardware addresses, and Address Resolution Protocol",
    category: "fundamentals",
    readTime: "8 min",
    summary:
      "Ethernet (IEEE 802.3) governs local physical and data link communication using 48-bit MAC addresses. ARP maps Layer 3 IPv4 addresses to Layer 2 MAC addresses on local broadcast segments.",
    keyTakeaways: [
      "MAC addresses are 48-bit hardware identifiers (OUI + NIC serial).",
      "Ethernet II frames encapsulate IP packets with Source/Destination MAC and EtherType.",
      "ARP Request is sent to Broadcast MAC (FF:FF:FF:FF:FF:FF).",
      "ARP Reply is sent via Unicast back to the requester and cached in the ARP table.",
    ],
    sections: [
      {
        id: "mac-structure",
        title: "48-Bit MAC Address Anatomy",
        body: "MAC addresses (e.g. 00:1A:2B:3C:4D:5E) are burned into network interface cards. The first 24 bits represent the Organizationally Unique Identifier (OUI vendor code), and the last 24 bits represent the unique interface controller ID.",
      },
      {
        id: "arp-resolution-flow",
        title: "ARP Resolution 4-Step Process",
        body: "When Host A wants to ping Host B (192.168.1.20) but lacks its MAC address:",
        bullets: [
          "1. Host A checks its local ARP cache table.",
          "2. Host A broadcasts an ARP Request: 'Who has 192.168.1.20? Tell 192.168.1.10'.",
          "3. Host B responds with a unicast ARP Reply: '192.168.1.20 is at MAC B'.",
          "4. Host A updates its ARP table and transmits the queued ICMP frame.",
        ],
      },
      {
        id: "switch-mac-learning",
        title: "Layer 2 Switch MAC Learning & Flooding",
        body: "Switches inspect incoming frame Source MAC addresses to populate their MAC Address Table. If a Destination MAC is unknown, the switch floods the frame out all ports in the VLAN except the ingress port.",
      },
    ],
    relatedLinks: [
      { label: "Local Network Communication Lab", href: "/labs/local-network-communication" },
      { label: "Fix Wrong Subnet Lab", href: "/labs/fix-wrong-subnet" },
      { label: "VLAN Segmentation Guide", href: "/learn/vlans-trunking" },
    ],
  },

  // 7. Packet Encapsulation & Traversal (NEW)
  {
    id: "packet-encapsulation",
    title: "Packet Encapsulation & Hop Traversal",
    subtitle: "PDU state changes, header additions, and multi-hop payload movement",
    category: "fundamentals",
    readTime: "8 min",
    summary:
      "Understand how data transforms from application text down to physical signals and back. Learn how headers change or stay static as traffic traverses switches, firewalls, and gateway routers.",
    keyTakeaways: [
      "Encapsulation appends control headers at each descending stack tier.",
      "End-to-end parameters (IP source/dest, TCP ports) remain unchanged (without NAT).",
      "Hop-by-hop parameters (Source/Dest MAC, TTL, Frame Check Sequence) change every hop.",
      "De-encapsulation validates CRC and strips headers upon receipt at destination.",
    ],
    sections: [
      {
        id: "pdu-headers-breakdown",
        title: "Protocol Data Unit Header Stack",
        body: "A complete Ethernet frame on the wire contains layered control headers wrapping user data:",
        bullets: [
          "Ethernet Header: Dest MAC (6B) | Source MAC (6B) | EtherType (2B: 0x0800 for IPv4)",
          "IP Header: Version (4b) | TTL (1B) | Protocol (1B: 6 TCP, 17 UDP) | Source IP (4B) | Dest IP (4B)",
          "TCP Header: Source Port (2B) | Dest Port (2B) | Sequence # (4B) | Flags (1B: SYN, ACK, FIN)",
          "Data Payload: HTTP Request / DNS Query / Application bytes",
        ],
      },
      {
        id: "hop-by-hop-transformation",
        title: "What Changes at Each Router Hop?",
        body: "As a packet moves across multiple router hops: Source and Destination IP addresses remain constant. The incoming Layer 2 frame is discarded, IP TTL is decremented by 1, and a brand-new Layer 2 frame is generated with the router's egress MAC and next-hop ingress MAC.",
      },
    ],
    relatedLinks: [
      { label: "OSI Reference Model", href: "/learn/osi-model" },
      { label: "Interactive Topology Lab", href: "/topology" },
    ],
  },

  // 8. TCP Flow Control (NEW)
  {
    id: "tcp-flow-control",
    title: "TCP Transport, Handshake & Flow Control",
    subtitle: "Connection setup, sliding windows, sequence numbering, and RTO retransmission",
    category: "services",
    readTime: "9 min",
    summary:
      "TCP (Transmission Control Protocol, RFC 793) provides reliable, connection-oriented, ordered stream delivery. It regulates data flow using sequence numbers, ACKs, sliding windows, and congestion control timers.",
    keyTakeaways: [
      "3-Way Handshake establishes SYN, SYN-ACK, ACK and initial sequence numbers (ISN).",
      "Sequence numbers track transmitted bytes; ACK numbers specify next expected byte.",
      "Retransmission Timeout (RTO) triggers data re-sending if ACKs are delayed or lost.",
      "Sliding Window prevents receiver buffer overflow.",
    ],
    sections: [
      {
        id: "three-way-handshake",
        title: "TCP 3-Way Handshake Sequence",
        body: "Before transmitting data, TCP establishes a bidirectional session between client and server:",
        bullets: [
          "1. Client → Server: SYN (seq=x, ACK=0)",
          "2. Server → Client: SYN-ACK (seq=y, ack=x+1)",
          "3. Client → Server: ACK (seq=x+1, ack=y+1) → Connection ESTABLISHED",
        ],
      },
      {
        id: "retransmission-loss-recovery",
        title: "Loss Detection & Fast Retransmit",
        body: "TCP uses positive acknowledgements with timeout. If a segment is dropped in transit, the receiver sends duplicate ACKs. Upon receiving 3 duplicate ACKs, TCP executes Fast Retransmit without waiting for full RTO expiration.",
      },
      {
        id: "tcp-vs-udp",
        title: "TCP vs UDP Trade-Offs",
        body: "TCP offers reliability, ordering, and flow control at the cost of latency and handshake overhead. UDP provides connectionless, low-latency transmission ideal for voice, video, and DNS.",
      },
    ],
    relatedLinks: [
      { label: "Run TCP 3-Way Handshake Simulation", href: "/protocols/tcp" },
      { label: "TCP 3-Way Handshake Lab", href: "/labs/tcp-three-way-handshake" },
      { label: "TCP Packet Loss Lab", href: "/labs/tcp-packet-loss-retransmission" },
      { label: "TCP vs UDP Lab", href: "/labs/tcp-versus-udp" },
    ],
  },

  // 9. OSPF Routing (NEW)
  {
    id: "ospf-routing",
    title: "OSPF Link-State Routing & SPF Calculation",
    subtitle: "Interior Gateway Protocol, Link-State Advertisements (LSAs), and Dijkstra algorithm",
    category: "routing",
    readTime: "10 min",
    summary:
      "OSPF (Open Shortest Path First, RFC 2328) is an IGP link-state routing protocol. OSPF routers synchronize their Link-State Database (LSDB) using LSAs and run Dijkstra's SPF algorithm to calculate shortest paths.",
    keyTakeaways: [
      "Routers establish neighbor adjacencies using Hello packets on multicast 224.0.0.5.",
      "All routers within an Area maintain an identical Link-State Database (LSDB).",
      "Interface cost is calculated as Reference Bandwidth / Interface Bandwidth.",
      "Dijkstra's SPF algorithm builds a loop-free shortest path tree rooted at each router.",
    ],
    sections: [
      {
        id: "ospf-adjacency-states",
        title: "OSPF Neighbor Adjacency State Machine",
        body: "Two OSPF routers transition through 8 states to reach FULL adjacency: Down → Init → 2-Way → ExStart → Exchange → Loading → FULL.",
        bullets: [
          "Hello packets verify Area ID, Subnet Mask, Hello/Dead Intervals, and Authentication.",
          "Database Description (DBD) packets exchange LSDB summary headers.",
          "Link-State Requests (LSR) fetch missing full LSA payload entries.",
        ],
      },
      {
        id: "ospf-area-hierarchy",
        title: "OSPF Two-Tier Area Hierarchy",
        body: "OSPF uses Area 0 (Backbone Area) as the central hub. All non-backbone areas must physically or logically connect to Area 0 via Area Border Routers (ABRs) to prevent routing loops.",
      },
    ],
    relatedLinks: [
      { label: "OSPF Neighbor Formation Lab", href: "/labs/ospf-neighbor-formation" },
      { label: "OSPF Cost Path Selection Lab", href: "/labs/ospf-cost-path-selection" },
      { label: "Three-Router OSPF Sample Topology", href: "/topology" },
    ],
  },

  // 10. BGP Routing (NEW)
  {
    id: "bgp-routing",
    title: "BGP Path-Vector Routing & Autonomous Systems",
    subtitle: "Inter-domain routing protocol powering the global Internet core",
    category: "routing",
    readTime: "10 min",
    summary:
      "BGP (Border Gateway Protocol, BGP-4 RFC 4271) is the standard Exterior Gateway Protocol (EGP) used to exchange routing reachability across Autonomous Systems (AS) on the Internet.",
    keyTakeaways: [
      "BGP uses TCP port 179 for reliable peer session establishment.",
      "eBGP connects different Autonomous Systems; iBGP routes within the same AS.",
      "BGP evaluates route preferences via Path Attributes (Weight, LocalPref, AS_PATH, MED).",
      "AS_PATH attribute prevents routing loops between global ISPs.",
    ],
    sections: [
      {
        id: "bgp-decision-algorithm",
        title: "BGP Best-Path Decision Algorithm",
        body: "When multiple candidate routes exist for an IP prefix, BGP evaluates path attributes in strict order:",
        bullets: [
          "1. Highest Weight (Cisco proprietary local value)",
          "2. Highest Local Preference (LocalPref - outbound AS traffic tuning)",
          "3. Prefer locally originated routes (Network command / Redistribution)",
          "4. Shortest AS_PATH length (Number of AS hops traversed)",
          "5. Lowest Origin code (IGP < EGP < Incomplete)",
          "6. Lowest MED (Multi-Exit Discriminator - inbound traffic preference)",
        ],
      },
      {
        id: "ebgp-vs-ibgp",
        title: "eBGP vs iBGP Differences",
        body: "eBGP peers reside in different Autonomous Systems and decrement TTL to 1 by default. iBGP peers reside in the same AS, require a full mesh or route reflectors, and do not modify the AS_PATH attribute.",
      },
    ],
    relatedLinks: [
      { label: "BGP Route Advertisement Lab", href: "/labs/bgp-route-advertisement" },
      { label: "BGP Best-Path Challenge Lab", href: "/labs/bgp-best-path-challenge" },
    ],
  },

  // 11. VLANs & Trunking (NEW)
  {
    id: "vlans-trunking",
    title: "VLAN Segmentation, 802.1Q & Inter-VLAN Routing",
    subtitle: "Virtual LAN isolation, 802.1Q trunk tagging, and Layer 3 inter-VLAN routing",
    category: "security",
    readTime: "8 min",
    summary:
      "VLANs (IEEE 802.1Q) logically partition a single physical switch into multiple isolated Layer 2 broadcast domains. Trunk links multiplex multiple VLANs across switch interconnects.",
    keyTakeaways: [
      "VLANs isolate broadcast domains, boosting security and network performance.",
      "IEEE 802.1Q inserts a 4-byte VLAN Tag header into Ethernet frames.",
      "Access ports belong to a single VLAN; Trunk ports carry multiple tagged VLANs.",
      "Inter-VLAN communication requires a Layer 3 Router or Layer 3 Switch.",
    ],
    sections: [
      {
        id: "8021q-tag-header",
        title: "802.1Q VLAN Tag Header Insertion",
        body: "When a frame traverses a Trunk link, the switch inserts a 4-byte 802.1Q tag between the Source MAC and EtherType fields. The tag contains a 12-bit VLAN ID (allowing up to 4,094 distinct VLANs).",
      },
      {
        id: "inter-vlan-methods",
        title: "Inter-VLAN Routing Methods",
        body: "Because VLANs isolate Layer 2 traffic, packets moving between VLAN 10 and VLAN 20 must be routed at Layer 3:",
        bullets: [
          "Router-on-a-Stick: Single physical interface configured with sub-interfaces (e.g. eth0.10, eth0.20) connected to an 802.1Q trunk port.",
          "Layer 3 Switch (SVI): Switched Virtual Interfaces (interface vlan 10) provide hardware line-rate routing between VLANs.",
        ],
      },
    ],
    relatedLinks: [
      { label: "VLAN Segmentation Lab", href: "/labs/vlan-segmentation" },
      { label: "Local Network Communication Lab", href: "/labs/local-network-communication" },
    ],
  },

  // 12. Services DNS & DHCP (NEW)
  {
    id: "services-dns-dhcp",
    title: "DHCP, DNS & Core Infrastructure Services",
    subtitle: "Dynamic host addressing, domain resolution, and network bootstrap services",
    category: "services",
    readTime: "8 min",
    summary:
      "DHCP (UDP 67/68) automates IP address, default gateway, and DNS server assignment. DNS (UDP 53) resolves human-readable domain names into routable IP addresses.",
    keyTakeaways: [
      "DHCP uses 4-step DORA process (Discover, Offer, Request, ACK).",
      "DHCP Relay Agent forwards client broadcasts across routers to central servers.",
      "DNS hierarchy consists of Root (.), TLD (.com), and Authoritative DNS servers.",
      "Core DNS record types include A (IPv4), AAAA (IPv6), CNAME (Alias), and MX (Mail).",
    ],
    sections: [
      {
        id: "dhcp-dora-process",
        title: "DHCP DORA 4-Step Handshake",
        body: "When a host joins a network without a static IP:",
        bullets: [
          "1. Discover (Client Broadcast): 'Is there a DHCP server on this link?'",
          "2. Offer (Server Unicast/Broadcast): 'Here is IP 192.168.1.50/24 with lease duration'.",
          "3. Request (Client Broadcast): 'I accept 192.168.1.50 from Server A'.",
          "4. Acknowledge (Server Unicast): 'Lease confirmed. IP assigned'.",
        ],
      },
      {
        id: "dns-resolution-flow",
        title: "DNS Recursive Name Resolution Flow",
        body: "When a browser requests 'www.example.com': The local client queries its configured Recursive Resolver. The resolver queries Root DNS (.) → TLD DNS (.com) → Authoritative Server (example.com) to retrieve the final A Record IP.",
      },
    ],
    relatedLinks: [
      { label: "DHCP Address Assignment Lab", href: "/labs/dhcp-address-assignment" },
      { label: "DNS Resolution Lab", href: "/labs/dns-resolution" },
    ],
  },
];

export function getLearningTopic(id: string): LearningTopic | undefined {
  return learningTopics.find((t) => t.id === id);
}

export function getTopicsByCategory(category: LearningTopic["category"]) {
  return learningTopics.filter((t) => t.category === category);
}

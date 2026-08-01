import {
  LandingFeature,
  LandingProtocol,
  LandingFaq,
  LandingAudienceCard,
  LandingCapabilityItem,
} from "./landing-types";

export const CORE_FEATURES: LandingFeature[] = [
  {
    id: "protocol-visualizer",
    title: "Protocol Visualizer",
    description: "Step through protocol behavior from packet creation to delivery across L2, L3, L4, and L7.",
    iconName: "Layers",
    href: "/protocols",
    status: "available",
    details: ["Packet header field inspection", "Handshake & termination state machines", "Event timeline & step-by-step playback"],
  },
  {
    id: "topology-builder",
    title: "Topology Builder",
    description: "Design networks using hosts, switches, routers, firewalls, servers, and configurable links.",
    iconName: "GitBranch",
    href: "/topology",
    status: "available",
    details: ["Drag-and-drop node canvas", "IP interface & static route configuration", "Failure injection & ping/traceroute simulation"],
  },
  {
    id: "cidr-studio",
    title: "CIDR Studio",
    description: "Understand IPv4 addressing through calculations and 32-bit binary network vs host bit visualization.",
    iconName: "Calculator",
    href: "/cidr",
    status: "available",
    details: ["Subnet range calculation", "Binary network/host mask breakdown", "VLSM & subnet splitting calculations"],
  },
  {
    id: "interactive-labs",
    title: "Interactive Labs",
    description: "Learn by completing guided configuration, packet flow prediction, and troubleshooting exercises.",
    iconName: "FlaskConical",
    href: "/labs",
    status: "available",
    details: ["Automatic objective validation", "Progressive hint system", "Real-world networking scenarios"],
  },
  {
    id: "packet-inspector",
    title: "Packet Inspector",
    description: "Inspect raw headers, payloads, checksums, and flags layer-by-layer like an educational packet analyzer.",
    iconName: "Search",
    href: "/visualizer",
    status: "available",
    details: ["Layer 2 Ethernet II MAC headers", "Layer 3 IPv4/ICMP headers", "Layer 4 TCP/UDP flags & sequence numbers"],
  },
  {
    id: "live-protocol-tables",
    title: "Live Protocol Tables",
    description: "Watch ARP cache, MAC address tables, IPv4 routing tables, and protocol states update in real time.",
    iconName: "Table",
    href: "/topology",
    status: "available",
    details: ["Dynamic ARP resolution", "L2 Switch MAC learning & aging", "L3 Routing table lookup algorithms"],
  },
];

export const PROTOCOL_CATALOG: LandingProtocol[] = [
  {
    id: "tcp",
    name: "TCP (Transmission Control Protocol)",
    layer: "Layer 4 — Transport",
    category: "Connection-Oriented",
    status: "available",
    description: "Reliable, connection-oriented protocol with 3-way handshake, sequence numbers, ACK tracking, and sliding window flow control.",
    keyFeatures: ["3-Way Handshake (SYN, SYN-ACK, ACK)", "Retransmission on timeout/packet drop", "FIN 4-way termination flow"],
    href: "/protocols/tcp",
  },
  {
    id: "udp",
    name: "UDP (User Datagram Protocol)",
    layer: "Layer 4 — Transport",
    category: "Connectionless",
    status: "available",
    description: "Low-overhead, connectionless transport protocol providing fast datagram delivery without native acknowledgements.",
    keyFeatures: ["Zero connection establishment latency", "Fixed 8-byte header overhead", "Unrecovered packet loss behavior"],
    href: "/protocols/udp",
  },
  {
    id: "arp",
    name: "ARP (Address Resolution Protocol)",
    layer: "Layer 2/3",
    category: "Address Mapping",
    status: "available",
    description: "Resolves IPv4 network addresses into physical Layer 2 MAC addresses via broadcast request and unicast reply.",
    keyFeatures: ["Broadcast request FF:FF:FF:FF:FF:FF", "Unicast ARP reply", "Dynamic ARP table cache binding"],
    href: "/protocols/arp",
  },
  {
    id: "icmp",
    name: "ICMP (Internet Control Message Protocol)",
    layer: "Layer 3 — Network",
    category: "Diagnostics",
    status: "available",
    description: "Used by network devices to send error messages and operational information (Ping echo request & reply, TTL expired).",
    keyFeatures: ["Echo Request (Type 8) & Reply (Type 0)", "Destination Unreachable reporting", "Traceroute TTL expiration tracking"],
    href: "/protocols/icmp",
  },
  {
    id: "dhcp",
    name: "DHCP (Dynamic Host Configuration Protocol)",
    layer: "Layer 7 — Application",
    category: "Address Allocation",
    status: "in-development",
    description: "Automates IP address, subnet mask, default gateway, and DNS server assignment via 4-step DORA process.",
    keyFeatures: ["Discover, Offer, Request, Acknowledge", "IP address lease duration allocation", "Scope & gateway distribution"],
    href: "/protocols/dhcp",
  },
  {
    id: "dns",
    name: "DNS (Domain Name System)",
    layer: "Layer 7 — Application",
    category: "Name Resolution",
    status: "in-development",
    description: "Translates human-readable domain names into numerical IPv4/IPv6 addresses via hierarchical queries.",
    keyFeatures: ["Recursive & Iterative lookup queries", "A, CNAME, MX, and NS record types", "DNS caching and TTL resolution"],
    href: "/protocols/dns",
  },
  {
    id: "ospf",
    name: "OSPF (Open Shortest Path First)",
    layer: "Layer 3 — Routing",
    category: "Link-State IGP",
    status: "planned",
    description: "Interior gateway protocol that calculates shortest network paths using Dijkstra's algorithm and Link-State Advertisements.",
    keyFeatures: ["Hello packet neighbor discovery", "LSA flooding & LSDB synchronization", "Shortest Path First cost calculation"],
    href: "/protocols/ospf",
  },
  {
    id: "bgp",
    name: "BGP (Border Gateway Protocol)",
    layer: "Layer 7 / TCP 179",
    category: "Path-Vector EGP",
    status: "planned",
    description: "Exterior gateway protocol powering internet inter-Autonomous System routing using path vector attributes.",
    keyFeatures: ["eBGP and iBGP peering sessions", "AS-Path attribute loop prevention", "Prefix route selection policies"],
    href: "/protocols/bgp",
  },
];

export const FAQS: LandingFaq[] = [
  {
    id: "faq-1",
    question: "What is NetViz Studio?",
    answer:
      "NetViz Studio is an interactive educational platform for visualizing network protocol behavior, configuring simulated topologies, calculating CIDR subnets, and completing hands-on networking labs in your browser.",
    category: "General",
  },
  {
    id: "faq-2",
    question: "Is NetViz Studio a real network emulator?",
    answer:
      "It is primarily an educational visualization and simulation platform. It models important protocol state machines, header fields, and packet forwarding algorithms with technical accuracy, but does not execute full vendor operating system images (like Cisco IOS or Linux kernel networking).",
    category: "Technical",
  },
  {
    id: "faq-3",
    question: "Can I use it without creating an account?",
    answer:
      "Yes! Public demonstrations, protocol visualizations, CIDR calculations, and basic topology sandbox tools are freely accessible without signing in. Creating an account allows you to save custom topologies, track lab completion progress, and store simulation presets.",
    category: "Account",
  },
  {
    id: "faq-4",
    question: "What does an account allow me to save?",
    answer:
      "An account securely isolates and stores your completed guided lab scores, task verification history, saved network topology diagrams, custom simulation configurations, and user preferences.",
    category: "Account",
  },
  {
    id: "faq-5",
    question: "Which protocols are currently available?",
    answer:
      "TCP, UDP, IPv4, ARP, and ICMP are fully interactive today with step-by-step frame inspection. DHCP and DNS visualizers are currently in development, while OSPF and BGP routing simulations are planned for upcoming releases.",
    category: "Features",
  },
  {
    id: "faq-6",
    question: "Can I build my own custom network topology?",
    answer:
      "Yes. The Topology Builder provides a drag-and-drop canvas featuring PCs, L2/L3 switches, routers, firewalls, servers, and cloud gateways. You can configure IP interfaces, assign static routes, and run pings or packet traces across your custom design.",
    category: "Features",
  },
  {
    id: "faq-7",
    question: "Does it include CIDR and subnetting tools?",
    answer:
      "Yes! CIDR Studio includes an interactive IPv4 calculator that breaks down any CIDR prefix into network address, broadcast address, host range, netmask, wildcard, and a 32-bit binary network vs host bit visual mapping.",
    category: "Features",
  },
  {
    id: "faq-8",
    question: "Are the labs suitable for beginners?",
    answer:
      "Absolutely. Guided labs range from Beginner (Local Network Communication, Subnet Basics) to Intermediate (TCP Loss & Retransmission, Cross-Subnet Routing) and Advanced (Dynamic OSPF Routing & Troubleshooting). Each lab includes task instructions, hints, and automated validation.",
    category: "Labs",
  },
  {
    id: "faq-9",
    question: "Does NetViz Studio work on mobile devices?",
    answer:
      "Yes. The landing page, protocol visualizers, CIDR studio, and lab guides feature fully responsive layouts optimized for touch devices, tablets, and desktop displays.",
    category: "Technical",
  },
  {
    id: "faq-10",
    question: "Are protocol simulations fully RFC-complete?",
    answer:
      "Simulations are engineered to align with core RFC specifications (e.g., RFC 793 for TCP, RFC 768 for UDP, RFC 826 for ARP). For educational clarity, edge cases or vendor-proprietary variations may be simplified with clear documentation.",
    category: "Technical",
  },
  {
    id: "faq-11",
    question: "Can instructors or teachers use this in class?",
    answer:
      "Yes! Instructors use NetViz Studio to visually demonstrate three-way handshakes, ARP broadcasts, routing decisions, and subnet calculations live on screen during lectures or assign interactive labs for homework.",
    category: "Education",
  },
  {
    id: "faq-12",
    question: "Is my saved topology and progress private?",
    answer:
      "Yes. Saved topologies and progress data are isolated to your authenticated account ID stored securely in your browser's workspace storage.",
    category: "Privacy",
  },
];

export const AUDIENCE_CARDS: LandingAudienceCard[] = [
  {
    id: "students",
    title: "Networking Students",
    role: "Computer Science & IT Undergrads",
    description: "Turn abstract textbook diagrams into observable, interactive packet movements and state machine transitions.",
    benefits: ["Visualize OSI and TCP/IP layers side-by-side", "Watch 3-way handshakes step-by-step", "Understand header fields visually"],
    iconName: "GraduationCap",
  },
  {
    id: "certification",
    title: "CCNA & Network+ Learners",
    role: "Certification Candidates",
    description: "Master IPv4 subnetting, MAC table learning, default gateways, and static routing required for exam success.",
    benefits: ["Practice 32-bit binary CIDR calculations", "Troubleshoot misconfigured subnets & gateways", "Validate answers with instant feedback"],
    iconName: "Award",
  },
  {
    id: "developers",
    title: "Software Developers",
    role: "Full-Stack & Backend Engineers",
    description: "Understand transport layer latency, connection pooling, TCP packet loss, and socket behavior below application code.",
    benefits: ["See what happens during TCP handshake delays", "Compare TCP vs UDP performance tradeoffs", "Inspect packet drop and retransmissions"],
    iconName: "Code2",
  },
  {
    id: "instructors",
    title: "Technical Instructors",
    role: "Professors & IT Trainers",
    description: "Use dynamic interactive simulations during lectures to explain complex routing, switching, and protocol concepts clearly.",
    benefits: ["Live interactive lecture demonstrations", "No local software installation required", "Pre-built lab challenges for assignments"],
    iconName: "Presentation",
  },
  {
    id: "beginners",
    title: "Networking Beginners",
    role: "Self-Taught Learners & Enthusiasts",
    description: "Start with guided, plain-English explanations and step-by-step labs before progressing into advanced routing topology design.",
    benefits: ["Beginner explanation detail mode", "Progressive hints during lab challenges", "Experiment safely in browser sandbox"],
    iconName: "Sparkles",
  },
];

export const CAPABILITY_ITEMS: LandingCapabilityItem[] = [
  { id: "packet-anim", title: "Packet Animation", description: "Smooth canvas rendering of packet traversal across links", iconName: "Play" },
  { id: "step-playback", title: "Step Playback", description: "Pause, step forward, or rewind simulation steps", iconName: "StepForward" },
  { id: "event-timeline", title: "Event Timeline", description: "Detailed log of every packet transmit, receive, and drop event", iconName: "Clock" },
  { id: "packet-inspector", title: "Packet Inspector", description: "Layer-by-layer header field and payload inspector", iconName: "Search" },
  { id: "tcp-state", title: "TCP State Machine", description: "SYN-SENT, ESTABLISHED, FIN-WAIT state visualization", iconName: "GitCommit" },
  { id: "loss-sim", title: "Packet Loss & Delay", description: "Inject link latency and drop rates to test resilience", iconName: "AlertTriangle" },
  { id: "arp-mac-tables", title: "ARP & MAC Tables", description: "Live dynamic ARP binding and switch MAC table inspection", iconName: "Database" },
  { id: "routing-tables", title: "Routing Tables", description: "L3 longest-prefix match routing decision inspection", iconName: "Route" },
  { id: "cidr-calc", title: "CIDR Calculator", description: "Instant IPv4 prefix calculations and usable host ranges", iconName: "Calculator" },
  { id: "binary-subnet", title: "Binary Mask Visualizer", description: "32-bit network vs host bit color-coded representation", iconName: "Binary" },
  { id: "topology-builder", title: "Topology Builder", description: "Drag-and-drop canvas for PCs, switches, routers, firewalls", iconName: "GitBranch" },
  { id: "guided-labs", title: "Guided Labs", description: "Step-by-step challenges with interactive objectives", iconName: "CheckSquare" },
  { id: "auto-validation", title: "Auto Validation", description: "Real-time verification of IP, route, and packet delivery", iconName: "CheckCircle2" },
  { id: "fault-injection", title: "Fault Injection", description: "Simulate link cuts, misconfigured IP masks, and drops", iconName: "Zap" },
  { id: "saved-progress", title: "Saved Progress", description: "Isolated progress tracking for authenticated users", iconName: "Bookmark" },
  { id: "responsive-ui", title: "Responsive Layout", description: "Tailored experience across desktop, tablet, and mobile", iconName: "Smartphone" },
  { id: "theme-modes", title: "Dark & Light Themes", description: "Instant switching between Light, Dark, and System modes", iconName: "SunMoon" },
  { id: "accessibility", title: "Accessibility First", description: "Keyboard navigation, ARIA focus traps, and reduced motion", iconName: "Eye" },
];

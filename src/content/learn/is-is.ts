import type { LearningTopic } from "@/data/learning-content";

export const isIsTopic: LearningTopic = {
  id: "is-is",
  title: "IS-IS",
  subtitle: "Intermediate System to Intermediate System — Link-state Interior Gateway Protocol operating directly over Layer 2",
  category: "routing",
  readTime: "9 min",
  summary:
    "IS-IS (Intermediate System to Intermediate System, ISO/IEC 10589 / RFC 1195) is a link-state Interior Gateway Protocol (IGP). Originally designed for ISO CLNS networks and extended for IP (Integrated IS-IS), IS-IS operates directly over Layer 2 frames using Dijkstra's Shortest Path First (SPF) algorithm to route traffic across service provider cores and large data center fabrics.",
  keyTakeaways: [
    "Operates as a Link-State Interior Gateway Protocol (IGP) directly over Layer 2 (Ethernet frames).",
    "Uses Dijkstra's Shortest Path First (SPF) algorithm to compute shortest loop-free paths.",
    "Structures hierarchy into Level 1 (Intra-Area) and Level 2 (Inter-Area Backbone) routing.",
    "Encapsulates data using flexible Type-Length-Value (TLV) triplets, enabling seamless protocol extensions.",
    "Does not depend on IP for neighbor discovery or packet transport, making it immune to IP spoofing attacks.",
    "Heavily used in Telecom Service Provider cores, Segment Routing (SRv6), and Data Center fabrics.",
  ],
  diagram: {
    title: "IS-IS Level 1 / Level 2 Hierarchical Routing Topology",
    textRepresentation: `IS-IS Two-Tier Hierarchy:

    [ Area 49.0001 (L1) ]                 [ Level 2 Backbone Core ]                [ Area 49.0002 (L1) ]
 ┌─────────────────────────┐             ┌─────────────────────────┐            ┌─────────────────────────┐
 │ Router A1 (Level 1)     │             │ Router B1 (Level 2)     │            │ Router C1 (Level 1)     │
 │       │                 │             │       │                 │            │       │                 │
 │       ▼                 │             │       ▼                 │            │       ▼                 │
 │ Router A2 (Level 1/2) ──┼─── L2 Link ─┼──► Router B2 (Level 1/2) ──┼── L2 Link ─┼──► Router C2 (Level 1/2) │
 └─────────────────────────┘             └─────────────────────────┘            └─────────────────────────┘`,
  },
  importantTerms: [
    { term: "Intermediate System (IS)", definition: "ISO terminology for a Network Layer router." },
    { term: "End System (ES)", definition: "ISO terminology for an end-user host computer or server." },
    { term: "Level 1 Router (L1)", definition: "Routes traffic within a single local IS-IS area (Intra-Area)." },
    { term: "Level 2 Router (L2)", definition: "Routes traffic between different IS-IS areas in the backbone (Inter-Area)." },
    { term: "Level 1/2 Router (L1/L2)", definition: "A dual-role router operating at the boundary between an L1 area and the L2 backbone." },
    { term: "NET (Network Entity Title)", definition: "An ISO network address (8 to 20 bytes) uniquely identifying an IS-IS router and its area." },
    { term: "LSP (Link State PDU)", definition: "Protocol Data Unit carrying link-state advertisements in IS-IS." },
    { term: "TLV (Type-Length-Value)", definition: "Flexible encoding structure used to carry routing information, prefixes, and metrics in IS-IS." },
  ],
  sections: [
    {
      id: "why-is-is-used",
      title: "Why IS-IS is Used in Provider Networks",
      body: "While enterprise networks favor OSPF, major Internet Service Providers (ISPs) and telecommunication carriers heavily favor IS-IS. Because IS-IS runs directly on Layer 2 Ethernet frames without requiring an IP protocol stack, it is stable, secure, highly scalable, and handles IPv4 and IPv6 simultaneously without needing dual protocol engines.",
    },
    {
      id: "how-is-is-works",
      title: "How IS-IS Operates: Area Boundaries & Levels",
      body: "IS-IS organizes networks differently than OSPF:",
      bullets: [
        "1. Router-Centric Areas: In IS-IS, individual routers belong to an Area (unlike OSPF where individual links belong to areas).",
        "2. Level 1 Routing: L1 routers build an L1 Link-State Database (LSDB) and route packets strictly within their local area.",
        "3. Level 2 Routing: L2 routers build a separate L2 LSDB and route packets between different areas across the backbone core.",
        "4. Level 1/2 Border Routers: Maintain two separate LSDBs (L1 and L2) and set an Attached Bit (ATT) to advertise default routes to L1 routers.",
      ],
    },
    {
      id: "tlv-extensibility",
      title: "TLV Extensibility & Segment Routing",
      body: "IS-IS carries data inside Type-Length-Value (TLV) blocks. This flexible design allowed engineers to add IPv6 support (Integrated IS-IS) and Segment Routing (SR-MPLS / SRv6) simply by defining new TLVs without rewriting the core protocol engine.",
    },
  ],
  advantages: [
    "Runs directly over Layer 2 — immune to Layer 3 IP spoofing and transport crashes.",
    "Single protocol instance routes both IPv4 and IPv6 simultaneously using Multi-Topology IS-IS.",
    "Extremely scalable in massive service provider cores with thousands of routers.",
    "Highly extensible via Type-Length-Value (TLV) attributes.",
  ],
  disadvantages: [
    "Complex ISO Network Entity Title (NET) address formatting (e.g. 49.0001.1921.6800.1001.00).",
    "Less common in standard corporate enterprise LANs, requiring specialized ISP engineering expertise.",
  ],
  commonUseCases: [
    "Interior Gateway Protocol for major Telecommunication ISPs and Tier-1 carriers.",
    "Underlay routing protocol for Segment Routing (SRv6) and MPLS backbones.",
    "Data center fabric routing (TRILL / FabricPath).",
  ],
  commonMistakes: [
    "Confusing IS-IS area boundaries with OSPF area boundaries — in IS-IS, the area boundary is on the link between routers, not inside the router itself.",
    "Misconfiguring System IDs in the NET address — every router must have a globally unique System ID.",
  ],
  comparison: {
    headers: ["Aspect", "IS-IS Protocol", "OSPF Protocol"],
    rows: [
      { label: "Transport Layer", classful: "Layer 2 (Direct Data Link Frames)", cidr: "Layer 3 (IP Protocol 89)" },
      { label: "Area Boundary", classful: "On the links between routers", cidr: "Inside the router (ABR interface ports)" },
      { label: "IPv6 Support", classful: "Integrated via single process (Multi-Topology TLVs)", cidr: "Requires separate OSPFv3 protocol instance" },
      { label: "Data Encoding", classful: "Flexible Type-Length-Value (TLV) format", cidr: "Fixed LSA header structures" },
      { label: "Primary Deployment", classful: "Service Providers, Telcos, Data Center Fabrics", cidr: "Corporate Enterprise LANs & WANs" },
    ],
  },
  beginnerSummary:
    "IS-IS is a high-performance routing protocol used by giant Internet Service Providers (ISPs). Because it runs directly on physical network cables without needing an IP stack to run, it is super fast, stable, and can route both IPv4 and IPv6 traffic at the same time.",
  relatedLinks: [
    { label: "OSPF", href: "/learn/ospf" },
    { label: "BGP", href: "/learn/bgp" },
    { label: "Router", href: "/learn/router" },
    { label: "Routes", href: "/learn/routes" },
  ],
};

import type { LearningTopic } from "@/data/learning-content";

export const ospfTopic: LearningTopic = {
  id: "ospf",
  title: "OSPF",
  subtitle: "Open Shortest Path First — Link-State Interior Gateway Protocol (IGP)",
  category: "routing",
  readTime: "9 min",
  summary:
    "OSPF (Open Shortest Path First) is an open-standard Interior Gateway Protocol (IGP) operating at Layer 3. It uses link-state advertisements (LSAs) and Dijkstra's Shortest Path First (SPF) algorithm to calculate optimal, loop-free routing paths within an Autonomous System.",
  keyTakeaways: [
    "Operates as a Link-State Interior Gateway Protocol (IGP).",
    "Uses Dijkstra's SPF algorithm to calculate shortest paths based on interface cumulative Cost.",
    "Routers discover neighbors by exchanging Hello packets on multicast 224.0.0.5.",
    "All routers in an Area maintain an identical Link-State Database (LSDB).",
    "Uses a hierarchical two-tier area architecture centered around Area 0 (Backbone Area).",
    "Note: Educational overview — does not cover every OSPF state or packet type.",
  ],
  diagram: {
    title: "OSPF Neighbor Topology & Operation Flow",
    textRepresentation: `OSPF Area 0 Topology:
 Router-1 ────── Router-2
    │               │
    └──── Router-3 ─┘

General OSPF Operational Sequence:
Hello Packets ──► Neighbor Adjacency ──► LSA Exchange ──► LSDB Sync ──► SPF Run ──► Route Table Installation`,
  },
  importantTerms: [
    { term: "Router ID (RID)", definition: "A 32-bit unique IP-style identifier for an OSPF router." },
    { term: "Link-State Advertisement (LSA)", definition: "Data packets sent by OSPF routers describing interface states and link costs." },
    { term: "Link-State Database (LSDB)", definition: "The complete map database of all routers and links within an OSPF area." },
    { term: "Area 0 (Backbone Area)", definition: "The mandatory central OSPF area to which all other areas must connect." },
    { term: "Cost Metric", definition: "OSPF path cost calculated as Reference Bandwidth / Interface Bandwidth." },
    { term: "DR / BDR", definition: "Designated Router and Backup Designated Router elected on multiaccess networks to reduce LSA flooding." },
  ],
  sections: [
    {
      id: "why-ospf-needed",
      title: "Why OSPF is Needed",
      body: "In medium to large enterprise networks with dozens or hundreds of routers, static routing is unmanageable. OSPF automatically discovers network topology, calculates optimal loop-free paths, and reroutes traffic around failed links within seconds.",
    },
    {
      id: "how-ospf-works",
      title: "How OSPF Works Step-by-Step",
      body: "OSPF operates through 5 fundamental execution phases:",
      bullets: [
        "1. Neighbor Discovery: Routers send multicast Hello packets (224.0.0.5) to discover adjacent OSPF routers.",
        "2. Adjacency Formation: Routers negotiate parameters (Area ID, Subnet Mask, Timers) to form neighbor adjacencies.",
        "3. LSA Flooding & Database Synchronization: Routers exchange LSAs until all routers in the area hold an identical LSDB.",
        "4. SPF Calculation: Each router runs Dijkstra's algorithm against the LSDB, placing itself at the root of a shortest path tree.",
        "5. Route Installation: The lowest-cost paths are installed into the active IP routing table with AD 110.",
      ],
    },
    {
      id: "ospf-areas-hierarchy",
      title: "OSPF Two-Tier Area Hierarchy",
      body: "To scale in large networks, OSPF divides networks into logical Areas:",
      bullets: [
        "Area 0 (Backbone): The central hub area for inter-area traffic.",
        "Non-Backbone Areas (Area 1, 2...): Localized areas connected to Area 0 via Area Border Routers (ABRs).",
        "Benefit: LSAs are contained within local areas, reducing SPF CPU recalculations.",
      ],
    },
  ],
  advantages: [
    "Fast convergence — reroutes around failed links in seconds.",
    "Loop-free path calculation using Dijkstra's algorithm.",
    "Hierarchical area structure allows massive scalability.",
    "Standardized open protocol supported by all router vendors.",
  ],
  disadvantages: [
    "Higher CPU and RAM overhead on routers maintaining large LSDBs.",
    "Complex design requirements around Area 0 connectivity.",
  ],
  commonUseCases: [
    "Interior routing protocol for corporate enterprise networks.",
    "Routing across data center spine-and-leaf fabrics.",
  ],
  commonMistakes: [
    "Mismatched OSPF Area IDs, Subnet Masks, or Hello/Dead timers on neighboring interfaces — prevents neighbor adjacency.",
    "Creating non-backbone areas that do not connect physically or via virtual link to Area 0.",
  ],
  comparison: {
    headers: ["Aspect", "OSPF (Link-State IGP)", "BGP (Path-Vector EGP)"],
    rows: [
      { label: "Scope", classful: "Interior (Within a single enterprise/AS)", cidr: "Exterior (Between different Autonomous Systems)" },
      { label: "Algorithm", classful: "Dijkstra SPF (Shortest Path First)", cidr: "Policy-Based Best-Path Selection" },
      { label: "Metric", classful: "Interface Cost (Bandwidth based)", cidr: "Path Attributes (AS_PATH, LocalPref, MED)" },
      { label: "Convergence Speed", classful: "Very Fast (Seconds)", cidr: "Slower (Tuned for stability over internet scale)" },
      { label: "Default Admin Distance", classful: "110", cidr: "20 (eBGP), 200 (iBGP)" },
    ],
  },
  beginnerSummary:
    "OSPF is an intelligent interior routing protocol for company networks. It acts like a GPS app: every router builds a complete map of the network, calculates the fastest paths using cable speeds, and automatically redirects traffic if a link goes down.",
  relatedLinks: [
    { label: "Router", href: "/learn/router" },
    { label: "Routes", href: "/learn/routes" },
    { label: "Static Routing", href: "/learn/static-routing" },
    { label: "BGP", href: "/learn/bgp" },
  ],
  advancedNotes:
    "OSPF metric formula: Cost = Reference Bandwidth (default 100 Mbps) / Interface Bandwidth. On modern Gigabit and 10G networks, administrators must adjust reference bandwidth (auto-cost reference-bandwidth 10000) so Gigabit links are not assigned the same cost as 100M links.",
};

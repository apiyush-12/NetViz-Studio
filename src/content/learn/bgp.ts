import type { LearningTopic } from "@/data/learning-content";

export const bgpTopic: LearningTopic = {
  id: "bgp",
  title: "BGP",
  subtitle: "Border Gateway Protocol — Path-Vector Exterior Gateway Protocol (EGP) powering global Internet routing",
  category: "routing",
  readTime: "9 min",
  summary:
    "BGP (Border Gateway Protocol, BGP-4) is the standardized Exterior Gateway Protocol (EGP) that connects the global Internet. It exchanges reachability information between independent Autonomous Systems (AS) using policy-based path-vector evaluation.",
  keyTakeaways: [
    "Operates as the primary Exterior Gateway Protocol (EGP) of the Internet core.",
    "Uses TCP port 179 for reliable peer session establishment.",
    "Exchanges prefix advertisements between Autonomous Systems (ASNs).",
    "Evaluates routes using policy-based Path Attributes (AS_PATH, LocalPref, MED, Weight).",
    "eBGP peers reside in different Autonomous Systems; iBGP peers reside in the same AS.",
    "BGP does NOT simply pick the shortest physical distance; path selection is controlled by policy.",
    "Note: Overview — actual BGP path selection contains additional rules per vendor implementation.",
  ],
  diagram: {
    title: "BGP Autonomous System Inter-Domain Flow",
    textRepresentation: `Internet Inter-AS Routing:
[ AS 65001: Enterprise ] ──( eBGP Session )──► [ AS 65002: ISP A ] ──( eBGP )──► [ AS 65003: ISP B ]
                                                    │
                                               ( iBGP Session )
                                                    ▼
                                           [ AS 65002: Router 2 ]

BGP Path Attribute Stack:
Prefix: 8.8.8.0/24 | AS_PATH: 65002 65003 | NEXT_HOP: 192.0.2.1 | LOCAL_PREF: 100`,
  },
  importantTerms: [
    { term: "Autonomous System (AS)", definition: "A collection of IP networks under a single administrative control entity with a unique AS Number (ASN)." },
    { term: "eBGP (External BGP)", definition: "BGP peering sessions established between routers in DIFFERENT Autonomous Systems." },
    { term: "iBGP (Internal BGP)", definition: "BGP peering sessions established between routers within the SAME Autonomous System." },
    { term: "AS_PATH", definition: "A path attribute listing all Autonomous System numbers a prefix advertisement has traversed (used to prevent loops)." },
    { term: "Local Preference (LocalPref)", definition: "An internal BGP attribute used to select the preferred exit point out of an AS for outbound traffic." },
    { term: "MED (Multi-Exit Discriminator)", definition: "An attribute suggested to neighboring ASes to influence inbound traffic entry points." },
  ],
  sections: [
    {
      id: "why-bgp-needed",
      title: "Why BGP is Needed",
      body: "Interior Gateway Protocols like OSPF are designed for single company networks and cannot scale to handle 1,000,000+ global Internet routes. BGP provides path-vector routing and business policy enforcement required to connect independent ISPs globally.",
    },
    {
      id: "how-bgp-works",
      title: "How BGP Selects Paths",
      body: "BGP establishes TCP sessions over port 179 and exchanges prefix UPDATE messages. When multiple paths exist for an IP prefix, BGP evaluates attributes in strict priority order:",
      bullets: [
        "1. Highest Weight (Local vendor parameter).",
        "2. Highest Local Preference (LocalPref — outbound traffic tuning).",
        "3. Prefer locally originated routes.",
        "4. Shortest AS_PATH length (Fewest AS hops).",
        "5. Lowest Origin code (IGP < EGP < Incomplete).",
        "6. Lowest MED (Multi-Exit Discriminator — inbound traffic influence).",
        "7. Prefer eBGP path over iBGP path.",
      ],
    },
    {
      id: "ebgp-vs-ibgp",
      title: "eBGP vs iBGP Peering",
      body: "Key differences between external and internal BGP sessions:",
      bullets: [
        "eBGP: Peers in different ASNs. Decrements IP TTL to 1 by default. Prepends local ASN to AS_PATH.",
        "iBGP: Peers in the same ASN. Used to distribute transit routes inside the AS. Does not modify AS_PATH.",
      ],
    },
  ],
  advantages: [
    "Scales to support the global Internet routing table (1,000,000+ prefixes).",
    "Provides precise policy-based control over inbound and outbound traffic routing.",
    "Built-in loop prevention via the AS_PATH attribute.",
  ],
  disadvantages: [
    "Slower convergence compared to link-state IGPs (OSPF).",
    "Complex configuration requiring high network engineering expertise.",
    "Vulnerable to BGP Route Hijacking if BGPsec and RPKI filtering are not deployed.",
  ],
  commonUseCases: [
    "Connecting Multi-Homed enterprises to multiple Internet Service Providers for redundancy.",
    "Exchanging routes at Internet Exchange Points (IXPs) between ISP carriers.",
  ],
  commonMistakes: [
    "Assuming BGP chooses the fastest or shortest physical path — BGP routing decisions are driven by administrative policy and AS hop count.",
    "Forgetting that iBGP requires a full mesh among all iBGP routers or the use of Route Reflectors.",
  ],
  comparison: {
    headers: ["Aspect", "BGP (Exterior Gateway Protocol)", "OSPF (Interior Gateway Protocol)"],
    rows: [
      { label: "Scope", classful: "Between different Autonomous Systems (Internet Core)", cidr: "Within a single Autonomous System (Company LAN/WAN)" },
      { label: "Transport Protocol", classful: "TCP Port 179", cidr: "IP Protocol 89 (Direct IP)" },
      { label: "Routing Metric", classful: "Path Attributes (AS_PATH, LocalPref, MED)", cidr: "Shortest Path First Cost (Bandwidth)" },
      { label: "Scale Capacity", classful: "1,000,000+ prefixes", cidr: "Thousands of prefixes" },
    ],
  },
  beginnerSummary:
    "BGP is the routing protocol that binds the global Internet together. It allows large ISPs and tech companies to exchange lists of IP addresses and enforce business agreements about how Internet traffic flows between countries and networks.",
  relatedLinks: [
    { label: "Router", href: "/learn/router" },
    { label: "Routes", href: "/learn/routes" },
    { label: "OSPF", href: "/learn/ospf" },
    { label: "Static Routing", href: "/learn/static-routing" },
  ],
};

import type { LearningTopic } from "@/data/learning-content";

export const staticRoutingTopic: LearningTopic = {
  id: "static-routing",
  title: "Static Routing",
  subtitle: "Manually configured static network routes for deterministic traffic forwarding",
  category: "routing",
  readTime: "7 min",
  summary:
    "Static routing is the manual configuration of network routes by a network administrator. Unlike dynamic routing protocols, static routes do not adapt automatically when network topologies change or links fail.",
  keyTakeaways: [
    "Manually entered into router configuration tables by administrators.",
    "Has a default Administrative Distance (AD) of 1 (extremely trustworthy).",
    "Requires low router CPU and memory overhead because no control packets are exchanged.",
    "Floating static routes provide backup paths by using a higher AD value.",
    "Does not scale well in large, complex, or frequently changing networks.",
  ],
  diagram: {
    title: "Static Route Configuration Syntax & Topology Flow",
    textRepresentation: `Topology:
[ Router 1 ] ──( 10.0.0.0/30 Link )──► [ Router 2 ] ──► [ Branch LAN: 192.168.2.0/24 ]
 (Interface G0/1: 10.0.0.1)              (Interface G0/0: 10.0.0.2)

Static Route Command on Router 1:
ip route 192.168.2.0 255.255.255.0 10.0.0.2
 └──┬──┘  └──────┬──────┘ └─────┬───────┘ └────┬───┘
 Target    Subnet Mask     Next-Hop IP   Exit Interface (Optional)`,
  },
  importantTerms: [
    { term: "Static Route", definition: "A fixed route entry configured manually by an administrator." },
    { term: "Next-Hop Address", definition: "The specific IP address of the adjacent router to forward packets to." },
    { term: "Floating Static Route", definition: "A backup static route configured with a higher Administrative Distance (e.g. AD 130) that only activates if the primary route fails." },
    { term: "Default Static Route", definition: "A static route pointing to 0.0.0.0 0.0.0.0 used for Internet-bound fallback traffic." },
    { term: "Recursive Lookup", definition: "When a router must perform a second routing table lookup to determine the egress interface for a next-hop IP." },
  ],
  sections: [
    {
      id: "why-static-routing-used",
      title: "Why Static Routing is Used",
      body: "Static routing offers total administrative control, zero routing protocol bandwidth overhead, and maximum predictability. It is ideal for small networks, stub networks with a single connection to an ISP, or defining static backup links.",
    },
    {
      id: "how-static-routing-works",
      title: "How Static Routing Works",
      body: "An administrator inputs a static route command defining the target destination network, subnet mask, and next-hop router IP:",
      bullets: [
        "1. Administrator defines target IP block (e.g. 192.168.2.0/24).",
        "2. Specifies next-hop gateway IP (e.g. 10.0.0.2).",
        "3. Router installs entry into its routing table with AD 1.",
        "4. Router forwards matching packets to 10.0.0.2 without running routing calculations.",
      ],
    },
    {
      id: "common-static-routing-mistakes",
      title: "Common Static Routing Pitfalls & Failures",
      body: "Troubleshooting static routing issues:",
      bullets: [
        "Missing Return Route: Router 1 sends traffic to Router 2, but Router 2 lacks a static route back to Router 1 — packets drop on reply.",
        "Invalid Next-Hop IP: Entering an unreachable next-hop IP prevents the static route from being installed in the active routing table.",
        "Routing Loop: Configuring Router A to send traffic to Router B, while Router B sends the same prefix back to Router A.",
      ],
    },
  ],
  advantages: [
    "Zero CPU and RAM overhead — no routing protocol background processes.",
    "Zero bandwidth consumption — no routing updates sent across links.",
    "High security — path cannot be hijacked by spoofed routing protocol updates.",
  ],
  disadvantages: [
    "High administrative effort to configure and maintain across multiple routers.",
    "No automatic rerouting — if a link breaks, static traffic drops until manually updated.",
    "Does not scale in enterprise or ISP networks with dozens of routers.",
  ],
  commonUseCases: [
    "Configuring default gateway routes (0.0.0.0/0) from customer routers to an ISP.",
    "Connecting a small branch office stub network with only one physical link.",
    "Creating floating backup static routes over secondary cellular/dialup connections.",
  ],
  commonMistakes: [
    "Forgetting to configure a return route on destination routers.",
    "Not updating static routes when IP addressing schemes change.",
  ],
  comparison: {
    headers: ["Aspect", "Static Routing", "Dynamic Routing (OSPF/BGP)"],
    rows: [
      { label: "Configuration", classful: "Manually typed per route per router", cidr: "Automated neighbor discovery & path calculation" },
      { label: "Link Failure Response", classful: "Manual intervention required", cidr: "Automatic convergence & rerouting around failures" },
      { label: "Router Overhead", classful: "None (Zero CPU/Bandwidth)", cidr: "Requires CPU, RAM, & link control packets" },
      { label: "Scalability", classful: "Poor (Small networks only)", cidr: "High (Global Internet & large enterprise networks)" },
      { label: "Default Admin Distance", classful: "1 (Very High Priority)", cidr: "110 (OSPF), 20 (eBGP)" },
    ],
  },
  beginnerSummary:
    "Static routing is manually typing specific directions into a router. It works great for simple networks with one path, but requires manual work to update if a cable is cut or network topology changes.",
  relatedLinks: [
    { label: "Router", href: "/learn/router" },
    { label: "Routes", href: "/learn/routes" },
    { label: "OSPF", href: "/learn/ospf" },
    { label: "BGP", href: "/learn/bgp" },
  ],
};

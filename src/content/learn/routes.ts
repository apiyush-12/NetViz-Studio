import type { LearningTopic } from "@/data/learning-content";

export const routesTopic: LearningTopic = {
  id: "routes",
  title: "Routes",
  subtitle: "Individual routing table entries defining network paths, next hops, metrics, and administrative distances",
  category: "routing",
  readTime: "7 min",
  summary:
    "A route is a specific rule or database entry inside a router's Routing Table. It instructs the router how to reach a target destination network prefix by specifying the next-hop IP address or egress physical interface.",
  keyTakeaways: [
    "A route consists of: Target Network Prefix, Subnet Mask, Next-Hop IP / Interface, Metric, and Administrative Distance (AD).",
    "Connected routes are created automatically when a router interface is enabled with an IP.",
    "Static routes are configured manually by network administrators.",
    "Dynamic routes are learned automatically via protocols like OSPF or BGP.",
    "Routers evaluate routes using Longest Prefix Matching (LPM).",
  ],
  diagram: {
    title: "Sample Router Routing Table Representation",
    textRepresentation: `Sample Router Routing Table:

+-------------------+--------------------+-----------+------------+-------+
| Destination Prefix| Next-Hop IP        | Interface | Type       | AD/M  |
+-------------------+--------------------+-----------+------------+-------+
| 192.168.1.0/24    | Directly connected | G0/0      | Connected  | 0/0   |
| 10.0.0.0/8        | 172.16.0.2         | G0/1      | Static     | 1/0   |
| 172.16.0.0/16     | 172.16.0.2         | G0/1      | OSPF       | 110/20|
| 0.0.0.0/0         | 192.168.1.1        | G0/0      | Default    | 1/0   |
+-------------------+--------------------+-----------+------------+-------+`,
  },
  importantTerms: [
    { term: "Destination Prefix", definition: "The target IP network block (e.g. 10.0.0.0/8) being routed." },
    { term: "Next-Hop IP", definition: "The adjacent router's interface IP where packets are handed off." },
    { term: "Administrative Distance (AD)", definition: "A trustworthiness rating (0-255) used to choose between multiple routing sources (lower AD wins)." },
    { term: "Metric", definition: "A path cost calculation (bandwidth, hop count, delay) used by dynamic protocols to pick the best path among identical AD sources." },
    { term: "Default Route (0.0.0.0/0)", definition: "The fallback route entry used when no specific prefix matches the destination IP." },
  ],
  sections: [
    {
      id: "why-routes-needed",
      title: "Why Routes Are Needed",
      body: "A router with 10 interfaces has no inherent knowledge of how to reach networks 5 hops away unless explicit route entries are added to its routing table by connected interfaces, static administrator commands, or dynamic routing protocols.",
    },
    {
      id: "types-of-routes",
      title: "Types of Routing Table Entries",
      body: "Routes in a routing table are categorized by how they were learned:",
      bullets: [
        "Connected Route (AD 0): Automatically added when an interface is assigned an IP and powered on.",
        "Local Route (AD 0): /32 host route for the router's own interface IP address.",
        "Static Route (AD 1): Manually configured by an administrator.",
        "Dynamic Route (AD 90 EIGRP, 110 OSPF, 20 eBGP): Learned automatically by exchanging routing messages with neighboring routers.",
        "Default Route (0.0.0.0/0): Match-all fallback route.",
      ],
    },
    {
      id: "longest-prefix-match-rule",
      title: "Longest Prefix Match (LPM) Evaluation Rule",
      body: "When a packet arrives for IP 10.1.5.25, the router compares the IP against all candidate routes. The route with the longest (most specific) network mask wins:",
      bullets: [
        "Candidate 1: 0.0.0.0/0 (Default route - /0 match)",
        "Candidate 2: 10.0.0.0/8 (Matching /8 prefix)",
        "Candidate 3: 10.1.5.0/24 (WINS - Longest matching /24 prefix)",
      ],
    },
  ],
  advantages: [
    "Granular control over network traffic paths.",
    "Administrative Distance tie-breaking ensures backup paths kick in automatically if primary routes drop.",
  ],
  disadvantages: [
    "Large global routing tables (1,000,000+ IPv4 prefixes in BGP) require specialized hardware memory (TCAM).",
  ],
  commonUseCases: [
    "Directing internal corporate traffic across WAN links.",
    "Setting default routes to forward internet-bound traffic to ISPs.",
  ],
  commonMistakes: [
    "Confusing Administrative Distance (breaks ties between different protocol sources) with Metric (breaks ties within the same protocol).",
    "Forgetting that routing is asymmetric — a valid outbound route does not guarantee a return route exists on remote routers.",
  ],
  comparison: {
    headers: ["Aspect", "Administrative Distance (AD)", "Route Metric"],
    rows: [
      { label: "Purpose", classful: "Measures protocol source trustworthiness", cidr: "Measures path quality within a protocol" },
      { label: "Scope", classful: "Compares DIFFERENT route sources (e.g. Static vs OSPF)", cidr: "Compares routes from the SAME protocol source" },
      { label: "Selection Rule", classful: "Lower AD value always wins (Connected=0, Static=1, OSPF=110)", cidr: "Lower metric cost wins (e.g. OSPF Cost 10 vs 50)" },
    ],
  },
  beginnerSummary:
    "A route is a single instruction line in a router's navigation map. It tells the router: 'To reach network X, send the packet out interface Y to neighboring router Z.'",
  relatedLinks: [
    { label: "Router", href: "/learn/router" },
    { label: "Static Routing", href: "/learn/static-routing" },
    { label: "OSPF", href: "/learn/ospf" },
    { label: "BGP", href: "/learn/bgp" },
  ],
};

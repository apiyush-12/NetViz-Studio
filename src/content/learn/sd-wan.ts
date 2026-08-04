import type { LearningTopic } from "@/data/learning-content";

export const sdWanTopic: LearningTopic = {
  id: "sd-wan",
  title: "SD-WAN",
  subtitle: "Software-Defined Wide Area Network — Application-aware WAN architecture overlaying dynamic path steering across multiple transport links",
  category: "routing",
  readTime: "9 min",
  summary:
    "SD-WAN (Software-Defined Wide Area Network) is a software-driven architecture that decouples network control logic from underlying physical hardware. It creates a secure virtual overlay network across disparate WAN transport links (MPLS, Commercial Broadband, 5G), dynamically routing application traffic based on real-time link performance.",
  keyTakeaways: [
    "Decouples the Control Plane (central management) from the Data Plane (edge routers).",
    "Establishes secure encrypted IPsec overlay tunnels across any physical transport link.",
    "Performs Application-Aware Routing (steering VoIP over low-latency links, bulk backups over cheap broadband).",
    "Provides Zero-Touch Provisioning (ZTP) to deploy new branch office routers automatically.",
    "Replaces or augments expensive legacy MPLS circuits with commercial broadband links.",
  ],
  diagram: {
    title: "SD-WAN Architecture: Control Planes & Dynamic Link Steering",
    textRepresentation: `SD-WAN Central Architecture:
                 ┌─────────────────────────────────────────┐
                 │ Central Orchestrator / Control Plane    │
                 └────────────────────┬────────────────────┘
                                      │ (Policy Control)
                                      ▼
[ Branch Edge Router ] ═════════════════════════════════════► [ Headquarter Router ]
   │  ├── Path 1: MPLS Circuit (Low Latency / High Cost) ──┤
   │  ├── Path 2: Commercial Broadband (High Speed) ───────┤  (Encrypted IPsec Overlay)
   └──└── Path 3: 5G Cellular Backup ──────────────────────┘`,
  },
  importantTerms: [
    { term: "Overlay Network", definition: "A virtual network constructed over underlying physical transport networks using IPsec tunnels." },
    { term: "Underlay Network", definition: "The physical transport links (MPLS, Fiber Broadband, 4G/5G) providing raw IP connectivity." },
    { term: "Control Plane", definition: "Centralized intelligence determining routing policies and network configuration." },
    { term: "Data Plane", definition: "Edge hardware devices executing actual packet forwarding based on control plane policies." },
    { term: "Application-Aware Routing", definition: "Dynamically measuring latency, jitter, and packet loss on links to steer specific applications (e.g. Zoom, SAP) to the optimal path." },
    { term: "Zero-Touch Provisioning (ZTP)", definition: "Automated onboarding allowing a new branch router to download its configuration automatically upon connecting to the Internet." },
  ],
  sections: [
    {
      id: "why-sd-wan-needed",
      title: "Why SD-WAN is Needed",
      body: "Legacy WAN architectures relied heavily on expensive dedicated MPLS circuits. As enterprise applications shifted to cloud SaaS platforms (Office 365, Salesforce), backhauling all branch office internet traffic through a central data center created severe performance bottlenecks. SD-WAN optimizes cloud access.",
    },
    {
      id: "how-sd-wan-works",
      title: "How SD-WAN Works: Overlay vs Underlay",
      body: "SD-WAN abstracts physical transport into a unified software overlay:",
      bullets: [
        "1. Secure Tunnel Mesh: Edge routers automatically build encrypted IPsec tunnels across available internet and MPLS links.",
        "2. Real-Time Link Probing: Continuously measures loss, latency, and jitter on all active transport links.",
        "3. Dynamic Path Selection: If an MPLS link experiences degradation, VoIP calls are instantly failover-steered to a broadband link without dropping the call.",
        "4. Central Orchestration: Administrators push security and routing policies globally from a single cloud console.",
      ],
    },
    {
      id: "sd-wan-cost-savings",
      title: "Economic Impact: Replacing MPLS",
      body: "SD-WAN enables enterprises to pair an existing expensive MPLS line with cheap commodity business broadband. By bonding multiple links, companies achieve higher bandwidth and redundancy at a fraction of the cost.",
    },
  ],
  advantages: [
    "Significant cost savings by augmenting or replacing expensive MPLS links with commodity internet.",
    "Dynamic application performance optimization based on real-time link quality metrics.",
    "Centralized cloud orchestration and Zero-Touch Provisioning for branch offices.",
    "Integrated perimeter security and direct cloud access (SASE / SSE integration).",
  ],
  disadvantages: [
    "Increased initial architectural complexity during transition from legacy WANs.",
    "Reliance on public broadband links requires robust encryption and security monitoring.",
  ],
  commonUseCases: [
    "Connecting hundreds of retail store branches, bank branches, or clinic locations to corporate systems and cloud apps.",
    "Providing direct secure internet breakout for Office 365 traffic at branch locations.",
  ],
  commonMistakes: [
    "Assuming SD-WAN eliminates the need for underlying SLA quality — bad broadband links with 20% packet loss will still degrade voice quality.",
    "Treating SD-WAN merely as a cost-cutting tool rather than a application performance enabler.",
  ],
  comparison: {
    headers: ["Aspect", "SD-WAN Architecture", "Legacy MPLS WAN"],
    rows: [
      { label: "Control Plane", classful: "Centralized software orchestrator", cidr: "Distributed router-by-router BGP/OSPF" },
      { label: "Transport Flexibility", classful: "Combines MPLS, Broadband, 4G/5G simultaneously", cidr: "Tied to single private carrier MPLS line" },
      { label: "Path Steering", classful: "Dynamic real-time routing based on application performance", cidr: "Static routing based strictly on destination IP" },
      { label: "Provisioning", classful: "Zero-Touch Provisioning (Minutes)", cidr: "Manual CLI setup per site (Weeks/Months)" },
    ],
  },
  beginnerSummary:
    "SD-WAN is smart navigation software for company networks. Instead of sending all company traffic down one expensive leased highway, SD-WAN monitors all available internet links (broadband, 5G, fiber) in real time and automatically sends your Zoom calls and files down the fastest, healthiest road.",
  relatedLinks: [
    { label: "Router", href: "/learn/router" },
    { label: "Cloud WAN", href: "/learn/cloud-wan" },
    { label: "VPN", href: "/learn/vpn" },
    { label: "BGP", href: "/learn/bgp" },
  ],
};

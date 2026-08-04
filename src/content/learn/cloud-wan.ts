import type { LearningTopic } from "@/data/learning-content";

export const cloudWanTopic: LearningTopic = {
  id: "cloud-wan",
  title: "Cloud WAN",
  subtitle: "Global managed network service connecting cloud regions, branch offices, and enterprise data centers",
  category: "routing",
  readTime: "8 min",
  summary:
    "Cloud WAN (such as AWS Cloud WAN or Azure Virtual WAN) is a managed central networking service that allows enterprises to build, manage, and monitor a global Wide Area Network (WAN). It connects multi-region cloud VPCs, remote branch offices, data centers, and VPNs across a unified cloud provider global backbone.",
  keyTakeaways: [
    "Unifies global cloud networks across multiple geographic regions.",
    "Uses a central Network Policy document to manage global routing and segmentation.",
    "Automates route propagation between cloud VPCs, SD-WAN branches, and data centers.",
    "Replaces complex manual mesh peering configurations with a hub-and-spoke global core.",
    "Integrates built-in telemetry, path monitoring, and network segmentation.",
  ],
  diagram: {
    title: "Global Cloud WAN Unified Backbone Architecture",
    textRepresentation: `Cloud WAN Central Global Policy
┌────────────────────────────────────────────────────────────────────────┐
│                      Global Cloud Backbone Network                     │
│  ┌──────────────────────┐                     ┌─────────────────────┐  │
│  │ US-East Core Network │ ◄──Backbone Fiber──►│ Europe Core Network │  │
│  └──────────┬───────────┘                     └──────────┬──────────┘  │
└─────────────┼────────────────────────────────────────────┼─────────────┘
              ▼                                            ▼
   ┌──────────────────────┐                     ┌─────────────────────┐
   │ US VPCs & SD-WAN     │                     │ EU VPCs & Data Ctr  │
   └──────────────────────┘                     └─────────────────────┘`,
  },
  importantTerms: [
    { term: "Global Network", definition: "The top-level container holding all core networks, attachments, and routing policies." },
    { term: "Core Network Edge (CNE)", definition: "Regional routing deployment points within the cloud provider's global backbone." },
    { term: "Network Policy", definition: "A single declarative policy document defining global routing segments, attachment rules, and peering." },
    { term: "Segment", definition: "A isolated global routing domain (e.g. Production, Development, Guest) enforced across all regions." },
    { term: "Attachment", definition: "A connection mapping VPCs, Site-to-Site VPNs, or Direct Connect links into a Cloud WAN segment." },
  ],
  sections: [
    {
      id: "why-cloud-wan-needed",
      title: "Why Cloud WAN is Needed",
      body: "As enterprise networks expand across multiple global cloud regions and international branch offices, stitching together individual regional Transit Gateways, BGP sessions, and VPN links creates unmanageable routing complexity. Cloud WAN provides a single, policy-driven global backbone.",
    },
    {
      id: "how-cloud-wan-works",
      title: "How Cloud WAN Works",
      body: "Cloud WAN operates through centralized policy-based automation:",
      bullets: [
        "1. Define Global Network: Create a unified global container spanning required cloud regions.",
        "2. Write Declarative Policy: Specify segments (e.g. Prod, Dev) and automated routing rules in a JSON/YAML policy file.",
        "3. Attach Infrastructure: Connect regional VPCs, SD-WAN appliances, and Direct Connect gateways via simple tags.",
        "4. Automated Global Routing: The Cloud WAN engine provisions regional Core Network Edges and propagates routes globally.",
      ],
    },
    {
      id: "cloud-wan-vs-transit-gateway",
      title: "Cloud WAN vs Regional Transit Gateway",
      body: "Understanding architectural scope differences:",
      bullets: [
        "Transit Gateway: Highly optimized for regional inter-VPC routing within a single cloud region.",
        "Cloud WAN: Designed for multi-region, global network orchestrations managed via a single central policy.",
      ],
    },
  ],
  advantages: [
    "Centralized global policy management — update global routing rules in a single file.",
    "Built-in global network segmentation across all connected regions.",
    "Automates complex multi-region peering and route distribution.",
    "Leverages cloud provider's high-speed private undersea and terrestrial fiber backbones.",
  ],
  disadvantages: [
    "Higher architectural complexity for small single-region deployments.",
    "Managed service pricing based on hourly Core Network Edge fees and data processing.",
  ],
  commonUseCases: [
    "Multinational enterprise connecting offices in North America, Europe, and Asia-Pacific to global cloud resources.",
    "Enforcing consistent global security segmentation between Production and Staging environments worldwide.",
  ],
  commonMistakes: [
    "Using Cloud WAN for simple single-region VPC setups where a basic Transit Gateway is more cost-effective.",
    "Not planning segment isolation early in the policy design, requiring global policy rewrites later.",
  ],
  comparison: {
    headers: ["Aspect", "Cloud WAN", "Traditional MPLS Mesh"],
    rows: [
      { label: "Management", classful: "Centralized cloud policy document (JSON/YAML)", cidr: "Distributed router-by-router CLI configuration" },
      { label: "Global Reach", classful: "Instant global footprint over cloud provider fiber", cidr: "Requires contracting multiple regional telecom carriers" },
      { label: "Provisioning Speed", classful: "Minutes via API / Cloud Console", cidr: "Months for carrier circuit installations" },
      { label: "Cloud Integration", classful: "Native integration with VPCs & Cloud Gateways", cidr: "Complex edge router hand-offs" },
    ],
  },
  beginnerSummary:
    "Cloud WAN is like a global superhighway for your company's network. Instead of setting up complicated connections between every office and cloud region, Cloud WAN gives you one global dashboard to control how traffic flows between all your offices and cloud servers worldwide.",
  relatedLinks: [
    { label: "Transit Gateway", href: "/learn/transit-gateway" },
    { label: "VPC", href: "/learn/vpc" },
    { label: "Direct Connect", href: "/learn/direct-connect" },
    { label: "SD-WAN", href: "/learn/sd-wan" },
  ],
};

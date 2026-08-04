import type { LearningTopic } from "@/data/learning-content";

export const transitGatewayTopic: LearningTopic = {
  id: "transit-gateway",
  title: "Transit Gateway",
  subtitle: "Centralized cloud routing hub interconnecting thousands of VPCs, VPNs, and on-premises networks",
  category: "routing",
  readTime: "8 min",
  summary:
    "A Transit Gateway (such as AWS Transit Gateway or Azure Virtual WAN Hub) acts as a high-performance cloud virtual router. It connects VPCs, corporate VPNs, and Direct Connect links in a hub-and-spoke topology, eliminating the need for complex full-mesh VPC peering.",
  keyTakeaways: [
    "Functions as a central Layer 3 cloud router hub.",
    "Replaces full-mesh VPC peering relationships (N*(N-1)/2 connections) with a single hub.",
    "Supports transitive routing between attached VPCs and on-premises networks.",
    "Allows multiple isolated route tables within the same gateway for network segmentation.",
    "Scales to handle thousands of attached VPCs and gigabits of bandwidth.",
  ],
  diagram: {
    title: "Transit Gateway Hub-and-Spoke Topology",
    textRepresentation: `Hub-and-Spoke Architecture:

[ VPC A (Production) ] ──┐                             ┌──► [ VPC B (Shared Services) ]
                         │                             │
[ VPC C (Development) ] ─┼──► [ TRANSIT GATEWAY ] ─────┼──► [ On-Premise Data Center ]
                         │       (Central Hub)         │    (via Direct Connect / VPN)
[ VPC D (Security DMZ) ] ┘                             └──► [ Internet Egress VPC ]`,
  },
  importantTerms: [
    { term: "Attachment", definition: "A connection binding a VPC, IPsec VPN, or Direct Connect Gateway to the Transit Gateway hub." },
    { term: "Transit Gateway Route Table", definition: "Custom routing tables inside the Transit Gateway used to direct or restrict traffic between attachments." },
    { term: "Transitive Routing", definition: "The ability for traffic to pass through the hub from Network A to Network B (unlike standard VPC Peering)." },
    { term: "Association", definition: "Mapping a specific attachment to an active Transit Gateway route table." },
    { term: "Propagation", definition: "Automatically learning and installing routes from attached VPCs or BGP VPNs into a Transit Gateway route table." },
  ],
  sections: [
    {
      id: "why-transit-gateway-needed",
      title: "Why Transit Gateways Are Needed",
      body: "Standard VPC Peering connections do not support transitive routing (if VPC A peers with B, and B peers with C, A cannot talk to C through B). Connecting 50 VPCs requires 1,225 individual peering connections! Transit Gateway acts as a central router, scaling linearly.",
    },
    {
      id: "how-transit-gateway-works",
      title: "How Transit Gateway Operates",
      body: "A Transit Gateway functions as a cloud virtual router:",
      bullets: [
        "1. Create Attachments: Connect VPCs by creating Elastic Network Interfaces (ENIs) in target subnets.",
        "2. Configure Route Tables: Create separate route tables (e.g. Prod Table, Dev Table, Shared Services Table).",
        "3. Route Evaluation: When a packet arrives from VPC A, the gateway inspects its route table and forwards the packet to the destination attachment.",
        "4. Isolation & Inspection: Route tables can route all outbound web traffic through an Inspection VPC containing firewalls.",
      ],
    },
    {
      id: "centralized-egress-inspection",
      title: "Centralized Internet Egress & Security Inspection",
      body: "Instead of putting NAT Gateways and Firewalls in every single VPC, enterprises use Transit Gateway to route all internet-bound traffic through a single centralized Inspection VPC, reducing cloud infrastructure costs dramatically.",
    },
  ],
  advantages: [
    "Drastically simplifies cloud network architecture — 1 attachment per VPC.",
    "Supports transitive routing across VPCs, VPNs, and Direct Connect.",
    "Enables flexible network segmentation using multiple route tables.",
    "Centralizes security firewall inspection and internet egress traffic.",
  ],
  disadvantages: [
    "Hourly attachment charges and per-gigabyte data processing fees.",
    "Bandwidth limits per VPC attachment (typically 50 Gbps burst per AZ).",
  ],
  commonUseCases: [
    "Connecting hundreds of AWS/Azure VPCs to a central shared services or database VPC.",
    "Routing all multi-VPC internet traffic through a centralized firewall appliance.",
  ],
  commonMistakes: [
    "Forgetting to add return routes in the VPC subnet route tables pointing back to the Transit Gateway.",
    "Mixing Production and Development VPCs in the same Transit Gateway route table without segmentation rules.",
  ],
  comparison: {
    headers: ["Aspect", "Transit Gateway", "VPC Peering"],
    rows: [
      { label: "Topology", classful: "Centralized Hub-and-Spoke", cidr: "Point-to-Point Mesh" },
      { label: "Transitive Routing", classful: "Supported (A -> TGW -> B -> TGW -> C)", cidr: "Not Supported (A cannot reach C through B)" },
      { label: "Connection Complexity", classful: "1 connection per VPC (Linear: N)", cidr: "Exponential growth (N * (N-1) / 2)" },
      { label: "Data Transfer Cost", classful: "Attachment fee + Data processing fee", cidr: "No attachment fee (Standard inter-region rates)" },
    ],
  },
  beginnerSummary:
    "A Transit Gateway is like a central train station for your cloud network. Instead of building individual tracks between every single cloud server group, every server connects to the central Transit Gateway hub, which routes traffic wherever it needs to go.",
  relatedLinks: [
    { label: "VPC", href: "/learn/vpc" },
    { label: "Direct Connect", href: "/learn/direct-connect" },
    { label: "Cloud WAN", href: "/learn/cloud-wan" },
    { label: "Router", href: "/learn/router" },
  ],
};

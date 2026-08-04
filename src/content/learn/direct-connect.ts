import type { LearningTopic } from "@/data/learning-content";

export const directConnectTopic: LearningTopic = {
  id: "direct-connect",
  title: "Direct Connect",
  subtitle: "Dedicated private fiber link bypassing the public Internet between on-premise data centers and cloud VPCs",
  category: "routing",
  readTime: "8 min",
  summary:
    "Direct Connect (such as AWS Direct Connect, Azure ExpressRoute, or Google Cloud Dedicated Interconnect) is a network service that establishes a dedicated private physical fiber link between an enterprise data center or co-location facility and a cloud provider's network.",
  keyTakeaways: [
    "Bypasses the public Internet entirely via dedicated physical fiber connections.",
    "Provides predictable latency, higher throughput (1 Gbps, 10 Gbps, 100 Gbps+), and lower data egress costs.",
    "Uses BGP (Border Gateway Protocol) to dynamically exchange routes between on-premise routers and cloud VPC gateways.",
    "Supports Virtual Interfaces (VIFs) for Private, Public, and Transit connectivity.",
    "Can be combined with IPsec VPN for hardware-encrypted dedicated transport.",
  ],
  diagram: {
    title: "Direct Connect Dedicated Link Architecture",
    textRepresentation: `On-Premise Data Center               Co-Location Location               Cloud Provider VPC
┌────────────────────────┐           ┌──────────────────┐           ┌─────────────────────┐
│ Customer Router        │           │ Cross-Connect    │           │ Direct Connect      │
│ (10.0.0.0/16)          │ ──Fiber──►│ Fiber Patch      │ ──Fiber──►│ Gateway (802.1Q)    │
│                        │           │ (Partner Carrier)│           │  └─► VPC 10.1.0.0/16│
└────────────────────────┘           └──────────────────┘           └─────────────────────┘
                 ◄══════════ BGP Session (AS Peering) ══════════►`,
  },
  importantTerms: [
    { term: "Cross-Connect", definition: "A physical fiber patch cable connecting a customer's router to a cloud provider port inside a co-location facility." },
    { term: "Private VIF (Virtual Interface)", definition: "A VLAN interface connecting on-premise routers directly to private VPC IP subnets." },
    { term: "Public VIF", definition: "A VLAN interface accessing public cloud services (S3, DynamoDB) over private fiber without traversing public ISPs." },
    { term: "Transit VIF", definition: "A VLAN interface connecting to a Transit Gateway to reach hundreds of interconnected VPCs." },
    { term: "802.1Q Trunking", definition: "VLAN tagging standard used to multiplex multiple virtual interfaces across a single physical fiber pair." },
  ],
  sections: [
    {
      id: "why-direct-connect-needed",
      title: "Why Direct Connect is Needed",
      body: "Connecting enterprise data centers to cloud VPCs over the public Internet using IPsec VPNs introduces variable latency, packet jitter, bandwidth bottlenecks, and high ISP egress data charges. Direct Connect provides a consistent, dedicated, high-speed physical pipe.",
    },
    {
      id: "how-direct-connect-works",
      title: "How Direct Connect Works",
      body: "Direct Connect establishes Layer 1 physical and Layer 3 routing connections:",
      bullets: [
        "1. Physical Port Allocation: Customer requests a dedicated port (1G, 10G, 100G) at a Direct Connect location.",
        "2. Fiber Cross-Connect: A physical fiber cable links the customer router to the cloud provider's router port.",
        "3. 802.1Q VLAN Tagging: 802.1Q VLAN tags separate Private VIF, Public VIF, and Transit VIF traffic.",
        "4. BGP Peering: On-premise routers establish eBGP sessions with the Direct Connect Gateway to dynamically exchange routes.",
      ],
    },
    {
      id: "redundancy-best-practices",
      title: "High Availability & Redundancy Design",
      body: "Because physical fiber cables can be damaged by construction accidents, enterprise production architectures require redundancy:",
      bullets: [
        "Dual Direct Connect Links: Terminated at separate co-location facilities and distinct cloud routers.",
        "VPN Backup: Configuring an IPsec VPN backup route over the Internet using floating BGP metrics.",
      ],
    },
  ],
  advantages: [
    "Consistent, ultra-low latency and deterministic network performance.",
    "Massive throughput options (1 Gbps to 100 Gbps+).",
    "Significantly reduced cloud data transfer egress fees compared to Internet routing.",
    "Enhances security by avoiding public Internet routing.",
  ],
  disadvantages: [
    "High initial setup cost and longer provisioning lead time (weeks for physical cross-connects).",
    "Physical links require redundant secondary connections to prevent physical fiber cuts from causing outages.",
  ],
  commonUseCases: [
    "Hybrid cloud enterprise architectures transferring terabytes of database backups daily.",
    "Real-time financial trading platforms and video rendering pipelines requiring guaranteed latency.",
  ],
  commonMistakes: [
    "Assuming Direct Connect automatically encrypts data — Direct Connect provides private physical transport; encryption requires layering MACsec or IPsec VPN over the link.",
    "Deploying a single Direct Connect link without a secondary connection for production environments.",
  ],
  comparison: {
    headers: ["Aspect", "Direct Connect", "IPsec VPN over Internet"],
    rows: [
      { label: "Transport Medium", classful: "Dedicated private physical fiber cable", cidr: "Public Internet (Shared ISP links)" },
      { label: "Latency & Throughput", classful: "Deterministic ultra-low latency (Up to 100 Gbps)", cidr: "Variable latency & bandwidth jitter (Typically < 1 Gbps)" },
      { label: "Data Egress Cost", classful: "Discounted private egress rate", cidr: "Standard Internet data egress rate" },
      { label: "Provisioning Time", classful: "Days to weeks (Physical cabling)", cidr: "Minutes (Software configuration)" },
    ],
  },
  beginnerSummary:
    "Direct Connect is a dedicated private fiber optic cable plugged directly between your company's physical data center and a cloud provider like AWS. Instead of sending files over the public Internet, data travels across a private, super-fast, highway.",
  relatedLinks: [
    { label: "VPC", href: "/learn/vpc" },
    { label: "BGP", href: "/learn/bgp" },
    { label: "Transit Gateway", href: "/learn/transit-gateway" },
    { label: "VPN", href: "/learn/vpn" },
  ],
};

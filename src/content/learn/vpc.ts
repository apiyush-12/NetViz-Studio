import type { LearningTopic } from "@/data/learning-content";

export const vpcTopic: LearningTopic = {
  id: "vpc",
  title: "VPC",
  subtitle: "Virtual Private Cloud — Logically isolated virtual network within a public cloud provider environment",
  category: "security",
  readTime: "8 min",
  summary:
    "A Virtual Private Cloud (VPC) is a logically isolated section of a public cloud provider's infrastructure (such as AWS, Google Cloud, or Azure VNet). It provides network administrators with total control over virtual IP addressing, subnets, route tables, network gateways, and security firewalls.",
  keyTakeaways: [
    "Logically isolates cloud resources in a private virtual network boundary.",
    "Administrator defines private IPv4/IPv6 CIDR address blocks (e.g. 10.0.0.0/16).",
    "Divided into Public Subnets (Internet Gateway attached) and Private Subnets (NAT Gateway attached).",
    "Security Groups act as stateful instance firewalls; NACLs act as stateless subnet firewalls.",
    "Interconnects with on-premise networks via VPN or dedicated direct fiber links.",
  ],
  diagram: {
    title: "VPC Subnet & Gateway Architecture",
    textRepresentation: `VPC Boundary (CIDR: 10.0.0.0/16)
┌─────────────────────────────────────────────────────────────────────────┐
│ Internet Gateway (IGW) ──► Public Internet                              │
│         │                                                               │
│         ▼                                                               │
│ Public Subnet (10.0.1.0/24)  ──► NAT Gateway                            │
│  └─► Web Server (Public IP)            │                                │
│                                        ▼                                │
│ Private Subnet (10.0.2.0/24) ◄─────────┘ (Outbound Only)                │
│  └─► Database Server (Private IP Only)                                  │
└─────────────────────────────────────────────────────────────────────────┘`,
  },
  importantTerms: [
    { term: "Public Subnet", definition: "A VPC subnet associated with a route table entry pointing to an Internet Gateway." },
    { term: "Private Subnet", definition: "A VPC subnet with no direct route to the Internet, isolating internal databases or backends." },
    { term: "Internet Gateway (IGW)", definition: "A VPC component allowing bidirectional communication between instances in public subnets and the Internet." },
    { term: "NAT Gateway", definition: "A managed service in public subnets allowing private subnet instances to access the Internet for updates while blocking incoming connections." },
    { term: "Security Group", definition: "A stateful virtual firewall controlling inbound and outbound traffic at the individual cloud instance/ENI level." },
    { term: "NACL (Network ACL)", definition: "A stateless subnet-level firewall evaluating rule numbers in sequential top-down order." },
  ],
  sections: [
    {
      id: "why-vpc-needed",
      title: "Why VPC is Needed",
      body: "Public cloud providers run millions of servers in shared physical data centers. Without a VPC, virtual machines would share a flat unsegmented network. A VPC provides dedicated private IP space, security isolation, and granular firewall boundaries.",
    },
    {
      id: "how-vpc-works",
      title: "How VPC Routing and Security Work",
      body: "VPC architecture relies on layered networking controls:",
      bullets: [
        "1. CIDR Assignment: Define a primary IP range (e.g. 10.0.0.0/16).",
        "2. Subnet Creation: Partition the VPC into Availability Zone subnets (e.g. 10.0.1.0/24).",
        "3. Route Table Rules: Associate custom route tables with subnets to direct traffic to Internet Gateways, NAT Gateways, or Transit Gateways.",
        "4. Dual Firewall Protection: Combine stateless Network ACLs at the subnet boundary with stateful Security Groups at the virtual machine interface.",
      ],
    },
    {
      id: "vpc-peering-vs-vpn",
      title: "Connecting VPCs",
      body: "Organizations connect multiple VPCs using two primary methods:",
      bullets: [
        "VPC Peering: Direct 1-to-1 private network connection between two VPCs using cloud backbone routing.",
        "Transit Gateway: Centralized hub-and-spoke router connecting hundreds of VPCs and corporate on-premise networks.",
      ],
    },
  ],
  advantages: [
    "High security with multi-layer firewall defense (Security Groups + NACLs).",
    "Complete control over virtual network topology, subnets, and IP ranges.",
    "Seamless elastic scaling across multiple cloud data center Availability Zones.",
  ],
  disadvantages: [
    "Requires careful initial CIDR planning to avoid IP overlaps with corporate on-premise networks.",
    "Data transfer costs across Availability Zones and Transit Gateways can accumulate.",
  ],
  commonUseCases: [
    "Hosting multi-tier enterprise web applications (Web Tier in Public Subnet, Database Tier in Private Subnet).",
    "Isolating Development, Staging, and Production environments in cloud infrastructure.",
  ],
  commonMistakes: [
    "Assigning overlapping CIDR blocks (e.g. 192.168.1.0/24) to both VPC and on-premise networks — prevents VPN/DirectConnect routing.",
    "Confusing Security Groups (stateful, attached to instance ENIs) with NACLs (stateless, attached to subnets).",
  ],
  comparison: {
    headers: ["Aspect", "Public Subnet", "Private Subnet"],
    rows: [
      { label: "Internet Access", classful: "Direct bidirectional via Internet Gateway", cidr: "Outbound-only via NAT Gateway (No inbound access)" },
      { label: "IP Addressing", classful: "Instances assigned Public + Private IPs", cidr: "Instances assigned Private IPs only" },
      { label: "Target Resources", classful: "Web Servers, Load Balancers, Bastion Hosts", cidr: "Databases, Microservice Backends, Internal APIs" },
    ],
  },
  beginnerSummary:
    "A VPC is your own private digital playground inside a public cloud like AWS or Google Cloud. It lets you create subnets, assign IP addresses, set up firewalls, and launch web servers safely isolated from other cloud customers.",
  relatedLinks: [
    { label: "Subnet", href: "/learn/subnet" },
    { label: "Firewall", href: "/learn/firewall" },
    { label: "Transit Gateway", href: "/learn/transit-gateway" },
    { label: "Direct Connect", href: "/learn/direct-connect" },
  ],
};

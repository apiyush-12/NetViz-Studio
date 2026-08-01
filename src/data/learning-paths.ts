export interface LearningPath {
  id: string;
  title: string;
  description: string;
  skillLevel: "Beginner" | "Intermediate" | "Advanced";
  estimatedHours: number;
  labIds: string[];
  iconName: string;
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "foundations",
    title: "1. Networking Foundations",
    description: "Master the essential principles of host communication, subnets, and local Ethernet delivery.",
    skillLevel: "Beginner",
    estimatedHours: 2,
    labIds: ["local-network-communication", "fix-wrong-subnet", "communicating-across-networks"],
    iconName: "Network",
  },
  {
    id: "ipv4-subnetting",
    title: "2. IPv4 and Subnetting",
    description: "Learn binary subnetting, CIDR notation, host ranges, and VLSM network design.",
    skillLevel: "Beginner",
    estimatedHours: 3,
    labIds: ["cidr-fundamentals", "split-24-into-4-subnets"],
    iconName: "Calculator",
  },
  {
    id: "switching-arp",
    title: "3. Ethernet, Switching, and ARP",
    description: "Understand Layer 2 switch MAC learning, ARP resolution, and VLAN network segmentation.",
    skillLevel: "Intermediate",
    estimatedHours: 3,
    labIds: ["local-network-communication", "vlan-segmentation"],
    iconName: "Layers",
  },
  {
    id: "tcp-udp",
    title: "4. TCP and UDP Transport",
    description: "Explore TCP 3-way handshakes, sequence numbers, packet loss retransmission, and UDP speed.",
    skillLevel: "Beginner",
    estimatedHours: 2.5,
    labIds: ["tcp-three-way-handshake", "tcp-packet-loss-retransmission", "tcp-versus-udp"],
    iconName: "ArrowRightLeft",
  },
  {
    id: "network-services",
    title: "5. Network Services (DHCP, DNS, HTTP)",
    description: "Configure dynamic IP address allocation (DORA), DNS hostname resolution, and HTTP web servers.",
    skillLevel: "Beginner",
    estimatedHours: 3,
    labIds: ["dhcp-address-assignment", "dns-resolution"],
    iconName: "ServerCog",
  },
  {
    id: "routing",
    title: "6. Static and Dynamic Routing",
    description: "Build routing tables, understand Longest Prefix Match (LPM), and troubleshoot return paths.",
    skillLevel: "Intermediate",
    estimatedHours: 3.5,
    labIds: ["static-routing", "troubleshoot-missing-return-route"],
    iconName: "GitBranch",
  },
  {
    id: "ospf-engineering",
    title: "7. OSPF Routing Engineering",
    description: "Master OSPF link-state routing, Hello adjacencies, Dijkstra SPF calculation, and cost pathing.",
    skillLevel: "Intermediate",
    estimatedHours: 4,
    labIds: ["ospf-neighbor-formation", "ospf-cost-path-selection"],
    iconName: "Radio",
  },
  {
    id: "bgp-fundamentals",
    title: "8. BGP Inter-Domain Routing",
    description: "Explore Autonomous System peering, eBGP route updates, AS-Path prepending, and LocalPref.",
    skillLevel: "Advanced",
    estimatedHours: 4.5,
    labIds: ["bgp-route-advertisement", "bgp-best-path-challenge"],
    iconName: "Boxes",
  },
  {
    id: "troubleshooting",
    title: "9. Network Troubleshooting Mastery",
    description: "Diagnose and repair misconfigured IP subnets, missing routes, firewall blocks, and NAT issues.",
    skillLevel: "Intermediate",
    estimatedHours: 4,
    labIds: ["fix-wrong-subnet", "troubleshoot-missing-return-route", "firewall-rule-troubleshooting"],
    iconName: "ShieldAlert",
  },
  {
    id: "design-challenge",
    title: "10. Comprehensive Network Design Challenge",
    description: "Prove your overall networking expertise by solving a multi-fault enterprise topology lab.",
    skillLevel: "Advanced",
    estimatedHours: 5,
    labIds: ["complete-network-troubleshooting-challenge"],
    iconName: "Award",
  },
];

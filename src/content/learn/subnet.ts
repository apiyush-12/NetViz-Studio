import type { LearningTopic } from "@/data/learning-content";

export const subnetTopic: LearningTopic = {
  id: "subnet",
  title: "Subnet",
  subtitle: "Logical subdivision of an IP network to control broadcast domains and organize hosts",
  category: "addressing",
  readTime: "8 min",
  summary:
    "A subnet (subnetwork) is a logical subdivision of an IP network. Dividing a large IP address block into smaller subnets improves network security, minimizes broadcast traffic noise, and optimizes address space management.",
  keyTakeaways: [
    "A subnet mask defines the boundary between the Network Portion and Host Portion of an IP address.",
    "Prefix notation (e.g. /24) indicates the number of binary 1 bits in the subnet mask.",
    "Every subnet has three distinct addresses: Network Address (first IP), Usable Host Range, and Broadcast Address (last IP).",
    "Devices on the same subnet communicate directly via Layer 2 switches.",
    "Devices on different subnets MUST communicate through a Layer 3 router or default gateway.",
  ],
  diagram: {
    title: "192.168.1.0/24 Subnet Division Example",
    textRepresentation: `Subnet: 192.168.1.0/24  (Subnet Mask: 255.255.255.0)

+---------------------+---------------------------------+
| Network Address     | 192.168.1.0    (Cannot assign)  |
| Usable Host Range   | 192.168.1.1  to  192.168.1.254 |
| Broadcast Address   | 192.168.1.255  (Cannot assign)  |
+---------------------+---------------------------------+

Communication Boundary:
[PC-A: 192.168.1.10/24] ──(Direct Layer 2 Switch)──► [PC-B: 192.168.1.20/24]  (Same Subnet)
[PC-A: 192.168.1.10/24] ──(Requires Router Gateway)──► [PC-C: 10.0.0.5/24]     (Different Subnet)`,
  },
  importantTerms: [
    { term: "Network Address", definition: "The very first IP address of a subnet (all host bits 0), representing the entire subnet ID." },
    { term: "Broadcast Address", definition: "The very last IP address of a subnet (all host bits 1), used to send messages to all hosts on the subnet." },
    { term: "Usable Host Range", definition: "All IP addresses between the Network Address and Broadcast Address assigned to active devices." },
    { term: "Prefix Length", definition: "The slash notation number (/24) representing how many bits belong to the network ID." },
    { term: "CIDR", definition: "Classless Inter-Domain Routing method allowing arbitrary subnet boundary lengths." },
  ],
  sections: [
    {
      id: "why-subnets-needed",
      title: "Why Networks Are Subnetted",
      body: "If thousands of devices were placed in a single flat network, Ethernet broadcast frames (like ARP requests) would saturate the physical media and overwhelm host CPU processors. Subnetting restricts broadcast domains to manageable groups.",
    },
    {
      id: "same-vs-different-subnet",
      title: "Same-Subnet vs Cross-Subnet Communication",
      body: "Before sending a packet, a source host performs a binary AND operation on its own IP and the target IP against its subnet mask:",
      bullets: [
        "Same Subnet: The destination IP matches the local network ID. The host sends an ARP request and delivers the frame directly via a local switch.",
        "Different Subnet: The destination IP belongs to another network ID. The host forwards the packet to its Default Gateway router.",
      ],
    },
    {
      id: "subnet-anatomy",
      title: "Subnet Math & Usable Hosts Formula",
      body: "For any prefix length /N, the number of total IPs is 2^(32 - N). The number of usable host addresses is 2^(32 - N) - 2 (subtracting Network and Broadcast IPs):",
      bullets: [
        "/24 (Mask 255.255.255.0): 256 total IPs - 2 = 254 usable hosts.",
        "/26 (Mask 255.255.255.192): 64 total IPs - 2 = 62 usable hosts.",
        "/30 (Mask 255.255.255.252): 4 total IPs - 2 = 2 usable hosts (ideal for point-to-point router links).",
      ],
    },
  ],
  advantages: [
    "Reduces network congestion by containing broadcast traffic.",
    "Enhances security by allowing firewall rules between subnets.",
    "Simplifies IP address organization and troubleshooting.",
  ],
  disadvantages: [
    "Wastes 2 IP addresses per subnet (Network ID & Broadcast ID).",
    "Requires routers or Layer 3 switches to communicate between subnets.",
  ],
  commonUseCases: [
    "Separating Corporate Workstations, Guest Wi-Fi, and Server Infrastructure onto different subnets.",
    "Isolating VoIP IP phone traffic from general data networks.",
  ],
  commonMistakes: [
    "Trying to assign the Network Address (e.g. .0) or Broadcast Address (e.g. .255) to a host card — OS software will reject these.",
    "Confusing a Subnet (the network boundary) with Subnetting (the mathematical practice of dividing a network block).",
    "Assigning hosts the same IP range but different subnet masks — breaks local traffic communication.",
  ],
  comparison: {
    headers: ["Aspect", "Single Flat Network", "Subnetted Network"],
    rows: [
      { label: "Broadcast Domain", classful: "One large domain (high broadcast noise)", cidr: "Multiple smaller isolated broadcast domains" },
      { label: "Security Boundary", classful: "None (all hosts can reach each other directly)", cidr: "High (Routers & Firewalls control subnets)" },
      { label: "Troubleshooting", classful: "Difficult to isolate packet storms", cidr: "Easy to pinpoint faulty subnet segments" },
    ],
  },
  beginnerSummary:
    "A subnet is a smaller sub-section of an IP network. Just as a city is divided into neighborhoods to manage traffic and mail delivery, networks are divided into subnets to reduce broadcast noise and secure communication.",
  relatedLinks: [
    { label: "IP Address", href: "/learn/ip-address" },
    { label: "CIDR vs Classful", href: "/learn/cidr-vs-classful" },
    { label: "Router", href: "/learn/router" },
    { label: "Default Gateway", href: "/learn/default-gateway" },
  ],
};

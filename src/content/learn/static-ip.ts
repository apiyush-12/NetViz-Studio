import type { LearningTopic } from "@/data/learning-content";

export const staticIpTopic: LearningTopic = {
  id: "static-ip",
  title: "Static IP",
  subtitle: "Manually configured permanent IP address configuration for dedicated network servers and infrastructure",
  category: "addressing",
  readTime: "6 min",
  summary:
    "A static IP address is a fixed, permanent IP address assigned manually to a device by a network administrator rather than assigned dynamically by a DHCP server. It remains constant across reboots and lease expirations.",
  keyTakeaways: [
    "Configured manually on the operating system or network interface parameters.",
    "Requires entering 4 mandatory network parameters: IP Address, Subnet Mask, Default Gateway, and DNS Server.",
    "Does not change or expire automatically over time.",
    "Essential for servers, printers, router interfaces, and infrastructure requiring reliable incoming connections.",
    "Improper static IP assignment can cause IP address conflict errors or loss of Internet access.",
  ],
  diagram: {
    title: "Static IP Interface Configuration Fields Example",
    textRepresentation: `Sample Operating System Manual Configuration:

IPv4 Address:      192.168.1.10
Subnet Mask:       255.255.255.0  (or /24 prefix)
Default Gateway:   192.168.1.1
Preferred DNS:     8.8.8.8
Alternate DNS:     1.1.1.1`,
  },
  importantTerms: [
    { term: "Manual Configuration", definition: "Directly keying network settings into OS adapter properties or configuration files." },
    { term: "Address Conflict", definition: "A network error occurring when two devices on the same subnet are assigned the exact same IP address." },
    { term: "Subnet Mask", definition: "A 32-bit mask separating the network portion from the host portion of an IP address." },
    { term: "Default Gateway", definition: "The local router interface IP address used to send traffic outside the local subnet." },
    { term: "DNS Server", definition: "The IP address of a name server used to resolve domain names to IP addresses." },
  ],
  sections: [
    {
      id: "why-static-ip-needed",
      title: "Why Static IP Addresses Are Needed",
      body: "If a web server, database server, network printer, or security camera changed its IP address every time it rebooted, clients and automated scripts trying to connect to it would fail. Static IPs guarantee constant reachability.",
    },
    {
      id: "required-fields",
      title: "Required Fields for Manual Configuration",
      body: "When configuring a static IP, the administrator must accurately specify four essential settings:",
      bullets: [
        "1. IP Address: The unique host address on the local subnet (e.g. 192.168.1.10).",
        "2. Subnet Mask: Specifies the boundary of the local network (e.g. 255.255.255.0).",
        "3. Default Gateway: The router interface IP address on the local subnet (e.g. 192.168.1.1).",
        "4. DNS Server: Resolves hostnames like google.com to IP addresses (e.g. 8.8.8.8).",
      ],
    },
    {
      id: "common-configuration-errors",
      title: "Common Configuration Pitfalls",
      body: "Setting up a static IP manually introduces potential human error:",
      bullets: [
        "Incorrect Default Gateway: Host can talk locally to other PCs on the subnet, but cannot reach the Internet.",
        "Incorrect Subnet Mask: Host miscalculates local vs remote destinations, dropping outbound packets.",
        "Duplicate IP Conflict: Assigning an IP already held by another device disrupts connectivity for both hosts.",
      ],
    },
  ],
  advantages: [
    "Permanent and predictable address for hosting web, DNS, database, or file services.",
    "No reliance on a DHCP server being online during network boot up.",
    "Easier firewall rule management based on static IP filters.",
  ],
  disadvantages: [
    "Higher administrative overhead to manually manage and track IP assignments.",
    "Risk of human error causing duplicate IP address conflicts.",
    "Requires updating configuration manually if network subnets change.",
  ],
  commonUseCases: [
    "Web servers, email servers, and database servers hosted on-premise or in the cloud.",
    "Router interface IPs and core network switch management interfaces.",
    "Shared office network printers and security surveillance cameras.",
  ],
  commonMistakes: [
    "Assigning a static IP inside the active DHCP dynamic pool range without excluding it — causes IP address conflicts when DHCP hands out the same IP.",
    "Entering a Default Gateway address that is outside the local subnet range — renders the gateway unreachable.",
  ],
  comparison: {
    headers: ["Aspect", "Static IP", "Dynamic IP (DHCP)"],
    rows: [
      { label: "Assignment Method", classful: "Manually entered by administrator", cidr: "Automatically assigned by DHCP server" },
      { label: "Permanence", classful: "Fixed / Permanent across reboots", cidr: "Temporary / Leased for a defined duration" },
      { label: "Admin Overhead", classful: "High (requires manual tracking)", cidr: "Zero for end-users (automated)" },
      { label: "Best For", classful: "Servers, Printers, Routers", cidr: "Laptops, Smartphones, Workstations" },
    ],
  },
  beginnerSummary:
    "A static IP is an IP address manually typed into a computer's settings that never changes. It is used for servers and printers so that other devices always know exactly where to find them.",
  relatedLinks: [
    { label: "IP Address", href: "/learn/ip-address" },
    { label: "DHCP", href: "/learn/dhcp" },
    { label: "Default Gateway", href: "/learn/default-gateway" },
  ],
};

import type { LearningTopic } from "@/data/learning-content";

export const ipAddressTopic: LearningTopic = {
  id: "ip-address",
  title: "IP Address",
  subtitle: "32-bit (IPv4) or 128-bit (IPv6) logical network layer address for host identification and routing",
  category: "addressing",
  readTime: "8 min",
  summary:
    "An IP address (Internet Protocol address) is a unique logical address assigned to devices on a computer network. Operating at Layer 3 (Network Layer), IP addresses enable packets to be routed across connected networks from source to destination.",
  keyTakeaways: [
    "IP addresses operate at Layer 3 (Network Layer) of the OSI model.",
    "IPv4 addresses are 32-bit numbers written in dotted-decimal format (e.g. 192.168.1.10).",
    "IPv6 addresses are 128-bit numbers written in hexadecimal format (e.g. 2001:db8::10).",
    "An IP address consists of two parts: a Network Portion and a Host Portion.",
    "Modern networking uses Classless Inter-Domain Routing (CIDR) slash notation (e.g. /24) rather than legacy classful rules.",
  ],
  diagram: {
    title: "IPv4 & IPv6 Address Format Comparison",
    textRepresentation: `IPv4 Address (32-Bit Dotted Decimal):
   192   .   168   .    1    .   10
[ Network Portion (24 Bits) ][ Host ID ]
Prefix Notation: 192.168.1.10/24

IPv6 Address (128-Bit Hexadecimal):
2001 : 0db8 : 0000 : 0000 : 0000 : 0000 : 0000 : 0010
Shortened: 2001:db8::10`,
  },
  importantTerms: [
    { term: "IPv4", definition: "32-bit address standard yielding ~4.3 billion total global addresses." },
    { term: "IPv6", definition: "128-bit address standard designed to replace IPv4 with virtually unlimited address space." },
    { term: "Public IP Address", definition: "Globally unique IP address routable across the public Internet assigned by an ISP." },
    { term: "Private IP Address", definition: "RFC 1918 address reserved for internal local networks (e.g. 192.168.x.x, 10.x.x.x, 172.16.x.x)." },
    { term: "Loopback Address", definition: "Special internal address (127.0.0.1 for IPv4, ::1 for IPv6) used by a host to test its own TCP/IP stack." },
    { term: "Link-Local Address", definition: "Auto-configured address (169.254.x.x for IPv4 APIPA, fe80:: for IPv6) used for local link communication when DHCP is unavailable." },
  ],
  sections: [
    {
      id: "why-ip-needed",
      title: "Why Devices Need IP Addresses",
      body: "While MAC addresses identify individual physical network cards on a single cable or Wi-Fi link, IP addresses provide a hierarchical logical structure. Routers use the network portion of an IP address to route traffic across the global Internet.",
    },
    {
      id: "how-ip-works",
      title: "Network Portion vs Host Portion",
      body: "Every IP address is divided into two distinct components by a Subnet Mask or Prefix Length (/N):",
      bullets: [
        "Network Portion: Identifies the specific network segment where the device belongs (like a postal Zip code).",
        "Host Portion: Identifies the specific individual device on that network segment (like a street house number).",
      ],
    },
    {
      id: "public-vs-private-ip",
      title: "Public vs Private IP Addresses",
      body: "To prevent IPv4 address exhaustion, RFC 1918 defined three private address blocks:",
      bullets: [
        "10.0.0.0 to 10.255.255.255 (/8 prefix) — Used in large enterprise networks.",
        "172.16.0.0 to 172.31.255.255 (/12 prefix) — Used in medium-to-large business networks.",
        "192.168.0.0 to 192.168.255.255 (/16 prefix) — Standard for residential home routers.",
      ],
    },
    {
      id: "cidr-vs-classful-note",
      title: "Modern CIDR vs Legacy Classful Addressing",
      body: "Early networking used rigid Class A, B, and C rules based on the first octet. Modern networking abandoned classful addressing in 1993 in favor of CIDR (Classless Inter-Domain Routing), where any prefix length from /0 to /32 can be defined dynamically using subnet masks.",
    },
  ],
  advantages: [
    "Hierarchical addressing allows efficient global route aggregation.",
    "Decouples software applications from physical hardware replacement.",
    "Supports both dynamic autoconfiguration (DHCP) and static manual assignment.",
  ],
  disadvantages: [
    "IPv4 address space is completely exhausted globally, requiring NAT workarounds.",
    "Requires proper subnetting configuration to prevent routing failures.",
  ],
  commonUseCases: [
    "Addressing web servers, laptops, smartphones, and routers on local and wide networks.",
    "Routing web traffic, emails, and video streams across international ISP backbones.",
  ],
  commonMistakes: [
    "Teaching or assuming Classful Class A/B/C rules are still used for modern subnetting — CIDR replaced classful addressing over 30 years ago.",
    "Confusing private IP addresses with public IP addresses — private addresses cannot be routed directly over the public Internet without NAT.",
    "Confusing IP addresses with MAC addresses.",
  ],
  comparison: {
    headers: ["Aspect", "IPv4", "IPv6"],
    rows: [
      { label: "Address Length", classful: "32 bits (4 bytes)", cidr: "128 bits (16 bytes)" },
      { label: "Notation Format", classful: "Dotted-decimal (e.g. 192.168.1.1)", cidr: "Hexadecimal colon-separated (e.g. 2001:db8::1)" },
      { label: "Total Address Space", classful: "~4.3 billion addresses", cidr: "~3.4 × 10^38 addresses (virtually infinite)" },
      { label: "Configuration", classful: "DHCP or Manual", cidr: "SLAAC (Stateless Auto) or DHCPv6" },
      { label: "IPSec Support", classful: "Optional add-on", cidr: "Built into core standard" },
    ],
  },
  beginnerSummary:
    "An IP address is your computer's logical mailing address on a network. While a MAC address identifies your physical hardware, an IP address tells routers which network you are on and how to deliver Internet traffic back to you.",
  relatedLinks: [
    { label: "Static IP", href: "/learn/static-ip" },
    { label: "DHCP", href: "/learn/dhcp" },
    { label: "Subnet", href: "/learn/subnet" },
    { label: "Default Gateway", href: "/learn/default-gateway" },
  ],
};

import type { LearningTopic } from "@/data/learning-content";

export const dnsTopic: LearningTopic = {
  id: "dns",
  title: "DNS",
  subtitle: "Domain Name System — Hierarchical distributed database mapping human-readable domain names to IP addresses (UDP/TCP 53)",
  category: "services",
  readTime: "8 min",
  summary:
    "DNS (Domain Name System, RFC 1034 / RFC 1035) is the hierarchical distributed database of the Internet. It translates human-friendly domain names (like example.com) into numerical IP addresses (like 93.184.216.34) required for IP packet routing.",
  keyTakeaways: [
    "Operates at Layer 7 (Application Layer) over UDP port 53 for queries and TCP port 53 for zone transfers.",
    "Uses a hierarchical tree structure: Root (.), Top-Level Domain (.com), and Authoritative Name Servers.",
    "Recursive Resolvers cache queries to accelerate lookups and reduce global DNS load.",
    "Stores resource records: A (IPv4), AAAA (IPv6), CNAME (Alias), MX (Mail), NS (Nameserver).",
    "DNS translates names to IP addresses; ARP translates IP addresses to MAC addresses.",
  ],
  diagram: {
    title: "DNS Query Resolution Flow & Record Table",
    textRepresentation: `DNS Recursive Resolution Flow:
User enters example.com
        │
        ▼
1. Local DNS Client ──(Query)──► 2. Recursive Resolver (e.g. 8.8.8.8)
                                        │
                         ┌──────────────┼──────────────┐
                         ▼              ▼              ▼
                     3. Root (.)   4. TLD (.com)  5. Authoritative Server
                                                    (example.com -> 93.184.216.34)
                                        │
Local Client ◄──(IP 93.184.216.34)──────┘

Common DNS Resource Record Types Table:
+--------+------------------------------------+---------------------------------------+
| Record | Purpose                            | Example Record Data                   |
+--------+------------------------------------+---------------------------------------+
| A      | Maps hostname to IPv4 address      | example.com  IN  A  93.184.216.34     |
| AAAA   | Maps hostname to IPv6 address      | example.com  IN  AAAA 2606:2800:220.. |
| CNAME  | Canonical name alias for another   | www.example.com IN CNAME example.com  |
| MX     | Identifies mail server for domain  | example.com  IN  MX 10 mail.example   |
| NS     | Identifies authoritative nameserver| example.com  IN  NS ns1.example.com   |
+--------+------------------------------------+---------------------------------------+`,
  },
  importantTerms: [
    { term: "Recursive Resolver", definition: "A DNS server (like 8.8.8.8 or 1.1.1.1) that performs iterative lookups on behalf of client devices." },
    { term: "Root Server (.)", definition: "The top of the DNS hierarchy (13 global root IP addresses) directing queries to TLD servers." },
    { term: "TLD (Top-Level Domain) Server", definition: "Manages domain extensions like .com, .org, .net, or country codes like .uk." },
    { term: "Authoritative Name Server", definition: "The final official DNS server holding the actual zone record files for a specific domain." },
    { term: "TTL (Time-To-Live)", definition: "The duration in seconds that a DNS record can be cached before requiring re-querying." },
  ],
  sections: [
    {
      id: "why-dns-needed",
      title: "Why DNS is Needed",
      body: "Computers route data using 32-bit IPv4 or 128-bit IPv6 numbers. Humans cannot easily memorize dozens of random numerical IP addresses. DNS acts as the Internet's phonebook, translating readable domain names into IP addresses.",
    },
    {
      id: "how-dns-resolution-works",
      title: "Step-by-Step DNS Resolution Process",
      body: "When you type www.example.com into your browser for the first time:",
      bullets: [
        "1. Cache Check: Client checks browser cache and OS hosts file.",
        "2. Recursive Query: Client sends DNS query for www.example.com to its Recursive Resolver (e.g. 8.8.8.8).",
        "3. Root Query: Resolver queries Root Server (.) which responds with the .com TLD server address.",
        "4. TLD Query: Resolver queries .com TLD server which responds with example.com's Authoritative Server address.",
        "5. Authoritative Query: Resolver queries Authoritative Server which returns the final A record IP (93.184.216.34).",
        "6. Answer & Cache: Resolver returns the IP to your browser and caches the result for the specified TTL duration.",
      ],
    },
    {
      id: "dns-vs-dhcp-arp",
      title: "DNS vs DHCP vs ARP",
      body: "Distinguishing core network translation services:",
      bullets: [
        "DHCP: Assigns IP addresses dynamically to local devices when they join a network.",
        "DNS: Resolves domain names (example.com) to IP addresses (93.184.216.34).",
        "ARP: Resolves IP addresses (192.168.1.1) to local MAC hardware addresses (00:1A:2B:3C:4D:5E).",
      ],
    },
  ],
  advantages: [
    "Human-friendly domain name navigation.",
    "Allows changing server IP addresses without changing public domain names.",
    "Global caching hierarchy provides fast response times.",
  ],
  disadvantages: [
    "DNS Cache Poisoning / Spoofing can redirect users to phishing sites (mitigated by DNSSEC).",
    "Slight initial latency for un-cached domain lookups.",
  ],
  commonUseCases: [
    "Resolving websites, email server IPs (MX records), and cloud APIs.",
    "Load balancing traffic across multiple server IPs using Round-Robin DNS.",
  ],
  commonMistakes: [
    "Confusing DNS with ARP — DNS resolves hostnames to IP addresses; ARP resolves IPv4 addresses to MAC hardware addresses.",
    "Forgetting DNS caching — updating an IP on an authoritative server won't reflect immediately for users until their local TTL expires.",
  ],
  comparison: {
    headers: ["Aspect", "DNS (Domain Name System)", "ARP (Address Resolution Protocol)"],
    rows: [
      { label: "Function", classful: "Translates Domain Name to IP Address", cidr: "Translates IPv4 Address to MAC Address" },
      { label: "OSI Layer", classful: "Layer 7 (Application Layer)", cidr: "Layer 2 / Layer 3 Interface" },
      { label: "Scope", classful: "Global Internet distribution", cidr: "Local Link / Subnet boundary only" },
      { label: "Protocols", classful: "UDP / TCP Port 53", cidr: "Direct Ethernet Frame Type 0x0806" },
    ],
  },
  beginnerSummary:
    "DNS is the phonebook of the Internet. Whenever you type a website name like google.com into your browser, DNS looks up the domain name and returns the exact IP address the browser needs to connect to the server.",
  relatedLinks: [
    { label: "DHCP", href: "/learn/dhcp" },
    { label: "HTTP", href: "/learn/http" },
    { label: "HTTPS", href: "/learn/https" },
    { label: "IP Address", href: "/learn/ip-address" },
  ],
};

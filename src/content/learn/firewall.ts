import type { LearningTopic } from "@/data/learning-content";

export const firewallTopic: LearningTopic = {
  id: "firewall",
  title: "Firewall",
  subtitle: "Network security appliance or software agent that inspects and filters traffic based on configured security rules",
  category: "security",
  readTime: "8 min",
  summary:
    "A firewall is a network security device or software application that monitors and filters incoming and outgoing network traffic based on an organization's previously established security policies. It enforces boundaries between trusted internal networks and untrusted external networks.",
  keyTakeaways: [
    "Filters traffic based on 5-tuple parameters: Source IP, Destination IP, Protocol, Source Port, Destination Port.",
    "Evaluates rules sequentially in top-down order until the first matching rule is found.",
    "Stateless firewalls inspect individual packets independently; Stateful firewalls track connection session states.",
    "Can be deployed as host-based software (e.g. Windows Firewall) or dedicated hardware appliances.",
    "Follows either Default Deny (block all unless permitted) or Default Allow security postures.",
    "Firewalls and NAT are separate concepts, though often combined on perimeter appliances.",
  ],
  diagram: {
    title: "Firewall Perimeter Inspection & Sample Rule Table",
    textRepresentation: `Firewall Placement:
[ Untrusted Internet ] ──► [ FIREWALL (Rule Inspection) ] ──► [ Private Internal LAN ]
                                 │
                            (Block / Allow)

Sample Firewall Rule Table (Sequential Top-Down Order):
+-------+-------------------+-------------------+----------+------+--------+
| Order | Source            | Destination       | Protocol | Port | Action |
+-------+-------------------+-------------------+----------+------+--------+
| 1     | 192.168.1.0/24    | Any               | TCP      | 443  | ALLOW  |
| 2     | Any               | Web-Server (DMZ)  | TCP      | 80   | ALLOW  |
| 3     | Any               | Any               | Any      | Any  | DENY   |
+-------+-------------------+-------------------+----------+------+--------+`,
  },
  importantTerms: [
    { term: "5-Tuple", definition: "The 5 packet criteria evaluated by firewalls: Source IP, Dest IP, Source Port, Dest Port, Protocol." },
    { term: "Stateful Inspection", definition: "Firewall capability to track active TCP handshakes and automatically allow returning response traffic." },
    { term: "Stateless Filtering", definition: "Filtering packets individually based on static rules without tracking connection state." },
    { term: "Implicit Deny", definition: "The final default rule at the end of an access list that blocks all unapproved traffic." },
    { term: "DMZ (Demilitarized Zone)", definition: "A isolated perimeter network segment for public servers (Web, Mail) exposed to the Internet." },
  ],
  sections: [
    {
      id: "why-firewall-needed",
      title: "Why Firewalls Are Needed",
      body: "Without a firewall, any device connected to the Internet is vulnerable to unauthorized port scanning, brute-force exploits, and malicious network intrusions. Firewalls create an enforced security barrier.",
    },
    {
      id: "how-firewall-works",
      title: "How a Firewall Evaluates Traffic",
      body: "When a packet arrives at a firewall interface:",
      bullets: [
        "1. Sequential Match: Compares packet headers against rule #1, rule #2, rule #3 in exact order.",
        "2. First Match Execution: As soon as a rule matches, the action (ALLOW / DENY / REJECT) is taken and evaluation stops.",
        "3. State Table Check: In stateful firewalls, established return traffic matching active connections is passed automatically.",
        "4. Implicit Deny: If no rule matches, the final default rule drops the packet.",
      ],
    },
    {
      id: "stateful-vs-stateless",
      title: "Stateful vs Stateless Firewalls",
      body: "Comparing firewall inspection depth:",
      bullets: [
        "Stateless: Evaluates each packet in isolation. Requires manual rules for both outbound request AND inbound reply.",
        "Stateful: Remembers active TCP connections in a State Table. Automatically allows return traffic for established sessions.",
      ],
    },
  ],
  advantages: [
    "Blocks unauthorized access attempts and malware scanning.",
    "Provides central logging and auditing of network traffic.",
    "Supports granular rules based on IP ranges, ports, and applications.",
  ],
  disadvantages: [
    "Misconfigured rule order can accidentally block legitimate business applications.",
    "Can introduce minor latency during deep packet inspection (DPI).",
  ],
  commonUseCases: [
    "Perimeter security between enterprise corporate networks and the Internet.",
    "Host software firewalls protecting personal laptops on public Wi-Fi.",
    "Isolating PCI-compliant payment databases from general workstation networks.",
  ],
  commonMistakes: [
    "Confusing Firewalls with NAT — NAT translates IP addresses; Firewalls enforce security permit/deny rules.",
    "Placing a broad 'Allow Any Any' rule at the top of the rule table — neutralizes all subsequent security rules below it.",
    "Ignoring rule order — putting specific rules below general rules prevents the specific rules from ever firing.",
  ],
  comparison: {
    headers: ["Aspect", "Stateful Firewall", "Stateless Firewall"],
    rows: [
      { label: "Session Memory", classful: "Maintains active connection State Table", cidr: "No memory of previous packets" },
      { label: "Return Traffic", classful: "Automatically permits response traffic", cidr: "Requires explicit rules for return traffic" },
      { label: "Performance / Resource", classful: "Requires memory for state table", cidr: "Ultra-fast execution (Low memory)" },
      { label: "Security Level", classful: "High (Prevents spoofed response packets)", cidr: "Basic (Vulnerable to IP spoofing)" },
    ],
  },
  beginnerSummary:
    "A firewall is a network security guard that stands at the entrance of your computer or company network. It checks incoming and outgoing traffic against a list of permitted rules, blocking malicious or unapproved connections.",
  relatedLinks: [
    { label: "Ports", href: "/learn/ports" },
    { label: "Router", href: "/learn/router" },
    { label: "VPN", href: "/learn/vpn" },
    { label: "HTTPS", href: "/learn/https" },
  ],
};

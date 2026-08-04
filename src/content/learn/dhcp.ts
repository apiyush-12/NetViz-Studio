import type { LearningTopic } from "@/data/learning-content";

export const dhcpTopic: LearningTopic = {
  id: "dhcp",
  title: "DHCP",
  subtitle: "Dynamic Host Configuration Protocol for automated client network parameter assignment (UDP 67/68)",
  category: "services",
  readTime: "7 min",
  summary:
    "DHCP (Dynamic Host Configuration Protocol) is a network management protocol operating at the Application layer (over UDP ports 67 and 68). It automatically provisions IP addresses, subnet masks, default gateways, and DNS server settings to client devices joining a network.",
  keyTakeaways: [
    "Eliminates manual IP configuration for end-user devices.",
    "Follows the 4-step DORA handshake process: Discover, Offer, Request, Acknowledge.",
    "DHCP server issues temporary leases containing IP parameters.",
    "DHCP Reservation allows a specific MAC address to always receive the exact same IP address dynamically.",
    "DHCP Relay Agents allow a central DHCP server to service clients across multiple subnets.",
  ],
  diagram: {
    title: "DHCP DORA 4-Step Handshake Flow",
    textRepresentation: `Client (No IP)                                    DHCP Server
   │                                                     │
   │─── 1. DHCP Discover (UDP Broadcast 255.255.255.255) ─►│
   │                                                     │
   │◄── 2. DHCP Offer (Unicast/Broadcast IP Offer) ──────│
   │                                                     │
   │─── 3. DHCP Request (Broadcast Request Confirmation) ─►│
   │                                                     │
   │◄── 4. DHCP ACK (Lease Confirmed + Gateway/DNS) ─────│`,
  },
  importantTerms: [
    { term: "DORA", definition: "Acronym for the 4 messages in DHCP setup: Discover, Offer, Request, Acknowledge." },
    { term: "DHCP Pool (Scope)", definition: "A configured range of usable IP addresses reserved for dynamic assignment." },
    { term: "Lease Duration", definition: "The time limit for which a client is granted permission to use an assigned IP address." },
    { term: "DHCP Reservation", definition: "Binding a specific MAC address to a fixed IP inside the DHCP server so it receives the same IP dynamically." },
    { term: "DHCP Relay Agent", definition: "A router feature that forwards broadcast DHCP Discover messages across router boundaries to a central DHCP server." },
  ],
  sections: [
    {
      id: "why-dhcp-needed",
      title: "Why DHCP is Needed",
      body: "Manually typing IP addresses, subnet masks, gateways, and DNS servers for hundreds of laptops, smartphones, and tablets would be slow, prone to mistakes, and unmanageable. DHCP automates the entire bootstrap process as soon as a device connects to Wi-Fi or Ethernet.",
    },
    {
      id: "dora-process",
      title: "The 4-Step DORA Process",
      body: "When a device connects to a network without a static IP, it executes the DORA process over UDP:",
      bullets: [
        "1. Discover: Client broadcasts a DHCP Discover packet to 255.255.255.255:67 asking 'Is there a DHCP server available?'",
        "2. Offer: The DHCP server responds with a DHCP Offer proposing an IP address, subnet mask, gateway, and lease time.",
        "3. Request: Client broadcasts a DHCP Request confirming 'I accept the proposed IP address from Server X.'",
        "4. Acknowledge (ACK): Server sends a final DHCP ACK confirming the lease binding, enabling the client interface.",
      ],
    },
    {
      id: "dhcp-options-and-leases",
      title: "DHCP Options & Lease Renewal",
      body: "In addition to an IP address, DHCP delivers essential parameters called DHCP Options:",
      bullets: [
        "Option 3: Default Gateway router IP address.",
        "Option 6: Domain Name Server (DNS) IP addresses.",
        "Option 15: Local domain name suffix.",
        "Lease Renewal: At 50% of lease expiration (T1 timer), the client sends a unicast DHCP Request to renew its current lease.",
      ],
    },
  ],
  advantages: [
    "Zero user effort — automated plug-and-play connectivity.",
    "Prevents duplicate IP address assignment mistakes.",
    "Efficient address reuse — IPs are reclaimed when devices disconnect.",
  ],
  disadvantages: [
    "If the DHCP server goes down, new devices cannot join the network.",
    "Security vulnerability to Rogue DHCP Servers handing out malicious default gateway settings (mitigated by DHCP Snooping on switches).",
  ],
  commonUseCases: [
    "Residential home routers assigning IPs to phones, TVs, and laptops.",
    "Corporate Wi-Fi networks provisioning hundreds of mobile employee devices daily.",
  ],
  commonMistakes: [
    "Believing DHCP assignments are permanent by default — DHCP IPs are temporary leases that expire unless renewed.",
    "Confusing DHCP with DNS — DHCP assigns IP addresses to devices; DNS converts domain names into IP addresses.",
    "Deploying two uncoordinated DHCP servers on the same subnet — causes IP address conflicts and wrong gateway assignments.",
  ],
  comparison: {
    headers: ["Aspect", "DHCP", "Static IP"],
    rows: [
      { label: "IP Allocation", classful: "Dynamic / Temporary Lease", cidr: "Fixed / Permanent" },
      { label: "User Effort", classful: "Automatic (Zero Config)", cidr: "Manual Typing Required" },
      { label: "Risk of Duplicates", classful: "Very Low (Server Managed)", cidr: "Moderate to High (Human Error)" },
      { label: "Target Devices", classful: "Workstations, Laptops, Mobile Devices", cidr: "Web Servers, Gateways, Printers" },
    ],
  },
  beginnerSummary:
    "DHCP is an automated system that handles network configuration for you. As soon as you join a Wi-Fi network, the DHCP server hands your phone an IP address, subnet mask, router gateway, and DNS settings so you can browse instantly without typing anything.",
  relatedLinks: [
    { label: "IP Address", href: "/learn/ip-address" },
    { label: "Static IP", href: "/learn/static-ip" },
    { label: "DNS", href: "/learn/dns" },
    { label: "Default Gateway", href: "/learn/default-gateway" },
  ],
};

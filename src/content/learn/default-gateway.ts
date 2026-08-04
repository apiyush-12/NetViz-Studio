import type { LearningTopic } from "@/data/learning-content";

export const defaultGatewayTopic: LearningTopic = {
  id: "default-gateway",
  title: "Default Gateway",
  subtitle: "The designated local router interface IP address used by hosts to transmit traffic to remote destinations",
  category: "routing",
  readTime: "7 min",
  summary:
    "A Default Gateway is the IP address of a local router interface on the host's subnet. When a computer needs to send a packet to an IP address outside its local subnet, it encapsulates the packet into a frame addressed to the MAC address of its Default Gateway.",
  keyTakeaways: [
    "Serves as the exit access point for all traffic leaving the local subnet.",
    "Must reside on the SAME local IP subnet as the host itself.",
    "Targeted whenever a host's subnet check determines a destination IP is remote.",
    "Discovered at Layer 2 using ARP to find the gateway router's MAC address.",
    "Destination IP in the packet header remains the final remote target, NOT the gateway IP.",
  ],
  diagram: {
    title: "Host Outbound Decision & Default Gateway Flow",
    textRepresentation: `Host Settings:
  IP: 192.168.1.10 / 24
  Default Gateway: 192.168.1.1 (Local Router Interface)

Target Destination: 10.0.0.50 (Remote Subnet)

Step 1: Host compares 10.0.0.50 against 192.168.1.0/24 subnet mask -> REMOTE.
Step 2: Host issues ARP for Gateway IP 192.168.1.1 -> gets Gateway MAC.
Step 3: Host transmits frame:
        [ Dest MAC: Gateway MAC | Dest IP: 10.0.0.50 | Payload ] ──► Router Gateway`,
  },
  importantTerms: [
    { term: "Default Gateway IP", definition: "The specific local router IP configured on a host card (e.g. 192.168.1.1)." },
    { term: "Local Destination", definition: "An IP address within the host's own subnet, reached directly via ARP and local switch." },
    { term: "Remote Destination", definition: "An IP address outside the host's subnet, requiring transmission to the default gateway." },
    { term: "Default Route (0.0.0.0/0)", definition: "The catch-all route entry inside a router's table matching any destination not listed specifically." },
  ],
  sections: [
    {
      id: "why-default-gateway-needed",
      title: "Why Hosts Need a Default Gateway",
      body: "An individual laptop or PC does not hold a complete routing table of the global Internet. It only knows its local subnet. The Default Gateway serves as the single designated exit point for all non-local traffic.",
    },
    {
      id: "how-gateway-works",
      title: "How a Host Uses Its Default Gateway",
      body: "When an application attempts to connect to a remote IP address (e.g. 142.250.190.46 for google.com):",
      bullets: [
        "1. Host calculates subnet bitwise AND: Determines destination IP is on a remote subnet.",
        "2. Host checks local ARP table for the Default Gateway IP (192.168.1.1). If unlisted, it sends an ARP request for 192.168.1.1.",
        "3. Host creates an Ethernet frame setting Destination MAC = Router Gateway MAC.",
        "4. Host leaves Destination IP = 142.250.190.46 (the actual remote website IP).",
        "5. Frame is transmitted to the router gateway for Layer 3 path forwarding.",
      ],
    },
    {
      id: "common-gateway-errors",
      title: "Common Gateway Configuration Mistakes",
      body: "Troubleshooting common default gateway failures:",
      bullets: [
        "Gateway IP outside host subnet: Host cannot ARP for the gateway because it thinks the gateway is remote — breaks all remote traffic.",
        "Missing Default Gateway: Host can ping local devices on 192.168.1.x, but pings to 8.8.8.8 fail immediately with 'Destination Host Unreachable'.",
        "Confusing Gateway with DNS Server: Gateway forwards IP packets; DNS resolves domain names like example.com to IP addresses.",
      ],
    },
  ],
  advantages: [
    "Simplifies host network setup — end-user devices only need a single gateway IP.",
    "Centralizes outbound security filtering and Network Address Translation (NAT) at the gateway router.",
  ],
  disadvantages: [
    "Single Point of Failure for local subnets if redundant router gateways (such as HSRP or VRRP) are not deployed.",
  ],
  commonUseCases: [
    "Configuring residential routers where 192.168.1.1 or 192.168.0.1 acts as default gateway for all home devices.",
    "Provisions automatically via DHCP Option 3 to all connecting Wi-Fi clients.",
  ],
  commonMistakes: [
    "Thinking the packet's destination IP address is changed to the Gateway IP — destination IP stays as the final destination server IP.",
    "Assigning a gateway IP that is on a different subnet than the client host.",
  ],
  comparison: {
    headers: ["Aspect", "Default Gateway", "DNS Server"],
    rows: [
      { label: "Function", classful: "Forwards IP traffic to remote subnets", cidr: "Translates domain names to IP addresses" },
      { label: "Layer", classful: "Layer 3 (Network Layer Router)", cidr: "Layer 7 (Application Service)" },
      { label: "IP Requirement", classful: "MUST be on the host's LOCAL subnet", cidr: "Can be local or remote (e.g. 8.8.8.8)" },
      { label: "Failure Symptom", classful: "Cannot ping IP addresses outside subnet", cidr: "Can ping IP 8.8.8.8 but website names fail" },
    ],
  },
  beginnerSummary:
    "A Default Gateway is your computer's local doorway to the rest of the world. Whenever your computer wants to send data to a website or server outside your home or office, it sends the packet directly to the default gateway router, which handles external delivery.",
  relatedLinks: [
    { label: "IP Address", href: "/learn/ip-address" },
    { label: "Router", href: "/learn/router" },
    { label: "Subnet", href: "/learn/subnet" },
    { label: "Routes", href: "/learn/routes" },
  ],
};

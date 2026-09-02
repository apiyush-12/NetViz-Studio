export interface Ipv4EventExplanation {
  type: string;
  title: string;
  summary: string;
  technicalDetails: string[];
  rfcRules: string[];
  troubleshootingTips: string[];
  securityNotes: string[];
}

export const IPV4_EVENT_EXPLANATIONS: Record<string, Ipv4EventExplanation> = {
  origination: {
    type: "origination",
    title: "IPv4 Packet Construction at Source Host",
    summary: "The source host constructs the 20-byte fixed IPv4 header and wraps the Layer 4 transport payload.",
    technicalDetails: [
      "Version: 4 (0100 binary).",
      "Internet Header Length (IHL): 5 (5 × 32-bit words = 20 bytes).",
      "Total Length: Header length (20 B) + Layer 4 payload bytes.",
      "Identification: 16-bit random number assigned to track fragmentation.",
      "TTL: Initialized (typically 64 on Linux, 128 on Windows).",
      "Header Checksum: 16-bit one's complement sum of the IPv4 header fields.",
    ],
    rfcRules: [
      "RFC 791: Internet Protocol Protocol Specification.",
      "RFC 1122: Requirements for Internet Hosts — Communication Layers.",
    ],
    troubleshootingTips: [
      "Verify that the default gateway IP is configured and reachable on the local subnet.",
      "Check that the destination IP does not collide with reserved RFC 5735 broadcast or loopback addresses.",
    ],
    securityNotes: [
      "IPv4 source IP spoofing is possible unless ingress filtering (BCP 38 / RFC 2827) is enabled at border routers.",
    ],
  },
  "routing-lookup": {
    type: "routing-lookup",
    title: "Longest Prefix Match (LPM) Forwarding",
    summary: "The router compares the destination IPv4 address against its Routing Information Base (RIB) / Forwarding Information Base (FIB).",
    technicalDetails: [
      "LPM Algorithm: Matches destination IP bit-by-bit against routing table entries.",
      "The route with the longest prefix length (/32 > /24 > /16 > /0 default) is selected.",
      "ARP resolution is performed to determine the next-hop MAC address.",
    ],
    rfcRules: [
      "RFC 1812: Requirements for IP Version 4 Routers.",
      "RFC 1519: Classless Inter-Domain Routing (CIDR) Strategy.",
    ],
    troubleshootingTips: [
      "Use 'show ip route' to confirm that a valid route exists for the destination network.",
      "Look for blackhole routes or routing loops (high metric / fluctuating routing table).",
    ],
    securityNotes: [
      "Unicast Reverse Path Forwarding (uRPF) can drop packets with un-routable source IPs.",
    ],
  },
  "ttl-decrement": {
    type: "ttl-decrement",
    title: "TTL Decrement & Checksum Recalculation",
    summary: "Each router hop decrements the TTL by 1 and updates the IPv4 header checksum.",
    technicalDetails: [
      "TTL decremented: TTL = TTL - 1.",
      "Header Checksum: Incremental update per RFC 1624 (avoids full checksum recomputation).",
      "Prevents infinite looping in transient routing loops.",
    ],
    rfcRules: [
      "RFC 791 Section 3.1: Time to Live.",
      "RFC 1624: Computation of the Internet Checksum via Incremental Update.",
    ],
    troubleshootingTips: [
      "Traceroute operates by sending UDP/ICMP packets with incrementally increasing TTL (TTL=1, 2, 3...).",
    ],
    securityNotes: [
      "TTL spoofing or TTL-based network fingerprinting can reveal hop counts and OS signatures.",
    ],
  },
  fragmentation: {
    type: "fragmentation",
    title: "In-Flight MTU Fragmentation",
    summary: "The packet size exceeds the outgoing interface MTU and is split into multiple smaller fragments.",
    technicalDetails: [
      "DF (Don't Fragment) check: If DF=1, router drops packet and returns ICMP Type 3 Code 4.",
      "Fragment Size: Must be a multiple of 8 bytes (due to 13-bit Fragment Offset field in 8-byte blocks).",
      "More Fragments (MF) flag: Set to 1 for all fragments except the final fragment (MF=0).",
      "Identification: Shared across all fragment slices for destination reassembly.",
    ],
    rfcRules: [
      "RFC 791 Section 3.2: Fragmentation and Reassembly.",
      "RFC 815: IP Datagram Reassembly Algorithms.",
    ],
    troubleshootingTips: [
      "Path MTU Discovery (PMTUD, RFC 1191) avoids fragmentation by discovering the lowest MTU on the path.",
      "Ensure firewalls do not block ICMP 'Fragmentation Needed' (Type 3, Code 4) messages (PMTUD Black Hole).",
    ],
    securityNotes: [
      "Teardrop attacks and overlapping fragment exploits target vulnerable reassembly buffers.",
    ],
  },
  reassembly: {
    type: "reassembly",
    title: "Destination Reassembly Buffer",
    summary: "The destination host buffers received fragments and reconstructs the original datagram.",
    technicalDetails: [
      "Fragments matched using 3-tuple: (Source IP, Destination IP, Identification).",
      "Reassembly timer (typically 30-60s) expires if any fragment slice is lost.",
      "If timer expires, all fragments for that datagram are discarded and ICMP Time Exceeded is sent.",
    ],
    rfcRules: [
      "RFC 815: Simplified IP Reassembly Algorithm.",
    ],
    troubleshootingTips: [
      "If a single fragment is dropped in transit, the entire datagram must be retransmitted by TCP/UDP.",
    ],
    securityNotes: [
      "Firewalls and stateful NAT routers must perform virtual fragment reassembly to inspect Layer 4 port headers.",
    ],
  },
  "ttl-expired": {
    type: "ttl-expired",
    title: "TTL Expired in Transit (Packet Dropped)",
    summary: "Router received a packet with TTL=1, decremented it to 0, dropped the packet, and returned ICMP Time Exceeded.",
    technicalDetails: [
      "Action: Packet is discarded.",
      "ICMP Message Sent: ICMP Type 11, Code 0 (Time to Live exceeded in transit).",
      "ICMP Payload: Contains original IPv4 header + first 8 bytes of original payload.",
    ],
    rfcRules: [
      "RFC 792: Internet Control Message Protocol (ICMP).",
    ],
    troubleshootingTips: [
      "Persistent TTL expiration without traceroute indicates a routing loop between two or more routers.",
    ],
    securityNotes: [
      "Rate-limiting ICMP error generation protects routers from CPU exhaustion denial-of-service.",
    ],
  },
  delivered: {
    type: "delivered",
    title: "IPv4 Datagram Successfully Delivered",
    summary: "The complete IPv4 datagram has arrived at the destination host and handed up to the transport layer.",
    technicalDetails: [
      "Protocol header demultiplexed (Protocol 6 $\rightarrow$ TCP stack, Protocol 17 $\rightarrow$ UDP stack).",
      "Layer 3 header stripped.",
    ],
    rfcRules: [
      "RFC 791 / RFC 1122.",
    ],
    troubleshootingTips: [
      "Verify Layer 4 socket is listening on the expected destination port.",
    ],
    securityNotes: [
      "Host firewall (iptables/Windows Defender) applies ingress rules to incoming payload.",
    ],
  },
};

export function getIpv4EventExplanation(type: string): Ipv4EventExplanation {
  return (
    IPV4_EVENT_EXPLANATIONS[type] || {
      type,
      title: "IPv4 Network Processing",
      summary: "IPv4 packet processed by network stack.",
      technicalDetails: ["RFC 791 IP header inspection."],
      rfcRules: ["RFC 791"],
      troubleshootingTips: [],
      securityNotes: [],
    }
  );
}

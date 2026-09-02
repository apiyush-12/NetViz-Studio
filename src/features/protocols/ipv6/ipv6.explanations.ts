export interface Ipv6EventExplanation {
  type: string;
  title: string;
  summary: string;
  technicalDetails: string[];
  rfcRules: string[];
  troubleshootingTips: string[];
  securityNotes: string[];
}

export const IPV6_EVENT_EXPLANATIONS: Record<string, Ipv6EventExplanation> = {
  "packet-originated": {
    type: "packet-originated",
    title: "Fixed 40-Byte IPv6 Header Generation",
    summary: "The source host creates a streamlined 40-byte IPv6 header with 128-bit source and destination addresses.",
    technicalDetails: [
      "Version: 6 (0110 binary).",
      "Traffic Class: 8 bits (6-bit DSCP + 2-bit ECN).",
      "Flow Label: 20 bits (Maintains QoS state across routers without deep packet inspection).",
      "Payload Length: 16 bits (Measures bytes after the 40-byte fixed header).",
      "Next Header: 8 bits (Identifies the next header in the chain, e.g. 6 for TCP or 0 for Hop-by-Hop).",
      "Hop Limit: 8 bits (Replaces IPv4 TTL; decremented by 1 at each router).",
    ],
    rfcRules: [
      "RFC 8200: Internet Protocol, Version 6 (IPv6) Specification.",
      "RFC 4291: IP Version 6 Addressing Architecture.",
    ],
    troubleshootingTips: [
      "Ensure IPv6 address notation uses valid hexadecimal colon syntax and zero-compression (::) rules.",
      "Remember that IPv6 has NO header checksum; Layer 2 and Layer 4 checksums are mandatory.",
    ],
    securityNotes: [
      "Privacy Extensions (RFC 4941) generate randomized temporary interface identifiers to prevent device tracking.",
    ],
  },
  "hop-by-hop-inspection": {
    type: "hop-by-hop-inspection",
    title: "IPv6 Extension Header Chaining",
    summary: "Extension headers are inserted between the IPv6 base header and the upper-layer transport protocol.",
    technicalDetails: [
      "Chaining Mechanism: Each header contains a 'Next Header' field pointing to the subsequent header.",
      "Order of Extension Headers (RFC 8200): Hop-by-Hop Options $\rightarrow$ Routing $\rightarrow$ Fragment $\rightarrow$ ESP/AH $\rightarrow$ Destination Options $\rightarrow$ Upper Layer (TCP/UDP).",
      "Hop-by-Hop Options are inspected and processed by every router on the path.",
    ],
    rfcRules: [
      "RFC 8200 Section 4: IPv6 Extension Headers.",
    ],
    troubleshootingTips: [
      "Some legacy firewalls drop IPv6 packets containing unfamiliar extension headers.",
    ],
    securityNotes: [
      "Type 0 Routing Headers were deprecated (RFC 5095) due to amplification and firewall bypass vulnerabilities.",
    ],
  },
  "flow-label-switching": {
    type: "flow-label-switching",
    title: "20-Bit Flow Label Quality-of-Service",
    summary: "Routers forward packets along consistent ECMP paths using the 20-bit Flow Label without parsing Layer 4 headers.",
    technicalDetails: [
      "Flow Label Value: Pseudo-random 20-bit identifier assigned per TCP connection / UDP flow.",
      "Allows equal-cost multi-path (ECMP) load balancing without inspecting encrypted IPsec payloads.",
    ],
    rfcRules: [
      "RFC 6437: IPv6 Flow Label Specification.",
    ],
    troubleshootingTips: [
      "Verify that routers along the transit path preserve the 20-bit Flow Label unmodified.",
    ],
    securityNotes: [
      "Flow Label must not leak host state or predictable sequence numbers.",
    ],
  },
  "hop-limit-decrement": {
    type: "hop-limit-decrement",
    title: "Hop Limit Decrement (No Checksum Recalculation)",
    summary: "The router decrements the Hop Limit by 1. Because IPv6 has no header checksum, this operation is fast and efficient in hardware.",
    technicalDetails: [
      "Hop Limit = Hop Limit - 1.",
      "Hardware Acceleration: No 16-bit checksum update required per hop.",
      "If Hop Limit reaches 0, router drops packet and sends ICMPv6 Type 3 (Time Exceeded).",
    ],
    rfcRules: [
      "RFC 8200 Section 3: Hop Limit.",
      "RFC 4443: ICMPv6 Specification.",
    ],
    troubleshootingTips: [
      "IPv6 traceroute uses ICMPv6 Echo Request / UDP with ascending Hop Limits.",
    ],
    securityNotes: [
      "Rate-limit ICMPv6 Time Exceeded generation to avoid router CPU starvation.",
    ],
  },
  "ndp-resolution": {
    type: "ndp-resolution",
    title: "Neighbor Discovery Protocol (NDP / SLAAC)",
    summary: "IPv6 replaces broadcast ARP with multicast ICMPv6 Neighbor Discovery Protocol (NDP).",
    technicalDetails: [
      "Neighbor Solicitation (NS, Type 135) $\rightarrow$ Sent to Solicited-Node Multicast address `ff02::1:ffxx:xxxx`.",
      "Neighbor Advertisement (NA, Type 136) $\rightarrow$ Returns target Link-Layer MAC address.",
      "Router Advertisement (RA, Type 134) $\rightarrow$ Advertises /64 prefix for Stateless Address Autoconfiguration (SLAAC).",
    ],
    rfcRules: [
      "RFC 4861: Neighbor Discovery for IP version 6 (IPv6).",
      "RFC 4862: IPv6 Stateless Address Autoconfiguration (SLAAC).",
    ],
    troubleshootingTips: [
      "Ensure IPv6 multicast traffic is not blocked on Layer 2 switches (MLD snooping).",
      "Duplicate Address Detection (DAD) must succeed before an IPv6 address is assigned to an interface.",
    ],
    securityNotes: [
      "RA Guard (RFC 6105) protects subnets against rogue IPv6 router advertisements.",
    ],
  },
  "tunnel-encapsulation": {
    type: "tunnel-encapsulation",
    title: "6to4 / Dual-Stack Tunneling Encapsulation",
    summary: "The 128-bit IPv6 datagram is encapsulated inside an IPv4 packet header (IP Protocol 41) to traverse an IPv4-only network.",
    technicalDetails: [
      "Outer Header: IPv4 Header (Protocol 41: IPv6 encapsulation).",
      "Inner Header: Full 40-byte IPv6 Datagram intact.",
      "Tunnel Decapsulator strips outer IPv4 header at exit gateway.",
    ],
    rfcRules: [
      "RFC 3056: Connection of IPv6 Domains via IPv4 Clouds (6to4).",
      "RFC 4213: Basic Transition Mechanisms for IPv6 Hosts and Routers.",
    ],
    troubleshootingTips: [
      "Tunneling reduces the effective path MTU by 20 bytes (IPv4 header overhead).",
    ],
    securityNotes: [
      "Tunnel endpoints must validate source IP addresses to prevent open relay reflection attacks.",
    ],
  },
  delivered: {
    type: "delivered",
    title: "IPv6 Datagram Delivered to Destination Host",
    summary: "The 128-bit IPv6 packet reached the destination socket.",
    technicalDetails: [
      "Next Header 6 dispatched to TCP stack.",
      "TCP pseudo-header checksum verified using 128-bit source and destination addresses.",
    ],
    rfcRules: [
      "RFC 8200 / RFC 4443.",
    ],
    troubleshootingTips: [
      "Confirm socket is bound to dual-stack `::` or specific `2001:db8::` address.",
    ],
    securityNotes: [
      "Ingress firewall rules inspect IPv6 flow state.",
    ],
  },
};

export function getIpv6EventExplanation(type: string): Ipv6EventExplanation {
  return (
    IPV6_EVENT_EXPLANATIONS[type] || {
      type,
      title: "IPv6 Protocol Processing",
      summary: "IPv6 packet evaluated by network stack.",
      technicalDetails: ["RFC 8200 IPv6 specification."],
      rfcRules: ["RFC 8200"],
      troubleshootingTips: [],
      securityNotes: [],
    }
  );
}

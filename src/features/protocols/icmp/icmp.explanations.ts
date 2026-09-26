import type { ExplanationSection } from "@/features/protocols/shared/protocol-types";

export const ICMP_EXPLANATION_SECTIONS: ExplanationSection[] = [
  {
    eventType: "ICMP_ECHO_REQUEST",
    beginner: {
      whatHappened: "Client sends an ICMP Echo Request (Ping) probe asking: 'Are you alive and reachable?'",
      whyItHappened:
        "The user wants to test end-to-end network connectivity and measure how long it takes for a signal to bounce back (Round-Trip Time / RTT).",
      protocolRule: "ICMP Type 8 Code 0 carries Identifier and Sequence numbers to track individual ping packets.",
      fieldsChanged: ["ICMP Type: 8 (Echo Request)", "Code: 0", "Seq: 1", "Checksum: Verified"],
      whatHappensNext: "The target server receives the probe and immediately crafts an identical Echo Reply (Type 0).",
      realWorldUse: "Used billions of times daily by network admins, engineers, and gamers to test latency and packet loss.",
    },
    advanced: {
      whatHappened: "Generation of ICMPv4 Echo Message (RFC 792) with Identifier and Monotonic Sequence Numbering.",
      whyItHappened:
        "The client application opens a raw ICMP socket (or `IPPROTO_ICMP`), populates a 16-bit process Identifier (PID) and monotonic sequence number, and computes the 16-bit RFC 1071 one's complement checksum.",
      protocolRule: "RFC 792 Section 'Echo or Echo Reply Message': Target node must return identical identifier, sequence, and payload data.",
      fieldsChanged: ["Type: 8", "Code: 0", "Checksum: 16-bit 1's complement", "Payload: Timestamp + Pattern"],
      whatHappensNext: "Encapsulated into IPv4 datagram (Protocol 1) and routed across intermediate hops to destination.",
      realWorldUse: "Standard automated SLA monitoring, keepalive heartbeats, and path latency measurements.",
    },
  },
  {
    eventType: "ICMP_ECHO_REPLY",
    beginner: {
      whatHappened: "Target Server answers the ping with an ICMP Echo Reply: 'Yes, I am here and working!'",
      whyItHappened:
        "The server received the Echo Request and mirrored the exact sequence number and data payload back to the sender.",
      protocolRule: "ICMP Type 0 Code 0 is the official mirrored response to Type 8 Echo Request.",
      fieldsChanged: ["ICMP Type: 0 (Echo Reply)", "Code: 0", "RTT: Calculated in ms"],
      whatHappensNext: "Client terminal prints `64 bytes from 203.0.113.80: icmp_seq=1 ttl=64 time=24.2 ms`.",
      realWorldUse: "Confirms two-way bidirectional reachability and measures network jitter.",
    },
    advanced: {
      whatHappened: "ICMP Type 0 Code 0 Echo Reply generation and RTT calculation.",
      whyItHappened:
        "The target OS kernel responds to Type 8 by swapping source/destination IP addresses, updating ICMP Type to 0 (Echo Reply), recalculating the checksum, and reflecting the exact payload.",
      protocolRule: "RFC 792: The data received in the echo message must be returned in the echo reply message.",
      fieldsChanged: ["Type: 8 -> 0", "IP Source/Dest: Swapped", "RTT: High-resolution timestamp delta"],
      whatHappensNext: "Client kernel matches sequence number to socket receive buffer and reports roundtrip metrics.",
      realWorldUse: "Base mechanism for all automated health check probes and ping telemetry.",
    },
  },
  {
    eventType: "ICMP_TIME_EXCEEDED",
    beginner: {
      whatHappened: "A router dropped the packet because its 'Hop Counter' (TTL) reached 0, and sent back a 'Time Exceeded' message.",
      whyItHappened:
        "Every time a packet crosses a router, its Time-to-Live (TTL) is subtracted by 1 to prevent endless loops. When TTL hits 0, the router safely discards it and reports who it is.",
      protocolRule: "When IP TTL reaches 0 in transit, router must discard packet and send ICMP Type 11 Code 0.",
      fieldsChanged: ["ICMP Type: 11 (Time Exceeded)", "Code: 0 (TTL=0 in transit)", "Router IP: Exposed"],
      whatHappensNext: "Traceroute notes the router's IP and latency, then sends the next probe with TTL + 1.",
      realWorldUse: "Powers `traceroute` and `mtr` to map every single router between you and any website.",
    },
    advanced: {
      whatHappened: "TTL Expiration in Transit (RFC 792) and ICMP Error Quoting (First 64 bits of Payload).",
      whyItHappened:
        "Intermediate router received IPv4 datagram with TTL <= 1. Router decremented TTL to 0, dropped the datagram, and generated an ICMP Type 11 Code 0 error message.",
      protocolRule: "RFC 792 Section 'Time Exceeded Message': Must include original IP header + first 8 bytes of original transport datagram.",
      fieldsChanged: ["Type: 11", "Code: 0", "Quoted Header: Original IPv4 + 8B Transport Header"],
      whatHappensNext: "Originating host parses quoted UDP/ICMP sequence number to correlate the probe with the hop index.",
      realWorldUse: "Network path diagnostics, routing loop detection, and ISP transit troubleshooting.",
    },
  },
  {
    eventType: "ICMP_FRAG_NEEDED_PMTUD",
    beginner: {
      whatHappened: "A router blocked an oversized packet and returned a note: 'Too big for this tunnel! Maximum allowed size is 1300 bytes.'",
      whyItHappened:
        "The sender marked the packet with 'Don't Fragment' (DF=1). When it reached a narrow tunnel with MTU 1300, the router refused to slice it and sent an explicit size limit warning.",
      protocolRule: "Path MTU Discovery: Router sends ICMP Type 3 Code 4 carrying the exact Next-Hop MTU value.",
      fieldsChanged: ["ICMP Type: 3", "Code: 4 (Frag Needed & DF set)", "Next-Hop MTU: 1300", "Client Path MTU: Updated to 1300"],
      whatHappensNext: "Client automatically shrinks its packet size to 1300 bytes and resends smoothly with 0 fragmentation.",
      realWorldUse: "Essential for VPNs, Cloud GRE/IPsec tunnels, and high-performance TCP connections.",
    },
    advanced: {
      whatHappened: "RFC 1191 Path MTU Discovery (PMTUD) and Next-Hop MTU Feedback.",
      whyItHappened:
        "A 1500-byte IPv4 packet with `DF=1` (Don't Fragment) arrived at an egress interface with MTU 1300. The router dropped the packet and emitted ICMP Destination Unreachable (Type 3 Code 4) populated with `Next-Hop MTU: 1300` in bytes 6-7 of the ICMP header.",
      protocolRule: "RFC 1191 Section 4: Router must supply MTU of next-hop link in the previously unused 16 bits of the ICMP header.",
      fieldsChanged: ["Type: 3", "Code: 4", "Next-Hop MTU: 1300", "Host Routing Table: Path MTU Cache updated"],
      whatHappensNext: "Host socket adjusts TCP Maximum Segment Size (MSS) / IP packet sizing to 1300 bytes, avoiding fragmentation.",
      realWorldUse: "Eliminates CPU-expensive IP fragmentation across the global Internet.",
    },
  },
  {
    eventType: "ICMP_DEST_PORT_UNREACHABLE",
    beginner: {
      whatHappened: "Target computer replied: 'I received your message, but no program is listening on that port number!'",
      whyItHappened:
        "A probe arrived at UDP port 33434, but the server had no application running on that port, so the operating system rejected it.",
      protocolRule: "When an OS receives traffic for a closed UDP/TCP port without a listener, it generates ICMP Type 3 Code 3.",
      fieldsChanged: ["ICMP Type: 3", "Code: 3 (Port Unreachable)", "Status: Target Reached"],
      whatHappensNext: "Traceroute sees Port Unreachable and knows it has officially reached the final destination server!",
      realWorldUse: "Used by classic Linux/BSD `traceroute` to detect arrival at the destination endpoint.",
    },
    advanced: {
      whatHappened: "Transport Layer Socket Demultiplexing Failure (RFC 792 Destination Port Unreachable).",
      whyItHappened:
        "The destination host network stack parsed the UDP datagram, queried the socket lookup table, and found no bound `SO_REUSEADDR` / listening socket for port 33434.",
      protocolRule: "RFC 792 Section 'Destination Unreachable Message': If the transport protocol has no active listener, generate Code 3.",
      fieldsChanged: ["Type: 3", "Code: 3", "Quoted UDP Header: Source & Dest Ports quoted"],
      whatHappensNext: "Traceroute interprets Type 3 Code 3 as successful termination of the hop traversal.",
      realWorldUse: "Port scanning detection (Nmap UDP scan), firewall rules, and traceroute termination.",
    },
  },
  {
    eventType: "ICMP_ADMIN_PROHIBITED",
    beginner: {
      whatHappened: "A Security Firewall actively blocked the connection and sent back an explicit administrative refusal.",
      whyItHappened:
        "The firewall's Access Control List (ACL) detected unauthorized traffic and replied with 'Administratively Prohibited' instead of silently ignoring it.",
      protocolRule: "ICMP Type 3 Code 13 signifies communication administratively blocked by network policy.",
      fieldsChanged: ["ICMP Type: 3", "Code: 13 (Admin Prohibited)", "Action: Blocked by Firewall"],
      whatHappensNext: "Client immediately terminates the connection attempt without wasting time waiting for timeouts.",
      realWorldUse: "Enterprise corporate firewalls (Palo Alto, Cisco ASA, Fortinet, pfSense) enforcing security policies.",
    },
    advanced: {
      whatHappened: "Firewall Policy Enforcement via ICMP Type 3 Code 13 (Communication Administratively Prohibited).",
      whyItHappened:
        "The stateful packet filter evaluated its security rulebase against the 5-tuple (Src IP, Dst IP, Protocol, Src Port, Dst Port) and matched a `REJECT WITH ICMP-ADMIN-PROHIBITED` rule.",
      protocolRule: "RFC 1812 Section 5.2.7.1: Routers/Firewalls may return Code 13 to indicate policy filter rejection.",
      fieldsChanged: ["Type: 3", "Code: 13", "Quoted Frame: Offending packet header"],
      whatHappensNext: "Originating application receives `ECONNREFUSED` or `EHOSTUNREACH` system error immediately.",
      realWorldUse: "Explicit security policy rejection preventing client TCP SYN retry exhaustion.",
    },
  },
  {
    eventType: "ICMP_REDIRECT",
    beginner: {
      whatHappened: "Default Gateway router advised: 'There is a faster router right next to you on your local network! Send directly to them.'",
      whyItHappened:
        "Host A sent a packet to Router R1, but R1 had to turn around and forward it to Router R2 on the exact same local Wi-Fi/Ethernet cable. R1 tells Host A to skip the middleman.",
      protocolRule: "ICMP Type 5 instructs the host to update its routing table with an optimal first-hop gateway.",
      fieldsChanged: ["ICMP Type: 5 (Redirect)", "Code: 1 (Redirect for Host)", "Optimal Gateway: 192.168.1.2"],
      whatHappensNext: "Host A updates its route cache and sends future packets directly to Router R2, saving 50% bandwidth.",
      realWorldUse: "Optimizes multi-router enterprise LANs and campus subnets automatically.",
    },
    advanced: {
      whatHappened: "ICMP Router Redirect Generation (RFC 792 / RFC 1122).",
      whyItHappened:
        "Router R1 received a packet on interface Gi0/0 and its routing lookup selected next-hop 192.168.1.2 (R2) reachable out of the *same* physical interface Gi0/0. R1 forwards the packet and emits ICMP Type 5 Code 1 to Host A.",
      protocolRule: "RFC 792 Section 'Redirect Message': Sent only when ingress interface == egress interface and source is on local subnet.",
      fieldsChanged: ["Type: 5", "Code: 1", "Gateway Internet Address: 192.168.1.2", "Host FIB: Dynamic host route added"],
      whatHappensNext: "Host OS kernel installs a transient `/32` route cache entry pointing directly to R2.",
      realWorldUse: "First-hop routing optimization in multi-router broadcast domains (e.g. VRRP/HSRP environments).",
    },
  },
];

import type { ExplanationSection } from "@/features/protocols/shared/protocol-types";

export const ARP_EXPLANATION_SECTIONS: ExplanationSection[] = [
  {
    eventType: "arp-cache-lookup",
    beginner: {
      whatHappened:
        "The sending host checked its local ARP cache table for the destination IP address. No matching MAC address was found (Cache Miss), so the outgoing packet was queued.",
      whyItHappened:
        "Computers on an Ethernet local network cannot deliver IP packets directly without knowing the destination hardware (MAC) address.",
      protocolRule:
        "RFC 826: Before transmitting any Layer 3 IPv4 datagram over Ethernet, the sender must resolve the destination or gateway MAC address.",
      fieldsChanged: ["queuedPacket", "arpCache"],
      whatHappensNext:
        "The host prepares an Address Resolution Protocol (ARP) Request packet and broadcasts it to everyone on the local subnet.",
      misconception:
        "The computer asks the Internet router for the MAC address. (ARP is local to the subnet; all hosts on the segment receive the broadcast directly).",
      realWorldUse:
        "Every PC, phone, and server maintains an ARP cache in RAM (`arp -a` on Windows/Linux) to avoid broadcasting for every single packet.",
    },
    advanced: {
      whatHappened:
        "Host kernel performed an ARP cache lookup for target IPv4 address. Cache returned MISS/INCOMPLETE. Layer 3 packet placed into interface egress hold queue.",
      whyItHappened:
        "Ethernet framing requires a 48-bit Destination MAC in the 14-byte Ethernet II header before placing bits onto the physical wire.",
      protocolRule:
        "RFC 826 / IEEE 802.3: Ingress packet buffering occurs while ARP state machine enters RESOLVING state.",
      fieldsChanged: ["interface.holdQueue", "arpTable.state"],
      whatHappensNext:
        "ARP Request generated with Operation Code 1, Target Hardware Address (THA) set to 00:00:00:00:00:00, and Ethernet Destination FF:FF:FF:FF:FF:FF.",
      misconception:
        "ARP uses IP packets with IP protocol numbers. (ARP is directly encapsulated in Ethernet frames with EtherType 0x0806, below IPv4).",
      realWorldUse:
        "ARP cache entries typically expire within 2 to 20 minutes (RFC 1122 / Cisco default 4 hours / Linux 60s) to adapt to changed NICs or IP reassignments.",
    },
  },
  {
    eventType: "arp-broadcast-request",
    beginner: {
      whatHappened:
        "Host A broadcasted an ARP Request: 'Who has this IP address? Tell my IP and MAC!' The switch received it and flooded it to all connected ports.",
      whyItHappened:
        "Because Host A doesn't know which physical computer owns that IP, it asks all devices on the local network simultaneously.",
      protocolRule:
        "Destination Ethernet address is set to the Broadcast MAC (FF:FF:FF:FF:FF:FF). All devices must receive and process it.",
      fieldsChanged: ["destMac", "opcode", "targetIp"],
      whatHappensNext:
        "Every device on the subnet inspects the request. Devices whose IP does not match will silently drop it; the real owner will reply.",
      misconception:
        "Broadcasts cross routers into other networks. (Layer 2 broadcast frames are strictly contained within their local VLAN / broadcast domain).",
      realWorldUse:
        "Switches automatically learn Host A's MAC address from the incoming frame and record it in their MAC address table (CAM).",
    },
    advanced: {
      whatHappened:
        "Ethernet frame broadcast (FF:FF:FF:FF:FF:FF) with EtherType 0x0806. ARP payload contains SHA (Sender MAC), SPA (Sender IP), and TPA (Target IP). Switch updates CAM table.",
      whyItHappened:
        "Switch inspects Source MAC of ingress frame on Port 1, recording `00:1A:2B:3C:4D:01 -> Fa0/1` in its forwarding database before flooding.",
      protocolRule:
        "RFC 826 Protocol Details: Hardware Type = 1 (Ethernet), Protocol Type = 0x0800 (IPv4), HLEN = 6, PLEN = 4, Opcode = 1 (Request).",
      fieldsChanged: ["switch.macTable", "ethernet.destinationMac"],
      whatHappensNext:
        "Downstream hosts examine Target Protocol Address (TPA). Unmatched hosts discard the frame.",
      misconception:
        "ARP requests cause broadcast storms in properly designed networks. (Only switching loops without STP cause broadcast storms).",
      realWorldUse:
        "DHCP Snooping and Dynamic ARP Inspection (DAI) inspect these broadcast requests on access switches to block rogue addresses.",
    },
  },
  {
    eventType: "arp-unicast-reply",
    beginner: {
      whatHappened:
        "Host B recognized its own IP address in the request. It updated its ARP table with Host A's info and sent back a direct Unicast ARP Reply: 'I have that IP! My MAC is B.'",
      whyItHappened:
        "Host B now knows Host A's MAC address (from the request), so the reply doesn't need to be broadcast; it is sent directly to Host A.",
      protocolRule:
        "ARP Reply uses Opcode 2. Ethernet Destination MAC is set directly to the requester's MAC address.",
      fieldsChanged: ["arpCache", "opcode", "senderMac"],
      whatHappensNext:
        "The switch forwards the unicast reply directly to Host A's port. Host A stores Host B's MAC in its ARP table and sends the waiting data packet.",
      misconception:
        "ARP replies are also broadcast. (ARP replies are unicast directly to the requester to conserve network bandwidth).",
      realWorldUse:
        "Because Host B also learned Host A's MAC address during the request, communication is now two-way without Host B needing to ARP back.",
    },
    advanced: {
      whatHappened:
        "Host B matched TPA to its local interface IP. It populated its ARP cache with (SPA, SHA), changed Opcode to 2 (Reply), and transmitted unicast frame to SHA.",
      whyItHappened:
        "Bidirectional caching optimization in RFC 826: The target host pre-populates its ARP cache from the incoming request to prevent a redundant second ARP exchange.",
      protocolRule:
        "RFC 826: Target swaps SPA and TPA, sets SHA to its own interface MAC address, and sets Opcode to 2.",
      fieldsChanged: ["hostB.arpCache", "hostA.arpCache", "ethernet.destinationMac"],
      whatHappensNext:
        "Host A parses ARP Reply, transitions entry from INCOMPLETE to RESOLVED, and flushes the queued ICMP Echo Request onto the wire.",
      misconception:
        "ARP replies require an acknowledgment. (ARP has no transport-layer ACKs; reliability is handled by higher layers like TCP).",
      realWorldUse:
        "Gratuitous ARP attacks exploit this exact unicast/broadcast reply parsing mechanism to poison neighbor caches.",
    },
  },
  {
    eventType: "gratuitous-arp",
    beginner: {
      whatHappened:
        "A host transmitted a Gratuitous ARP (GARP) packet broadcasting its own IP and MAC address without being asked.",
      whyItHappened:
        "GARP is used for two important reasons: 1. To detect if someone else is accidentally using the same IP address (Duplicate IP conflict), and 2. To tell switches and neighbors that an IP moved to a new physical port.",
      protocolRule:
        "RFC 5227: In a Gratuitous ARP, the Sender IP (SPA) and Target IP (TPA) are identical.",
      fieldsChanged: ["arpCache", "switch.macTable"],
      whatHappensNext:
        "If another host replies, an IP conflict alert is raised. Otherwise, all switches and hosts update their tables with the new mapping.",
      misconception:
        "ARP is only sent when trying to communicate with someone else. (Hosts broadcast GARP automatically when booting or plugging in network cables).",
      realWorldUse:
        "Crucial for High Availability (HA) clusters (VRRP, HSRP, CARP, Keepalived). When the primary server dies, the backup server sends GARP to instantly take over the Virtual IP.",
    },
    advanced: {
      whatHappened:
        "RFC 5227 IPv4 Address Conflict Detection (ACD): Host broadcasts ARP Announcement (SPA == TPA) and ARP Probes (SPA == 0.0.0.0, TPA == configured IP).",
      whyItHappened:
        "Forces immediate CAM table flush on intermediate switches and updates neighboring ARP caches without waiting for aging timers.",
      protocolRule:
        "RFC 5227 Clause 2.3: If any ARP frame with conflicting SPA is observed, the host must defend or surrender the address.",
      fieldsChanged: ["node.ipAddress", "switch.camTable", "neighbor.arpCache"],
      whatHappensNext:
        "Subnet ARP tables update binding to new hardware address with zero downtime.",
      misconception:
        "GARP requires special hardware. (Standard operating systems and clustering daemons generate standard RFC 5227 GARP frames).",
      realWorldUse:
        "VMware vSphere vMotion and Kubernetes node migrations broadcast GARP so upstream physical switches redirect traffic to the new hypervisor host instantly.",
    },
  },
  {
    eventType: "arp-spoofing-dai",
    beginner: {
      whatHappened:
        "An attacker sent fake ARP replies claiming to be the Default Gateway! With Dynamic ARP Inspection (DAI) enabled, the switch inspected the packet against trusted bindings and dropped it.",
      whyItHappened:
        "Standard ARP has no built-in password or authentication. Attackers can lie about who owns which IP to intercept, spy on, or modify network traffic (Man-in-the-Middle).",
      protocolRule:
        "Dynamic ARP Inspection (DAI) validates incoming ARP frames against a trusted DHCP Snooping database and discards invalid IP-to-MAC mappings.",
      fieldsChanged: ["switch.securityAlerts", "attacker.droppedFrames"],
      whatHappensNext:
        "The attack is blocked! The victim host's ARP table remains safe and points directly to the real gateway.",
      misconception:
        "Antivirus software on a PC can prevent ARP poisoning on the wire. (ARP spoofing happens at Layer 2; switch-level DAI / 802.1X is the most effective defense).",
      realWorldUse:
        "Enterprise switches enable DHCP Snooping + DAI on all access ports connected to employee PCs to prevent MITM credentials theft.",
    },
    advanced: {
      whatHappened:
        "Rogue host generated unsolicited ARP Reply mapping Gateway IP (192.168.1.1) to Attacker MAC (00:DE:AD:BE:EF:66). Switch DAI ASIC verified frame against DHCP Snooping Binding Table.",
      whyItHappened:
        "Binding table showed Port Gi0/3 is only authorized for 192.168.1.66; frame claiming 192.168.1.1 violated the security contract.",
      protocolRule:
        "IEEE 802.1Q / Cisco Dynamic ARP Inspection: Untrusted ports rate-limited and filtered against DHCP Snooping and static ARP ACLs.",
      fieldsChanged: ["switch.daiDropCount", "switch.syslog"],
      whatHappensNext:
        "Switch increments `DAI-DROP` counter, logs syslog alarm, and drops illegitimate frame before it can poison victim CAM/ARP tables.",
      misconception:
        "DAI slows down network switching. (Hardware ASICs perform DAI table validation at wire-speed with sub-microsecond latency).",
      realWorldUse:
        "Standard defense in PCI-DSS, zero-trust enterprise LANs, and financial trading floors against Ettercap / Bettercap ARP poisoning attacks.",
    },
  },
];

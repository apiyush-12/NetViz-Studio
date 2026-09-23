import type { ExplanationSection } from "@/features/protocols/shared/protocol-types";

export const VLAN_EXPLANATION_SECTIONS: ExplanationSection[] = [
  {
    eventType: "vlan-broadcast-isolation",
    beginner: {
      whatHappened:
        "A host in VLAN 10 sent a broadcast frame (e.g., an ARP Request). The switch forwarded the broadcast to all other ports assigned to VLAN 10, but completely blocked it from reaching VLAN 20.",
      whyItHappened:
        "VLANs divide a single physical switch into separate virtual networks (broadcast domains). Devices in different VLANs cannot hear each other's broadcasts.",
      protocolRule:
        "IEEE 802.1Q: Layer 2 broadcast, multicast, and unknown unicast frames must strictly remain within the ingress port's assigned VLAN broadcast domain.",
      fieldsChanged: ["switch.broadcastDomain", "accessPort.pvid"],
      whatHappensNext:
        "Only hosts in VLAN 10 inspect the frame. Hosts in VLAN 20 experience zero CPU interrupts or network noise.",
      misconception:
        "A switch connects all plugged-in computers into one big party line. (With VLANs configured, ports act as if they are plugged into physically distinct, separate switches).",
      realWorldUse:
        "Enterprise offices separate Staff, Guest Wi-Fi, and IoT Security Cameras into distinct VLANs so guests or compromised smart bulbs cannot sniff employee traffic.",
    },
    advanced: {
      whatHappened:
        "Broadcast frame (Destination MAC FF:FF:FF:FF:FF:FF) entered Access Port Fa0/1 with PVID 10. Switch forwarding engine performed VLAN CAM table filtering and flooded frame exclusively out ports member of VLAN 10.",
      whyItHappened:
        "Layer 2 switches maintain per-VLAN forwarding instances (PVST / Forwarding Database). Ports in VLAN 20 (Fa0/3, Fa0/4) are masked out of the flood mask vector.",
      protocolRule:
        "IEEE 802.1Q Clause 8.6: Ingress Filtering ensures that frames received on a port configured for VLAN N are only forwarded to egress ports that are members of VLAN N.",
      fieldsChanged: ["camTable.vlanId", "port.floodMask"],
      whatHappensNext:
        "Destination host in VLAN 10 replies via unicast. CAM table learns Source MAC mapped to Port and VLAN ID.",
      misconception:
        "VLAN isolation can be broken with Layer 2 software hacks on an access port. (Hardware ASIC ingress filtering enforces port-VLAN boundary in silicon).",
      realWorldUse:
        "PCI-DSS regulatory compliance mandates strict VLAN segmentation to isolate Cardholder Data Environments (CDE) from general corporate office networks.",
    },
  },
  {
    eventType: "dot1q-trunk-tag-insertion",
    beginner: {
      whatHappened:
        "As the packet left Switch 1 to travel across the link connecting to Switch 2, the switch added a tiny 4-byte 'VLAN Tag' badge (stamped with VLAN 10) onto the Ethernet frame.",
      whyItHappened:
        "A single physical cable between two switches (called a Trunk link) carries traffic for multiple different VLANs. Without a tag, Switch 2 would not know which VLAN the frame belongs to!",
      protocolRule:
        "IEEE 802.1Q: Trunk ports insert a 4-byte Tag header between the Source MAC and EtherType fields before transmitting frames across switch interconnects.",
      fieldsChanged: ["frame.isTagged", "dot1q.tpid", "dot1q.vlanId"],
      whatHappensNext:
        "The tagged frame travels across the high-speed trunk. Switch 2 will read the tag on arrival.",
      misconception:
        "Computers on your desk send tagged frames. (Standard end-devices send normal untagged frames; only switches and routers add and read 802.1Q tags).",
      realWorldUse:
        "Allows a company with 50 VLANs to connect two 48-port switches using just 1 fiber trunk cable instead of 50 separate physical cables!",
    },
    advanced: {
      whatHappened:
        "Switch 1 inserted a 32-bit (4-byte) IEEE 802.1Q tag header into the Ethernet II frame. Header consists of TPID (0x8100) and 16-bit TCI (3-bit PCP CoS, 1-bit DEI, 12-bit VID = 10).",
      whyItHappened:
        "Multiplexes multiple virtual broadcast domains over a single 802.3 link. The 12-bit VID field allows multiplexing up to 4,094 distinct VLANs.",
      protocolRule:
        "IEEE 802.1Q Section 9: Frame format expands from 1518 bytes to 1522 bytes (or baby giant frames) to accommodate the 4-byte VLAN tag without exceeding MTU.",
      fieldsChanged: ["ethernet.tpid", "ethernet.tci", "frame.length"],
      whatHappensNext:
        "Trunk receiver ASIC decodes TPID 0x8100, extracts VID 10, and maps the ingress frame into the internal VLAN 10 forwarding pipeline.",
      misconception:
        "Cisco ISL (Inter-Switch Link) is still commonly used. (Proprietary Cisco ISL encapsulated the entire frame in 30-byte overhead and is now obsolete; IEEE 802.1Q is the universal industry standard).",
      realWorldUse:
        "VMware ESXi and Hyper-V hypervisors use 802.1Q trunking (Virtual Switch Tagging - VST) to connect dozens of Virtual Machines on different VLANs across a single 25GbE NIC.",
    },
  },
  {
    eventType: "dot1q-trunk-tag-stripping",
    beginner: {
      whatHappened:
        "Switch 2 received the tagged frame from the trunk, read the 'VLAN 10' tag, and removed (stripped) the 4-byte tag before forwarding the original clean Ethernet packet to PC 2.",
      whyItHappened:
        "End-user computers (Windows, Mac, Linux PCs, printers) only understand standard Ethernet. If a switch sent a tagged frame to a standard PC, the computer would reject it as corrupted.",
      protocolRule:
        "IEEE 802.1Q: Access ports must remove the 802.1Q tag header on egress so destination end-stations receive standard untagged Ethernet frames.",
      fieldsChanged: ["frame.isTagged", "frame.dot1q"],
      whatHappensNext:
        "PC 2 receives the standard Ethernet frame and processes the payload smoothly.",
      misconception:
        "You need special network cards (NICs) on your laptop to connect to a VLAN. (The switch handles all tagging/untagging invisibly; standard NICs work out of the box).",
      realWorldUse:
        "Transparent end-user experience across campus buildings: users in Building A and Building B communicate seamlessly across fiber trunks without any special client configuration.",
    },
    advanced: {
      whatHappened:
        "Switch 2 egress pipeline evaluated destination port Fa0/1 configured as `switchport mode access` in VLAN 10. Egress processor stripped 4-byte 802.1Q shim header and recomputed FCS.",
      whyItHappened:
        "Access ports operate in untagged mode (Native PVID egress). Frame length contracts by 4 bytes back to standard IEEE 802.3 format.",
      protocolRule:
        "IEEE 802.1Q Clause 8.8: Egress Untagging Table dictates whether frames forwarded out a given port have their VLAN tag removed.",
      fieldsChanged: ["frame.isTagged", "frame.fcs"],
      whatHappensNext:
        "Host NIC driver handles standard EtherType 0x0800 IPv4 packet at Layer 3 without awareness of upstream Layer 2 trunking.",
      misconception:
        "Stripping tags causes performance lag. (Hardware ASICs perform tag insertion and removal at full wire-speed with sub-microsecond latency).",
      realWorldUse:
        "Cloud data center Top-of-Rack (ToR) switches strip overlay/VLAN tags when handing off raw bare-metal server access ports.",
    },
  },
  {
    eventType: "router-on-a-stick-routing",
    beginner: {
      whatHappened:
        "PC 1 in VLAN 10 wanted to talk to PC 2 in VLAN 20. Because VLANs isolate traffic, PC 1 sent the packet to its Default Gateway (the Router). The router received it on sub-interface Gi0/0.10, routed it at Layer 3, and sent it back out on sub-interface Gi0/0.20 with a VLAN 20 tag!",
      whyItHappened:
        "Layer 2 switches cannot bridge between different VLANs. Passing traffic from one VLAN to another requires a Layer 3 Router to inspect IP addresses and route packets across subnets.",
      protocolRule:
        "Inter-VLAN communication requires Layer 3 routing. In 'Router-on-a-Stick' (ROAS), a single physical trunk cable connects the switch to the router, utilizing virtual sub-interfaces.",
      fieldsChanged: ["ip.ttl", "ethernet.sourceMac", "ethernet.destMac", "dot1q.vlanId"],
      whatHappensNext:
        "Switch receives the newly tagged VLAN 20 frame from the router and forwards it to PC 2's port in VLAN 20.",
      misconception:
        "A router needs a separate physical cable plugged into the switch for every single VLAN. (With 802.1Q sub-interfaces, 1 physical cable handles dozens of VLANs).",
      realWorldUse:
        "Widely used in small-to-medium enterprise networks and branch offices to connect segmented departments without buying expensive multi-port routers.",
    },
    advanced: {
      whatHappened:
        "Ingress frame tagged VID 10 arrived on Router physical port Gi0/0. Router demuxed frame to logical sub-interface Gi0/0.10 (`encapsulation dot1Q 10`). Router decapsulated L2 header, decremented IP TTL (64 -> 63), did route lookup for 192.168.20.10, rewritten Source MAC to Gi0/0.20 MAC, rewritten Dest MAC to PC 2 MAC, encapsulated with VID 20 tag, and transmitted back over the same physical link (hairpinning).",
      whyItHappened:
        "Logical router sub-interfaces act as Layer 3 default gateways for their respective subnets (`192.168.10.1/24` and `192.168.20.1/24`).",
      protocolRule:
        "RFC 1812 (Requirements for IP Version 4 Routers) & IEEE 802.1Q: Standard IP routing procedures apply across virtual sub-interfaces.",
      fieldsChanged: ["ip.ttl", "ip.checksum", "ethernet.smac", "ethernet.dmac", "dot1q.vid"],
      whatHappensNext:
        "Switch ingress ASIC receives VID 20 frame on trunk port and routes it to access port Fa0/2.",
      misconception:
        "ROAS scales infinitely. (Because ingress and egress traffic share the same physical trunk link, ROAS creates a 'one-armed router' bandwidth bottleneck for heavy inter-VLAN workloads).",
      realWorldUse:
        "Used extensively in enterprise WAN edges, pfSense / OPNsense / Cisco ISR firewall deployments, and DMZ isolation.",
    },
  },
  {
    eventType: "l3-switch-svi-routing",
    beginner: {
      whatHappened:
        "Traffic between VLAN 10 and VLAN 20 was routed directly INSIDE the Layer 3 switch using Switched Virtual Interfaces (SVIs), without ever needing to leave the switch to an external router!",
      whyItHappened:
        "Layer 3 Switches combine the high port density of a switch with the routing brains of a router, routing traffic between VLANs at lightning-fast wire speeds.",
      protocolRule:
        "Layer 3 Switch SVI (`interface Vlan 10`, `interface Vlan 20`) provides an internal virtual gateway IP for each VLAN on the switch backplane.",
      fieldsChanged: ["ip.ttl", "ethernet.sourceMac", "ethernet.destMac"],
      whatHappensNext:
        "The packet is rewritten and handed directly to the destination access port in VLAN 20 with zero external trunk bottleneck.",
      misconception:
        "Layer 3 switches and routers do the exact same thing. (L3 switches route in specialized hardware ASICs at wire-speed for local LANs, while routers handle complex WAN features like NAT, BGP, and VPNs).",
      realWorldUse:
        "Standard architecture in modern enterprise campuses and data centers (Cisco Catalyst, Arista, Juniper EX).",
    },
    advanced: {
      whatHappened:
        "Multi-layer switch ASIC performed hardware CEF (Cisco Express Forwarding) / TCAM table lookup. Packet routed between internal SVIs (`interface Vlan 10` -> `interface Vlan 20`) at line-rate.",
      whyItHappened:
        "TCAM (Ternary Content Addressable Memory) resolves Layer 3 longest-prefix match and Layer 2 rewrite in a single clock cycle, eliminating CPU interrupts.",
      protocolRule:
        "IEEE 802.1Q / Multilayer Switching: Internal routing bus performs MAC rewrite and TTL decrement directly on the internal switching fabric.",
      fieldsChanged: ["tcam.lookup", "ip.ttl", "ethernet.smac", "ethernet.dmac"],
      whatHappensNext:
        "Egress access port Fa0/2 transmits standard untagged frame to Sales-DB server.",
      misconception:
        "SVIs require physical interface assignments. (An SVI is a purely logical Layer 3 interface that remains up as long as at least one physical port in that VLAN is active).",
      realWorldUse:
        "Core and Distribution switches in enterprise networks route hundreds of gigabits per second across thousands of user VLANs using SVIs and ECMP.",
    },
  },
  {
    eventType: "vlan-hopping-mitigation",
    beginner: {
      whatHappened:
        "A rogue attacker attempted a 'Double Tagging VLAN Hopping Attack' by sending a packet with two VLAN tags (Outer = Native VLAN 1, Inner = Target VLAN 20). Switch 1 stripped the outer tag, and Switch 2 delivered the inner packet directly into VLAN 20, bypassing security!",
      whyItHappened:
        "Because Native VLAN traffic is transmitted untagged on trunk links, Switch 1 removes the outer Native tag and sends the frame onto the trunk. Switch 2 sees the remaining inner tag (VLAN 20) and forwards it to the victim!",
      protocolRule:
        "Security Best Practice: To prevent Double Tagging VLAN Hopping, set the Native VLAN on all trunks to an unused dummy VLAN (e.g., VLAN 999) and enable `vlan dot1q tag native`.",
      fieldsChanged: ["security.alert", "attacker.doubleTag"],
      whatHappensNext:
        "Network engineers secure the network by changing the Native VLAN away from default VLAN 1 and disabling auto-trunk negotiation (DTP).",
      misconception:
        "VLANs alone provide 100% security without proper configuration. (Default out-of-the-box switch configurations with Native VLAN 1 are vulnerable to VLAN hopping).",
      realWorldUse:
        "Standard hardening checklist item for Cisco, Juniper, and DoD DISA STIG network security compliance.",
    },
    advanced: {
      whatHappened:
        "Attacker on access port (PVID 1) crafted an 802.1Q frame containing two 4-byte tags (`0x8100 0001` + `0x8100 0014`). Switch 1 treated the outer tag as Native VLAN 1, stripped it on trunk egress, and forwarded the inner tag (`VID 20`) onto the trunk. Switch 2 parsed the inner tag and switched the frame into VLAN 20.",
      whyItHappened:
        "Exploits asymmetric tag processing in 802.1Q trunks where native VLAN egress untagging exposes inner encapsulated tags.",
      protocolRule:
        "Cisco Security Advisories & NIST SP 800-115: Mitigate by: 1. Configuring an explicit, unassigned Native VLAN ID (e.g. VLAN 999), 2. Enabling `vlan dot1q tag native`, 3. Disabling DTP (`switchport nonegotiate`).",
      fieldsChanged: ["frame.innerTag", "switch2.vlanMembership"],
      whatHappensNext:
        "Target host receives unauthorized unidirectional frame (return traffic cannot hop back).",
      misconception:
        "Double tagging allows full bidirectional two-way communication. (It is unidirectional only, but dangerous for launching blind UDP/TCP attacks or poisoning victim ARP caches).",
      realWorldUse:
        "Tested in penetration testing and cyber security audits to test Layer 2 switch hardening.",
    },
  },
];

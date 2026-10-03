import type { ExplanationSection } from "@/features/protocols/shared/protocol-types";

export const ISIS_EXPLANATION_SECTIONS: ExplanationSection[] = [
  {
    eventType: "ISIS_IIH_ADJACENCY",
    beginner: {
      whatHappened:
        "Neighbor Discovery: Routers exchange IS-IS Hello (IIH) packets to establish a direct link-state adjacency.",
      whyItHappened:
        "Before exchanging topology information, routers must discover who is on the other end of the cable and verify matching Area IDs and interface parameters.",
      protocolRule:
        "IS-IS uses Point-to-Point IIH (PDU Type 17) or LAN IIH (PDU Type 15/16) carrying Area Address TLV 1 and Hostname TLV 137.",
      fieldsChanged: [
        "PDU Type: 17 (P2P IIH)",
        "Adjacency State: UP",
        "Circuit Type: Level 1 / Level 2",
      ],
      whatHappensNext:
        "Once adjacency reaches the 'Up' state, the routers synchronize their Link State Databases (LSDB).",
      realWorldUse:
        "Forms the backbone of carrier ISP core networks (AT&T, Verizon, Lumen, NTT) and large-scale cloud data centers.",
    },
    advanced: {
      whatHappened:
        "RFC 5303 3-Way Handshake & IS-IS Adjacency Formation directly over Layer 2 (LLC SAP 0xFEFE).",
      whyItHappened:
        "IS-IS operates natively at the Data-Link layer (OSI Network Sublayer) without requiring an IP protocol stack. Routers exchange IIH PDUs with System IDs and Area Addresses.",
      protocolRule:
        "ISO/IEC 10589 §8.2: Level 1 adjacencies require identical Area IDs; Level 2 adjacencies can span different Area IDs.",
      fieldsChanged: [
        "Circuit State: 3-Way UP",
        "Neighbor System ID: Bound",
        "Holding Timer: 30s",
      ],
      whatHappensNext:
        "Routers initiate Link State PDU (LSP) exchange using CSNP/PSNP synchronization.",
      realWorldUse:
        "Zero-IP dependency routing: allows network engineers to bring up routing before assigning interface IPv4/IPv6 addresses.",
    },
  },
  {
    eventType: "ISIS_L1_L2_HIERARCHY",
    beginner: {
      whatHappened:
        "2-Level Hierarchy: Local area routers (Level 1) talk only to each other, while backbone routers (Level 2) connect all different areas together.",
      whyItHappened:
        "Dividing a huge network into Level 1 (regional towns) and Level 2 (highways) prevents routers from being overwhelmed by millions of route calculations.",
      protocolRule:
        "Level 1 routers know only their own Area. Level 2 routers form a contiguous backbone connecting all areas.",
      fieldsChanged: [
        "L1 LSDB: Synchronized Intra-Area",
        "L2 LSDB: Synchronized Inter-Area Backbone",
        "Border Router: Maintains Dual Databases",
      ],
      whatHappensNext:
        "L1/L2 border routers summarize reachability between the two levels.",
      realWorldUse:
        "Global Tier-1 ISPs use Level 2 across continental backbones and Level 1 inside regional metro aggregation rings.",
    },
    advanced: {
      whatHappened:
        "Hierarchical Link State Database (LSDB) Segmentation into Level 1 (Intra-Area) and Level 2 (Inter-Area).",
      whyItHappened:
        "Level 1 routers maintain a complete Shortest Path Tree (SPT) for internal Area prefixes. Level 2 routers maintain a separate backbone SPT. Border routers (L1/L2) run two independent Dijkstra SPF computations.",
      protocolRule:
        "ISO/IEC 10589: The Level 2 backbone must be physically contiguous; Level 1 areas attach at boundary L1/L2 Intermediate Systems.",
      fieldsChanged: [
        "L1 LSDB: SystemID.00-00 LSPs",
        "L2 LSDB: Backbone LSPs",
        "SPF Trees: 2 Independent Graphs",
      ],
      whatHappensNext:
        "L1/L2 border routers evaluate inter-area connectivity and signal Attached Bit (ATT) state.",
      realWorldUse:
        "Massive scalability: allows networks to scale to 5,000+ routers without SPF calculation timeouts.",
    },
  },
  {
    eventType: "ISIS_ATT_BIT_DEFAULT_ROUTE",
    beginner: {
      whatHappened:
        "Attached Bit (ATT=1): Border router turns on a green light saying: 'I have a highway ramp to the rest of the world!'",
      whyItHappened:
        "Level 1 routers don't need to know every single website or IP outside their area. They simply send all outside traffic to the nearest border router with ATT=1.",
      protocolRule:
        "When an L1/L2 router has connectivity to other areas, it sets ATT=1 in its L1 LSP. L1 routers automatically install a default route (0.0.0.0/0).",
      fieldsChanged: [
        "L1 LSP Flags: ATT=1",
        "L1 Routing Table: + 0.0.0.0/0 via L1/L2 Border",
        "Default Gateway: Programmed",
      ],
      whatHappensNext:
        "All outgoing traffic from the local area flows smoothly to the border router.",
      realWorldUse:
        "Keeps local regional router routing tables tiny and lightning-fast.",
    },
    advanced: {
      whatHappened:
        "Dynamic Default Route Generation via RFC 1195 / ISO 10589 Attached Bit (ATT-Bit) Signaling.",
      whyItHappened:
        "An L1/L2 border router with at least one active Level 2 adjacency in a different Area sets the `ATT=1` bit in its transmitted Level 1 Link State PDU. Receiving Level 1-only Intermediate Systems detect `ATT=1` and insert a default route (`0.0.0.0/0` with Metric = SPF distance to that L1/L2 router).",
      protocolRule:
        "ISO/IEC 10589 §7.2.9.2: Level 1 router selects the closest L1/L2 router with ATT=1 as its default gateway for inter-area traffic.",
      fieldsChanged: [
        "LSP Header Flags: 0x08 (ATT=1)",
        "RIB State: Default Route 0.0.0.0/0 installed",
        "Next-Hop: Nearest L1/L2 Border Router",
      ],
      whatHappensNext:
        "Transit packets destined for foreign areas are forwarded towards the L1/L2 boundary node.",
      realWorldUse:
        "Core design pattern in service provider aggregation networks to isolate routing table churn.",
    },
  },
  {
    eventType: "ISIS_DIS_PSEUDONODE_ELECTION",
    beginner: {
      whatHappened:
        "DIS Supervisor Election: Routers on a shared switch vote for a leader (Designated IS) to prevent broadcast chaos.",
      whyItHappened:
        "If 5 routers on the same switch talked to each other in pairs, they'd waste time sending duplicate messages. The DIS represents the virtual switch ('Pseudonode').",
      protocolRule:
        "The router with highest Priority (0-127, default 64), or highest MAC address, becomes DIS. DIS is pre-emptible immediately.",
      fieldsChanged: [
        "DIS Role: Elected (R2 Priority 100)",
        "Pseudonode LSP: 0000.0000.0002.01-00",
        "CSNP Interval: 10s Multicast",
      ],
      whatHappensNext:
        "The DIS emits a single Pseudonode LSP representing all connected routers, reducing link state complexity from $O(N^2)$ to $O(N)$.",
      realWorldUse:
        "Ethernet IXPs, data center spine-leaf fabrics, and enterprise switch cores.",
    },
    advanced: {
      whatHappened:
        "Designated Intermediate System (DIS) Election & Pseudonode Link State PDU Generation (ISO/IEC 10589 §7.2.3).",
      whyItHappened:
        "On multi-access broadcast LANs, IS-IS elects a DIS based on highest interface priority (0-127), breaking ties with the highest SNPA (MAC address). Unlike OSPF DR/BDR, there is NO Backup DIS (BDIS), and election is deterministic & pre-emptible.",
      protocolRule:
        "ISO/IEC 10589: DIS generates Pseudonode LSP (SystemID.01-00) and multicasts periodic Complete Sequence Number PDUs (CSNPs) to 01-80-C2-00-00-14/15 every 10 seconds.",
      fieldsChanged: [
        "DIS Status: ACTIVE",
        "Pseudonode ID: 0000.0000.0002.01",
        "Periodic CSNP: Armed (10s)",
      ],
      whatHappensNext:
        "Non-DIS routers inspect CSNPs and issue Partial Sequence Number PDUs (PSNPs) to request any missing LSPs.",
      realWorldUse:
        "Optimizes multi-access Ethernet LAN convergence and database synchronization efficiency.",
    },
  },
  {
    eventType: "ISIS_ROUTE_LEAKING_UP_DOWN",
    beginner: {
      whatHappened:
        "Route Leaking with Up/Down Bit: Specific foreign network paths are taught to Level 1 routers with a special 'Down' tag.",
      whyItHappened:
        "Without route leaking, Level 1 routers only have a generic default route and might pick the wrong border router, taking a slow detour. Leaking teaches them the exact best path.",
      protocolRule:
        "RFC 2966: Leaked routes have the Up/Down (U/D) bit set to 1. Level 1 routers use the route, but will NEVER leak it back up into Level 2, preventing loops.",
      fieldsChanged: [
        "TLV 135: U/D Bit = 1 (Down)",
        "L1 RIB: Specific Inter-Area Prefix Installed",
        "Suboptimal Routing: Eliminated",
      ],
      whatHappensNext:
        "Traffic takes the exact shortest path across the network instead of a blind default detour.",
      realWorldUse:
        "Prevents asymmetric and suboptimal routing in multi-homed ISP and cloud networks.",
    },
    advanced: {
      whatHappened:
        "RFC 2966 Domain-Wide Prefix Distribution (Route Leaking) with Up/Down (U/D) Bit Loop Avoidance.",
      whyItHappened:
        "In a multi-homed L1 area with two border routers (L1/L2-A and L1/L2-B), blind default routing can lead to severe suboptimal paths. An L1/L2 router leaks specific Level 2 prefixes into Level 1 Extended IP Reachability TLV 135 with the `U/D bit = 1`.",
      protocolRule:
        "RFC 2966 Section 4: If an L1/L2 router receives an L1 LSP containing a prefix with U/D=1, it MUST NOT advertise that prefix back into Level 2.",
      fieldsChanged: [
        "TLV 135 Flags: 0x80 (Up/Down Bit Set)",
        "L1 SPF Result: Optimal next-hop selected",
        "Loop Freedom: Guaranteed by U/D Bit",
      ],
      whatHappensNext:
        "Level 1 FIBs install longest-prefix match entries pointing to the optimal border gateway.",
      realWorldUse:
        "Standard ISP best practice for traffic engineering and MPLS/SR LDP reachability across multi-area domains.",
    },
  },
  {
    eventType: "ISIS_DUAL_STACK_IPV4_IPV6",
    beginner: {
      whatHappened:
        "Dual-Stack IS-IS: A single protocol instance routes both IPv4 and IPv6 traffic at the exact same time!",
      whyItHappened:
        "Because IS-IS runs directly on the Ethernet cable (not inside IP), it easily carries both IPv4 addresses (TLV 135) and IPv6 addresses (TLV 236) in the same message.",
      protocolRule:
        "RFC 5308 specifies IPv6 Reachability TLV 236 for Integrated IS-IS dual-stack routing.",
      fieldsChanged: [
        "TLV 135: IPv4 Prefixes",
        "TLV 236: IPv6 Prefixes (2001:db8::/64)",
        "Dual FIB: IPv4 & IPv6 Forwarding Programmed",
      ],
      whatHappensNext:
        "Both IPv4 and IPv6 packets travel across the network seamlessly with zero extra protocol overhead.",
      realWorldUse:
        "Universal choice for 5G telecommunication backbones and modern dual-stack cloud networks.",
    },
    advanced: {
      whatHappened:
        "Integrated IS-IS Multi-Topology Routing (RFC 1195 / RFC 5308 / RFC 5120).",
      whyItHappened:
        "Integrated IS-IS utilizes the Type-Length-Value (TLV) extensible payload model to encode both IPv4 (TLV 135 Extended IP Reachability) and IPv6 (TLV 236 IPv6 Reachability) within standard Link State PDUs over OSI Protocol 0x83.",
      protocolRule:
        "RFC 5308: TLV 236 carries 128-bit IPv6 prefixes, 32-bit metric, and distribution flags (U/D and external).",
      fieldsChanged: [
        "NLPID: 0xCC (IPv4) & 0x8E (IPv6)",
        "TLV 236: IPv6 Prefix Dissemination",
        "FIB Tables: Simultaneous dual-stack population",
      ],
      whatHappensNext:
        "Routers forward IPv4 and IPv6 datagrams using the same deterministic Link-State topology graph.",
      realWorldUse:
        "Massive operational simplicity compared to running separate OSPFv2 and OSPFv3 protocol instances.",
    },
  },
  {
    eventType: "ISIS_OVERLOAD_BIT_MAINTENANCE",
    beginner: {
      whatHappened:
        "Overload Bit (OL-Bit) Maintenance Mode: A router announces: 'I am doing maintenance — do not use me as a shortcut!'",
      whyItHappened:
        "If a core router needs a software update or reboot, turning on the Overload bit tells all neighbor routers to route traffic around it immediately without dropping any packets.",
      protocolRule:
        "When OL=1, other routers treat this router's transit cost as Infinite, but still deliver packets destined directly to this router's own subnets.",
      fieldsChanged: [
        "LSP Flags: OL=1 (Overload)",
        "Transit Traffic: Rerouted around R3",
        "Packet Loss: 0%",
      ],
      whatHappensNext:
        "Engineers safely perform maintenance, reboot, or upgrade without causing any network outage.",
      realWorldUse:
        "Used for zero-downtime maintenance, BGP warm-up convergence, and link flap protection.",
    },
    advanced: {
      whatHappened:
        "ISO/IEC 10589 §7.2.8.1 Set-Overload-Bit (OL-Bit / Set-Overload-Bit) Traffic Divergence.",
      whyItHappened:
        "When an operator activates `set-overload-bit` (or upon initial boot before BGP peers establish), the router sets the `OL=1` flag in its LSP. Neighboring routers executing Dijkstra SPF will not use this node as an intermediate transit hop for any shortest path calculations, while local leaf routes remain fully reachable.",
      protocolRule:
        "ISO/IEC 10589: Routers must never calculate paths through a node with the Overload bit set unless the destination is directly attached to that node.",
      fieldsChanged: [
        "LSP Header: OL-Bit = 1",
        "Dijkstra SPF: Transit paths pruned",
        "Topology State: Gracefully Rerouted",
      ],
      whatHappensNext:
        "Transit traffic shifts immediately to backup paths with zero packet loss before the node is taken offline.",
      realWorldUse:
        "Essential CI/CD zero-downtime automated maintenance in hyper-scale cloud backbones.",
    },
  },
];

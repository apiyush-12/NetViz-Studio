import type { ExplanationSection } from "@/features/protocols/shared/protocol-types";

export const RIP_EXPLANATION_SECTIONS: ExplanationSection[] = [
  {
    eventType: "RIP_PERIODIC_UPDATE",
    beginner: {
      whatHappened:
        "Routers periodic broadcast: Every router announces its known destinations to its immediate neighbors.",
      whyItHappened:
        "RIP routers must broadcast their full routing table every 30 seconds so neighboring routers stay informed of available paths.",
      protocolRule:
        "RFC 2453: Routers send periodic unsolicited Response messages every 30 seconds to UDP port 520 (224.0.0.9).",
      fieldsChanged: [
        "Command: 2 (Response)",
        "Version: 2",
        "Dest IP: 224.0.0.9 (RIPv2 Multicast)",
        "UDP Port: 520",
      ],
      whatHappensNext:
        "Neighbor routers receive the list, add +1 hop to each route, and update their local routing tables.",
      realWorldUse:
        "Basic automatic route discovery in small-to-medium enterprise networks and campus labs.",
    },
    advanced: {
      whatHappened:
        "Periodic RFC 2453 Unsolicited Response Generation over UDP Port 520 with Multicast 224.0.0.9.",
      whyItHappened:
        "The periodic 30-second RIP update timer expired. The router iterates over its RIB (Routing Information Base), formats RTEs (Route Table Entries), applies Split Horizon filtering, and sends a UDP datagram to all-RIP-routers multicast 224.0.0.9.",
      protocolRule:
        "RFC 2453 §3.4.1: Every 30 seconds, an unsolicited response is sent to all active RIP interfaces.",
      fieldsChanged: [
        "Command: 2 (Response)",
        "Version: 2",
        "AFI: 2 (IP)",
        "Metric: Hop counts (1-15)",
      ],
      whatHappensNext:
        "Receiving neighbors evaluate each RTE using the Bellman-Ford equation $D_x(y) = \\min_v \\{ c(x,v) + D_v(y) \\}$.",
      realWorldUse:
        "Distance-vector routing table synchronization in legacy branch offices and embedded network devices.",
    },
  },
  {
    eventType: "RIP_BELLMAN_FORD_RELAXATION",
    beginner: {
      whatHappened:
        "Router learns a new destination from its neighbor and calculates the distance as: Neighbor's Hops + 1.",
      whyItHappened:
        "The router received a list of networks. It added 1 hop for crossing the wire to the neighbor, and installed the best path in its routing table.",
      protocolRule:
        "Distance-Vector Bellman-Ford: A router increments incoming hop counts by 1. Max allowed hops is 15 (16 is unreachable).",
      fieldsChanged: [
        "Route Prefix: Installed",
        "Next-Hop: Neighbor IP",
        "Metric: Learned Hops + 1",
        "Admin Distance: 120",
      ],
      whatHappensNext:
        "The router will advertise this newly learned network to its other connected neighbors during the next broadcast.",
      realWorldUse:
        "Foundation of all distance-vector algorithms (RIP, IGRP, Cisco EIGRP composite metric).",
    },
    advanced: {
      whatHappened:
        "Bellman-Ford Metric Relaxation & Routing Table Entry (RTE) Installation.",
      whyItHappened:
        "For each incoming Route Table Entry (RTE), the receiving router calculates `newMetric = min(16, entry.metric + 1)`. If the network is not in the RIB or if the learned metric is lower than the existing route, the RIB is updated with `AdminDistance=120`, `NextHop=SenderIP`, and `Metric=newMetric`.",
      protocolRule:
        "RFC 2453 §3.9.2: If metric <= 15 and strictly better than existing entry, adopt the new route.",
      fieldsChanged: [
        "RIB State: New FIB entry",
        "Admin Distance: 120 (RIP)",
        "Next-Hop: Updated",
        "Age Timer: Reset to 0s",
      ],
      whatHappensNext:
        "FIB hardware forwarding planes program the new egress interface for matching IP datagrams.",
      realWorldUse:
        "Dynamic shortest path computation based purely on hop count metrics.",
    },
  },
  {
    eventType: "RIP_SPLIT_HORIZON",
    beginner: {
      whatHappened:
        "Split Horizon Rule: 'Don't tell a friend about a secret you just heard from that exact same friend!'",
      whyItHappened:
        "If Router 2 learned how to reach Network A from Router 1, Router 2 should never advertise Network A back to Router 1. Doing so would create an infinite feedback loop.",
      protocolRule:
        "Split Horizon suppresses advertising a route back out the same interface through which it was learned.",
      fieldsChanged: [
        "Split Horizon: Filtered reverse route",
        "Loop Prevented: Yes",
      ],
      whatHappensNext:
        "The neighbor receives only the routes that it didn't teach the sender, maintaining clean loop-free tables.",
      realWorldUse:
        "Universal distance-vector loop prevention mechanism across RIP and EIGRP.",
    },
    advanced: {
      whatHappened:
        "RFC 2453 Section 3.4.3 Split Horizon Route Suppression.",
      whyItHappened:
        "When formulating an outbound RIP Response datagram for interface $I$, the router inspects the ingress interface of each route in the RIB. Any route whose egress interface matches $I$ is excluded from the transmission.",
      protocolRule:
        "RFC 2453 §3.4.3: It is never useful to send information about a route back in the direction from which it came.",
      fieldsChanged: [
        "Outbound RTEs: Reverse routes pruned",
        "Split Horizon: ACTIVE",
      ],
      whatHappensNext:
        "Prevents 2-node mutual routing loops immediately without waiting for timeout timers.",
      realWorldUse:
        "Essential safeguard preventing instantaneous feedback loops in distance-vector topologies.",
    },
  },
  {
    eventType: "RIP_POISON_REVERSE",
    beginner: {
      whatHappened:
        "Poison Reverse: Instead of keeping silent, the router explicitly shouts: 'Don't ask me for this path — to me it is 16 hops away (Infinite)!'",
      whyItHappened:
        "Advertising a metric of 16 (Infinity) explicitly confirms to the neighbor that this router cannot act as a backup path for that network.",
      protocolRule:
        "Poison Reverse sets the metric to 16 (Infinity) on the interface where the route was learned.",
      fieldsChanged: [
        "Advertised Metric: 16 (Infinity / Poison)",
        "Poison Reverse: ACTIVE",
      ],
      whatHappensNext:
        "The neighbor explicitly notes that this router has no alternative path, preventing ambiguous route loops.",
      realWorldUse:
        "Cisco default RIP configuration: `split-horizon with poison-reverse` on serial and Ethernet interfaces.",
    },
    advanced: {
      whatHappened:
        "Split Horizon with Poisoned Reverse Metric (16 / Inaccessible) Generation.",
      whyItHappened:
        "Rather than omitting the route from the response, the router includes the RTE with `metric = 16`. This breaks any potential 3-node or multi-hop loops by actively poisoning reverse paths.",
      protocolRule:
        "RFC 2453 §3.4.3: Poison reverse advertises reverse routes with metric 16 (unreachable).",
      fieldsChanged: [
        "RTE IP: 192.168.1.0/24",
        "RTE Metric: 16 (Infinity)",
        "State: Explicit Poison",
      ],
      whatHappensNext:
        "Neighbor routers instantly recognize that this link is downstream and cannot provide transit redundancy.",
      realWorldUse:
        "Overcomes multi-access race conditions where simple split horizon might fail due to staggered update timers.",
    },
  },
  {
    eventType: "RIP_TRIGGERED_FLASH_UPDATE",
    beginner: {
      whatHappened:
        "Emergency Flash Update: A cable was cut, so the router immediately warned all neighbors without waiting for the 30-second timer.",
      whyItHappened:
        "Waiting up to 30 seconds for the next periodic broadcast would allow stale routes to cause black holes. The router instantly fires a 'Triggered Update' with Metric 16.",
      protocolRule:
        "Triggered Updates: Send an immediate Response message whenever a network interface goes DOWN or metric changes.",
      fieldsChanged: [
        "Trigger: Link CUT / State DOWN",
        "Update Type: Flash (0s delay)",
        "Metric: 16 (Poison)",
      ],
      whatHappensNext:
        "Neighbors immediately flush their stale entries and propagate the poison downstream.",
      realWorldUse:
        "Drastically accelerates convergence time from minutes down to milliseconds during network outages.",
    },
    advanced: {
      whatHappened:
        "RFC 2453 §3.10 Triggered (Flash) Update Execution with Holddown Timer Activation.",
      whyItHappened:
        "Interface link-carrier loss detected (`LINK_DOWN`). The kernel marks the associated route as `state=poisoned, metric=16` and triggers an asynchronous UDP Response containing only the modified RTEs with a random jitter timer (1-5s) to avoid broadcast storms.",
      protocolRule:
        "RFC 2453 §3.10: Triggered updates must be sent whenever a router changes the metric for a route.",
      fieldsChanged: [
        "Link Status: DOWN",
        "RTE Metric: 16",
        "Triggered Flag: TRUE",
        "Holddown Timer: Started (180s)",
      ],
      whatHappensNext:
        "Adjacent nodes invalidate their next-hop pointers and initiate holddown suppression.",
      realWorldUse:
        "Rapid distance-vector convergence under link flap conditions.",
    },
  },
  {
    eventType: "RIP_COUNT_TO_INFINITY",
    beginner: {
      whatHappened:
        "Count-to-Infinity Routing Loop: Two routers fool each other into thinking the other has a path, bouncing the hop counter higher and higher (1 -> 2 -> 3 ... -> 16).",
      whyItHappened:
        "Because Split Horizon was disabled, Router 2 told Router 3: 'I can reach the broken network in 2 hops!' Router 3 believed it and said: 'Then I can reach it in 3 hops!' They kept incrementing until hitting the maximum limit of 16.",
      protocolRule:
        "Without Split Horizon, broken links cause adjacent routers to form a ping-pong loop until Metric 16 is reached.",
      fieldsChanged: [
        "Metric Progression: 1 -> 2 -> 3 ... -> 16",
        "Loop State: Count-to-Infinity active",
        "Traffic: Dropped / Looping",
      ],
      whatHappensNext:
        "Packets bounce back and forth between the two routers until TTL expires. Once metric hits 16, the route is finally purged.",
      realWorldUse:
        "The quintessential networking lesson in computer science on why distance-vector protocols need Split Horizon and Holddown timers.",
    },
    advanced: {
      whatHappened:
        "Distance-Vector Mutual Deception Loop (Count-to-Infinity Phenomenon).",
      whyItHappened:
        "When link R3-R4 failed and Split Horizon was disabled, R2 still had a cached route to R4 via R3 (metric 2). R2 advertised this route back to R3. R3, having lost its direct link, accepted R2's advertisement as a new path with metric 3. In turn, R3 advertised metric 3 back to R2, which updated its metric to 4. This cycle repeats until metric reaches 16 (Infinity).",
      protocolRule:
        "RFC 1058: Maximum metric is capped at 15 to ensure Count-to-Infinity terminates at 16.",
      fieldsChanged: [
        "R2 Metric: Incremented",
        "R3 Metric: Incremented",
        "Loop Detected: TRUE",
        "Convergence Penalty: 16 * 30s = 8 minutes in real time",
      ],
      whatHappensNext:
        "Both routers consume bandwidth and CPU until hop count saturates at 16.",
      realWorldUse:
        "Illustrates the architectural rationale for Link-State protocols (OSPF Dijkstra SPF) and BGP AS-Path loop avoidance.",
    },
  },
  {
    eventType: "RIP_VLSM_TAG_DISSEMINATION",
    beginner: {
      whatHappened:
        "RIPv2 Subnet Mask & Route Tag: Router sends exact custom subnet sizes (/27, /30) and attaches a label identifying external routes.",
      whyItHappened:
        "Older RIPv1 was 'Classful' and assumed all subnets were standard /8, /16, or /24. RIPv2 adds a Subnet Mask field and Route Tag field (e.g. Tag 100 for BGP routes).",
      protocolRule:
        "RIPv2 (RFC 2453) supports Variable Length Subnet Masking (VLSM) and CIDR prefix aggregation.",
      fieldsChanged: [
        "Subnet Mask: 255.255.255.224 (/27)",
        "Route Tag: 0x0064 (BGP AS 100)",
        "CIDR Prefix: Exact match",
      ],
      whatHappensNext:
        "Neighbors install exact subnet masks without ambiguous classful assumptions.",
      realWorldUse:
        "Modern subnetting, IP address conservation, and route redistribution from OSPF/BGP into RIP.",
    },
    advanced: {
      whatHappened:
        "RFC 2453 Classless Route Table Entry (RTE) with Explicit Subnet Mask & 16-Bit Route Tag.",
      whyItHappened:
        "RIPv2 addresses the fatal limitations of RFC 1058 classful routing by transmitting a 32-bit subnet mask and a 16-bit Route Tag with every RTE. This allows discontinuous subnets, supernetting, and policy-based route filtering.",
      protocolRule:
        "RFC 2453 §3.4: Subnet mask allows classless routing. Route tag provides a method for separating internal RIP routes from external redistributed routes.",
      fieldsChanged: [
        "RTE Subnet Mask: 32-bit populated",
        "Route Tag: 16-bit external AS identifier",
        "Classless Forwarding: Enabled",
      ],
      whatHappensNext:
        "FIB installs longest-prefix match (LPM) entries matching exact subnets.",
      realWorldUse:
        "Enterprise route redistribution between autonomous systems and VLSM IP planning.",
    },
  },
  {
    eventType: "RIP_NEXT_HOP_OPTIMIZATION",
    beginner: {
      whatHappened:
        "Next-Hop Shortcut: Router R1 says: 'Send your packets directly to Router R2 — don't route through me!'",
      whyItHappened:
        "On a shared Wi-Fi or Ethernet switch where all routers share the same wire, R1 can specify R2's IP in the 'Next Hop' field so traffic avoids unnecessary extra hops.",
      protocolRule:
        "RIPv2 Next Hop field allows a router to redirect traffic to a more optimal neighbor on the same shared multi-access segment.",
      fieldsChanged: [
        "Next-Hop: 10.0.1.2 (R2)",
        "Advertiser: 10.0.1.1 (R1)",
        "Shortcut Activated: 1 Hop saved",
      ],
      whatHappensNext:
        "Sender routes directly to R2, eliminating double-packet traversal over the local Ethernet segment.",
      realWorldUse:
        "Shared Ethernet exchange points (IXPs) and DMVPN hub-and-spoke networks.",
    },
    advanced: {
      whatHappened:
        "RFC 2453 Next-Hop Field Redirection on Multi-Access Broadcast Networks.",
      whyItHappened:
        "When advertising a route on a multi-access network (e.g. Ethernet), if the optimal next-hop is a third router on that same subnet, the advertising router populates the `Next-Hop` field in the RTE with the third router's IP instead of `0.0.0.0`.",
      protocolRule:
        "RFC 2453 §3.4: The Next Hop field eliminates triangular routing on shared broadcast media.",
      fieldsChanged: [
        "RTE Next-Hop: 10.0.1.2",
        "FIB Next-Hop: Pointed directly to optimal gateway",
      ],
      whatHappensNext:
        "Receiving routers install the specified Next-Hop into their forwarding tables without changing the metric.",
      realWorldUse:
        "Optimizes multi-router multi-access broadcast segments and BGP-to-RIP route injection.",
    },
  },
];

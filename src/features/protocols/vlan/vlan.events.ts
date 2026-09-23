import type { SimulationEvent, Packet } from "@/features/simulation/simulation-types";
import type {
  VlanConfig,
  VlanNode,
  VlanLink,
  VlanSimulationStepState,
} from "./vlan.types";
import {
  createVlanFrame,
  tagFrame,
  stripTag,
} from "./vlan-engine";

export function buildVlanSimulationSequence(
  nodes: VlanNode[],
  links: VlanLink[],
  config: VlanConfig
): {
  events: SimulationEvent[];
  packets: Packet[];
  steps: VlanSimulationStepState[];
} {
  const steps: VlanSimulationStepState[] = [];
  const events: SimulationEvent[] = [];
  const packets: Packet[] = [];

  const addStep = (
    stepNumber: number,
    title: string,
    description: string,
    activeFrame: ReturnType<typeof createVlanFrame> | undefined,
    activeLinkIds: string[],
    broadcastLinkIds: string[],
    isolatedNodeIds: string[],
    explanation: VlanSimulationStepState["eventExplanation"]
  ) => {
    const stepState: VlanSimulationStepState = {
      step: stepNumber,
      title,
      description,
      nodes: JSON.parse(JSON.stringify(nodes)),
      links: JSON.parse(JSON.stringify(links)),
      activeFrame: activeFrame ? JSON.parse(JSON.stringify(activeFrame)) : undefined,
      activeLinkIds,
      broadcastLinkIds,
      isolatedNodeIds,
      eventExplanation: explanation,
    };
    steps.push(stepState);

    const pktId = `vlan-pkt-${stepNumber}`;
    const srcNode = activeFrame?.sourceIp || "host-1";
    const dstNode = activeFrame?.destIp || "switch-1";

    events.push({
      id: `vlan-evt-${stepNumber}`,
      timestamp: stepNumber * 500,
      sequenceNumber: stepNumber,
      type: "state-change",
      sourceNodeId: srcNode,
      destinationNodeId: dstNode,
      protocol: "VLAN",
      title,
      description,
      status: "completed",
      severity: "info",
      packetId: activeFrame ? pktId : undefined,
      metadata: {
        vlanId: activeFrame?.sourceVlanId,
        isTagged: activeFrame?.isTagged,
        dot1q: activeFrame?.dot1q,
      },
    });

    if (activeFrame) {
      packets.push({
        id: pktId,
        label: activeFrame.isTagged
          ? `802.1Q Tagged (VID ${activeFrame.dot1q?.vlanId})`
          : `Untagged Ethernet Frame (VLAN ${activeFrame.sourceVlanId})`,
        source: activeFrame.sourceMac,
        destination: activeFrame.destMac,
        protocol: activeFrame.isTagged ? "802.1Q" : "Ethernet II",
        size: activeFrame.isTagged ? 68 : 64,
        status: "delivered",
        colorKey: activeFrame.isTagged ? "amber" : "blue",
        createdAt: stepNumber * 100,
        headers: {
          ethernet: {
            sourceMac: activeFrame.sourceMac,
            destMac: activeFrame.destMac,
            etherType: activeFrame.isTagged ? "0x8100" : "0x0800",
          },
        },
        payload: activeFrame.payloadSummary,
      });
    }
  };

  const scenario = config.scenarioId;

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENARIO 1: Intra-VLAN Broadcast Confinement (Isolation)
  // ═══════════════════════════════════════════════════════════════════════════
  if (scenario === "intra_vlan_broadcast_isolation") {
    // Step 1: Eng-PC1 initiates ARP broadcast
    const frame1 = createVlanFrame({
      sourceMac: "00:1A:2B:10:00:01",
      destMac: "FF:FF:FF:FF:FF:FF",
      sourceIp: "192.168.10.10",
      destIp: "192.168.10.20",
      sourceVlanId: 10,
      payloadSummary: "ARP Request: Who has 192.168.10.20? Tell 192.168.10.10",
      isBroadcast: true,
    });

    addStep(
      1,
      "ARP Broadcast Generation in VLAN 10",
      "Host Eng-PC1 (VLAN 10) initiates an ARP Request broadcast to resolve Eng-PC2's MAC address.",
      frame1,
      ["link-pc1-sw1"],
      [],
      ["pc-3", "pc-4"],
      {
        beginner:
          "Eng-PC1 wants to communicate with Eng-PC2 on the 192.168.10.0/24 subnet. Because it doesn't know Eng-PC2's MAC address yet, it generates an ARP broadcast (Dest MAC: FF:FF:FF:FF:FF:FF).",
        advanced:
          "Standard Layer 2 ARP Request frame generated. Destination address set to broadcast FF:FF:FF:FF:FF:FF. Frame placed on Access Port Fa0/1 wire (untagged).",
        protocolRule:
          "RFC 826 & IEEE 802.3: Broadcast frames have destination address FF:FF:FF:FF:FF:FF and must be flooded to all members of the local Layer 2 broadcast domain.",
        fieldsChanged: ["destMac", "sourceIp", "targetIp"],
      }
    );

    // Step 2: Switch receives frame on Access Port Fa0/1 (PVID 10)
    addStep(
      2,
      "Switch Ingress PVID Association & CAM Learning",
      "Switch 1 receives untagged frame on Port Fa0/1, learns Source MAC on Fa0/1 in VLAN 10, and maps frame to VLAN 10 broadcast domain.",
      frame1,
      ["link-pc1-sw1"],
      [],
      ["pc-3", "pc-4"],
      {
        beginner:
          "Switch 1 looks up port Fa0/1's configuration and sees it is an Access Port assigned to VLAN 10. The switch records Eng-PC1's MAC in its MAC Table under VLAN 10.",
        advanced:
          "Switch ingress pipeline associates untagged frame with Port VLAN ID (PVID 10). Dynamic MAC learning updates CAM table: `[VLAN: 10, MAC: 00:1A:2B:10:00:01, Port: Fa0/1]`.",
        protocolRule:
          "IEEE 802.1Q Clause 8.6: Untagged frames entering an access port are implicitly classified with the port's configured PVID.",
        fieldsChanged: ["switch.camTable", "port.pvid"],
      }
    );

    // Step 3: Broadcast Flooding Confined Strictly to VLAN 10
    addStep(
      3,
      "Broadcast Flooded to VLAN 10 Ports (VLAN 20 Isolated)",
      "Switch floods broadcast ONLY to Port Fa0/2 (VLAN 10). Ports Fa0/3 and Fa0/4 (VLAN 20 Sales) are completely masked out and receive ZERO traffic!",
      frame1,
      ["link-pc2-sw1"],
      ["link-pc2-sw1"],
      ["pc-3", "pc-4"],
      {
        beginner:
          "Because PC3 and PC4 are in VLAN 20, the switch protects them from broadcast noise. Only PC2 in VLAN 10 receives the broadcast.",
        advanced:
          "VLAN Ingress/Egress Filtering masks the flood port bitmap to active members of VLAN 10 (Port Fa0/2). Ports Fa0/3 and Fa0/4 in VLAN 20 are excluded from the replication list.",
        protocolRule:
          "IEEE 802.1Q: Layer 2 broadcast boundaries strictly isolate distinct VLANs, eliminating cross-talk and broadcast storms.",
        fieldsChanged: ["switch.floodMask", "vlan.isolation"],
      }
    );

    // Step 4: Eng-PC2 Unicast ARP Reply
    const frame2 = createVlanFrame({
      sourceMac: "00:1A:2B:10:00:02",
      destMac: "00:1A:2B:10:00:01",
      sourceIp: "192.168.10.20",
      destIp: "192.168.10.10",
      sourceVlanId: 10,
      payloadSummary: "ARP Reply: 192.168.10.20 is at 00:1A:2B:10:00:02",
      isBroadcast: false,
    });

    addStep(
      4,
      "Eng-PC2 Unicast ARP Reply",
      "Eng-PC2 recognizes its IP, populates its ARP table, and transmits a Unicast ARP Reply to Switch 1.",
      frame2,
      ["link-pc2-sw1"],
      [],
      ["pc-3", "pc-4"],
      {
        beginner:
          "Eng-PC2 replies directly: 'I have that IP address! My MAC is 00:1A:2B:10:00:02.'",
        advanced:
          "Eng-PC2 transmits unicast ARP Reply (Opcode 2) destined for Eng-PC1 MAC. Frame enters Fa0/2 with PVID 10.",
        protocolRule:
          "RFC 826: ARP Reply is transmitted as a unicast frame directly to the requester's MAC address.",
        fieldsChanged: ["sourceMac", "destMac", "arpCache"],
      }
    );

    // Step 5: Unicast Delivery Complete
    addStep(
      5,
      "Direct Unicast Forwarding & Cache Completion",
      "Switch 1 looks up Eng-PC1 MAC in VLAN 10 CAM table and forwards reply directly to Port Fa0/1. Communication established!",
      frame2,
      ["link-pc1-sw1"],
      [],
      ["pc-3", "pc-4"],
      {
        beginner:
          "Eng-PC1 receives the reply and stores Eng-PC2's MAC in its ARP table. Devices within VLAN 10 can now communicate at full speed.",
        advanced:
          "Switch performs CAM lookup in VLAN 10 database, finds exact match on Port Fa0/1, and forwards without flooding. End-to-end Layer 2 intra-VLAN path verified.",
        protocolRule:
          "IEEE 802.1D / 802.1Q: Unicast frames with known destination MAC are forwarded point-to-point without flooding.",
        fieldsChanged: ["pc1.arpCache", "link.state"],
      }
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENARIO 2: 802.1Q Trunk Tagging & Egress Stripping
  // ═══════════════════════════════════════════════════════════════════════════
  else if (scenario === "trunk_8021q_tagging") {
    // Step 1: Eng-Bldg1 sends packet to Eng-Bldg2
    const frame1 = createVlanFrame({
      sourceMac: "00:1A:2B:10:00:01",
      destMac: "00:1A:2B:10:00:03",
      sourceIp: "192.168.10.10",
      destIp: "192.168.10.20",
      sourceVlanId: 10,
      payloadSummary: "ICMP Echo Request (Ping from Bldg 1 to Bldg 2)",
      isBroadcast: false,
    });

    addStep(
      1,
      "Untagged Transmission on Ingress Access Port",
      "Eng-Bldg1 transmits standard untagged Ethernet frame to Switch 1 on Access Port Fa0/1 (PVID 10).",
      frame1,
      ["link-pc1-sw1"],
      [],
      [],
      {
        beginner:
          "Eng-Bldg1 sends a standard ping packet. The PC doesn't know or care about VLAN tags — it just sends normal Ethernet data.",
        advanced:
          "Standard IEEE 802.3 Ethernet II frame enters Access Port Fa0/1. Ingress classifier stamps internal metadata with VLAN 10.",
        protocolRule:
          "IEEE 802.1Q: End-user workstations transmit standard untagged frames. Tagging is managed by the network infrastructure.",
        fieldsChanged: ["sourceMac", "destMac", "accessPort.pvid"],
      }
    );

    // Step 2: Switch 1 inserts 4-Byte 802.1Q Tag Header
    const taggedFrame = tagFrame(frame1, 10, 0, false);

    addStep(
      2,
      "802.1Q 4-Byte Header Tag Insertion on Trunk Port",
      "Switch 1 injects a 4-byte 802.1Q Tag (TPID: 0x8100, VID: 10, PCP: 0) into the frame before transmitting across the trunk link.",
      taggedFrame,
      ["link-sw1-sw2-trunk"],
      [],
      [],
      {
        beginner:
          "Because the trunk link connects multiple VLANs between buildings, Switch 1 stamps a 4-byte 'VLAN 10' tag into the frame header.",
        advanced:
          "Switch 1 egress engine inserts 32-bit 802.1Q header [TPID 0x8100 (2B)][TCI: PCP 0 (3b), DEI 0 (1b), VID 10 (12b)] between Source MAC and EtherType. Frame expands by 4 bytes.",
        protocolRule:
          "IEEE 802.1Q Section 9: 4-byte VLAN tag allows multiplexing up to 4,094 VLANs across a single physical 802.3 trunk interface.",
        fieldsChanged: ["frame.isTagged", "dot1q.tpid", "dot1q.vlanId", "frame.length"],
      }
    );

    // Step 3: Tagged Frame In-Flight Across Trunk Link
    addStep(
      3,
      "802.1Q Tagged Frame Transiting Fiber Trunk Link",
      "The tagged frame traverses the high-speed trunk link between Switch 1 and Switch 2 carrying VID 10 identifier.",
      taggedFrame,
      ["link-sw1-sw2-trunk"],
      [],
      [],
      {
        beginner:
          "The frame travels across the trunk cable. If anyone intercepted the packet on the trunk, they would see the 802.1Q tag indicating it belongs to VLAN 10.",
        advanced:
          "Trunk link multiplexes traffic for VLAN 10 and VLAN 20 simultaneously. Fiber transceivers maintain wire-speed transit with 802.1Q encapsulation intact.",
        protocolRule:
          "IEEE 802.1Q: Trunk ports multiplex frames from different VLANs without crosstalk by maintaining explicit VID tag encapsulation.",
        fieldsChanged: ["trunk.activeVlan", "link.throughput"],
      }
    );

    // Step 4: Switch 2 Ingress Trunk Tag Parsing
    addStep(
      4,
      "Switch 2 Trunk Ingress & Allowed List Verification",
      "Switch 2 receives tagged frame on Gi0/1, verifies VID 10 is in Trunk Allowed List [1, 10, 20, 30], and prepares for local delivery.",
      taggedFrame,
      ["link-sw1-sw2-trunk"],
      [],
      [],
      {
        beginner:
          "Switch 2 checks its trunk security rules: 'Is VLAN 10 allowed on this trunk?' Yes! Switch 2 finds that Eng-Bldg2 is connected to port Fa0/1.",
        advanced:
          "Switch 2 ingress parser validates TPID 0x8100, extracts VID 10, verifies membership in `switchport trunk allowed vlan`, and looks up destination MAC in VLAN 10 CAM table.",
        protocolRule:
          "IEEE 802.1Q: Trunk ports drop incoming tagged frames whose VID is not explicitly included in the allowed VLAN list.",
        fieldsChanged: ["switch2.camLookup", "trunk.allowedCheck"],
      }
    );

    // Step 5: Egress Tag Stripping & Host Delivery
    const strippedFrame = stripTag(taggedFrame);

    addStep(
      5,
      "Egress Tag Stripping & Clean Ethernet Delivery",
      "Switch 2 strips the 4-byte 802.1Q tag on Port Fa0/1 (Access Port). Eng-Bldg2 receives standard untagged Ethernet frame.",
      strippedFrame,
      ["link-sw2-pc3"],
      [],
      [],
      {
        beginner:
          "Switch 2 removes the tag so Eng-Bldg2 receives a normal, clean Ethernet packet without any errors.",
        advanced:
          "Access port Fa0/1 operates in untagged mode. Egress hardware ASIC strips the 4-byte 802.1Q header, recalculates FCS checksum, and delivers standard 1518-byte frame to host.",
        protocolRule:
          "IEEE 802.1Q Clause 8.8: Access ports must remove 802.1Q headers on egress to ensure compatibility with standard end-station NICs.",
        fieldsChanged: ["frame.isTagged", "frame.dot1q", "frame.fcs"],
      }
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENARIO 3: Router-on-a-Stick (Inter-VLAN ROAS)
  // ═══════════════════════════════════════════════════════════════════════════
  else if (scenario === "inter_vlan_router_on_a_stick") {
    // Step 1: PC1 sends cross-subnet packet to Default Gateway
    const frame1 = createVlanFrame({
      sourceMac: "00:1A:2B:10:00:01",
      destMac: "00:C0:00:AA:BB:10", // Router Gi0/0.10 MAC
      sourceIp: "192.168.10.10",
      destIp: "192.168.20.10",
      sourceVlanId: 10,
      destVlanId: 20,
      payloadSummary: "Cross-Subnet Packet: 192.168.10.10 -> 192.168.20.10 (to Default Gateway)",
      isBroadcast: false,
    });

    addStep(
      1,
      "Host Transmits to Default Gateway",
      "Eng-PC1 (192.168.10.10) evaluates destination 192.168.20.10, detects remote subnet, and forwards packet to Default Gateway (Router sub-interface Gi0/0.10).",
      frame1,
      ["link-pc1-sw1"],
      [],
      [],
      {
        beginner:
          "Eng-PC1 knows it cannot talk to Sales-PC2 directly because they are on different subnets (VLAN 10 vs VLAN 20). It sends the packet to its Default Gateway (the Router).",
        advanced:
          "Host applies subnet mask 255.255.255.0 to destination IP 192.168.20.10 (evaluates to remote network 192.168.20.0/24). Host encapsulates IP datagram with Router Gi0/0.10 gateway MAC.",
        protocolRule:
          "RFC 1122 & IEEE 802.1Q: Inter-subnet traffic must be forwarded to the designated Layer 3 default gateway for routing.",
        fieldsChanged: ["destMac", "sourceIp", "destIp"],
      }
    );

    // Step 2: Switch 1 tags with VID 10 and forwards across trunk to Router
    const taggedToRouter = tagFrame(frame1, 10);

    addStep(
      2,
      "Switch Tags with VID 10 & Forwards to Router",
      "Switch 1 receives packet on Access Port Fa0/1, injects 802.1Q tag (VID 10), and forwards it across the trunk link to the Router.",
      taggedToRouter,
      ["link-sw1-r1-trunk"],
      [],
      [],
      {
        beginner:
          "Switch 1 adds a 'VLAN 10' tag and sends the packet up the trunk cable to the router.",
        advanced:
          "Switch 1 trunk port Gi0/0 tags frame with VID 10 and forwards over the 802.1Q trunk interconnect to the router physical interface.",
        protocolRule:
          "IEEE 802.1Q: Router-on-a-Stick relies on 802.1Q tagged frames to demultiplex sub-interfaces on a single physical link.",
        fieldsChanged: ["frame.isTagged", "dot1q.vlanId"],
      }
    );

    // Step 3: Router Decapsulates, Routes, Rewrites L2 Header
    const routedFrame = tagFrame(
      createVlanFrame({
        sourceMac: "00:C0:00:AA:BB:20", // Router Gi0/0.20 MAC
        destMac: "00:1A:2B:20:00:02", // Sales-PC2 MAC
        sourceIp: "192.168.10.10",
        destIp: "192.168.20.10",
        sourceVlanId: 20,
        destVlanId: 20,
        payloadSummary: "Routed Inter-VLAN Packet (Rewritten for VLAN 20 / TTL Decremented)",
        ttl: 63,
      }),
      20
    );

    addStep(
      3,
      "Router Inter-VLAN Routing & Layer 2 Header Rewrite",
      "Router sub-interface Gi0/0.10 decapsulates L2, decrements TTL (64->63), routes to sub-interface Gi0/0.20, rewrites MAC addresses, and tags with VID 20.",
      routedFrame,
      ["link-sw1-r1-trunk"],
      [],
      [],
      {
        beginner:
          "The router acts as the bridge! It takes the packet from VLAN 10, lowers the TTL by 1, changes the tag to 'VLAN 20', and sends it back down the cable to Switch 1.",
        advanced:
          "Router Layer 3 routing engine executes route table lookup, decrements IPv4 TTL, recalculates IP header checksum, rewrites Source MAC to Gi0/0.20 MAC and Dest MAC to PC2 MAC, tags with VID 20, and hairpins frame onto trunk.",
        protocolRule:
          "RFC 1812: Router must decrement TTL, update checksum, and rewrite Layer 2 framing for the target egress subnet.",
        fieldsChanged: ["ip.ttl", "ethernet.sourceMac", "ethernet.destMac", "dot1q.vlanId"],
      }
    );

    // Step 4: Switch 1 receives VID 20 frame and forwards to VLAN 20 Access Port
    const finalFrame = stripTag(routedFrame);

    addStep(
      4,
      "Switch Delivers Untagged Frame to Sales-PC2 in VLAN 20",
      "Switch 1 receives VID 20 frame from router, matches destination on Port Fa0/2 (VLAN 20), strips the 802.1Q tag, and delivers packet to Sales-PC2.",
      finalFrame,
      ["link-pc2-sw1"],
      [],
      [],
      {
        beginner:
          "Switch 1 strips the VLAN 20 tag and delivers the packet directly to Sales-PC2. Inter-VLAN communication succeeded!",
        advanced:
          "Switch egress processor strips 802.1Q header on Access Port Fa0/2 (PVID 20) and delivers standard untagged frame to destination host. Complete ROAS transaction verified.",
        protocolRule:
          "IEEE 802.1Q & RFC 1812: Successful end-to-end routed communication across distinct VLAN broadcast domains.",
        fieldsChanged: ["frame.isTagged", "frame.dot1q"],
      }
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENARIO 4: Layer 3 Switch SVI Wire-Speed Routing
  // ═══════════════════════════════════════════════════════════════════════════
  else if (scenario === "inter_vlan_l3_svi") {
    // Step 1: Eng-PC1 sends packet to Sales-DB server
    const frame1 = createVlanFrame({
      sourceMac: "00:1A:2B:10:00:01",
      destMac: "00:AA:00:33:44:10", // L3 Switch SVI Vlan10 MAC
      sourceIp: "192.168.10.10",
      destIp: "192.168.20.50",
      sourceVlanId: 10,
      destVlanId: 20,
      payloadSummary: "Database Query: 192.168.10.10 -> 192.168.20.50 (to L3 Switch SVI)",
    });

    addStep(
      1,
      "Host Transmits to Switched Virtual Interface (SVI)",
      "Eng-PC1 transmits cross-VLAN packet to its local Default Gateway (Switched Virtual Interface `Vlan10` on the Layer 3 Switch).",
      frame1,
      ["link-pc1-l3sw"],
      [],
      [],
      {
        beginner:
          "Eng-PC1 sends its database request to the Layer 3 Switch's internal virtual router interface (SVI Vlan10).",
        advanced:
          "Frame enters Access Port Fa0/1 with PVID 10. Destination MAC matches internal SVI `interface Vlan 10` MAC address.",
        protocolRule:
          "Multilayer Switching: Switched Virtual Interfaces (SVIs) act as internal virtual default gateways for local VLANs directly on the switch backplane.",
        fieldsChanged: ["destMac", "sourceIp", "destIp"],
      }
    );

    // Step 2: Internal Wire-Speed ASIC SVI Routing
    const routedFrame = createVlanFrame({
      sourceMac: "00:AA:00:33:44:20", // L3 Switch SVI Vlan20 MAC
      destMac: "00:1A:2B:20:00:50", // Sales-DB MAC
      sourceIp: "192.168.10.10",
      destIp: "192.168.20.50",
      sourceVlanId: 20,
      destVlanId: 20,
      payloadSummary: "CEF/TCAM Wire-Speed Routed Frame (TTL 63)",
      ttl: 63,
    });

    addStep(
      2,
      "Hardware TCAM / CEF Line-Rate Inter-VLAN Routing",
      "Layer 3 switch ASIC routes packet between `Vlan10` and `Vlan20` SVIs internally in silicon at wire-speed with sub-microsecond latency.",
      routedFrame,
      ["link-pc2-l3sw"],
      [],
      [],
      {
        beginner:
          "Instead of sending traffic over a slow external router cable, the Layer 3 Switch routes the packet internally in hardware instantly!",
        advanced:
          "Hardware CEF (Cisco Express Forwarding) / TCAM table resolves route to 192.168.20.0/24, decrements IP TTL (64->63), rewrites Source MAC to `Vlan20` SVI and Dest MAC to Sales-DB MAC, and outputs to Port Fa0/2.",
        protocolRule:
          "Multilayer Switching Architecture: ASICs perform Layer 3 header rewrites and Layer 2 frame forwarding simultaneously at wire speed without CPU intervention.",
        fieldsChanged: ["ip.ttl", "ethernet.sourceMac", "ethernet.destMac", "tcam.lookup"],
      }
    );

    // Step 3: Server Delivery Complete
    addStep(
      3,
      "Server Receives Routed Query at Wire-Speed",
      "Sales-DB server receives untagged frame on Port Fa0/2 (VLAN 20) and processes database transaction with zero trunk bottlenecks.",
      routedFrame,
      ["link-pc2-l3sw"],
      [],
      [],
      {
        beginner:
          "The server in VLAN 20 receives the query cleanly and responds back through the SVI.",
        advanced:
          "End-to-end SVI routing complete. Provides order-of-magnitude higher throughput than Router-on-a-Stick architectures.",
        protocolRule:
          "IEEE 802.1Q & Multilayer Routing: SVI architecture eliminates one-armed router trunk congestion in high-density enterprise networks.",
        fieldsChanged: ["server.rxBytes", "link.latency"],
      }
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENARIO 5: Native VLAN Untagged Transit
  // ═══════════════════════════════════════════════════════════════════════════
  else if (scenario === "native_vlan_untagged") {
    const frame1 = createVlanFrame({
      sourceMac: "00:AA:00:11:22:01",
      destMac: "00:AA:00:11:22:02",
      sourceIp: "192.168.1.251",
      destIp: "192.168.1.252",
      sourceVlanId: 1, // Native VLAN
      payloadSummary: "Native VLAN 1 Management Frame (Untagged Transit over Trunk)",
      isTagged: false,
    });

    addStep(
      1,
      "Native VLAN 1 Frame Generation",
      "Switch 1 generates an untagged management frame destined for Switch 2 on Native VLAN 1.",
      frame1,
      ["link-sw1-sw2-trunk"],
      [],
      [],
      {
        beginner:
          "Switch 1 sends a network management frame on Native VLAN 1 across the trunk link.",
        advanced:
          "Control plane generates frame belonging to Native VLAN (PVID 1). Trunk egress engine evaluates native VLAN tagging policy.",
        protocolRule:
          "IEEE 802.1Q: Frames belonging to the configured Native VLAN traverse 802.1Q trunks untagged by default.",
        fieldsChanged: ["sourceMac", "destMac", "frame.vlanId"],
      }
    );

    addStep(
      2,
      "Untagged Transmission over 802.1Q Trunk Link",
      "Frame traverses the 802.1Q trunk link UNTAGGED (standard 14-byte Ethernet header without 4-byte 802.1Q tag).",
      frame1,
      ["link-sw1-sw2-trunk"],
      [],
      [],
      {
        beginner:
          "Notice that this packet has NO 802.1Q tag on the trunk! Native VLAN frames travel untagged for backwards compatibility.",
        advanced:
          "Trunk port Gi0/1 leaves Native VLAN 1 frames untagged. Frame length remains 1518 bytes. Maintains legacy hub/switch interoperability.",
        protocolRule:
          "IEEE 802.1Q Section 9: An 802.1Q trunk port transmits native VLAN frames without inserting the 4-byte TPID/TCI shim header.",
        fieldsChanged: ["frame.isTagged", "link.trunkMode"],
      }
    );

    addStep(
      3,
      "Switch 2 Native VLAN Association",
      "Switch 2 receives untagged frame on Trunk Port Gi0/1 and implicitly maps it to its local Native VLAN (VLAN 1).",
      frame1,
      ["link-sw1-sw2-trunk"],
      [],
      [],
      {
        beginner:
          "Switch 2 sees an untagged frame on its trunk port and automatically assigns it to its Native VLAN (VLAN 1).",
        advanced:
          "Switch 2 trunk parser classifies untagged ingress frame into local Port VLAN ID (Native VLAN 1). Frame delivered to management control plane.",
        protocolRule:
          "IEEE 802.1Q Clause 8.6: Any untagged frame arriving on an 802.1Q trunk port is assigned to that port's Native VLAN ID.",
        fieldsChanged: ["switch2.nativeVlan", "management.rx"],
      }
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENARIO 6: Double Tagging VLAN Hopping Attack & Mitigation
  // ═══════════════════════════════════════════════════════════════════════════
  else if (scenario === "vlan_hopping_attack") {
    // Step 1: Attacker crafts Double-Tagged frame
    const doubleTaggedFrame = createVlanFrame({
      sourceMac: "00:DE:AD:BE:EF:66",
      destMac: "00:1A:2B:20:00:99",
      sourceIp: "192.168.1.50",
      destIp: "192.168.20.10",
      sourceVlanId: 1, // Outer tag
      destVlanId: 20, // Inner tag
      payloadSummary: "[MALICIOUS] Double-Tagged Frame: [Outer: VID 1 (Native)][Inner: VID 20 (Victim)]",
      isTagged: true,
      isDoubleTagged: true,
      innerVlanId: 20,
      dot1q: {
        tpid: 0x8100,
        pcp: 0,
        dei: false,
        vlanId: 1, // Outer Native tag
      },
    });

    addStep(
      1,
      "Attacker Crafts Double-Tagged Frame [Outer: 1][Inner: 20]",
      "Rogue Attacker on Access Port Fa0/1 (PVID 1) crafts a malicious frame with TWO 802.1Q tags: Outer Tag = Native VLAN 1, Inner Tag = Target VLAN 20.",
      doubleTaggedFrame,
      ["link-atk-sw1"],
      [],
      [],
      {
        beginner:
          "The attacker uses a special hacking script to wrap the packet in two envelopes: an outer envelope stamped 'VLAN 1 (Native)' and an inner envelope stamped 'VLAN 20 (Target)'.",
        advanced:
          "Attacker transmits an 802.1Q frame containing stacked tags: `0x8100 0001` (Outer Native VID 1) followed by `0x8100 0014` (Inner Target VID 20).",
        protocolRule:
          "Security Vulnerability (VLAN Hopping / Double Tagging): Exploits the trunk native VLAN untagging behavior on upstream switches.",
        fieldsChanged: ["attacker.doubleTag", "frame.outerTag", "frame.innerTag"],
      }
    );

    // Step 2: Switch 1 strips Outer Native Tag on Trunk Egress
    const innerTaggedFrame = createVlanFrame({
      sourceMac: "00:DE:AD:BE:EF:66",
      destMac: "00:1A:2B:20:00:99",
      sourceIp: "192.168.1.50",
      destIp: "192.168.20.10",
      sourceVlanId: 20,
      payloadSummary: "[EXPOSED INNER TAG] 802.1Q Tagged (VID 20) Transiting Trunk",
      isTagged: true,
      dot1q: {
        tpid: 0x8100,
        pcp: 0,
        dei: false,
        vlanId: 20,
      },
    });

    addStep(
      2,
      "Switch 1 Strips Outer Native Tag & Exposes Inner Tag",
      "Switch 1 processes the outer tag as Native VLAN 1, strips it for trunk transmission, and inadvertently forwards the INNER tag (VID 20) onto the trunk link!",
      innerTaggedFrame,
      ["link-sw1-sw2-trunk"],
      [],
      [],
      {
        beginner:
          "Switch 1 sees the outer 'VLAN 1' tag. Because VLAN 1 is the Native VLAN on the trunk, Switch 1 removes the outer tag. This exposes the inner 'VLAN 20' tag onto the trunk cable!",
        advanced:
          "Switch 1 egress ASIC performs standard Native VLAN egress untagging, stripping the first 4-byte header. The remaining payload starting with `0x8100 0014` (Inner VID 20) is placed onto the trunk wire.",
        protocolRule:
          "IEEE 802.1Q: Standard switches only parse the outermost tag and strip it when egressing to a trunk configured with matching native VLAN.",
        fieldsChanged: ["frame.outerTagStripped", "trunk.exposedInnerTag"],
      }
    );

    // Step 3: Switch 2 Receives Inner Tag and Forwards to Victim in VLAN 20
    const victimDeliveryFrame = stripTag(innerTaggedFrame);

    addStep(
      3,
      "Switch 2 Forwards Inner-Tagged Frame into Target VLAN 20",
      "Switch 2 parses the remaining tag (VID 20), believes it is legitimate VLAN 20 traffic, strips the tag, and delivers the unauthorized packet to Victim-Sales!",
      victimDeliveryFrame,
      ["link-sw2-vic"],
      [],
      [],
      {
        beginner:
          "Switch 2 receives the packet, sees 'VLAN 20', and forwards it to Victim-Sales. The attacker has successfully hopped across the VLAN boundary!",
        advanced:
          "Switch 2 trunk parser reads VID 20, looks up Port Fa0/1 in VLAN 20 CAM table, strips 802.1Q header, and delivers frame to victim. Unidirectional security breach executed.",
        protocolRule:
          "Security Exploit: Double tagging allows unauthorized unidirectional packet injection across isolated VLANs.",
        fieldsChanged: ["switch2.vlanDelivery", "victim.compromised"],
      }
    );

    // Step 4: Security Hardening & Mitigation
    addStep(
      4,
      "Security Mitigation & Trunk Hardening",
      "Network engineers mitigate VLAN Hopping by changing Native VLAN to an unused ID (e.g. VLAN 999) and enabling `vlan dot1q tag native`.",
      victimDeliveryFrame,
      [],
      [],
      [],
      {
        beginner:
          "How to fix this? 1. Never use default VLAN 1 for user ports. 2. Set the trunk Native VLAN to an unused dummy number (like VLAN 999). 3. Tell the switch to always tag native traffic.",
        advanced:
          "Cisco / NIST Best Practices: 1. `switchport trunk native vlan 999` (dedicated unused native VLAN), 2. `vlan dot1q tag native` (forces explicit tagging for all native traffic), 3. `switchport nonegotiate` (disables DTP auto-trunking).",
        protocolRule:
          "NIST SP 800-115 & DISA STIG: Proper switch hardening eliminates Layer 2 double-tagging attack vectors.",
        fieldsChanged: ["switch.securityHardening", "trunk.nativeVlan999"],
      }
    );
  }

  return { events, packets, steps };
}

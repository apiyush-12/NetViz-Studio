import type {
  Ipv4Config,
  Ipv4Header,
  Ipv4Fragment,
  Ipv4SimulationEvent,
  Ipv4SimulationPacket,
  Ipv4SimulationOutcome,
  Ipv4ScenarioId,
} from "./ipv4.types";
import { defaultIpv4Config } from "./ipv4.defaults";

export function simulateIpv4Transaction(
  customConfig?: Partial<Ipv4Config>,
  scenarioId: Ipv4ScenarioId = "standard_forwarding"
): Ipv4SimulationOutcome {
  const config: Ipv4Config = { ...defaultIpv4Config, ...customConfig };
  const events: Ipv4SimulationEvent[] = [];
  const packets: Ipv4SimulationPacket[] = [];

  let fragmentsGenerated = 0;
  let hopsTraversed = 0;
  let isDelivered = false;

  const baseHeader: Ipv4Header = {
    version: 4,
    ihl: 5,
    dscp: 0,
    ecn: 0,
    totalLength: config.packetSize,
    identification: 48921,
    flags: {
      reserved: false,
      df: config.dfFlag,
      mf: false,
    },
    fragmentOffset: 0,
    ttl: config.initialTtl,
    protocol: 6,
    protocolName: "TCP",
    headerChecksum: "0x7F2C",
    sourceIp: config.sourceIp,
    destinationIp: config.destinationIp,
  };

  // -------------------------------------------------------------------------
  // Scenario: TTL Expiration (ICMP Time Exceeded)
  // -------------------------------------------------------------------------
  if (scenarioId === "ttl_expiration" || config.initialTtl <= 1) {
    events.push({
      step: 1,
      type: "origination",
      title: "IPv4 Packet Generated with Low TTL=1",
      summary: `Host A generates IPv4 datagram to ${config.destinationIp} with initial TTL=1`,
      explanation: "Client initiates transmission with Time-to-Live field set to 1.",
      sourceNodeId: "host-a",
      destNodeId: "router-1",
      protocol: "TCP",
      rfcReference: "RFC 791 / RFC 792",
      technicalDetails: [
        `Source IP: ${config.sourceIp}`,
        `Destination IP: ${config.destinationIp}`,
        "TTL: 1",
        `Total Length: ${config.packetSize} Bytes`,
      ],
      headerSnapshot: { ...baseHeader, ttl: 1 },
    });

    packets.push({
      id: "pkt-ttl-1",
      stepIndex: 1,
      sourceId: "host-a",
      targetId: "router-1",
      protocol: "TCP",
      header: { ...baseHeader, ttl: 1 },
      label: "IPv4 (TTL=1) -> R1",
      progress: 100,
      status: "delivered",
    });

    hopsTraversed += 1;

    events.push({
      step: 2,
      type: "ttl-expired",
      title: "TTL Decremented to 0 at Router R1 (Packet Discarded)",
      summary: "Router R1 decrements TTL from 1 to 0; packet dropped with ICMP Time Exceeded",
      explanation: "Per RFC 791, a router must not forward a datagram with TTL <= 0. Router discards datagram and returns ICMP Type 11 Code 0 to Host A.",
      sourceNodeId: "router-1",
      destNodeId: "host-a",
      protocol: "ICMP",
      rfcReference: "RFC 792 / RFC 1812",
      technicalDetails: [
        "Action: DISCARD_DATAGRAM",
        "TTL: 0 (Expired)",
        "ICMP Response: Type 11, Code 0 (Time to Live exceeded in transit)",
        "Diagnostic: Traceroute hop 1 discovered (192.168.1.1)",
      ],
      headerSnapshot: { ...baseHeader, ttl: 0 },
    });

    packets.push({
      id: "pkt-ttl-2",
      stepIndex: 2,
      sourceId: "router-1",
      targetId: "host-a",
      protocol: "ICMP",
      header: { ...baseHeader, ttl: 64, protocolName: "ICMP", destinationIp: config.sourceIp },
      label: "ICMP Time Exceeded (Type 11)",
      progress: 100,
      status: "delivered",
    });

    return {
      config,
      events,
      packets,
      fragmentsGenerated: 0,
      hopsTraversed,
      isDelivered: false,
    };
  }

  // -------------------------------------------------------------------------
  // Scenario: DF Bit Set with MTU Exceeded (Packet Dropped)
  // -------------------------------------------------------------------------
  if (scenarioId === "checksum_error" || (config.dfFlag && config.packetSize > config.routerMtu)) {
    events.push({
      step: 1,
      type: "origination",
      title: "IPv4 Datagram Generated with DF=1 (Don't Fragment)",
      summary: `Host A generates ${config.packetSize}B packet with DF flag enabled`,
      explanation: "Source host requests unfragmented end-to-end transmission (Path MTU Discovery).",
      sourceNodeId: "host-a",
      destNodeId: "router-1",
      protocol: "TCP",
      rfcReference: "RFC 791 / RFC 1191",
      technicalDetails: [
        `Size: ${config.packetSize} Bytes`,
        "Flags: DF=1 (Don't Fragment), MF=0",
        `TTL: ${config.initialTtl}`,
      ],
      headerSnapshot: { ...baseHeader, flags: { reserved: false, df: true, mf: false } },
    });

    packets.push({
      id: "pkt-df-1",
      stepIndex: 1,
      sourceId: "host-a",
      targetId: "router-1",
      protocol: "TCP",
      header: { ...baseHeader, flags: { reserved: false, df: true, mf: false } },
      label: "IPv4 (DF=1) -> R1",
      progress: 100,
      status: "delivered",
    });

    events.push({
      step: 2,
      type: "ttl-decrement",
      title: "Router R1 Forwards to Edge Router R2",
      summary: "Router R1 decrements TTL and forwards across Gigabit link",
      explanation: "Outgoing MTU on R1-R2 link is 1500; packet forwards without fragmentation.",
      sourceNodeId: "router-1",
      destNodeId: "router-2",
      protocol: "TCP",
      rfcReference: "RFC 791 / RFC 1624",
      technicalDetails: [
        "TTL: Decremented to " + (config.initialTtl - 1),
        "Checksum: Recalculated 0x7E2D",
      ],
      headerSnapshot: { ...baseHeader, ttl: config.initialTtl - 1, flags: { reserved: false, df: true, mf: false } },
    });

    packets.push({
      id: "pkt-df-2",
      stepIndex: 2,
      sourceId: "router-1",
      targetId: "router-2",
      protocol: "TCP",
      header: { ...baseHeader, ttl: config.initialTtl - 1, flags: { reserved: false, df: true, mf: false } },
      label: "IPv4 (DF=1) -> R2",
      progress: 100,
      status: "delivered",
    });

    hopsTraversed += 2;

    events.push({
      step: 3,
      type: "ttl-expired",
      title: "Router R2 Drops Packet: MTU Exceeded with DF=1",
      summary: `Packet size (${config.packetSize}B) exceeds R2 outgoing MTU (${config.routerMtu}B) with DF=1`,
      explanation: "Router cannot fragment datagram due to DF=1 flag. Router drops datagram and returns ICMP Type 3 Code 4 (Fragmentation Needed and DF set) with Next-Hop MTU 576.",
      sourceNodeId: "router-2",
      destNodeId: "host-a",
      protocol: "ICMP",
      rfcReference: "RFC 1191 (Path MTU Discovery)",
      technicalDetails: [
        `Outgoing Interface MTU: ${config.routerMtu} Bytes`,
        `Packet Total Length: ${config.packetSize} Bytes`,
        "Error: FRAGMENTATION_NEEDED_DF_SET",
        `ICMP Response: Type 3, Code 4 (Next-Hop MTU = ${config.routerMtu})`,
      ],
      headerSnapshot: { ...baseHeader, ttl: config.initialTtl - 2, flags: { reserved: false, df: true, mf: false } },
    });

    packets.push({
      id: "pkt-df-3",
      stepIndex: 3,
      sourceId: "router-2",
      targetId: "host-a",
      protocol: "ICMP",
      header: { ...baseHeader, ttl: 64, protocolName: "ICMP", destinationIp: config.sourceIp },
      label: `ICMP Frag Needed (MTU ${config.routerMtu})`,
      progress: 100,
      status: "delivered",
    });

    return {
      config,
      events,
      packets,
      fragmentsGenerated: 0,
      hopsTraversed,
      isDelivered: false,
    };
  }

  // -------------------------------------------------------------------------
  // Scenario: MTU Bottleneck Fragmentation & Reassembly (5 Steps)
  // -------------------------------------------------------------------------
  if (scenarioId === "fragmentation_mtu" || config.packetSize > config.routerMtu) {
    const headerLen = 20;
    const maxPayloadPerFragment = Math.floor((config.routerMtu - headerLen) / 8) * 8; // e.g. (576-20)/8 * 8 = 552 bytes
    const totalPayload = config.packetSize - headerLen; // e.g. 1480 bytes

    const calculatedFragments: Ipv4Fragment[] = [];
    let offset = 0;

    while (offset < totalPayload) {
      const remaining = totalPayload - offset;
      const isLast = remaining <= maxPayloadPerFragment;
      const payloadLength = isLast ? remaining : maxPayloadPerFragment;

      calculatedFragments.push({
        fragmentId: 48921,
        offset,
        offsetUnits: offset / 8,
        payloadLength,
        mf: !isLast,
        df: false,
        data: `Bytes ${offset} - ${offset + payloadLength - 1}`,
      });

      offset += payloadLength;
    }

    fragmentsGenerated = calculatedFragments.length;

    // Step 1: Host A sends 1500B unfragmented packet
    events.push({
      step: 1,
      type: "origination",
      title: "Host A Generates 1500-Byte IPv4 Datagram",
      summary: `Client constructs ${config.packetSize}-byte IPv4 datagram to ${config.destinationIp}`,
      explanation: "Large packet generated on LAN with initial MTU 1500.",
      sourceNodeId: "host-a",
      destNodeId: "router-1",
      protocol: "TCP",
      rfcReference: "RFC 791 Section 3.1",
      technicalDetails: [
        `Total Length: ${config.packetSize} Bytes (Header: 20B, Payload: ${totalPayload}B)`,
        "Identification: 48921",
        "Flags: DF=0, MF=0",
        "Fragment Offset: 0 (0 bytes)",
        `TTL: ${config.initialTtl}`,
      ],
      headerSnapshot: baseHeader,
    });

    packets.push({
      id: "pkt-frag-1",
      stepIndex: 1,
      sourceId: "host-a",
      targetId: "router-1",
      protocol: "TCP",
      header: baseHeader,
      label: `IPv4 (${config.packetSize}B) -> R1`,
      progress: 100,
      status: "delivered",
    });

    // Step 2: Router R1 forwards to R2
    events.push({
      step: 2,
      type: "routing-lookup",
      title: "Gateway Router R1 Forwards Datagram",
      summary: "R1 performs LPM lookup and forwards datagram to Edge Router R2",
      explanation: "Routing table points to 10.0.0.2 via serial interface. TTL decremented to 63.",
      sourceNodeId: "router-1",
      destNodeId: "router-2",
      protocol: "TCP",
      rfcReference: "RFC 1812 / RFC 1519",
      technicalDetails: [
        "LPM Match: 172.16.0.0/24 via 10.0.0.2",
        "TTL: Decremented to " + (config.initialTtl - 1),
        "Checksum: Recalculated 0x7E2D",
      ],
      headerSnapshot: { ...baseHeader, ttl: config.initialTtl - 1 },
    });

    packets.push({
      id: "pkt-frag-2",
      stepIndex: 2,
      sourceId: "router-1",
      targetId: "router-2",
      protocol: "TCP",
      header: { ...baseHeader, ttl: config.initialTtl - 1 },
      label: `IPv4 (${config.packetSize}B) -> R2`,
      progress: 100,
      status: "delivered",
    });

    hopsTraversed += 2;

    // Step 3: Router R2 fragments datagram into slices
    events.push({
      step: 3,
      type: "fragmentation",
      title: `Router R2 Fragments Datagram into ${fragmentsGenerated} Slices`,
      summary: `Datagram (${config.packetSize}B) exceeds R2 link MTU (${config.routerMtu}B); split into ${fragmentsGenerated} fragments`,
      explanation: `Router R2 splits ${totalPayload}B payload into ${fragmentsGenerated} slices with 8-byte aligned offsets. Identification (48921) copied to all fragments.`,
      sourceNodeId: "router-2",
      destNodeId: "router-2",
      protocol: "TCP",
      rfcReference: "RFC 791 Section 3.2 / RFC 815",
      technicalDetails: calculatedFragments.map(
        (f, i) =>
          `Fragment ${i + 1}: Total Len = ${f.payloadLength + 20}B (Offset = ${f.offsetUnits} [${f.offset}B], MF = ${f.mf ? "1" : "0"})`
      ),
      headerSnapshot: { ...baseHeader, ttl: config.initialTtl - 2 },
      fragments: calculatedFragments,
    });

    // Step 4: Router R2 transmits fragments across MTU 576 link to destination
    calculatedFragments.forEach((f, idx) => {
      packets.push({
        id: `pkt-slice-${idx + 1}`,
        stepIndex: 4,
        sourceId: "router-2",
        targetId: "web-server",
        protocol: "TCP",
        header: {
          ...baseHeader,
          ttl: config.initialTtl - 2,
          totalLength: f.payloadLength + 20,
          fragmentOffset: f.offsetUnits,
          flags: { reserved: false, df: false, mf: f.mf },
        },
        isFragmented: true,
        fragmentIndex: idx + 1,
        totalFragments: fragmentsGenerated,
        label: `Frag ${idx + 1}/${fragmentsGenerated} (${f.payloadLength + 20}B, Off:${f.offsetUnits})`,
        progress: 100,
        status: "delivered",
      });
    });

    events.push({
      step: 4,
      type: "ttl-decrement",
      title: "Fragments Transmitted Across Bottleneck Link",
      summary: `Router R2 transmits all ${fragmentsGenerated} fragments to destination Web Server`,
      explanation: "Each fragment travels as an independent IPv4 packet across the link.",
      sourceNodeId: "router-2",
      destNodeId: "web-server",
      protocol: "TCP",
      rfcReference: "RFC 791",
      technicalDetails: [
        `Transmitted: ${fragmentsGenerated} independent IPv4 datagrams`,
        "All fragments share ID 48921",
        "TTL: Decremented to " + (config.initialTtl - 2),
      ],
      headerSnapshot: { ...baseHeader, ttl: config.initialTtl - 2 },
      fragments: calculatedFragments,
    });

    hopsTraversed += 1;

    // Step 5: Web Server performs buffer reassembly
    events.push({
      step: 5,
      type: "reassembly",
      title: "Destination Web Server Reassembles Datagram",
      summary: `Web Server buffers all ${fragmentsGenerated} slices and reconstructs full ${config.packetSize}B datagram`,
      explanation: "Using (Source IP, Dest IP, ID 48921) tuple and Fragment Offsets, the host reassembles the original TCP segment and delivers it to the transport layer.",
      sourceNodeId: "web-server",
      destNodeId: "web-server",
      protocol: "TCP",
      rfcReference: "RFC 815 (IP Reassembly Algorithm)",
      technicalDetails: [
        `Buffer Status: 100% Complete (${config.packetSize} Bytes reconstructed)`,
        "Layer 3 Checksum Verified",
        "Dispatched to: TCP Port 80 Stack",
      ],
      headerSnapshot: { ...baseHeader, ttl: config.initialTtl - 2 },
      fragments: calculatedFragments,
    });

    isDelivered = true;

    return {
      config,
      events,
      packets,
      fragmentsGenerated,
      hopsTraversed,
      isDelivered,
    };
  }

  // -------------------------------------------------------------------------
  // Scenario: Standard Multi-Hop Forwarding / Subnet Routing (4 Steps)
  // -------------------------------------------------------------------------
  events.push({
    step: 1,
    type: "origination",
    title: "Host A Generates Standard IPv4 Datagram",
    summary: `Host A creates ${config.packetSize}-byte packet to ${config.destinationIp}`,
    explanation: "Standard IPv4 unicast packet created for multi-hop transit.",
    sourceNodeId: "host-a",
    destNodeId: "router-1",
    protocol: "TCP",
    rfcReference: "RFC 791",
    technicalDetails: [
      `Source IP: ${config.sourceIp}`,
      `Destination IP: ${config.destinationIp}`,
      `Total Length: ${config.packetSize} Bytes`,
      `TTL: ${config.initialTtl}`,
    ],
    headerSnapshot: baseHeader,
  });

  packets.push({
    id: "pkt-std-1",
    stepIndex: 1,
    sourceId: "host-a",
    targetId: "router-1",
    protocol: "TCP",
    header: baseHeader,
    label: `IPv4 (${config.packetSize}B) -> R1`,
    progress: 100,
    status: "delivered",
  });

  events.push({
    step: 2,
    type: "routing-lookup",
    title: "Router R1 LPM Lookup & Forwarding",
    summary: "Router R1 determines next hop 10.0.0.2 via 10.0.0.0/24 subnet",
    explanation: "Longest Prefix Match selects specific /24 route. TTL decremented to 63.",
    sourceNodeId: "router-1",
    destNodeId: "router-2",
    protocol: "TCP",
    rfcReference: "RFC 1519 (CIDR)",
    technicalDetails: [
      "Route Match: 172.16.0.0/24 via 10.0.0.2",
      "TTL: Decremented to " + (config.initialTtl - 1),
      "Header Checksum Recalculated",
    ],
    headerSnapshot: { ...baseHeader, ttl: config.initialTtl - 1 },
  });

  packets.push({
    id: "pkt-std-2",
    stepIndex: 2,
    sourceId: "router-1",
    targetId: "router-2",
    protocol: "TCP",
    header: { ...baseHeader, ttl: config.initialTtl - 1 },
    label: `IPv4 (${config.packetSize}B) -> R2`,
    progress: 100,
    status: "delivered",
  });

  events.push({
    step: 3,
    type: "ttl-decrement",
    title: "Router R2 Forwards to Local Subnet",
    summary: "Router R2 forwards datagram directly to destination server 172.16.0.100",
    explanation: "Destination IP matches directly connected subnet 172.16.0.0/24. ARP resolves MAC address.",
    sourceNodeId: "router-2",
    destNodeId: "web-server",
    protocol: "TCP",
    rfcReference: "RFC 1812",
    technicalDetails: [
      "Subnet Match: 172.16.0.0/24 Directly Connected",
      "ARP Match: EE:FF:00:11:22:33",
      "TTL: Decremented to " + (config.initialTtl - 2),
    ],
    headerSnapshot: { ...baseHeader, ttl: config.initialTtl - 2 },
  });

  packets.push({
    id: "pkt-std-3",
    stepIndex: 3,
    sourceId: "router-2",
    targetId: "web-server",
    protocol: "TCP",
    header: { ...baseHeader, ttl: config.initialTtl - 2 },
    label: `IPv4 (${config.packetSize}B) -> Server`,
    progress: 100,
    status: "delivered",
  });

  hopsTraversed += 3;

  events.push({
    step: 4,
    type: "delivered",
    title: "Datagram Delivered to Destination Web Server",
    summary: `Web Server B receives complete ${config.packetSize}B datagram and processes payload`,
    explanation: "IPv4 header verified and stripped; TCP segment dispatched to application.",
    sourceNodeId: "web-server",
    destNodeId: "web-server",
    protocol: "TCP",
    rfcReference: "RFC 791 / RFC 1122",
    technicalDetails: [
      "Status: DELIVERED",
      "Layer 3 Checksum: Valid",
      "Protocol: 6 (TCP Port 80)",
    ],
    headerSnapshot: { ...baseHeader, ttl: config.initialTtl - 2 },
  });

  isDelivered = true;

  return {
    config,
    events,
    packets,
    fragmentsGenerated: 0,
    hopsTraversed,
    isDelivered,
  };
}

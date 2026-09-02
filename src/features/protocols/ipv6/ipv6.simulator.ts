import type {
  Ipv6Config,
  Ipv6Header,
  Ipv6ExtensionHeader,
  Ipv6SimulationEvent,
  Ipv6SimulationPacket,
  Ipv6SimulationOutcome,
  Ipv6ScenarioId,
} from "./ipv6.types";
import { defaultIpv6Config } from "./ipv6.defaults";

export function simulateIpv6Transaction(
  customConfig?: Partial<Ipv6Config>,
  scenarioId: Ipv6ScenarioId = "ipv6_unicast_transit"
): Ipv6SimulationOutcome {
  const config: Ipv6Config = { ...defaultIpv6Config, ...customConfig };
  const events: Ipv6SimulationEvent[] = [];
  const packets: Ipv6SimulationPacket[] = [];

  let hopsTraversed = 0;
  let extensionHeaderCount = 0;
  let isDelivered = false;

  const defaultExtensions: Ipv6ExtensionHeader[] = config.useExtensionHeader
    ? [
        {
          type: "hop-by-hop",
          nextHeader: 43, // Routing header
          headerLength: 8,
          details: "Router Alert Option (RFC 2711) - Processed by all intermediate routers",
        },
        {
          type: "routing",
          nextHeader: 6, // TCP
          headerLength: 24,
          details: "Segment Routing (SRv6) Endpoint list [2001:db8:trans::2]",
        },
      ]
    : [];

  extensionHeaderCount = defaultExtensions.length;

  const baseIpv6Header: Ipv6Header = {
    version: 6,
    trafficClass: config.trafficClass,
    flowLabel: config.flowLabel,
    payloadLength: config.payloadSize + (config.useExtensionHeader ? 32 : 0),
    nextHeader: config.useExtensionHeader ? 0 : 6,
    nextHeaderName: config.useExtensionHeader ? "Hop-by-Hop Options (0)" : "TCP (6)",
    hopLimit: config.initialHopLimit,
    sourceIp: config.sourceIpv6,
    destinationIp: config.destinationIpv6,
    extensionHeaders: defaultExtensions.length > 0 ? defaultExtensions : undefined,
  };

  // -------------------------------------------------------------------------
  // Scenario: SLAAC & Neighbor Discovery Protocol (NDP) (5 Steps)
  // -------------------------------------------------------------------------
  if (scenarioId === "ipv6_slaac_ndp") {
    events.push({
      step: 1,
      type: "ndp-resolution",
      title: "Router Advertisement (RA) Received by Host A",
      summary: "Router R1 sends ICMPv6 Type 134 (RA) advertising Prefix 2001:db8:1::/64",
      explanation: "Host A receives Router Advertisement and performs Stateless Address Autoconfiguration (SLAAC) to generate its 128-bit global IPv6 address.",
      sourceNodeId: "router-ipv6-1",
      destNodeId: "host-ipv6-a",
      protocol: "ICMPv6",
      rfcReference: "RFC 4861 / RFC 4862 (SLAAC)",
      technicalDetails: [
        "ICMPv6 Type: 134 (Router Advertisement)",
        "Advertised Prefix: 2001:db8:1::/64",
        "Autoconfigured Address: 2001:db8:1::10 (via EUI-64/Randomized Interface ID)",
        "Default Router: fe80::aabb:cc11:2233",
      ],
      headerSnapshot: {
        ...baseIpv6Header,
        nextHeader: 58,
        nextHeaderName: "ICMPv6 (58)",
        sourceIp: "fe80::aabb:cc11:2233",
        destinationIp: "ff02::1", // All-nodes multicast
      },
    });

    packets.push({
      id: "pkt-ndp-1",
      stepIndex: 1,
      sourceId: "router-ipv6-1",
      targetId: "host-ipv6-a",
      protocol: "ICMPv6",
      header: {
        ...baseIpv6Header,
        nextHeader: 58,
        nextHeaderName: "ICMPv6 (58)",
        sourceIp: "fe80::aabb:cc11:2233",
        destinationIp: "ff02::1",
      },
      label: "ICMPv6 Router Advertisement (Type 134)",
      progress: 100,
      status: "delivered",
    });

    events.push({
      step: 2,
      type: "ndp-resolution",
      title: "Duplicate Address Detection (DAD) & Neighbor Solicitation",
      summary: "Host A transmits Neighbor Solicitation (NS) to Solicited-Node Multicast",
      explanation: "Host A verifies address uniqueness by querying ff02::1:ff00:10 before activating 2001:db8:1::10.",
      sourceNodeId: "host-ipv6-a",
      destNodeId: "router-ipv6-1",
      protocol: "ICMPv6",
      rfcReference: "RFC 4862 Section 5.4 (DAD)",
      technicalDetails: [
        "ICMPv6 Type: 135 (Neighbor Solicitation)",
        "Target Address: 2001:db8:1::10",
        "Destination: ff02::1:ff00:10 (Solicited-Node Multicast)",
        "Result: No collision detected (DAD Succeeded)",
      ],
      headerSnapshot: {
        ...baseIpv6Header,
        nextHeader: 58,
        nextHeaderName: "ICMPv6 (58)",
        sourceIp: "::", // Unspecified during DAD
        destinationIp: "ff02::1:ff00:10",
      },
    });

    packets.push({
      id: "pkt-ndp-2",
      stepIndex: 2,
      sourceId: "host-ipv6-a",
      targetId: "router-ipv6-1",
      protocol: "ICMPv6",
      header: {
        ...baseIpv6Header,
        nextHeader: 58,
        nextHeaderName: "ICMPv6 (58)",
        sourceIp: "::",
        destinationIp: "ff02::1:ff00:10",
      },
      label: "ICMPv6 Neighbor Solicitation (DAD)",
      progress: 100,
      status: "delivered",
    });

    events.push({
      step: 3,
      type: "packet-originated",
      title: "Host A Sends Unicast IPv6 Web Request",
      summary: "Host A transmits TCP SYN to 2001:db8:2::100 using new SLAAC address",
      explanation: "Client initiates socket request to destination server.",
      sourceNodeId: "host-ipv6-a",
      destNodeId: "router-ipv6-1",
      protocol: "TCP",
      rfcReference: "RFC 8200",
      technicalDetails: [
        "Source IPv6: 2001:db8:1::10",
        "Destination IPv6: 2001:db8:2::100",
        `Payload Length: ${config.payloadSize} Bytes`,
        `Flow Label: ${config.flowLabel}`,
      ],
      headerSnapshot: baseIpv6Header,
    });

    packets.push({
      id: "pkt-ndp-3",
      stepIndex: 3,
      sourceId: "host-ipv6-a",
      targetId: "router-ipv6-1",
      protocol: "TCP",
      header: baseIpv6Header,
      label: "IPv6 TCP SYN -> R1",
      progress: 100,
      status: "delivered",
    });

    hopsTraversed += 3;
    isDelivered = true;

    return {
      config,
      events,
      packets,
      hopsTraversed,
      extensionHeaderCount,
      isDelivered,
    };
  }

  // -------------------------------------------------------------------------
  // Scenario: 6to4 Tunneling (IPv6 Encapsulated in IPv4) (5 Steps)
  // -------------------------------------------------------------------------
  if (scenarioId === "6to4_tunneling") {
    events.push({
      step: 1,
      type: "packet-originated",
      title: "Host A Generates Native IPv6 Datagram",
      summary: "Host A sends IPv6 datagram to 2001:db8:2::100",
      explanation: "Packet enters tunnel ingress router R1.",
      sourceNodeId: "host-ipv6-a",
      destNodeId: "router-ipv6-1",
      protocol: "TCP",
      rfcReference: "RFC 8200",
      technicalDetails: [
        "Source: 2001:db8:1::10",
        "Destination: 2001:db8:2::100",
        "Payload: 1200 Bytes",
      ],
      headerSnapshot: baseIpv6Header,
    });

    packets.push({
      id: "pkt-6to4-1",
      stepIndex: 1,
      sourceId: "host-ipv6-a",
      targetId: "router-ipv6-1",
      protocol: "TCP",
      header: baseIpv6Header,
      label: "Native IPv6 -> Tunnel Ingress R1",
      progress: 100,
      status: "delivered",
    });

    events.push({
      step: 2,
      type: "tunnel-encapsulation",
      title: "Router R1 Encapsulates IPv6 inside IPv4 (Protocol 41)",
      summary: "R1 wraps 128-bit IPv6 packet with 20-byte IPv4 outer header (192.168.1.1 -> 172.16.0.1)",
      explanation: "Tunneling enables IPv6 datagrams to cross IPv4-only core backbone network.",
      sourceNodeId: "router-ipv6-1",
      destNodeId: "router-ipv6-2",
      protocol: "TCP",
      rfcReference: "RFC 3056 (6to4) / RFC 4213",
      technicalDetails: [
        "Outer Header: IPv4 (Version 4, Protocol 41 = IPv6 Encapsulation)",
        "Outer Source IP: 192.168.1.1",
        "Outer Destination IP: 172.16.0.1",
        "Inner Header: Full 40-byte IPv6 Header Preserved (2001:db8:1::10 -> 2001:db8:2::100)",
      ],
      headerSnapshot: baseIpv6Header,
    });

    packets.push({
      id: "pkt-6to4-2",
      stepIndex: 2,
      sourceId: "router-ipv6-1",
      targetId: "router-ipv6-2",
      protocol: "TCP",
      header: baseIpv6Header,
      isTunneled: true,
      label: "6to4 Tunnel [IPv4:Proto41 | IPv6:TCP]",
      progress: 100,
      status: "delivered",
    });

    events.push({
      step: 3,
      type: "tunnel-encapsulation",
      title: "Router R2 Decapsulates Tunnel & Restores IPv6",
      summary: "R2 strips outer 20-byte IPv4 header and forwards native IPv6 packet to server",
      explanation: "Tunnel exit gateway delivers clean IPv6 datagram to destination LAN.",
      sourceNodeId: "router-ipv6-2",
      destNodeId: "server-ipv6",
      protocol: "TCP",
      rfcReference: "RFC 3056",
      technicalDetails: [
        "Action: STRIP_OUTER_IPV4_HEADER",
        "Restored Protocol: Native IPv6 (Next Header 6: TCP)",
        "Destination: 2001:db8:2::100",
      ],
      headerSnapshot: baseIpv6Header,
    });

    packets.push({
      id: "pkt-6to4-3",
      stepIndex: 3,
      sourceId: "router-ipv6-2",
      targetId: "server-ipv6",
      protocol: "TCP",
      header: baseIpv6Header,
      label: "Decapsulated Native IPv6 -> Server B",
      progress: 100,
      status: "delivered",
    });

    hopsTraversed += 3;
    isDelivered = true;

    return {
      config,
      events,
      packets,
      hopsTraversed,
      extensionHeaderCount,
      isDelivered,
    };
  }

  // -------------------------------------------------------------------------
  // Scenario: Native IPv6 Unicast Transit & Extension Header Chaining (4 Steps)
  // -------------------------------------------------------------------------
  events.push({
    step: 1,
    type: "packet-originated",
    title: "Host A Constructs 40-Byte IPv6 Datagram",
    summary: `Host A sends IPv6 datagram to ${config.destinationIpv6} (Flow Label: ${config.flowLabel})`,
    explanation: "Streamlined fixed 40-byte header generated with 128-bit source and destination addresses.",
    sourceNodeId: "host-ipv6-a",
    destNodeId: "router-ipv6-1",
    protocol: "TCP",
    rfcReference: "RFC 8200 Section 3",
    technicalDetails: [
      `Version: 6`,
      `Traffic Class: ${config.trafficClass}`,
      `Flow Label: ${config.flowLabel}`,
      `Payload Length: ${baseIpv6Header.payloadLength} Bytes`,
      `Next Header: ${baseIpv6Header.nextHeaderName}`,
      `Hop Limit: ${config.initialHopLimit}`,
    ],
    headerSnapshot: baseIpv6Header,
  });

  packets.push({
    id: "pkt-v6-1",
    stepIndex: 1,
    sourceId: "host-ipv6-a",
    targetId: "router-ipv6-1",
    protocol: "TCP",
    header: baseIpv6Header,
    label: `IPv6 (Flow: ${config.flowLabel}) -> R1`,
    progress: 100,
    status: "delivered",
  });

  events.push({
    step: 2,
    type: "flow-label-switching",
    title: "Router R1 Flow Label ECMP Switching",
    summary: `Router R1 evaluates 20-bit Flow Label (${config.flowLabel}) and forwards along optimal backbone link`,
    explanation: "Router routes packet using Flow Label without inspecting upper-layer payload or decrypting IPsec headers. Hop Limit decremented to 63.",
    sourceNodeId: "router-ipv6-1",
    destNodeId: "router-ipv6-2",
    protocol: "TCP",
    rfcReference: "RFC 6437 (Flow Label)",
    technicalDetails: [
      `Flow Label Preserved: ${config.flowLabel}`,
      `Hop Limit: Decremented to ${config.initialHopLimit - 1} (No Checksum Recalculation!)`,
      "Hardware Switching: 0-overhead wire-speed forwarding",
    ],
    headerSnapshot: { ...baseIpv6Header, hopLimit: config.initialHopLimit - 1 },
  });

  packets.push({
    id: "pkt-v6-2",
    stepIndex: 2,
    sourceId: "router-ipv6-1",
    targetId: "router-ipv6-2",
    protocol: "TCP",
    header: { ...baseIpv6Header, hopLimit: config.initialHopLimit - 1 },
    label: `IPv6 (Hop Limit: ${config.initialHopLimit - 1}) -> R2`,
    progress: 100,
    status: "delivered",
  });

  events.push({
    step: 3,
    type: "hop-limit-decrement",
    title: "Router R2 Resolves Neighbor & Forwards to Server",
    summary: `Router R2 decrements Hop Limit to ${config.initialHopLimit - 2} and delivers packet to destination subnet`,
    explanation: "Egress router forwards packet directly to 2001:db8:2::100 via Gigabit link.",
    sourceNodeId: "router-ipv6-2",
    destNodeId: "server-ipv6",
    protocol: "TCP",
    rfcReference: "RFC 8200 / RFC 4861",
    technicalDetails: [
      `Hop Limit: ${config.initialHopLimit - 2}`,
      "NDP Cache Match: EE:FF:00:11:22:33",
      "Next Header Dispatched: TCP (Port 443)",
    ],
    headerSnapshot: { ...baseIpv6Header, hopLimit: config.initialHopLimit - 2 },
  });

  packets.push({
    id: "pkt-v6-3",
    stepIndex: 3,
    sourceId: "router-ipv6-2",
    targetId: "server-ipv6",
    protocol: "TCP",
    header: { ...baseIpv6Header, hopLimit: config.initialHopLimit - 2 },
    label: `IPv6 -> Web Server B`,
    progress: 100,
    status: "delivered",
  });

  events.push({
    step: 4,
    type: "delivered",
    title: "IPv6 Datagram Delivered to Web Server",
    summary: "Web Server B receives 128-bit IPv6 packet and delivers segment to TCP stack",
    explanation: "Native IPv6 transit successfully completed.",
    sourceNodeId: "server-ipv6",
    destNodeId: "server-ipv6",
    protocol: "TCP",
    rfcReference: "RFC 8200",
    technicalDetails: [
      "Status: DELIVERED",
      "TCP Pseudo-Header Checksum Verified (128-bit IP fields)",
      "Connection Active on [2001:db8:2::100]:443",
    ],
    headerSnapshot: { ...baseIpv6Header, hopLimit: config.initialHopLimit - 2 },
  });

  hopsTraversed += 3;
  isDelivered = true;

  return {
    config,
    events,
    packets,
    hopsTraversed,
    extensionHeaderCount,
    isDelivered,
  };
}

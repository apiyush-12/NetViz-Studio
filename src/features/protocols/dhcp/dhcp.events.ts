import type { SimulationEvent, Packet } from "@/features/simulation/simulation-types";
import type { DhcpNode, DhcpLink, DhcpPool, DhcpLease } from "./dhcp.types";
import { buildDhcpOptions, type DhcpFsmStep } from "./dhcp.fsm";

function createDhcpPacket(
  id: string,
  source: string,
  destination: string,
  label: string,
  messageType: string,
  payloadObj: Record<string, unknown>
): Packet {
  return {
    id,
    protocol: "DHCP",
    label,
    source,
    destination,
    headers: {
      udp: {
        srcPort: messageType === "DHCPDISCOVER" || messageType === "DHCPREQUEST" || messageType === "DHCPDECLINE" ? 68 : 67,
        dstPort: messageType === "DHCPDISCOVER" || messageType === "DHCPREQUEST" || messageType === "DHCPDECLINE" ? 67 : 68,
      },
      application: {
        messageType,
        ...payloadObj,
      },
    },
    payload: JSON.stringify(payloadObj),
    size: 342,
    status: "pending",
    colorKey: messageType.toLowerCase(),
    createdAt: Date.now(),
  };
}

export function buildDhcpSimulationSequence(
  nodes: DhcpNode[],
  _links: DhcpLink[],
  pool: DhcpPool,
  activeLease: DhcpLease | null,
  failureScenario: string = "none",
  isTechnicalMode = false
): {
  events: SimulationEvent[];
  packets: Packet[];
  fsmSteps: DhcpFsmStep[];
} {
  const events: SimulationEvent[] = [];
  const rawPackets: Packet[] = [];
  const fsmSteps: DhcpFsmStep[] = [];
  let seq = 1;
  let timestamp = 0;

  const client = nodes.find((n) => n.type === "client") ?? nodes[0];
  const switchNode = nodes.find((n) => n.type === "switch") ?? nodes[1];
  const server = nodes.find((n) => n.role === "primary-server") ?? nodes[2];
  const rogueServer = nodes.find((n) => n.role === "rogue-server");
  const relayNode = nodes.find((n) => n.type === "relay");

  const xid = 0x39a2f14c;
  const offeredIp = activeLease?.ipAddress ?? pool.startAddress;
  const clientMac = client.macAddress;
  const serverIp = server?.ipAddress ?? "192.168.1.2";

  // =========================================================================
  // SCENARIO: POOL EXHAUSTION
  // =========================================================================
  if (failureScenario === "pool_exhausted") {
    const pkt1 = createDhcpPacket(
      "pkt-dhcp-discover",
      client.id,
      server.id,
      "DHCPDISCOVER",
      "DHCPDISCOVER",
      {
        messageType: "DHCPDISCOVER",
        xid,
        chaddr: clientMac,
        options: buildDhcpOptions("DHCPDISCOVER", pool, server.id, serverIp),
      }
    );
    rawPackets.push(pkt1);

    fsmSteps.push({
      stepIndex: 1,
      fromState: "INIT",
      toState: "SELECTING",
      trigger: "Broadcast DHCPDISCOVER",
      packetType: "DHCPDISCOVER",
      description: "Client starts in INIT state without an IP and broadcasts DHCPDISCOVER (255.255.255.255:67).",
      timestampOffset: 0,
    });

    events.push({
      id: "evt-dhcp-init",
      timestamp: (timestamp += 100),
      sequenceNumber: seq++,
      type: "state-change",
      sourceNodeId: client.id,
      destinationNodeId: client.id,
      protocol: "DHCP",
      title: isTechnicalMode ? "DHCP Client State: INIT → SELECTING" : "Client Booting & Looking for IP",
      description: `Client ${client.name} (${clientMac}) has no IP configuration. It initializes and prepares to broadcast DHCPDISCOVER.`,
      status: "completed",
      severity: "info",
    });

    events.push({
      id: "evt-dhcp-discover",
      timestamp: (timestamp += 250),
      sequenceNumber: seq++,
      type: "packet-sent",
      sourceNodeId: client.id,
      destinationNodeId: server.id,
      protocol: "DHCP",
      title: isTechnicalMode ? "UDP Broadcast: DHCPDISCOVER (Port 67/68)" : "DHCP Discover Sent (Broadcast)",
      description: `Client broadcasts DHCPDISCOVER (XID: 0x${xid.toString(16)}) to find reachable DHCP servers on the local broadcast domain.`,
      packetId: pkt1.id,
      status: "completed",
      severity: "info",
    });

    events.push({
      id: "evt-dhcp-pool-empty",
      timestamp: (timestamp += 300),
      sequenceNumber: seq++,
      type: "packet-dropped",
      sourceNodeId: server.id,
      destinationNodeId: client.id,
      protocol: "DHCP",
      title: isTechnicalMode ? "DHCP Scope Exhaustion: Pool 0 Available" : "Server Out of IP Addresses",
      description: `DHCP Server ${server.name} (${serverIp}) has no free IP addresses remaining in pool ${pool.startAddress} - ${pool.endAddress}. Request cannot be serviced.`,
      status: "failed",
      severity: "error",
    });

    return { events, packets: rawPackets, fsmSteps };
  }

  // =========================================================================
  // SCENARIO: ROGUE DHCP SERVER INJECTION
  // =========================================================================
  if (failureScenario === "rogue_server" && rogueServer) {
    const rogueIp = "192.168.1.66";
    const rogueOfferedIp = "192.168.1.199";

    const pkt1 = createDhcpPacket("pkt-dhcp-discover", client.id, switchNode.id, "DHCPDISCOVER", "DHCPDISCOVER", {
      messageType: "DHCPDISCOVER",
      xid,
      chaddr: clientMac,
    });

    const pktRogueOffer = createDhcpPacket("pkt-dhcp-rogue-offer", rogueServer.id, client.id, "DHCPOFFER (Rogue)", "DHCPOFFER", {
      messageType: "DHCPOFFER",
      xid,
      yiaddr: rogueOfferedIp,
      siaddr: rogueIp,
    });

    rawPackets.push(pkt1, pktRogueOffer);

    fsmSteps.push(
      { stepIndex: 1, fromState: "INIT", toState: "SELECTING", trigger: "Broadcast DISCOVER", packetType: "DHCPDISCOVER", description: "Client broadcasts DHCPDISCOVER.", timestampOffset: 0 },
      { stepIndex: 2, fromState: "SELECTING", toState: "REQUESTING", trigger: "Fast Rogue OFFER", packetType: "DHCPOFFER", description: "Rogue server replies first; client selects rogue offer.", timestampOffset: 200 }
    );

    events.push({
      id: "evt-dhcp-discover",
      timestamp: (timestamp += 100),
      sequenceNumber: seq++,
      type: "packet-sent",
      sourceNodeId: client.id,
      destinationNodeId: switchNode.id,
      protocol: "DHCP",
      title: "Client Broadcasts DHCPDISCOVER",
      description: "Client transmits DHCPDISCOVER looking for any DHCP server.",
      packetId: pkt1.id,
      status: "completed",
      severity: "info",
    });

    events.push({
      id: "evt-dhcp-rogue-response",
      timestamp: (timestamp += 250),
      sequenceNumber: seq++,
      type: "packet-arrived",
      sourceNodeId: rogueServer.id,
      destinationNodeId: client.id,
      protocol: "DHCP",
      title: "⚠️ Rogue DHCP Server Injection Detected",
      description: `Rogue DHCP Server (${rogueIp}) responded faster with DHCPOFFER assigning gateway ${rogueIp} (Man-in-the-Middle Risk). Enable DHCP Snooping on Switch!`,
      packetId: pktRogueOffer.id,
      status: "completed",
      severity: "warning",
    });

    return { events, packets: rawPackets, fsmSteps };
  }

  // =========================================================================
  // STANDARD DORA (Discover → Offer → Request → ACK)
  // =========================================================================

  // Step 1: DISCOVER
  const pktDiscover = createDhcpPacket(
    "pkt-dhcp-discover",
    client.id,
    relayNode ? relayNode.id : switchNode.id,
    "DHCPDISCOVER",
    "DHCPDISCOVER",
    {
      messageType: "DHCPDISCOVER",
      xid,
      secs: 0,
      flags: { broadcast: true },
      ciaddr: "0.0.0.0",
      yiaddr: "0.0.0.0",
      siaddr: "0.0.0.0",
      giaddr: relayNode ? "192.168.1.1" : "0.0.0.0",
      chaddr: clientMac,
      options: buildDhcpOptions("DHCPDISCOVER", pool, server.id, serverIp),
    }
  );
  rawPackets.push(pktDiscover);

  fsmSteps.push({
    stepIndex: 1,
    fromState: "INIT",
    toState: "SELECTING",
    trigger: "Broadcast DHCPDISCOVER",
    packetType: "DHCPDISCOVER",
    description: "Client has no IP; broadcasts DHCPDISCOVER onto local segment (UDP src: 0.0.0.0:68 → dst: 255.255.255.255:67).",
    timestampOffset: 0,
  });

  events.push({
    id: "evt-dhcp-fsm-init",
    timestamp: (timestamp += 100),
    sequenceNumber: seq++,
    type: "state-change",
    sourceNodeId: client.id,
    destinationNodeId: client.id,
    protocol: "DHCP",
    title: isTechnicalMode ? "DHCP Client State: INIT → SELECTING" : "Client Initializing & Broadcasting Discover",
    description: `Client ${client.name} (${clientMac}) enters SELECTING state and broadcasts DHCPDISCOVER (XID: 0x${xid.toString(16)}).`,
    status: "completed",
    severity: "info",
  });

  events.push({
    id: "evt-dhcp-discover-sent",
    timestamp: (timestamp += 200),
    sequenceNumber: seq++,
    type: "packet-sent",
    sourceNodeId: client.id,
    destinationNodeId: server.id,
    protocol: "DHCP",
    title: isTechnicalMode ? "DHCPDISCOVER (UDP 67/68)" : "DHCP Discover Sent",
    description: `DHCPDISCOVER broadcasted by ${client.name}. Transaction ID: 0x${xid.toString(16)}.`,
    packetId: pktDiscover.id,
    status: "completed",
    severity: "info",
  });

  // Step 2: OFFER
  const pktOffer = createDhcpPacket(
    "pkt-dhcp-offer",
    server.id,
    client.id,
    "DHCPOFFER",
    "DHCPOFFER",
    {
      messageType: "DHCPOFFER",
      xid,
      secs: 0,
      flags: { broadcast: false },
      ciaddr: "0.0.0.0",
      yiaddr: offeredIp,
      siaddr: serverIp,
      giaddr: "0.0.0.0",
      chaddr: clientMac,
      options: buildDhcpOptions("DHCPOFFER", pool, server.id, serverIp, offeredIp),
    }
  );
  rawPackets.push(pktOffer);

  fsmSteps.push({
    stepIndex: 2,
    fromState: "SELECTING",
    toState: "REQUESTING",
    trigger: "Receive DHCPOFFER",
    packetType: "DHCPOFFER",
    description: `Server reserves IP ${offeredIp} and replies with DHCPOFFER including Subnet Mask, Gateway (${pool.gateway}), and DNS (${pool.dnsServers.join(", ")}).`,
    timestampOffset: 250,
  });

  events.push({
    id: "evt-dhcp-offer-sent",
    timestamp: (timestamp += 250),
    sequenceNumber: seq++,
    type: "packet-sent",
    sourceNodeId: server.id,
    destinationNodeId: client.id,
    protocol: "DHCP",
    title: isTechnicalMode ? `DHCPOFFER: ${offeredIp}/24` : "DHCP Offer Received",
    description: `DHCP Server ${server.name} (${serverIp}) offers IP ${offeredIp} with lease duration ${pool.leaseDurationSeconds}s to ${client.name}.`,
    packetId: pktOffer.id,
    status: "completed",
    severity: "info",
  });

  // Step 3: REQUEST
  const pktRequest = createDhcpPacket(
    "pkt-dhcp-request",
    client.id,
    server.id,
    "DHCPREQUEST",
    "DHCPREQUEST",
    {
      messageType: "DHCPREQUEST",
      xid,
      secs: 1,
      flags: { broadcast: true },
      ciaddr: "0.0.0.0",
      yiaddr: "0.0.0.0",
      siaddr: serverIp,
      giaddr: "0.0.0.0",
      chaddr: clientMac,
      options: buildDhcpOptions("DHCPREQUEST", pool, server.id, serverIp, offeredIp),
    }
  );
  rawPackets.push(pktRequest);

  fsmSteps.push({
    stepIndex: 3,
    fromState: "REQUESTING",
    toState: "BOUND",
    trigger: "Broadcast DHCPREQUEST",
    packetType: "DHCPREQUEST",
    description: `Client selects offer and broadcasts DHCPREQUEST with Option 50 (Requested IP: ${offeredIp}) & Option 54 (Server Identifier: ${serverIp}).`,
    timestampOffset: 500,
  });

  events.push({
    id: "evt-dhcp-request-sent",
    timestamp: (timestamp += 250),
    sequenceNumber: seq++,
    type: "packet-sent",
    sourceNodeId: client.id,
    destinationNodeId: server.id,
    protocol: "DHCP",
    title: isTechnicalMode ? "DHCPREQUEST (Broadcast)" : "DHCP Request Sent",
    description: `Client broadcasts DHCPREQUEST formally requesting offered IP ${offeredIp} from Server ${serverIp}.`,
    packetId: pktRequest.id,
    status: "completed",
    severity: "info",
  });

  // Step 4: ACK or NAK or DECLINE
  if (failureScenario === "dhcp_nak") {
    const pktNak = createDhcpPacket("pkt-dhcp-nak", server.id, client.id, "DHCPNAK", "DHCPNAK", {
      messageType: "DHCPNAK",
      xid,
      siaddr: serverIp,
      chaddr: clientMac,
    });
    rawPackets.push(pktNak);

    fsmSteps.push({
      stepIndex: 4,
      fromState: "REQUESTING",
      toState: "INIT",
      trigger: "Receive DHCPNAK",
      packetType: "DHCPNAK",
      description: "Server rejects requested IP (invalid scope or already leased); client resets to INIT state.",
      timestampOffset: 750,
    });

    events.push({
      id: "evt-dhcp-nak-received",
      timestamp: (timestamp += 250),
      sequenceNumber: seq++,
      type: "packet-arrived",
      sourceNodeId: server.id,
      destinationNodeId: client.id,
      protocol: "DHCP",
      title: "DHCPNAK (Negative Acknowledgment)",
      description: `Server ${server.name} returned DHCPNAK. Requested configuration is invalid. Client returns to INIT state to retry.`,
      packetId: pktNak.id,
      status: "failed",
      severity: "error",
    });

    return { events, packets: rawPackets, fsmSteps };
  }

  if (failureScenario === "ip_conflict_decline") {
    const pktAck = createDhcpPacket("pkt-dhcp-ack", server.id, client.id, "DHCPACK", "DHCPACK", {
      messageType: "DHCPACK",
      xid,
      yiaddr: offeredIp,
      siaddr: serverIp,
      chaddr: clientMac,
    });
    const pktDecline = createDhcpPacket("pkt-dhcp-decline", client.id, server.id, "DHCPDECLINE", "DHCPDECLINE", {
      messageType: "DHCPDECLINE",
      xid,
      ciaddr: offeredIp,
      siaddr: serverIp,
      chaddr: clientMac,
    });
    rawPackets.push(pktAck, pktDecline);

    fsmSteps.push(
      { stepIndex: 4, fromState: "REQUESTING", toState: "BOUND", trigger: "Receive DHCPACK", packetType: "DHCPACK", description: "Client receives ACK and runs gratuitous ARP check.", timestampOffset: 750 },
      { stepIndex: 5, fromState: "BOUND", toState: "DECLINE", trigger: "ARP Conflict Detected", packetType: "DHCPDECLINE", description: "IP conflict found! Client sends DHCPDECLINE and resets to INIT.", timestampOffset: 950 }
    );

    events.push({
      id: "evt-dhcp-ack-temp",
      timestamp: (timestamp += 200),
      sequenceNumber: seq++,
      type: "packet-arrived",
      sourceNodeId: server.id,
      destinationNodeId: client.id,
      protocol: "DHCP",
      title: "DHCPACK Received",
      description: `Client received DHCPACK for ${offeredIp}. Performing Gratuitous ARP / ARP probe before binding.`,
      packetId: pktAck.id,
      status: "completed",
      severity: "info",
    });

    events.push({
      id: "evt-dhcp-arp-conflict",
      timestamp: (timestamp += 250),
      sequenceNumber: seq++,
      type: "packet-sent",
      sourceNodeId: client.id,
      destinationNodeId: server.id,
      protocol: "DHCP",
      title: "⚠️ ARP Conflict → DHCPDECLINE Sent",
      description: `Another host on the subnet replied to ARP probe for ${offeredIp}! Client sends DHCPDECLINE to server and marks address conflicted.`,
      packetId: pktDecline.id,
      status: "failed",
      severity: "warning",
    });

    return { events, packets: rawPackets, fsmSteps };
  }

  // Standard DHCPACK
  const pktAck = createDhcpPacket(
    "pkt-dhcp-ack",
    server.id,
    client.id,
    "DHCPACK",
    "DHCPACK",
    {
      messageType: "DHCPACK",
      xid,
      secs: 1,
      flags: { broadcast: false },
      ciaddr: "0.0.0.0",
      yiaddr: offeredIp,
      siaddr: serverIp,
      giaddr: "0.0.0.0",
      chaddr: clientMac,
      options: buildDhcpOptions("DHCPACK", pool, server.id, serverIp, offeredIp),
    }
  );
  rawPackets.push(pktAck);

  fsmSteps.push({
    stepIndex: 4,
    fromState: "BOUND",
    toState: "BOUND",
    trigger: "Receive DHCPACK (Lease Committed)",
    packetType: "DHCPACK",
    description: `Server registers active lease. Client enters BOUND state, applies IP ${offeredIp}/24, Gateway ${pool.gateway}, DNS ${pool.dnsServers.join(", ")}, and starts T1/T2 timers.`,
    timestampOffset: 750,
  });

  events.push({
    id: "evt-dhcp-ack-received",
    timestamp: (timestamp += 250),
    sequenceNumber: seq++,
    type: "packet-arrived",
    sourceNodeId: server.id,
    destinationNodeId: client.id,
    protocol: "DHCP",
    title: isTechnicalMode ? `DHCPACK: Lease Committed (${offeredIp})` : "DHCP Lease Granted & Bound",
    description: `DHCP Server commits lease for ${client.name}. Client configures ${offeredIp}, Gateway ${pool.gateway}, DNS ${pool.dnsServers.join(", ")}.`,
    packetId: pktAck.id,
    status: "completed",
    severity: "success",
  });

  events.push({
    id: "evt-dhcp-state-bound",
    timestamp: (timestamp += 100),
    sequenceNumber: seq++,
    type: "state-change",
    sourceNodeId: client.id,
    destinationNodeId: client.id,
    protocol: "DHCP",
    title: isTechnicalMode ? "DHCP Client State: BOUND (T1=43200s, T2=75600s)" : "Client Fully Configured (BOUND)",
    description: `Client is now fully BOUND to IP ${offeredIp}. Timer T1 (Renewal) will fire at ${pool.t1Seconds}s; T2 (Rebinding) at ${pool.t2Seconds}s.`,
    status: "completed",
    severity: "success",
  });

  return { events, packets: rawPackets, fsmSteps };
}

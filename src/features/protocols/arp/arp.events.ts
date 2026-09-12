import type {
  SimulationEvent,
  Packet,
} from "@/features/simulation/simulation-types";
import type {
  ArpNode,
  ArpLink,
  ArpConfig,
  ArpScenarioId,
  ArpSimulationStepState,
  ArpPacketData,
} from "./arp.types";
import {
  createArpPacket,
  updateArpCache,
  updateSwitchMacTable,
  formatArpSummary,
} from "./arp-engine";

export function buildArpSimulationSequence(
  nodes: ArpNode[],
  links: ArpLink[],
  config: ArpConfig
): {
  events: SimulationEvent[];
  packets: Packet[];
  steps: ArpSimulationStepState[];
} {
  const scenarioId: ArpScenarioId = config.scenarioId || "standard_local_arp";

  const steps: ArpSimulationStepState[] = [];
  const events: SimulationEvent[] = [];
  const packets: Packet[] = [];

  const addStep = (params: {
    title: string;
    description: string;
    nodesState: ArpNode[];
    linksState: ArpLink[];
    activePacket?: ArpPacketData;
    activeLinkIds?: string[];
    broadcastLinkIds?: string[];
    poisonedNodeIds?: string[];
    sourceNodeId?: string;
    destNodeId?: string;
    severity?: "info" | "warning" | "error" | "success";
    explanation: {
      beginner: string;
      advanced: string;
      protocolRule: string;
      fieldsChanged?: string[];
    };
  }) => {
    const stepNum = steps.length;
    const pkt = params.activePacket;

    const stepState: ArpSimulationStepState = {
      step: stepNum,
      title: params.title,
      description: params.description,
      nodes: JSON.parse(JSON.stringify(params.nodesState)),
      links: JSON.parse(JSON.stringify(params.linksState)),
      activePacket: pkt ? JSON.parse(JSON.stringify(pkt)) : undefined,
      activeLinkIds: params.activeLinkIds || [],
      broadcastLinkIds: params.broadcastLinkIds || [],
      poisonedNodeIds: params.poisonedNodeIds || [],
      eventExplanation: params.explanation,
    };
    steps.push(stepState);

    const pktId = `arp-pkt-${stepNum}`;
    const srcNode = params.sourceNodeId || params.nodesState[0]?.id || "host-a";
    const dstNode = params.destNodeId || params.nodesState[1]?.id || "sw-1";

    if (pkt) {
      packets.push({
        id: pktId,
        protocol: "ARP",
        label: formatArpSummary(pkt),
        source: srcNode,
        destination: dstNode,
        size: 42, // 14-byte Ethernet II + 28-byte ARP
        status: pkt.isPoisoned && config.daiEnabled ? "dropped" : "delivered",
        colorKey: pkt.isPoisoned ? "red" : pkt.opcode === 1 ? "blue" : "green",
        createdAt: stepNum * 100,
        headers: {
          ethernet: {
            destinationMac: pkt.destEthernetMac,
            sourceMac: pkt.sourceEthernetMac,
            etherType: "0x0806 (ARP)",
          },
          application: {
            hardwareType: "1 (Ethernet 10/100/1000Mb)",
            protocolType: "0x0800 (IPv4)",
            hardwareLength: "6 Bytes (MAC)",
            protocolLength: "4 Bytes (IPv4)",
            operationCode: `${pkt.opcode} (${pkt.opcode === 1 ? "ARP Request" : "ARP Reply"})`,
            senderHardwareAddress: pkt.senderMac,
            senderProtocolAddress: pkt.senderIp,
            targetHardwareAddress: pkt.targetMac,
            targetProtocolAddress: pkt.targetIp,
          },
        },
        payload: `ARP ${pkt.opcode === 1 ? "REQUEST" : "REPLY"}: Who has ${pkt.targetIp}? Tell ${pkt.senderIp} (${pkt.senderMac})`,
      });
    }

    events.push({
      id: `arp-evt-${stepNum}`,
      timestamp: stepNum * 500,
      sequenceNumber: stepNum + 1,
      type: "state-change",
      sourceNodeId: srcNode,
      destinationNodeId: dstNode,
      protocol: "ARP",
      title: params.title,
      description: params.description,
      status: "completed",
      severity: params.severity || "info",
      packetId: pkt ? pktId : undefined,
      metadata: {
        step: stepNum,
        opcode: pkt?.opcode,
        isBroadcast: pkt?.destEthernetMac === "FF:FF:FF:FF:FF:FF",
      },
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // SCENARIO 1: Standard Local ARP Resolution (Cold Cache)
  // ─────────────────────────────────────────────────────────────────────────────
  if (scenarioId === "standard_local_arp") {
    const currentNodes: ArpNode[] = JSON.parse(JSON.stringify(nodes));
    const hostA = currentNodes.find((n) => n.id === "host-a") || currentNodes[0];
    const hostB = currentNodes.find((n) => n.id === "host-b") || currentNodes[2];
    const hostC = currentNodes.find((n) => n.id === "host-c") || currentNodes[3];
    const sw1 = currentNodes.find((n) => n.id === "sw-1") || currentNodes[1];

    // Step 0: Initial ARP Cache Lookup (Miss)
    addStep({
      title: "1. ARP Cache Lookup & Miss",
      description: `Host A (${hostA.ipAddress}) wants to send an ICMP packet to Host B (${hostB.ipAddress}). ARP cache is empty (Miss), so packet is queued.`,
      nodesState: currentNodes,
      linksState: links,
      sourceNodeId: hostA.id,
      destNodeId: sw1.id,
      severity: "info",
      explanation: {
        beginner:
          "Host A checks its local ARP table. No entry exists for 192.168.1.20, so it must broadcast an ARP Request.",
        advanced:
          "Layer 3 IPv4 packet is placed into the interface hold queue while the ARP state machine enters the RESOLVING state.",
        protocolRule: "RFC 826: If destination MAC is unknown on local subnet, transmit an ARP Request.",
        fieldsChanged: ["hostA.holdQueue"],
      },
    });

    // Step 1: Broadcast ARP Request Sent from Host A
    const reqPacket = createArpPacket({
      opcode: 1,
      senderMac: hostA.macAddress,
      senderIp: hostA.ipAddress,
      targetMac: "00:00:00:00:00:00",
      targetIp: hostB.ipAddress,
      destEthernetMac: "FF:FF:FF:FF:FF:FF",
    });

    addStep({
      title: "2. Broadcast ARP Request Sent",
      description: `Host A broadcasts ARP Request: "Who has ${hostB.ipAddress}? Tell ${hostA.ipAddress} (${hostA.macAddress})".`,
      nodesState: currentNodes,
      linksState: links,
      activePacket: reqPacket,
      activeLinkIds: ["link-ha-sw"],
      sourceNodeId: hostA.id,
      destNodeId: sw1.id,
      severity: "info",
      explanation: {
        beginner:
          "Host A asks everyone on the local network by sending the frame to the broadcast MAC address FF:FF:FF:FF:FF:FF.",
        advanced:
          "Ethernet II frame (EtherType 0x0806) with Target Hardware Address (THA) set to 00:00:00:00:00:00.",
        protocolRule: "Destination MAC: FF:FF:FF:FF:FF:FF (Broadcast); Opcode: 1 (Request).",
        fieldsChanged: ["destEthernetMac", "opcode", "targetIp"],
      },
    });

    // Step 2: Switch MAC Learning & Ingress Flooding
    updateSwitchMacTable(sw1, "Fa0/1", hostA.macAddress);
    addStep({
      title: "3. Switch MAC Learning & Broadcast Flooding",
      description: `Switch-1 learns Host A's MAC (${hostA.macAddress}) on port Fa0/1, then floods the broadcast frame out Fa0/2 and Fa0/3.`,
      nodesState: currentNodes,
      linksState: links,
      activePacket: reqPacket,
      activeLinkIds: ["link-hb-sw", "link-hc-sw"],
      broadcastLinkIds: ["link-hb-sw", "link-hc-sw"],
      sourceNodeId: sw1.id,
      destNodeId: hostB.id,
      severity: "info",
      explanation: {
        beginner:
          "The switch inspects the source MAC and remembers that Host A is on Port 1. Then it copies the broadcast to all other ports.",
        advanced:
          "Switch CAM table dynamically records mapping (00:1A:2B:3C:4D:01 -> Fa0/1). Unknown broadcast flooded out all ports in VLAN 1.",
        protocolRule: "Switch dynamic MAC learning on ingress frame + Layer 2 broadcast flooding.",
        fieldsChanged: ["switch.macTable"],
      },
    });

    // Step 3: Neighbor Inspection (Host C drops, Host B accepts & caches)
    updateArpCache(hostB, {
      ipAddress: hostA.ipAddress,
      macAddress: hostA.macAddress,
    });
    addStep({
      title: "4. Target Host Matches IP & Caches Requester",
      description: `Host C (${hostC.ipAddress}) drops the frame (IP mismatch). Host B matches ${hostB.ipAddress} and updates its ARP cache with Host A's info.`,
      nodesState: currentNodes,
      linksState: links,
      activePacket: reqPacket,
      activeLinkIds: ["link-hb-sw"],
      sourceNodeId: hostB.id,
      destNodeId: sw1.id,
      severity: "success",
      explanation: {
        beginner:
          "Host C sees the request is not for its IP and ignores it. Host B recognizes its own IP and saves Host A's MAC address in its ARP cache.",
        advanced:
          "Bidirectional caching optimization: Host B saves (SPA, SHA) into its ARP table before replying, preventing a second ARP query later.",
        protocolRule: "RFC 826: If TPA matches local interface IP, update local translation table with (SPA, SHA).",
        fieldsChanged: ["hostB.arpCache"],
      },
    });

    // Step 4: Unicast ARP Reply Sent from Host B
    const repPacket = createArpPacket({
      opcode: 2,
      senderMac: hostB.macAddress,
      senderIp: hostB.ipAddress,
      targetMac: hostA.macAddress,
      targetIp: hostA.ipAddress,
      destEthernetMac: hostA.macAddress,
    });
    addStep({
      title: "5. Unicast ARP Reply Transmitted",
      description: `Host B sends a Unicast ARP Reply: "${hostB.ipAddress} is at ${hostB.macAddress}" directly to Host A.`,
      nodesState: currentNodes,
      linksState: links,
      activePacket: repPacket,
      activeLinkIds: ["link-hb-sw"],
      sourceNodeId: hostB.id,
      destNodeId: sw1.id,
      severity: "info",
      explanation: {
        beginner:
          "Because Host B already learned Host A's MAC address, it sends the reply directly (unicast) instead of broadcasting.",
        advanced:
          "Opcode set to 2 (Reply); Ethernet Destination MAC is set to Host A MAC (00:1A:2B:3C:4D:01).",
        protocolRule: "ARP Reply: Opcode 2; Unicast delivery directly to requester hardware address.",
        fieldsChanged: ["opcode", "senderMac", "destEthernetMac"],
      },
    });

    // Step 5: Switch Forwards Unicast Reply Directly to Host A
    updateSwitchMacTable(sw1, "Fa0/2", hostB.macAddress);
    addStep({
      title: "6. Switch Forwards Unicast Reply",
      description: `Switch-1 learns Host B's MAC (${hostB.macAddress}) on Fa0/2 and forwards the frame directly out Fa0/1 to Host A.`,
      nodesState: currentNodes,
      linksState: links,
      activePacket: repPacket,
      activeLinkIds: ["link-ha-sw"],
      sourceNodeId: sw1.id,
      destNodeId: hostA.id,
      severity: "info",
      explanation: {
        beginner:
          "The switch now knows both Host A and Host B's ports. It forwards the reply directly to Host A without bothering Host C.",
        advanced:
          "CAM table lookup for 00:1A:2B:3C:4D:01 hits Fa0/1. Switch performs targeted unicast egress.",
        protocolRule: "Layer 2 Unicast Forwarding based on CAM table lookup.",
        fieldsChanged: ["switch.macTable"],
      },
    });

    // Step 6: Host A Updates Cache & Delivers Queued Packet
    updateArpCache(hostA, {
      ipAddress: hostB.ipAddress,
      macAddress: hostB.macAddress,
    });
    addStep({
      title: "7. Resolution Complete & ICMP Data Delivered",
      description: `Host A updates its ARP cache with Host B (${hostB.macAddress}) and immediately transmits the queued ICMP Ping packet!`,
      nodesState: currentNodes,
      linksState: links,
      activeLinkIds: ["link-ha-sw", "link-hb-sw"],
      sourceNodeId: hostA.id,
      destNodeId: hostB.id,
      severity: "success",
      explanation: {
        beginner:
          "Host A's ARP table is now populated! Communication is established and subsequent packets will flow at full wire-speed without ARP delays.",
        advanced:
          "ARP entry transitions to RESOLVED. Outbound IP hold queue is flushed; ICMP Echo Request is encapsulated and transmitted.",
        protocolRule: "ARP Cache State: RESOLVED (Dynamic, TTL 300s). Layer 3 data transmission active.",
        fieldsChanged: ["hostA.arpCache", "queuedPacket.transmitted"],
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SCENARIO 2: Cross-Subnet Gateway ARP Resolution
  // ─────────────────────────────────────────────────────────────────────────────
  else if (scenarioId === "gateway_cross_subnet") {
    const currentNodes: ArpNode[] = JSON.parse(JSON.stringify(nodes));
    const hostA = currentNodes.find((n) => n.id === "host-a") || currentNodes[0];
    const gw = currentNodes.find((n) => n.id === "router-gw") || currentNodes[2];
    const server = currentNodes.find((n) => n.id === "server-remote") || currentNodes[4];

    // Step 0: Subnet ANDing & Gateway Selection
    addStep({
      title: "1. Subnet Mask Evaluation (Remote Destination)",
      description: `Host A (${hostA.ipAddress}/24) wants to ping Server (${server.ipAddress}/24). Because subnets differ, Host A resolves the Default Gateway (${hostA.defaultGateway}).`,
      nodesState: currentNodes,
      linksState: links,
      sourceNodeId: hostA.id,
      destNodeId: gw.id,
      severity: "info",
      explanation: {
        beginner:
          "Host A compares the server IP with its own subnet mask and sees the server is in a different network. It must send the packet to its Default Gateway.",
        advanced:
          "Binary ANDing: (192.168.1.10 & 255.255.255.0) != (10.0.0.50 & 255.255.255.0). Next-hop IP chosen from routing table is 192.168.1.1.",
        protocolRule: "Cross-subnet traffic: Resolve Next-Hop Gateway MAC address, not the remote host IP directly.",
        fieldsChanged: ["routing.nextHopIp"],
      },
    });

    // Step 1: Host A Resolves Gateway MAC
    const gwReq = createArpPacket({
      opcode: 1,
      senderMac: hostA.macAddress,
      senderIp: hostA.ipAddress,
      targetMac: "00:00:00:00:00:00",
      targetIp: hostA.defaultGateway || "192.168.1.1",
      destEthernetMac: "FF:FF:FF:FF:FF:FF",
    });
    addStep({
      title: "2. Host A Broadcasts ARP for Gateway",
      description: `Host A broadcasts ARP Request: "Who has ${hostA.defaultGateway}? Tell ${hostA.ipAddress}".`,
      nodesState: currentNodes,
      linksState: links,
      activePacket: gwReq,
      activeLinkIds: ["link-ha-sw1", "link-sw1-gw"],
      sourceNodeId: hostA.id,
      destNodeId: gw.id,
      severity: "info",
      explanation: {
        beginner:
          "Host A sends a broadcast asking for the Router Gateway's MAC address.",
        advanced:
          "Broadcast ARP frame flooded through SW-1 to Router Gi0/0 interface.",
        protocolRule: "ARP Request for Gateway IP (192.168.1.1).",
      },
    });

    // Step 2: Router Replies on LAN 1
    updateArpCache(hostA, {
      ipAddress: hostA.defaultGateway || "192.168.1.1",
      macAddress: gw.macAddress,
    });
    const gwRep = createArpPacket({
      opcode: 2,
      senderMac: gw.macAddress,
      senderIp: gw.ipAddress,
      targetMac: hostA.macAddress,
      targetIp: hostA.ipAddress,
      destEthernetMac: hostA.macAddress,
    });
    addStep({
      title: "3. Gateway Router Replies on LAN 1",
      description: `Router-1 replies: "${gw.ipAddress} is at ${gw.macAddress}". Host A updates its ARP cache with Gateway MAC.`,
      nodesState: currentNodes,
      linksState: links,
      activePacket: gwRep,
      activeLinkIds: ["link-sw1-gw", "link-ha-sw1"],
      sourceNodeId: gw.id,
      destNodeId: hostA.id,
      severity: "success",
      explanation: {
        beginner:
          "Router-1 replies with its MAC address. Host A can now encapsulate IP packets intended for the remote server inside Ethernet frames directed to the Router.",
        advanced:
          "Host A frames IP datagram (Dest IP: 10.0.0.50) inside Layer 2 Ethernet header (Dest MAC: 00:00:5E:00:01:01).",
        protocolRule: "Layer 2 hop-by-hop framing with end-to-end Layer 3 IP addressing.",
        fieldsChanged: ["hostA.arpCache"],
      },
    });

    // Step 3: Router Performs Second ARP on LAN 2 for Remote Server
    const srvReq = createArpPacket({
      opcode: 1,
      senderMac: "00:00:5E:00:01:02",
      senderIp: "10.0.0.1",
      targetMac: "00:00:00:00:00:00",
      targetIp: server.ipAddress,
      destEthernetMac: "FF:FF:FF:FF:FF:FF",
    });
    addStep({
      title: "4. Router Broadcasts ARP on LAN 2 for Server",
      description: `Router decapsulates Layer 2 header and broadcasts an ARP Request on LAN 2: "Who has ${server.ipAddress}? Tell 10.0.0.1".`,
      nodesState: currentNodes,
      linksState: links,
      activePacket: srvReq,
      activeLinkIds: ["link-gw-sw2", "link-sw2-srv"],
      sourceNodeId: gw.id,
      destNodeId: server.id,
      severity: "info",
      explanation: {
        beginner:
          "The Router now needs the Server's MAC address on the second network to complete the final leg of delivery.",
        advanced:
          "Router checks LAN 2 ARP cache for 10.0.0.50. On cache miss, it broadcasts ARP Request from interface Gi0/1 (10.0.0.1).",
        protocolRule: "Hop-by-hop resolution: Router resolves destination MAC on connected destination subnet.",
      },
    });

    // Step 4: Server Replies & End-to-End Routing Complete
    updateArpCache(gw, {
      ipAddress: server.ipAddress,
      macAddress: server.macAddress,
    });
    addStep({
      title: "5. Server Replies & End-to-End Route Converged",
      description: `Server replies to Router with ${server.macAddress}. End-to-end communication between Host A and Server is fully active!`,
      nodesState: currentNodes,
      linksState: links,
      activeLinkIds: ["link-ha-sw1", "link-sw1-gw", "link-gw-sw2", "link-sw2-srv"],
      sourceNodeId: server.id,
      destNodeId: hostA.id,
      severity: "success",
      explanation: {
        beginner:
          "Both local networks have resolved their hardware addresses. Packets from Host A now travel across the router to the server seamlessly.",
        advanced:
          "Router caches Server MAC, decrements TTL, rewrites Ethernet header (Src: Router Gi0/1 MAC, Dst: Server MAC), and forwards frame.",
        protocolRule: "Layer 3 Routing complete: Subnet isolation preserved with dynamic Layer 2 translation on each leg.",
        fieldsChanged: ["router.arpCache"],
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SCENARIO 3: Gratuitous ARP & Conflict Detection (RFC 5227)
  // ─────────────────────────────────────────────────────────────────────────────
  else if (scenarioId === "gratuitous_arp_conflict") {
    const currentNodes: ArpNode[] = JSON.parse(JSON.stringify(nodes));
    const rBackup = currentNodes.find((n) => n.id === "router-backup") || currentNodes[3];
    const sw1 = currentNodes.find((n) => n.id === "sw-1") || currentNodes[1];
    const client = currentNodes.find((n) => n.id === "host-a") || currentNodes[0];

    // Step 0: Primary Gateway Failure & Backup Promotion
    addStep({
      title: "1. Primary Gateway Failover (VRRP Promotion)",
      description: `Primary Gateway (R1) went down! Backup Gateway R2 (${rBackup.ipAddress}) promotes itself to active Master for Virtual IP 192.168.1.1.`,
      nodesState: currentNodes,
      linksState: links,
      sourceNodeId: rBackup.id,
      destNodeId: sw1.id,
      severity: "warning",
      explanation: {
        beginner:
          "In High Availability networks, when the main router fails, the standby router takes over the shared Virtual IP address.",
        advanced:
          "VRRP / HSRP state transition: Backup router transitions to MASTER state upon missed advertisement timer.",
        protocolRule: "RFC 5227: Host/Router asserts ownership of IP via Gratuitous ARP.",
        fieldsChanged: ["vrrp.state"],
      },
    });

    // Step 1: Gratuitous ARP Announcement Broadcast
    const garpPacket = createArpPacket({
      opcode: 1,
      senderMac: rBackup.macAddress,
      senderIp: "192.168.1.1",
      targetMac: "00:00:00:00:00:00",
      targetIp: "192.168.1.1", // SPA == TPA
      destEthernetMac: "FF:FF:FF:FF:FF:FF",
      isGratuitous: true,
    });
    addStep({
      title: "2. Gratuitous ARP (GARP) Broadcasted",
      description: `R2 broadcasts Gratuitous ARP: "192.168.1.1 is now at ${rBackup.macAddress}" (SPA == TPA == 192.168.1.1).`,
      nodesState: currentNodes,
      linksState: links,
      activePacket: garpPacket,
      activeLinkIds: ["link-r2-sw"],
      sourceNodeId: rBackup.id,
      destNodeId: sw1.id,
      severity: "info",
      explanation: {
        beginner:
          "R2 shouts to all devices on the network: 'I am now the Gateway at 192.168.1.1, update your records!'",
        advanced:
          "RFC 5227 Gratuitous ARP Announcement: Opcode 1 or 2 with Sender IP equal to Target IP broadcasted to FF:FF:FF:FF:FF:FF.",
        protocolRule: "RFC 5227: Gratuitous ARP has SPA == TPA to announce address binding.",
        fieldsChanged: ["arpPacket.isGratuitous"],
      },
    });

    // Step 2: Switch CAM Table & Client ARP Cache Updated
    updateSwitchMacTable(sw1, "Fa0/2", rBackup.macAddress);
    updateArpCache(client, {
      ipAddress: "192.168.1.1",
      macAddress: rBackup.macAddress,
    });
    addStep({
      title: "3. Instant CAM Table & ARP Cache Updating",
      description: `Switch-1 updates CAM port mapping (VIP on Fa0/2) and Client-1 updates its ARP cache with R2's MAC with zero downtime!`,
      nodesState: currentNodes,
      linksState: links,
      activePacket: garpPacket,
      activeLinkIds: ["link-ha-sw"],
      sourceNodeId: sw1.id,
      destNodeId: client.id,
      severity: "success",
      explanation: {
        beginner:
          "Because of the Gratuitous ARP, client traffic immediately routes through the new router with 0 dropped sessions.",
        advanced:
          "Switch flushes stale CAM mapping on Fa0/1 and points 192.168.1.1 traffic to Fa0/2. Client ARP cache updated in-place without manual timeout wait.",
        protocolRule: "Gratuitous ARP forces immediate cache refresh across all network nodes.",
        fieldsChanged: ["switch.macTable", "client.arpCache"],
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SCENARIO 4: Proxy ARP (RFC 1027)
  // ─────────────────────────────────────────────────────────────────────────────
  else if (scenarioId === "proxy_arp_wan") {
    const currentNodes: ArpNode[] = JSON.parse(JSON.stringify(nodes));
    const hostA = currentNodes.find((n) => n.id === "host-a") || currentNodes[0];
    const gw = currentNodes.find((n) => n.id === "router-gw") || currentNodes[2];

    // Step 0: Misconfigured Host Broadcasts for Out-of-Subnet IP
    const proxyReq = createArpPacket({
      opcode: 1,
      senderMac: hostA.macAddress,
      senderIp: hostA.ipAddress,
      targetMac: "00:00:00:00:00:00",
      targetIp: "10.0.0.50",
      destEthernetMac: "FF:FF:FF:FF:FF:FF",
    });
    addStep({
      title: "1. Misconfigured Host Broadcasts ARP for Remote IP",
      description: `Host A (configured with flat /16 mask) believes 10.0.0.50 is local and broadcasts an ARP request for it.`,
      nodesState: currentNodes,
      linksState: links,
      activePacket: proxyReq,
      activeLinkIds: ["link-ha-sw1", "link-sw1-gw"],
      sourceNodeId: hostA.id,
      destNodeId: gw.id,
      severity: "warning",
      explanation: {
        beginner:
          "Due to a wrong subnet mask, Host A thinks 10.0.0.50 is on its local wire and sends an ARP request instead of using the gateway.",
        advanced:
          "Host A interface configured with 255.255.0.0 mask. Host attempts direct Layer 2 resolution across network boundary.",
        protocolRule: "RFC 1027: Proxy ARP allows routers to answer ARP requests for remote destinations.",
      },
    });

    // Step 1: Router Answers on Behalf with Proxy ARP Reply
    updateArpCache(hostA, {
      ipAddress: "10.0.0.50",
      macAddress: gw.macAddress,
    });
    const proxyRep = createArpPacket({
      opcode: 2,
      senderMac: gw.macAddress,
      senderIp: "10.0.0.50",
      targetMac: hostA.macAddress,
      targetIp: hostA.ipAddress,
      destEthernetMac: hostA.macAddress,
      isProxy: true,
    });
    addStep({
      title: "2. Router Responds with Proxy ARP Reply",
      description: `Router-1 intercepts request, checks routing table, and responds with its OWN MAC (${gw.macAddress}) on behalf of 10.0.0.50.`,
      nodesState: currentNodes,
      linksState: links,
      activePacket: proxyRep,
      activeLinkIds: ["link-sw1-gw", "link-ha-sw1"],
      sourceNodeId: gw.id,
      destNodeId: hostA.id,
      severity: "success",
      explanation: {
        beginner:
          "The Router steps in and says: 'I know how to reach 10.0.0.50! Send those packets to my MAC address and I will deliver them.'",
        advanced:
          "Router checks route table, verifies 10.0.0.50 is reachable via another interface, and replies with its ingress interface MAC.",
        protocolRule: "RFC 1027 Proxy ARP: Router supplies its own hardware address for non-local destination IP.",
        fieldsChanged: ["hostA.arpCache", "arpPacket.isProxy"],
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SCENARIO 5: ARP Spoofing Attack & Dynamic ARP Inspection (DAI)
  // ─────────────────────────────────────────────────────────────────────────────
  else if (scenarioId === "arp_spoofing_dai") {
    const currentNodes: ArpNode[] = JSON.parse(JSON.stringify(nodes));
    const victim = currentNodes.find((n) => n.id === "host-a") || currentNodes[0];
    const sw = currentNodes.find((n) => n.id === "sw-sec") || currentNodes[1];
    const gw = currentNodes.find((n) => n.id === "router-gw") || currentNodes[2];
    const attacker = currentNodes.find((n) => n.id === "host-attacker") || currentNodes[3];

    // Step 0: Baseline Normal State
    addStep({
      title: "1. Normal State Prior to Attack",
      description: `Victim Host A (${victim.ipAddress}) has resolved the real Gateway (${gw.ipAddress} -> ${gw.macAddress}).`,
      nodesState: currentNodes,
      linksState: links,
      sourceNodeId: victim.id,
      destNodeId: gw.id,
      severity: "info",
      explanation: {
        beginner: "Normal baseline state: Victim's traffic routes directly through the authentic Gateway.",
        advanced: "Victim ARP cache contains trusted binding (192.168.1.1 -> 00:00:5E:00:01:01).",
        protocolRule: "Normal Layer 2 ARP operation.",
      },
    });

    // Step 1: Attacker Injects Forged ARP Reply
    const spoofPacket = createArpPacket({
      opcode: 2,
      senderMac: attacker.macAddress,
      senderIp: "192.168.1.1", // Attacker claims to be the Gateway!
      targetMac: victim.macAddress,
      targetIp: victim.ipAddress,
      destEthernetMac: victim.macAddress,
      isPoisoned: true,
    });

    if (!config.daiEnabled) {
      // DAI Disabled: Cache is poisoned!
      updateArpCache(victim, {
        ipAddress: "192.168.1.1",
        macAddress: attacker.macAddress,
        state: "poisoned",
      });
      addStep({
        title: "2. [ATTACK SUCCESS] ARP Cache Poisoned (DAI Disabled)",
        description: `Attacker broadcasts fake ARP reply claiming 192.168.1.1 is at ${attacker.macAddress}! Victim's ARP cache is poisoned (Man-in-the-Middle).`,
        nodesState: currentNodes,
        linksState: links,
        activePacket: spoofPacket,
        activeLinkIds: ["link-atk-sw", "link-vic-sw"],
        poisonedNodeIds: [victim.id],
        sourceNodeId: attacker.id,
        destNodeId: victim.id,
        severity: "error",
        explanation: {
          beginner:
            "Because standard ARP has no authentication, Host A blindly accepted the lie! Now all of Host A's internet traffic will pass through the attacker.",
          advanced:
            "Classic ARP Cache Poisoning: Attacker overwrites gateway binding with attacker MAC. Enables eavesdropping, SSL stripping, and credential theft.",
          protocolRule: "Security Vulnerability: ARP accepts unsolicited replies without authentication.",
          fieldsChanged: ["victim.arpCache.poisoned"],
        },
      });
    } else {
      // DAI Enabled: Switch drops the packet!
      if (sw) sw.daiEnabled = true;
      addStep({
        title: "2. [BLOCKED] Dynamic ARP Inspection (DAI) Drops Rogue Frame",
        description: `Switch-1 inspects ARP reply on Port Gi0/3 against DHCP Snooping database. Unauthorized IP-MAC mapping is detected and DROPPED!`,
        nodesState: currentNodes,
        linksState: links,
        activePacket: spoofPacket,
        activeLinkIds: ["link-atk-sw"],
        sourceNodeId: attacker.id,
        destNodeId: sw.id,
        severity: "success",
        explanation: {
          beginner:
            "Dynamic ARP Inspection (DAI) on the switch caught the fake packet and threw it away! Host A's ARP cache remained safe.",
          advanced:
            "Switch ASIC compares (IP: 192.168.1.1, MAC: 00:DE:AD:BE:EF:66) against trusted DHCP Snooping bindings. Mismatch on untrusted port Gi0/3 triggers immediate packet drop.",
          protocolRule: "Cisco / IEEE DAI Security: Drop invalid ARP frames and increment security violation counter.",
          fieldsChanged: ["switch.daiDropCount"],
        },
      });
    }
  }

  return { events, packets, steps };
}

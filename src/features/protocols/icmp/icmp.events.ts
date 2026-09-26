import type { SimulationEvent, Packet } from "@/features/simulation/simulation-types";
import type {
  IcmpConfig,
  IcmpNode,
  IcmpLink,
  IcmpSimulationStepState,
  IcmpSimulationOutcome,
  IcmpCliLine,
} from "./icmp.types";
import {
  createEchoRequest,
  generateEchoReply,
  generateTimeExceeded,
  generateFragNeeded,
  generatePortUnreachable,
  generateAdminProhibited,
  generateRedirect,
} from "./icmp-engine";
import { ICMP_PRESETS } from "./icmp.defaults";

export function generateIcmpEventSequence(config: IcmpConfig): IcmpSimulationOutcome {
  const preset = ICMP_PRESETS[config.topologyPreset] || ICMP_PRESETS.standard_internet_path;
  const initialNodes: IcmpNode[] = JSON.parse(JSON.stringify(preset.nodes));
  const initialLinks: IcmpLink[] = JSON.parse(JSON.stringify(preset.links));

  const events: SimulationEvent[] = [];
  const packets: Packet[] = [];
  const steps: IcmpSimulationStepState[] = [];

  const cliOutputs: IcmpCliLine[] = [];

  if (config.scenarioId === "echo_ping_roundtrip") {
    // ----------------------------------------------------
    // Scenario 1: Classic Ping (Echo Request & Reply)
    // ----------------------------------------------------
    cliOutputs.push({
      text: `$ ping -c 4 203.0.113.80`,
      type: "command",
      timestamp: "00:00:00",
    });
    cliOutputs.push({
      text: `PING 203.0.113.80 (203.0.113.80) 56(84) bytes of data.`,
      type: "info",
      timestamp: "00:00:00",
    });

    // Step 0: Host A crafts Echo Request
    const p0 = createEchoRequest(
      "icmp-echo-req-1",
      "192.168.1.10",
      "203.0.113.80",
      0x1a2b,
      1,
      64,
      config.packetSizeBytes
    );

    steps.push({
      step: 0,
      title: "1. Host A Originates ICMP Echo Request (Ping)",
      description: "Host A creates an ICMP Type 8 Code 0 Echo Request (ID=0x1A2B, Seq=1) with 32 bytes of test payload.",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: p0,
      activeLinkIds: ["link-host-r1"],
      activeNodeId: "host-a",
      cliOutputs: [...cliOutputs],
      eventExplanation: {
        beginner: "Host A sends out a ping probe to check if 203.0.113.80 is online and measure latency.",
        advanced: "Raw ICMP socket emits Type 8 Code 0 datagram with Identifier 0x1A2B, Sequence 1, and RFC 1071 Checksum.",
        protocolRule: "RFC 792: Echo Request message initiates end-to-end roundtrip reachability verification.",
        fieldsChanged: ["Type: 8 (Echo Request)", "Code: 0", "Identifier: 0x1A2B", "Sequence: 1"],
      },
    });

    // Step 1: Intermediate Routing R1 -> R2 -> R3
    steps.push({
      step: 1,
      title: "2. Transit Across Internet Routers (R1 -> R2 -> R3)",
      description: "Routers R1, R2, and R3 inspect the destination IP 203.0.113.80, decrement IP TTL (64 -> 63 -> 62), and forward the packet at line rate.",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: { ...p0, ipTtl: 61 },
      activeLinkIds: ["link-r1-r2", "link-r2-r3", "link-r3-server"],
      activeNodeId: "router-2",
      cliOutputs: [...cliOutputs],
      eventExplanation: {
        beginner: "The ping travels swiftly through provider routers along the shortest path toward Server B.",
        advanced: "Hop-by-hop IPv4 forwarding. Each router verifies header checksum, decrements TTL, and forwards out next-hop egress interface.",
        protocolRule: "RFC 1812: IPv4 router decrements TTL by at least 1 at every forwarding hop.",
        fieldsChanged: ["IP TTL: 64 -> 61 (3 Hops Transited)"],
      },
    });

    // Step 2: Target Server B generates Echo Reply (Type 0)
    const replyPkt = generateEchoReply(p0, "203.0.113.80", 23.4);
    cliOutputs.push({
      text: `64 bytes from 203.0.113.80: icmp_seq=1 ttl=61 time=23.4 ms`,
      type: "success",
      timestamp: "00:00:23",
    });

    steps.push({
      step: 2,
      title: "3. Server B Receives Probe & Generates Echo Reply",
      description: "Server B receives Type 8 Echo Request, copies the Identifier (0x1A2B), Sequence (1), and payload, and generates an ICMP Type 0 Code 0 Echo Reply.",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: replyPkt,
      activeLinkIds: ["link-r3-server"],
      activeNodeId: "server-b",
      cliOutputs: [...cliOutputs],
      eventExplanation: {
        beginner: "Server B answers immediately: 'I am here!' It echoes back the exact sequence number so Host A can match the answer.",
        advanced: "Kernel ICMP handler flips IP addresses, sets ICMP Type to 0, recalculates checksum, and returns identical payload.",
        protocolRule: "RFC 792: Target host must return all payload data untouched in the Echo Reply.",
        fieldsChanged: ["Type: 8 -> 0 (Echo Reply)", "Source: 203.0.113.80", "Dest: 192.168.1.10"],
      },
    });

    // Step 3: Echo Reply travels back to Host A
    steps.push({
      step: 3,
      title: "4. Echo Reply Arrives at Host A (RTT: 23.4 ms)",
      description: "Host A receives the Echo Reply, calculates Round-Trip Time (RTT = 23.4 ms), and logs sequence #1 successful delivery.",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: { ...replyPkt, ipTtl: 61 },
      activeLinkIds: ["link-host-r1"],
      activeNodeId: "host-a",
      cliOutputs: [
        ...cliOutputs,
        { text: `64 bytes from 203.0.113.80: icmp_seq=2 ttl=61 time=22.8 ms`, type: "success", timestamp: "00:01:00" },
        { text: `64 bytes from 203.0.113.80: icmp_seq=3 ttl=61 time=24.1 ms`, type: "success", timestamp: "00:02:00" },
        { text: `64 bytes from 203.0.113.80: icmp_seq=4 ttl=61 time=23.0 ms`, type: "success", timestamp: "00:03:00" },
        { text: `--- 203.0.113.80 ping statistics ---`, type: "info", timestamp: "00:03:01" },
        { text: `4 packets transmitted, 4 received, 0% packet loss, time 3004ms`, type: "info", timestamp: "00:03:01" },
        { text: `rtt min/avg/max/mdev = 22.8/23.3/24.1/0.5 ms`, type: "info", timestamp: "00:03:01" },
      ],
      eventExplanation: {
        beginner: "Ping succeeded with 0% packet loss and an average latency of 23.3 milliseconds!",
        advanced: "Client socket correlates incoming sequence #1 to start timestamp, computing high-precision RTT and jitter statistics.",
        protocolRule: "Full bidirectional Layer 3 path reachability confirmed.",
        fieldsChanged: ["Packets Received: 4/4 (100%)", "Avg RTT: 23.3 ms"],
      },
    });
  } else if (config.scenarioId === "traceroute_ttl_exceeded") {
    // ----------------------------------------------------
    // Scenario 2: Traceroute (Hop-by-Hop TTL Exceeded)
    // ----------------------------------------------------
    cliOutputs.push({
      text: `$ traceroute 203.0.113.80`,
      type: "command",
      timestamp: "00:00:00",
    });
    cliOutputs.push({
      text: `traceroute to 203.0.113.80 (203.0.113.80), 30 hops max, 60 byte packets`,
      type: "info",
      timestamp: "00:00:00",
    });

    // Probe 1: TTL = 1
    const p1 = createEchoRequest("trace-probe-1", "192.168.1.10", "203.0.113.80", 0x3344, 1, 1, 60);
    const ttl1Resp = generateTimeExceeded(p1, "192.168.1.1", 1.2);

    steps.push({
      step: 0,
      title: "1. Probe 1 (TTL=1) -> Gateway R1 Expires (Time Exceeded)",
      description: "Host A emits Probe 1 with TTL=1. Router R1 decrements TTL to 0, drops the datagram, and returns ICMP Type 11 Code 0 (Time Exceeded) quoting the original probe.",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: ttl1Resp,
      activeLinkIds: ["link-host-r1"],
      activeNodeId: "router-1",
      cliOutputs: [
        ...cliOutputs,
        { text: ` 1  192.168.1.1 (gateway.lan)  1.214 ms  1.189 ms  1.230 ms`, type: "success", timestamp: "00:00:01" },
      ],
      eventExplanation: {
        beginner: "Host A sets TTL=1 so the very first router on the path runs out of time and reports its identity (192.168.1.1).",
        advanced: "R1 decrements TTL from 1 to 0. RFC 792 specifies that R1 must drop the frame and emit ICMP Type 11 Code 0 with the quoted IP header.",
        protocolRule: "RFC 792 Section 'Time Exceeded': Generated when gateway drops a datagram with TTL expired in transit.",
        fieldsChanged: ["Hop 1 Discovered: 192.168.1.1", "ICMP Type: 11 (Time Exceeded)", "Code: 0"],
      },
    });

    // Probe 2: TTL = 2
    const p2 = createEchoRequest("trace-probe-2", "192.168.1.10", "203.0.113.80", 0x3344, 2, 2, 60);
    const ttl2Resp = generateTimeExceeded(p2, "10.0.1.2", 9.8);

    steps.push({
      step: 1,
      title: "2. Probe 2 (TTL=2) -> Core Router R2 Expires",
      description: "Host A emits Probe 2 with TTL=2. R1 decrements to TTL=1 and forwards. R2 decrements TTL to 0, drops, and returns ICMP Type 11 Code 0 (Time Exceeded at 10.0.1.2).",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: ttl2Resp,
      activeLinkIds: ["link-r1-r2"],
      activeNodeId: "router-2",
      cliOutputs: [
        ...cliOutputs,
        { text: ` 1  192.168.1.1 (gateway.lan)  1.214 ms  1.189 ms  1.230 ms`, type: "success", timestamp: "00:00:01" },
        { text: ` 2  10.0.1.2 (isp-core.net)  9.842 ms  9.711 ms  9.905 ms`, type: "success", timestamp: "00:00:02" },
      ],
      eventExplanation: {
        beginner: "Probe with TTL=2 crosses the first router and expires at the second router (10.0.1.2). Hop 2 discovered!",
        advanced: "R2 receives frame with TTL=1, decrements to 0, and returns ICMP Type 11 Code 0. Originating socket matches sequence to Hop 2.",
        protocolRule: "Traceroute algorithm increments TTL by +1 per round to systematically unveil the topology hop-by-hop.",
        fieldsChanged: ["Hop 2 Discovered: 10.0.1.2", "RTT: 9.8 ms"],
      },
    });

    // Probe 3: TTL = 3
    const p3 = createEchoRequest("trace-probe-3", "192.168.1.10", "203.0.113.80", 0x3344, 3, 3, 60);
    const ttl3Resp = generateTimeExceeded(p3, "10.0.2.2", 21.5);

    steps.push({
      step: 2,
      title: "3. Probe 3 (TTL=3) -> Edge Router R3 Expires",
      description: "Host A emits Probe 3 with TTL=3. R3 decrements TTL to 0 and returns ICMP Type 11 Code 0 (Time Exceeded at 10.0.2.2).",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: ttl3Resp,
      activeLinkIds: ["link-r2-r3"],
      activeNodeId: "router-3",
      cliOutputs: [
        ...cliOutputs,
        { text: ` 1  192.168.1.1 (gateway.lan)  1.214 ms  1.189 ms  1.230 ms`, type: "success", timestamp: "00:00:01" },
        { text: ` 2  10.0.1.2 (isp-core.net)  9.842 ms  9.711 ms  9.905 ms`, type: "success", timestamp: "00:00:02" },
        { text: ` 3  10.0.2.2 (dc-edge.net)  21.512 ms  21.401 ms  21.620 ms`, type: "success", timestamp: "00:00:03" },
      ],
      eventExplanation: {
        beginner: "Hop 3 discovered! Router R3 reports its IP address 10.0.2.2.",
        advanced: "Hop 3 discovered at data center edge router with 21.5ms latency.",
        protocolRule: "Intermediate router quoting guarantees probe correlation.",
        fieldsChanged: ["Hop 3 Discovered: 10.0.2.2", "RTT: 21.5 ms"],
      },
    });

    // Probe 4: TTL = 4 (Reaches Destination Server B)
    const p4 = createEchoRequest("trace-probe-4", "192.168.1.10", "203.0.113.80", 0x3344, 4, 4, 60);
    const finalResp = generateEchoReply(p4, "203.0.113.80", 24.1);

    steps.push({
      step: 3,
      title: "4. Probe 4 (TTL=4) Reaches Target Server B (Traceroute Complete)",
      description: "Probe 4 arrives at destination Server B with TTL=1. Since Server B is the final destination, it processes the probe and returns Echo Reply (or Port Unreachable), completing the traceroute!",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: finalResp,
      activeLinkIds: ["link-r3-server"],
      activeNodeId: "server-b",
      cliOutputs: [
        ...cliOutputs,
        { text: ` 1  192.168.1.1 (gateway.lan)  1.214 ms  1.189 ms  1.230 ms`, type: "success", timestamp: "00:00:01" },
        { text: ` 2  10.0.1.2 (isp-core.net)  9.842 ms  9.711 ms  9.905 ms`, type: "success", timestamp: "00:00:02" },
        { text: ` 3  10.0.2.2 (dc-edge.net)  21.512 ms  21.401 ms  21.620 ms`, type: "success", timestamp: "00:00:03" },
        { text: ` 4  203.0.113.80 (web-srv.net)  24.110 ms  23.980 ms  24.250 ms`, type: "success", timestamp: "00:00:04" },
      ],
      eventExplanation: {
        beginner: "Destination reached! We mapped all 4 router hops from home all the way to the cloud server.",
        advanced: "Traceroute trace terminated upon receiving Type 0 Echo Reply from the destination host. Complete path topology reconstructed.",
        protocolRule: "Traceroute termination upon destination response.",
        fieldsChanged: ["Total Hops: 4", "Destination: 203.0.113.80 (Reached)"],
      },
    });
  } else if (config.scenarioId === "pmtud_df_fragmentation_needed") {
    // ----------------------------------------------------
    // Scenario 3: Path MTU Discovery (PMTUD & Frag Needed)
    // ----------------------------------------------------
    cliOutputs.push({
      text: `$ ping -s 1472 -M do 203.0.113.80 (Testing PMTUD with 1500B frame, DF=1)`,
      type: "command",
      timestamp: "00:00:00",
    });

    const p0 = createEchoRequest(
      "pmtud-pkt-1",
      "192.168.10.5",
      "203.0.113.80",
      0x5a1b,
      1,
      64,
      1500 // 1500 Bytes
    );

    steps.push({
      step: 0,
      title: "1. Client Sends 1500-Byte Packet with DF=1",
      description: "Client sends a full-size 1500-byte datagram with IP flag DF=1 (Don't Fragment) into its 1500-byte local network.",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: p0,
      activeLinkIds: ["link-client-r1"],
      activeNodeId: "client-a",
      cliOutputs: [...cliOutputs],
      eventExplanation: {
        beginner: "Client sends a standard large 1500-byte packet with a 'Do Not Cut / Do Not Fragment' sticker attached.",
        advanced: "IPv4 header bit 14 set: `DF = 1` (Don't Fragment). Total length = 1500 bytes.",
        protocolRule: "RFC 1191: Senders set DF=1 to discover the minimum MTU across the entire path.",
        fieldsChanged: ["Packet Size: 1500 Bytes", "Flag: DF=1 (Don't Fragment)"],
      },
    });

    // Step 1: Edge Router R1 detects MTU 1300 bottleneck -> Drops packet
    const fragNeededPkt = generateFragNeeded(p0, 1300, "192.168.10.1");

    cliOutputs.push({
      text: `From 192.168.10.1 icmp_seq=1 Frag needed and DF set (mtu = 1300)`,
      type: "warning",
      timestamp: "00:00:01",
    });

    steps.push({
      step: 1,
      title: "2. Edge R1 Drops Oversized Packet & Sends ICMP 'Frag Needed'",
      description: "Edge Router R1 must forward over WAN Tunnel (MTU 1300). Since 1500 > 1300 and DF=1, R1 DROPS the packet and generates ICMP Type 3 Code 4 specifying Next-Hop MTU: 1300.",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: fragNeededPkt,
      activeLinkIds: ["link-client-r1"],
      activeNodeId: "edge-r1",
      cliOutputs: [...cliOutputs],
      eventExplanation: {
        beginner: "The WAN tunnel is too narrow (1300 bytes). Because the packet says 'Don't Cut', the router drops it and sends back a note: 'Maximum allowed is 1300 bytes!'",
        advanced: "Router drops datagram and emits ICMP Type 3 Code 4. Populates bytes 6-7 with `Next-Hop MTU: 1300` per RFC 1191.",
        protocolRule: "RFC 1191 Section 4: Routers must provide next-hop MTU in the ICMP header to avoid blind MTU probing.",
        fieldsChanged: ["Status: DROPPED at R1", "ICMP Type: 3 Code 4", "Next-Hop MTU: 1300"],
      },
    });

    // Step 2: Client updates Route Cache for 203.0.113.80 -> 1300
    const updatedNodes = initialNodes.map((n) =>
      n.id === "client-a" ? { ...n, pathMtuCache: { "203.0.113.80": 1300 } } : n
    );

    cliOutputs.push({
      text: `[Kernel PMTUD]: Updated Path MTU Cache for 203.0.113.80 -> 1300 bytes`,
      type: "info",
      timestamp: "00:00:02",
    });

    steps.push({
      step: 2,
      title: "3. Client Updates Socket Path MTU Cache to 1300 Bytes",
      description: "Client receives ICMP Type 3 Code 4, parses Next-Hop MTU = 1300, and updates its kernel Path MTU Cache for 203.0.113.80.",
      nodes: updatedNodes,
      links: initialLinks,
      activePacket: undefined,
      activeLinkIds: [],
      activeNodeId: "client-a",
      cliOutputs: [...cliOutputs],
      eventExplanation: {
        beginner: "The client learns the exact size limit and shrinks its transmissions to 1300 bytes.",
        advanced: "OS kernel modifies route cache entry for destination IP: `Path MTU: 1300`. TCP connections recalculate MSS.",
        protocolRule: "RFC 1191: Host must cache MTU value for at least 10 minutes before re-probing.",
        fieldsChanged: ["Host Path MTU Cache: 203.0.113.80 -> 1300 Bytes"],
      },
    });

    // Step 3: Client retransmits sized to 1300 bytes -> Transits smoothly
    const p1300 = createEchoRequest(
      "pmtud-pkt-2",
      "192.168.10.5",
      "203.0.113.80",
      0x5a1b,
      2,
      64,
      1300 // Resized to 1300 bytes!
    );

    steps.push({
      step: 3,
      title: "4. Client Retransmits Sized to 1300 Bytes (Seamless Transit)",
      description: "Client sends resized 1300-byte packet with DF=1. It passes through the WAN tunnel with 0 fragmentation and reaches Server B!",
      nodes: updatedNodes,
      links: initialLinks,
      activePacket: p1300,
      activeLinkIds: ["link-client-r1", "link-r1-r2-tunnel", "link-r2-webserver"],
      activeNodeId: "core-r2",
      cliOutputs: [
        ...cliOutputs,
        { text: `1300 bytes from 203.0.113.80: icmp_seq=2 ttl=62 time=27.4 ms`, type: "success", timestamp: "00:00:27" },
      ],
      eventExplanation: {
        beginner: "The resized packet fits through the tunnel perfectly with zero packet loss!",
        advanced: "Datagram size (1300B) <= Tunnel MTU (1300B). Forwarded at line rate without fragmentation.",
        protocolRule: "PMTUD optimization successful: Maximum transmission efficiency achieved.",
        fieldsChanged: ["Packet Size: 1300 Bytes", "Status: Delivered"],
      },
    });
  } else if (config.scenarioId === "dest_port_unreachable") {
    // ----------------------------------------------------
    // Scenario 4: Destination Port Unreachable
    // ----------------------------------------------------
    cliOutputs.push({
      text: `$ nc -u -z -v 203.0.113.80 33434 (Testing UDP Port 33434)`,
      type: "command",
      timestamp: "00:00:00",
    });

    const p0 = createEchoRequest("udp-probe-1", "192.168.1.10", "203.0.113.80", 0x7788, 1, 64, 60);

    steps.push({
      step: 0,
      title: "1. Host A Sends UDP Probe to Closed Port 33434",
      description: "Host A transmits a UDP probe to destination port 33434 on Server B.",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: p0,
      activeLinkIds: ["link-host-r1", "link-r1-r2", "link-r2-r3", "link-r3-server"],
      activeNodeId: "host-a",
      cliOutputs: [...cliOutputs],
      eventExplanation: {
        beginner: "Host A knocks on port 33434 on Server B.",
        advanced: "UDP datagram directed to destination port 33434 transits the network to destination host.",
        protocolRule: "RFC 768 / RFC 792: UDP probe to target endpoint.",
      },
    });

    const portUnreachPkt = generatePortUnreachable(p0, "203.0.113.80", 33434);

    cliOutputs.push({
      text: `From 203.0.113.80: icmp_seq=1 Destination Port Unreachable (Port 33434 closed)`,
      type: "error",
      timestamp: "00:00:24",
    });

    steps.push({
      step: 1,
      title: "2. Server B Rejects with ICMP Destination Port Unreachable (Type 3 Code 3)",
      description: "Server B receives the datagram, checks its listening sockets, finds no application bound to UDP 33434, and returns ICMP Type 3 Code 3.",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: portUnreachPkt,
      activeLinkIds: ["link-r3-server"],
      activeNodeId: "server-b",
      cliOutputs: [...cliOutputs],
      eventExplanation: {
        beginner: "Server B answers: 'No application is listening on port 33434!'",
        advanced: "Kernel socket lookup fails. Emits ICMP Type 3 Code 3 quoting the original IP header + UDP ports.",
        protocolRule: "RFC 792: Destination host generates Port Unreachable when no active process matches the transport port.",
        fieldsChanged: ["ICMP Type: 3 (Destination Unreachable)", "Code: 3 (Port Unreachable)"],
      },
    });
  } else if (config.scenarioId === "firewall_admin_prohibited") {
    // ----------------------------------------------------
    // Scenario 5: Administratively Prohibited (Firewall Drop)
    // ----------------------------------------------------
    cliOutputs.push({
      text: `$ ping 203.0.113.80 (Attempting connection through protected firewall)`,
      type: "command",
      timestamp: "00:00:00",
    });

    const p0 = createEchoRequest("fw-probe-1", "192.168.1.10", "203.0.113.80", 0x99aa, 1, 64, 64);

    steps.push({
      step: 0,
      title: "1. Host A Sends Probe Toward Protected Server",
      description: "Host A transmits traffic toward Server B through the enterprise security perimeter.",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: p0,
      activeLinkIds: ["link-host-r1", "link-r1-r2", "link-r2-fw1"],
      activeNodeId: "host-a",
      cliOutputs: [...cliOutputs],
      eventExplanation: {
        beginner: "Host A attempts to reach the server located behind Firewall FW1.",
        advanced: "Datagram reaches Firewall FW1 interface eth1 for stateful inspection.",
        protocolRule: "Perimeter firewall evaluates security policy rulebase.",
      },
    });

    const adminDropPkt = generateAdminProhibited(p0, "10.0.3.1");

    cliOutputs.push({
      text: `From 10.0.3.1: icmp_seq=1 Communication Administratively Prohibited (Firewall ACL Drop)`,
      type: "error",
      timestamp: "00:00:15",
    });

    steps.push({
      step: 1,
      title: "2. Firewall FW1 Drops Traffic & Emits ICMP Type 3 Code 13",
      description: "Firewall FW1 matches deny rule, drops the packet, and responds with ICMP Type 3 Code 13 (Communication Administratively Prohibited).",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: adminDropPkt,
      activeLinkIds: ["link-r2-fw1"],
      activeNodeId: "firewall-1",
      cliOutputs: [...cliOutputs],
      eventExplanation: {
        beginner: "Firewall blocks the request and actively returns an administrative rejection.",
        advanced: "ACL rule matched `DENY ICMP`. FW1 returns ICMP Type 3 Code 13 to notify client without waiting for timeout.",
        protocolRule: "RFC 1812: Administratively prohibited ICMP message indicates policy block.",
        fieldsChanged: ["Action: BLOCKED by Firewall", "ICMP Type: 3", "Code: 13"],
      },
    });
  } else {
    // ----------------------------------------------------
    // Scenario 6: ICMP Redirect (Optimal Gateway Notification)
    // ----------------------------------------------------
    cliOutputs.push({
      text: `$ ping 10.50.0.100 (Host A default GW is R1 192.168.1.1)`,
      type: "command",
      timestamp: "00:00:00",
    });

    const p0 = createEchoRequest("redir-probe-1", "192.168.1.10", "10.50.0.100", 0xbbcc, 1, 64, 64);

    steps.push({
      step: 0,
      title: "1. Host A Sends Packet to Default Gateway R1",
      description: "Host A sends packet to default gateway R1 (192.168.1.1) destined for remote server 10.50.0.100.",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: p0,
      activeLinkIds: ["link-host-r1"],
      activeNodeId: "host-a",
      cliOutputs: [...cliOutputs],
      eventExplanation: {
        beginner: "Host A uses its default router R1 to reach a remote network.",
        advanced: "Host sends frame to default gateway 192.168.1.1 on local subnet.",
        protocolRule: "Host forwards non-local subnet traffic to default gateway.",
      },
    });

    const redirPkt = generateRedirect(p0, "192.168.1.2", "192.168.1.1");

    cliOutputs.push({
      text: `[ICMP Redirect]: R1 (192.168.1.1) redirect for host 10.50.0.100 to R2 (192.168.1.2)`,
      type: "warning",
      timestamp: "00:00:02",
    });

    steps.push({
      step: 1,
      title: "2. Gateway R1 Forwards to R2 & Sends ICMP Redirect to Host A",
      description: "R1 recognizes that optimal next-hop R2 (192.168.1.2) is on the same local subnet. R1 forwards the packet to R2 and sends ICMP Type 5 Code 1 Redirect to Host A.",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: redirPkt,
      activeLinkIds: ["link-r1-r2", "link-host-r1"],
      activeNodeId: "router-1",
      cliOutputs: [...cliOutputs],
      eventExplanation: {
        beginner: "Router R1 forwards the packet to R2 and tells Host A: 'Router R2 is right next to you! Send directly to R2 next time.'",
        advanced: "Ingress interface == Egress interface. R1 emits ICMP Type 5 Code 1 carrying `Gateway Address: 192.168.1.2`.",
        protocolRule: "RFC 792: ICMP Redirect sent when next-hop router resides on the same broadcast subnet as source.",
        fieldsChanged: ["ICMP Type: 5 (Redirect)", "Code: 1", "Optimal Gateway: 192.168.1.2"],
      },
    });

    steps.push({
      step: 2,
      title: "3. Host A Updates Routing Cache & Sends Directly to R2",
      description: "Host A updates its route cache (`10.50.0.100 -> via 192.168.1.2`). Subsequent packets bypass R1 completely, cutting local subnet traffic in half.",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: createEchoRequest("redir-probe-2", "192.168.1.10", "10.50.0.100", 0xbbcc, 2, 64, 64),
      activeLinkIds: ["link-host-r2", "link-r2-server"],
      activeNodeId: "router-2",
      cliOutputs: [
        ...cliOutputs,
        { text: `64 bytes from 10.50.0.100: icmp_seq=1 ttl=63 time=12.2 ms (via direct route R2)`, type: "success", timestamp: "00:00:12" },
      ],
      eventExplanation: {
        beginner: "Host A sends directly to R2 from now on, optimizing bandwidth!",
        advanced: "Host kernel creates a transient host route cache entry for 10.50.0.100 pointing to 192.168.1.2.",
        protocolRule: "ICMP Redirect delivers dynamic first-hop optimization.",
        fieldsChanged: ["Route Cache: 10.50.0.100 -> 192.168.1.2", "Subnet Efficiency: +50%"],
      },
    });
  }

  // Populate events and packets arrays for platform compatibility
  steps.forEach((step, idx) => {
    const src = step.activeNodeId || "host-a";
    const tgt = step.activePacket?.destIp || "server-b";

    events.push({
      id: `icmp-evt-${idx}`,
      timestamp: idx * 1000,
      sequenceNumber: idx + 1,
      type: "packet-sent",
      sourceNodeId: src,
      destinationNodeId: tgt,
      protocol: "icmp",
      title: step.title,
      description: step.description,
      status: "completed",
      severity: "info",
    });

    if (step.activePacket) {
      const isError = step.activePacket.isErrorResponse;
      packets.push({
        id: `icmp-pkt-${idx}`,
        label: `ICMP [T:${step.activePacket.icmpHeader.type} C:${step.activePacket.icmpHeader.code}]`,
        source: step.activePacket.sourceIp,
        destination: step.activePacket.destIp,
        protocol: "ICMP",
        size: step.activePacket.totalLengthBytes,
        status: "delivered",
        colorKey: isError ? "amber" : step.activePacket.icmpHeader.type === 0 ? "emerald" : "blue",
        createdAt: idx * 1000,
        headers: {
          ethernet: {
            etherType: "0x0800",
          },
          ipv4: {
            src: step.activePacket.sourceIp,
            dst: step.activePacket.destIp,
            ttl: step.activePacket.ipTtl,
          },
        },
        payload: step.activePacket.payloadSummary,
      });
    }
  });

  return {
    events,
    packets,
    steps,
    finalNodes: initialNodes,
    finalLinks: initialLinks,
    summaryStats: {
      packetsTransmitted: 4,
      packetsReceived: 4,
      packetLossPercent: 0,
      minRttMs: 22.8,
      avgRttMs: 23.3,
      maxRttMs: 24.1,
      discoveredPathMtu: 1300,
    },
  };
}

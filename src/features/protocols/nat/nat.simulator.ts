import type {
  NatConfig,
  NatTranslationEntry,
  NatSimulationEvent,
  NatSimulationPacket,
  NatSimulationOutcome,
  NatScenarioId,
} from "./nat.types";
import { defaultNatConfig, defaultTranslationTable } from "./nat.defaults";

export function simulateNatTransaction(
  customConfig?: Partial<NatConfig>,
  scenarioId: NatScenarioId = "pat_web_browse"
): NatSimulationOutcome {
  const config: NatConfig = { ...defaultNatConfig, ...customConfig };
  const events: NatSimulationEvent[] = [];
  const packets: NatSimulationPacket[] = [];
  const translationTable: NatTranslationEntry[] = [...defaultTranslationTable];

  let totalTranslated = 0;
  let droppedPackets = 0;

  // ----------------------------------------------------
  // Scenario 1: Port Exhaustion Stress Test (4 Steps)
  // ----------------------------------------------------
  if (scenarioId === "port_exhaustion") {
    events.push({
      step: 1,
      type: "packet-originated",
      title: "Outbound Client Request (Connection 65,535)",
      summary: "Workstation A sends TCP SYN to 93.184.216.34:443",
      explanation: "Client initiates new connection request from private IP 192.168.1.10:65534.",
      sourceNodeId: "pc-1",
      destNodeId: "nat-router",
      protocol: "TCP",
      rfcReference: "RFC 1918 / RFC 791",
      technicalDetails: [
        "Inside Local: 192.168.1.10:65534",
        "Outside Global: 93.184.216.34:443",
        "Stateful inspection requested at NAT Gateway.",
      ],
      beforeHeader: { srcIp: "192.168.1.10", srcPort: 65534, dstIp: "93.184.216.34", dstPort: 443 },
      afterHeader: { srcIp: "192.168.1.10", srcPort: 65534, dstIp: "93.184.216.34", dstPort: 443 },
    });

    packets.push({
      id: "pkt-1",
      stepIndex: 1,
      sourceId: "pc-1",
      targetId: "nat-router",
      protocol: "TCP",
      direction: "outbound",
      srcIp: "192.168.1.10",
      srcPort: 65534,
      dstIp: "93.184.216.34",
      dstPort: 443,
      isTranslated: false,
      label: "192.168.1.10:65534 -> 93.184.216.34:443",
      progress: 100,
      status: "delivered",
    });

    events.push({
      step: 2,
      type: "nat-lookup",
      title: "NAT Table Search & Ephemeral Port Check",
      summary: "NAT Gateway scans range 1024-65535 for an available public port",
      explanation: "All 64,512 available ephemeral ports on public IP 203.0.113.1 are currently bound to active sockets.",
      sourceNodeId: "nat-router",
      destNodeId: "nat-router",
      protocol: "TCP",
      rfcReference: "RFC 4787 / RFC 3022",
      technicalDetails: [
        "Public IP: 203.0.113.1",
        "Ephemeral Range: 1024 - 65535",
        "Available Ports: 0 (100% Port Exhaustion)",
      ],
      beforeHeader: { srcIp: "192.168.1.10", srcPort: 65534, dstIp: "93.184.216.34", dstPort: 443 },
      afterHeader: { srcIp: "192.168.1.10", srcPort: 65534, dstIp: "93.184.216.34", dstPort: 443 },
    });

    events.push({
      step: 3,
      type: "packet-dropped",
      title: "PAT Ephemeral Port Pool Exhausted!",
      summary: "NAT Gateway cannot allocate a public port (NAT_TABLE_FULL)",
      explanation: "Ephemeral port overload table is 100% full. Packet is silently dropped.",
      sourceNodeId: "nat-router",
      destNodeId: "nat-router",
      protocol: "TCP",
      rfcReference: "RFC 4787 Section 4.1",
      technicalDetails: [
        "Error: NAT_TABLE_FULL (Port Exhaustion)",
        "Active Translations: 64,512 entries on public IP 203.0.113.1",
        "Action: Silently drop packet (TCP SYN Timeout at Client)",
      ],
      beforeHeader: { srcIp: "192.168.1.10", srcPort: 65534, dstIp: "93.184.216.34", dstPort: 443 },
      afterHeader: { srcIp: "192.168.1.10", srcPort: 65534, dstIp: "93.184.216.34", dstPort: 443 },
    });

    packets.push({
      id: "pkt-2",
      stepIndex: 3,
      sourceId: "nat-router",
      targetId: "nat-router",
      protocol: "TCP",
      direction: "outbound",
      srcIp: "192.168.1.10",
      srcPort: 65534,
      dstIp: "93.184.216.34",
      dstPort: 443,
      isTranslated: false,
      label: "DROPPED (NAT Port Exhaustion)",
      progress: 50,
      status: "dropped",
    });

    events.push({
      step: 4,
      type: "packet-dropped",
      title: "Client Connection Timeout",
      summary: "Workstation A encounters TCP SYN retransmission timeout",
      explanation: "No ACK response received. Host retransmits SYN packet after 3 seconds.",
      sourceNodeId: "pc-1",
      destNodeId: "pc-1",
      protocol: "TCP",
      rfcReference: "RFC 6298",
      technicalDetails: [
        "Status: ETIMEDOUT (Connection Timed Out)",
        "Remediation: Increase NAT timeout, add public IP pool, or implement CGNAT.",
      ],
      beforeHeader: { srcIp: "192.168.1.10", srcPort: 65534, dstIp: "93.184.216.34", dstPort: 443 },
      afterHeader: { srcIp: "192.168.1.10", srcPort: 65534, dstIp: "93.184.216.34", dstPort: 443 },
    });

    droppedPackets += 1;

    return {
      config,
      translationTable,
      events,
      packets,
      totalTranslated,
      droppedPackets,
    };
  }

  // ----------------------------------------------------
  // Scenario 2: Static Server DNAT / Port Forwarding (6 Steps)
  // ----------------------------------------------------
  if (scenarioId === "static_server_dnat" || config.mode === "dnat") {
    events.push({
      step: 1,
      type: "packet-originated",
      title: "External Inbound WAN Web Request",
      summary: "Public client (198.51.100.50:52100) sends HTTP request to 203.0.113.1:8080",
      explanation: "Outside Internet client sends TCP SYN packet to gateway public IP on forwarded Port 8080.",
      sourceNodeId: "isp-router",
      destNodeId: "nat-router",
      protocol: "TCP",
      rfcReference: "RFC 3022 Section 4.2",
      technicalDetails: [
        "Source IP: 198.51.100.50 (WAN Public Host)",
        "Source Port: 52100",
        "Destination IP: 203.0.113.1 (NAT Gateway Public IP)",
        "Destination Port: 8080 (Public Forwarded Port)",
      ],
      beforeHeader: { srcIp: "198.51.100.50", srcPort: 52100, dstIp: "203.0.113.1", dstPort: 8080 },
      afterHeader: { srcIp: "198.51.100.50", srcPort: 52100, dstIp: "203.0.113.1", dstPort: 8080 },
    });

    packets.push({
      id: "pkt-dnat-1",
      stepIndex: 1,
      sourceId: "isp-router",
      targetId: "nat-router",
      protocol: "TCP",
      direction: "inbound",
      srcIp: "198.51.100.50",
      srcPort: 52100,
      dstIp: "203.0.113.1",
      dstPort: 8080,
      isTranslated: false,
      label: "198.51.100.50:52100 -> 203.0.113.1:8080",
      progress: 100,
      status: "delivered",
    });

    events.push({
      step: 2,
      type: "nat-lookup",
      title: "DNAT Static Rule Table Match",
      summary: "Matching DNAT rule: Public Port 8080 -> 192.168.1.100:80",
      explanation: "NAT Router checks port forwarding table and finds static mapping targeting internal LAN web server.",
      sourceNodeId: "nat-router",
      destNodeId: "nat-router",
      protocol: "TCP",
      rfcReference: "RFC 3022",
      technicalDetails: [
        "DNAT Static Mapping: 203.0.113.1:8080 -> 192.168.1.100:80",
        "Protocol: TCP",
        "Action: Rewrite Destination IP & Destination Port",
      ],
      beforeHeader: { srcIp: "198.51.100.50", srcPort: 52100, dstIp: "203.0.113.1", dstPort: 8080 },
      afterHeader: { srcIp: "198.51.100.50", srcPort: 52100, dstIp: "192.168.1.100", dstPort: 80 },
    });

    events.push({
      step: 3,
      type: "header-rewritten",
      title: "Destination Header Rewritten (DNAT)",
      summary: "Dst IP rewritten from 203.0.113.1:8080 to 192.168.1.100:80",
      explanation: "Destination IP & Port modified to point to internal LAN web server.",
      sourceNodeId: "nat-router",
      destNodeId: "pc-1",
      protocol: "TCP",
      rfcReference: "RFC 1624 / RFC 3022",
      technicalDetails: [
        "Original Dst: 203.0.113.1:8080",
        "Translated Dst: 192.168.1.100:80",
        "Checksum Recalculated: IP & TCP Checksums updated",
      ],
      beforeHeader: { srcIp: "198.51.100.50", srcPort: 52100, dstIp: "203.0.113.1", dstPort: 8080 },
      afterHeader: { srcIp: "198.51.100.50", srcPort: 52100, dstIp: "192.168.1.100", dstPort: 80 },
    });

    packets.push({
      id: "pkt-dnat-2",
      stepIndex: 3,
      sourceId: "nat-router",
      targetId: "pc-1",
      protocol: "TCP",
      direction: "inbound",
      srcIp: "198.51.100.50",
      srcPort: 52100,
      dstIp: "192.168.1.100",
      dstPort: 80,
      isTranslated: true,
      label: "198.51.100.50:52100 -> 192.168.1.100:80 (DNAT)",
      progress: 100,
      status: "delivered",
    });

    events.push({
      step: 4,
      type: "forwarded",
      title: "Internal Web Server Receives Request",
      summary: "Internal Server (192.168.1.100) processes HTTP request and generates SYN-ACK response",
      explanation: "Server receives request and prepares HTTP response to 198.51.100.50:52100.",
      sourceNodeId: "pc-1",
      destNodeId: "nat-router",
      protocol: "TCP",
      rfcReference: "RFC 793",
      technicalDetails: [
        "Internal Server Response: 192.168.1.100:80 -> 198.51.100.50:52100",
      ],
      beforeHeader: { srcIp: "192.168.1.100", srcPort: 80, dstIp: "198.51.100.50", dstPort: 52100 },
      afterHeader: { srcIp: "192.168.1.100", srcPort: 80, dstIp: "198.51.100.50", dstPort: 52100 },
    });

    events.push({
      step: 5,
      type: "header-rewritten",
      title: "Outbound De-NAT Source Header Translation",
      summary: "Src IP rewritten from 192.168.1.100:80 back to 203.0.113.1:8080",
      explanation: "NAT Router modifies response source IP to match public gateway IP so external client receives response seamlessly.",
      sourceNodeId: "nat-router",
      destNodeId: "isp-router",
      protocol: "TCP",
      rfcReference: "RFC 3022 Section 4.2",
      technicalDetails: [
        "Translated Source: 203.0.113.1:8080",
        "Original Source: 192.168.1.100:80",
        "Checksum Recalculated: IP & TCP Checksums updated",
      ],
      beforeHeader: { srcIp: "192.168.1.100", srcPort: 80, dstIp: "198.51.100.50", dstPort: 52100 },
      afterHeader: { srcIp: "203.0.113.1", srcPort: 8080, dstIp: "198.51.100.50", dstPort: 52100 },
    });

    packets.push({
      id: "pkt-dnat-3",
      stepIndex: 5,
      sourceId: "nat-router",
      targetId: "isp-router",
      protocol: "TCP",
      direction: "outbound",
      srcIp: "203.0.113.1",
      srcPort: 8080,
      dstIp: "198.51.100.50",
      dstPort: 52100,
      isTranslated: true,
      label: "203.0.113.1:8080 -> 198.51.100.50:52100 (Response)",
      progress: 100,
      status: "delivered",
    });

    events.push({
      step: 6,
      type: "forwarded",
      title: "External Client Receives Response",
      summary: "Public client on WAN receives HTTP 200 OK from 203.0.113.1:8080",
      explanation: "External client receives web page. Connection established through DNAT port forwarding.",
      sourceNodeId: "isp-router",
      destNodeId: "isp-router",
      protocol: "TCP",
      rfcReference: "RFC 793",
      technicalDetails: [
        "Status: HTTP/1.1 200 OK",
        "DNAT Transaction Completed Successfully.",
      ],
      beforeHeader: { srcIp: "203.0.113.1", srcPort: 8080, dstIp: "198.51.100.50", dstPort: 52100 },
      afterHeader: { srcIp: "203.0.113.1", srcPort: 8080, dstIp: "198.51.100.50", dstPort: 52100 },
    });

    totalTranslated += 2;

    return {
      config,
      translationTable,
      events,
      packets,
      totalTranslated,
      droppedPackets,
    };
  }

  // ----------------------------------------------------
  // Scenario 3: Dynamic NAT IP Pool Allocation (6 Steps)
  // ----------------------------------------------------
  if (scenarioId === "dynamic_ip_pool" || config.mode === "dynamic") {
    events.push({
      step: 1,
      type: "packet-originated",
      title: "Workstation A Sends Request to Internet",
      summary: "Host A (192.168.1.10) sends outbound TCP SYN to 93.184.216.34:80",
      explanation: "Client requests dynamic 1:1 public IP allocation from NAT pool.",
      sourceNodeId: "pc-1",
      destNodeId: "nat-router",
      protocol: "TCP",
      rfcReference: "RFC 3022 Section 4.1",
      technicalDetails: [
        "Inside Local IP: 192.168.1.10",
        "Public IP Pool Range: 203.0.113.10 - 203.0.113.15",
      ],
      beforeHeader: { srcIp: "192.168.1.10", srcPort: 50100, dstIp: "93.184.216.34", dstPort: 80 },
      afterHeader: { srcIp: "192.168.1.10", srcPort: 50100, dstIp: "93.184.216.34", dstPort: 80 },
    });

    packets.push({
      id: "pkt-dyn-1",
      stepIndex: 1,
      sourceId: "pc-1",
      targetId: "nat-router",
      protocol: "TCP",
      direction: "outbound",
      srcIp: "192.168.1.10",
      srcPort: 50100,
      dstIp: "93.184.216.34",
      dstPort: 80,
      isTranslated: false,
      label: "192.168.1.10:50100 -> 93.184.216.34:80",
      progress: 100,
      status: "delivered",
    });

    events.push({
      step: 2,
      type: "nat-lookup",
      title: "Dynamic Pool IP Allocation",
      summary: "NAT Router assigns Public IP 203.0.113.10 from pool to Host A",
      explanation: "Router allocates dedicated public IPv4 address 203.0.113.10 to 192.168.1.10 for 1-to-1 dynamic mapping.",
      sourceNodeId: "nat-router",
      destNodeId: "nat-router",
      protocol: "TCP",
      rfcReference: "RFC 3022",
      technicalDetails: [
        "Assigned Public IP: 203.0.113.10",
        "Dynamic Pool Remaining: 5 Available Public IPs",
        "Mapping Type: Dynamic 1:1 NAT",
      ],
      beforeHeader: { srcIp: "192.168.1.10", srcPort: 50100, dstIp: "93.184.216.34", dstPort: 80 },
      afterHeader: { srcIp: "203.0.113.10", srcPort: 50100, dstIp: "93.184.216.34", dstPort: 80 },
    });

    events.push({
      step: 3,
      type: "header-rewritten",
      title: "Dynamic Source IP Translation",
      summary: "Src IP rewritten to 203.0.113.10 (Port remains 50100)",
      explanation: "Only IP address modified (no port overload needed since dedicated public IP is assigned).",
      sourceNodeId: "nat-router",
      destNodeId: "isp-router",
      protocol: "TCP",
      rfcReference: "RFC 1624",
      technicalDetails: [
        "Translated Source IP: 203.0.113.10",
        "Source Port: 50100 (Unchanged)",
      ],
      beforeHeader: { srcIp: "192.168.1.10", srcPort: 50100, dstIp: "93.184.216.34", dstPort: 80 },
      afterHeader: { srcIp: "203.0.113.10", srcPort: 50100, dstIp: "93.184.216.34", dstPort: 80 },
    });

    packets.push({
      id: "pkt-dyn-2",
      stepIndex: 3,
      sourceId: "nat-router",
      targetId: "isp-router",
      protocol: "TCP",
      direction: "outbound",
      srcIp: "203.0.113.10",
      srcPort: 50100,
      dstIp: "93.184.216.34",
      dstPort: 80,
      isTranslated: true,
      label: "203.0.113.10:50100 -> 93.184.216.34:80 (Dynamic NAT)",
      progress: 100,
      status: "delivered",
    });

    events.push({
      step: 4,
      type: "forwarded",
      title: "Outbound Packet Forwarded Across WAN",
      summary: "Packet routed to web server 93.184.216.34",
      explanation: "Public web server receives request from pool IP 203.0.113.10.",
      sourceNodeId: "isp-router",
      destNodeId: "web-server",
      protocol: "TCP",
      rfcReference: "RFC 791",
      technicalDetails: [
        "Web Server Sees Client IP: 203.0.113.10",
      ],
      beforeHeader: { srcIp: "203.0.113.10", srcPort: 50100, dstIp: "93.184.216.34", dstPort: 80 },
      afterHeader: { srcIp: "203.0.113.10", srcPort: 50100, dstIp: "93.184.216.34", dstPort: 80 },
    });

    events.push({
      step: 5,
      type: "packet-originated",
      title: "Inbound Return Packet From Server",
      summary: "Web server sends HTTP response back to 203.0.113.10:50100",
      explanation: "Return payload arrives at NAT Gateway's pool IP interface.",
      sourceNodeId: "web-server",
      destNodeId: "nat-router",
      protocol: "TCP",
      rfcReference: "RFC 793",
      technicalDetails: [
        "Inbound Return Packet: 93.184.216.34:80 -> 203.0.113.10:50100",
      ],
      beforeHeader: { srcIp: "93.184.216.34", srcPort: 80, dstIp: "203.0.113.10", dstPort: 50100 },
      afterHeader: { srcIp: "93.184.216.34", srcPort: 80, dstIp: "203.0.113.10", dstPort: 50100 },
    });

    events.push({
      step: 6,
      type: "header-rewritten",
      title: "Inbound De-NAT Dynamic Pool Translation",
      summary: "Dst IP rewritten from 203.0.113.10 back to 192.168.1.10",
      explanation: "NAT Router matches pool binding and restores Host A's private IP address.",
      sourceNodeId: "nat-router",
      destNodeId: "pc-1",
      protocol: "TCP",
      rfcReference: "RFC 3022 Section 3.2",
      technicalDetails: [
        "Dynamic De-NAT Binding: 203.0.113.10 -> 192.168.1.10",
        "Workstation A receives response successfully.",
      ],
      beforeHeader: { srcIp: "93.184.216.34", srcPort: 80, dstIp: "203.0.113.10", dstPort: 50100 },
      afterHeader: { srcIp: "93.184.216.34", srcPort: 80, dstIp: "192.168.1.10", dstPort: 50100 },
    });

    packets.push({
      id: "pkt-dyn-3",
      stepIndex: 6,
      sourceId: "nat-router",
      targetId: "pc-1",
      protocol: "TCP",
      direction: "inbound",
      srcIp: "93.184.216.34",
      srcPort: 80,
      dstIp: "192.168.1.10",
      dstPort: 50100,
      isTranslated: true,
      label: "93.184.216.34:80 -> 192.168.1.10:50100 (De-NAT)",
      progress: 100,
      status: "delivered",
    });

    totalTranslated += 2;

    return {
      config,
      translationTable,
      events,
      packets,
      totalTranslated,
      droppedPackets,
    };
  }

  // ----------------------------------------------------
  // Scenario 4: Carrier-Grade NAT (CGNAT / NAT444 Double NAT 8 Steps)
  // ----------------------------------------------------
  if (scenarioId === "cgnat_double_nat" || config.mode === "cgnat") {
    events.push({
      step: 1,
      type: "packet-originated",
      title: "LAN Host Sends Request to Home CPE Router",
      summary: "Workstation A (192.168.1.10:54321) sends packet to Home Router",
      explanation: "Client initiates socket request within home LAN.",
      sourceNodeId: "pc-1",
      destNodeId: "nat-router",
      protocol: "TCP",
      rfcReference: "RFC 1918",
      technicalDetails: [
        "Inside Local: 192.168.1.10:54321",
        "Destination: 93.184.216.34:443",
      ],
      beforeHeader: { srcIp: "192.168.1.10", srcPort: 54321, dstIp: "93.184.216.34", dstPort: 443 },
      afterHeader: { srcIp: "192.168.1.10", srcPort: 54321, dstIp: "93.184.216.34", dstPort: 443 },
    });

    events.push({
      step: 2,
      type: "header-rewritten",
      title: "First NAT Translation (Home CPE Router)",
      summary: "Src IP rewritten to ISP Shared Address 100.64.12.5:41000",
      explanation: "Home CPE router performs NAT 1: rewrites 192.168.1.10:54321 to RFC 6598 CGNAT Shared Space IP 100.64.12.5:41000.",
      sourceNodeId: "nat-router",
      destNodeId: "isp-router",
      protocol: "TCP",
      rfcReference: "RFC 6598 (100.64.0.0/10)",
      technicalDetails: [
        "NAT 1 Translation: 192.168.1.10:54321 -> 100.64.12.5:41000",
        "Address Space: RFC 6598 Carrier-Grade NAT Shared Address Range",
      ],
      beforeHeader: { srcIp: "192.168.1.10", srcPort: 54321, dstIp: "93.184.216.34", dstPort: 443 },
      afterHeader: { srcIp: "100.64.12.5", srcPort: 41000, dstIp: "93.184.216.34", dstPort: 443 },
    });

    events.push({
      step: 3,
      type: "nat-lookup",
      title: "ISP CGNAT Large-Scale NAT (LSN) Gateway Lookup",
      summary: "ISP CGNAT Gateway inspects RFC 6598 packet from 100.64.12.5:41000",
      explanation: "ISP core router prepares Second NAT translation to allocate global public Internet IP.",
      sourceNodeId: "isp-router",
      destNodeId: "isp-router",
      protocol: "TCP",
      rfcReference: "RFC 6598 / RFC 6888",
      technicalDetails: [
        "CGNAT Gateway: ISP Large Scale NAT (LSN)",
        "Allocated Global Public IP: 198.51.100.1:55000",
      ],
      beforeHeader: { srcIp: "100.64.12.5", srcPort: 41000, dstIp: "93.184.216.34", dstPort: 443 },
      afterHeader: { srcIp: "198.51.100.1", srcPort: 55000, dstIp: "93.184.216.34", dstPort: 443 },
    });

    events.push({
      step: 4,
      type: "header-rewritten",
      title: "Second NAT Translation (ISP CGNAT Core)",
      summary: "Src IP rewritten to Global Public IP 198.51.100.1:55000",
      explanation: "NAT 2 Translation: 100.64.12.5:41000 rewritten to public IP 198.51.100.1:55000.",
      sourceNodeId: "isp-router",
      destNodeId: "web-server",
      protocol: "TCP",
      rfcReference: "RFC 6888 (CGNAT Requirements)",
      technicalDetails: [
        "NAT 2 Translation: 100.64.12.5:41000 -> 198.51.100.1:55000",
        "Double NAT Complete (NAT444 Architecture)",
      ],
      beforeHeader: { srcIp: "100.64.12.5", srcPort: 41000, dstIp: "93.184.216.34", dstPort: 443 },
      afterHeader: { srcIp: "198.51.100.1", srcPort: 55000, dstIp: "93.184.216.34", dstPort: 443 },
    });

    events.push({
      step: 5,
      type: "packet-originated",
      title: "Web Server Sends Response to Public IP",
      summary: "Web server sends return payload to 198.51.100.1:55000",
      explanation: "Server responds to public IP of ISP CGNAT gateway.",
      sourceNodeId: "web-server",
      destNodeId: "isp-router",
      protocol: "TCP",
      rfcReference: "RFC 793",
      technicalDetails: [
        "Inbound Server Return: 93.184.216.34:443 -> 198.51.100.1:55000",
      ],
      beforeHeader: { srcIp: "93.184.216.34", srcPort: 443, dstIp: "198.51.100.1", dstPort: 55000 },
      afterHeader: { srcIp: "93.184.216.34", srcPort: 443, dstIp: "198.51.100.1", dstPort: 55000 },
    });

    events.push({
      step: 6,
      type: "header-rewritten",
      title: "First De-NAT Translation (ISP CGNAT Core)",
      summary: "Dst IP rewritten from 198.51.100.1:55000 to 100.64.12.5:41000",
      explanation: "ISP CGNAT gateway matches public port 55000 and restores RFC 6598 customer IP 100.64.12.5:41000.",
      sourceNodeId: "isp-router",
      destNodeId: "nat-router",
      protocol: "TCP",
      rfcReference: "RFC 6598",
      technicalDetails: [
        "De-NAT 1: 198.51.100.1:55000 -> 100.64.12.5:41000",
      ],
      beforeHeader: { srcIp: "93.184.216.34", srcPort: 443, dstIp: "198.51.100.1", dstPort: 55000 },
      afterHeader: { srcIp: "93.184.216.34", srcPort: 443, dstIp: "100.64.12.5", dstPort: 41000 },
    });

    events.push({
      step: 7,
      type: "header-rewritten",
      title: "Second De-NAT Translation (Home CPE Router)",
      summary: "Dst IP rewritten from 100.64.12.5:41000 back to 192.168.1.10:54321",
      explanation: "Home CPE router matches port 41000 and delivers packet to client Workstation A.",
      sourceNodeId: "nat-router",
      destNodeId: "pc-1",
      protocol: "TCP",
      rfcReference: "RFC 3022",
      technicalDetails: [
        "De-NAT 2: 100.64.12.5:41000 -> 192.168.1.10:54321",
        "Workstation A receives return packet seamlessly across Double NAT.",
      ],
      beforeHeader: { srcIp: "93.184.216.34", srcPort: 443, dstIp: "100.64.12.5", dstPort: 41000 },
      afterHeader: { srcIp: "93.184.216.34", srcPort: 443, dstIp: "192.168.1.10", dstPort: 54321 },
    });

    events.push({
      step: 8,
      type: "forwarded",
      title: "Double NAT Transaction Completed",
      summary: "Workstation A receives HTTPS response payload",
      explanation: "CGNAT double translation cycle complete.",
      sourceNodeId: "pc-1",
      destNodeId: "pc-1",
      protocol: "TCP",
      rfcReference: "RFC 6598",
      technicalDetails: [
        "CGNAT Double NAT Transaction Successful.",
      ],
      beforeHeader: { srcIp: "93.184.216.34", srcPort: 443, dstIp: "192.168.1.10", dstPort: 54321 },
      afterHeader: { srcIp: "93.184.216.34", srcPort: 443, dstIp: "192.168.1.10", dstPort: 54321 },
    });

    totalTranslated += 4;

    return {
      config,
      translationTable,
      events,
      packets,
      totalTranslated,
      droppedPackets,
    };
  }

  // ----------------------------------------------------
  // Scenario 5: Standard Outbound PAT / NAPT Overload Transaction Sequence (6 Steps)
  // ----------------------------------------------------
  events.push({
    step: 1,
    type: "packet-originated",
    title: "LAN Host Generates Outbound HTTPS Request",
    summary: "Workstation A (192.168.1.10:54321) sends TCP SYN to example.com (93.184.216.34:443)",
    explanation: "Internal LAN client initiates web connection using private RFC 1918 IPv4 address.",
    sourceNodeId: "pc-1",
    destNodeId: "nat-router",
    protocol: "TCP",
    rfcReference: "RFC 1918 / RFC 791",
    technicalDetails: [
      "Inside Local IP: 192.168.1.10",
      "Inside Local Port: 54321",
      "Outside Global IP: 93.184.216.34",
      "Outside Global Port: 443",
      "Zone: Inside LAN (Un-translated)",
    ],
    beforeHeader: { srcIp: "192.168.1.10", srcPort: 54321, dstIp: "93.184.216.34", dstPort: 443 },
    afterHeader: { srcIp: "192.168.1.10", srcPort: 54321, dstIp: "93.184.216.34", dstPort: 443 },
  });

  packets.push({
    id: "pkt-1",
    stepIndex: 1,
    sourceId: "pc-1",
    targetId: "nat-router",
    protocol: "TCP",
    direction: "outbound",
    srcIp: "192.168.1.10",
    srcPort: 54321,
    dstIp: "93.184.216.34",
    dstPort: 443,
    isTranslated: false,
    label: "192.168.1.10:54321 -> 93.184.216.34:443",
    progress: 100,
    status: "delivered",
  });

  events.push({
    step: 2,
    type: "nat-lookup",
    title: "NAT Gateway State Table Inspection",
    summary: "NAT Router matches socket tuple and allocates public port 40001",
    explanation: "Router searches active NAT table. Creates dynamic PAT entry for 192.168.1.10:54321 -> 203.0.113.1:40001.",
    sourceNodeId: "nat-router",
    destNodeId: "nat-router",
    protocol: "TCP",
    rfcReference: "RFC 3022 Section 3.1",
    technicalDetails: [
      "Action: New Stateful PAT Binding Created",
      "Allocated Ephemeral Public Port: 40001",
      "Inside Global Socket: 203.0.113.1:40001",
      "Idle Timeout Set: 300 Seconds",
    ],
    beforeHeader: { srcIp: "192.168.1.10", srcPort: 54321, dstIp: "93.184.216.34", dstPort: 443 },
    afterHeader: { srcIp: "203.0.113.1", srcPort: 40001, dstIp: "93.184.216.34", dstPort: 443 },
  });

  events.push({
    step: 3,
    type: "header-rewritten",
    title: "Outbound Header SNAT/PAT Translation",
    summary: "Src IP rewritten to 203.0.113.1, Src Port rewritten to 40001",
    explanation: "Private source address/port modified in IP & TCP headers. Checksums recalculated.",
    sourceNodeId: "nat-router",
    destNodeId: "isp-router",
    protocol: "TCP",
    rfcReference: "RFC 1624 / RFC 3022",
    technicalDetails: [
      "Original Header: 192.168.1.10:54321 -> 93.184.216.34:443",
      "Translated Header: 203.0.113.1:40001 -> 93.184.216.34:443",
      "IP Checksum: Recalculated 0x8F4A",
      "TCP Checksum: Recalculated 0x3C12",
    ],
    beforeHeader: { srcIp: "192.168.1.10", srcPort: 54321, dstIp: "93.184.216.34", dstPort: 443 },
    afterHeader: { srcIp: "203.0.113.1", srcPort: 40001, dstIp: "93.184.216.34", dstPort: 443 },
  });

  packets.push({
    id: "pkt-2",
    stepIndex: 3,
    sourceId: "nat-router",
    targetId: "isp-router",
    protocol: "TCP",
    direction: "outbound",
    srcIp: "203.0.113.1",
    srcPort: 40001,
    dstIp: "93.184.216.34",
    dstPort: 443,
    isTranslated: true,
    label: "203.0.113.1:40001 -> 93.184.216.34:443 (NAT)",
    progress: 100,
    status: "delivered",
  });

  events.push({
    step: 4,
    type: "forwarded",
    title: "WAN Packet Forwarded to Public Server",
    summary: "Packet routed across ISP WAN backbone to web server 93.184.216.34",
    explanation: "Web server receives packet containing public IP 203.0.113.1 and prepares return TCP SYN-ACK response.",
    sourceNodeId: "isp-router",
    destNodeId: "web-server",
    protocol: "TCP",
    rfcReference: "RFC 791",
    technicalDetails: [
      "Destination Web Server Sees Source: 203.0.113.1:40001",
      "Web server is completely unaware of internal private IP 192.168.1.10.",
    ],
    beforeHeader: { srcIp: "203.0.113.1", srcPort: 40001, dstIp: "93.184.216.34", dstPort: 443 },
    afterHeader: { srcIp: "203.0.113.1", srcPort: 40001, dstIp: "93.184.216.34", dstPort: 443 },
  });

  events.push({
    step: 5,
    type: "packet-originated",
    title: "Inbound Return Packet From Server",
    summary: "Web server sends TCP SYN-ACK response back to 203.0.113.1:40001",
    explanation: "Return payload arrives at NAT Gateway's public WAN interface.",
    sourceNodeId: "web-server",
    destNodeId: "nat-router",
    protocol: "TCP",
    rfcReference: "RFC 793",
    technicalDetails: [
      "Inbound Return Packet: 93.184.216.34:443 -> 203.0.113.1:40001",
    ],
    beforeHeader: { srcIp: "93.184.216.34", srcPort: 443, dstIp: "203.0.113.1", dstPort: 40001 },
    afterHeader: { srcIp: "93.184.216.34", srcPort: 443, dstIp: "203.0.113.1", dstPort: 40001 },
  });

  packets.push({
    id: "pkt-3",
    stepIndex: 5,
    sourceId: "web-server",
    targetId: "nat-router",
    protocol: "TCP",
    direction: "inbound",
    srcIp: "93.184.216.34",
    srcPort: 443,
    dstIp: "203.0.113.1",
    dstPort: 40001,
    isTranslated: false,
    label: "93.184.216.34:443 -> 203.0.113.1:40001 (Return)",
    progress: 100,
    status: "delivered",
  });

  events.push({
    step: 6,
    type: "header-rewritten",
    title: "Inbound De-NAT Header Translation",
    summary: "Dst IP rewritten back to 192.168.1.10, Dst Port rewritten to 54321",
    explanation: "NAT Router matches return socket to translation table and restores internal host's private IP and port.",
    sourceNodeId: "nat-router",
    destNodeId: "pc-1",
    protocol: "TCP",
    rfcReference: "RFC 3022 Section 3.2",
    technicalDetails: [
      "Matched Table Entry: 203.0.113.1:40001 -> 192.168.1.10:54321",
      "Restored Header: 93.184.216.34:443 -> 192.168.1.10:54321",
      "Internal Host A receives response seamlessly.",
    ],
    beforeHeader: { srcIp: "93.184.216.34", srcPort: 443, dstIp: "203.0.113.1", dstPort: 40001 },
    afterHeader: { srcIp: "93.184.216.34", srcPort: 443, dstIp: "192.168.1.10", dstPort: 54321 },
  });

  packets.push({
    id: "pkt-4",
    stepIndex: 6,
    sourceId: "nat-router",
    targetId: "pc-1",
    protocol: "TCP",
    direction: "inbound",
    srcIp: "93.184.216.34",
    srcPort: 443,
    dstIp: "192.168.1.10",
    dstPort: 54321,
    isTranslated: true,
    label: "93.184.216.34:443 -> 192.168.1.10:54321 (De-NAT)",
    progress: 100,
    status: "delivered",
  });

  totalTranslated += 2;

  return {
    config,
    translationTable,
    events,
    packets,
    totalTranslated,
    droppedPackets,
  };
}

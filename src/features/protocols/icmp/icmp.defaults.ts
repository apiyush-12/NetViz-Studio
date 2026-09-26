import type {
  IcmpConfig,
  IcmpNode,
  IcmpLink,
  IcmpScenarioId,
  IcmpTopologyPresetId,
} from "./icmp.types";

export const defaultIcmpConfig: IcmpConfig = {
  topologyPreset: "standard_internet_path",
  scenarioId: "echo_ping_roundtrip",
  sourceNodeId: "host-a",
  targetNodeId: "server-b",
  packetSizeBytes: 64,
  dontFragmentFlag: true,
  startingTtl: 64,
  pingCount: 4,
  targetPort: 33434,
};

// ==========================================
// TOPOLOGY 1: Standard Internet Path
// Host A (192.168.1.10) -> R1 (192.168.1.1) -> R2 (10.0.1.2) -> R3 (10.0.2.2) -> Server B (203.0.113.80)
// ==========================================
export const STANDARD_INTERNET_NODES: IcmpNode[] = [
  {
    id: "host-a",
    name: "Host A (Client)",
    label: "Host A (192.168.1.10)",
    type: "host",
    ipAddress: "192.168.1.10",
    subnetMask: "255.255.255.0",
    defaultGateway: "192.168.1.1",
    interfaceMtu: 1500,
    pathMtuCache: {},
    position: { x: 80, y: 220 },
    status: "active",
  },
  {
    id: "router-1",
    name: "Gateway Router R1",
    label: "R1 (First-Hop Gateway)",
    type: "router",
    ipAddress: "192.168.1.1",
    subnetMask: "255.255.255.0",
    interfaceMtu: 1500,
    position: { x: 290, y: 220 },
    status: "active",
  },
  {
    id: "router-2",
    name: "Transit Core Router R2",
    label: "R2 (ISP Core Router)",
    type: "router",
    ipAddress: "10.0.1.2",
    subnetMask: "255.255.255.252",
    interfaceMtu: 1500,
    position: { x: 500, y: 220 },
    status: "active",
  },
  {
    id: "router-3",
    name: "Destination Edge Router R3",
    label: "R3 (Data Center Edge)",
    type: "router",
    ipAddress: "10.0.2.2",
    subnetMask: "255.255.255.252",
    interfaceMtu: 1500,
    position: { x: 710, y: 220 },
    status: "active",
  },
  {
    id: "server-b",
    name: "Target Server B",
    label: "Server B (203.0.113.80)",
    type: "server",
    ipAddress: "203.0.113.80",
    subnetMask: "255.255.255.0",
    defaultGateway: "203.0.113.1",
    interfaceMtu: 1500,
    closedPorts: [33434, 33435, 33436],
    position: { x: 920, y: 220 },
    status: "active",
  },
];

export const STANDARD_INTERNET_LINKS: IcmpLink[] = [
  {
    id: "link-host-r1",
    sourceNodeId: "host-a",
    targetNodeId: "router-1",
    sourcePortName: "eth0",
    targetPortName: "Gi0/0",
    mtu: 1500,
    latencyMs: 1,
    bandwidthMbps: 1000,
    status: "up",
  },
  {
    id: "link-r1-r2",
    sourceNodeId: "router-1",
    targetNodeId: "router-2",
    sourcePortName: "Gi0/1",
    targetPortName: "Gi0/1",
    mtu: 1500,
    latencyMs: 8,
    bandwidthMbps: 10000,
    status: "up",
  },
  {
    id: "link-r2-r3",
    sourceNodeId: "router-2",
    targetNodeId: "router-3",
    sourcePortName: "Gi0/2",
    targetPortName: "Gi0/1",
    mtu: 1500,
    latencyMs: 12,
    bandwidthMbps: 10000,
    status: "up",
  },
  {
    id: "link-r3-server",
    sourceNodeId: "router-3",
    targetNodeId: "server-b",
    sourcePortName: "Gi0/2",
    targetPortName: "eth0",
    mtu: 1500,
    latencyMs: 2,
    bandwidthMbps: 1000,
    status: "up",
  },
];

// ==========================================
// TOPOLOGY 2: Path MTU Discovery (PMTUD Bottleneck)
// Client (1500 MTU) -> Edge R1 (1500) ==[WAN Tunnel MTU 1300]==> Core R2 (1500) -> Web Server (1500)
// ==========================================
export const PMTUD_BOTTLENECK_NODES: IcmpNode[] = [
  {
    id: "client-a",
    name: "Enterprise Client",
    label: "Client (192.168.10.5)",
    type: "host",
    ipAddress: "192.168.10.5",
    subnetMask: "255.255.255.0",
    defaultGateway: "192.168.10.1",
    interfaceMtu: 1500,
    pathMtuCache: { "203.0.113.80": 1500 },
    position: { x: 90, y: 220 },
    status: "active",
  },
  {
    id: "edge-r1",
    name: "Branch Edge Router",
    label: "R1 (GRE/IPsec Ingress)",
    type: "router",
    ipAddress: "192.168.10.1",
    subnetMask: "255.255.255.0",
    interfaceMtu: 1500,
    position: { x: 330, y: 220 },
    status: "active",
  },
  {
    id: "core-r2",
    name: "Headquarters Gateway",
    label: "R2 (HQ WAN Egress)",
    type: "router",
    ipAddress: "172.16.1.2",
    subnetMask: "255.255.255.0",
    interfaceMtu: 1500,
    position: { x: 670, y: 220 },
    status: "active",
  },
  {
    id: "web-server-b",
    name: "Cloud Database / Web",
    label: "Cloud Server (203.0.113.80)",
    type: "server",
    ipAddress: "203.0.113.80",
    subnetMask: "255.255.255.0",
    defaultGateway: "172.16.1.1",
    interfaceMtu: 1500,
    position: { x: 910, y: 220 },
    status: "active",
  },
];

export const PMTUD_BOTTLENECK_LINKS: IcmpLink[] = [
  {
    id: "link-client-r1",
    sourceNodeId: "client-a",
    targetNodeId: "edge-r1",
    sourcePortName: "eth0",
    targetPortName: "Gi0/0",
    mtu: 1500,
    latencyMs: 1,
    bandwidthMbps: 1000,
    status: "up",
  },
  {
    id: "link-r1-r2-tunnel",
    sourceNodeId: "edge-r1",
    targetNodeId: "core-r2",
    sourcePortName: "Tu0 (GRE/IPsec)",
    targetPortName: "Tu0",
    mtu: 1300, // Bottleneck link MTU!
    latencyMs: 25,
    bandwidthMbps: 500,
    isBottleneck: true,
    status: "up",
  },
  {
    id: "link-r2-webserver",
    sourceNodeId: "core-r2",
    targetNodeId: "web-server-b",
    sourcePortName: "Gi0/1",
    targetPortName: "eth0",
    mtu: 1500,
    latencyMs: 1,
    bandwidthMbps: 10000,
    status: "up",
  },
];

// ==========================================
// TOPOLOGY 3: Unreachable & Firewall Drop
// Host A -> Gateway R1 -> Core R2 -> Firewall FW1 -> Closed Server B
// ==========================================
export const UNREACHABLE_FIREWALL_NODES: IcmpNode[] = [
  STANDARD_INTERNET_NODES[0],
  STANDARD_INTERNET_NODES[1],
  STANDARD_INTERNET_NODES[2],
  {
    id: "firewall-1",
    name: "Enterprise Firewall",
    label: "FW1 (Stateful Firewall)",
    type: "firewall",
    ipAddress: "10.0.3.1",
    subnetMask: "255.255.255.0",
    interfaceMtu: 1500,
    isFirewall: true,
    firewallDropAcl: true,
    position: { x: 710, y: 220 },
    status: "active",
  },
  STANDARD_INTERNET_NODES[4],
];

export const UNREACHABLE_FIREWALL_LINKS: IcmpLink[] = [
  STANDARD_INTERNET_LINKS[0],
  STANDARD_INTERNET_LINKS[1],
  {
    id: "link-r2-fw1",
    sourceNodeId: "router-2",
    targetNodeId: "firewall-1",
    sourcePortName: "Gi0/2",
    targetPortName: "eth1",
    mtu: 1500,
    latencyMs: 5,
    bandwidthMbps: 10000,
    status: "up",
  },
  {
    id: "link-fw1-server",
    sourceNodeId: "firewall-1",
    targetNodeId: "server-b",
    sourcePortName: "eth2",
    targetPortName: "eth0",
    mtu: 1500,
    latencyMs: 1,
    bandwidthMbps: 1000,
    status: "up",
  },
];

// ==========================================
// TOPOLOGY 4: ICMP Redirect Subnet
// Host A (192.168.1.10) & R1 (192.168.1.1) & R2 (192.168.1.2) on same subnet
// ==========================================
export const REDIRECT_SUBNET_NODES: IcmpNode[] = [
  {
    id: "host-a",
    name: "Host A (Client)",
    label: "Host A (192.168.1.10)",
    type: "host",
    ipAddress: "192.168.1.10",
    subnetMask: "255.255.255.0",
    defaultGateway: "192.168.1.1", // Sub-optimal default gateway
    interfaceMtu: 1500,
    position: { x: 120, y: 220 },
    status: "active",
  },
  {
    id: "router-1",
    name: "Default Gateway R1",
    label: "R1 (Default GW - 192.168.1.1)",
    type: "router",
    ipAddress: "192.168.1.1",
    subnetMask: "255.255.255.0",
    interfaceMtu: 1500,
    position: { x: 420, y: 130 },
    status: "active",
  },
  {
    id: "router-2",
    name: "Optimal Gateway R2",
    label: "R2 (Optimal GW - 192.168.1.2)",
    type: "router",
    ipAddress: "192.168.1.2",
    subnetMask: "255.255.255.0",
    interfaceMtu: 1500,
    position: { x: 420, y: 310 },
    status: "active",
  },
  {
    id: "server-b",
    name: "Branch Server",
    label: "Branch Server (10.50.0.100)",
    type: "server",
    ipAddress: "10.50.0.100",
    subnetMask: "255.255.0.0",
    interfaceMtu: 1500,
    position: { x: 820, y: 220 },
    status: "active",
  },
];

export const REDIRECT_SUBNET_LINKS: IcmpLink[] = [
  { id: "link-host-r1", sourceNodeId: "host-a", targetNodeId: "router-1", sourcePortName: "eth0", targetPortName: "Gi0/0", mtu: 1500, latencyMs: 1, bandwidthMbps: 1000, status: "up" },
  { id: "link-host-r2", sourceNodeId: "host-a", targetNodeId: "router-2", sourcePortName: "eth0", targetPortName: "Gi0/0", mtu: 1500, latencyMs: 1, bandwidthMbps: 1000, status: "up" },
  { id: "link-r1-r2", sourceNodeId: "router-1", targetNodeId: "router-2", sourcePortName: "Gi0/1", targetPortName: "Gi0/1", mtu: 1500, latencyMs: 1, bandwidthMbps: 1000, status: "up" },
  { id: "link-r2-server", sourceNodeId: "router-2", targetNodeId: "server-b", sourcePortName: "Gi0/2", targetPortName: "eth0", mtu: 1500, latencyMs: 10, bandwidthMbps: 1000, status: "up" },
];

export const ICMP_PRESETS: Record<
  IcmpTopologyPresetId,
  { name: string; description: string; nodes: IcmpNode[]; links: IcmpLink[] }
> = {
  standard_internet_path: {
    name: "Multi-Hop Internet Path (5 Nodes)",
    description: "Classic multi-hop routed internet path from Client A through 3 intermediate routers to Web Server B.",
    nodes: STANDARD_INTERNET_NODES,
    links: STANDARD_INTERNET_LINKS,
  },
  pmtud_bottleneck_path: {
    name: "Path MTU Bottleneck (WAN Tunnel)",
    description: "Path containing a 1300-byte MTU bottleneck link causing 'Fragmentation Needed and DF set' (Type 3 Code 4) and client MTU adaptation.",
    nodes: PMTUD_BOTTLENECK_NODES,
    links: PMTUD_BOTTLENECK_LINKS,
  },
  unreachable_firewall_network: {
    name: "Firewall Drop & Closed Port Network",
    description: "Security perimeter network demonstrating Firewall ACL drops (Type 3 Code 13) and UDP Closed Port rejection (Type 3 Code 3).",
    nodes: UNREACHABLE_FIREWALL_NODES,
    links: UNREACHABLE_FIREWALL_LINKS,
  },
  local_redirect_subnet: {
    name: "Local Subnet ICMP Redirect",
    description: "Shared broadcast multi-access subnet where the default gateway notifies the host of an optimal direct next-hop router (Type 5 Code 1).",
    nodes: REDIRECT_SUBNET_NODES,
    links: REDIRECT_SUBNET_LINKS,
  },
};

export const ICMP_SCENARIOS: Record<
  IcmpScenarioId,
  {
    title: string;
    summary: string;
    category: "Diagnostics" | "Path Discovery" | "Optimization" | "Security" | "Error Handling";
    presetId: IcmpTopologyPresetId;
    learningPoints: string[];
  }
> = {
  echo_ping_roundtrip: {
    title: "Classic Ping (Echo Request & Reply)",
    summary: "Simulate standard ICMP Ping (Type 8 Request -> Type 0 Reply) measuring round-trip time (RTT), sequence numbers, and payload integrity.",
    category: "Diagnostics",
    presetId: "standard_internet_path",
    learningPoints: [
      "ICMP Type 8 Code 0 carries Identifier and Sequence Number fields to match requests with responses.",
      "The responder echoes the exact identifier, sequence number, and data payload back in Type 0 Code 0.",
      "Calculates Round-Trip Time (RTT) and verifies packet integrity via RFC 1071 Checksum.",
    ],
  },
  traceroute_ttl_exceeded: {
    title: "Traceroute (Hop-by-Hop TTL Exceeded)",
    summary: "Observe how `traceroute` increments IP TTL (TTL=1, 2, 3) so each intermediate router expires the packet and generates ICMP Time Exceeded (Type 11 Code 0).",
    category: "Path Discovery",
    presetId: "standard_internet_path",
    learningPoints: [
      "When a router receives a packet with TTL=1, it decrements TTL to 0, drops the packet, and sends ICMP Type 11 Code 0.",
      "The error response quotes the original IP header + 64 bits of original payload so the sender can identify the probe.",
      "Traceroute discovers intermediate router IP addresses and measures hop-by-hop latency.",
    ],
  },
  pmtud_df_fragmentation_needed: {
    title: "Path MTU Discovery (PMTUD & Frag Needed)",
    summary: "A 1500-byte packet with DF=1 hits a 1300-byte MTU tunnel. Router generates ICMP Type 3 Code 4 with Next-Hop MTU=1300, and client shrinks its socket MTU.",
    category: "Optimization",
    presetId: "pmtud_bottleneck_path",
    learningPoints: [
      "When a packet exceeds outgoing MTU and DF (Don't Fragment) bit is set, the router drops the packet.",
      "The router returns ICMP Type 3 Code 4 including the exact `Next-Hop MTU: 1300` in the ICMP header (RFC 1191).",
      "The client updates its Route Cache (Path MTU = 1300) and retransmits sized to 1300 bytes with zero fragmentation.",
    ],
  },
  dest_port_unreachable: {
    title: "Destination Port Unreachable (Type 3 Code 3)",
    summary: "Client transmits UDP probe to closed port 33434. Target host rejects the datagram with ICMP Destination Port Unreachable.",
    category: "Error Handling",
    presetId: "standard_internet_path",
    learningPoints: [
      "When an IP packet arrives at the destination host but no application socket is listening on the target UDP port, ICMP Type 3 Code 3 is generated.",
      "Classic Unix/Linux `traceroute` relies on Port Unreachable to recognize that it has reached the final destination.",
      "The response contains the quoted UDP header so the OS socket layer can notify the user space process.",
    ],
  },
  firewall_admin_prohibited: {
    title: "Administratively Prohibited (Firewall ACL Drop)",
    summary: "Firewall FW1 blocks unauthorized traffic and explicitly rejects the probe with ICMP Type 3 Code 13 (Communication Administratively Prohibited).",
    category: "Security",
    presetId: "unreachable_firewall_network",
    learningPoints: [
      "Firewalls and access control lists (ACLs) can reject packets explicitly with ICMP Type 3 Code 9, 10, or 13.",
      "Prevents client applications from hanging on long TCP timeouts by immediately returning an administrative refusal.",
      "Security best practices evaluate whether to return ICMP Unreachable or silently drop (blackhole) to thwart port scanning.",
    ],
  },
  icmp_redirect_gateway: {
    title: "ICMP Redirect (Optimal Gateway Notification)",
    summary: "Host A sends traffic through default gateway R1. R1 recognizes that R2 is on the same local subnet and instructs Host A to send directly to R2.",
    category: "Optimization",
    presetId: "local_redirect_subnet",
    learningPoints: [
      "When a router forwards a packet out the same physical interface it entered, it sends an ICMP Redirect (Type 5 Code 1).",
      "The ICMP header contains the IP address of the optimal first-hop router (`Gateway Address: 192.168.1.2`).",
      "Host updates its local routing table cache to bypass R1 on subsequent transmissions, reducing local bandwidth waste by 50%.",
    ],
  },
};

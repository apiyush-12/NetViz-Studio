import type {
  Ipv4Config,
  Ipv4Node,
  Ipv4Link,
  Ipv4Header,
  Ipv4ScenarioId,
} from "./ipv4.types";

export const defaultIpv4Config: Ipv4Config = {
  sourceIp: "192.168.1.10",
  destinationIp: "172.16.0.100",
  packetSize: 1500,
  initialTtl: 64,
  dfFlag: false,
  routerMtu: 576,
};

export const defaultIpv4Nodes: Ipv4Node[] = [
  {
    id: "host-a",
    name: "Workstation A",
    type: "host",
    ipAddress: "192.168.1.10",
    subnetMask: "255.255.255.0",
    macAddress: "00:1A:2B:3C:4D:5E",
    defaultGateway: "192.168.1.1",
    mtu: 1500,
    position: { x: 80, y: 220 },
    roleDescription: "Internal LAN source client initiating IPv4 packet transmission.",
  },
  {
    id: "router-1",
    name: "Gateway Router R1",
    type: "router",
    ipAddress: "192.168.1.1 / 10.0.0.1",
    subnetMask: "255.255.255.0",
    macAddress: "AA:BB:CC:11:22:33",
    mtu: 1500,
    position: { x: 220, y: 220 },
    roleDescription: "Ingress default gateway router performing LPM routing table lookup and TTL decrement.",
  },
  {
    id: "router-2",
    name: "Edge Router R2 (MTU 576)",
    type: "router",
    ipAddress: "10.0.0.2 / 172.16.0.1",
    subnetMask: "255.255.255.0",
    macAddress: "AA:BB:CC:44:55:66",
    mtu: 576,
    position: { x: 360, y: 220 },
    roleDescription: "Bottleneck router link with 576-byte MTU that triggers IPv4 in-flight packet fragmentation.",
  },
  {
    id: "web-server",
    name: "Web Server B",
    type: "server",
    ipAddress: "172.16.0.100",
    subnetMask: "255.255.255.0",
    macAddress: "EE:FF:00:11:22:33",
    defaultGateway: "172.16.0.1",
    mtu: 1500,
    position: { x: 480, y: 220 },
    roleDescription: "Destination host endpoint receiving fragmented IPv4 payload and performing buffer reassembly.",
  },
];

export const defaultIpv4Links: Ipv4Link[] = [
  {
    id: "link-host-r1",
    sourceNodeId: "host-a",
    targetNodeId: "router-1",
    mtu: 1500,
    latencyMs: 2,
    label: "GigabitEthernet (MTU 1500)",
  },
  {
    id: "link-r1-r2",
    sourceNodeId: "router-1",
    targetNodeId: "router-2",
    mtu: 576,
    latencyMs: 15,
    label: "WAN Serial Link (MTU 576)",
  },
  {
    id: "link-r2-server",
    sourceNodeId: "router-2",
    targetNodeId: "web-server",
    mtu: 1500,
    latencyMs: 2,
    label: "GigabitEthernet (MTU 1500)",
  },
];

export const defaultIpv4Header: Ipv4Header = {
  version: 4,
  ihl: 5,
  dscp: 0,
  ecn: 0,
  totalLength: 1500,
  identification: 48921,
  flags: {
    reserved: false,
    df: false,
    mf: false,
  },
  fragmentOffset: 0,
  ttl: 64,
  protocol: 6,
  protocolName: "TCP",
  headerChecksum: "0x7F2C",
  sourceIp: "192.168.1.10",
  destinationIp: "172.16.0.100",
};

export const ipv4Scenarios: {
  id: Ipv4ScenarioId;
  name: string;
  badge: string;
  description: string;
  config?: Partial<Ipv4Config>;
}[] = [
  {
    id: "standard_forwarding",
    name: "Standard Unfragmented Routing",
    badge: "RFC 791",
    description: "Standard 500-byte packet forwarded across multi-hop router topology with TTL decrement.",
    config: { packetSize: 500, initialTtl: 64, dfFlag: false, routerMtu: 576 },
  },
  {
    id: "fragmentation_mtu",
    name: "MTU Bottleneck Fragmentation",
    badge: "RFC 791 / 815",
    description: "1500-byte packet fragmented into 3 slices at Router R2 (MTU 576) and reassembled at destination.",
    config: { packetSize: 1500, initialTtl: 64, dfFlag: false, routerMtu: 576 },
  },
  {
    id: "ttl_expiration",
    name: "TTL Expiration (ICMP Time Exceeded)",
    badge: "RFC 792",
    description: "Packet launched with low TTL=1; decremented to 0 at Router R1 triggering ICMP Type 11 Code 0 drop.",
    config: { packetSize: 500, initialTtl: 1, dfFlag: false, routerMtu: 576 },
  },
  {
    id: "subnet_routing",
    name: "Longest Prefix Match (LPM)",
    badge: "RFC 1519",
    description: "Multi-tier CIDR routing table lookup determining next-hop gateway based on longest subnet mask.",
    config: { packetSize: 600, initialTtl: 64, dfFlag: false, routerMtu: 1500 },
  },
  {
    id: "checksum_error",
    name: "DF Bit Set & MTU Exceeded (Packet Drop)",
    badge: "RFC 1191",
    description: "Packet with DF=1 (Don't Fragment) exceeds MTU 576; dropped by Router R2 with ICMP Fragmentation Needed.",
    config: { packetSize: 1500, initialTtl: 64, dfFlag: true, routerMtu: 576 },
  },
];

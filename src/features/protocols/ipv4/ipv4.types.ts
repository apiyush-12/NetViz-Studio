export type Ipv4ProtocolType = "TCP" | "UDP" | "ICMP";

export type Ipv4ScenarioId =
  | "standard_forwarding"
  | "fragmentation_mtu"
  | "ttl_expiration"
  | "subnet_routing"
  | "checksum_error";

export interface Ipv4Header {
  version: 4;
  ihl: number; // Internet Header Length (5-15, in 32-bit words)
  dscp: number; // Differentiated Services Code Point (6 bits)
  ecn: number; // Explicit Congestion Notification (2 bits)
  totalLength: number; // Total length in bytes (header + data)
  identification: number; // 16-bit packet ID
  flags: {
    reserved: boolean; // Must be 0
    df: boolean; // Don't Fragment
    mf: boolean; // More Fragments
  };
  fragmentOffset: number; // In 8-byte units
  ttl: number; // Time to Live (hops)
  protocol: number; // 6 for TCP, 17 for UDP, 1 for ICMP
  protocolName: Ipv4ProtocolType;
  headerChecksum: string; // 16-bit hex, e.g. "0x4A8F"
  sourceIp: string; // e.g. "192.168.1.10"
  destinationIp: string; // e.g. "172.16.0.100"
  options?: string[];
}

export interface Ipv4Fragment {
  fragmentId: number;
  offset: number; // In bytes
  offsetUnits: number; // In 8-byte units
  payloadLength: number;
  mf: boolean;
  df: boolean;
  data: string;
}

export interface Ipv4Node {
  id: string;
  name: string;
  type: "host" | "router" | "server";
  ipAddress: string;
  subnetMask: string;
  macAddress: string;
  defaultGateway?: string;
  mtu: number;
  position: { x: number; y: number };
  roleDescription: string;
}

export interface Ipv4Link {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  mtu: number;
  latencyMs: number;
  label: string;
}

export interface Ipv4SimulationEvent {
  step: number;
  type:
    | "origination"
    | "routing-lookup"
    | "ttl-decrement"
    | "fragmentation"
    | "reassembly"
    | "ttl-expired"
    | "delivered";
  title: string;
  summary: string;
  explanation: string;
  sourceNodeId: string;
  destNodeId: string;
  protocol: Ipv4ProtocolType;
  rfcReference: string;
  technicalDetails: string[];
  headerSnapshot: Ipv4Header;
  fragments?: Ipv4Fragment[];
}

export interface Ipv4SimulationPacket {
  id: string;
  stepIndex: number;
  sourceId: string;
  targetId: string;
  protocol: Ipv4ProtocolType;
  header: Ipv4Header;
  isFragmented?: boolean;
  fragmentIndex?: number;
  totalFragments?: number;
  label: string;
  progress: number;
  status: "delivered" | "in-flight" | "dropped";
}

export interface Ipv4Config {
  sourceIp: string;
  destinationIp: string;
  packetSize: number; // e.g. 1500 bytes
  initialTtl: number;
  dfFlag: boolean;
  routerMtu: number; // e.g. 576 bytes
}

export interface Ipv4SimulationOutcome {
  config: Ipv4Config;
  events: Ipv4SimulationEvent[];
  packets: Ipv4SimulationPacket[];
  fragmentsGenerated: number;
  hopsTraversed: number;
  isDelivered: boolean;
}

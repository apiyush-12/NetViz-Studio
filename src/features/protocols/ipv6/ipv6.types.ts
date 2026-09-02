export type Ipv6ProtocolType = "TCP" | "UDP" | "ICMPv6";

export type Ipv6ScenarioId =
  | "ipv6_unicast_transit"
  | "ipv6_extension_headers"
  | "ipv6_slaac_ndp"
  | "dual_stack_transit"
  | "6to4_tunneling";

export interface Ipv6ExtensionHeader {
  type: "hop-by-hop" | "routing" | "fragment" | "esp" | "ah" | "destination-options";
  nextHeader: number;
  headerLength: number;
  details: string;
}

export interface Ipv6Header {
  version: 6;
  trafficClass: number; // 8-bit Traffic Class (DSCP 6-bit + ECN 2-bit)
  flowLabel: number; // 20-bit QoS Flow Label
  payloadLength: number; // 16-bit payload length (excludes 40-byte fixed header)
  nextHeader: number; // Protocol number or Extension Header type (e.g. 6 for TCP, 58 for ICMPv6, 43 for Routing)
  nextHeaderName: string;
  hopLimit: number; // Decremented by 1 at each router (replaces IPv4 TTL)
  sourceIp: string; // 128-bit address (e.g. "2001:db8:1::10")
  destinationIp: string; // 128-bit address (e.g. "2001:db8:2::100")
  extensionHeaders?: Ipv6ExtensionHeader[];
}

export interface Ipv6Node {
  id: string;
  name: string;
  type: "host" | "router" | "server";
  ipv6Address: string;
  linkLocalAddress: string;
  prefixLength: number;
  macAddress: string;
  isDualStack?: boolean;
  ipv4Address?: string;
  position: { x: number; y: number };
  roleDescription: string;
}

export interface Ipv6Link {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  mtu: number; // Minimum 1280 bytes per RFC 8200
  latencyMs: number;
  isTunnel?: boolean;
  label: string;
}

export interface Ipv6SimulationEvent {
  step: number;
  type:
    | "packet-originated"
    | "hop-by-hop-inspection"
    | "flow-label-switching"
    | "hop-limit-decrement"
    | "ndp-resolution"
    | "tunnel-encapsulation"
    | "delivered";
  title: string;
  summary: string;
  explanation: string;
  sourceNodeId: string;
  destNodeId: string;
  protocol: Ipv6ProtocolType;
  rfcReference: string;
  technicalDetails: string[];
  headerSnapshot: Ipv6Header;
}

export interface Ipv6SimulationPacket {
  id: string;
  stepIndex: number;
  sourceId: string;
  targetId: string;
  protocol: Ipv6ProtocolType;
  header: Ipv6Header;
  isTunneled?: boolean;
  label: string;
  progress: number;
  status: "delivered" | "in-flight" | "dropped";
}

export interface Ipv6Config {
  sourceIpv6: string;
  destinationIpv6: string;
  payloadSize: number; // e.g. 1200 bytes
  flowLabel: number;
  trafficClass: number;
  initialHopLimit: number;
  useExtensionHeader: boolean;
}

export interface Ipv6SimulationOutcome {
  config: Ipv6Config;
  events: Ipv6SimulationEvent[];
  packets: Ipv6SimulationPacket[];
  hopsTraversed: number;
  extensionHeaderCount: number;
  isDelivered: boolean;
}

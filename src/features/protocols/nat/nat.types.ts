export type NatMode =
  | "pat" // Port Address Translation / NAPT Overload (Many-to-One)
  | "static" // Static 1-to-1 NAT (One-to-One Mapping)
  | "dynamic" // Dynamic NAT (IP Pool Allocation)
  | "dnat" // Destination NAT / Port Forwarding (Public Server)
  | "cgnat"; // Carrier-Grade NAT (CGN / NAT444)

export type NatProtocol = "TCP" | "UDP" | "ICMP";

export interface NatTranslationEntry {
  id: string;
  protocol: NatProtocol;
  insideLocalIp: string; // e.g. 192.168.1.100
  insideLocalPort: number; // e.g. 54321
  insideGlobalIp: string; // e.g. 203.0.113.10
  insideGlobalPort: number; // e.g. 40001
  outsideGlobalIp: string; // e.g. 93.184.216.34
  outsideGlobalPort: number; // e.g. 80
  state: "ACTIVE" | "IDLE" | "STALE" | "EXPIRED";
  ttlSeconds: number;
  packetsTranslated: number;
  bytesTranslated: number;
  createdAt: number;
}

export interface NatConfig {
  mode: NatMode;
  publicIp: string; // e.g. 203.0.113.10
  privateSubnet: string; // e.g. 192.168.1.0/24
  publicPoolStart?: string; // e.g. 203.0.113.100
  publicPoolEnd?: string; // e.g. 203.0.113.110
  portForwardingRules?: {
    publicPort: number;
    privateIp: string;
    privatePort: number;
    protocol: NatProtocol;
  }[];
  timeoutSeconds: number;
}

export interface NatNode {
  id: string;
  name: string;
  type: "inside-host" | "nat-router" | "isp-router" | "outside-server";
  ipAddress: string;
  subnetMask?: string;
  macAddress: string;
  position: { x: number; y: number };
  zone: "inside" | "dmz" | "outside";
  roleDescription: string;
}

export interface NatLink {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label: string;
  zone: "inside" | "outside";
}

export interface NatSimulationPacket {
  id: string;
  stepIndex: number;
  sourceId: string;
  targetId: string;
  protocol: NatProtocol;
  direction: "outbound" | "inbound";
  srcIp: string;
  srcPort: number;
  dstIp: string;
  dstPort: number;
  isTranslated: boolean;
  label: string;
  progress: number;
  status: "in-flight" | "delivered" | "dropped";
}

export interface NatSimulationEvent {
  step: number;
  type: "packet-originated" | "nat-lookup" | "header-rewritten" | "forwarded" | "table-entry-created" | "packet-dropped";
  title: string;
  summary: string;
  explanation: string;
  sourceNodeId: string;
  destNodeId: string;
  protocol: NatProtocol;
  rfcReference: string;
  technicalDetails: string[];
  beforeHeader: {
    srcIp: string;
    srcPort: number;
    dstIp: string;
    dstPort: number;
  };
  afterHeader: {
    srcIp: string;
    srcPort: number;
    dstIp: string;
    dstPort: number;
  };
}

export interface NatSimulationOutcome {
  config: NatConfig;
  translationTable: NatTranslationEntry[];
  events: NatSimulationEvent[];
  packets: NatSimulationPacket[];
  totalTranslated: number;
  droppedPackets: number;
}

export type NatScenarioId =
  | "pat_web_browse"
  | "static_server_dnat"
  | "dynamic_ip_pool"
  | "port_exhaustion"
  | "cgnat_double_nat";

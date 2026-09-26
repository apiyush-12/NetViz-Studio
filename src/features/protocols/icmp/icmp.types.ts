import type { SimulationEvent, Packet } from "@/features/simulation/simulation-types";

export type IcmpMessageType =
  | "echo_request" // Type 8, Code 0
  | "echo_reply" // Type 0, Code 0
  | "time_exceeded" // Type 11, Code 0 (TTL=0) or Code 1 (Reassembly)
  | "destination_unreachable" // Type 3, Code 0-15 (Port, Host, Frag Needed, Admin)
  | "redirect" // Type 5, Code 0-3 (Redirect for Host/Net)
  | "source_quench" // Type 4, Code 0
  | "parameter_problem"; // Type 12, Code 0-2

export interface IcmpHeader {
  type: number; // 8 bits (e.g. 8 for Echo Request, 0 for Reply, 11 for Time Exceeded, 3 for Unreachable)
  code: number; // 8 bits (e.g. 0 for Net/TTL, 3 for Port, 4 for Frag Needed, 13 for Admin Prohibited)
  checksum: number; // 16 bits (RFC 1071 ones-complement sum)
  typeName: string; // e.g. "Echo Request", "Time-to-Live Exceeded", "Destination Port Unreachable"

  // Type-specific 32-bit fields
  identifier?: number; // 16 bits (Echo Request / Reply)
  sequenceNumber?: number; // 16 bits (Echo Request / Reply)
  nextHopMtu?: number; // 16 bits (Type 3 Code 4 - Path MTU Discovery)
  gatewayAddress?: string; // 32 bits (Type 5 - ICMP Redirect)
  pointer?: number; // 8 bits (Type 12 - Parameter Problem)

  // Error Message Quoted Original Datagram (RFC 792)
  originalIpHeader?: {
    sourceIp: string;
    destIp: string;
    protocol: number; // 1 = ICMP, 6 = TCP, 17 = UDP
    protocolName: string;
    totalLength: number;
    identification: number;
    dontFragment: boolean;
    ttl: number;
  };
  originalPayloadFirst8Bytes?: string; // e.g. "UDP SrcPort: 54123, DstPort: 33434" or "TCP Seq: 1001"
}

export interface IcmpPacketData {
  id: string;
  sourceIp: string;
  destIp: string;
  ipTtl: number;
  ipDontFragment: boolean;
  totalLengthBytes: number;
  icmpHeader: IcmpHeader;
  payloadSummary: string;
  payloadData?: string;
  rttMs?: number;
  isErrorResponse: boolean; // True for Type 3, Type 11, Type 5 (contains quoted original packet)
  droppedAtNodeId?: string;
  dropReason?: string;
}

export type IcmpTopologyPresetId =
  | "standard_internet_path"
  | "pmtud_bottleneck_path"
  | "unreachable_firewall_network"
  | "local_redirect_subnet";

export type IcmpScenarioId =
  | "echo_ping_roundtrip"
  | "traceroute_ttl_exceeded"
  | "pmtud_df_fragmentation_needed"
  | "dest_port_unreachable"
  | "firewall_admin_prohibited"
  | "icmp_redirect_gateway";

export interface IcmpNode {
  id: string;
  name: string;
  label: string;
  type: "host" | "router" | "firewall" | "server";
  ipAddress: string;
  subnetMask: string;
  defaultGateway?: string;
  interfaceMtu: number; // Default 1500 (or bottleneck MTU)
  pathMtuCache?: Record<string, number>; // Host Route Cache for PMTUD (e.g. {"203.0.113.80": 1300})
  arpTable?: Record<string, string>;
  isFirewall?: boolean;
  firewallDropAcl?: boolean;
  closedPorts?: number[]; // e.g. [33434] for UDP traceroute port unreachable
  position: { x: number; y: number };
  status: "active" | "congested" | "down";
}

export interface IcmpLink {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourcePortName: string;
  targetPortName: string;
  mtu: number; // Link MTU (e.g. 1500 standard, 1300 for WAN tunnel bottleneck)
  latencyMs: number;
  bandwidthMbps: number;
  isBottleneck?: boolean;
  status: "up" | "down";
}

export interface IcmpConfig {
  topologyPreset: IcmpTopologyPresetId;
  scenarioId: IcmpScenarioId;
  sourceNodeId: string;
  targetNodeId: string;
  packetSizeBytes: number; // Default 64 (or 1500 for PMTUD test)
  dontFragmentFlag: boolean; // DF flag in IPv4 header
  startingTtl: number; // Default 64 (or 1, 2, 3 for Traceroute steps)
  pingCount: number; // Default 4
  targetPort: number; // e.g. 33434 for UDP traceroute or 80 for Web
}

export interface IcmpCliLine {
  text: string;
  type: "command" | "info" | "success" | "error" | "warning";
  timestamp: string;
}

export interface IcmpSimulationStepState {
  step: number;
  title: string;
  description: string;
  nodes: IcmpNode[];
  links: IcmpLink[];
  activePacket?: IcmpPacketData;
  activeLinkIds: string[];
  activeNodeId?: string;
  cliOutputs: IcmpCliLine[];
  eventExplanation: {
    beginner: string;
    advanced: string;
    protocolRule: string;
    fieldsChanged?: string[];
  };
}

export interface IcmpSimulationOutcome {
  events: SimulationEvent[];
  packets: Packet[];
  steps: IcmpSimulationStepState[];
  finalNodes: IcmpNode[];
  finalLinks: IcmpLink[];
  summaryStats: {
    packetsTransmitted: number;
    packetsReceived: number;
    packetLossPercent: number;
    minRttMs: number;
    avgRttMs: number;
    maxRttMs: number;
    discoveredPathMtu?: number;
    tracerouteHops?: Array<{ hop: number; ip: string; name: string; rttMs: number }>;
  };
}

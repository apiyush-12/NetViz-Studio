/**
 * RIP (Routing Information Protocol - RFC 1058 / RFC 2453 / RFC 2080)
 * Core Domain Types & Data Models
 */

export type RipVersion = "ripv1" | "ripv2" | "ripng";

export type RipCommand = 1 | 2; // 1 = Request, 2 = Response

export type RipAuthType = "none" | "simple_password" | "md5";

export type RipTopologyPresetId =
  | "linear_4_router"
  | "triangle_redundant"
  | "shared_ethernet_lan"
  | "discontinuous_subnets";

export type RipScenarioId =
  | "bellman_ford_convergence"
  | "link_failure_split_horizon"
  | "count_to_infinity_loop"
  | "ripv2_vlsm_cidr_tagging"
  | "next_hop_optimization"
  | "route_timers_lifecycle";

export interface RipRouteTableEntry {
  addressFamily: number; // 2 for IP, 0xFFFF for Auth
  routeTag: number; // 16 bits (Autonomous System or external tag)
  ipAddress: string; // Destination IPv4/IPv6 Network Prefix
  subnetMask: string; // Subnet Mask (RIPv2 only, e.g. 255.255.255.0)
  nextHop: string; // Next Hop Router IP (0.0.0.0 = sender)
  metric: number; // Hop Count: 1 - 15 (16 = Infinity / Unreachable)
}

export interface RipAuthData {
  type: RipAuthType;
  keyId?: number;
  password?: string;
}

export interface RipPacketData {
  command: RipCommand; // 1 = Request, 2 = Response
  version: number; // 1 or 2
  routingDomain: number; // 16 bits (usually 0)
  entries: RipRouteTableEntry[];
  auth?: RipAuthData;
  sourceIp: string;
  destIp: string; // 255.255.255.255 (RIPv1) or 224.0.0.9 (RIPv2)
  sourcePort: number; // UDP 520
  destPort: number; // UDP 520
  packetLength: number;
}

export interface RipInterface {
  id: string;
  name: string; // e.g. Fa0/0, Fa0/1, Gi0/0
  ipAddress: string;
  subnetMask: string;
  network: string; // e.g. 192.168.1.0/24
  ripEnabled: boolean;
  passive: boolean;
  cost: number; // usually 1 hop
  connectedLinkId?: string;
}

export interface RipRoutingTableRecord {
  network: string; // e.g. "192.168.3.0"
  prefix: string; // e.g. "192.168.3.0/24"
  subnetMask: string;
  nextHop: string;
  interfaceName: string;
  metric: number; // 1..16
  routeType: "R" | "C" | "S"; // R=RIP, C=Connected, S=Static
  adminDistance: number; // 120 for RIP, 0 for Connected
  ageSeconds: number; // timer tracking
  state: "valid" | "holddown" | "poisoned" | "flushed";
  tag?: number;
}

export interface RipNode {
  id: string;
  name: string;
  type: "router" | "host" | "lan";
  ipAddress: string;
  interfaces: RipInterface[];
  routingTable: RipRoutingTableRecord[];
  timers: {
    update: number; // 30s
    invalid: number; // 180s
    holddown: number; // 180s
    flush: number; // 240s
  };
  status: "active" | "converging" | "holddown" | "isolated";
  splitHorizonEnabled: boolean;
  poisonReverseEnabled: boolean;
  position: { x: number; y: number };
}

export interface RipLink {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceInterface: string;
  targetInterface: string;
  subnet: string;
  cost: number; // 1 hop
  status: "up" | "down" | "flapping";
}

export interface RipConfig {
  version: RipVersion;
  scenarioId: RipScenarioId;
  topologyPreset: RipTopologyPresetId;
  splitHorizon: boolean;
  poisonReverse: boolean;
  triggeredUpdates: boolean;
  holddownEnabled: boolean;
  authentication: RipAuthType;
  updateIntervalSec: number;
  failedLinkId?: string;
}

export interface RipCliLine {
  text: string;
  type: "command" | "info" | "success" | "warning" | "error";
}

export interface RipSimulationStepState {
  stepIndex: number;
  title: string;
  description: string;
  activeNodeId?: string;
  activeLinkIds?: string[];
  activePacket?: RipPacketData;
  senderId?: string;
  receiverIds?: string[];
  phase:
    | "init"
    | "periodic_broadcast"
    | "triggered_flash"
    | "poison_reverse"
    | "loop_count"
    | "converged";
  nodes: RipNode[];
  links: RipLink[];
  cliOutputs: RipCliLine[];
  eventExplanation: {
    beginner: string;
    advanced: string;
    protocolRule?: string;
    fieldsChanged?: string[];
  };
}

export interface RipSimulationOutcome {
  steps: RipSimulationStepState[];
  finalNodes: RipNode[];
  finalLinks: RipLink[];
  convergenceRounds: number;
  loopDetected: boolean;
}

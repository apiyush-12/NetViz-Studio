/**
 * IS-IS (Intermediate System to Intermediate System - ISO/IEC 10589 / RFC 1195 / RFC 5308)
 * Core Domain Types & Data Models
 */

export type IsisRouterLevel = "L1" | "L2" | "L1_L2";

export type IsisMetricStyle = "narrow" | "wide";

export type IsisPduType =
  | 15 // L1 LAN IIH (Hello)
  | 16 // L2 LAN IIH (Hello)
  | 17 // P2P IIH (Point-to-Point Hello)
  | 18 // Level 1 LSP (Link State PDU)
  | 20 // Level 2 LSP (Link State PDU)
  | 24 // Level 1 CSNP (Complete Sequence Number PDU)
  | 25 // Level 2 CSNP
  | 26 // Level 1 PSNP (Partial Sequence Number PDU)
  | 27; // Level 2 PSNP

export type IsisTopologyPresetId =
  | "multi_area_hierarchy"
  | "broadcast_lan_dis"
  | "dual_stack_multi_topology"
  | "redundant_backbone_mesh";

export type IsisScenarioId =
  | "multi_area_hierarchy"
  | "attached_bit_default_route"
  | "dis_pseudonode_election"
  | "route_leaking_up_down"
  | "dual_stack_ipv4_ipv6"
  | "overload_bit_maintenance";

export interface IsisTlv {
  type: number; // 1=Area, 2=IS Neighbors, 6=IP Interfaces, 128=IP Internal, 135=Ext IP, 137=Hostname, 236=IPv6
  length: number;
  name: string;
  description?: string;
  areaAddresses?: string[];
  neighbors?: Array<{ neighborId: string; metric: number }>;
  ipInterfaces?: string[];
  ipInternalReachability?: Array<{ prefix: string; mask: string; metric: number; upDown?: boolean }>;
  extendedIpReachability?: Array<{ prefix: string; metric: number; upDown?: boolean }>;
  hostname?: string;
  ipv6Reachability?: Array<{ prefix: string; prefixLength: number; metric: number; upDown?: boolean }>;
  data?: Record<string, unknown>;
}

export interface IsisLspFlags {
  partitionRepair?: boolean; // Partition repair supported
  partition?: boolean;
  attached: boolean; // ATT-bit (1 = attached to L2 backbone)
  overload: boolean; // OL-bit (1 = overload / avoid transit)
  isType: IsisRouterLevel | (1 | 2 | 3); // 1=L1, 2=L2, 3=L1/L2
}

export interface IsisGenericHeader {
  nlpid: number; // 0x83 for IS-IS
  lengthIndicator: number; // 8
  version: number; // 1
  idLength: number; // 0 (indicates 6-octet System ID)
  pduType: IsisPduType;
  version2: number; // 1
  reserved: number; // 0
  maxAreaAddresses: number; // 3
}

export interface IsisLspHeader {
  pduLength: number;
  remainingLifetime: number;
  lspId: string; // e.g. "0000.0000.0001.00-00"
  sequenceNumber: number;
  checksum: number;
  flags: IsisLspFlags;
}

export interface IsisHelloHeader {
  circuitType: 1 | 2 | 3; // 1=L1, 2=L2, 3=L1/L2
  sourceSystemId: string;
  holdingTimer: number;
  pduLength: number;
  priority: number; // DIS priority 0-127
  lanIdOrCircuitId: string;
}

export interface IsisCsnpHeader {
  pduLength: number;
  sourceSystemId: string;
  startLspId: string;
  endLspId: string;
}

export interface IsisPduData {
  pduType: IsisPduType;
  pduTypeName: string; // e.g. "L1_LSP", "L2_LSP", "L1_LAN_IIH", "L2_LAN_IIH", "P2P_IIH", "L1_CSNP", "L2_CSNP"
  level: "L1" | "L2";
  sourceNodeId?: string;
  targetNodeId?: string;
  sourceSystemId: string; // e.g. "0000.0000.0001"
  sourceHostname: string; // e.g. "R1"
  destMacOrSystemId?: string;
  lspId?: string;
  sequenceNumber?: number;
  remainingLifetime?: number;
  checksum?: number;
  genericHeader: IsisGenericHeader;
  lspHeader?: IsisLspHeader;
  helloHeader?: IsisHelloHeader;
  csnpHeader?: IsisCsnpHeader;
  flags?: IsisLspFlags;
  tlvs: IsisTlv[];
  packetLength: number;
}

export interface IsisInterface {
  id: string;
  name: string; // e.g. Gi0/0, Gi0/1
  circuitType: "p2p" | "broadcast";
  level: IsisRouterLevel;
  ipAddress: string;
  ipv6Address?: string;
  metric: number; // default 10 (wide metric)
  disPriority: number; // default 64 (range 0-127)
  isDis: boolean;
  connectedLinkId?: string;
}

export interface IsisRoutingTableEntry {
  prefix: string; // e.g. "192.168.1.0/24" or "2001:db8:1::/64"
  level: "i L1" | "i L2" | "C"; // i L1, i L2, Connected
  nextHop: string;
  interfaceName: string;
  metric: number;
  adminDistance: number; // 115 for IS-IS, 0 for Connected
  upDownBit?: boolean; // RFC 2966 Route Leaking
  isDefault?: boolean;
}

export interface IsisDatabaseEntry {
  lspId: string; // e.g. "0000.0000.0001.00-00"
  hostname: string;
  seqNumber: string; // e.g. "0x00000005"
  checksum: string; // e.g. "0x7B2C"
  lifetime: number;
  level: "L1" | "L2";
  flags: string; // e.g. "ATT:1 P:0 OL:0"
  tlvs: IsisTlv[];
}

export interface IsisNode {
  id: string;
  name: string;
  systemId: string; // e.g. "0000.0000.0001"
  netAddress: string; // e.g. "49.0001.0000.0000.0001.00"
  areaId: string; // e.g. "49.0001"
  routerLevel: IsisRouterLevel;
  status: "active" | "overloaded" | "isolated";
  interfaces: IsisInterface[];
  database: IsisDatabaseEntry[];
  routingTable: IsisRoutingTableEntry[];
  overloadBit: boolean;
  attachedBit: boolean;
  position: { x: number; y: number };
  isDis?: boolean;
}

export interface IsisLink {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceInterface: string;
  targetInterface: string;
  circuitType: "p2p" | "broadcast";
  level: IsisRouterLevel;
  metric: number;
  status: "up" | "down";
}

export interface IsisConfig {
  scenarioId: IsisScenarioId;
  topologyPreset: IsisTopologyPresetId;
  metricStyle: IsisMetricStyle; // narrow (1-63) vs wide (RFC 5305 up to 16M)
  routeLeakingEnabled: boolean; // RFC 2966 L2->L1 route leaking with U/D bit
  overloadBit?: boolean;
  overloadBitNodeId?: string; // Node with OL-bit active
  disPriorityOverride?: { nodeId: string; priority: number };
  dualStackEnabled?: boolean;
  ipv6Enabled?: boolean;
  attachedBitBehavior?: "rfc_standard" | "always_set" | "never_set";
}

export interface IsisCliLine {
  nodeId?: string;
  text: string;
  level?: "info" | "warning" | "error" | "success";
  type?: "command" | "info" | "success" | "warning" | "error";
}

export interface IsisSimulationStepState {
  stepIndex: number;
  title: string;
  description: string;
  activeNodeId?: string;
  activeLinkIds?: string[];
  activePdu?: IsisPduData;
  senderId?: string;
  receiverIds?: string[];
  phase:
    | "init"
    | "hello_adj"
    | "dis_elect"
    | "lsp_flooding"
    | "spf_calc"
    | "route_leak"
    | "converged";
  nodes: IsisNode[];
  links: IsisLink[];
  cliOutputs: IsisCliLine[];
  eventExplanation: {
    beginner: string;
    advanced: string;
    protocolRule?: string;
    fieldsChanged?: string[];
  };
}

export interface IsisSimulationOutcome {
  steps: IsisSimulationStepState[];
  finalNodes: IsisNode[];
  finalLinks: IsisLink[];
  l1ConvergenceTimeMs: number;
  l2ConvergenceTimeMs: number;
}

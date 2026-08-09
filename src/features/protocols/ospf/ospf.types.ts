export type OspfNeighborState =
  | "down"
  | "init"
  | "2-way"
  | "exstart"
  | "exchange"
  | "loading"
  | "full";

export type OspfRouterRole = "DR" | "BDR" | "DROther";

export interface OspfInterface {
  id: string;
  name: string;
  ipAddress: string;
  prefixLength: number;
  areaId: string;
  cost: number;
  helloInterval: number;
  deadInterval: number;
  passive: boolean;
  enabled: boolean;
}

export interface OspfNeighbor {
  neighborId: string;
  neighborIp: string;
  interfaceId: string;
  interfaceName: string;
  state: OspfNeighborState;
  drPriority: number;
  role: OspfRouterRole;
  deadTimer: number;
}

export type LsaType = "Router (Type 1)" | "Network (Type 2)" | "Summary (Type 3)";

export interface OspfLsaLink {
  linkId: string;
  linkData: string;
  type: "point-to-point" | "transit" | "stub";
  metric: number;
  neighborRouterId?: string;
}

export interface OspfLsa {
  id: string;
  type: LsaType;
  advertisingRouter: string;
  linkStateId: string;
  sequenceNumber: string;
  age: number;
  checksum: string;
  links: OspfLsaLink[];
}

export interface OspfRoute {
  destination: string;
  prefixLength: number;
  nextHop: string;
  nextHopRouterId: string;
  cost: number;
  exitInterface: string;
  source: "OSPF" | "Connected" | "Static";
  path: string[]; // List of router IDs in path
}

export interface OspfRouter {
  nodeId: string;
  name: string;
  routerId: string;
  processId: number;
  areaId: string;
  state: "Init" | "2-Way" | "ExStart" | "Exchange" | "Loading" | "Full" | "Disabled";
  interfaces: OspfInterface[];
  neighbors: OspfNeighbor[];
  lsdb: OspfLsa[];
  routingTable: OspfRoute[];
  position: { x: number; y: number };
}

export interface OspfLink {
  id: string;
  sourceRouterId: string;
  targetRouterId: string;
  sourceInterfaceId: string;
  targetInterfaceId: string;
  cost: number;
  enabled: boolean;
  areaId: string;
  status: "up" | "down";
}

export interface OspfSpfStep {
  stepNumber: number;
  currentNodeId: string;
  currentCost: number;
  visitedNodes: string[];
  candidateList: Array<{
    nodeId: string;
    cost: number;
    viaNodeId: string;
    path: string[];
  }>;
  shortestPathTree: Record<string, { cost: number; via: string; path: string[] }>;
  description: string;
}

export interface OspfArea {
  id: string;
  name: string;
  type: "backbone" | "standard" | "stub";
  x: number;
  y: number;
  width: number;
  height: number;
  routers: string[];
}

export interface OspfConfig {
  [key: string]: unknown;
  topologyPreset?: "diamond" | "ring" | "multi-area" | "triangle";
  rootRouterId?: string;
  routers: Array<{
    nodeId: string;
    routerId: string;
    processId: number;
    areaId: string;
    enabled: boolean;
    interfaces: Array<{
      id: string;
      cost: number;
      helloInterval: number;
      deadInterval: number;
      passive: boolean;
      enabled: boolean;
    }>;
  }>;
  links: Array<{
    id: string;
    cost: number;
    enabled: boolean;
  }>;
  labelMode: "simple" | "technical";
  failureScenario?:
    | "none"
    | "r2_r4_cost_high"
    | "r2_r4_break"
    | "area_mismatch"
    | "timer_mismatch"
    | "duplicate_rid"
    | "ring_break"
    | "abr_failure";
}

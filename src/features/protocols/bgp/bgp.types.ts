export type BgpSessionState =
  | "idle"
  | "connect"
  | "active"
  | "opensent"
  | "openconfirm"
  | "established";

export type BgpOriginType = "igp" | "egp" | "incomplete";

export interface BgpPeer {
  id: string;
  name: string;
  neighborIp: string;
  remoteAsn: number;
  localAsn: number;
  state: BgpSessionState;
  holdTime: number;
  keepaliveInterval: number;
  receivedPrefixes: string[];
  advertisedPrefixes: string[];
  enabled: boolean;
  localPreference?: number;
  med?: number;
  asPathPrependCount?: number;
}

export interface BgpRoute {
  id: string;
  prefix: string;
  prefixLength: number;
  nextHop: string;
  localPreference: number;
  asPath: number[];
  med: number;
  origin: BgpOriginType;
  valid: boolean;
  best: boolean;
  rejectionReason?: string;
  learnedFromPeerId?: string;
  asPathPrependCount?: number;
}

export interface BgpIpRoute {
  destination: string;
  nextHop: string;
  asPath: number[];
  source: "BGP (eBGP)" | "BGP (iBGP)" | "Connected";
  metric: number;
}

export interface AutonomousSystem {
  asn: number;
  name: string;
  color: string;
  routers: string[];
  advertisedPrefixes: string[];
  peers: number[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface BgpRouter {
  nodeId: string;
  name: string;
  routerId: string;
  localAsn: number;
  state: "Established" | "Connecting" | "Idle" | "Disabled";
  peers: BgpPeer[];
  advertisedPrefixes: string[];
  bgpTable: BgpRoute[];
  routingTable: BgpIpRoute[];
  position: { x: number; y: number };
}

export interface BgpLink {
  id: string;
  sourceRouterId: string;
  targetRouterId: string;
  sourceAsn: number;
  targetAsn: number;
  sourceIp: string;
  targetIp: string;
  enabled: boolean;
  status: "up" | "down";
}

export interface BgpBestPathComparisonStep {
  stepNumber: number;
  criterion: string;
  winnerRouteId: string | null;
  description: string;
  candidateA: {
    pathName: string;
    value: string | number;
    preferred: boolean;
  };
  candidateB: {
    pathName: string;
    value: string | number;
    preferred: boolean;
  };
  eliminatedPath?: string;
  winningReason?: string;
}

export interface BgpConfig {
  [key: string]: unknown;
  topologyPreset?: "multi-homed" | "tier1-hub" | "triangle" | "ibgp-ebgp";
  routers: Array<{
    nodeId: string;
    routerId: string;
    localAsn: number;
    enabled: boolean;
    advertisedPrefixes: string[];
    peers: Array<{
      id: string;
      remoteAsn: number;
      neighborIp: string;
      enabled: boolean;
      localPreference?: number;
      med?: number;
      asPathPrependCount?: number;
    }>;
  }>;
  links: Array<{
    id: string;
    enabled: boolean;
  }>;
  labelMode: "simple" | "technical";
  failureScenario?:
    | "none"
    | "break_as65001_as65002"
    | "as_path_prepend_as65002"
    | "withdraw_prefix"
    | "as_loop_injection"
    | "invalid_remote_asn"
    | "med_influence"
    | "tier1_failover"
    | "peer_as_down";
}

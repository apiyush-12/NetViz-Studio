import type { SimulationEvent, Packet } from "@/features/simulation/simulation-types";

export type StpVersion = "stp" | "rstp";

export type StpPortRole = "root" | "designated" | "alternate" | "backup" | "disabled";

export type StpPortState =
  | "disabled"
  | "blocking"
  | "listening"
  | "learning"
  | "forwarding"
  | "discarding"
  | "broken";

export type BpduType = "config" | "tcn" | "rstp";

export interface BridgeId {
  priority: number; // e.g. 32768, 4096, 0 (multiples of 4096)
  sysIdExtension: number; // VLAN ID, default 1
  macAddress: string; // e.g. "00:1A:2B:3C:4D:01"
}

export interface StpPort {
  id: string; // e.g. "sw1-p1"
  name: string; // e.g. "Gi0/1" or "Fa0/1"
  switchId: string;
  speedMbps: number; // 10, 100, 1000, 10000
  cost: number; // 100, 19, 4, 2 (802.1D / 802.1w standard)
  portPriority: number; // 128 (default)
  portNumber: number; // 1, 2, 3...
  role: StpPortRole;
  state: StpPortState;
  designatedBridgeId?: BridgeId;
  designatedPortId?: string;
  isEdgePort?: boolean; // PortFast
  rootGuardEnabled?: boolean;
  bpduGuardEnabled?: boolean;
  txBpduCount: number;
  rxBpduCount: number;
}

export interface StpSwitchNode {
  id: string;
  name: string;
  label: string;
  bridgeId: BridgeId;
  rootBridgeId: BridgeId;
  rootPathCost: number;
  rootPortId: string | null;
  isRoot: boolean;
  ports: StpPort[];
  position: { x: number; y: number };
  roleDescription?: string;
  helloTimer: number; // default 2s
  maxAge: number; // default 20s
  forwardDelay: number; // default 15s
  topologyChangeFlag: boolean;
  camAgingTime: number; // 300s normally, 15s during TCN
}

export interface StpLink {
  id: string;
  sourceSwitchId: string;
  sourcePortId: string;
  targetSwitchId: string;
  targetPortId: string;
  speedMbps: number;
  cost: number;
  enabled: boolean;
  isPtP: boolean; // Point-to-Point link (RSTP rapid sync requirement)
}

export interface BpduFlags {
  topologyChangeAck: boolean; // TCA - bit 7
  agreement: boolean; // RSTP - bit 6
  forwarding: boolean; // RSTP - bit 5
  learning: boolean; // RSTP - bit 4
  portRole: StpPortRole; // RSTP - bits 3-2
  proposal: boolean; // RSTP - bit 1
  topologyChange: boolean; // TC - bit 0
}

export interface BpduFrame {
  id: string;
  type: BpduType;
  protocolId: number; // 0x0000 (STP)
  version: number; // 0 (802.1D) or 2 (802.1w RSTP)
  flags: BpduFlags;
  rootBridgeId: BridgeId;
  rootPathCost: number;
  senderBridgeId: BridgeId;
  portId: { priority: number; number: number };
  messageAge: number;
  maxAge: number;
  helloTime: number;
  forwardDelay: number;
  sourceMac: string;
  destMac: string; // 01:80:C2:00:00:00 (STP bridge group multicast)
}

export type StpScenarioId =
  | "standard_convergence"
  | "root_link_failure"
  | "root_election_tiebreak"
  | "rstp_rapid_convergence"
  | "rogue_root_attack";

export type StpTopologyPresetId =
  | "triangle_loop"
  | "diamond_core"
  | "hierarchical_campus"
  | "ring_network";

export interface StpConfig {
  version: StpVersion;
  topologyPreset: StpTopologyPresetId;
  scenarioId: StpScenarioId;
  switches?: {
    id: string;
    priority: number;
  }[];
  customLinkCosts?: {
    linkId: string;
    cost: number;
  }[];
  rootGuardOnAccess?: boolean;
}

export interface StpSimulationStepState {
  step: number;
  title: string;
  description: string;
  switches: StpSwitchNode[];
  links: StpLink[];
  activeBpdu?: BpduFrame;
  activeLinkIds: string[];
  blockedPortIds: string[];
  rootPortIds: string[];
  designatedPortIds: string[];
  loopActive: boolean;
  eventExplanation: {
    beginner: string;
    advanced: string;
    protocolRule: string;
    tieBreakerUsed?: string;
  };
}

export interface StpSimulationOutcome {
  events: SimulationEvent[];
  packets: Packet[];
  steps: StpSimulationStepState[];
  finalSwitches: StpSwitchNode[];
  finalLinks: StpLink[];
  rootBridgeId: BridgeId;
}

import type { SimulationEvent, Packet } from "@/features/simulation/simulation-types";

export type MplsRouterRole =
  | "ce" // Customer Edge (Standard IP, non-MPLS)
  | "ingress-ler" // Ingress Label Edge Router / PE (Pushes label)
  | "core-lsr" // Core Label Switching Router / P (Swaps label)
  | "penultimate-lsr" // Penultimate Hop LSR (Performs PHP)
  | "egress-ler" // Egress Label Edge Router / PE (Pops label)
  | "backup-lsr"; // Fast Reroute Backup LSR

export type MplsOperation =
  | "PUSH" // Ingress label imposition (e.g. native IP -> MPLS)
  | "SWAP" // Core label replacement (e.g. 101 -> 202)
  | "POP" // Egress label removal
  | "PHP" // Penultimate Hop Popping (Implicit Null Label 3)
  | "UNTAG" // Native IP transit
  | "STACK_PUSH"; // Pushing a 2nd/3rd label (e.g. L3VPN / FRR bypass)

export type TtlPropagationMode = "uniform" | "pipe" | "short-pipe";

export interface MplsShimHeader {
  label: number; // 20 bits: 0 to 1,048,575 (0-15 reserved: 0 IPv4 Explicit Null, 3 Implicit Null, etc.)
  trafficClass: number; // 3 bits: 0 to 7 (EXP / CoS / QoS)
  bottomOfStack: boolean; // 1 bit: true if S=1 (last label in stack), false if S=0
  ttl: number; // 8 bits: 1 to 255
  labelName?: string; // e.g. "Transport (LDP)", "VPN (MP-BGP)", "FRR-Bypass"
}

export interface LfibEntry {
  inLabel: number; // Incoming label looked up in LFIB (e.g. 101)
  outLabel: number | "POP" | "UNTAG" | "IMPLICIT_NULL"; // Outgoing label (e.g. 202 or POP)
  prefix: string; // Destination FEC/Prefix (e.g. "10.2.0.0/24")
  inInterface: string; // e.g. "Gi0/1"
  outInterface: string; // e.g. "Gi0/2"
  nextHop: string; // e.g. "10.0.1.2"
  action: MplsOperation;
  bytesSwapped: number;
}

export interface LibEntry {
  prefix: string; // FEC
  localLabel: number; // Label allocated locally
  remoteBindings: Array<{
    neighborRouterId: string;
    neighborLabel: number;
  }>;
}

export interface FibEntry {
  prefix: string; // Destination IP prefix
  nextHop: string;
  outInterface: string;
  action: "PUSH" | "FORWARD_IP" | "DROP";
  pushLabels?: number[]; // One or two labels to push (e.g. [101] or [101, 501])
}

export interface VrfTable {
  vrfName: string; // e.g. "VRF_RED_CUSTOMER_A", "VRF_BLUE_CUSTOMER_B"
  routeDistinguisher: string; // e.g. "65000:10"
  routeTargetExport: string; // e.g. "65000:10"
  routeTargetImport: string; // e.g. "65000:10"
  vpnLabel: number; // Inner VPN label allocated by MP-BGP (e.g. 501)
  routes: Array<{
    prefix: string;
    nextHop: string;
    interface: string;
  }>;
}

export interface MplsNode {
  id: string;
  name: string;
  label: string;
  role: MplsRouterRole;
  ipAddress: string;
  loopbackIp: string;
  routerId: string;
  asn?: number;
  lfib: LfibEntry[];
  lib: LibEntry[];
  fib: FibEntry[];
  vrfs?: VrfTable[];
  activeLabels: number[];
  phpEnabled?: boolean;
  position: { x: number; y: number };
  status: "active" | "degraded" | "failed";
}

export interface MplsLink {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourcePortName: string;
  targetPortName: string;
  bandwidthMbps: number;
  metric: number;
  isLsp: boolean;
  isBypassLsp?: boolean;
  status: "up" | "down" | "congested";
  activeLabel?: number;
}

export interface MplsPacketData {
  id: string;
  sourceIp: string;
  destIp: string;
  customerName?: string;
  vrfName?: string;
  ipTtl: number;
  payloadType: "ICMP_ECHO" | "TCP_DATA" | "UDP_DATA" | "LDP_HELLO" | "LDP_ADVERT";
  payloadSummary: string;
  labelStack: MplsShimHeader[]; // Stack of 0, 1, 2, or 3 labels (Index 0 = Top of Stack)
  currentOperation: MplsOperation;
  operationDescription: string;
  ingressPort?: string;
  egressPort?: string;
  isFrrDetour?: boolean;
}

export type MplsTopologyPresetId =
  | "standard_core_lsp"
  | "penultimate_hop_popping"
  | "l3vpn_two_label_stack"
  | "mpls_fast_reroute_frr"
  | "ttl_uniform_vs_pipe";

export type MplsScenarioId =
  | "basic_push_swap_pop"
  | "php_implicit_null"
  | "l3vpn_multi_tenant_traffic"
  | "frr_link_failure_detour"
  | "traceroute_uniform_mode"
  | "traceroute_pipe_mode";

export interface MplsConfig {
  topologyPreset: MplsTopologyPresetId;
  scenarioId: MplsScenarioId;
  sourceNodeId: string;
  targetNodeId: string;
  phpEnabled: boolean;
  ttlMode: TtlPropagationMode;
  trafficClassExp: number; // 0 to 7
  stackDepth: "single" | "double" | "triple";
  simulateLinkFailure: boolean;
  customerVrf: "VRF_RED_CUSTOMER_A" | "VRF_BLUE_CUSTOMER_B" | "GLOBAL_IP";
}

export interface MplsSimulationStepState {
  step: number;
  title: string;
  description: string;
  nodes: MplsNode[];
  links: MplsLink[];
  activePacket?: MplsPacketData;
  activeLinkIds: string[];
  activeNodeId?: string;
  highlightedLspNodeIds: string[];
  eventExplanation: {
    beginner: string;
    advanced: string;
    protocolRule: string;
    fieldsChanged?: string[];
  };
}

export interface MplsSimulationOutcome {
  events: SimulationEvent[];
  packets: Packet[];
  steps: MplsSimulationStepState[];
  finalNodes: MplsNode[];
  finalLinks: MplsLink[];
}

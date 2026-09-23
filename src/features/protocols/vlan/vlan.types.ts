import type { SimulationEvent, Packet } from "@/features/simulation/simulation-types";

export type VlanPortMode = "access" | "trunk" | "hybrid";

export interface VlanDefinition {
  vlanId: number; // e.g. 1, 10, 20, 30, 99
  name: string; // e.g. "DEFAULT", "ENGINEERING", "SALES", "VOICE", "NATIVE_MGMT"
  color: string; // Hex color code for UI zones and badges
  subnet: string; // e.g. "192.168.10.0/24"
  gatewayIp: string; // e.g. "192.168.10.1"
  description?: string;
}

export interface Dot1QHeader {
  tpid: number; // 0x8100 (Tag Protocol Identifier)
  pcp: number; // 0-7 (Priority Code Point - 802.1p CoS)
  dei: boolean; // Drop Eligible Indicator (formerly CFI)
  vlanId: number; // 1-4094 (VLAN Identifier - VID)
}

export interface VlanSwitchPort {
  id: string; // e.g. "sw1-fa0/1"
  name: string; // e.g. "Fa0/1", "Gi0/1"
  switchId: string;
  mode: VlanPortMode;
  pvid: number; // Port VLAN ID (Access VLAN ID, default 1)
  allowedVlans: number[]; // Allowed VLANs on trunk (e.g. [10, 20, 30])
  nativeVlanId: number; // Native VLAN for trunk (default 1)
  tagNative?: boolean; // If true, native VLAN traffic is also 802.1Q tagged
  connectedNodeId?: string;
  connectedPortName?: string;
  voiceVlanId?: number; // Optional auxiliary voice VLAN
}

export interface VlanSubInterface {
  id: string; // e.g. "r1-g0/0.10"
  name: string; // e.g. "Gi0/0.10"
  parentPort: string; // e.g. "Gi0/0"
  vlanId: number; // 802.1Q encapsulation VLAN ID
  ipAddress: string; // Gateway IP e.g. "192.168.10.1"
  subnetMask: string; // e.g. "255.255.255.0"
  macAddress: string;
}

export interface VlanSviInterface {
  vlanId: number; // e.g. 10
  name: string; // e.g. "Vlan10"
  ipAddress: string; // Gateway IP e.g. "192.168.10.1"
  subnetMask: string; // e.g. "255.255.255.0"
  macAddress: string;
  enabled: boolean;
}

export interface VlanNode {
  id: string;
  name: string;
  label: string;
  type: "host" | "switch" | "router" | "layer3-switch" | "attacker" | "server";
  ipAddress: string;
  subnetMask: string;
  macAddress: string;
  defaultGateway?: string;
  vlanId: number; // For hosts/servers: the VLAN they are assigned to
  ports?: VlanSwitchPort[]; // For switches / L3 switches
  subInterfaces?: VlanSubInterface[]; // For Router-on-a-Stick
  sviInterfaces?: VlanSviInterface[]; // For Layer 3 switch SVI routing
  vlans?: VlanDefinition[]; // Configured VLAN database on the switch
  position: { x: number; y: number };
  isAttacker?: boolean;
}

export interface VlanLink {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourcePortName: string;
  targetPortName: string;
  linkType: "access" | "trunk" | "router-link";
  pvid?: number; // For access links
  trunkAllowedVlans?: number[]; // For trunk links
  nativeVlanId?: number;
  speedMbps: number;
  enabled: boolean;
}

export interface VlanFrameData {
  id: string;
  sourceMac: string;
  destMac: string;
  etherType: number; // 0x0800 (IPv4), 0x0806 (ARP)
  sourceIp: string;
  destIp: string;
  payloadSummary: string;
  isTagged: boolean; // True when 802.1Q 4-byte header is present
  dot1q?: Dot1QHeader;
  sourceVlanId: number;
  destVlanId?: number;
  isBroadcast: boolean;
  isDoubleTagged?: boolean; // For VLAN Hopping / Double Tagging attacks
  innerVlanId?: number;
  ttl?: number;
}

export type VlanTopologyPresetId =
  | "multi_vlan_access_switch"
  | "two_switch_trunking"
  | "router_on_a_stick"
  | "layer3_switch_svi"
  | "vlan_hopping_security";

export type VlanScenarioId =
  | "intra_vlan_broadcast_isolation"
  | "trunk_8021q_tagging"
  | "inter_vlan_router_on_a_stick"
  | "inter_vlan_l3_svi"
  | "native_vlan_untagged"
  | "vlan_hopping_attack";

export interface VlanConfig {
  topologyPreset: VlanTopologyPresetId;
  scenarioId: VlanScenarioId;
  sourceNodeId: string;
  targetNodeId: string;
  nativeVlanId: number;
  trunkAllowedVlans: number[];
  routingMode: "roas" | "svi" | "none";
  enableDoubleTagging: boolean;
  tagNativeVlan: boolean;
}

export interface VlanSimulationStepState {
  step: number;
  title: string;
  description: string;
  nodes: VlanNode[];
  links: VlanLink[];
  activeFrame?: VlanFrameData;
  activeLinkIds: string[];
  broadcastLinkIds: string[];
  isolatedNodeIds: string[];
  eventExplanation: {
    beginner: string;
    advanced: string;
    protocolRule: string;
    fieldsChanged?: string[];
  };
}

export interface VlanSimulationOutcome {
  events: SimulationEvent[];
  packets: Packet[];
  steps: VlanSimulationStepState[];
  finalNodes: VlanNode[];
  finalLinks: VlanLink[];
}

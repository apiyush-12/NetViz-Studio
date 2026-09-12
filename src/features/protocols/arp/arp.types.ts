import type { SimulationEvent, Packet } from "@/features/simulation/simulation-types";

export type ArpOpCode = 1 | 2 | 3 | 4; // 1: Request, 2: Reply, 3: RARP Request, 4: RARP Reply

export type ArpHardwareType = 1; // 1: Ethernet (10Mb/100Mb/1Gb/10Gb)

export type ArpProtocolType = 0x0800; // 0x0800: IPv4

export type ArpCacheEntryType = "dynamic" | "static" | "incomplete";

export type ArpCacheEntryState = "resolved" | "pending" | "poisoned" | "validated";

export interface ArpCacheEntry {
  ipAddress: string;
  macAddress: string;
  interfaceName: string;
  type: ArpCacheEntryType;
  state: ArpCacheEntryState;
  ageSeconds: number;
  ttlSeconds: number;
}

export interface ArpPacketData {
  id: string;
  hardwareType: ArpHardwareType; // 0x0001 (Ethernet)
  protocolType: ArpProtocolType; // 0x0800 (IPv4)
  hardwareSize: number; // 6 bytes (MAC)
  protocolSize: number; // 4 bytes (IPv4)
  opcode: ArpOpCode; // 1 (Request), 2 (Reply)
  senderMac: string; // SHA
  senderIp: string; // SPA
  targetMac: string; // THA (00:00:00:00:00:00 for requests)
  targetIp: string; // TPA
  isGratuitous?: boolean;
  isProxy?: boolean;
  isPoisoned?: boolean;
  destEthernetMac: string; // FF:FF:FF:FF:FF:FF (broadcast) or unicast
  sourceEthernetMac: string;
}

export interface ArpNode {
  id: string;
  name: string;
  label: string;
  type: "host" | "switch" | "router" | "attacker" | "server";
  ipAddress: string;
  subnetMask: string;
  macAddress: string;
  defaultGateway?: string;
  position: { x: number; y: number };
  arpCache: ArpCacheEntry[];
  macTable?: Record<string, string>; // port -> MAC for switches
  isTarget?: boolean;
  isSource?: boolean;
  isAttacker?: boolean;
  daiEnabled?: boolean; // Dynamic ARP Inspection enabled on switch
}

export interface ArpLink {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourcePort: string;
  targetPort: string;
  speedMbps: number;
  enabled: boolean;
}

export type ArpScenarioId =
  | "standard_local_arp"
  | "gateway_cross_subnet"
  | "gratuitous_arp_conflict"
  | "proxy_arp_wan"
  | "arp_spoofing_dai";

export type ArpTopologyPresetId =
  | "standard_lan"
  | "cross_subnet_router"
  | "vrrp_failover"
  | "security_dai_lan";

export interface ArpConfig {
  topologyPreset: ArpTopologyPresetId;
  scenarioId: ArpScenarioId;
  sourceNodeId: string;
  targetIp: string;
  gratuitousArp: boolean;
  proxyArpEnabled: boolean;
  attackerEnabled: boolean;
  daiEnabled: boolean;
  cacheTimeoutSeconds: number;
}

export interface ArpSimulationStepState {
  step: number;
  title: string;
  description: string;
  nodes: ArpNode[];
  links: ArpLink[];
  activePacket?: ArpPacketData;
  activeLinkIds: string[];
  broadcastLinkIds: string[];
  poisonedNodeIds: string[];
  eventExplanation: {
    beginner: string;
    advanced: string;
    protocolRule: string;
    fieldsChanged?: string[];
  };
}

export interface ArpSimulationOutcome {
  events: SimulationEvent[];
  packets: Packet[];
  steps: ArpSimulationStepState[];
  finalNodes: ArpNode[];
  finalLinks: ArpLink[];
  resolvedMac?: string;
}

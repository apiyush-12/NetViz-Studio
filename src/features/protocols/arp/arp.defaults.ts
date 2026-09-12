import type {
  ArpConfig,
  ArpNode,
  ArpLink,
  ArpTopologyPresetId,
  ArpScenarioId,
} from "./arp.types";

export const defaultArpConfig: ArpConfig = {
  topologyPreset: "standard_lan",
  scenarioId: "standard_local_arp",
  sourceNodeId: "host-a",
  targetIp: "192.168.1.20",
  gratuitousArp: false,
  proxyArpEnabled: false,
  attackerEnabled: false,
  daiEnabled: false,
  cacheTimeoutSeconds: 300,
};

// ─── Preset 1: Standard LAN (Single Subnet / 192.168.1.0/24) ────────────────
export const STANDARD_LAN_NODES: ArpNode[] = [
  {
    id: "host-a",
    name: "Host A (Workstation 1)",
    label: "Host A",
    type: "host",
    ipAddress: "192.168.1.10",
    subnetMask: "255.255.255.0",
    macAddress: "00:1A:2B:3C:4D:01",
    defaultGateway: "192.168.1.1",
    position: { x: 100, y: 100 },
    arpCache: [],
    isSource: true,
  },
  {
    id: "sw-1",
    name: "Layer 2 Switch",
    label: "Switch-1",
    type: "switch",
    ipAddress: "192.168.1.254",
    subnetMask: "255.255.255.0",
    macAddress: "00:AA:00:11:22:33",
    position: { x: 300, y: 190 },
    arpCache: [],
    macTable: {},
  },
  {
    id: "host-b",
    name: "Host B (Target Workstation)",
    label: "Host B",
    type: "host",
    ipAddress: "192.168.1.20",
    subnetMask: "255.255.255.0",
    macAddress: "00:1A:2B:3C:4D:02",
    defaultGateway: "192.168.1.1",
    position: { x: 500, y: 100 },
    arpCache: [],
    isTarget: true,
  },
  {
    id: "host-c",
    name: "Host C (Quiet Workstation)",
    label: "Host C",
    type: "host",
    ipAddress: "192.168.1.30",
    subnetMask: "255.255.255.0",
    macAddress: "00:1A:2B:3C:4D:03",
    defaultGateway: "192.168.1.1",
    position: { x: 300, y: 320 },
    arpCache: [],
  },
];

export const STANDARD_LAN_LINKS: ArpLink[] = [
  { id: "link-ha-sw", sourceNodeId: "host-a", targetNodeId: "sw-1", sourcePort: "eth0", targetPort: "Fa0/1", speedMbps: 1000, enabled: true },
  { id: "link-hb-sw", sourceNodeId: "host-b", targetNodeId: "sw-1", sourcePort: "eth0", targetPort: "Fa0/2", speedMbps: 1000, enabled: true },
  { id: "link-hc-sw", sourceNodeId: "host-c", targetNodeId: "sw-1", sourcePort: "eth0", targetPort: "Fa0/3", speedMbps: 1000, enabled: true },
];

// ─── Preset 2: Cross-Subnet Router (Gateway ARP) ─────────────────────────────
export const CROSS_SUBNET_NODES: ArpNode[] = [
  {
    id: "host-a",
    name: "Host A (LAN 1)",
    label: "Host A",
    type: "host",
    ipAddress: "192.168.1.10",
    subnetMask: "255.255.255.0",
    macAddress: "00:11:11:11:11:11",
    defaultGateway: "192.168.1.1",
    position: { x: 80, y: 190 },
    arpCache: [],
    isSource: true,
  },
  {
    id: "sw-1",
    name: "Switch LAN 1",
    label: "SW-1",
    type: "switch",
    ipAddress: "192.168.1.254",
    subnetMask: "255.255.255.0",
    macAddress: "00:AA:00:00:00:01",
    position: { x: 200, y: 190 },
    arpCache: [],
    macTable: {},
  },
  {
    id: "router-gw",
    name: "Core Gateway Router",
    label: "Router-1",
    type: "router",
    ipAddress: "192.168.1.1",
    subnetMask: "255.255.255.0",
    macAddress: "00:00:5E:00:01:01",
    position: { x: 330, y: 190 },
    arpCache: [],
  },
  {
    id: "sw-2",
    name: "Switch LAN 2",
    label: "SW-2",
    type: "switch",
    ipAddress: "10.0.0.254",
    subnetMask: "255.255.255.0",
    macAddress: "00:AA:00:00:00:02",
    position: { x: 460, y: 190 },
    arpCache: [],
    macTable: {},
  },
  {
    id: "server-remote",
    name: "App Server (Remote LAN 2)",
    label: "Server",
    type: "server",
    ipAddress: "10.0.0.50",
    subnetMask: "255.255.255.0",
    macAddress: "00:22:22:22:22:22",
    defaultGateway: "10.0.0.1",
    position: { x: 570, y: 190 },
    arpCache: [],
    isTarget: true,
  },
];

export const CROSS_SUBNET_LINKS: ArpLink[] = [
  { id: "link-ha-sw1", sourceNodeId: "host-a", targetNodeId: "sw-1", sourcePort: "eth0", targetPort: "Gi0/1", speedMbps: 1000, enabled: true },
  { id: "link-sw1-gw", sourceNodeId: "sw-1", targetNodeId: "router-gw", sourcePort: "Gi0/24", targetPort: "Gi0/0", speedMbps: 1000, enabled: true },
  { id: "link-gw-sw2", sourceNodeId: "router-gw", targetNodeId: "sw-2", sourcePort: "Gi0/1", targetPort: "Gi0/24", speedMbps: 1000, enabled: true },
  { id: "link-sw2-srv", sourceNodeId: "sw-2", targetNodeId: "server-remote", sourcePort: "Gi0/2", targetPort: "eth0", speedMbps: 1000, enabled: true },
];

// ─── Preset 3: VRRP / Gratuitous ARP Failover ────────────────────────────────
export const VRRP_NODES: ArpNode[] = [
  {
    id: "host-a",
    name: "Client Workstation",
    label: "Client-1",
    type: "host",
    ipAddress: "192.168.1.50",
    subnetMask: "255.255.255.0",
    macAddress: "00:50:56:C0:00:01",
    defaultGateway: "192.168.1.1",
    position: { x: 300, y: 320 },
    arpCache: [
      { ipAddress: "192.168.1.1", macAddress: "00:00:5E:00:01:01", interfaceName: "eth0", type: "dynamic", state: "resolved", ageSeconds: 10, ttlSeconds: 300 }
    ],
  },
  {
    id: "sw-1",
    name: "Enterprise Core Switch",
    label: "Switch-1",
    type: "switch",
    ipAddress: "192.168.1.254",
    subnetMask: "255.255.255.0",
    macAddress: "00:BB:00:11:22:33",
    position: { x: 300, y: 190 },
    arpCache: [],
    macTable: { "Fa0/1": "00:00:5E:00:01:01", "Fa0/3": "00:50:56:C0:00:01" },
  },
  {
    id: "router-master",
    name: "VRRP Router 1 (Master)",
    label: "R1 (Master)",
    type: "router",
    ipAddress: "192.168.1.2",
    subnetMask: "255.255.255.0",
    macAddress: "00:00:5E:00:01:01",
    position: { x: 120, y: 70 },
    arpCache: [],
  },
  {
    id: "router-backup",
    name: "VRRP Router 2 (Backup -> New Master)",
    label: "R2 (Backup)",
    type: "router",
    ipAddress: "192.168.1.3",
    subnetMask: "255.255.255.0",
    macAddress: "00:00:5E:00:01:02",
    position: { x: 480, y: 70 },
    arpCache: [],
  },
];

export const VRRP_LINKS: ArpLink[] = [
  { id: "link-r1-sw", sourceNodeId: "router-master", targetNodeId: "sw-1", sourcePort: "Gi0/1", targetPort: "Fa0/1", speedMbps: 1000, enabled: true },
  { id: "link-r2-sw", sourceNodeId: "router-backup", targetNodeId: "sw-1", sourcePort: "Gi0/1", targetPort: "Fa0/2", speedMbps: 1000, enabled: true },
  { id: "link-ha-sw", sourceNodeId: "host-a", targetNodeId: "sw-1", sourcePort: "eth0", targetPort: "Fa0/3", speedMbps: 1000, enabled: true },
];

// ─── Preset 4: Security LAN (ARP Poisoning vs DAI) ───────────────────────────
export const SECURITY_LAN_NODES: ArpNode[] = [
  {
    id: "host-a",
    name: "Target Victim (Host A)",
    label: "Victim (Host A)",
    type: "host",
    ipAddress: "192.168.1.10",
    subnetMask: "255.255.255.0",
    macAddress: "00:1A:2B:3C:4D:01",
    defaultGateway: "192.168.1.1",
    position: { x: 100, y: 100 },
    arpCache: [
      { ipAddress: "192.168.1.1", macAddress: "00:00:5E:00:01:01", interfaceName: "eth0", type: "dynamic", state: "resolved", ageSeconds: 15, ttlSeconds: 300 }
    ],
    isSource: true,
  },
  {
    id: "sw-sec",
    name: "Managed Switch (DAI & DHCP Snooping)",
    label: "DAI Switch",
    type: "switch",
    ipAddress: "192.168.1.254",
    subnetMask: "255.255.255.0",
    macAddress: "00:CC:00:11:22:33",
    position: { x: 300, y: 190 },
    arpCache: [],
    macTable: { "Gi0/1": "00:1A:2B:3C:4D:01", "Gi0/2": "00:00:5E:00:01:01", "Gi0/3": "00:DE:AD:BE:EF:66" },
    daiEnabled: false,
  },
  {
    id: "router-gw",
    name: "Default Gateway Router",
    label: "Gateway (192.168.1.1)",
    type: "router",
    ipAddress: "192.168.1.1",
    subnetMask: "255.255.255.0",
    macAddress: "00:00:5E:00:01:01",
    position: { x: 500, y: 100 },
    arpCache: [],
  },
  {
    id: "host-attacker",
    name: "Attacker Node (ARP Spoofing)",
    label: "Attacker",
    type: "attacker",
    ipAddress: "192.168.1.66",
    subnetMask: "255.255.255.0",
    macAddress: "00:DE:AD:BE:EF:66",
    position: { x: 300, y: 320 },
    arpCache: [],
    isAttacker: true,
  },
];

export const SECURITY_LAN_LINKS: ArpLink[] = [
  { id: "link-vic-sw", sourceNodeId: "host-a", targetNodeId: "sw-sec", sourcePort: "eth0", targetPort: "Gi0/1", speedMbps: 1000, enabled: true },
  { id: "link-gw-sw", sourceNodeId: "router-gw", targetNodeId: "sw-sec", sourcePort: "Gi0/0", targetPort: "Gi0/2", speedMbps: 1000, enabled: true },
  { id: "link-atk-sw", sourceNodeId: "host-attacker", targetNodeId: "sw-sec", sourcePort: "eth0", targetPort: "Gi0/3", speedMbps: 1000, enabled: true },
];

export function getArpPresetData(preset: ArpTopologyPresetId): {
  nodes: ArpNode[];
  links: ArpLink[];
} {
  switch (preset) {
    case "cross_subnet_router":
      return {
        nodes: JSON.parse(JSON.stringify(CROSS_SUBNET_NODES)),
        links: JSON.parse(JSON.stringify(CROSS_SUBNET_LINKS)),
      };
    case "vrrp_failover":
      return {
        nodes: JSON.parse(JSON.stringify(VRRP_NODES)),
        links: JSON.parse(JSON.stringify(VRRP_LINKS)),
      };
    case "security_dai_lan":
      return {
        nodes: JSON.parse(JSON.stringify(SECURITY_LAN_NODES)),
        links: JSON.parse(JSON.stringify(SECURITY_LAN_LINKS)),
      };
    case "standard_lan":
    default:
      return {
        nodes: JSON.parse(JSON.stringify(STANDARD_LAN_NODES)),
        links: JSON.parse(JSON.stringify(STANDARD_LAN_LINKS)),
      };
  }
}

export interface ArpScenarioMeta {
  id: ArpScenarioId;
  name: string;
  badge: string;
  description: string;
  highlights: string[];
}

export interface ArpPresetMeta {
  id: ArpTopologyPresetId;
  name: string;
  description: string;
}

export const ARP_PRESETS: ArpPresetMeta[] = [
  {
    id: "standard_lan",
    name: "Standard LAN (Single Subnet)",
    description: "Workstations connected through a Layer 2 access switch (192.168.1.0/24).",
  },
  {
    id: "cross_subnet_router",
    name: "Cross-Subnet Gateway",
    description: "Two subnets bridged by a Default Gateway router.",
  },
  {
    id: "vrrp_failover",
    name: "VRRP / HA Failover",
    description: "Primary & Standby clustered servers sharing a Virtual IP via GARP.",
  },
  {
    id: "security_dai_lan",
    name: "Security & DAI LAN",
    description: "Access network with Attacker node and DAI-enabled switch.",
  },
];

export const ARP_SCENARIOS: ArpScenarioMeta[] = [
  {
    id: "standard_local_arp",
    name: "Cold Cache Local ARP Resolution",
    badge: "RFC 826 Standard",
    description:
      "Host A initiates ICMP communication with Host B on the same /24 subnet. Demonstrates ARP Cache Miss, Broadcast Request flooding, Target Unicast Reply, Switch MAC learning, and queued packet delivery.",
    highlights: [
      "ARP Cache lookup miss & frame queuing",
      "Broadcast ARP Request (Dest MAC: FF:FF:FF:FF:FF:FF)",
      "Switch CAM table source MAC learning on ingress",
      "Unicast ARP Reply & Cache table insertion",
    ],
  },
  {
    id: "gateway_cross_subnet",
    name: "Cross-Subnet Gateway Resolution",
    badge: "Routing & Subnets",
    description:
      "Host A sends packets to a remote IP (10.0.0.50). Evaluates subnet prefix mask logic: Host A resolves the Default Gateway MAC rather than the destination host, followed by router hop resolution.",
    highlights: [
      "ANDing IP & Subnet Mask to detect remote network",
      "ARP resolution targeted to Default Gateway IP",
      "Router Layer 2 decapsulation & re-encapsulation",
      "Second-hop ARP resolution on remote subnet",
    ],
  },
  {
    id: "gratuitous_arp_conflict",
    name: "Gratuitous ARP & Conflict Detection",
    badge: "RFC 5227 / Failover",
    description:
      "Host transmits an unsolicited broadcast ARP packet where Sender IP == Target IP. Demonstrates Duplicate IP Address Detection (DAD) and instant switch CAM table updating during High Availability / VRRP failover.",
    highlights: [
      "Unsolicited broadcast with SPA == TPA",
      "Duplicate IP Address detection & error alert",
      "Instant Switch MAC table updating",
      "VRRP / HSRP virtual router VIP failover",
    ],
  },
  {
    id: "proxy_arp_wan",
    name: "Proxy ARP Edge Response",
    badge: "RFC 1027",
    description:
      "A misconfigured host with a flat /16 subnet mask broadcasts ARP for a remote IP. The border router intercepts the request and responds with its own MAC address to transparently bridge communication.",
    highlights: [
      "Host broadcasts for out-of-segment IP",
      "Router evaluates routing table and answers on behalf",
      "Router provides its own interface MAC address",
      "Seamless transparent bridging without host reconfiguration",
    ],
  },
  {
    id: "arp_spoofing_dai",
    name: "ARP Spoofing & Dynamic ARP Inspection (DAI)",
    badge: "Layer 2 Security",
    description:
      "A rogue attacker broadcasts forged ARP replies claiming to own the Gateway IP (Man-in-the-Middle). Demonstrates how enterprise switch Dynamic ARP Inspection (DAI) and DHCP Snooping drop illegitimate frames.",
    highlights: [
      "Attacker transmits unsolicited fake ARP replies",
      "Victim ARP cache poisoning (MITM attack)",
      "Dynamic ARP Inspection (DAI) table verification",
      "Switch drops unauthorized frames and logs security alert",
    ],
  },
];

import type { TopologyDefinition } from "@/features/simulation/simulation-types";
import type { DhcpNode, DhcpLink, DhcpPool, DhcpConfig } from "./dhcp.types";

// ========================================================
// 1. SIMPLE LAN TOPOLOGY (Single Subnet - 192.168.1.0/24)
// ========================================================
export const SIMPLE_LAN_NODES: DhcpNode[] = [
  {
    id: "client-1",
    name: "Client PC-1",
    type: "client",
    macAddress: "00:1A:2B:3C:4D:5E",
    role: "client",
    position: { x: 100, y: 280 },
    enabled: true,
  },
  {
    id: "switch-1",
    name: "Access Switch SW-1",
    type: "switch",
    macAddress: "00:50:56:A1:00:01",
    position: { x: 280, y: 280 },
    enabled: true,
  },
  {
    id: "server-1",
    name: "DHCP Server",
    type: "server",
    macAddress: "00:50:56:B2:00:10",
    ipAddress: "192.168.1.2",
    subnetMask: "255.255.255.0",
    role: "primary-server",
    position: { x: 460, y: 160 },
    enabled: true,
  },
  {
    id: "gateway-1",
    name: "Default Gateway",
    type: "gateway",
    macAddress: "00:50:56:C3:00:01",
    ipAddress: "192.168.1.1",
    subnetMask: "255.255.255.0",
    position: { x: 460, y: 400 },
    enabled: true,
  },
];

export const SIMPLE_LAN_LINKS: DhcpLink[] = [
  { id: "link-client-switch", sourceNodeId: "client-1", targetNodeId: "switch-1", enabled: true, status: "up" },
  { id: "link-switch-server", sourceNodeId: "switch-1", targetNodeId: "server-1", enabled: true, status: "up" },
  { id: "link-switch-gateway", sourceNodeId: "switch-1", targetNodeId: "gateway-1", enabled: true, status: "up" },
];

export const SIMPLE_LAN_POOL: DhcpPool = {
  id: "pool-lan",
  name: "LAN-Scope-192.168.1.0",
  network: "192.168.1.0",
  subnetMask: "255.255.255.0",
  prefixLength: 24,
  startAddress: "192.168.1.100",
  endAddress: "192.168.1.200",
  gateway: "192.168.1.1",
  dnsServers: ["1.1.1.1", "8.8.8.8"],
  domainName: "corp.local",
  leaseDurationSeconds: 86400, // 24 hours
  t1Seconds: 43200, // 12 hours (50%)
  t2Seconds: 75600, // 21 hours (87.5%)
};

// ========================================================
// 2. DUAL-SERVER REDUNDANCY (Split-Scope)
// ========================================================
export const DUAL_SERVER_NODES: DhcpNode[] = [
  { id: "client-1", name: "Client PC-1", type: "client", macAddress: "00:1A:2B:3C:4D:5E", role: "client", position: { x: 100, y: 280 }, enabled: true },
  { id: "switch-1", name: "Core Switch SW-1", type: "switch", macAddress: "00:50:56:A1:00:01", position: { x: 280, y: 280 }, enabled: true },
  { id: "server-1", name: "Primary DHCP (Server A)", type: "server", macAddress: "00:50:56:B2:00:10", ipAddress: "192.168.1.2", subnetMask: "255.255.255.0", role: "primary-server", position: { x: 460, y: 150 }, enabled: true },
  { id: "server-2", name: "Secondary DHCP (Server B)", type: "server", macAddress: "00:50:56:B2:00:20", ipAddress: "192.168.1.3", subnetMask: "255.255.255.0", role: "secondary-server", position: { x: 460, y: 410 }, enabled: true },
];

export const DUAL_SERVER_LINKS: DhcpLink[] = [
  { id: "link-client-switch", sourceNodeId: "client-1", targetNodeId: "switch-1", enabled: true, status: "up" },
  { id: "link-switch-server1", sourceNodeId: "switch-1", targetNodeId: "server-1", enabled: true, status: "up" },
  { id: "link-switch-server2", sourceNodeId: "switch-1", targetNodeId: "server-2", enabled: true, status: "up" },
];

// ========================================================
// 3. DHCP RELAY AGENT (Cross-Subnet IP Helper)
// ========================================================
export const RELAY_AGENT_NODES: DhcpNode[] = [
  { id: "client-1", name: "Client PC-1 (Subnet 1)", type: "client", macAddress: "00:1A:2B:3C:4D:5E", role: "client", position: { x: 80, y: 280 }, enabled: true },
  { id: "switch-1", name: "Access Switch", type: "switch", macAddress: "00:50:56:A1:00:01", position: { x: 200, y: 280 }, enabled: true },
  { id: "relay-1", name: "Relay Router (IP Helper)", type: "relay", macAddress: "00:50:56:C3:00:01", ipAddress: "192.168.1.1", subnetMask: "255.255.255.0", role: "relay", position: { x: 330, y: 280 }, enabled: true },
  { id: "server-1", name: "Central DHCP Server", type: "server", macAddress: "00:50:56:B2:00:10", ipAddress: "10.0.0.10", subnetMask: "255.255.255.0", role: "primary-server", position: { x: 480, y: 280 }, enabled: true },
];

export const RELAY_AGENT_LINKS: DhcpLink[] = [
  { id: "link-client-switch", sourceNodeId: "client-1", targetNodeId: "switch-1", enabled: true, status: "up" },
  { id: "link-switch-relay", sourceNodeId: "switch-1", targetNodeId: "relay-1", enabled: true, status: "up" },
  { id: "link-relay-server", sourceNodeId: "relay-1", targetNodeId: "server-1", enabled: true, status: "up" },
];

// ========================================================
// 4. EXHAUSTION & ROGUE SERVER (Security Context)
// ========================================================
export const EXHAUSTION_ROGUE_NODES: DhcpNode[] = [
  { id: "client-1", name: "Victim PC-1", type: "client", macAddress: "00:1A:2B:3C:4D:5E", role: "client", position: { x: 100, y: 200 }, enabled: true },
  { id: "client-2", name: "Client PC-2", type: "client", macAddress: "00:1A:2B:3C:4D:99", role: "client", position: { x: 100, y: 360 }, enabled: true },
  { id: "switch-1", name: "Switch SW-1", type: "switch", macAddress: "00:50:56:A1:00:01", position: { x: 280, y: 280 }, enabled: true },
  { id: "server-1", name: "Legitimate DHCP", type: "server", macAddress: "00:50:56:B2:00:10", ipAddress: "192.168.1.2", subnetMask: "255.255.255.0", role: "primary-server", position: { x: 460, y: 160 }, enabled: true },
  { id: "rogue-1", name: "Rogue DHCP Server", type: "server", macAddress: "00:66:66:66:66:66", ipAddress: "192.168.1.66", subnetMask: "255.255.255.0", role: "rogue-server", position: { x: 460, y: 400 }, enabled: true },
];

export const EXHAUSTION_ROGUE_LINKS: DhcpLink[] = [
  { id: "link-c1-switch", sourceNodeId: "client-1", targetNodeId: "switch-1", enabled: true, status: "up" },
  { id: "link-c2-switch", sourceNodeId: "client-2", targetNodeId: "switch-1", enabled: true, status: "up" },
  { id: "link-switch-legit", sourceNodeId: "switch-1", targetNodeId: "server-1", enabled: true, status: "up" },
  { id: "link-switch-rogue", sourceNodeId: "switch-1", targetNodeId: "rogue-1", enabled: true, status: "up" },
];

export const defaultDhcpConfig: DhcpConfig = {
  topologyPreset: "simple-lan",
  clientMac: "00:1A:2B:3C:4D:5E",
  clientHostname: "workstation-01",
  leaseDurationSeconds: 86400,
  poolStart: "192.168.1.100",
  poolEnd: "192.168.1.200",
  labelMode: "simple",
  failureScenario: "none",
};

export function getDhcpPresetData(preset: string = "simple-lan"): {
  nodes: DhcpNode[];
  links: DhcpLink[];
  pool: DhcpPool;
  topology: TopologyDefinition;
} {
  switch (preset) {
    case "dual-server":
      return {
        nodes: JSON.parse(JSON.stringify(DUAL_SERVER_NODES)),
        links: JSON.parse(JSON.stringify(DUAL_SERVER_LINKS)),
        pool: JSON.parse(JSON.stringify(SIMPLE_LAN_POOL)),
        topology: {
          nodes: DUAL_SERVER_NODES.map((n) => ({
            id: n.id,
            type: n.type === "server" ? "server" : n.type === "switch" ? "switch" : n.type === "relay" ? "router" : "host",
            label: n.name,
            position: n.position,
          })),
          edges: DUAL_SERVER_LINKS.map((l) => ({ id: l.id, source: l.sourceNodeId, target: l.targetNodeId })),
        },
      };
    case "relay-agent":
      return {
        nodes: JSON.parse(JSON.stringify(RELAY_AGENT_NODES)),
        links: JSON.parse(JSON.stringify(RELAY_AGENT_LINKS)),
        pool: {
          ...SIMPLE_LAN_POOL,
          gateway: "192.168.1.1",
        },
        topology: {
          nodes: RELAY_AGENT_NODES.map((n) => ({
            id: n.id,
            type: n.type === "server" ? "server" : n.type === "switch" ? "switch" : n.type === "relay" ? "router" : "host",
            label: n.name,
            position: n.position,
          })),
          edges: RELAY_AGENT_LINKS.map((l) => ({ id: l.id, source: l.sourceNodeId, target: l.targetNodeId })),
        },
      };
    case "exhaustion-rogue":
      return {
        nodes: JSON.parse(JSON.stringify(EXHAUSTION_ROGUE_NODES)),
        links: JSON.parse(JSON.stringify(EXHAUSTION_ROGUE_LINKS)),
        pool: JSON.parse(JSON.stringify(SIMPLE_LAN_POOL)),
        topology: {
          nodes: EXHAUSTION_ROGUE_NODES.map((n) => ({
            id: n.id,
            type: n.type === "server" ? "server" : n.type === "switch" ? "switch" : n.type === "relay" ? "router" : "host",
            label: n.name,
            position: n.position,
          })),
          edges: EXHAUSTION_ROGUE_LINKS.map((l) => ({ id: l.id, source: l.sourceNodeId, target: l.targetNodeId })),
        },
      };
    case "simple-lan":
    default:
      return {
        nodes: JSON.parse(JSON.stringify(SIMPLE_LAN_NODES)),
        links: JSON.parse(JSON.stringify(SIMPLE_LAN_LINKS)),
        pool: JSON.parse(JSON.stringify(SIMPLE_LAN_POOL)),
        topology: {
          nodes: SIMPLE_LAN_NODES.map((n) => ({
            id: n.id,
            type: n.type === "server" ? "server" : n.type === "switch" ? "switch" : n.type === "relay" ? "router" : "host",
            label: n.name,
            position: n.position,
          })),
          edges: SIMPLE_LAN_LINKS.map((l) => ({ id: l.id, source: l.sourceNodeId, target: l.targetNodeId })),
        },
      };
  }
}

import type {
  NatConfig,
  NatNode,
  NatLink,
  NatTranslationEntry,
  NatScenarioId,
} from "./nat.types";

export const defaultNatConfig: NatConfig = {
  mode: "pat",
  publicIp: "203.0.113.1",
  privateSubnet: "192.168.1.0/24",
  publicPoolStart: "203.0.113.10",
  publicPoolEnd: "203.0.113.15",
  timeoutSeconds: 300,
  portForwardingRules: [
    { publicPort: 8080, privateIp: "192.168.1.100", privatePort: 80, protocol: "TCP" },
  ],
};

export const defaultNatNodes: NatNode[] = [
  {
    id: "pc-1",
    name: "Workstation A",
    type: "inside-host",
    ipAddress: "192.168.1.10",
    subnetMask: "255.255.255.0",
    macAddress: "AA:BB:CC:11:22:33",
    position: { x: 80, y: 140 },
    zone: "inside",
    roleDescription: "Private LAN client initiating outbound HTTPS request to public web server.",
  },
  {
    id: "pc-2",
    name: "Workstation B",
    type: "inside-host",
    ipAddress: "192.168.1.20",
    subnetMask: "255.255.255.0",
    macAddress: "AA:BB:CC:44:55:66",
    position: { x: 80, y: 320 },
    zone: "inside",
    roleDescription: "Private LAN client sending DNS query to Google public resolver 8.8.8.8.",
  },
  {
    id: "nat-router",
    name: "NAT Gateway Router",
    type: "nat-router",
    ipAddress: "192.168.1.1",
    subnetMask: "255.255.255.0",
    macAddress: "00:11:22:33:44:55",
    position: { x: 280, y: 230 },
    zone: "inside",
    roleDescription: "Edge router performing NAPT/PAT header translation and stateful table lookup.",
  },
  {
    id: "isp-router",
    name: "ISP Aggregation Edge",
    type: "isp-router",
    ipAddress: "203.0.113.254",
    subnetMask: "255.255.255.0",
    macAddress: "00:77:88:99:AA:BB",
    position: { x: 420, y: 140 },
    zone: "outside",
    roleDescription: "Carrier Internet router routing public IPv4 addresses across global backbones.",
  },
  {
    id: "web-server",
    name: "Web Server (example.com)",
    type: "outside-server",
    ipAddress: "93.184.216.34",
    subnetMask: "255.255.255.0",
    macAddress: "00:DD:EE:FF:00:11",
    position: { x: 500, y: 280 },
    zone: "outside",
    roleDescription: "Public HTTPS web server responding to WAN requests on Port 443.",
  },
];

export const defaultNatLinks: NatLink[] = [
  { id: "link-pc1-nat", sourceNodeId: "pc-1", targetNodeId: "nat-router", label: "GigabitEthernet0/1 (Inside LAN)", zone: "inside" },
  { id: "link-pc2-nat", sourceNodeId: "pc-2", targetNodeId: "nat-router", label: "GigabitEthernet0/2 (Inside LAN)", zone: "inside" },
  { id: "link-nat-isp", sourceNodeId: "nat-router", targetNodeId: "isp-router", label: "WAN Serial0/0 (Public IP 203.0.113.1)", zone: "outside" },
  { id: "link-isp-web", sourceNodeId: "isp-router", targetNodeId: "web-server", label: "Fiber Backbone", zone: "outside" },
];

export const defaultTranslationTable: NatTranslationEntry[] = [
  {
    id: "nat-entry-1",
    protocol: "TCP",
    insideLocalIp: "192.168.1.10",
    insideLocalPort: 54321,
    insideGlobalIp: "203.0.113.1",
    insideGlobalPort: 40001,
    outsideGlobalIp: "93.184.216.34",
    outsideGlobalPort: 443,
    state: "ACTIVE",
    ttlSeconds: 295,
    packetsTranslated: 14,
    bytesTranslated: 18400,
    createdAt: Date.now() - 5000,
  },
  {
    id: "nat-entry-2",
    protocol: "UDP",
    insideLocalIp: "192.168.1.20",
    insideLocalPort: 61050,
    insideGlobalIp: "203.0.113.1",
    insideGlobalPort: 40002,
    outsideGlobalIp: "8.8.8.8",
    outsideGlobalPort: 53,
    state: "ACTIVE",
    ttlSeconds: 28,
    packetsTranslated: 2,
    bytesTranslated: 168,
    createdAt: Date.now() - 2000,
  },
];

export const natScenarios: {
  id: NatScenarioId;
  name: string;
  badge: string;
  description: string;
  config: Partial<NatConfig>;
}[] = [
  {
    id: "pat_web_browse",
    name: "PAT / NAPT Overload (Port Multiplexing)",
    badge: "RFC 3022 (Standard)",
    description: "Multiple LAN clients share 1 public IP (203.0.113.1) by mapping unique TCP/UDP source ports.",
    config: { mode: "pat", publicIp: "203.0.113.1" },
  },
  {
    id: "static_server_dnat",
    name: "Port Forwarding / DNAT (Public Web Server)",
    badge: "Inbound DNAT",
    description: "Maps inbound WAN request on Port 8080 to internal private web server 192.168.1.100:80.",
    config: {
      mode: "dnat",
      portForwardingRules: [{ publicPort: 8080, privateIp: "192.168.1.100", privatePort: 80, protocol: "TCP" }],
    },
  },
  {
    id: "dynamic_ip_pool",
    name: "Dynamic NAT (Public IP Pool)",
    badge: "1-to-1 Dynamic",
    description: "Assigns public IPs from a pool (203.0.113.10 – 203.0.113.15) to active internal LAN hosts.",
    config: { mode: "dynamic", publicPoolStart: "203.0.113.10", publicPoolEnd: "203.0.113.15" },
  },
  {
    id: "port_exhaustion",
    name: "PAT Port Exhaustion Simulation",
    badge: "Stress Test",
    description: "Simulates exhaustion of ephemeral port range (65,535 entries) causing outbound packet drop.",
    config: { mode: "pat" },
  },
  {
    id: "cgnat_double_nat",
    name: "Carrier-Grade NAT (CGNAT / NAT444)",
    badge: "RFC 6598 (100.64.0.0/10)",
    description: "Double NAT translation through ISP CGNAT router before reaching the IPv4 public internet.",
    config: { mode: "cgnat" },
  },
];

export type DeviceCategory = "end-device" | "network-device" | "server" | "cloud-wan" | "special";

export type NetworkNodeType =
  | "pc"
  | "laptop"
  | "mobile"
  | "host"
  | "printer"
  | "l2-switch"
  | "l3-switch"
  | "router"
  | "access-point"
  | "firewall"
  | "load-balancer"
  | "server"
  | "web-server"
  | "dns-server"
  | "dhcp-server"
  | "ftp-server"
  | "mail-server"
  | "ntp-server"
  | "cloud"
  | "wan-cloud"
  | "isp-router"
  | "autonomous-system"
  | "packet-source"
  | "packet-destination"
  | "network-observer"
  | "traffic-generator";

export type DeviceStatus =
  | "online"
  | "offline"
  | "initializing"
  | "converging"
  | "warning"
  | "error"
  | "selected"
  | "packet-active";

export type InterfaceType = "ethernet" | "fast-ethernet" | "gigabit" | "serial" | "wireless" | "vlan" | "loopback";

export interface NetworkInterface {
  id: string;
  deviceId: string;
  name: string;
  type: InterfaceType;
  macAddress: string;
  ipv4?: {
    address: string;
    prefixLength: number;
  };
  ipv6?: {
    address: string;
    prefixLength: number;
  };
  vlanId?: number;
  ospfCost?: number;
  mtu: number;
  administrativeState: "up" | "down";
  operationalState: "up" | "down";
  connectedLinkId?: string;
}

export type LinkType = "ethernet" | "fiber" | "serial" | "wireless" | "tunnel" | "bgp-peering" | "virtual";

export interface NetworkLink {
  id: string;
  sourceNodeId: string;
  sourceInterfaceId: string;
  targetNodeId: string;
  targetInterfaceId: string;
  type: LinkType;
  bandwidthMbps: number;
  latencyMs: number;
  mtu: number;
  packetLossPercentage: number;
  cost: number;
  administrativeState: "up" | "down";
  operationalState: "up" | "down";
  duplex?: "full" | "half";
  label?: string;
}

export interface StaticRoute {
  id: string;
  destinationPrefix: string;
  prefixLength: number;
  nextHop: string;
  exitInterfaceId?: string;
  metric: number;
  administrativeDistance: number;
  description?: string;
  enabled: boolean;
}

export interface RoutingTableEntry {
  id: string;
  source: "connected" | "local" | "static" | "rip" | "ospf" | "bgp";
  destinationPrefix: string;
  prefixLength: number;
  nextHop: string;
  exitInterfaceName: string;
  metric: number;
  administrativeDistance: number;
  active: boolean;
}

export interface OspfConfig {
  enabled: boolean;
  routerId: string;
  processId: number;
  areaId: string;
  helloInterval: number;
  deadInterval: number;
  passiveInterfaces: string[];
}

export interface OspfNeighbor {
  neighborId: string;
  neighborIp: string;
  interfaceName: string;
  state: "Down" | "Init" | "2-Way" | "ExStart" | "Exchange" | "Loading" | "Full";
  drPriority: number;
  role: "DR" | "BDR" | "DROther";
}

export interface BgpPeerConfig {
  id: string;
  neighborIp: string;
  remoteAsn: number;
  enabled: boolean;
  localPreference?: number;
  med?: number;
  asPathPrepend?: number;
  state: "Idle" | "Connect" | "Active" | "OpenSent" | "OpenConfirm" | "Established";
}

export interface BgpConfig {
  enabled: boolean;
  asn: number;
  routerId: string;
  peers: BgpPeerConfig[];
  advertisedPrefixes: string[];
}

export interface BgpRouteEntry {
  network: string;
  prefixLength: number;
  nextHop: string;
  metric: number;
  localPref: number;
  weight: number;
  asPath: number[];
  best: boolean;
  rejectionReason?: string;
}

export interface DhcpPoolConfig {
  id: string;
  name: string;
  network: string;
  prefixLength: number;
  startAddress: string;
  endAddress: string;
  gateway: string;
  dnsServer: string;
  leaseDurationSeconds: number;
  excludedAddresses: string[];
}

export interface DhcpLease {
  macAddress: string;
  ipAddress: string;
  clientHostname?: string;
  leaseStarts: number;
  leaseExpires: number;
  state: "active" | "expired" | "reserved";
}

export interface DhcpConfig {
  enabled: boolean;
  pools: DhcpPoolConfig[];
  leases: DhcpLease[];
}

export interface DnsRecord {
  id: string;
  hostname: string;
  type: "A" | "AAAA" | "CNAME" | "MX";
  value: string;
  ttl: number;
}

export interface DnsConfig {
  enabled: boolean;
  domainName?: string;
  records: DnsRecord[];
}

export interface HttpServerConfig {
  enabled: boolean;
  port: number;
  useHttps: boolean;
  responseStatus: number;
  responseBody: string;
}

export interface FirewallRule {
  id: string;
  order: number;
  sourceNetwork: string;
  destinationNetwork: string;
  protocol: "any" | "tcp" | "udp" | "icmp";
  sourcePort: string;
  destinationPort: string;
  action: "allow" | "deny" | "reject";
  loggingEnabled: boolean;
  description: string;
}

export interface FirewallConfig {
  enabled: boolean;
  rules: FirewallRule[];
  sessionTable: Array<{
    protocol: string;
    srcIp: string;
    srcPort: number;
    dstIp: string;
    dstPort: number;
    state: string;
  }>;
}

export interface DeviceConfiguration {
  hostname: string;
  addressMode?: "static" | "dhcp";
  defaultGateway?: string;
  dnsServer?: string;
  locationLabel?: string;
  administrativeState: "up" | "down";
}

export interface ProtocolConfiguration {
  staticRoutes: StaticRoute[];
  ospf?: OspfConfig;
  bgp?: BgpConfig;
  dhcp?: DhcpConfig;
  dns?: DnsConfig;
  http?: HttpServerConfig;
  firewall?: FirewallConfig;
}

export interface ArpEntry {
  ipAddress: string;
  macAddress: string;
  interfaceName: string;
  type: "dynamic" | "static";
  ageSeconds: number;
}

export interface MacTableEntry {
  macAddress: string;
  vlanId: number;
  portName: string;
  type: "dynamic" | "static";
  remainingAgeSeconds: number;
}

export interface NetworkNodeData {
  nodeId: string;
  name: string;
  type: NetworkNodeType;
  category: DeviceCategory;
  status: DeviceStatus;
  interfaces: NetworkInterface[];
  configuration: DeviceConfiguration;
  protocolConfiguration: ProtocolConfiguration;
  arpTable: ArpEntry[];
  macTable: MacTableEntry[];
  routingTable: RoutingTableEntry[];
  ospfNeighbors: OspfNeighbor[];
  bgpRoutes: BgpRouteEntry[];
  dhcpLeases: DhcpLease[];
  asn?: number;
  asName?: string;
  advertisedPrefixes?: string[];
  isLocked?: boolean;
  [key: string]: unknown;
}

export interface NetworkNode {
  id: string;
  name: string;
  type: NetworkNodeType;
  position: { x: number; y: number };
  status: DeviceStatus;
  interfaces: NetworkInterface[];
  configuration: DeviceConfiguration;
  protocolConfiguration: ProtocolConfiguration;
  arpTable?: ArpEntry[];
  macTable?: MacTableEntry[];
  routingTable?: RoutingTableEntry[];
  ospfNeighbors?: OspfNeighbor[];
  bgpRoutes?: BgpRouteEntry[];
  dhcpLeases?: DhcpLease[];
  asn?: number;
  asName?: string;
  advertisedPrefixes?: string[];
  metadata?: Record<string, unknown>;
}

export interface TopologyGroup {
  id: string;
  name: string;
  color: string;
  nodeIds: string[];
}

export interface LabelVisibilitySettings {
  showInterfaceNames: boolean;
  showIpAddresses: boolean;
  showLinkCost: boolean;
  showBandwidth: boolean;
  showLatency: boolean;
  showPacketLabels: boolean;
}

export interface TopologySettings {
  gridSnap: boolean;
  autoSave: boolean;
  labelVisibility: LabelVisibilitySettings;
}

export interface NetworkTopology {
  id: string;
  name: string;
  description?: string;
  version: number;
  nodes: NetworkNode[];
  links: NetworkLink[];
  groups: TopologyGroup[];
  settings: TopologySettings;
  createdAt: string;
  updatedAt: string;
}

export type IssueSeverity = "information" | "warning" | "error" | "critical";

export interface TopologyValidationIssue {
  id: string;
  severity: IssueSeverity;
  category: "addressing" | "interfaces-links" | "routing" | "services" | "general";
  nodeId?: string;
  interfaceId?: string;
  linkId?: string;
  title: string;
  description: string;
  suggestedFix?: string;
  canAutoFix: boolean;
}

export type EventCategory =
  | "configuration"
  | "interface"
  | "ARP"
  | "switching"
  | "routing"
  | "transport"
  | "application"
  | "security"
  | "error"
  | "system";

export type PacketProtocol = "ICMP" | "ARP" | "TCP" | "UDP" | "DNS" | "HTTP" | "HTTPS" | "OSPF" | "BGP" | "DHCP";

export type PacketStatus =
  | "queued"
  | "transmitting"
  | "forwarded"
  | "delivered"
  | "dropped"
  | "expired"
  | "retransmitted"
  | "blocked";

export interface PacketHeader {
  sourceMac: string;
  destinationMac: string;
  vlanId?: number;
  sourceIp: string;
  destinationIp: string;
  ttl: number;
  protocol: PacketProtocol;
  sourcePort?: number;
  destinationPort?: number;
  payloadSummary?: string;
}

export interface NetworkPacket {
  id: string;
  packetNumber: number;
  protocol: PacketProtocol;
  sourceNodeId: string;
  destinationNodeId: string;
  sourceIp: string;
  destinationIp: string;
  currentHopNodeId: string;
  nextHopNodeId?: string;
  activeLinkId?: string;
  ttl: number;
  status: PacketStatus;
  headers: PacketHeader;
  payload?: Record<string, unknown>;
  progressPercent: number;
}

export interface SimulationEvent {
  id: string;
  stepNumber: number;
  timestamp: string;
  category: EventCategory;
  protocol: PacketProtocol;
  sourceDeviceId: string;
  destinationDeviceId?: string;
  sourceInterfaceName?: string;
  destinationInterfaceName?: string;
  summary: string;
  explanation: string;
  status: PacketStatus | "info" | "warning" | "error";
  relatedPacketId?: string;
  affectedLinkId?: string;
  tableChanges?: {
    nodeId: string;
    tableName: "arp" | "mac" | "routing" | "ospf" | "bgp" | "dhcp";
    action: "added" | "modified" | "removed";
    entry: Record<string, unknown>;
  }[];
}

export interface SimulationScenario {
  id: string;
  name: string;
  trafficType: "ping" | "traceroute" | "tcp" | "udp" | "dns" | "http" | "custom";
  sourceNodeId: string;
  destinationNodeId: string;
  protocol: PacketProtocol;
  sourcePort?: number;
  destinationPort?: number;
  payloadSize?: number;
  packetCount?: number;
  ttl?: number;
  intervalMs?: number;
}

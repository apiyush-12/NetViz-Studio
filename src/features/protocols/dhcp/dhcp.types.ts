export type DhcpClientState =
  | "INIT"
  | "SELECTING"
  | "REQUESTING"
  | "BOUND"
  | "RENEWING"
  | "REBINDING"
  | "RELEASE"
  | "DECLINE";

export type DhcpMessageType =
  | "DHCPDISCOVER"
  | "DHCPOFFER"
  | "DHCPREQUEST"
  | "DHCPDECLINE"
  | "DHCPACK"
  | "DHCPNAK"
  | "DHCPRELEASE"
  | "DHCPINFORM";

export interface DhcpOption {
  code: number;
  name: string;
  value: string | number | string[];
  rawHex?: string;
}

export interface DhcpPool {
  id: string;
  name: string;
  network: string;
  subnetMask: string;
  prefixLength: number;
  startAddress: string;
  endAddress: string;
  gateway: string;
  dnsServers: string[];
  domainName: string;
  leaseDurationSeconds: number;
  t1Seconds: number; // 50% of lease
  t2Seconds: number; // 87.5% of lease
}

export interface DhcpLease {
  ipAddress: string;
  macAddress: string;
  hostname: string;
  leaseStarts: number;
  leaseExpires: number;
  serverId: string;
  serverIp: string;
  state: "active" | "offered" | "expired" | "declined";
}

export interface DhcpReservation {
  macAddress: string;
  reservedIp: string;
  hostname: string;
  description?: string;
}

export interface DhcpNode {
  id: string;
  name: string;
  type: "client" | "server" | "relay" | "switch" | "gateway";
  macAddress: string;
  ipAddress?: string;
  subnetMask?: string;
  gateway?: string;
  dnsServers?: string[];
  role?: "primary-server" | "secondary-server" | "rogue-server" | "client" | "relay";
  position: { x: number; y: number };
  enabled: boolean;
}

export interface DhcpLink {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  enabled: boolean;
  status: "up" | "down";
}

export interface DhcpPacketPayload {
  messageType: DhcpMessageType;
  xid: number; // Transaction ID
  secs: number; // Seconds elapsed
  flags: { broadcast: boolean };
  ciaddr: string; // Client IP (if renewing)
  yiaddr: string; // Your (client) IP offered by server
  siaddr: string; // Next server IP
  giaddr: string; // Relay agent IP
  chaddr: string; // Client hardware address (MAC)
  sname?: string; // Server hostname
  file?: string; // Boot file name
  options: DhcpOption[];
}

export interface DhcpConfig {
  [key: string]: unknown;
  topologyPreset?: "simple-lan" | "dual-server" | "relay-agent" | "exhaustion-rogue";
  clientMac?: string;
  clientHostname?: string;
  requestedIp?: string;
  leaseDurationSeconds?: number;
  poolStart?: string;
  poolEnd?: string;
  labelMode?: "simple" | "technical";
  failureScenario?:
    | "none"
    | "pool_exhausted"
    | "ip_conflict_decline"
    | "rogue_server"
    | "dhcp_nak"
    | "lease_renewal_t1"
    | "server_down_rebind";
}

import {
  NetworkNode,
  NetworkLink,
  NetworkInterface,
  NetworkNodeType,
  LinkType,
  DeviceStatus,
  ProtocolConfiguration,
  DeviceConfiguration,
} from "@/features/topology/topology-types";
import { DEVICE_CATALOG } from "@/data/device-catalog";

let macCounter = 1;
export function generateMacAddress(): string {
  const hex = macCounter.toString(16).padStart(4, "0");
  macCounter++;
  return `02:00:00:00:${hex.slice(0, 2)}:${hex.slice(2, 4)}`;
}

const nodeCounter: Record<string, number> = {};

export function createDefaultNode(
  type: NetworkNodeType,
  position: { x: number; y: number },
  customId?: string,
  customName?: string
): NetworkNode {
  const catalogItem = DEVICE_CATALOG.find((item) => item.type === type) || DEVICE_CATALOG[0];

  nodeCounter[type] = (nodeCounter[type] || 0) + 1;
  const id = customId || `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const name = customName || `${catalogItem.name} ${nodeCounter[type]}`;

  const interfaces: NetworkInterface[] = catalogItem.defaultInterfaces.map((iface, index) => ({
    id: `${id}-iface-${index}`,
    deviceId: id,
    name: iface.name,
    type: iface.type,
    macAddress: generateMacAddress(),
    mtu: iface.mtu || 1500,
    administrativeState: "up",
    operationalState: "up",
  }));

  const configuration: DeviceConfiguration = {
    hostname: name,
    administrativeState: "up",
    addressMode: type === "pc" || type === "laptop" ? "dhcp" : "static",
  };

  const protocolConfiguration: ProtocolConfiguration = {
    staticRoutes: [],
  };

  if (type === "router" || type === "l3-switch" || type === "isp-router") {
    protocolConfiguration.ospf = {
      enabled: false,
      routerId: "1.1.1.1",
      processId: 1,
      areaId: "0.0.0.0",
      helloInterval: 10,
      deadInterval: 40,
      passiveInterfaces: [],
    };
    protocolConfiguration.bgp = {
      enabled: false,
      asn: 65001,
      routerId: "1.1.1.1",
      peers: [],
      advertisedPrefixes: [],
    };
  }

  if (type === "dhcp-server" || catalogItem.defaultServices?.dhcp) {
    protocolConfiguration.dhcp = {
      enabled: true,
      pools: [
        {
          id: `pool-1`,
          name: "LAN-POOL-1",
          network: "192.168.1.0",
          prefixLength: 24,
          startAddress: "192.168.1.10",
          endAddress: "192.168.1.100",
          gateway: "192.168.1.1",
          dnsServer: "8.8.8.8",
          leaseDurationSeconds: 86400,
          excludedAddresses: ["192.168.1.1"],
        },
      ],
      leases: [],
    };
  }

  if (type === "dns-server" || catalogItem.defaultServices?.dns) {
    protocolConfiguration.dns = {
      enabled: true,
      records: [
        { id: "rec-1", hostname: "example.com", type: "A", value: "192.168.1.50", ttl: 300 },
        { id: "rec-2", hostname: "web.lab", type: "A", value: "192.168.1.50", ttl: 300 },
      ],
    };
  }

  if (type === "web-server" || catalogItem.defaultServices?.http) {
    protocolConfiguration.http = {
      enabled: true,
      port: 80,
      useHttps: false,
      responseStatus: 200,
      responseBody: "<html><body><h1>Welcome to Network Lab Web Server</h1></body></html>",
    };
  }

  if (type === "firewall") {
    protocolConfiguration.firewall = {
      enabled: true,
      rules: [
        {
          id: "fw-1",
          order: 1,
          sourceNetwork: "any",
          destinationNetwork: "any",
          protocol: "any",
          sourcePort: "any",
          destinationPort: "any",
          action: "allow",
          loggingEnabled: true,
          description: "Default allow all",
        },
      ],
      sessionTable: [],
    };
  }

  return {
    id,
    name,
    type,
    position,
    status: "online" as DeviceStatus,
    interfaces,
    configuration,
    protocolConfiguration,
  };
}

export function createDefaultLink(
  sourceNodeId: string,
  sourceInterfaceId: string,
  targetNodeId: string,
  targetInterfaceId: string,
  type: LinkType = "ethernet"
): NetworkLink {
  const isWan = type === "serial" || type === "tunnel" || type === "bgp-peering";

  return {
    id: `link-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    sourceNodeId,
    sourceInterfaceId,
    targetNodeId,
    targetInterfaceId,
    type,
    bandwidthMbps: isWan ? 100 : 1000,
    latencyMs: isWan ? 30 : 1,
    mtu: 1500,
    packetLossPercentage: 0,
    cost: isWan ? 10 : 1,
    administrativeState: "up",
    operationalState: "up",
    duplex: "full",
  };
}

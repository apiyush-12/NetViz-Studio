import { NetworkTopology } from "@/features/topology/topology-types";
import { createDefaultNode, createDefaultLink } from "@/features/topology/topology-defaults";

export interface SampleTopologyMeta {
  id: string;
  name: string;
  description: string;
  learningObjective: string;
  suggestedSimulation: string;
  expectedResult: string;
  getTopology: () => NetworkTopology;
}

// 1. Two-Host LAN
function buildTwoHostLan(): NetworkTopology {
  const pc1 = createDefaultNode("pc", { x: 150, y: 200 }, "pc-1", "PC-A");
  const pc2 = createDefaultNode("pc", { x: 550, y: 200 }, "pc-2", "PC-B");
  const switch1 = createDefaultNode("l2-switch", { x: 350, y: 200 }, "sw-1", "Switch-1");

  pc1.interfaces[0].ipv4 = { address: "192.168.1.10", prefixLength: 24 };
  pc2.interfaces[0].ipv4 = { address: "192.168.1.20", prefixLength: 24 };

  const link1 = createDefaultLink(pc1.id, pc1.interfaces[0].id, switch1.id, switch1.interfaces[0].id);
  const link2 = createDefaultLink(pc2.id, pc2.interfaces[0].id, switch1.id, switch1.interfaces[1].id);

  return {
    id: "sample-two-host-lan",
    name: "1. Two-Host LAN",
    description: "Two PCs connected to a Layer 2 switch within the same IPv4 subnet (192.168.1.0/24).",
    version: 1,
    nodes: [pc1, switch1, pc2],
    links: [link1, link2],
    groups: [],
    settings: {
      gridSnap: true,
      autoSave: true,
      labelVisibility: {
        showInterfaceNames: true,
        showIpAddresses: true,
        showLinkCost: false,
        showBandwidth: false,
        showLatency: false,
        showPacketLabels: true,
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// 2. Two Different Networks
function buildTwoNetworks(): NetworkTopology {
  const pc1 = createDefaultNode("pc", { x: 100, y: 250 }, "pc-1", "PC-LAN1");
  const sw1 = createDefaultNode("l2-switch", { x: 280, y: 250 }, "sw-1", "SW-LAN1");
  const r1 = createDefaultNode("router", { x: 500, y: 250 }, "r-1", "Router-Gateway");
  const sw2 = createDefaultNode("l2-switch", { x: 720, y: 250 }, "sw-2", "SW-LAN2");
  const pc2 = createDefaultNode("pc", { x: 900, y: 250 }, "pc-2", "PC-LAN2");

  pc1.interfaces[0].ipv4 = { address: "192.168.10.10", prefixLength: 24 };
  pc1.configuration.defaultGateway = "192.168.10.1";

  pc2.interfaces[0].ipv4 = { address: "192.168.20.10", prefixLength: 24 };
  pc2.configuration.defaultGateway = "192.168.20.1";

  r1.interfaces[0].ipv4 = { address: "192.168.10.1", prefixLength: 24 };
  r1.interfaces[1].ipv4 = { address: "192.168.20.1", prefixLength: 24 };

  r1.routingTable = [
    {
      id: "rt-1",
      source: "connected",
      destinationPrefix: "192.168.10.0",
      prefixLength: 24,
      nextHop: "0.0.0.0",
      exitInterfaceName: r1.interfaces[0].name,
      metric: 0,
      administrativeDistance: 0,
      active: true,
    },
    {
      id: "rt-2",
      source: "connected",
      destinationPrefix: "192.168.20.0",
      prefixLength: 24,
      nextHop: "0.0.0.0",
      exitInterfaceName: r1.interfaces[1].name,
      metric: 0,
      administrativeDistance: 0,
      active: true,
    },
  ];

  const l1 = createDefaultLink(pc1.id, pc1.interfaces[0].id, sw1.id, sw1.interfaces[0].id);
  const l2 = createDefaultLink(sw1.id, sw1.interfaces[1].id, r1.id, r1.interfaces[0].id);
  const l3 = createDefaultLink(r1.id, r1.interfaces[1].id, sw2.id, sw2.interfaces[0].id);
  const l4 = createDefaultLink(sw2.id, sw2.interfaces[1].id, pc2.id, pc2.interfaces[0].id);

  return {
    id: "sample-two-networks",
    name: "2. Two Different Networks",
    description: "Two distinct subnets (192.168.10.0/24 & 192.168.20.0/24) connected by a central gateway router.",
    version: 1,
    nodes: [pc1, sw1, r1, sw2, pc2],
    links: [l1, l2, l3, l4],
    groups: [],
    settings: {
      gridSnap: true,
      autoSave: true,
      labelVisibility: {
        showInterfaceNames: true,
        showIpAddresses: true,
        showLinkCost: true,
        showBandwidth: false,
        showLatency: false,
        showPacketLabels: true,
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// 3. Three-Router Network (OSPF)
function buildThreeRouterOspf(): NetworkTopology {
  const r1 = createDefaultNode("router", { x: 200, y: 150 }, "r-1", "Router-A");
  const r2 = createDefaultNode("router", { x: 500, y: 150 }, "r-2", "Router-B");
  const r3 = createDefaultNode("router", { x: 800, y: 150 }, "r-3", "Router-C");

  const pc1 = createDefaultNode("pc", { x: 200, y: 350 }, "pc-1", "Host-A");
  const pc2 = createDefaultNode("pc", { x: 800, y: 350 }, "pc-2", "Host-C");

  [r1, r2, r3].forEach((r, idx) => {
    r.protocolConfiguration.ospf = {
      enabled: true,
      routerId: `${idx + 1}.${idx + 1}.${idx + 1}.${idx + 1}`,
      processId: 1,
      areaId: "0.0.0.0",
      helloInterval: 10,
      deadInterval: 40,
      passiveInterfaces: [],
    };
  });

  r1.interfaces[0].ipv4 = { address: "10.0.12.1", prefixLength: 24 };
  r2.interfaces[0].ipv4 = { address: "10.0.12.2", prefixLength: 24 };

  r2.interfaces[1].ipv4 = { address: "10.0.23.2", prefixLength: 24 };
  r3.interfaces[0].ipv4 = { address: "10.0.23.3", prefixLength: 24 };

  r1.interfaces[1].ipv4 = { address: "192.168.1.1", prefixLength: 24 };
  pc1.interfaces[0].ipv4 = { address: "192.168.1.10", prefixLength: 24 };
  pc1.configuration.defaultGateway = "192.168.1.1";

  r3.interfaces[1].ipv4 = { address: "192.168.3.1", prefixLength: 24 };
  pc2.interfaces[0].ipv4 = { address: "192.168.3.10", prefixLength: 24 };
  pc2.configuration.defaultGateway = "192.168.3.1";

  const l1 = createDefaultLink(r1.id, r1.interfaces[0].id, r2.id, r2.interfaces[0].id, "serial");
  const l2 = createDefaultLink(r2.id, r2.interfaces[1].id, r3.id, r3.interfaces[0].id, "serial");
  const l3 = createDefaultLink(pc1.id, pc1.interfaces[0].id, r1.id, r1.interfaces[1].id);
  const l4 = createDefaultLink(pc2.id, pc2.interfaces[0].id, r3.id, r3.interfaces[1].id);

  return {
    id: "sample-three-router-ospf",
    name: "3. Three-Router OSPF Network",
    description: "Three OSPF Area 0 routers calculating shortest paths across point-to-point serial links.",
    version: 1,
    nodes: [r1, r2, r3, pc1, pc2],
    links: [l1, l2, l3, l4],
    groups: [],
    settings: {
      gridSnap: true,
      autoSave: true,
      labelVisibility: {
        showInterfaceNames: true,
        showIpAddresses: true,
        showLinkCost: true,
        showBandwidth: true,
        showLatency: true,
        showPacketLabels: true,
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const SAMPLE_TOPOLOGIES: SampleTopologyMeta[] = [
  {
    id: "sample-two-host-lan",
    name: "1. Two-Host LAN",
    description: "Two PCs connected via a Layer 2 switch on the same subnet.",
    learningObjective: "Observe ARP resolution and Layer 2 switch MAC learning.",
    suggestedSimulation: "Send Ping from PC-A to PC-B.",
    expectedResult: "ARP request broadcast -> ARP reply unicast -> ICMP Echo Request delivered.",
    getTopology: buildTwoHostLan,
  },
  {
    id: "sample-two-networks",
    name: "2. Two Different Networks",
    description: "Two distinct LANs bridged by a single gateway router.",
    learningObjective: "Understand gateway routing, subnets, and TTL decrementing across a router.",
    suggestedSimulation: "Send Ping from PC-LAN1 to PC-LAN2.",
    expectedResult: "Packet sent to gateway router -> Router performs LPM lookup -> Packet forwarded.",
    getTopology: buildTwoNetworks,
  },
  {
    id: "sample-three-router-ospf",
    name: "3. Three-Router OSPF Network",
    description: "Three routers running OSPF Area 0.",
    learningObjective: "Understand link-state database synchronization and Dijkstra SPF cost calculation.",
    suggestedSimulation: "Run OSPF simulation and send traffic Host-A to Host-C.",
    expectedResult: "Routers discover neighbors -> LSDB synced -> Routes installed in routing table.",
    getTopology: buildThreeRouterOspf,
  },
];

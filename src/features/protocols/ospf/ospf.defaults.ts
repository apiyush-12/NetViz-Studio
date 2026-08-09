import type { TopologyDefinition } from "@/features/simulation/simulation-types";
import type { OspfRouter, OspfLink, OspfConfig, OspfArea } from "./ospf.types";

// ==========================================
// 1. DIAMOND TOPOLOGY (4 Routers - Default)
// ==========================================
export const DIAMOND_OSPF_AREAS: OspfArea[] = [
  {
    id: "0",
    name: "Area 0 (Backbone)",
    type: "backbone",
    x: 80,
    y: 110,
    width: 400,
    height: 350,
    routers: ["R1", "R2", "R3", "R4"],
  },
];

export const DIAMOND_OSPF_ROUTERS: OspfRouter[] = [
  {
    nodeId: "R1",
    name: "Router R1",
    routerId: "1.1.1.1",
    processId: 1,
    areaId: "0",
    state: "Full",
    position: { x: 280, y: 150 },
    interfaces: [
      { id: "R1-LAN", name: "Gi0/0", ipAddress: "10.0.1.1", prefixLength: 24, areaId: "0", cost: 1, helloInterval: 10, deadInterval: 40, passive: true, enabled: true },
      { id: "R1-R2", name: "Gi0/1", ipAddress: "10.1.2.1", prefixLength: 24, areaId: "0", cost: 10, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
      { id: "R1-R3", name: "Gi0/2", ipAddress: "10.1.3.1", prefixLength: 24, areaId: "0", cost: 5, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
    ],
    neighbors: [],
    lsdb: [],
    routingTable: [],
  },
  {
    nodeId: "R2",
    name: "Router R2",
    routerId: "2.2.2.2",
    processId: 1,
    areaId: "0",
    state: "Full",
    position: { x: 160, y: 280 },
    interfaces: [
      { id: "R2-R1", name: "Gi0/1", ipAddress: "10.1.2.2", prefixLength: 24, areaId: "0", cost: 10, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
      { id: "R2-R4", name: "Gi0/2", ipAddress: "10.2.4.2", prefixLength: 24, areaId: "0", cost: 5, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
    ],
    neighbors: [],
    lsdb: [],
    routingTable: [],
  },
  {
    nodeId: "R3",
    name: "Router R3",
    routerId: "3.3.3.3",
    processId: 1,
    areaId: "0",
    state: "Full",
    position: { x: 400, y: 280 },
    interfaces: [
      { id: "R3-R1", name: "Gi0/1", ipAddress: "10.1.3.3", prefixLength: 24, areaId: "0", cost: 5, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
      { id: "R3-R4", name: "Gi0/2", ipAddress: "10.3.4.3", prefixLength: 24, areaId: "0", cost: 20, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
    ],
    neighbors: [],
    lsdb: [],
    routingTable: [],
  },
  {
    nodeId: "R4",
    name: "Router R4",
    routerId: "4.4.4.4",
    processId: 1,
    areaId: "0",
    state: "Full",
    position: { x: 280, y: 410 },
    interfaces: [
      { id: "R4-R2", name: "Gi0/1", ipAddress: "10.2.4.4", prefixLength: 24, areaId: "0", cost: 5, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
      { id: "R4-R3", name: "Gi0/2", ipAddress: "10.3.4.4", prefixLength: 24, areaId: "0", cost: 20, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
      { id: "R4-LAN", name: "Gi0/0", ipAddress: "10.0.4.1", prefixLength: 24, areaId: "0", cost: 1, helloInterval: 10, deadInterval: 40, passive: true, enabled: true },
    ],
    neighbors: [],
    lsdb: [],
    routingTable: [],
  },
];

export const DIAMOND_OSPF_LINKS: OspfLink[] = [
  { id: "link-R1-R2", sourceRouterId: "R1", targetRouterId: "R2", sourceInterfaceId: "R1-R2", targetInterfaceId: "R2-R1", cost: 10, enabled: true, areaId: "0", status: "up" },
  { id: "link-R1-R3", sourceRouterId: "R1", targetRouterId: "R3", sourceInterfaceId: "R1-R3", targetInterfaceId: "R3-R1", cost: 5, enabled: true, areaId: "0", status: "up" },
  { id: "link-R2-R4", sourceRouterId: "R2", targetRouterId: "R4", sourceInterfaceId: "R2-R4", targetInterfaceId: "R4-R2", cost: 5, enabled: true, areaId: "0", status: "up" },
  { id: "link-R3-R4", sourceRouterId: "R3", targetRouterId: "R4", sourceInterfaceId: "R3-R4", targetInterfaceId: "R4-R3", cost: 20, enabled: true, areaId: "0", status: "up" },
];

export const DIAMOND_OSPF_TOPOLOGY: TopologyDefinition = {
  nodes: [
    { id: "LAN-A", type: "host", label: "LAN-A (10.0.1.0/24)", position: { x: 280, y: 50 }, config: { ip: "10.0.1.10" } },
    { id: "R1", type: "router", label: "R1 (1.1.1.1)", position: { x: 280, y: 150 }, config: { routerId: "1.1.1.1", area: "0" } },
    { id: "R2", type: "router", label: "R2 (2.2.2.2)", position: { x: 160, y: 280 }, config: { routerId: "2.2.2.2", area: "0" } },
    { id: "R3", type: "router", label: "R3 (3.3.3.3)", position: { x: 400, y: 280 }, config: { routerId: "3.3.3.3", area: "0" } },
    { id: "R4", type: "router", label: "R4 (4.4.4.4)", position: { x: 280, y: 410 }, config: { routerId: "4.4.4.4", area: "0" } },
    { id: "LAN-B", type: "host", label: "LAN-B (10.0.4.0/24)", position: { x: 280, y: 510 }, config: { ip: "10.0.4.10" } },
  ],
  edges: [
    { id: "edge-LAN-A-R1", source: "LAN-A", target: "R1", latency: 10, cost: 1, enabled: true },
    { id: "edge-R1-R2", source: "R1", target: "R2", latency: 20, cost: 10, enabled: true },
    { id: "edge-R1-R3", source: "R1", target: "R3", latency: 15, cost: 5, enabled: true },
    { id: "edge-R2-R4", source: "R2", target: "R4", latency: 15, cost: 5, enabled: true },
    { id: "edge-R3-R4", source: "R3", target: "R4", latency: 30, cost: 20, enabled: true },
    { id: "edge-R4-LAN-B", source: "R4", target: "LAN-B", latency: 10, cost: 1, enabled: true },
  ],
};

// ==========================================
// 2. REDUNDANT RING TOPOLOGY (5 Routers)
// ==========================================
export const RING_OSPF_AREAS: OspfArea[] = [
  {
    id: "0",
    name: "Area 0 (Backbone Ring)",
    type: "backbone",
    x: 60,
    y: 80,
    width: 440,
    height: 400,
    routers: ["R1", "R2", "R3", "R4", "R5"],
  },
];

export const RING_OSPF_ROUTERS: OspfRouter[] = [
  {
    nodeId: "R1",
    name: "Router R1",
    routerId: "1.1.1.1",
    processId: 1,
    areaId: "0",
    state: "Full",
    position: { x: 280, y: 120 },
    interfaces: [
      { id: "R1-R2", name: "Gi0/1", ipAddress: "10.1.2.1", prefixLength: 24, areaId: "0", cost: 10, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
      { id: "R1-R5", name: "Gi0/2", ipAddress: "10.1.5.1", prefixLength: 24, areaId: "0", cost: 10, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
    ],
    neighbors: [],
    lsdb: [],
    routingTable: [],
  },
  {
    nodeId: "R2",
    name: "Router R2",
    routerId: "2.2.2.2",
    processId: 1,
    areaId: "0",
    state: "Full",
    position: { x: 420, y: 220 },
    interfaces: [
      { id: "R2-R1", name: "Gi0/1", ipAddress: "10.1.2.2", prefixLength: 24, areaId: "0", cost: 10, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
      { id: "R2-R3", name: "Gi0/2", ipAddress: "10.2.3.2", prefixLength: 24, areaId: "0", cost: 10, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
    ],
    neighbors: [],
    lsdb: [],
    routingTable: [],
  },
  {
    nodeId: "R3",
    name: "Router R3",
    routerId: "3.3.3.3",
    processId: 1,
    areaId: "0",
    state: "Full",
    position: { x: 370, y: 400 },
    interfaces: [
      { id: "R3-R2", name: "Gi0/1", ipAddress: "10.2.3.3", prefixLength: 24, areaId: "0", cost: 10, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
      { id: "R3-R4", name: "Gi0/2", ipAddress: "10.3.4.3", prefixLength: 24, areaId: "0", cost: 10, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
    ],
    neighbors: [],
    lsdb: [],
    routingTable: [],
  },
  {
    nodeId: "R4",
    name: "Router R4",
    routerId: "4.4.4.4",
    processId: 1,
    areaId: "0",
    state: "Full",
    position: { x: 190, y: 400 },
    interfaces: [
      { id: "R4-R3", name: "Gi0/1", ipAddress: "10.3.4.4", prefixLength: 24, areaId: "0", cost: 10, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
      { id: "R4-R5", name: "Gi0/2", ipAddress: "10.4.5.4", prefixLength: 24, areaId: "0", cost: 10, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
    ],
    neighbors: [],
    lsdb: [],
    routingTable: [],
  },
  {
    nodeId: "R5",
    name: "Router R5",
    routerId: "5.5.5.5",
    processId: 1,
    areaId: "0",
    state: "Full",
    position: { x: 140, y: 220 },
    interfaces: [
      { id: "R5-R4", name: "Gi0/1", ipAddress: "10.4.5.5", prefixLength: 24, areaId: "0", cost: 10, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
      { id: "R5-R1", name: "Gi0/2", ipAddress: "10.1.5.5", prefixLength: 24, areaId: "0", cost: 10, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
    ],
    neighbors: [],
    lsdb: [],
    routingTable: [],
  },
];

export const RING_OSPF_LINKS: OspfLink[] = [
  { id: "link-R1-R2", sourceRouterId: "R1", targetRouterId: "R2", sourceInterfaceId: "R1-R2", targetInterfaceId: "R2-R1", cost: 10, enabled: true, areaId: "0", status: "up" },
  { id: "link-R2-R3", sourceRouterId: "R2", targetRouterId: "R3", sourceInterfaceId: "R2-R3", targetInterfaceId: "R3-R2", cost: 10, enabled: true, areaId: "0", status: "up" },
  { id: "link-R3-R4", sourceRouterId: "R3", targetRouterId: "R4", sourceInterfaceId: "R3-R4", targetInterfaceId: "R4-R3", cost: 10, enabled: true, areaId: "0", status: "up" },
  { id: "link-R4-R5", sourceRouterId: "R4", targetRouterId: "R5", sourceInterfaceId: "R4-R5", targetInterfaceId: "R5-R4", cost: 10, enabled: true, areaId: "0", status: "up" },
  { id: "link-R5-R1", sourceRouterId: "R5", targetRouterId: "R1", sourceInterfaceId: "R5-R1", targetInterfaceId: "R1-R5", cost: 10, enabled: true, areaId: "0", status: "up" },
];

export const RING_OSPF_TOPOLOGY: TopologyDefinition = {
  nodes: RING_OSPF_ROUTERS.map((r) => ({
    id: r.nodeId,
    type: "router",
    label: `${r.nodeId} (${r.routerId})`,
    position: r.position,
    config: { routerId: r.routerId, area: r.areaId },
  })),
  edges: RING_OSPF_LINKS.map((l) => ({
    id: `edge-${l.id}`,
    source: l.sourceRouterId,
    target: l.targetRouterId,
    latency: 15,
    cost: l.cost,
    enabled: l.enabled,
  })),
};

// ==========================================
// 3. MULTI-AREA HIERARCHY TOPOLOGY
// ==========================================
export const MULTI_AREA_OSPF_AREAS: OspfArea[] = [
  {
    id: "0",
    name: "Area 0 (Backbone)",
    type: "backbone",
    x: 40,
    y: 120,
    width: 220,
    height: 320,
    routers: ["R1", "R2"],
  },
  {
    id: "1",
    name: "Area 1 (Branch Domain)",
    type: "standard",
    x: 290,
    y: 120,
    width: 230,
    height: 320,
    routers: ["R2", "R3", "R4"],
  },
];

export const MULTI_AREA_OSPF_ROUTERS: OspfRouter[] = [
  {
    nodeId: "R1",
    name: "Backbone Router R1",
    routerId: "1.1.1.1",
    processId: 1,
    areaId: "0",
    state: "Full",
    position: { x: 140, y: 200 },
    interfaces: [
      { id: "R1-R2", name: "Gi0/1", ipAddress: "10.0.12.1", prefixLength: 24, areaId: "0", cost: 10, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
    ],
    neighbors: [],
    lsdb: [],
    routingTable: [],
  },
  {
    nodeId: "R2",
    name: "ABR Router R2",
    routerId: "2.2.2.2",
    processId: 1,
    areaId: "0",
    state: "Full",
    position: { x: 260, y: 280 },
    interfaces: [
      { id: "R2-R1", name: "Gi0/1", ipAddress: "10.0.12.2", prefixLength: 24, areaId: "0", cost: 10, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
      { id: "R2-R3", name: "Gi0/2", ipAddress: "10.1.23.2", prefixLength: 24, areaId: "1", cost: 10, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
      { id: "R2-R4", name: "Gi0/3", ipAddress: "10.1.24.2", prefixLength: 24, areaId: "1", cost: 15, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
    ],
    neighbors: [],
    lsdb: [],
    routingTable: [],
  },
  {
    nodeId: "R3",
    name: "Branch Router R3",
    routerId: "3.3.3.3",
    processId: 1,
    areaId: "1",
    state: "Full",
    position: { x: 410, y: 190 },
    interfaces: [
      { id: "R3-R2", name: "Gi0/1", ipAddress: "10.1.23.3", prefixLength: 24, areaId: "1", cost: 10, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
      { id: "R3-R4", name: "Gi0/2", ipAddress: "10.1.34.3", prefixLength: 24, areaId: "1", cost: 5, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
    ],
    neighbors: [],
    lsdb: [],
    routingTable: [],
  },
  {
    nodeId: "R4",
    name: "Branch Router R4",
    routerId: "4.4.4.4",
    processId: 1,
    areaId: "1",
    state: "Full",
    position: { x: 410, y: 370 },
    interfaces: [
      { id: "R4-R2", name: "Gi0/1", ipAddress: "10.1.24.4", prefixLength: 24, areaId: "1", cost: 15, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
      { id: "R4-R3", name: "Gi0/2", ipAddress: "10.1.34.4", prefixLength: 24, areaId: "1", cost: 5, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
    ],
    neighbors: [],
    lsdb: [],
    routingTable: [],
  },
];

export const MULTI_AREA_OSPF_LINKS: OspfLink[] = [
  { id: "link-R1-R2", sourceRouterId: "R1", targetRouterId: "R2", sourceInterfaceId: "R1-R2", targetInterfaceId: "R2-R1", cost: 10, enabled: true, areaId: "0", status: "up" },
  { id: "link-R2-R3", sourceRouterId: "R2", targetRouterId: "R3", sourceInterfaceId: "R2-R3", targetInterfaceId: "R3-R2", cost: 10, enabled: true, areaId: "1", status: "up" },
  { id: "link-R2-R4", sourceRouterId: "R2", targetRouterId: "R4", sourceInterfaceId: "R2-R4", targetInterfaceId: "R4-R2", cost: 15, enabled: true, areaId: "1", status: "up" },
  { id: "link-R3-R4", sourceRouterId: "R3", targetRouterId: "R4", sourceInterfaceId: "R3-R4", targetInterfaceId: "R4-R3", cost: 5, enabled: true, areaId: "1", status: "up" },
];

export const MULTI_AREA_OSPF_TOPOLOGY: TopologyDefinition = {
  nodes: MULTI_AREA_OSPF_ROUTERS.map((r) => ({
    id: r.nodeId,
    type: "router",
    label: `${r.nodeId} (${r.routerId})`,
    position: r.position,
    config: { routerId: r.routerId, area: r.areaId },
  })),
  edges: MULTI_AREA_OSPF_LINKS.map((l) => ({
    id: `edge-${l.id}`,
    source: l.sourceRouterId,
    target: l.targetRouterId,
    latency: 15,
    cost: l.cost,
    enabled: l.enabled,
  })),
};

// ==========================================
// 4. TRIANGLE MESH TOPOLOGY (3 Routers)
// ==========================================
export const TRIANGLE_OSPF_AREAS: OspfArea[] = [
  {
    id: "0",
    name: "Area 0 (Triangle Mesh)",
    type: "backbone",
    x: 80,
    y: 100,
    width: 400,
    height: 360,
    routers: ["R1", "R2", "R3"],
  },
];

export const TRIANGLE_OSPF_ROUTERS: OspfRouter[] = [
  {
    nodeId: "R1",
    name: "Router R1",
    routerId: "1.1.1.1",
    processId: 1,
    areaId: "0",
    state: "Full",
    position: { x: 280, y: 150 },
    interfaces: [
      { id: "R1-R2", name: "Gi0/1", ipAddress: "10.1.2.1", prefixLength: 24, areaId: "0", cost: 10, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
      { id: "R1-R3", name: "Gi0/2", ipAddress: "10.1.3.1", prefixLength: 24, areaId: "0", cost: 30, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
    ],
    neighbors: [],
    lsdb: [],
    routingTable: [],
  },
  {
    nodeId: "R2",
    name: "Router R2",
    routerId: "2.2.2.2",
    processId: 1,
    areaId: "0",
    state: "Full",
    position: { x: 160, y: 350 },
    interfaces: [
      { id: "R2-R1", name: "Gi0/1", ipAddress: "10.1.2.2", prefixLength: 24, areaId: "0", cost: 10, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
      { id: "R2-R3", name: "Gi0/2", ipAddress: "10.2.3.2", prefixLength: 24, areaId: "0", cost: 10, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
    ],
    neighbors: [],
    lsdb: [],
    routingTable: [],
  },
  {
    nodeId: "R3",
    name: "Router R3",
    routerId: "3.3.3.3",
    processId: 1,
    areaId: "0",
    state: "Full",
    position: { x: 400, y: 350 },
    interfaces: [
      { id: "R3-R1", name: "Gi0/1", ipAddress: "10.1.3.3", prefixLength: 24, areaId: "0", cost: 30, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
      { id: "R3-R2", name: "Gi0/2", ipAddress: "10.2.3.3", prefixLength: 24, areaId: "0", cost: 10, helloInterval: 10, deadInterval: 40, passive: false, enabled: true },
    ],
    neighbors: [],
    lsdb: [],
    routingTable: [],
  },
];

export const TRIANGLE_OSPF_LINKS: OspfLink[] = [
  { id: "link-R1-R2", sourceRouterId: "R1", targetRouterId: "R2", sourceInterfaceId: "R1-R2", targetInterfaceId: "R2-R1", cost: 10, enabled: true, areaId: "0", status: "up" },
  { id: "link-R2-R3", sourceRouterId: "R2", targetRouterId: "R3", sourceInterfaceId: "R2-R3", targetInterfaceId: "R3-R2", cost: 10, enabled: true, areaId: "0", status: "up" },
  { id: "link-R1-R3", sourceRouterId: "R1", targetRouterId: "R3", sourceInterfaceId: "R1-R3", targetInterfaceId: "R3-R1", cost: 30, enabled: true, areaId: "0", status: "up" },
];

export const TRIANGLE_OSPF_TOPOLOGY: TopologyDefinition = {
  nodes: TRIANGLE_OSPF_ROUTERS.map((r) => ({
    id: r.nodeId,
    type: "router",
    label: `${r.nodeId} (${r.routerId})`,
    position: r.position,
    config: { routerId: r.routerId, area: r.areaId },
  })),
  edges: TRIANGLE_OSPF_LINKS.map((l) => ({
    id: `edge-${l.id}`,
    source: l.sourceRouterId,
    target: l.targetRouterId,
    latency: 15,
    cost: l.cost,
    enabled: l.enabled,
  })),
};

// Aliases for default exports
export const DEFAULT_OSPF_ROUTERS = DIAMOND_OSPF_ROUTERS;
export const DEFAULT_OSPF_LINKS = DIAMOND_OSPF_LINKS;
export const DEFAULT_OSPF_AREAS = DIAMOND_OSPF_AREAS;
export const DEFAULT_OSPF_TOPOLOGY = DIAMOND_OSPF_TOPOLOGY;

export function getOspfPresetData(preset: string = "diamond"): {
  routers: OspfRouter[];
  links: OspfLink[];
  areas: OspfArea[];
  topology: TopologyDefinition;
} {
  switch (preset) {
    case "ring":
      return {
        routers: JSON.parse(JSON.stringify(RING_OSPF_ROUTERS)),
        links: JSON.parse(JSON.stringify(RING_OSPF_LINKS)),
        areas: JSON.parse(JSON.stringify(RING_OSPF_AREAS)),
        topology: RING_OSPF_TOPOLOGY,
      };
    case "multi-area":
      return {
        routers: JSON.parse(JSON.stringify(MULTI_AREA_OSPF_ROUTERS)),
        links: JSON.parse(JSON.stringify(MULTI_AREA_OSPF_LINKS)),
        areas: JSON.parse(JSON.stringify(MULTI_AREA_OSPF_AREAS)),
        topology: MULTI_AREA_OSPF_TOPOLOGY,
      };
    case "triangle":
      return {
        routers: JSON.parse(JSON.stringify(TRIANGLE_OSPF_ROUTERS)),
        links: JSON.parse(JSON.stringify(TRIANGLE_OSPF_LINKS)),
        areas: JSON.parse(JSON.stringify(TRIANGLE_OSPF_AREAS)),
        topology: TRIANGLE_OSPF_TOPOLOGY,
      };
    case "diamond":
    default:
      return {
        routers: JSON.parse(JSON.stringify(DIAMOND_OSPF_ROUTERS)),
        links: JSON.parse(JSON.stringify(DIAMOND_OSPF_LINKS)),
        areas: JSON.parse(JSON.stringify(DIAMOND_OSPF_AREAS)),
        topology: DIAMOND_OSPF_TOPOLOGY,
      };
  }
}

export const defaultOspfConfig: OspfConfig = {
  topologyPreset: "diamond",
  rootRouterId: "R1",
  routers: [],
  links: [],
  labelMode: "simple",
  failureScenario: "none",
};

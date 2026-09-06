import type {
  StpConfig,
  StpSwitchNode,
  StpLink,
  StpTopologyPresetId,
  StpScenarioId,
} from "./stp.types";

export const STP_PORT_SPEED_COSTS = {
  10: 100, // 10 Mbps Ethernet (Cost 100)
  100: 19, // 100 Mbps Fast Ethernet (Cost 19)
  1000: 4, // 1 Gbps Gigabit Ethernet (Cost 4)
  10000: 2, // 10 Gbps TenGigabit Ethernet (Cost 2)
} as const;

export const defaultStpConfig: StpConfig = {
  version: "stp",
  topologyPreset: "triangle_loop",
  scenarioId: "standard_convergence",
  rootGuardOnAccess: false,
};

// ─── Preset 1: 3-Switch Triangle Loop (Classic STP loop prevention) ───────────
export const TRIANGLE_SWITCHES: StpSwitchNode[] = [
  {
    id: "sw1",
    name: "Switch-1 (Root Bridge)",
    label: "SW-1",
    bridgeId: { priority: 4096, sysIdExtension: 1, macAddress: "00:1A:2B:3C:4D:01" },
    rootBridgeId: { priority: 4096, sysIdExtension: 1, macAddress: "00:1A:2B:3C:4D:01" },
    rootPathCost: 0,
    rootPortId: null,
    isRoot: true,
    helloTimer: 2,
    maxAge: 20,
    forwardDelay: 15,
    topologyChangeFlag: false,
    camAgingTime: 300,
    roleDescription: "Core Switch / Root Bridge (Priority 4096)",
    position: { x: 300, y: 70 },
    ports: [
      {
        id: "sw1-p1",
        name: "Gi0/1",
        switchId: "sw1",
        speedMbps: 1000,
        cost: 4,
        portPriority: 128,
        portNumber: 1,
        role: "designated",
        state: "forwarding",
        txBpduCount: 0,
        rxBpduCount: 0,
      },
      {
        id: "sw1-p2",
        name: "Gi0/2",
        switchId: "sw1",
        speedMbps: 1000,
        cost: 4,
        portPriority: 128,
        portNumber: 2,
        role: "designated",
        state: "forwarding",
        txBpduCount: 0,
        rxBpduCount: 0,
      },
    ],
  },
  {
    id: "sw2",
    name: "Switch-2 (Distribution)",
    label: "SW-2",
    bridgeId: { priority: 32768, sysIdExtension: 1, macAddress: "00:1A:2B:3C:4D:02" },
    rootBridgeId: { priority: 4096, sysIdExtension: 1, macAddress: "00:1A:2B:3C:4D:01" },
    rootPathCost: 4,
    rootPortId: "sw2-p1",
    isRoot: false,
    helloTimer: 2,
    maxAge: 20,
    forwardDelay: 15,
    topologyChangeFlag: false,
    camAgingTime: 300,
    roleDescription: "Distribution Switch (Priority 32768)",
    position: { x: 120, y: 280 },
    ports: [
      {
        id: "sw2-p1",
        name: "Gi0/1",
        switchId: "sw2",
        speedMbps: 1000,
        cost: 4,
        portPriority: 128,
        portNumber: 1,
        role: "root",
        state: "forwarding",
        txBpduCount: 0,
        rxBpduCount: 0,
      },
      {
        id: "sw2-p2",
        name: "Gi0/2",
        switchId: "sw2",
        speedMbps: 1000,
        cost: 4,
        portPriority: 128,
        portNumber: 2,
        role: "designated",
        state: "forwarding",
        txBpduCount: 0,
        rxBpduCount: 0,
      },
    ],
  },
  {
    id: "sw3",
    name: "Switch-3 (Access)",
    label: "SW-3",
    bridgeId: { priority: 32768, sysIdExtension: 1, macAddress: "00:1A:2B:3C:4D:03" },
    rootBridgeId: { priority: 4096, sysIdExtension: 1, macAddress: "00:1A:2B:3C:4D:01" },
    rootPathCost: 4,
    rootPortId: "sw3-p1",
    isRoot: false,
    helloTimer: 2,
    maxAge: 20,
    forwardDelay: 15,
    topologyChangeFlag: false,
    camAgingTime: 300,
    roleDescription: "Access Switch (Priority 32768, Alternate Port blocked)",
    position: { x: 480, y: 280 },
    ports: [
      {
        id: "sw3-p1",
        name: "Gi0/1",
        switchId: "sw3",
        speedMbps: 1000,
        cost: 4,
        portPriority: 128,
        portNumber: 1,
        role: "root",
        state: "forwarding",
        txBpduCount: 0,
        rxBpduCount: 0,
      },
      {
        id: "sw3-p2",
        name: "Gi0/2",
        switchId: "sw3",
        speedMbps: 1000,
        cost: 4,
        portPriority: 128,
        portNumber: 2,
        role: "alternate",
        state: "blocking",
        txBpduCount: 0,
        rxBpduCount: 0,
      },
    ],
  },
];

export const TRIANGLE_LINKS: StpLink[] = [
  {
    id: "link-sw1-sw2",
    sourceSwitchId: "sw1",
    sourcePortId: "sw1-p1",
    targetSwitchId: "sw2",
    targetPortId: "sw2-p1",
    speedMbps: 1000,
    cost: 4,
    enabled: true,
    isPtP: true,
  },
  {
    id: "link-sw1-sw3",
    sourceSwitchId: "sw1",
    sourcePortId: "sw1-p2",
    targetSwitchId: "sw3",
    targetPortId: "sw3-p1",
    speedMbps: 1000,
    cost: 4,
    enabled: true,
    isPtP: true,
  },
  {
    id: "link-sw2-sw3",
    sourceSwitchId: "sw2",
    sourcePortId: "sw2-p2",
    targetSwitchId: "sw3",
    targetPortId: "sw3-p2",
    speedMbps: 1000,
    cost: 4,
    enabled: true,
    isPtP: true,
  },
];

// ─── Preset 2: 4-Switch Diamond Redundant Core ───────────────────────────────
export const DIAMOND_SWITCHES: StpSwitchNode[] = [
  {
    id: "sw-core1",
    name: "Core Switch 1 (Root)",
    label: "Core-1",
    bridgeId: { priority: 4096, sysIdExtension: 1, macAddress: "00:AA:01:00:00:01" },
    rootBridgeId: { priority: 4096, sysIdExtension: 1, macAddress: "00:AA:01:00:00:01" },
    rootPathCost: 0,
    rootPortId: null,
    isRoot: true,
    helloTimer: 2,
    maxAge: 20,
    forwardDelay: 15,
    topologyChangeFlag: false,
    camAgingTime: 300,
    position: { x: 300, y: 50 },
    ports: [
      { id: "c1-p1", name: "Gi0/1", switchId: "sw-core1", speedMbps: 10000, cost: 2, portPriority: 128, portNumber: 1, role: "designated", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
      { id: "c1-p2", name: "Gi0/2", switchId: "sw-core1", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 2, role: "designated", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
      { id: "c1-p3", name: "Gi0/3", switchId: "sw-core1", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 3, role: "designated", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
    ],
  },
  {
    id: "sw-core2",
    name: "Core Switch 2 (Secondary)",
    label: "Core-2",
    bridgeId: { priority: 8192, sysIdExtension: 1, macAddress: "00:AA:01:00:00:02" },
    rootBridgeId: { priority: 4096, sysIdExtension: 1, macAddress: "00:AA:01:00:00:01" },
    rootPathCost: 2,
    rootPortId: "c2-p1",
    isRoot: false,
    helloTimer: 2,
    maxAge: 20,
    forwardDelay: 15,
    topologyChangeFlag: false,
    camAgingTime: 300,
    position: { x: 300, y: 190 },
    ports: [
      { id: "c2-p1", name: "Gi0/1", switchId: "sw-core2", speedMbps: 10000, cost: 2, portPriority: 128, portNumber: 1, role: "root", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
      { id: "c2-p2", name: "Gi0/2", switchId: "sw-core2", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 2, role: "designated", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
      { id: "c2-p3", name: "Gi0/3", switchId: "sw-core2", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 3, role: "designated", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
    ],
  },
  {
    id: "sw-dist1",
    name: "Dist Switch 1",
    label: "Dist-1",
    bridgeId: { priority: 32768, sysIdExtension: 1, macAddress: "00:AA:02:00:00:01" },
    rootBridgeId: { priority: 4096, sysIdExtension: 1, macAddress: "00:AA:01:00:00:01" },
    rootPathCost: 4,
    rootPortId: "d1-p1",
    isRoot: false,
    helloTimer: 2,
    maxAge: 20,
    forwardDelay: 15,
    topologyChangeFlag: false,
    camAgingTime: 300,
    position: { x: 100, y: 320 },
    ports: [
      { id: "d1-p1", name: "Gi0/1", switchId: "sw-dist1", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 1, role: "root", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
      { id: "d1-p2", name: "Gi0/2", switchId: "sw-dist1", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 2, role: "alternate", state: "blocking", txBpduCount: 0, rxBpduCount: 0 },
      { id: "d1-p3", name: "Gi0/3", switchId: "sw-dist1", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 3, role: "designated", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
    ],
  },
  {
    id: "sw-dist2",
    name: "Dist Switch 2",
    label: "Dist-2",
    bridgeId: { priority: 32768, sysIdExtension: 1, macAddress: "00:AA:02:00:00:02" },
    rootBridgeId: { priority: 4096, sysIdExtension: 1, macAddress: "00:AA:01:00:00:01" },
    rootPathCost: 4,
    rootPortId: "d2-p1",
    isRoot: false,
    helloTimer: 2,
    maxAge: 20,
    forwardDelay: 15,
    topologyChangeFlag: false,
    camAgingTime: 300,
    position: { x: 500, y: 320 },
    ports: [
      { id: "d2-p1", name: "Gi0/1", switchId: "sw-dist2", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 1, role: "root", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
      { id: "d2-p2", name: "Gi0/2", switchId: "sw-dist2", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 2, role: "alternate", state: "blocking", txBpduCount: 0, rxBpduCount: 0 },
      { id: "d2-p3", name: "Gi0/3", switchId: "sw-dist2", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 3, role: "alternate", state: "blocking", txBpduCount: 0, rxBpduCount: 0 },
    ],
  },
];

export const DIAMOND_LINKS: StpLink[] = [
  { id: "link-c1-c2", sourceSwitchId: "sw-core1", sourcePortId: "c1-p1", targetSwitchId: "sw-core2", targetPortId: "c2-p1", speedMbps: 10000, cost: 2, enabled: true, isPtP: true },
  { id: "link-c1-d1", sourceSwitchId: "sw-core1", sourcePortId: "c1-p2", targetSwitchId: "sw-dist1", targetPortId: "d1-p1", speedMbps: 1000, cost: 4, enabled: true, isPtP: true },
  { id: "link-c1-d2", sourceSwitchId: "sw-core1", sourcePortId: "c1-p3", targetSwitchId: "sw-dist2", targetPortId: "d2-p1", speedMbps: 1000, cost: 4, enabled: true, isPtP: true },
  { id: "link-c2-d1", sourceSwitchId: "sw-core2", sourcePortId: "c2-p2", targetSwitchId: "sw-dist1", targetPortId: "d1-p2", speedMbps: 1000, cost: 4, enabled: true, isPtP: true },
  { id: "link-c2-d2", sourceSwitchId: "sw-core2", sourcePortId: "c2-p3", targetSwitchId: "sw-dist2", targetPortId: "d2-p2", speedMbps: 1000, cost: 4, enabled: true, isPtP: true },
  { id: "link-d1-d2", sourceSwitchId: "sw-dist1", sourcePortId: "d1-p3", targetSwitchId: "sw-dist2", targetPortId: "d2-p3", speedMbps: 1000, cost: 4, enabled: true, isPtP: true },
];

// ─── Preset 3: Hierarchical 3-Tier Campus ────────────────────────────────────
export const HIERARCHICAL_SWITCHES: StpSwitchNode[] = [
  {
    id: "core-root",
    name: "Enterprise Core (Root)",
    label: "Core-SW",
    bridgeId: { priority: 4096, sysIdExtension: 1, macAddress: "00:01:02:03:04:01" },
    rootBridgeId: { priority: 4096, sysIdExtension: 1, macAddress: "00:01:02:03:04:01" },
    rootPathCost: 0,
    rootPortId: null,
    isRoot: true,
    helloTimer: 2,
    maxAge: 20,
    forwardDelay: 15,
    topologyChangeFlag: false,
    camAgingTime: 300,
    position: { x: 300, y: 50 },
    ports: [
      { id: "cr-p1", name: "Gi0/1", switchId: "core-root", speedMbps: 10000, cost: 2, portPriority: 128, portNumber: 1, role: "designated", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
      { id: "cr-p2", name: "Gi0/2", switchId: "core-root", speedMbps: 10000, cost: 2, portPriority: 128, portNumber: 2, role: "designated", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
    ],
  },
  {
    id: "dist-1",
    name: "Distribution SW-1",
    label: "Dist-1",
    bridgeId: { priority: 16384, sysIdExtension: 1, macAddress: "00:01:02:03:04:02" },
    rootBridgeId: { priority: 4096, sysIdExtension: 1, macAddress: "00:01:02:03:04:01" },
    rootPathCost: 2,
    rootPortId: "d1-p1",
    isRoot: false,
    helloTimer: 2,
    maxAge: 20,
    forwardDelay: 15,
    topologyChangeFlag: false,
    camAgingTime: 300,
    position: { x: 150, y: 180 },
    ports: [
      { id: "d1-p1", name: "Gi0/1", switchId: "dist-1", speedMbps: 10000, cost: 2, portPriority: 128, portNumber: 1, role: "root", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
      { id: "d1-p2", name: "Gi0/2", switchId: "dist-1", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 2, role: "designated", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
      { id: "d1-p3", name: "Gi0/3", switchId: "dist-1", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 3, role: "designated", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
    ],
  },
  {
    id: "dist-2",
    name: "Distribution SW-2",
    label: "Dist-2",
    bridgeId: { priority: 16384, sysIdExtension: 1, macAddress: "00:01:02:03:04:03" },
    rootBridgeId: { priority: 4096, sysIdExtension: 1, macAddress: "00:01:02:03:04:01" },
    rootPathCost: 2,
    rootPortId: "d2-p1",
    isRoot: false,
    helloTimer: 2,
    maxAge: 20,
    forwardDelay: 15,
    topologyChangeFlag: false,
    camAgingTime: 300,
    position: { x: 450, y: 180 },
    ports: [
      { id: "d2-p1", name: "Gi0/1", switchId: "dist-2", speedMbps: 10000, cost: 2, portPriority: 128, portNumber: 1, role: "root", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
      { id: "d2-p2", name: "Gi0/2", switchId: "dist-2", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 2, role: "designated", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
      { id: "d2-p3", name: "Gi0/3", switchId: "dist-2", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 3, role: "designated", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
    ],
  },
  {
    id: "access-1",
    name: "Access SW-1 (Floor 1)",
    label: "Acc-1",
    bridgeId: { priority: 32768, sysIdExtension: 1, macAddress: "00:01:02:03:04:04" },
    rootBridgeId: { priority: 4096, sysIdExtension: 1, macAddress: "00:01:02:03:04:01" },
    rootPathCost: 6,
    rootPortId: "a1-p1",
    isRoot: false,
    helloTimer: 2,
    maxAge: 20,
    forwardDelay: 15,
    topologyChangeFlag: false,
    camAgingTime: 300,
    position: { x: 150, y: 320 },
    ports: [
      { id: "a1-p1", name: "Gi0/1", switchId: "access-1", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 1, role: "root", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
      { id: "a1-p2", name: "Gi0/2", switchId: "access-1", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 2, role: "alternate", state: "blocking", txBpduCount: 0, rxBpduCount: 0 },
    ],
  },
  {
    id: "access-2",
    name: "Access SW-2 (Floor 2)",
    label: "Acc-2",
    bridgeId: { priority: 32768, sysIdExtension: 1, macAddress: "00:01:02:03:04:05" },
    rootBridgeId: { priority: 4096, sysIdExtension: 1, macAddress: "00:01:02:03:04:01" },
    rootPathCost: 6,
    rootPortId: "a2-p2",
    isRoot: false,
    helloTimer: 2,
    maxAge: 20,
    forwardDelay: 15,
    topologyChangeFlag: false,
    camAgingTime: 300,
    position: { x: 450, y: 320 },
    ports: [
      { id: "a2-p1", name: "Gi0/1", switchId: "access-2", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 1, role: "alternate", state: "blocking", txBpduCount: 0, rxBpduCount: 0 },
      { id: "a2-p2", name: "Gi0/2", switchId: "access-2", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 2, role: "root", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
    ],
  },
];

export const HIERARCHICAL_LINKS: StpLink[] = [
  { id: "link-cr-d1", sourceSwitchId: "core-root", sourcePortId: "cr-p1", targetSwitchId: "dist-1", targetPortId: "d1-p1", speedMbps: 10000, cost: 2, enabled: true, isPtP: true },
  { id: "link-cr-d2", sourceSwitchId: "core-root", sourcePortId: "cr-p2", targetSwitchId: "dist-2", targetPortId: "d2-p1", speedMbps: 10000, cost: 2, enabled: true, isPtP: true },
  { id: "link-d1-a1", sourceSwitchId: "dist-1", sourcePortId: "d1-p2", targetSwitchId: "access-1", targetPortId: "a1-p1", speedMbps: 1000, cost: 4, enabled: true, isPtP: true },
  { id: "link-d2-a1", sourceSwitchId: "dist-2", sourcePortId: "d2-p2", targetSwitchId: "access-1", targetPortId: "a1-p2", speedMbps: 1000, cost: 4, enabled: true, isPtP: true },
  { id: "link-d1-a2", sourceSwitchId: "dist-1", sourcePortId: "d1-p3", targetSwitchId: "access-2", targetPortId: "a2-p1", speedMbps: 1000, cost: 4, enabled: true, isPtP: true },
  { id: "link-d2-a2", sourceSwitchId: "dist-2", sourcePortId: "d2-p3", targetSwitchId: "access-2", targetPortId: "a2-p2", speedMbps: 1000, cost: 4, enabled: true, isPtP: true },
];

// ─── Preset 4: 5-Switch Ring Topology ────────────────────────────────────────
export const RING_SWITCHES: StpSwitchNode[] = [
  {
    id: "r-sw1",
    name: "Ring SW-1 (Root)",
    label: "SW-1",
    bridgeId: { priority: 4096, sysIdExtension: 1, macAddress: "00:55:01:00:00:01" },
    rootBridgeId: { priority: 4096, sysIdExtension: 1, macAddress: "00:55:01:00:00:01" },
    rootPathCost: 0,
    rootPortId: null,
    isRoot: true,
    helloTimer: 2,
    maxAge: 20,
    forwardDelay: 15,
    topologyChangeFlag: false,
    camAgingTime: 300,
    position: { x: 300, y: 50 },
    ports: [
      { id: "r1-p1", name: "Gi0/1", switchId: "r-sw1", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 1, role: "designated", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
      { id: "r1-p2", name: "Gi0/2", switchId: "r-sw1", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 2, role: "designated", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
    ],
  },
  {
    id: "r-sw2",
    name: "Ring SW-2",
    label: "SW-2",
    bridgeId: { priority: 32768, sysIdExtension: 1, macAddress: "00:55:01:00:00:02" },
    rootBridgeId: { priority: 4096, sysIdExtension: 1, macAddress: "00:55:01:00:00:01" },
    rootPathCost: 4,
    rootPortId: "r2-p1",
    isRoot: false,
    helloTimer: 2,
    maxAge: 20,
    forwardDelay: 15,
    topologyChangeFlag: false,
    camAgingTime: 300,
    position: { x: 490, y: 160 },
    ports: [
      { id: "r2-p1", name: "Gi0/1", switchId: "r-sw2", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 1, role: "root", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
      { id: "r2-p2", name: "Gi0/2", switchId: "r-sw2", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 2, role: "designated", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
    ],
  },
  {
    id: "r-sw3",
    name: "Ring SW-3",
    label: "SW-3",
    bridgeId: { priority: 32768, sysIdExtension: 1, macAddress: "00:55:01:00:00:03" },
    rootBridgeId: { priority: 4096, sysIdExtension: 1, macAddress: "00:55:01:00:00:01" },
    rootPathCost: 8,
    rootPortId: "r3-p1",
    isRoot: false,
    helloTimer: 2,
    maxAge: 20,
    forwardDelay: 15,
    topologyChangeFlag: false,
    camAgingTime: 300,
    position: { x: 420, y: 330 },
    ports: [
      { id: "r3-p1", name: "Gi0/1", switchId: "r-sw3", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 1, role: "root", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
      { id: "r3-p2", name: "Gi0/2", switchId: "r-sw3", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 2, role: "alternate", state: "blocking", txBpduCount: 0, rxBpduCount: 0 },
    ],
  },
  {
    id: "r-sw4",
    name: "Ring SW-4",
    label: "SW-4",
    bridgeId: { priority: 32768, sysIdExtension: 1, macAddress: "00:55:01:00:00:04" },
    rootBridgeId: { priority: 4096, sysIdExtension: 1, macAddress: "00:55:01:00:00:01" },
    rootPathCost: 8,
    rootPortId: "r4-p2",
    isRoot: false,
    helloTimer: 2,
    maxAge: 20,
    forwardDelay: 15,
    topologyChangeFlag: false,
    camAgingTime: 300,
    position: { x: 180, y: 330 },
    ports: [
      { id: "r4-p1", name: "Gi0/1", switchId: "r-sw4", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 1, role: "designated", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
      { id: "r4-p2", name: "Gi0/2", switchId: "r-sw4", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 2, role: "root", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
    ],
  },
  {
    id: "r-sw5",
    name: "Ring SW-5",
    label: "SW-5",
    bridgeId: { priority: 32768, sysIdExtension: 1, macAddress: "00:55:01:00:00:05" },
    rootBridgeId: { priority: 4096, sysIdExtension: 1, macAddress: "00:55:01:00:00:01" },
    rootPathCost: 4,
    rootPortId: "r5-p1",
    isRoot: false,
    helloTimer: 2,
    maxAge: 20,
    forwardDelay: 15,
    topologyChangeFlag: false,
    camAgingTime: 300,
    position: { x: 110, y: 160 },
    ports: [
      { id: "r5-p1", name: "Gi0/1", switchId: "r-sw5", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 1, role: "root", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
      { id: "r5-p2", name: "Gi0/2", switchId: "r-sw5", speedMbps: 1000, cost: 4, portPriority: 128, portNumber: 2, role: "designated", state: "forwarding", txBpduCount: 0, rxBpduCount: 0 },
    ],
  },
];

export const RING_LINKS: StpLink[] = [
  { id: "rlink-1-2", sourceSwitchId: "r-sw1", sourcePortId: "r1-p1", targetSwitchId: "r-sw2", targetPortId: "r2-p1", speedMbps: 1000, cost: 4, enabled: true, isPtP: true },
  { id: "rlink-2-3", sourceSwitchId: "r-sw2", sourcePortId: "r2-p2", targetSwitchId: "r-sw3", targetPortId: "r3-p1", speedMbps: 1000, cost: 4, enabled: true, isPtP: true },
  { id: "rlink-3-4", sourceSwitchId: "r-sw3", sourcePortId: "r3-p2", targetSwitchId: "r-sw4", targetPortId: "r4-p1", speedMbps: 1000, cost: 4, enabled: true, isPtP: true },
  { id: "rlink-4-5", sourceSwitchId: "r-sw4", sourcePortId: "r4-p2", targetSwitchId: "r-sw5", targetPortId: "r5-p2", speedMbps: 1000, cost: 4, enabled: true, isPtP: true },
  { id: "rlink-5-1", sourceSwitchId: "r-sw5", sourcePortId: "r5-p1", targetSwitchId: "r-sw1", targetPortId: "r1-p2", speedMbps: 1000, cost: 4, enabled: true, isPtP: true },
];

export function getStpPresetData(preset: StpTopologyPresetId): {
  switches: StpSwitchNode[];
  links: StpLink[];
} {
  switch (preset) {
    case "diamond_core":
      return {
        switches: JSON.parse(JSON.stringify(DIAMOND_SWITCHES)),
        links: JSON.parse(JSON.stringify(DIAMOND_LINKS)),
      };
    case "hierarchical_campus":
      return {
        switches: JSON.parse(JSON.stringify(HIERARCHICAL_SWITCHES)),
        links: JSON.parse(JSON.stringify(HIERARCHICAL_LINKS)),
      };
    case "ring_network":
      return {
        switches: JSON.parse(JSON.stringify(RING_SWITCHES)),
        links: JSON.parse(JSON.stringify(RING_LINKS)),
      };
    case "triangle_loop":
    default:
      return {
        switches: JSON.parse(JSON.stringify(TRIANGLE_SWITCHES)),
        links: JSON.parse(JSON.stringify(TRIANGLE_LINKS)),
      };
  }
}

export interface StpScenarioMeta {
  id: StpScenarioId;
  name: string;
  badge: string;
  description: string;
  iconName: string;
  highlights: string[];
}

export const STP_SCENARIOS: StpScenarioMeta[] = [
  {
    id: "standard_convergence",
    name: "Classic 802.1D Convergence",
    badge: "30-50s Convergence",
    description:
      "Full IEEE 802.1D election sequence: Root Bridge election by Bridge ID, Root Port & Designated Port selection, Blocking -> Listening (15s) -> Learning (15s) -> Forwarding timer progression.",
    iconName: "Network",
    highlights: [
      "Root Bridge Election (Lowest BID wins)",
      "Root Path Cost accumulation",
      "Alternate/Blocked Port assignment to break loop",
      "Two Forward Delay timer steps (30s delay)",
    ],
  },
  {
    id: "root_link_failure",
    name: "Link Failure & TCN Recovery",
    badge: "Topology Change",
    description:
      "Simulates an active uplink cut to the Root Bridge. The blocked alternate port unblocks, an upstream TCN is transmitted to the Root, and the CAM table aging timer is reduced from 300s to 15s.",
    iconName: "AlertTriangle",
    highlights: [
      "Loss of BPDU / Physical Link Down detection",
      "Upstream TCN frame generation (0x80)",
      "Root sends TCA & TC broadcast flag",
      "CAM table age shortened to 15s to flush stale MACs",
    ],
  },
  {
    id: "rstp_rapid_convergence",
    name: "RSTP Rapid Sync (802.1w)",
    badge: "Sub-Second Sync",
    description:
      "Demonstrates IEEE 802.1w Rapid Spanning Tree Protocol (RSTP) point-to-point Proposal / Agreement handshake, bypassing legacy 30s timers for immediate millisecond convergence.",
    iconName: "Zap",
    highlights: [
      "Discarding -> Forwarding rapid handshake",
      "Proposal / Agreement bit negotiation",
      "Edge Port (PortFast) instant forwarding for hosts",
      "Alternate / Backup port fast-failover (UplinkFast)",
    ],
  },
  {
    id: "root_election_tiebreak",
    name: "Tie-Breaker Deep Dive",
    badge: "4-Level Tiebreak",
    description:
      "Visualizes the 4-step STP tie-breaking hierarchy: 1. Lowest Root Path Cost, 2. Lowest Sender Bridge ID, 3. Lowest Sender Port Priority/Number, 4. Lowest Self Port ID.",
    iconName: "HelpCircle",
    highlights: [
      "Equal Root Path Cost analysis",
      "Sender Bridge ID comparison (Priority + MAC)",
      "Sender Port ID evaluation (e.g. Gi0/1 vs Gi0/2)",
      "Deterministic path selection demonstration",
    ],
  },
  {
    id: "rogue_root_attack",
    name: "Rogue Root Bridge & Root Guard",
    badge: "Layer 2 Security",
    description:
      "A rogue switch with Bridge Priority 0 is plugged into an access port attempting to hijack the Root Bridge role. Demonstrates how Cisco/IEEE Root Guard locks the port into 'root-inconsistent' state to protect the topology.",
    iconName: "ShieldAlert",
    highlights: [
      "Rogue Switch Priority 0 superior BPDU injection",
      "Root Guard / BPDU Guard policy evaluation",
      "Port transition into Root-Inconsistent / Error-Disabled state",
      "Protection of enterprise Core spanning-tree hierarchy",
    ],
  },
];

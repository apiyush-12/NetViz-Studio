import type { TopologyDefinition } from "@/features/simulation/simulation-types";
import type { BgpRouter, BgpLink, AutonomousSystem, BgpConfig } from "./bgp.types";

// ==========================================
// 1. MULTI-HOMED TOPOLOGY (4 AS - Default)
// ==========================================
export const MULTI_HOMED_AS_LIST: AutonomousSystem[] = [
  {
    asn: 65001,
    name: "Customer Edge AS 65001",
    color: "rgba(59, 130, 246, 0.12)",
    routers: ["R1"],
    advertisedPrefixes: ["198.51.100.0/24"],
    peers: [65002, 65003],
    x: 30,
    y: 200,
    width: 140,
    height: 160,
  },
  {
    asn: 65002,
    name: "Transit ISP-A (AS 65002)",
    color: "rgba(168, 85, 247, 0.12)",
    routers: ["R2"],
    advertisedPrefixes: [],
    peers: [65001, 65004],
    x: 210,
    y: 70,
    width: 140,
    height: 160,
  },
  {
    asn: 65003,
    name: "Transit ISP-B (AS 65003)",
    color: "rgba(245, 158, 11, 0.12)",
    routers: ["R3"],
    advertisedPrefixes: [],
    peers: [65001, 65004],
    x: 210,
    y: 330,
    width: 140,
    height: 160,
  },
  {
    asn: 65004,
    name: "Content Provider AS 65004",
    color: "rgba(16, 185, 129, 0.12)",
    routers: ["R4"],
    advertisedPrefixes: ["203.0.113.0/24"],
    peers: [65002, 65003],
    x: 390,
    y: 200,
    width: 140,
    height: 160,
  },
];

export const MULTI_HOMED_BGP_ROUTERS: BgpRouter[] = [
  {
    nodeId: "R1",
    name: "Router R1",
    routerId: "1.1.1.1",
    localAsn: 65001,
    state: "Established",
    position: { x: 100, y: 280 },
    advertisedPrefixes: ["198.51.100.0/24"],
    peers: [
      {
        id: "peer-R1-R2",
        name: "Peer to R2 (AS 65002)",
        neighborIp: "192.0.2.2",
        remoteAsn: 65002,
        localAsn: 65001,
        state: "established",
        holdTime: 90,
        keepaliveInterval: 30,
        receivedPrefixes: ["203.0.113.0/24"],
        advertisedPrefixes: ["198.51.100.0/24"],
        enabled: true,
        localPreference: 200,
        med: 100,
        asPathPrependCount: 0,
      },
      {
        id: "peer-R1-R3",
        name: "Peer to R3 (AS 65003)",
        neighborIp: "192.0.2.6",
        remoteAsn: 65003,
        localAsn: 65001,
        state: "established",
        holdTime: 90,
        keepaliveInterval: 30,
        receivedPrefixes: ["203.0.113.0/24"],
        advertisedPrefixes: ["198.51.100.0/24"],
        enabled: true,
        localPreference: 100,
        med: 20,
        asPathPrependCount: 0,
      },
    ],
    bgpTable: [],
    routingTable: [],
  },
  {
    nodeId: "R2",
    name: "Router R2",
    routerId: "2.2.2.2",
    localAsn: 65002,
    state: "Established",
    position: { x: 280, y: 150 },
    advertisedPrefixes: [],
    peers: [
      {
        id: "peer-R2-R1",
        name: "Peer to R1 (AS 65001)",
        neighborIp: "192.0.2.1",
        remoteAsn: 65001,
        localAsn: 65002,
        state: "established",
        holdTime: 90,
        keepaliveInterval: 30,
        receivedPrefixes: ["198.51.100.0/24"],
        advertisedPrefixes: ["203.0.113.0/24"],
        enabled: true,
      },
      {
        id: "peer-R2-R4",
        name: "Peer to R4 (AS 65004)",
        neighborIp: "192.0.2.10",
        remoteAsn: 65004,
        localAsn: 65002,
        state: "established",
        holdTime: 90,
        keepaliveInterval: 30,
        receivedPrefixes: ["203.0.113.0/24"],
        advertisedPrefixes: [],
        enabled: true,
      },
    ],
    bgpTable: [],
    routingTable: [],
  },
  {
    nodeId: "R3",
    name: "Router R3",
    routerId: "3.3.3.3",
    localAsn: 65003,
    state: "Established",
    position: { x: 280, y: 410 },
    advertisedPrefixes: [],
    peers: [
      {
        id: "peer-R3-R1",
        name: "Peer to R1 (AS 65001)",
        neighborIp: "192.0.2.5",
        remoteAsn: 65001,
        localAsn: 65003,
        state: "established",
        holdTime: 90,
        keepaliveInterval: 30,
        receivedPrefixes: ["198.51.100.0/24"],
        advertisedPrefixes: ["203.0.113.0/24"],
        enabled: true,
      },
      {
        id: "peer-R3-R4",
        name: "Peer to R4 (AS 65004)",
        neighborIp: "192.0.2.14",
        remoteAsn: 65004,
        localAsn: 65003,
        state: "established",
        holdTime: 90,
        keepaliveInterval: 30,
        receivedPrefixes: ["203.0.113.0/24"],
        advertisedPrefixes: [],
        enabled: true,
      },
    ],
    bgpTable: [],
    routingTable: [],
  },
  {
    nodeId: "R4",
    name: "Router R4",
    routerId: "4.4.4.4",
    localAsn: 65004,
    state: "Established",
    position: { x: 460, y: 280 },
    advertisedPrefixes: ["203.0.113.0/24"],
    peers: [
      {
        id: "peer-R4-R2",
        name: "Peer to R2 (AS 65002)",
        neighborIp: "192.0.2.9",
        remoteAsn: 65002,
        localAsn: 65004,
        state: "established",
        holdTime: 90,
        keepaliveInterval: 30,
        receivedPrefixes: [],
        advertisedPrefixes: ["203.0.113.0/24"],
        enabled: true,
      },
      {
        id: "peer-R4-R3",
        name: "Peer to R3 (AS 65003)",
        neighborIp: "192.0.2.13",
        remoteAsn: 65003,
        localAsn: 65004,
        state: "established",
        holdTime: 90,
        keepaliveInterval: 30,
        receivedPrefixes: [],
        advertisedPrefixes: ["203.0.113.0/24"],
        enabled: true,
      },
    ],
    bgpTable: [],
    routingTable: [],
  },
];

export const MULTI_HOMED_BGP_LINKS: BgpLink[] = [
  { id: "link-R1-R2", sourceRouterId: "R1", targetRouterId: "R2", sourceAsn: 65001, targetAsn: 65002, sourceIp: "192.0.2.1", targetIp: "192.0.2.2", enabled: true, status: "up" },
  { id: "link-R1-R3", sourceRouterId: "R1", targetRouterId: "R3", sourceAsn: 65001, targetAsn: 65003, sourceIp: "192.0.2.5", targetIp: "192.0.2.6", enabled: true, status: "up" },
  { id: "link-R2-R4", sourceRouterId: "R2", targetRouterId: "R4", sourceAsn: 65002, targetAsn: 65004, sourceIp: "192.0.2.9", targetIp: "192.0.2.10", enabled: true, status: "up" },
  { id: "link-R3-R4", sourceRouterId: "R3", targetRouterId: "R4", sourceAsn: 65003, targetAsn: 65004, sourceIp: "192.0.2.13", targetIp: "192.0.2.14", enabled: true, status: "up" },
];

export const MULTI_HOMED_BGP_TOPOLOGY: TopologyDefinition = {
  nodes: [
    { id: "R1", type: "router", label: "R1 (AS 65001)", position: { x: 100, y: 280 }, config: { asn: 65001, routerId: "1.1.1.1" } },
    { id: "R2", type: "router", label: "R2 (AS 65002)", position: { x: 280, y: 150 }, config: { asn: 65002, routerId: "2.2.2.2" } },
    { id: "R3", type: "router", label: "R3 (AS 65003)", position: { x: 280, y: 410 }, config: { asn: 65003, routerId: "3.3.3.3" } },
    { id: "R4", type: "router", label: "R4 (AS 65004)", position: { x: 460, y: 280 }, config: { asn: 65004, routerId: "4.4.4.4", prefix: "203.0.113.0/24" } },
  ],
  edges: [
    { id: "edge-R1-R2", source: "R1", target: "R2", latency: 25, enabled: true },
    { id: "edge-R1-R3", source: "R1", target: "R3", latency: 25, enabled: true },
    { id: "edge-R2-R4", source: "R2", target: "R4", latency: 30, enabled: true },
    { id: "edge-R3-R4", source: "R3", target: "R4", latency: 30, enabled: true },
  ],
};

// ==========================================
// 2. TIER-1 TRANSIT HUB TOPOLOGY (5 AS)
// ==========================================
export const TIER1_HUB_AS_LIST: AutonomousSystem[] = [
  { asn: 65001, name: "Customer AS 65001", color: "rgba(59, 130, 246, 0.12)", routers: ["R1"], advertisedPrefixes: ["198.51.100.0/24"], peers: [65002, 65003], x: 20, y: 200, width: 120, height: 160 },
  { asn: 65002, name: "ISP-A (AS 65002)", color: "rgba(168, 85, 247, 0.12)", routers: ["R2"], advertisedPrefixes: [], peers: [65001, 65005], x: 170, y: 80, width: 120, height: 150 },
  { asn: 65003, name: "ISP-B (AS 65003)", color: "rgba(245, 158, 11, 0.12)", routers: ["R3"], advertisedPrefixes: [], peers: [65001, 65005], x: 170, y: 330, width: 120, height: 150 },
  { asn: 65005, name: "Tier-1 Hub AS 65005", color: "rgba(236, 72, 153, 0.12)", routers: ["R5"], advertisedPrefixes: [], peers: [65002, 65003, 65004], x: 320, y: 200, width: 120, height: 160 },
  { asn: 65004, name: "Destination AS 65004", color: "rgba(16, 185, 129, 0.12)", routers: ["R4"], advertisedPrefixes: ["203.0.113.0/24"], peers: [65005], x: 460, y: 200, width: 120, height: 160 },
];

export const TIER1_HUB_BGP_ROUTERS: BgpRouter[] = [
  {
    nodeId: "R1", name: "Router R1", routerId: "1.1.1.1", localAsn: 65001, state: "Established", position: { x: 80, y: 280 }, advertisedPrefixes: ["198.51.100.0/24"],
    peers: [
      { id: "peer-R1-R2", name: "Peer to R2", neighborIp: "192.0.2.2", remoteAsn: 65002, localAsn: 65001, state: "established", holdTime: 90, keepaliveInterval: 30, receivedPrefixes: ["203.0.113.0/24"], advertisedPrefixes: [], enabled: true, localPreference: 200, med: 0, asPathPrependCount: 0 },
      { id: "peer-R1-R3", name: "Peer to R3", neighborIp: "192.0.2.6", remoteAsn: 65003, localAsn: 65001, state: "established", holdTime: 90, keepaliveInterval: 30, receivedPrefixes: ["203.0.113.0/24"], advertisedPrefixes: [], enabled: true, localPreference: 100, med: 0, asPathPrependCount: 0 },
    ],
    bgpTable: [], routingTable: [],
  },
  {
    nodeId: "R2", name: "Router R2", routerId: "2.2.2.2", localAsn: 65002, state: "Established", position: { x: 230, y: 155 }, advertisedPrefixes: [],
    peers: [
      { id: "peer-R2-R1", name: "Peer to R1", neighborIp: "192.0.2.1", remoteAsn: 65001, localAsn: 65002, state: "established", holdTime: 90, keepaliveInterval: 30, receivedPrefixes: [], advertisedPrefixes: ["203.0.113.0/24"], enabled: true },
      { id: "peer-R2-R5", name: "Peer to R5", neighborIp: "192.0.2.18", remoteAsn: 65005, localAsn: 65002, state: "established", holdTime: 90, keepaliveInterval: 30, receivedPrefixes: ["203.0.113.0/24"], advertisedPrefixes: [], enabled: true },
    ],
    bgpTable: [], routingTable: [],
  },
  {
    nodeId: "R3", name: "Router R3", routerId: "3.3.3.3", localAsn: 65003, state: "Established", position: { x: 230, y: 405 }, advertisedPrefixes: [],
    peers: [
      { id: "peer-R3-R1", name: "Peer to R1", neighborIp: "192.0.2.5", remoteAsn: 65001, localAsn: 65003, state: "established", holdTime: 90, keepaliveInterval: 30, receivedPrefixes: [], advertisedPrefixes: ["203.0.113.0/24"], enabled: true },
      { id: "peer-R3-R5", name: "Peer to R5", neighborIp: "192.0.2.22", remoteAsn: 65005, localAsn: 65003, state: "established", holdTime: 90, keepaliveInterval: 30, receivedPrefixes: ["203.0.113.0/24"], advertisedPrefixes: [], enabled: true },
    ],
    bgpTable: [], routingTable: [],
  },
  {
    nodeId: "R5", name: "Tier-1 Router R5", routerId: "5.5.5.5", localAsn: 65005, state: "Established", position: { x: 380, y: 280 }, advertisedPrefixes: [],
    peers: [
      { id: "peer-R5-R2", name: "Peer to R2", neighborIp: "192.0.2.17", remoteAsn: 65002, localAsn: 65005, state: "established", holdTime: 90, keepaliveInterval: 30, receivedPrefixes: [], advertisedPrefixes: ["203.0.113.0/24"], enabled: true },
      { id: "peer-R5-R3", name: "Peer to R3", neighborIp: "192.0.2.21", remoteAsn: 65003, localAsn: 65005, state: "established", holdTime: 90, keepaliveInterval: 30, receivedPrefixes: [], advertisedPrefixes: ["203.0.113.0/24"], enabled: true },
      { id: "peer-R5-R4", name: "Peer to R4", neighborIp: "192.0.2.26", remoteAsn: 65004, localAsn: 65005, state: "established", holdTime: 90, keepaliveInterval: 30, receivedPrefixes: ["203.0.113.0/24"], advertisedPrefixes: [], enabled: true },
    ],
    bgpTable: [], routingTable: [],
  },
  {
    nodeId: "R4", name: "Origin Router R4", routerId: "4.4.4.4", localAsn: 65004, state: "Established", position: { x: 520, y: 280 }, advertisedPrefixes: ["203.0.113.0/24"],
    peers: [
      { id: "peer-R4-R5", name: "Peer to R5", neighborIp: "192.0.2.25", remoteAsn: 65005, localAsn: 65004, state: "established", holdTime: 90, keepaliveInterval: 30, receivedPrefixes: [], advertisedPrefixes: ["203.0.113.0/24"], enabled: true },
    ],
    bgpTable: [], routingTable: [],
  },
];

export const TIER1_HUB_BGP_LINKS: BgpLink[] = [
  { id: "link-R1-R2", sourceRouterId: "R1", targetRouterId: "R2", sourceAsn: 65001, targetAsn: 65002, sourceIp: "192.0.2.1", targetIp: "192.0.2.2", enabled: true, status: "up" },
  { id: "link-R1-R3", sourceRouterId: "R1", targetRouterId: "R3", sourceAsn: 65001, targetAsn: 65003, sourceIp: "192.0.2.5", targetIp: "192.0.2.6", enabled: true, status: "up" },
  { id: "link-R2-R5", sourceRouterId: "R2", targetRouterId: "R5", sourceAsn: 65002, targetAsn: 65005, sourceIp: "192.0.2.17", targetIp: "192.0.2.18", enabled: true, status: "up" },
  { id: "link-R3-R5", sourceRouterId: "R3", targetRouterId: "R5", sourceAsn: 65003, targetAsn: 65005, sourceIp: "192.0.2.21", targetIp: "192.0.2.22", enabled: true, status: "up" },
  { id: "link-R5-R4", sourceRouterId: "R5", targetRouterId: "R4", sourceAsn: 65005, targetAsn: 65004, sourceIp: "192.0.2.25", targetIp: "192.0.2.26", enabled: true, status: "up" },
];

export const TIER1_HUB_BGP_TOPOLOGY: TopologyDefinition = {
  nodes: TIER1_HUB_BGP_ROUTERS.map((r) => ({
    id: r.nodeId, type: "router", label: `${r.nodeId} (AS ${r.localAsn})`, position: r.position, config: { asn: r.localAsn, routerId: r.routerId },
  })),
  edges: TIER1_HUB_BGP_LINKS.map((l) => ({
    id: `edge-${l.id}`, source: l.sourceRouterId, target: l.targetRouterId, latency: 25, enabled: l.enabled,
  })),
};

// ==========================================
// 3. AS TRIANGLE PEERING (3 AS)
// ==========================================
export const TRIANGLE_AS_LIST: AutonomousSystem[] = [
  { asn: 100, name: "Origin AS 100", color: "rgba(59, 130, 246, 0.12)", routers: ["R1"], advertisedPrefixes: ["198.51.100.0/24"], peers: [200, 300], x: 80, y: 100, width: 140, height: 160 },
  { asn: 200, name: "Transit AS 200", color: "rgba(168, 85, 247, 0.12)", routers: ["R2"], advertisedPrefixes: [], peers: [100, 300], x: 340, y: 100, width: 140, height: 160 },
  { asn: 300, name: "Peer AS 300", color: "rgba(16, 185, 129, 0.12)", routers: ["R3"], advertisedPrefixes: ["203.0.113.0/24"], peers: [100, 200], x: 210, y: 340, width: 140, height: 160 },
];

export const TRIANGLE_BGP_ROUTERS: BgpRouter[] = [
  {
    nodeId: "R1", name: "Router R1", routerId: "1.1.1.1", localAsn: 100, state: "Established", position: { x: 150, y: 180 }, advertisedPrefixes: ["198.51.100.0/24"],
    peers: [
      { id: "peer-R1-R3", name: "Direct Peering R3 (AS 300)", neighborIp: "192.0.2.2", remoteAsn: 300, localAsn: 100, state: "established", holdTime: 90, keepaliveInterval: 30, receivedPrefixes: ["203.0.113.0/24"], advertisedPrefixes: [], enabled: true, localPreference: 200, med: 0, asPathPrependCount: 0 },
      { id: "peer-R1-R2", name: "Transit Provider R2 (AS 200)", neighborIp: "192.0.2.6", remoteAsn: 200, localAsn: 100, state: "established", holdTime: 90, keepaliveInterval: 30, receivedPrefixes: ["203.0.113.0/24"], advertisedPrefixes: [], enabled: true, localPreference: 100, med: 0, asPathPrependCount: 0 },
    ],
    bgpTable: [], routingTable: [],
  },
  {
    nodeId: "R2", name: "Router R2", routerId: "2.2.2.2", localAsn: 200, state: "Established", position: { x: 410, y: 180 }, advertisedPrefixes: [],
    peers: [
      { id: "peer-R2-R1", name: "Peer to R1", neighborIp: "192.0.2.5", remoteAsn: 100, localAsn: 200, state: "established", holdTime: 90, keepaliveInterval: 30, receivedPrefixes: [], advertisedPrefixes: ["203.0.113.0/24"], enabled: true },
      { id: "peer-R2-R3", name: "Peer to R3", neighborIp: "192.0.2.10", remoteAsn: 300, localAsn: 200, state: "established", holdTime: 90, keepaliveInterval: 30, receivedPrefixes: ["203.0.113.0/24"], advertisedPrefixes: [], enabled: true },
    ],
    bgpTable: [], routingTable: [],
  },
  {
    nodeId: "R3", name: "Router R3", routerId: "3.3.3.3", localAsn: 300, state: "Established", position: { x: 280, y: 420 }, advertisedPrefixes: ["203.0.113.0/24"],
    peers: [
      { id: "peer-R3-R1", name: "Peer to R1", neighborIp: "192.0.2.1", remoteAsn: 100, localAsn: 300, state: "established", holdTime: 90, keepaliveInterval: 30, receivedPrefixes: [], advertisedPrefixes: ["203.0.113.0/24"], enabled: true },
      { id: "peer-R3-R2", name: "Peer to R2", neighborIp: "192.0.2.9", remoteAsn: 200, localAsn: 300, state: "established", holdTime: 90, keepaliveInterval: 30, receivedPrefixes: [], advertisedPrefixes: ["203.0.113.0/24"], enabled: true },
    ],
    bgpTable: [], routingTable: [],
  },
];

export const TRIANGLE_BGP_LINKS: BgpLink[] = [
  { id: "link-R1-R3", sourceRouterId: "R1", targetRouterId: "R3", sourceAsn: 100, targetAsn: 300, sourceIp: "192.0.2.1", targetIp: "192.0.2.2", enabled: true, status: "up" },
  { id: "link-R1-R2", sourceRouterId: "R1", targetRouterId: "R2", sourceAsn: 100, targetAsn: 200, sourceIp: "192.0.2.5", targetIp: "192.0.2.6", enabled: true, status: "up" },
  { id: "link-R2-R3", sourceRouterId: "R2", targetRouterId: "R3", sourceAsn: 200, targetAsn: 300, sourceIp: "192.0.2.9", targetIp: "192.0.2.10", enabled: true, status: "up" },
];

export const TRIANGLE_BGP_TOPOLOGY: TopologyDefinition = {
  nodes: TRIANGLE_BGP_ROUTERS.map((r) => ({
    id: r.nodeId, type: "router", label: `${r.nodeId} (AS ${r.localAsn})`, position: r.position, config: { asn: r.localAsn, routerId: r.routerId },
  })),
  edges: TRIANGLE_BGP_LINKS.map((l) => ({
    id: `edge-${l.id}`, source: l.sourceRouterId, target: l.targetRouterId, latency: 20, enabled: l.enabled,
  })),
};

// ==========================================
// 4. iBGP + eBGP HYBRID (Internal Mesh)
// ==========================================
export const IBGP_EBGP_AS_LIST: AutonomousSystem[] = [
  { asn: 65001, name: "Enterprise Domain (iBGP AS 65001)", color: "rgba(59, 130, 246, 0.12)", routers: ["R1A", "R1B"], advertisedPrefixes: ["198.51.100.0/24"], peers: [65002], x: 60, y: 140, width: 220, height: 280 },
  { asn: 65002, name: "Partner AS 65002 (eBGP)", color: "rgba(16, 185, 129, 0.12)", routers: ["R2"], advertisedPrefixes: ["203.0.113.0/24"], peers: [65001], x: 340, y: 140, width: 160, height: 280 },
];

export const IBGP_EBGP_ROUTERS: BgpRouter[] = [
  {
    nodeId: "R1A", name: "Internal Speaker R1A", routerId: "1.1.1.1", localAsn: 65001, state: "Established", position: { x: 130, y: 220 }, advertisedPrefixes: ["198.51.100.0/24"],
    peers: [
      { id: "peer-R1A-R1B", name: "iBGP Peer R1B", neighborIp: "10.0.0.2", remoteAsn: 65001, localAsn: 65001, state: "established", holdTime: 90, keepaliveInterval: 30, receivedPrefixes: ["203.0.113.0/24"], advertisedPrefixes: [], enabled: true, localPreference: 100, med: 0, asPathPrependCount: 0 },
    ],
    bgpTable: [], routingTable: [],
  },
  {
    nodeId: "R1B", name: "Border Router R1B", routerId: "1.1.1.2", localAsn: 65001, state: "Established", position: { x: 220, y: 340 }, advertisedPrefixes: [],
    peers: [
      { id: "peer-R1B-R1A", name: "iBGP Peer R1A", neighborIp: "10.0.0.1", remoteAsn: 65001, localAsn: 65001, state: "established", holdTime: 90, keepaliveInterval: 30, receivedPrefixes: [], advertisedPrefixes: ["203.0.113.0/24"], enabled: true, localPreference: 100, med: 0, asPathPrependCount: 0 },
      { id: "peer-R1B-R2", name: "eBGP Peer R2 (AS 65002)", neighborIp: "192.0.2.2", remoteAsn: 65002, localAsn: 65001, state: "established", holdTime: 90, keepaliveInterval: 30, receivedPrefixes: ["203.0.113.0/24"], advertisedPrefixes: [], enabled: true, localPreference: 200, med: 0, asPathPrependCount: 0 },
    ],
    bgpTable: [], routingTable: [],
  },
  {
    nodeId: "R2", name: "Border Router R2", routerId: "2.2.2.2", localAsn: 65002, state: "Established", position: { x: 420, y: 280 }, advertisedPrefixes: ["203.0.113.0/24"],
    peers: [
      { id: "peer-R2-R1B", name: "eBGP Peer R1B", neighborIp: "192.0.2.1", remoteAsn: 65001, localAsn: 65002, state: "established", holdTime: 90, keepaliveInterval: 30, receivedPrefixes: [], advertisedPrefixes: ["203.0.113.0/24"], enabled: true },
    ],
    bgpTable: [], routingTable: [],
  },
];

export const IBGP_EBGP_LINKS: BgpLink[] = [
  { id: "link-R1A-R1B", sourceRouterId: "R1A", targetRouterId: "R1B", sourceAsn: 65001, targetAsn: 65001, sourceIp: "10.0.0.1", targetIp: "10.0.0.2", enabled: true, status: "up" },
  { id: "link-R1B-R2", sourceRouterId: "R1B", targetRouterId: "R2", sourceAsn: 65001, targetAsn: 65002, sourceIp: "192.0.2.1", targetIp: "192.0.2.2", enabled: true, status: "up" },
];

export const IBGP_EBGP_TOPOLOGY: TopologyDefinition = {
  nodes: IBGP_EBGP_ROUTERS.map((r) => ({
    id: r.nodeId, type: "router", label: `${r.nodeId} (AS ${r.localAsn})`, position: r.position, config: { asn: r.localAsn, routerId: r.routerId },
  })),
  edges: IBGP_EBGP_LINKS.map((l) => ({
    id: `edge-${l.id}`, source: l.sourceRouterId, target: l.targetRouterId, latency: 15, enabled: l.enabled,
  })),
};

// Aliases for default exports
export const DEFAULT_AUTONOMOUS_SYSTEMS = MULTI_HOMED_AS_LIST;
export const DEFAULT_BGP_ROUTERS = MULTI_HOMED_BGP_ROUTERS;
export const DEFAULT_BGP_LINKS = MULTI_HOMED_BGP_LINKS;
export const DEFAULT_BGP_TOPOLOGY = MULTI_HOMED_BGP_TOPOLOGY;

export function getBgpPresetData(preset: string = "multi-homed"): {
  routers: BgpRouter[];
  links: BgpLink[];
  autonomousSystems: AutonomousSystem[];
  topology: TopologyDefinition;
} {
  switch (preset) {
    case "tier1-hub":
      return {
        routers: JSON.parse(JSON.stringify(TIER1_HUB_BGP_ROUTERS)),
        links: JSON.parse(JSON.stringify(TIER1_HUB_BGP_LINKS)),
        autonomousSystems: JSON.parse(JSON.stringify(TIER1_HUB_AS_LIST)),
        topology: TIER1_HUB_BGP_TOPOLOGY,
      };
    case "triangle":
      return {
        routers: JSON.parse(JSON.stringify(TRIANGLE_BGP_ROUTERS)),
        links: JSON.parse(JSON.stringify(TRIANGLE_BGP_LINKS)),
        autonomousSystems: JSON.parse(JSON.stringify(TRIANGLE_AS_LIST)),
        topology: TRIANGLE_BGP_TOPOLOGY,
      };
    case "ibgp-ebgp":
      return {
        routers: JSON.parse(JSON.stringify(IBGP_EBGP_ROUTERS)),
        links: JSON.parse(JSON.stringify(IBGP_EBGP_LINKS)),
        autonomousSystems: JSON.parse(JSON.stringify(IBGP_EBGP_AS_LIST)),
        topology: IBGP_EBGP_TOPOLOGY,
      };
    case "multi-homed":
    default:
      return {
        routers: JSON.parse(JSON.stringify(MULTI_HOMED_BGP_ROUTERS)),
        links: JSON.parse(JSON.stringify(MULTI_HOMED_BGP_LINKS)),
        autonomousSystems: JSON.parse(JSON.stringify(MULTI_HOMED_AS_LIST)),
        topology: MULTI_HOMED_BGP_TOPOLOGY,
      };
  }
}

export const defaultBgpConfig: BgpConfig = {
  topologyPreset: "multi-homed",
  routers: [],
  links: [],
  labelMode: "simple",
  failureScenario: "none",
};

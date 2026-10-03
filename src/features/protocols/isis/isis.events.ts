/**
 * IS-IS (Intermediate System to Intermediate System - ISO/IEC 10589 / RFC 1195 / RFC 5308)
 * Discrete-Event Simulation Sequence & Scenario Step Generator
 */

import type {
  IsisConfig,
  IsisNode,
  IsisLink,
  IsisSimulationStepState,
  IsisSimulationOutcome,
  IsisPduData,
} from "./isis.types";
import {
  TOPOLOGY_PRESETS,
  defaultIsisConfig,
} from "./isis.defaults";
import {
  createIsisLspPdu,
  createIsisHelloPdu,
  createIsisCsnpPdu,
} from "./isis-engine";

/**
 * Generate full simulation steps based on the selected IS-IS scenario and configuration.
 */
export function generateIsisSimulationSteps(
  config: IsisConfig = defaultIsisConfig
): IsisSimulationOutcome {
  const preset = TOPOLOGY_PRESETS[config.topologyPreset] || TOPOLOGY_PRESETS.multi_area_hierarchy;
  const initialNodes: IsisNode[] = JSON.parse(JSON.stringify(preset.nodes));
  const initialLinks: IsisLink[] = JSON.parse(JSON.stringify(preset.links));

  switch (config.scenarioId) {
    case "multi_area_hierarchy":
      return buildMultiAreaHierarchyScenario(config, initialNodes, initialLinks);

    case "attached_bit_default_route":
      return buildAttachedBitScenario(config, initialNodes, initialLinks);

    case "dis_pseudonode_election":
      return buildDisElectionScenario(config, initialNodes, initialLinks);

    case "route_leaking_up_down":
      return buildRouteLeakingScenario(config, initialNodes, initialLinks);

    case "dual_stack_ipv4_ipv6":
      return buildDualStackScenario(config, initialNodes, initialLinks);

    case "overload_bit_maintenance":
      return buildOverloadBitScenario(config, initialNodes, initialLinks);

    default:
      return buildMultiAreaHierarchyScenario(config, initialNodes, initialLinks);
  }
}

// -----------------------------------------------------------------------------
// Scenario 1: Multi-Area 2-Level Hierarchy
// -----------------------------------------------------------------------------
function buildMultiAreaHierarchyScenario(
  _config: IsisConfig,
  nodes: IsisNode[],
  links: IsisLink[]
): IsisSimulationOutcome {
  const steps: IsisSimulationStepState[] = [];
  const currentNodes: IsisNode[] = JSON.parse(JSON.stringify(nodes));
  const currentLinks: IsisLink[] = JSON.parse(JSON.stringify(links));

  // Step 0: Boot & NET Address Initialization
  steps.push({
    stepIndex: 0,
    title: "Step 0: Boot & OSI NET Addressing Configuration",
    description:
      "All routers initialized with OSI Network Entity Titles (NETs). Area 49.0001 (Sales L1), Area 49.0002 (Backbone L2), and Area 49.0003 (Engineering L1).",
    phase: "init",
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "R1# show isis net", type: "command" },
      { text: "  NET: 49.0001.0000.0000.0001.00 (Area: 49.0001, System ID: 0000.0000.0001, NSEL: 00)", type: "info" },
      { text: "R2# show isis net", type: "command" },
      { text: "  NET: 49.0001.0000.0000.0002.00 (Border L1/L2 Router)", type: "info" },
      { text: "R3# show isis net", type: "command" },
      { text: "  NET: 49.0002.0000.0000.0003.00 (Backbone L2 Router)", type: "info" },
    ],
    eventExplanation: {
      beginner:
        "Routers are booted with OSI addresses called NETs. The area number (e.g. 49.0001) identifies the local region, while the System ID identifies the individual router.",
      advanced:
        "OSI Network Entity Title (NET) parsing: 1-13 byte Area ID + 6-byte System ID + 1-byte N-Selector (0x00). Integrated IS-IS runs directly on Layer 2 (SAP 0xFEFE).",
      protocolRule: "ISO/IEC 10589: All routers within a Level 1 area must share the same Area ID. Level 2 routers form a contiguous backbone.",
      fieldsChanged: ["NETs Configured: 49.0001 / 49.0002 / 49.0003", "Protocols: IS-IS Process Active"],
    },
  });

  // Step 1: IIH Hello Adjacency Formation
  const p2pHello: IsisPduData = createIsisHelloPdu({
    circuitType: "p2p",
    level: "L1",
    sourceSystemId: "0000.0000.0001",
    sourceHostname: "R1",
    areaId: "49.0001",
    neighborSystemId: "0000.0000.0002",
  });

  steps.push({
    stepIndex: 1,
    title: "Step 1: IIH Hellos & 3-Way Adjacency Formation",
    description:
      "R1 and R2 exchange Point-to-Point IIH Hellos over Gi0/1. Adjacency reaches the 'Up' state for Level 1.",
    phase: "hello_adj",
    activeNodeId: "r1",
    activeLinkIds: ["link-r1-r2"],
    activePdu: p2pHello,
    senderId: "r1",
    receiverIds: ["r2"],
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "R1# debug isis adj-packets", type: "command" },
      { text: "ISIS-Adj: Sending P2P IIH on GigabitEthernet0/1, length 40", type: "info" },
      { text: "ISIS-Adj: Received P2P IIH from R2 (0000.0000.0002) on Gi0/1", type: "success" },
      { text: "ISIS-Adj: %IS-IS-5-ADJCHANGE: Neighbor 0000.0000.0002 (R2) on Gi0/1 Up (3-Way)", type: "success" },
    ],
    eventExplanation: {
      beginner:
        "Routers say hello to each other across the link and agree to become trusted neighbors.",
      advanced:
        "RFC 5303 3-Way Handshake: P2P IIH exchanges Point-to-Point Adjacency State Option (TLV 240) transitioning from Down -> Initializing -> Up.",
      protocolRule: "ISO/IEC 10589 §8.2: Level 1 adjacencies require matching Area IDs; Level 2 can connect different Area IDs.",
      fieldsChanged: ["Adjacency: R1 <-> R2 UP", "Holding Timer: 30s armed"],
    },
  });

  // Step 2: Level 1 LSP Flooding in Area 49.0001
  const r1Lsp = createIsisLspPdu({
    level: "L1",
    sourceSystemId: "0000.0000.0001",
    sourceHostname: "R1",
    sequenceNumber: 2,
    tlvs: [
      { type: 1, length: 3, name: "Area Addresses", data: { area: "49.0001" } },
      { type: 137, length: 2, name: "Dynamic Hostname", data: { hostname: "R1" } },
      { type: 135, length: 11, name: "Extended IP Reachability", data: { prefix: "192.168.1.0/24", metric: 10 } },
    ],
  });

  steps.push({
    stepIndex: 2,
    title: "Step 2: Level 1 Link State PDU (L1 LSP) Flooding",
    description:
      "R1 floods its Level 1 LSP (0000.0000.0001.00-00) to R2, advertising reachability to local subnet 192.168.1.0/24 (TLV 135).",
    phase: "lsp_flooding",
    activeNodeId: "r1",
    activeLinkIds: ["link-r1-r2"],
    activePdu: r1Lsp,
    senderId: "r1",
    receiverIds: ["r2"],
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "R1# debug isis update-packets", type: "command" },
      { text: "ISIS-Update: Sending L1 LSP 0000.0000.0001.00-00, seq 0x00000002, ht 1198 on Gi0/1", type: "info" },
      { text: "R2# ISIS-Update: Received L1 LSP 0000.0000.0001.00-00 on Gi0/1 (Checksum valid: 0x4A1E)", type: "success" },
      { text: "R2# %RTM-5-RTADD: Installed i L1 192.168.1.0/24 [115/20] via 10.0.1.1", type: "success" },
    ],
    eventExplanation: {
      beginner:
        "Router 1 creates a list of its connected roads and sends it to Router 2. Router 2 adds it to its local regional map.",
      advanced:
        "L1 LSP transmission with Extended IP Reachability (TLV 135). R2 verifies the 16-bit Fletcher checksum, updates its Level 1 LSDB, and sends a PSNP acknowledgment.",
      protocolRule: "ISO/IEC 10589 §7.3.15: Level 1 LSPs are never forwarded outside the local Area.",
      fieldsChanged: ["R2 L1 LSDB: + 0000.0000.0001.00-00", "R2 RIB: + 192.168.1.0/24 [115/20]"],
    },
  });

  // Step 3: Level 2 Backbone LSP Flooding (R2 <-> R3 <-> R4)
  const r2L2Lsp = createIsisLspPdu({
    level: "L2",
    sourceSystemId: "0000.0000.0002",
    sourceHostname: "R2",
    sequenceNumber: 3,
    tlvs: [
      { type: 1, length: 3, name: "Area Addresses", data: { area: "49.0001" } },
      { type: 137, length: 2, name: "Dynamic Hostname", data: { hostname: "R2" } },
      { type: 135, length: 11, name: "Extended IP Reachability", data: { prefix: "10.0.1.0/24", metric: 10 } },
      { type: 135, length: 11, name: "Extended IP Reachability", data: { prefix: "192.168.1.0/24", metric: 20 } },
    ],
  });

  steps.push({
    stepIndex: 3,
    title: "Step 3: Level 2 Backbone LSP Flooding Across Areas",
    description:
      "R2 propagates Level 2 LSPs across the backbone to R3 and R4, announcing inter-area reachability across Area 49.0001 and Area 49.0002.",
    phase: "lsp_flooding",
    activeNodeId: "r2",
    activeLinkIds: ["link-r2-r3"],
    activePdu: r2L2Lsp,
    senderId: "r2",
    receiverIds: ["r3"],
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "R2# ISIS-Update: Sending L2 LSP 0000.0000.0002.00-00, seq 0x00000003 on Gi0/2", type: "info" },
      { text: "R3# ISIS-Update: Received L2 LSP from R2 on Gi0/2 (Area 49.0001 reachability)", type: "success" },
      { text: "R4# %RTM-5-RTADD: Installed i L2 192.168.1.0/24 [115/30] via 10.0.3.1 (R3)", type: "success" },
    ],
    eventExplanation: {
      beginner:
        "The border router takes the road information from Area 1 and shares it across the Level 2 highway with the other border routers.",
      advanced:
        "L1-to-L2 inter-area route synthesis: R2 aggregates Area 49.0001 internal reachability into its transmitted Level 2 LSP. R3 and R4 update their Level 2 LSDBs.",
      protocolRule: "ISO/IEC 10589: Level 1 routes are injected into Level 2 by default on L1/L2 border nodes.",
      fieldsChanged: ["L2 Backbone LSDB: Synchronized", "R4 RIB: + 192.168.1.0/24 [115/30] via L2"],
    },
  });

  // Step 4: Multi-Area Full Convergence
  const r1Node = currentNodes.find((n) => n.id === "r1")!;
  r1Node.routingTable.push({
    prefix: "0.0.0.0/0",
    level: "i L1",
    nextHop: "10.0.1.2",
    interfaceName: "Gi0/1",
    metric: 10,
    adminDistance: 115,
    isDefault: true,
  });

  const r5Node = currentNodes.find((n) => n.id === "r5")!;
  r5Node.routingTable.push({
    prefix: "0.0.0.0/0",
    level: "i L1",
    nextHop: "10.0.4.1",
    interfaceName: "Gi0/4",
    metric: 10,
    adminDistance: 115,
    isDefault: true,
  });

  steps.push({
    stepIndex: 4,
    title: "Step 4: Multi-Area IS-IS Convergence Complete",
    description:
      "All routers have fully converged. L1 routers use dynamic default routes (`0.0.0.0/0`) via nearest L1/L2 border routers to reach foreign areas with optimal forwarding.",
    phase: "converged",
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "R1# show ip route isis", type: "command" },
      { text: "i L1 0.0.0.0/0 [115/10] via 10.0.1.2, 00:00:15, GigabitEthernet0/1", type: "success" },
      { text: "R1# ping 192.168.5.1", type: "command" },
      { text: "Sending 5, 100-byte ICMP Echos to 192.168.5.1, timeout is 2 seconds:", type: "info" },
      { text: "!!!!!", type: "success" },
      { text: "Success rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms", type: "success" },
    ],
    eventExplanation: {
      beginner:
        "Full convergence! Regional routers talk within their area, and whenever they want to send something far away, they smoothly pass it to the border routers.",
      advanced:
        "Hierarchical Link-State convergence complete: L1 SPF computes local Area shortest paths; L2 SPF computes backbone shortest paths; border default routing provides inter-area transit.",
      protocolRule: "ISO/IEC 10589: L1 routers isolate local area churn from the L2 backbone.",
      fieldsChanged: ["Status: CONVERGED", "L1 Default Route: ACTIVE", "Packet Loss: 0%"],
    },
  });

  return {
    steps,
    finalNodes: currentNodes,
    finalLinks: currentLinks,
    l1ConvergenceTimeMs: 12,
    l2ConvergenceTimeMs: 18,
  };
}

// -----------------------------------------------------------------------------
// Scenario 2: Attached Bit (ATT=1) Default Routing
// -----------------------------------------------------------------------------
function buildAttachedBitScenario(
  config: IsisConfig,
  nodes: IsisNode[],
  links: IsisLink[]
): IsisSimulationOutcome {
  const conv = buildMultiAreaHierarchyScenario(config, nodes, links);
  const steps: IsisSimulationStepState[] = [];
  const currentNodes = JSON.parse(JSON.stringify(conv.finalNodes));
  const currentLinks = JSON.parse(JSON.stringify(conv.finalLinks));

  // Step 0: Border router L1 LSP with ATT=1
  const r2AttLsp = createIsisLspPdu({
    level: "L1",
    sourceSystemId: "0000.0000.0002",
    sourceHostname: "R2",
    sequenceNumber: 5,
    flags: { attached: true, isType: "L1_L2" },
    tlvs: [
      { type: 1, length: 3, name: "Area Addresses", data: { area: "49.0001" } },
      { type: 137, length: 2, name: "Dynamic Hostname", data: { hostname: "R2" } },
      { type: 135, length: 11, name: "Extended IP Reachability", data: { prefix: "10.0.1.0/24", metric: 10 } },
    ],
  });

  steps.push({
    stepIndex: 0,
    title: "Step 0: L1/L2 Router R2 Floods L1 LSP with ATT=1",
    description:
      "Because R2 has active Level 2 adjacencies in Area 49.0002, it sets the Attached Bit (ATT=1) in its transmitted Level 1 LSP.",
    phase: "lsp_flooding",
    activeNodeId: "r2",
    activeLinkIds: ["link-r1-r2"],
    activePdu: r2AttLsp,
    senderId: "r2",
    receiverIds: ["r1"],
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "R2# show isis database detail 0000.0000.0002.00-00", type: "command" },
      { text: "LSPID                 LSP Seq Num  LSP Checksum  LSP Holdtime  ATT/P/OL", type: "info" },
      { text: "0000.0000.0002.00-00* 0x00000005   0x6E21        1195          1/0/0", type: "success" },
      { text: "  Area Address: 49.0001", type: "info" },
      { text: "  Hostname: R2", type: "info" },
      { text: "  Metric: 10         IP 10.0.1.0/24", type: "info" },
    ],
    eventExplanation: {
      beginner:
        "The border router R2 raises a flag called the 'Attached Bit' (ATT=1). This informs all local routers that R2 has an open bridge to other areas.",
      advanced:
        "ISO/IEC 10589 §7.2.9.2: An L1/L2 router sets the Attached (ATT) flag in its Level 1 LSP when it is attached to the Level 2 backbone in a distinct Area.",
      protocolRule: "ISO/IEC 10589: ATT=1 tells L1 routers that this node can be used as an exit gateway for inter-area traffic.",
      fieldsChanged: ["LSP Flags: ATT=1 (0x08)", "L1 Flooding: Gi0/1"],
    },
  });

  // Step 1: L1 router R1 computes default route
  steps.push({
    stepIndex: 1,
    title: "Step 1: R1 Detects ATT=1 & Automatically Installs Default Route",
    description:
      "R1 receives the L1 LSP with ATT=1 and installs a dynamic default route `0.0.0.0/0 [115/10] via 10.0.1.2 (R2)` into its routing table.",
    phase: "converged",
    activeNodeId: "r1",
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "R1# show ip route isis", type: "command" },
      { text: "i L1 0.0.0.0/0 [115/10] via 10.0.1.2, 00:00:08, GigabitEthernet0/1", type: "success" },
      { text: "R1# traceroute 192.168.5.1", type: "command" },
      { text: "Type escape sequence to abort.", type: "info" },
      { text: "Tracing the route to 192.168.5.1", type: "info" },
      { text: "  1 10.0.1.2 (R2 Border) [ATT Gateway] 1 msec", type: "success" },
      { text: "  2 10.0.2.2 (R3 Backbone) 2 msec", type: "success" },
      { text: "  3 10.0.3.2 (R4 Border) 2 msec", type: "success" },
      { text: "  4 192.168.5.1 (R5 Target) 3 msec", type: "success" },
    ],
    eventExplanation: {
      beginner:
        "Router 1 sees the flag and immediately creates a default gateway pointing to R2. Any packet meant for an unknown outside network goes directly to R2.",
      advanced:
        "L1 SPF calculates the shortest path to all L1/L2 routers with ATT=1 and installs `0.0.0.0/0` into the FIB pointing to the lowest metric exit point.",
      protocolRule: "ISO/IEC 10589: Eliminates the need to inject thousands of external routes into resource-constrained Level 1 routers.",
      fieldsChanged: ["R1 FIB: 0.0.0.0/0 -> R2", "Suboptimal Detours: Avoided"],
    },
  });

  return {
    steps,
    finalNodes: currentNodes,
    finalLinks: currentLinks,
    l1ConvergenceTimeMs: 8,
    l2ConvergenceTimeMs: 14,
  };
}

// -----------------------------------------------------------------------------
// Scenario 3: DIS Election & LAN Pseudonode LSP
// -----------------------------------------------------------------------------
function buildDisElectionScenario(
  _config: IsisConfig,
  nodes: IsisNode[],
  links: IsisLink[]
): IsisSimulationOutcome {
  const steps: IsisSimulationStepState[] = [];
  const currentNodes: IsisNode[] = JSON.parse(JSON.stringify(nodes));
  const currentLinks: IsisLink[] = JSON.parse(JSON.stringify(links));

  // R2 gets Priority 100 to win election
  const r2 = currentNodes.find((n) => n.id === "r2")!;
  r2.interfaces[0].disPriority = 100;
  r2.interfaces[0].isDis = true;

  // Step 0: Broadcast LAN Interface Configuration
  steps.push({
    stepIndex: 0,
    title: "Step 0: Shared Multi-Access Ethernet LAN (Broadcast Media)",
    description:
      "R1 (Priority 64), R2 (Priority 100), and R3 (Priority 64) are connected to a common broadcast Ethernet switch.",
    phase: "init",
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "R1# show isis interface GigabitEthernet0/1", type: "command" },
      { text: "  Circuit Type: Broadcast (LAN), Level 1, DIS Priority: 64", type: "info" },
      { text: "R2# show isis interface GigabitEthernet0/1", type: "command" },
      { text: "  Circuit Type: Broadcast (LAN), Level 1, DIS Priority: 100 (Configured high)", type: "info" },
    ],
    eventExplanation: {
      beginner:
        "Three routers are plugged into the same network switch. To avoid talking in redundant pairs, they need to elect a leader called the DIS.",
      advanced:
        "Broadcast Multi-Access Circuit configuration: Routers multicast LAN IIH PDUs to All-L1-IS MAC address `01-80-C2-00-00-14` carrying Priority and SNPA (MAC).",
      protocolRule: "ISO/IEC 10589 §7.2.3: DIS is elected based on highest priority (0-127), breaking ties with highest MAC.",
      fieldsChanged: ["Circuit: Broadcast", "R2 Priority: 100", "R1/R3 Priority: 64"],
    },
  });

  // Step 1: DIS Election (R2 Wins)
  steps.push({
    stepIndex: 1,
    title: "Step 1: DIS Elected — Router R2 Wins with Priority 100",
    description:
      "R2 evaluates LAN IIHs and wins DIS election with Priority 100. Unlike OSPF, IS-IS has NO Backup DIS (BDIS) and the election is pre-emptible.",
    phase: "dis_elect",
    activeNodeId: "r2",
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "R2# %IS-IS-5-DISCHANGE: Interface Gi0/1 elected as Level 1 DIS (Priority 100)", type: "success" },
      { text: "R1# show isis neighbors", type: "command" },
      { text: "System Id      Type Interface   IP Address      State Holdtime Circuit Id", type: "info" },
      { text: "0000.0000.0002 L1   Gi0/1       10.0.1.2        Up    27       0000.0000.0002.01 [DIS]", type: "success" },
    ],
    eventExplanation: {
      beginner:
        "Router 2 is elected as the DIS leader because its priority score is 100 (higher than 64).",
      advanced:
        "Deterministic DIS election: IS-IS does not establish adjacency meshes between non-DIS routers; all routers form full adjacencies with the DIS and each other on broadcast LANs.",
      protocolRule: "ISO/IEC 10589: IS-IS election is pre-emptible; if a higher priority router joins, it immediately assumes the DIS role.",
      fieldsChanged: ["DIS Role: R2 (0000.0000.0002)", "Circuit ID: 0000.0000.0002.01"],
    },
  });

  // Step 2: Pseudonode LSP & Periodic CSNPs
  const csnpPdu = createIsisCsnpPdu({
    level: "L1",
    sourceSystemId: "0000.0000.0002",
    sourceHostname: "R2",
    lspSummaries: [
      { lspId: "0000.0000.0001.00-00", seqNum: 2, lifetime: 1198, checksum: 0x4a1e },
      { lspId: "0000.0000.0002.00-00", seqNum: 4, lifetime: 1195, checksum: 0x6e21 },
      { lspId: "0000.0000.0002.01-00", seqNum: 1, lifetime: 1200, checksum: 0x81c2 },
    ],
  });

  steps.push({
    stepIndex: 2,
    title: "Step 2: Pseudonode LSP & Complete Sequence Number PDU (CSNP) Flooding",
    description:
      "DIS R2 creates the Pseudonode LSP (0000.0000.0002.01-00) representing the virtual LAN switch and multicasts CSNPs every 10 seconds.",
    phase: "lsp_flooding",
    activeNodeId: "r2",
    activePdu: csnpPdu,
    senderId: "r2",
    receiverIds: ["r1", "r3"],
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "R2# ISIS-Update: Sending L1 CSNP on Gi0/1 to 01-80-C2-00-00-14 (3 LSPs summarized)", type: "info" },
      { text: "R1# ISIS-Update: Received L1 CSNP from DIS (0000.0000.0002.01)", type: "success" },
      { text: "R1# ISIS-Update: Database fully synchronized with Pseudonode", type: "success" },
    ],
    eventExplanation: {
      beginner:
        "The DIS acts as a virtual switch called the 'Pseudonode' and periodically broadcasts a full checklist of all messages so no router misses anything.",
      advanced:
        "Pseudonode abstraction reduces the $N \\times (N-1) / 2$ link graph down to $N$ links attached to the Pseudonode. Periodic CSNPs (every 10s) guarantee lossless database synchronization.",
      protocolRule: "ISO/IEC 10589 §7.3.15.2: DIS transmits periodic CSNPs on broadcast circuits to maintain LSDB consistency.",
      fieldsChanged: ["Pseudonode LSP: Generated", "CSNP Multicast: Every 10s", "LSDB Consistency: 100%"],
    },
  });

  return {
    steps,
    finalNodes: currentNodes,
    finalLinks: currentLinks,
    l1ConvergenceTimeMs: 10,
    l2ConvergenceTimeMs: 0,
  };
}

// -----------------------------------------------------------------------------
// Scenario 4: Route Leaking with Up/Down (U/D) Bit (RFC 2966)
// -----------------------------------------------------------------------------
function buildRouteLeakingScenario(
  config: IsisConfig,
  nodes: IsisNode[],
  links: IsisLink[]
): IsisSimulationOutcome {
  const conv = buildMultiAreaHierarchyScenario(config, nodes, links);
  const steps: IsisSimulationStepState[] = [];
  const currentNodes: IsisNode[] = JSON.parse(JSON.stringify(conv.finalNodes));
  const currentLinks: IsisLink[] = JSON.parse(JSON.stringify(conv.finalLinks));

  // Step 0: Suboptimal Default Routing Baseline
  steps.push({
    stepIndex: 0,
    title: "Step 0: Baseline — Level 1 Blind Default Route",
    description:
      "R1 has only a generic default route (0.0.0.0/0) towards R2 without specific visibility into Area 49.0003 subnets (192.168.5.0/24).",
    phase: "init",
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "R1# show ip route 192.168.5.0", type: "command" },
      { text: "  Subnet not in table, using Gateway of Last Resort (0.0.0.0/0 via 10.0.1.2)", type: "warning" },
    ],
    eventExplanation: {
      beginner:
        "Level 1 routers only have a generic default route. If there were multiple border exits, R1 might pick the wrong one and take a slow detour.",
      advanced:
        "Default routing limitation: In multi-homed areas, L1 routers pick the nearest border router by hop count, potentially causing severe asymmetric/suboptimal inter-area forwarding.",
      protocolRule: "RFC 2966: Without route leaking, Level 1 areas have zero granular inter-area metric visibility.",
      fieldsChanged: ["R1 Forwarding: Default Route Only", "Metric Granularity: Coarse"],
    },
  });

  // Step 1: Route Leaking from L2 into L1 with U/D Bit = 1
  const leakedLsp = createIsisLspPdu({
    level: "L1",
    sourceSystemId: "0000.0000.0002",
    sourceHostname: "R2",
    sequenceNumber: 8,
    tlvs: [
      { type: 1, length: 3, name: "Area Addresses", data: { area: "49.0001" } },
      { type: 137, length: 2, name: "Dynamic Hostname", data: { hostname: "R2" } },
      {
        type: 135,
        length: 12,
        name: "Extended IP Reachability (RFC 2966 Leaked)",
        data: { prefix: "192.168.5.0/24", metric: 40, upDownBit: true },
      },
    ],
  });

  steps.push({
    stepIndex: 1,
    title: "Step 1: R2 Leaks L2 Prefix into L1 with Up/Down (U/D) Bit Set",
    description:
      "R2 redistributes 192.168.5.0/24 from Level 2 into Level 1 TLV 135 with the Up/Down (U/D) bit set to 1. The U/D bit prevents loops.",
    phase: "route_leak",
    activeNodeId: "r2",
    activeLinkIds: ["link-r1-r2"],
    activePdu: leakedLsp,
    senderId: "r2",
    receiverIds: ["r1"],
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "R2(config-router)# redistribute isis ip level-2 into level-1 route-map LEAK_R5", type: "command" },
      { text: "R2# ISIS-Update: Leaking 192.168.5.0/24 into L1 LSP with U/D bit = 1", type: "info" },
      { text: "R1# %RTM-5-RTADD: Installed i L1 192.168.5.0/24 [115/50] (Leaked Inter-Area)", type: "success" },
    ],
    eventExplanation: {
      beginner:
        "The border router teaches Router 1 the exact road to Network 5, tagging it with a 'Down' stamp so it won't accidentally loop back.",
      advanced:
        "RFC 2966 Route Leaking: The 0x80 flag in TLV 135 sets the Up/Down bit. Other L1/L2 routers inspect the U/D bit and will NEVER advertise this route back into Level 2, mathematically guaranteeing loop freedom.",
      protocolRule: "RFC 2966 §4: Any prefix received in Level 1 with U/D=1 must not be re-injected into Level 2.",
      fieldsChanged: ["TLV 135: U/D Bit = 1", "R1 FIB: + 192.168.5.0/24 [115/50]", "Loop Freedom: Guaranteed"],
    },
  });

  // Step 2: Optimal Forwarding Verified
  const r1 = currentNodes.find((n) => n.id === "r1")!;
  r1.routingTable.push({
    prefix: "192.168.5.0/24",
    level: "i L1",
    nextHop: "10.0.1.2",
    interfaceName: "Gi0/1",
    metric: 50,
    adminDistance: 115,
    upDownBit: true,
  });

  steps.push({
    stepIndex: 2,
    title: "Step 2: Optimal Inter-Area Forwarding with Exact Metric",
    description:
      "R1 forwards packets to 192.168.5.0/24 using exact longest-prefix match (LPM) and precise end-to-end accumulated metric.",
    phase: "converged",
    activeNodeId: "r1",
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "R1# show ip route 192.168.5.0", type: "command" },
      { text: "Routing entry for 192.168.5.0/24", type: "info" },
      { text: "  Known via \"isis\", distance 115, metric 50, type level-1 (inter-area leaked)", type: "success" },
      { text: "  Routing Descriptor Blocks:", type: "info" },
      { text: "  * 10.0.1.2, from 0000.0000.0002.00-00, via GigabitEthernet0/1", type: "success" },
    ],
    eventExplanation: {
      beginner:
        "Optimal forwarding confirmed! Router 1 has the exact address and cost in its routing table.",
      advanced:
        "FIB programs exact `/24` prefix over dynamic default route. Optimal pathing achieved across the multi-area topology.",
      protocolRule: "RFC 2966: Combines the scalability of hierarchical areas with the path optimality of flat routing.",
      fieldsChanged: ["R1 Table: Exact Prefix Installed", "Suboptimal Routing: 0%"],
    },
  });

  return {
    steps,
    finalNodes: currentNodes,
    finalLinks: currentLinks,
    l1ConvergenceTimeMs: 14,
    l2ConvergenceTimeMs: 20,
  };
}

// -----------------------------------------------------------------------------
// Scenario 5: Dual-Stack Integrated IS-IS (IPv4 + IPv6)
// -----------------------------------------------------------------------------
function buildDualStackScenario(
  config: IsisConfig,
  nodes: IsisNode[],
  links: IsisLink[]
): IsisSimulationOutcome {
  const conv = buildMultiAreaHierarchyScenario(config, nodes, links);
  const steps: IsisSimulationStepState[] = [];
  const currentNodes: IsisNode[] = JSON.parse(JSON.stringify(conv.finalNodes));
  const currentLinks: IsisLink[] = JSON.parse(JSON.stringify(conv.finalLinks));

  // Configure IPv6 addresses on interfaces
  currentNodes[0].interfaces[0].ipv6Address = "2001:db8:1::1/64";
  currentNodes[4].interfaces[1].ipv6Address = "2001:db8:5::1/64";

  const dualStackLsp = createIsisLspPdu({
    level: "L1",
    sourceSystemId: "0000.0000.0001",
    sourceHostname: "R1",
    sequenceNumber: 4,
    tlvs: [
      { type: 1, length: 3, name: "Area Addresses", data: { area: "49.0001" } },
      { type: 137, length: 2, name: "Dynamic Hostname", data: { hostname: "R1" } },
      { type: 135, length: 11, name: "Extended IPv4 Reachability", data: { prefix: "192.168.1.0/24", metric: 10 } },
      { type: 236, length: 19, name: "IPv6 Reachability (RFC 5308)", data: { prefix: "2001:db8:1::/64", metric: 10 } },
    ],
  });

  steps.push({
    stepIndex: 0,
    title: "Step 0: Integrated IS-IS Multi-Topology PDU Flooding",
    description:
      "R1 floods a single IS-IS Link State PDU carrying both IPv4 Extended Reachability (TLV 135) and IPv6 Reachability (TLV 236).",
    phase: "lsp_flooding",
    activeNodeId: "r1",
    activeLinkIds: ["link-r1-r2"],
    activePdu: dualStackLsp,
    senderId: "r1",
    receiverIds: ["r2"],
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "R1# show isis database detail 0000.0000.0001.00-00", type: "command" },
      { text: "  NLPID: 0xCC (IPv4), 0x8E (IPv6)", type: "info" },
      { text: "  IPv4 Extended: 192.168.1.0/24 Metric 10", type: "success" },
      { text: "  IPv6 Reachability (TLV 236): 2001:db8:1::/64 Metric 10", type: "success" },
      { text: "R2# %RTM-5-RTADD: Installed IPv4 192.168.1.0/24 AND IPv6 2001:db8:1::/64 simultaneously", type: "success" },
    ],
    eventExplanation: {
      beginner:
        "One single message carries both standard IPv4 internet addresses and new IPv6 addresses, saving massive amounts of network traffic.",
      advanced:
        "RFC 5308 / RFC 5120 Multi-Topology Routing: Single IS-IS control plane manages dual-stack forwarding tables without running separate protocol daemons.",
      protocolRule: "RFC 5308: TLV 236 encodes 128-bit IPv6 prefixes, prefix length, and 32-bit wide metric.",
      fieldsChanged: ["TLV 135: IPv4", "TLV 236: IPv6 2001:db8:1::/64", "Dual-Stack FIB: Programmed"],
    },
  });

  // Add IPv6 routing table entries
  currentNodes[0].routingTable.push({
    prefix: "2001:db8:5::/64",
    level: "i L1",
    nextHop: "fe80::2",
    interfaceName: "Gi0/1",
    metric: 40,
    adminDistance: 115,
  });

  steps.push({
    stepIndex: 1,
    title: "Step 1: Dual-Stack Convergence Complete (IPv4 & IPv6 Ping Verified)",
    description:
      "Both IPv4 and IPv6 routing tables have converged. End-to-end ping succeeds over both protocols.",
    phase: "converged",
    activeNodeId: "r1",
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "R1# ping ipv6 2001:db8:5::1", type: "command" },
      { text: "Sending 5, 100-byte ICMPv6 Echos to 2001:db8:5::1, timeout is 2 seconds:", type: "info" },
      { text: "!!!!!", type: "success" },
      { text: "Success rate is 100 percent (5/5), round-trip min/avg/max = 1/2/3 ms", type: "success" },
    ],
    eventExplanation: {
      beginner:
        "Dual-stack convergence complete! Both IPv4 and IPv6 ping tests succeed with 100% reachability.",
      advanced:
        "Dual FIB hardware programming complete. Forwarding engines switch IPv4 and IPv6 frames with zero protocol overhead.",
      protocolRule: "RFC 5308: Eliminates the dual protocol overhead of running OSPFv2 alongside OSPFv3.",
      fieldsChanged: ["IPv6 Ping: 100% (5/5)", "Status: CONVERGED"],
    },
  });

  return {
    steps,
    finalNodes: currentNodes,
    finalLinks: currentLinks,
    l1ConvergenceTimeMs: 15,
    l2ConvergenceTimeMs: 18,
  };
}

// -----------------------------------------------------------------------------
// Scenario 6: Overload Bit (OL-Bit) Graceful Maintenance Rerouting
// -----------------------------------------------------------------------------
function buildOverloadBitScenario(
  config: IsisConfig,
  nodes: IsisNode[],
  links: IsisLink[]
): IsisSimulationOutcome {
  const conv = buildMultiAreaHierarchyScenario(config, nodes, links);
  const steps: IsisSimulationStepState[] = [];
  const currentNodes: IsisNode[] = JSON.parse(JSON.stringify(conv.finalNodes));
  const currentLinks: IsisLink[] = JSON.parse(JSON.stringify(conv.finalLinks));

  // Step 0: Baseline state before maintenance
  steps.push({
    stepIndex: 0,
    title: "Step 0: Normal Backbone Transit Traffic Traverses R3",
    description:
      "Router R3 is operating normally in the Level 2 backbone, carrying transit traffic between Area 49.0001 and Area 49.0003.",
    phase: "init",
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "R3# show isis database 0000.0000.0003.00-00", type: "command" },
      { text: "0000.0000.0003.00-00* 0x00000003   0x3D10        1199          0/0/0 (OL=0)", type: "info" },
    ],
    eventExplanation: {
      beginner:
        "Backbone router R3 is handling high-speed traffic normally. But the network operator needs to perform hardware maintenance on R3 without dropping packets.",
      advanced:
        "Normal state: R3's Level 2 LSP has `OL=0`. Neighboring routers R2 and R4 compute shortest paths through R3.",
      protocolRule: "ISO/IEC 10589: Standard transit SPF calculation applies.",
      fieldsChanged: ["R3 OL-Bit: 0 (Normal Transit)"],
    },
  });

  // Step 1: Set Overload Bit on R3
  const r3 = currentNodes.find((n) => n.id === "r3")!;
  r3.overloadBit = true;
  r3.status = "overloaded";

  const overloadedLsp = createIsisLspPdu({
    level: "L2",
    sourceSystemId: "0000.0000.0003",
    sourceHostname: "R3",
    sequenceNumber: 7,
    flags: { overload: true, isType: "L2" },
    tlvs: [
      { type: 1, length: 3, name: "Area Addresses", data: { area: "49.0002" } },
      { type: 137, length: 2, name: "Dynamic Hostname", data: { hostname: "R3" } },
      { type: 135, length: 11, name: "Extended IP Reachability", data: { prefix: "10.0.2.0/24", metric: 10 } },
    ],
  });

  steps.push({
    stepIndex: 1,
    title: "Step 1: Operator Activates `set-overload-bit` on R3",
    description:
      "R3 immediately updates and floods its Level 2 LSP with the Overload bit (OL=1). Adjacent routers will no longer use R3 for transit.",
    phase: "lsp_flooding",
    activeNodeId: "r3",
    activePdu: overloadedLsp,
    senderId: "r3",
    receiverIds: ["r2", "r4"],
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "R3(config-router)# set-overload-bit on-startup", type: "command" },
      { text: "R3# %IS-IS-5-OVERLOAD: Set overload bit on Level 2 LSP", type: "warning" },
      { text: "R2# ISIS-SPF: R3 LSP has OL-bit set -> Excluding R3 from transit SPF calculation", type: "warning" },
      { text: "R4# ISIS-SPF: R3 LSP has OL-bit set -> Rerouting transit traffic around R3", type: "warning" },
    ],
    eventExplanation: {
      beginner:
        "The operator puts up a 'Detour' sign (Overload Bit = 1). Neighbors immediately route traffic around R3, while local traffic to R3 itself is still delivered.",
      advanced:
        "ISO/IEC 10589 §7.2.8.1: When OL=1, Dijkstra SPF marks the node as a leaf stub in the Shortest Path Tree. Transit paths through R3 receive infinite cost.",
      protocolRule: "ISO/IEC 10589: Packets destined directly to subnets attached to R3 are still forwarded; only transit traffic is bypassed.",
      fieldsChanged: ["R3 LSP: OL=1", "Transit Traffic: Gracefully Diverted", "Downtime: 0ms"],
    },
  });

  return {
    steps,
    finalNodes: currentNodes,
    finalLinks: currentLinks,
    l1ConvergenceTimeMs: 6,
    l2ConvergenceTimeMs: 8,
  };
}

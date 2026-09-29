/**
 * RIP (Routing Information Protocol - RFC 1058 / RFC 2453)
 * Discrete-Event Simulation Sequence & Scenario Step Generator
 */

import type {
  RipConfig,
  RipNode,
  RipLink,
  RipSimulationStepState,
  RipSimulationOutcome,
  RipPacketData,
  RipRouteTableEntry,
} from "./rip.types";
import {
  TOPOLOGY_PRESETS,
  defaultRipConfig,
} from "./rip.defaults";
import {
  createRipResponsePacket,
  processIncomingRipUpdate,
} from "./rip-engine";

/**
 * Generate full simulation steps based on the selected RIP scenario and configuration.
 */
export function generateRipSimulationSteps(
  config: RipConfig = defaultRipConfig
): RipSimulationOutcome {
  const preset = TOPOLOGY_PRESETS[config.topologyPreset] || TOPOLOGY_PRESETS.linear_4_router;
  const initialNodes: RipNode[] = JSON.parse(JSON.stringify(preset.nodes));
  const initialLinks: RipLink[] = JSON.parse(JSON.stringify(preset.links));

  switch (config.scenarioId) {
    case "bellman_ford_convergence":
      return buildBellmanFordConvergenceScenario(config, initialNodes, initialLinks);

    case "link_failure_split_horizon":
      return buildLinkFailureSplitHorizonScenario(config, initialNodes, initialLinks);

    case "count_to_infinity_loop":
      return buildCountToInfinityScenario(config, initialNodes, initialLinks);

    case "ripv2_vlsm_cidr_tagging":
      return buildVlsmTaggingScenario(config, initialNodes, initialLinks);

    case "next_hop_optimization":
      return buildNextHopOptimizationScenario(config, initialNodes, initialLinks);

    case "route_timers_lifecycle":
      return buildRouteTimersLifecycleScenario(config, initialNodes, initialLinks);

    default:
      return buildBellmanFordConvergenceScenario(config, initialNodes, initialLinks);
  }
}

// -----------------------------------------------------------------------------
// Scenario 1: Standard Multi-Hop Bellman-Ford Convergence
// -----------------------------------------------------------------------------
function buildBellmanFordConvergenceScenario(
  config: RipConfig,
  nodes: RipNode[],
  links: RipLink[]
): RipSimulationOutcome {
  const steps: RipSimulationStepState[] = [];
  const currentNodes = JSON.parse(JSON.stringify(nodes)) as RipNode[];
  const currentLinks = JSON.parse(JSON.stringify(links)) as RipLink[];

  // Step 0: Initial State (Directly Connected Routes only)
  steps.push({
    stepIndex: 0,
    title: "Step 0: Initial Boot — Connected Routes Only",
    description:
      "All routers have initialized. Each router knows only its directly connected subnets (Metric 1, Admin Distance 0).",
    phase: "init",
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "Router# show ip route rip", type: "command" },
      { text: "  (No RIP routes installed in routing table yet - awaiting first update timer)", type: "info" },
      { text: "Router# show ip protocols", type: "command" },
      { text: "  Routing Protocol is \"rip\"", type: "info" },
      { text: "  Sending updates every 30 seconds, next due in 00:00:28", type: "info" },
      { text: "  Split horizon is enabled with poison reverse", type: "success" },
    ],
    eventExplanation: {
      beginner:
        "Routers just powered on. Each router can see what is plugged directly into its own ports, but has zero knowledge of faraway networks.",
      advanced:
        "Initial RIB state: Only `Connected (C)` subnets with AD 0 are present in the Routing Information Base. RIP update timer initialized to 30s.",
      protocolRule: "RFC 2453 §3.4: On startup, routers initialize timer state and prepare unsolicited periodic responses.",
      fieldsChanged: ["RIB: Connected routes only", "Update Timer: 30s armed"],
    },
  });

  // Step 1: Round 1 — R1 announces to R2, R4 announces to R3
  const r1 = currentNodes.find((n) => n.id === "r1")!;
  const r2 = currentNodes.find((n) => n.id === "r2")!;
  const r3 = currentNodes.find((n) => n.id === "r3")!;
  const r4 = currentNodes.find((n) => n.id === "r4")!;

  const r1Entries: RipRouteTableEntry[] = [
    { addressFamily: 2, routeTag: 0, ipAddress: "192.168.1.0", subnetMask: "255.255.255.0", nextHop: "0.0.0.0", metric: 1 },
  ];
  const packetR1toR2: RipPacketData = createRipResponsePacket({
    version: config.version,
    sourceIp: "10.0.1.1",
    destIp: config.version === "ripv1" ? "255.255.255.255" : "224.0.0.9",
    entries: r1Entries,
  });

  // R2 updates table
  processIncomingRipUpdate({
    node: r2,
    inboundInterface: r2.interfaces.find((i) => i.name === "Fa0/1")!,
    senderIp: "10.0.1.1",
    entries: r1Entries,
  });
  r2.routingTable.push({
    network: "192.168.1.0",
    prefix: "192.168.1.0/24",
    subnetMask: "255.255.255.0",
    nextHop: "10.0.1.1",
    interfaceName: "Fa0/1",
    metric: 2,
    routeType: "R",
    adminDistance: 120,
    ageSeconds: 0,
    state: "valid",
  });

  r3.routingTable.push({
    network: "192.168.4.0",
    prefix: "192.168.4.0/24",
    subnetMask: "255.255.255.0",
    nextHop: "10.0.3.2",
    interfaceName: "Fa0/3",
    metric: 2,
    routeType: "R",
    adminDistance: 120,
    ageSeconds: 0,
    state: "valid",
  });

  steps.push({
    stepIndex: 1,
    title: "Step 1: Round 1 — Edge Routers Broadcast to Immediate Neighbors",
    description:
      "R1 sends RIP Response to R2 (advertising 192.168.1.0/24). R4 sends RIP Response to R3 (advertising 192.168.4.0/24).",
    phase: "periodic_broadcast",
    activeNodeId: "r1",
    activeLinkIds: ["link-r1-r2"],
    activePacket: packetR1toR2,
    senderId: "r1",
    receiverIds: ["r2"],
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "R1# debug ip rip", type: "command" },
      { text: "RIP: sending v2 update to 224.0.0.9 via FastEthernet0/1 (10.0.1.1)", type: "info" },
      { text: "RIP: build packet: 192.168.1.0/24 metric 1", type: "info" },
      { text: "R2# RIP: received v2 update from 10.0.1.1 on FastEthernet0/1", type: "success" },
      { text: "R2# %RTM-5-RTADD: Installed R 192.168.1.0/24 [120/2] via 10.0.1.1", type: "success" },
    ],
    eventExplanation: {
      beginner:
        "Router 1 tells Router 2: 'I have network 192.168.1.0 directly connected!' Router 2 writes down: 'I can reach 192.168.1.0 by sending to R1 (Cost: 1+1 = 2 hops)'.",
      advanced:
        "R1 executes Bellman-Ford advertising. R2 receives RTE with metric 1, relaxes the metric by +1 hop, and inserts route into RIB with AD 120 and Metric 2.",
      protocolRule: "RFC 2453 §3.9.2: Receiver adds interface cost (1 hop) to the metric in the received RTE.",
      fieldsChanged: ["R2 Routing Table: + 192.168.1.0/24 [120/2]", "R3 Routing Table: + 192.168.4.0/24 [120/2]"],
    },
  });

  // Step 2: Round 2 — R2 advertises to R3, R3 advertises to R2
  r3.routingTable.push({
    network: "192.168.1.0",
    prefix: "192.168.1.0/24",
    subnetMask: "255.255.255.0",
    nextHop: "10.0.2.1",
    interfaceName: "Fa0/2",
    metric: 3,
    routeType: "R",
    adminDistance: 120,
    ageSeconds: 0,
    state: "valid",
  });
  r3.routingTable.push({
    network: "10.0.1.0",
    prefix: "10.0.1.0/24",
    subnetMask: "255.255.255.0",
    nextHop: "10.0.2.1",
    interfaceName: "Fa0/2",
    metric: 2,
    routeType: "R",
    adminDistance: 120,
    ageSeconds: 0,
    state: "valid",
  });

  r2.routingTable.push({
    network: "192.168.4.0",
    prefix: "192.168.4.0/24",
    subnetMask: "255.255.255.0",
    nextHop: "10.0.2.2",
    interfaceName: "Fa0/2",
    metric: 3,
    routeType: "R",
    adminDistance: 120,
    ageSeconds: 0,
    state: "valid",
  });
  r2.routingTable.push({
    network: "10.0.3.0",
    prefix: "10.0.3.0/24",
    subnetMask: "255.255.255.0",
    nextHop: "10.0.2.2",
    interfaceName: "Fa0/2",
    metric: 2,
    routeType: "R",
    adminDistance: 120,
    ageSeconds: 0,
    state: "valid",
  });

  const packetR2toR3 = createRipResponsePacket({
    version: config.version,
    sourceIp: "10.0.2.1",
    destIp: "224.0.0.9",
    entries: [
      { addressFamily: 2, routeTag: 0, ipAddress: "192.168.1.0", subnetMask: "255.255.255.0", nextHop: "0.0.0.0", metric: 2 },
      { addressFamily: 2, routeTag: 0, ipAddress: "10.0.1.0", subnetMask: "255.255.255.0", nextHop: "0.0.0.0", metric: 1 },
    ],
  });

  steps.push({
    stepIndex: 2,
    title: "Step 2: Round 2 — Core Vector Exchange Across Central Link (R2 <-> R3)",
    description:
      "R2 sends updates across link R2-R3 carrying 192.168.1.0/24 (Metric 2). R3 sends updates carrying 192.168.4.0/24 (Metric 2).",
    phase: "periodic_broadcast",
    activeNodeId: "r2",
    activeLinkIds: ["link-r2-r3"],
    activePacket: packetR2toR3,
    senderId: "r2",
    receiverIds: ["r3"],
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "R2# RIP: sending v2 update to 224.0.0.9 via FastEthernet0/2 (10.0.2.1)", type: "info" },
      { text: "R2#   - 192.168.1.0/24 metric 2", type: "info" },
      { text: "R2#   - 10.0.1.0/24 metric 1", type: "info" },
      { text: "R3# %RTM-5-RTADD: Installed R 192.168.1.0/24 [120/3] via 10.0.2.1", type: "success" },
      { text: "R3# %RTM-5-RTADD: Installed R 10.0.1.0/24 [120/2] via 10.0.2.1", type: "success" },
    ],
    eventExplanation: {
      beginner:
        "Router 2 passes the message forward to Router 3: 'I can get to Network 1 in 2 hops.' Router 3 records it as 3 hops total.",
      advanced:
        "Bellman-Ford vector propagation: Each router acts as an independent routing calculator, relaying distance vectors learned in previous epochs.",
      protocolRule: "RFC 2453: Split Horizon prevents R2 from sending 192.168.1.0/24 back out interface Fa0/1 to R1.",
      fieldsChanged: ["R3 Routing Table: + 192.168.1.0/24 [120/3]", "R2 Routing Table: + 192.168.4.0/24 [120/3]"],
    },
  });

  // Step 3: Round 3 — Complete End-to-End Propagation (R3 to R4, R2 to R1)
  r4.routingTable.push({
    network: "192.168.1.0",
    prefix: "192.168.1.0/24",
    subnetMask: "255.255.255.0",
    nextHop: "10.0.3.1",
    interfaceName: "Fa0/3",
    metric: 4,
    routeType: "R",
    adminDistance: 120,
    ageSeconds: 0,
    state: "valid",
  });
  r4.routingTable.push({
    network: "10.0.1.0",
    prefix: "10.0.1.0/24",
    subnetMask: "255.255.255.0",
    nextHop: "10.0.3.1",
    interfaceName: "Fa0/3",
    metric: 3,
    routeType: "R",
    adminDistance: 120,
    ageSeconds: 0,
    state: "valid",
  });
  r4.routingTable.push({
    network: "10.0.2.0",
    prefix: "10.0.2.0/24",
    subnetMask: "255.255.255.0",
    nextHop: "10.0.3.1",
    interfaceName: "Fa0/3",
    metric: 2,
    routeType: "R",
    adminDistance: 120,
    ageSeconds: 0,
    state: "valid",
  });

  r1.routingTable.push({
    network: "192.168.4.0",
    prefix: "192.168.4.0/24",
    subnetMask: "255.255.255.0",
    nextHop: "10.0.1.2",
    interfaceName: "Fa0/1",
    metric: 4,
    routeType: "R",
    adminDistance: 120,
    ageSeconds: 0,
    state: "valid",
  });
  r1.routingTable.push({
    network: "10.0.2.0",
    prefix: "10.0.2.0/24",
    subnetMask: "255.255.255.0",
    nextHop: "10.0.1.2",
    interfaceName: "Fa0/1",
    metric: 2,
    routeType: "R",
    adminDistance: 120,
    ageSeconds: 0,
    state: "valid",
  });
  r1.routingTable.push({
    network: "10.0.3.0",
    prefix: "10.0.3.0/24",
    subnetMask: "255.255.255.0",
    nextHop: "10.0.1.2",
    interfaceName: "Fa0/1",
    metric: 3,
    routeType: "R",
    adminDistance: 120,
    ageSeconds: 0,
    state: "valid",
  });

  steps.push({
    stepIndex: 3,
    title: "Step 3: Network Full Convergence Achieved",
    description:
      "All 4 routers have converged. R1 can reach R4's LAN (192.168.4.0/24) in 4 hops, and R4 can reach R1's LAN in 4 hops.",
    phase: "converged",
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "R1# show ip route rip", type: "command" },
      { text: "R    10.0.2.0/24 [120/2] via 10.0.1.2, 00:00:12, FastEthernet0/1", type: "success" },
      { text: "R    10.0.3.0/24 [120/3] via 10.0.1.2, 00:00:12, FastEthernet0/1", type: "success" },
      { text: "R    192.168.4.0/24 [120/4] via 10.0.1.2, 00:00:12, FastEthernet0/1", type: "success" },
      { text: "R1# ping 192.168.4.1", type: "command" },
      { text: "Sending 5, 100-byte ICMP Echos to 192.168.4.1, timeout is 2 seconds:", type: "info" },
      { text: "!!!!!", type: "success" },
      { text: "Success rate is 100 percent (5/5), round-trip min/avg/max = 4/8/12 ms", type: "success" },
    ],
    eventExplanation: {
      beginner:
        "Convergence complete! Every router now possesses a complete map of the entire 4-hop network. Packets flow seamlessly from end to end.",
      advanced:
        "Full convergence reached in $N-1 = 3$ update cycles. The maximum diameter is 4 hops, well below the RIP hop limit of 15.",
      protocolRule: "RFC 2453: Once converged, periodic 30-second heartbeats maintain and refresh timer expiration states.",
      fieldsChanged: ["Status: CONVERGED", "Max Hop Diameter: 4 Hops", "Packet Loss: 0%"],
    },
  });

  return {
    steps,
    finalNodes: currentNodes,
    finalLinks: currentLinks,
    convergenceRounds: 3,
    loopDetected: false,
  };
}

// -----------------------------------------------------------------------------
// Scenario 2: Link Failure & Split Horizon with Poison Reverse
// -----------------------------------------------------------------------------
function buildLinkFailureSplitHorizonScenario(
  config: RipConfig,
  nodes: RipNode[],
  links: RipLink[]
): RipSimulationOutcome {
  // Start from converged state
  const conv = buildBellmanFordConvergenceScenario(config, nodes, links);
  const steps: RipSimulationStepState[] = [conv.steps[3]];
  steps[0].stepIndex = 0;
  steps[0].title = "Step 0: Baseline Converged State";
  steps[0].description = "All routers are synchronized with active routes to 192.168.4.0/24.";

  const currentNodes = JSON.parse(JSON.stringify(conv.finalNodes)) as RipNode[];
  const currentLinks = JSON.parse(JSON.stringify(conv.finalLinks)) as RipLink[];

  // Step 1: Link Cut Event
  const failedLink = currentLinks.find((l) => l.id === "link-r3-r4")!;
  failedLink.status = "down";

  const r3 = currentNodes.find((n) => n.id === "r3")!;
  const r3Route = r3.routingTable.find((r) => r.network === "192.168.4.0")!;
  if (r3Route) {
    r3Route.metric = 16;
    r3Route.state = "poisoned";
  }

  steps.push({
    stepIndex: 1,
    title: "Step 1: Link Failure Detected (R3 <-> R4 Severed)",
    description:
      "Physical fiber cut between R3 and R4. R3 immediately detects carrier loss and marks 192.168.4.0/24 as Metric 16 (Poisoned).",
    phase: "triggered_flash",
    activeNodeId: "r3",
    activeLinkIds: ["link-r3-r4"],
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "%LINEPROTO-5-UPDOWN: Line protocol on Interface FastEthernet0/3, changed state to down", type: "error" },
      { text: "%LINK-3-UPDOWN: Interface FastEthernet0/3, changed state to down", type: "error" },
      { text: "R3# RIP: route 192.168.4.0/24 is now unreachable (Metric 16 - Inaccessible)", type: "warning" },
      { text: "R3# RIP: triggering flash update on FastEthernet0/2", type: "info" },
    ],
    eventExplanation: {
      beginner:
        "The cable between Router 3 and Router 4 was cut! Router 3 instantly knows the path is dead and marks the distance as 16 (Infinite).",
      advanced:
        "Hardware carrier sense triggers interface down interrupt. R3 modifies local RIB entry for 192.168.4.0/24: `metric = 16, state = poisoned`.",
      protocolRule: "RFC 2453 §3.10: Link down transitions immediately trigger flash updates without waiting for periodic timers.",
      fieldsChanged: ["Link link-r3-r4: DOWN", "R3 Metric: 16 (Poisoned)", "Flash Update: ARMED"],
    },
  });

  // Step 2: R3 sends Triggered Poison Flash Update to R2
  const r2 = currentNodes.find((n) => n.id === "r2")!;
  const r2Route = r2.routingTable.find((r) => r.network === "192.168.4.0")!;
  if (r2Route) {
    r2Route.metric = 16;
    r2Route.state = "poisoned";
  }

  const poisonPacket = createRipResponsePacket({
    version: config.version,
    sourceIp: "10.0.2.2",
    destIp: "224.0.0.9",
    entries: [
      { addressFamily: 2, routeTag: 0, ipAddress: "192.168.4.0", subnetMask: "255.255.255.0", nextHop: "0.0.0.0", metric: 16 },
    ],
  });

  steps.push({
    stepIndex: 2,
    title: "Step 2: R3 Broadcasts Triggered Flash Update (Metric 16 Poison)",
    description:
      "R3 sends an immediate flash response to R2 advertising 192.168.4.0/24 with Metric 16. Split Horizon + Poison Reverse ensures R2 poisons its entry.",
    phase: "poison_reverse",
    activeNodeId: "r3",
    activeLinkIds: ["link-r2-r3"],
    activePacket: poisonPacket,
    senderId: "r3",
    receiverIds: ["r2"],
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "R3# RIP: sending flash update to 224.0.0.9 via FastEthernet0/2", type: "info" },
      { text: "R3#   - 192.168.4.0/24 metric 16 (POISON)", type: "error" },
      { text: "R2# RIP: received update from 10.0.2.2 on FastEthernet0/2", type: "warning" },
      { text: "R2# %RTM-5-RTPOISON: Route 192.168.4.0/24 via 10.0.2.2 poisoned (Metric 16)", type: "warning" },
    ],
    eventExplanation: {
      beginner:
        "Router 3 alerts Router 2 immediately: 'Network 4 is dead (16 hops away)!' Router 2 immediately poisons its own table so it won't mislead anyone else.",
      advanced:
        "R2 accepts metric 16 from current next-hop 10.0.2.2. Split Horizon prevents R2 from offering its stale cached metric 3 back to R3.",
      protocolRule: "RFC 2453 §3.4.3: Split Horizon prevents R2 from echoing back previous information to R3.",
      fieldsChanged: ["R2 Routing Table: 192.168.4.0/24 -> Metric 16", "Routing Loop Avoided: TRUE"],
    },
  });

  // Step 3: R2 propagates poison to R1
  const r1 = currentNodes.find((n) => n.id === "r1")!;
  const r1Route = r1.routingTable.find((r) => r.network === "192.168.4.0")!;
  if (r1Route) {
    r1Route.metric = 16;
    r1Route.state = "poisoned";
  }

  steps.push({
    stepIndex: 3,
    title: "Step 3: Poison Propagated to R1 — Fast Loop-Free Convergence",
    description:
      "R2 forwards the flash update to R1. The entire autonomous network invalidates the dead route in under 1 second with ZERO routing loops.",
    phase: "converged",
    activeNodeId: "r2",
    activeLinkIds: ["link-r1-r2"],
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "R1# show ip route rip", type: "command" },
      { text: "R    192.168.4.0/24 is possibly down, routing timer expired", type: "warning" },
      { text: "R1# ping 192.168.4.1", type: "command" },
      { text: "Sending 5, 100-byte ICMP Echos to 192.168.4.1, timeout is 2 seconds:", type: "info" },
      { text: "U.U.U (Destination Host Unreachable)", type: "error" },
    ],
    eventExplanation: {
      beginner:
        "Clean convergence! All routers agreed the network is gone. Packets are dropped immediately at R1 with 'Destination Unreachable' instead of looping endlessly.",
      advanced:
        "Convergence time under triggered updates: $\\approx O(D)$ where $D$ is link propagation delay ($<50$ms), bypassing the 180-second holddown wait.",
      protocolRule: "RFC 2453: Holddown timer starts for poisoned routes to ignore transient flapping announcements.",
      fieldsChanged: ["R1 Metric: 16", "Network State: Cleanly Converged", "Loops: 0"],
    },
  });

  return {
    steps,
    finalNodes: currentNodes,
    finalLinks: currentLinks,
    convergenceRounds: 2,
    loopDetected: false,
  };
}

// -----------------------------------------------------------------------------
// Scenario 3: Count-to-Infinity Routing Loop (Split Horizon Disabled)
// -----------------------------------------------------------------------------
function buildCountToInfinityScenario(
  config: RipConfig,
  nodes: RipNode[],
  links: RipLink[]
): RipSimulationOutcome {
  const conv = buildBellmanFordConvergenceScenario(config, nodes, links);
  const steps: RipSimulationStepState[] = [conv.steps[3]];
  steps[0].stepIndex = 0;
  steps[0].title = "Step 0: Baseline Converged State (Split Horizon DISABLED)";
  steps[0].description = "Split Horizon has been explicitly disabled on R2 and R3 interfaces.";

  const currentNodes = JSON.parse(JSON.stringify(conv.finalNodes)) as RipNode[];
  const currentLinks = JSON.parse(JSON.stringify(conv.finalLinks)) as RipLink[];

  // Disable split horizon on all nodes
  currentNodes.forEach((n) => {
    n.splitHorizonEnabled = false;
    n.poisonReverseEnabled = false;
  });

  // Link Cut on R3-R4
  const failedLink = currentLinks.find((l) => l.id === "link-r3-r4")!;
  failedLink.status = "down";

  // Step 1: Link cuts, R3 loses direct path
  const r3 = currentNodes.find((n) => n.id === "r3")!;
  const r2 = currentNodes.find((n) => n.id === "r2")!;

  steps.push({
    stepIndex: 1,
    title: "Step 1: Link R3-R4 Fails (Split Horizon OFF)",
    description:
      "R3 loses its direct connection to 192.168.4.0/24. But R2 still has its old cached entry: `192.168.4.0/24 via R3 (Metric 3)`.",
    phase: "loop_count",
    activeNodeId: "r3",
    activeLinkIds: ["link-r3-r4"],
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "R3# %LINK-3-UPDOWN: Interface FastEthernet0/3, changed state to down", type: "error" },
      { text: "R2# (Split Horizon disabled: R2 advertises 192.168.4.0/24 [Metric 3] back to R3!)", type: "warning" },
    ],
    eventExplanation: {
      beginner:
        "Router 3 lost its connection to Network 4. But because Split Horizon is TURNED OFF, Router 2 is about to tell Router 3: 'Hey, I can reach Network 4 in 3 hops!'",
      advanced:
        "Mutual deception condition: R2's route to Network 4 originally traversed R3. Without Split Horizon, R2 advertises this route back out to R3.",
      protocolRule: "RFC 1058: Without Split Horizon, routers advertise routes back to the neighbor they learned them from.",
      fieldsChanged: ["Split Horizon: DISABLED", "Mutual Deception: Primed"],
    },
  });

  // Step 2: R3 accepts R2's bogus advertisement -> Metric 4
  const r3Route = r3.routingTable.find((r) => r.network === "192.168.4.0")!;
  if (r3Route) {
    r3Route.metric = 4;
    r3Route.nextHop = "10.0.2.1"; // R2
  }

  steps.push({
    stepIndex: 2,
    title: "Step 2: Loop Step 1 — R3 Believes R2 and Sets Metric = 4 via R2",
    description:
      "R3 thinks R2 has a backup path. R3 installs `192.168.4.0/24 via R2 (Metric 3+1 = 4)`. A forwarding loop is now active between R2 and R3!",
    phase: "loop_count",
    activeNodeId: "r3",
    activeLinkIds: ["link-r2-r3"],
    senderId: "r2",
    receiverIds: ["r3"],
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "R3# RIP: received update from 10.0.2.1 (R2): 192.168.4.0/24 metric 3", type: "info" },
      { text: "R3# %RTM-5-RTADD: Updated R 192.168.4.0/24 via 10.0.2.1 [120/4]", type: "error" },
      { text: "R3# (Routing Loop: R2 points to R3, and R3 points to R2!)", type: "error" },
    ],
    eventExplanation: {
      beginner:
        "Router 3 is fooled! It thinks Router 2 has a separate backdoor to Network 4, so it points its traffic to Router 2. But Router 2 was pointing to Router 3!",
      advanced:
        "Two-node routing loop formed: `FIB(R3)[192.168.4.0/24] -> NextHop R2` while `FIB(R2)[192.168.4.0/24] -> NextHop R3`. Any transit packet will bounce until IP TTL expires.",
      protocolRule: "Classic Distance-Vector Failure: Bellman-Ford cannot distinguish between alternative paths and self-referential loops.",
      fieldsChanged: ["R3 Next-Hop: Changed to R2", "R3 Metric: 4", "Loop: ACTIVE (R2 <-> R3)"],
    },
  });

  // Step 3: R3 advertises metric 4 to R2 -> R2 updates to Metric 5
  const r2Route = r2.routingTable.find((r) => r.network === "192.168.4.0")!;
  if (r2Route) {
    r2Route.metric = 5;
    r2Route.nextHop = "10.0.2.2";
  }

  steps.push({
    stepIndex: 3,
    title: "Step 3: Loop Step 2 — R2 Accepts Metric 4 and Bumps Metric to 5",
    description:
      "R3 advertises metric 4 back to R2. Since R2 uses R3 as next-hop, R2 increases its metric to `4+1 = 5` and advertises it back!",
    phase: "loop_count",
    activeNodeId: "r2",
    activeLinkIds: ["link-r2-r3"],
    senderId: "r3",
    receiverIds: ["r2"],
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "R2# RIP: update from 10.0.2.2 (R3): 192.168.4.0/24 metric 4", type: "info" },
      { text: "R2# %RTM-5-RTMOD: Increased metric to [120/5] via 10.0.2.2", type: "error" },
      { text: "R2# ping 192.168.4.1", type: "command" },
      { text: "ICMP: Packet TTL expired in transit (Loop between 10.0.2.1 and 10.0.2.2)", type: "error" },
    ],
    eventExplanation: {
      beginner:
        "The Count-to-Infinity spiral begins! Router 2 sees Router 3's new cost of 4, so Router 2 bumps its own cost to 5 and tells Router 3.",
      advanced:
        "Monotonic metric inflation: Each update interval increments the hop counter by 1. Without Split Horizon, the count will crawl all the way to 16.",
      protocolRule: "RFC 1058: This exact flaw necessitated the definition of Metric 16 as Infinity.",
      fieldsChanged: ["R2 Metric: 5", "R3 Metric: 4", "Loop State: Escalating"],
    },
  });

  // Step 4: Progression to 16 (Infinity)
  if (r3Route) r3Route.metric = 16;
  if (r2Route) r2Route.metric = 16;

  steps.push({
    stepIndex: 4,
    title: "Step 4: Count Reaches 16 (Infinity) — Loop Finally Terminates",
    description:
      "After 16 rounds of mutual metric increments (1 -> 2 -> 3 ... -> 16), the metric reaches 16 (Infinity). The route is finally discarded.",
    phase: "converged",
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    links: JSON.parse(JSON.stringify(currentLinks)),
    cliOutputs: [
      { text: "R2# RIP: 192.168.4.0/24 metric reached 16 (INFINITY) - FLUSHING", type: "error" },
      { text: "R3# RIP: 192.168.4.0/24 metric reached 16 (INFINITY) - FLUSHING", type: "error" },
      { text: "%RTM-5-RTDEL: Deleted route 192.168.4.0/24 from routing table", type: "warning" },
    ],
    eventExplanation: {
      beginner:
        "They finally reached 16! In RIP, 16 is defined as 'Infinity'. Both routers give up and delete the route. But in real life, this took minutes of looping traffic!",
      advanced:
        "Count-to-Infinity termination: Max hop metric of 15 prevents indefinite loops. In production without Split Horizon, $16 \\times 30\\text{s} = 8$ minutes of routing blackout occurred.",
      protocolRule: "RFC 2453: Defining $\\infty = 16$ bounds the worst-case convergence time of unconstrained distance-vector routing.",
      fieldsChanged: ["Metric: 16 (Infinity)", "RIB Entry: FLUSHED", "Loop: Terminated"],
    },
  });

  return {
    steps,
    finalNodes: currentNodes,
    finalLinks: currentLinks,
    convergenceRounds: 16,
    loopDetected: true,
  };
}

// -----------------------------------------------------------------------------
// Scenario 4: RIPv2 VLSM & Route Tagging
// -----------------------------------------------------------------------------
function buildVlsmTaggingScenario(
  config: RipConfig,
  nodes: RipNode[],
  links: RipLink[]
): RipSimulationOutcome {
  const currentNodes = JSON.parse(JSON.stringify(nodes)) as RipNode[];
  const currentLinks = JSON.parse(JSON.stringify(links)) as RipLink[];

  const r1 = currentNodes.find((n) => n.id === "r1")!;
  r1.interfaces[0].network = "192.168.1.0/27";
  r1.interfaces[0].subnetMask = "255.255.255.224";

  const vlsmEntries: RipRouteTableEntry[] = [
    { addressFamily: 2, routeTag: 100, ipAddress: "192.168.1.0", subnetMask: "255.255.255.224", nextHop: "0.0.0.0", metric: 1 },
    { addressFamily: 2, routeTag: 200, ipAddress: "10.0.1.0", subnetMask: "255.255.255.252", nextHop: "0.0.0.0", metric: 1 },
  ];

  const packet = createRipResponsePacket({
    version: "ripv2",
    sourceIp: "10.0.1.1",
    destIp: "224.0.0.9",
    entries: vlsmEntries,
  });

  const steps: RipSimulationStepState[] = [
    {
      stepIndex: 0,
      title: "Step 0: RIPv2 Classless Configuration",
      description:
        "R1 is configured with custom subnets: 192.168.1.0/27 (/27 = 30 hosts) and 10.0.1.0/30 (point-to-point link) with Route Tag 100 (BGP AS 100).",
      phase: "init",
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      links: JSON.parse(JSON.stringify(currentLinks)),
      cliOutputs: [
        { text: "R1# show ip interface brief", type: "command" },
        { text: "FastEthernet0/0    192.168.1.1     YES manual up   up   (255.255.255.224 - /27)", type: "info" },
        { text: "FastEthernet0/1    10.0.1.1        YES manual up   up   (255.255.255.252 - /30)", type: "info" },
      ],
      eventExplanation: {
        beginner:
          "RIPv2 allows custom subnet masks (/27, /30) instead of old rigid classful limits. It also lets us attach tags to mark where routes came from.",
        advanced:
          "Classless Routing: RFC 2453 transmits explicit 32-bit subnet masks, enabling Variable Length Subnet Masking (VLSM) and CIDR prefix aggregation.",
        protocolRule: "RFC 2453 §3.4: Subnet mask field enables non-contiguous and variable subnet lengths.",
        fieldsChanged: ["VLSM Subnets: /27 and /30", "Route Tag: 100"],
      },
    },
    {
      stepIndex: 1,
      title: "Step 1: R1 Transmits Classless RTE with Subnet Mask and Tag",
      description:
        "R1 multicasts RIPv2 response to 224.0.0.9 containing 32-bit subnet mask (255.255.255.224) and Route Tag 0x0064.",
      phase: "periodic_broadcast",
      activeNodeId: "r1",
      activeLinkIds: ["link-r1-r2"],
      activePacket: packet,
      senderId: "r1",
      receiverIds: ["r2"],
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      links: JSON.parse(JSON.stringify(currentLinks)),
      cliOutputs: [
        { text: "R1# debug ip rip", type: "command" },
        { text: "RIP: sending v2 update to 224.0.0.9 via FastEthernet0/1", type: "info" },
        { text: "RIP:   192.168.1.0/27 (mask 255.255.255.224) tag 100 metric 1", type: "success" },
        { text: "R2# %RTM-5-RTADD: Installed R 192.168.1.0/27 [120/2] tag 100 via 10.0.1.1", type: "success" },
      ],
      eventExplanation: {
        beginner:
          "Router 2 receives the exact subnet mask /27 and tag 100, installing an accurate route without any confusion.",
        advanced:
          "R2 verifies checksum and parses 20-byte RTEs. Subnet mask `255.255.255.224` is stored directly into the trie/FIB data structure.",
        protocolRule: "RFC 2453: Route Tag field enables policy routing and BGP/OSPF mutual redistribution filters.",
        fieldsChanged: ["R2 FIB: Installed /27 prefix", "Route Tag: Preserved (100)"],
      },
    },
  ];

  return {
    steps,
    finalNodes: currentNodes,
    finalLinks: currentLinks,
    convergenceRounds: 1,
    loopDetected: false,
  };
}

// -----------------------------------------------------------------------------
// Scenario 5: Next-Hop Optimization on Multi-Access Ethernet
// -----------------------------------------------------------------------------
function buildNextHopOptimizationScenario(
  config: RipConfig,
  nodes: RipNode[],
  links: RipLink[]
): RipSimulationOutcome {
  const currentNodes = JSON.parse(JSON.stringify(nodes)) as RipNode[];
  const currentLinks = JSON.parse(JSON.stringify(links)) as RipLink[];

  const redirectEntry: RipRouteTableEntry = {
    addressFamily: 2,
    routeTag: 0,
    ipAddress: "192.168.50.0",
    subnetMask: "255.255.255.0",
    nextHop: "10.0.1.3", // R3 is the optimal next-hop on shared LAN
    metric: 1,
  };

  const packet = createRipResponsePacket({
    version: "ripv2",
    sourceIp: "10.0.1.1", // R1
    destIp: "224.0.0.9",
    entries: [redirectEntry],
  });

  const steps: RipSimulationStepState[] = [
    {
      stepIndex: 0,
      title: "Step 0: Shared Multi-Access Ethernet Segment",
      description:
        "R1, R2, and R3 share a common LAN switch (10.0.1.0/24). R1 learns a route to 192.168.50.0/24 via R3 (10.0.1.3).",
      phase: "init",
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      links: JSON.parse(JSON.stringify(currentLinks)),
      cliOutputs: [
        { text: "R1# show ip rip database", type: "command" },
        { text: "192.168.50.0/24 [1] directly connected to R3 (10.0.1.3) on shared LAN", type: "info" },
      ],
      eventExplanation: {
        beginner:
          "All three routers are plugged into the same local switch. If R1 knows R3 has the fastest path, R1 can tell R2 to send directly to R3.",
        advanced:
          "Shared Broadcast Media Optimization: When an advertising router knows the destination is directly reachable via a third router on the same broadcast subnet, it populates Next-Hop with the third router's IP.",
        protocolRule: "RFC 2453 §3.4: Next-Hop field allows avoiding triangular routing on multi-access networks.",
        fieldsChanged: ["Shared Segment: 10.0.1.0/24", "Target Gateway: 10.0.1.3 (R3)"],
      },
    },
    {
      stepIndex: 1,
      title: "Step 1: R1 Advertises Route with Next-Hop = 10.0.1.3",
      description:
        "R1 broadcasts RTE with Next-Hop field set to 10.0.1.3 (R3). R2 receives the packet and installs R3 as its direct next-hop, saving 1 full hop.",
      phase: "periodic_broadcast",
      activeNodeId: "r1",
      activeLinkIds: ["link-r1-r2"],
      activePacket: packet,
      senderId: "r1",
      receiverIds: ["r2"],
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      links: JSON.parse(JSON.stringify(currentLinks)),
      cliOutputs: [
        { text: "R1# RIP: sending v2 update with Next-Hop: 10.0.1.3", type: "info" },
        { text: "R2# RIP: received update from 10.0.1.1 on FastEthernet0/1", type: "success" },
        { text: "R2# %RTM-5-RTADD: Installed R 192.168.50.0/24 [120/2] via 10.0.1.3 (Direct shortcut!)", type: "success" },
      ],
      eventExplanation: {
        beginner:
          "Router 2 takes the shortcut! Instead of sending traffic to R1 first, R2 sends straight to R3, saving time and bandwidth.",
        advanced:
          "R2 recognizes that Next-Hop `10.0.1.3` resides on the same local subnet (`10.0.1.0/24`) as ingress interface Fa0/1, and binds `10.0.1.3` directly in the ARP/FIB table.",
        protocolRule: "RFC 2453: Prevents extra hops on Ethernet exchange points (IXPs) and broadcast LANs.",
        fieldsChanged: ["R2 Next-Hop: 10.0.1.3 (Direct)", "Triangular Routing: Eliminated"],
      },
    },
  ];

  return {
    steps,
    finalNodes: currentNodes,
    finalLinks: currentLinks,
    convergenceRounds: 1,
    loopDetected: false,
  };
}

// -----------------------------------------------------------------------------
// Scenario 6: RIP Route Timers Lifecycle
// -----------------------------------------------------------------------------
function buildRouteTimersLifecycleScenario(
  config: RipConfig,
  nodes: RipNode[],
  links: RipLink[]
): RipSimulationOutcome {
  const currentNodes = JSON.parse(JSON.stringify(nodes)) as RipNode[];
  const currentLinks = JSON.parse(JSON.stringify(links)) as RipLink[];

  const steps: RipSimulationStepState[] = [
    {
      stepIndex: 0,
      title: "Step 0: Route Active & Healthy (Update Timer: 30s)",
      description:
        "The route to 192.168.4.0/24 is active. The periodic update timer refreshes every 30 seconds, keeping Age = 0s.",
      phase: "init",
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      links: JSON.parse(JSON.stringify(currentLinks)),
      cliOutputs: [
        { text: "R1# show ip route 192.168.4.0", type: "command" },
        { text: "Routing entry for 192.168.4.0/24", type: "info" },
        { text: "  Known via \"rip\", distance 120, metric 4, type intra-area", type: "info" },
        { text: "  Last update from 10.0.1.2 on FastEthernet0/1, 00:00:05 ago", type: "success" },
        { text: "  Route is valid, Update timer in 25s", type: "success" },
      ],
      eventExplanation: {
        beginner:
          "A healthy route receives a 'heartbeat' every 30 seconds. As long as updates arrive, the timer resets and the path stays open.",
        advanced:
          "RFC 2453 Timer State Machine: Periodic updates reset `AgeSeconds = 0`. The route remains in state `VALID` with AD 120.",
        protocolRule: "RFC 2453 §3.8: Update Timer defaults to 30 seconds.",
        fieldsChanged: ["Route State: VALID", "Age: 5s", "Next Update: 25s"],
      },
    },
    {
      stepIndex: 1,
      title: "Step 1: Invalid Timer Expired (180s Without Updates)",
      description:
        "No updates received for 180 seconds (6 consecutive missed updates). The route is marked as Invalid (Metric 16 / Inaccessible).",
      phase: "triggered_flash",
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      links: JSON.parse(JSON.stringify(currentLinks)),
      cliOutputs: [
        { text: "R1# %RIP-4-TIMEROVER: Invalid timer (180s) expired for 192.168.4.0/24", type: "warning" },
        { text: "R1# Route marked as INACCESSIBLE (Metric 16)", type: "error" },
        { text: "R1# Holddown timer (180s) initiated - suppressing route updates", type: "warning" },
      ],
      eventExplanation: {
        beginner:
          "After 180 seconds of silence, the router assumes the destination is broken. It marks the distance as 16 (Infinite) and enters a 'Wait & Hold' period.",
        advanced:
          "Invalid Timer Expiration: When Age reaches 180s, the router transitions the route to `state = poisoned, metric = 16`. Holddown timer begins to suppress route flapping.",
        protocolRule: "RFC 2453 §3.8: Invalid timer defaults to 180s (6x the update timer).",
        fieldsChanged: ["State: POISONED / INVALID", "Metric: 16", "Holddown: ACTIVE"],
      },
    },
    {
      stepIndex: 2,
      title: "Step 2: Flush Timer Reached (240s) — Route Purged From RIB",
      description:
        "The Flush / Garbage Collection timer (240s total) expires. The dead route is completely expunged from the routing table.",
      phase: "converged",
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      links: JSON.parse(JSON.stringify(currentLinks)),
      cliOutputs: [
        { text: "R1# %RIP-5-FLUSH: Flush timer (240s) expired for 192.168.4.0/24", type: "error" },
        { text: "R1# %RTM-5-RTDEL: Route completely purged from FIB", type: "info" },
        { text: "R1# show ip route rip", type: "command" },
        { text: "  (Route 192.168.4.0/24 is no longer in routing table)", type: "info" },
      ],
      eventExplanation: {
        beginner:
          "After 240 seconds, the router cleans up its table and completely deletes the dead route to save memory.",
        advanced:
          "Garbage Collection / Flush Timer: 60 seconds after invalidation (240s from initial silence), the RIB purges the prefix and hardware FIB entries.",
        protocolRule: "RFC 2453 §3.8: Flush timer defaults to 240s (or 60s after invalidation).",
        fieldsChanged: ["RIB Entry: COMPLETELY PURGED", "FIB Slots: Freed"],
      },
    },
  ];

  return {
    steps,
    finalNodes: currentNodes,
    finalLinks: currentLinks,
    convergenceRounds: 3,
    loopDetected: false,
  };
}

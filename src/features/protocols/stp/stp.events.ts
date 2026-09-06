import type {
  SimulationEvent,
  Packet,
} from "@/features/simulation/simulation-types";
import type {
  StpSwitchNode,
  StpLink,
  StpPort,
  StpConfig,
  StpScenarioId,
  StpSimulationStepState,
  BpduFrame,
} from "./stp.types";
import {
  runSpanningTreeAlgorithm,
  createBpduFrame,
  formatBridgeId,
} from "./stp-engine";

export function buildStpSimulationSequence(
  switches: StpSwitchNode[],
  links: StpLink[],
  config: StpConfig
): {
  events: SimulationEvent[];
  packets: Packet[];
  steps: StpSimulationStepState[];
} {
  const scenarioId: StpScenarioId = config.scenarioId || "standard_convergence";
  const version = config.version || "stp";

  const steps: StpSimulationStepState[] = [];
  const events: SimulationEvent[] = [];
  const packets: Packet[] = [];

  // Helper to push step, packet, and event
  const addStep = (params: {
    title: string;
    description: string;
    switchesState: StpSwitchNode[];
    linksState: StpLink[];
    activeBpdu?: BpduFrame;
    activeLinkIds: string[];
    loopActive: boolean;
    explanation: {
      beginner: string;
      advanced: string;
      protocolRule: string;
      tieBreakerUsed?: string;
    };
    sourceNodeId?: string;
    destNodeId?: string;
    eventType?: string;
    severity?: "info" | "warning" | "error" | "success";
  }) => {
    const stepNum = steps.length;
    const blockedPorts: string[] = [];
    const rootPorts: string[] = [];
    const designatedPorts: string[] = [];

    for (const sw of params.switchesState) {
      for (const p of sw.ports) {
        if (p.role === "alternate" || p.role === "backup" || p.state === "blocking" || p.state === "discarding") {
          blockedPorts.push(p.id);
        } else if (p.role === "root") {
          rootPorts.push(p.id);
        } else if (p.role === "designated") {
          designatedPorts.push(p.id);
        }
      }
    }

    const stepState: StpSimulationStepState = {
      step: stepNum,
      title: params.title,
      description: params.description,
      switches: JSON.parse(JSON.stringify(params.switchesState)),
      links: JSON.parse(JSON.stringify(params.linksState)),
      activeBpdu: params.activeBpdu ? JSON.parse(JSON.stringify(params.activeBpdu)) : undefined,
      activeLinkIds: params.activeLinkIds,
      blockedPortIds: blockedPorts,
      rootPortIds: rootPorts,
      designatedPortIds: designatedPorts,
      loopActive: params.loopActive,
      eventExplanation: params.explanation,
    };
    steps.push(stepState);

    const pktId = `stp-pkt-${stepNum}`;
    const srcNode = params.sourceNodeId || params.switchesState[0]?.id || "sw1";
    const dstNode = params.destNodeId || params.switchesState[1]?.id || "sw2";

    // Packet representation for PacketInspector
    const bpdu = params.activeBpdu;
    packets.push({
      id: pktId,
      protocol: version === "rstp" ? "RSTP" : "STP",
      label: bpdu ? `${bpdu.type.toUpperCase()} BPDU (Root: ${formatBridgeId(bpdu.rootBridgeId)})` : "STP Frame",
      source: srcNode,
      destination: dstNode,
      size: 64,
      status: "delivered",
      colorKey: bpdu?.type === "tcn" ? "yellow" : bpdu?.flags.agreement ? "green" : "blue",
      createdAt: stepNum * 100,
      headers: {
        ethernet: {
          destinationMac: bpdu?.destMac ?? "01:80:C2:00:00:00",
          sourceMac: bpdu?.sourceMac ?? "00:1A:2B:3C:4D:01",
          lengthType: "0x0038 (802.3 LLC)",
          llcControl: "0x424203 (STP Control)",
        },
        application: {
          protocolIdentifier: "0x0000 (IEEE 802.1D STP)",
          protocolVersion: bpdu?.version === 2 ? "2 (RSTP 802.1w)" : "0 (STP 802.1D)",
          bpduType: bpdu?.type === "tcn" ? "0x80 (TCN)" : bpdu?.type === "rstp" ? "0x02 (RSTP)" : "0x00 (Config BPDU)",
          flags: bpdu ? `TC:${bpdu.flags.topologyChange ? 1 : 0} TCA:${bpdu.flags.topologyChangeAck ? 1 : 0} Prop:${bpdu.flags.proposal ? 1 : 0} Agr:${bpdu.flags.agreement ? 1 : 0} Role:${bpdu.flags.portRole}` : "None",
          rootBridgeId: bpdu ? formatBridgeId(bpdu.rootBridgeId) : "None",
          rootPathCost: bpdu?.rootPathCost ?? 0,
          senderBridgeId: bpdu ? formatBridgeId(bpdu.senderBridgeId) : "None",
          portId: bpdu ? `${bpdu.portId.priority}.${bpdu.portId.number}` : "128.1",
          messageAge: `${bpdu?.messageAge ?? 0}s`,
          maxAge: `${bpdu?.maxAge ?? 20}s`,
          helloTime: `${bpdu?.helloTime ?? 2}s`,
          forwardDelay: `${bpdu?.forwardDelay ?? 15}s`,
        },
      },
      payload: `BPDU Frame: RootBID=${bpdu ? formatBridgeId(bpdu.rootBridgeId) : "N/A"}, PathCost=${bpdu?.rootPathCost ?? 0}`,
    });

    events.push({
      id: `stp-evt-${stepNum}`,
      timestamp: stepNum * 500,
      sequenceNumber: stepNum + 1,
      type: "state-change",
      sourceNodeId: srcNode,
      destinationNodeId: dstNode,
      protocol: version === "rstp" ? "RSTP" : "STP",
      title: params.title,
      description: params.description,
      status: "completed",
      severity: params.severity || "info",
      packetId: pktId,
      metadata: {
        step: stepNum,
        loopActive: params.loopActive,
        activeBpdu: bpdu,
      },
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // SCENARIO 1: Standard Convergence (802.1D Classic STP)
  // ─────────────────────────────────────────────────────────────────────────────
  if (scenarioId === "standard_convergence") {
    const calc = runSpanningTreeAlgorithm(switches, links, { version: "stp" });
    const rootSw = calc.rootSwitch;

    // Step 0: Power-on Initial State
    const initSwitches: StpSwitchNode[] = switches.map((sw) => ({
      ...sw,
      isRoot: true,
      rootBridgeId: sw.bridgeId,
      rootPathCost: 0,
      rootPortId: null,
      ports: sw.ports.map((p) => ({ ...p, role: "designated", state: "blocking" })),
    }));
    const sw1Bpdu = createBpduFrame(initSwitches[0], initSwitches[0].ports[0]);
    addStep({
      title: "1. Power-On & Initial Root Claims",
      description:
        "Every switch powers on assuming it is the Root Bridge and transmits Configuration BPDUs advertising its own Bridge ID.",
      switchesState: initSwitches,
      linksState: links,
      activeBpdu: sw1Bpdu,
      activeLinkIds: [links[0]?.id || ""],
      loopActive: true,
      severity: "warning",
      sourceNodeId: initSwitches[0]?.id,
      destNodeId: initSwitches[1]?.id,
      explanation: {
        beginner:
          "Before discovering other switches, each bridge claims to be the Root and broadcasts BPDUs with its own ID.",
        advanced:
          "IEEE 802.1D Clause 8.6: BPDUs initialized with Root BID = Sender BID, Root Path Cost = 0, Message Age = 0.",
        protocolRule: "Initial State: Root BID = Self BID, All active ports enter Blocking / Listening.",
      },
    });

    // Step 1: BPDU Propagation & Root Bridge Election
    const electingSwitches: StpSwitchNode[] = initSwitches.map((sw) => ({
      ...sw,
      isRoot: sw.id === rootSw.id,
      rootBridgeId: rootSw.bridgeId,
      rootPathCost: sw.id === rootSw.id ? 0 : 4,
    }));
    const rootBpdu = createBpduFrame(rootSw, rootSw.ports[0]);
    addStep({
      title: "2. Superior BPDU & Root Election",
      description: `Switch ${rootSw.label} has the lowest Bridge ID (${formatBridgeId(rootSw.bridgeId)}) and is elected the Root Bridge.`,
      switchesState: electingSwitches,
      linksState: links,
      activeBpdu: rootBpdu,
      activeLinkIds: [links[0]?.id || "", links[1]?.id || ""],
      loopActive: true,
      severity: "success",
      sourceNodeId: rootSw.id,
      destNodeId: switches.find((s) => s.id !== rootSw.id)?.id || switches[1]?.id,
      explanation: {
        beginner: `Switch ${rootSw.label} wins the election because it has the lowest priority (${rootSw.bridgeId.priority})!`,
        advanced: `Bridge ID comparison: ${formatBridgeId(rootSw.bridgeId)} is numerically lowest among all received BPDUs.`,
        protocolRule: "Lowest Bridge ID (Priority -> System Extension -> MAC Address) wins Root Bridge election.",
        tieBreakerUsed: `Priority ${rootSw.bridgeId.priority} is lower than 32768.`,
      },
    });

    // Step 2: Root Port (RP) Selection
    const rpSwitches: StpSwitchNode[] = JSON.parse(JSON.stringify(electingSwitches));
    for (const sw of rpSwitches) {
      if (!sw.isRoot && sw.rootPortId) {
        const rp = sw.ports.find((p) => p.id === sw.rootPortId);
        if (rp) rp.role = "root";
      }
    }
    addStep({
      title: "3. Root Port (RP) Selection",
      description:
        "Each non-root switch selects the single port with the lowest cumulative Root Path Cost to the Root Bridge.",
      switchesState: rpSwitches,
      linksState: links,
      activeBpdu: rootBpdu,
      activeLinkIds: [links[0]?.id || ""],
      loopActive: true,
      severity: "info",
      sourceNodeId: rootSw.id,
      destNodeId: switches[1]?.id,
      explanation: {
        beginner:
          "Non-root switches pick their best direct path to the Root Bridge. This becomes their Root Port (RP).",
        advanced:
          "Root Path Cost is accumulated by adding ingress port cost (GigabitEthernet cost = 4) to received BPDU RPC.",
        protocolRule: "Exactly one Root Port per non-root bridge.",
      },
    });

    // Step 3: Designated & Blocked Ports (Loop Breaking)
    const blockedSwitches: StpSwitchNode[] = JSON.parse(JSON.stringify(calc.switches));
    for (const sw of blockedSwitches) {
      for (const p of sw.ports) {
        if (p.role === "alternate") p.state = "blocking";
        else p.state = "listening";
      }
    }
    addStep({
      title: "4. Designated Port Election & Loop Breaking",
      description:
        "Designated Ports are chosen for each link. Redundant ports are placed in Blocking state, breaking all Layer 2 loops.",
      switchesState: blockedSwitches,
      linksState: links,
      activeBpdu: rootBpdu,
      activeLinkIds: [links[2]?.id || ""],
      loopActive: false,
      severity: "success",
      sourceNodeId: switches[1]?.id,
      destNodeId: switches[2]?.id,
      explanation: {
        beginner:
          "The link between SW-2 and SW-3 had two paths to the Root. SW-3 blocked its port Gi0/2, eliminating the loop!",
        advanced:
          "On segment SW2-SW3, SW2 wins Designated Port due to lower Bridge ID (00:1A:..:02 < 00:1A:..:03). SW3 Gi0/2 becomes Alternate/Blocked.",
        protocolRule: "One Designated Port per segment. Non-root, non-designated ports transition to Blocking.",
        tieBreakerUsed: "Bridge ID tie-break: SW-2 MAC is lower than SW-3 MAC.",
      },
    });

    // Step 4: Listening State (15s Forward Delay)
    const listeningSwitches: StpSwitchNode[] = JSON.parse(JSON.stringify(blockedSwitches));
    for (const sw of listeningSwitches) {
      for (const p of sw.ports) {
        if (p.role !== "alternate") p.state = "listening";
      }
    }
    addStep({
      title: "5. Listening State (15s Forward Delay)",
      description:
        "Root and Designated ports enter Listening state for 15 seconds. Data frames are dropped while BPDUs are processed.",
      switchesState: listeningSwitches,
      linksState: links,
      activeBpdu: rootBpdu,
      activeLinkIds: [links[0]?.id || "", links[1]?.id || ""],
      loopActive: false,
      severity: "info",
      explanation: {
        beginner:
          "Listening state ensures no leftover packets circulate before switches start forwarding traffic.",
        advanced:
          "IEEE 802.1D Clause 8.4: Forward Delay timer (15s) allows obsolete topology information to age out before MAC learning begins.",
        protocolRule: "Forward Delay #1: Listening state (Drops data frames, no MAC learning, processes BPDUs).",
      },
    });

    // Step 5: Learning State (15s Forward Delay)
    const learningSwitches: StpSwitchNode[] = JSON.parse(JSON.stringify(blockedSwitches));
    for (const sw of learningSwitches) {
      for (const p of sw.ports) {
        if (p.role !== "alternate") p.state = "learning";
      }
    }
    addStep({
      title: "6. Learning State (15s Forward Delay)",
      description:
        "Ports enter Learning state for 15 seconds. Switches populate MAC address tables (CAM) from source MACs without forwarding data.",
      switchesState: learningSwitches,
      linksState: links,
      activeBpdu: rootBpdu,
      activeLinkIds: [links[0]?.id || "", links[1]?.id || ""],
      loopActive: false,
      severity: "info",
      explanation: {
        beginner:
          "In Learning state, switches record connected devices' MAC addresses to minimize initial packet flooding.",
        advanced:
          "Ingress frames populate the MAC forwarding table, but no frames are switched to egress ports yet.",
        protocolRule: "Forward Delay #2: Learning state (Drops data frames, learns MAC addresses, processes BPDUs).",
      },
    });

    // Step 6: Converged Tree - Forwarding State
    const finalSwitches = calc.switches;
    addStep({
      title: "7. Fully Converged & Forwarding (30s Total)",
      description:
        "Spanning Tree is fully converged! Active ports are Forwarding data frames; blocked ports remain in standby loop-free.",
      switchesState: finalSwitches,
      linksState: links,
      activeBpdu: rootBpdu,
      activeLinkIds: [links[0]?.id || "", links[1]?.id || ""],
      loopActive: false,
      severity: "success",
      explanation: {
        beginner:
          "Network is ready for high-speed, loop-free data transmission! If an active link fails, the blocked port will take over.",
        advanced:
          "Stable Spanning Tree topology established. Root Bridge transmits periodic Hello BPDUs every 2 seconds.",
        protocolRule: "Converged Tree: Root Ports & Designated Ports = Forwarding. Alternate Ports = Blocking.",
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SCENARIO 2: Root Link Failure & TCN Recovery
  // ─────────────────────────────────────────────────────────────────────────────
  else if (scenarioId === "root_link_failure") {
    const calcBefore = runSpanningTreeAlgorithm(switches, links, { version: "stp" });
    const failedLink = links[0]; // link-sw1-sw2
    const calcAfter = runSpanningTreeAlgorithm(switches, links, {
      failedLinkId: failedLink?.id,
      version: "stp",
    });

    // Step 0: Converged Normal Tree
    addStep({
      title: "1. Normal Converged State",
      description: "Network is operating normally with SW1 as Root Bridge and SW3-Gi0/2 in Blocking state.",
      switchesState: calcBefore.switches,
      linksState: links,
      activeBpdu: createBpduFrame(calcBefore.rootSwitch, calcBefore.rootSwitch.ports[0]),
      activeLinkIds: [links[0]?.id || "", links[1]?.id || ""],
      loopActive: false,
      severity: "success",
      explanation: {
        beginner: "Normal baseline state prior to link failure.",
        advanced: "Spanning Tree converged, Hello BPDUs flowing from SW1.",
        protocolRule: "Periodic Hello Timer: 2.0 seconds.",
      },
    });

    // Step 1: Link Failure
    const failedLinksState = links.map((l) => (l.id === failedLink?.id ? { ...l, enabled: false } : l));
    const sw2Down: StpSwitchNode[] = JSON.parse(JSON.stringify(calcBefore.switches));
    const sw2 = sw2Down.find((s: StpSwitchNode) => s.id === "sw2");
    if (sw2) {
      const p1 = sw2.ports.find((p: StpPort) => p.id === "sw2-p1");
      if (p1) {
        p1.role = "disabled";
        p1.state = "disabled";
      }
    }
    addStep({
      title: "2. Active Root Link Severed!",
      description: `Physical connection on ${failedLink?.id || "link"} went DOWN. SW2 lost its Root Port connection to SW1.`,
      switchesState: sw2Down,
      linksState: failedLinksState,
      activeLinkIds: [],
      loopActive: false,
      severity: "error",
      sourceNodeId: "sw2",
      destNodeId: "sw1",
      explanation: {
        beginner: "The primary cable connecting SW-2 to the Root Bridge was disconnected or failed.",
        advanced: "Loss of carrier signal / loss of 3 consecutive Hello BPDUs causes immediate link failure.",
        protocolRule: "Link Failure: Port role changed to Disabled; triggers Topology Change event.",
      },
    });

    // Step 2: TCN BPDU Generation
    const sw2Tcn: StpSwitchNode[] = JSON.parse(JSON.stringify(sw2Down));
    const tcnSender = sw2Tcn.find((s: StpSwitchNode) => s.id === "sw2") || sw2Tcn[1];
    const tcnBpdu = createBpduFrame(tcnSender, tcnSender.ports[1] || tcnSender.ports[0], "tcn");
    addStep({
      title: "3. Topology Change Notification (TCN BPDU)",
      description: "SW2 detects the failure and sends a TCN BPDU (Type 0x80) towards SW3 to reach the Root Bridge.",
      switchesState: sw2Tcn,
      linksState: failedLinksState,
      activeBpdu: tcnBpdu,
      activeLinkIds: [links[2]?.id || ""],
      loopActive: false,
      severity: "warning",
      sourceNodeId: "sw2",
      destNodeId: "sw3",
      explanation: {
        beginner: "SW2 immediately shouts to neighboring switches: 'The topology changed! Tell the Root Bridge!'",
        advanced: "TCN frame uses BPDU Type 0x80 (no payload other than protocol ID and version).",
        protocolRule: "Non-root switch sends TCN BPDU upstream via its alternate/available path.",
      },
    });

    // Step 3: Upstream Acknowledgement (TCA Flag)
    const sw3Tca: StpSwitchNode[] = JSON.parse(JSON.stringify(sw2Tcn));
    const tcaBpdu = createBpduFrame(sw3Tca[2], sw3Tca[2].ports[0], "config", { topologyChangeAck: true });
    addStep({
      title: "4. TCN Acknowledgment (TCA Bit Set)",
      description: "SW3 acknowledges SW2's TCN by setting the Topology Change Acknowledgment (TCA) bit.",
      switchesState: sw3Tca,
      linksState: failedLinksState,
      activeBpdu: tcaBpdu,
      activeLinkIds: [links[1]?.id || ""],
      loopActive: false,
      severity: "info",
      sourceNodeId: "sw3",
      destNodeId: "sw1",
      explanation: {
        beginner: "SW3 confirms receipt of the alert and relays the change notification up to Root Bridge SW1.",
        advanced: "Bit 7 (TCA) of BPDU Flags byte is set to 1 in next outgoing Configuration BPDU.",
        protocolRule: "Upstream designated bridge sets TCA flag and relays TCN to Root Bridge.",
      },
    });

    // Step 4: Root Bridge TC Broadcast & CAM Aging Timer Reduction
    const swRootTc: StpSwitchNode[] = JSON.parse(JSON.stringify(sw3Tca));
    for (const sw of swRootTc) {
      sw.camAgingTime = 15;
      sw.topologyChangeFlag = true;
    }
    const tcBpdu = createBpduFrame(swRootTc[0], swRootTc[0].ports[1], "config", { topologyChange: true });
    addStep({
      title: "5. Root TC Broadcast & CAM Aging Shortened to 15s",
      description:
        "Root Bridge SW1 broadcasts BPDUs with the Topology Change (TC) bit set. All switches reduce MAC aging timer from 300s to 15s.",
      switchesState: swRootTc,
      linksState: failedLinksState,
      activeBpdu: tcBpdu,
      activeLinkIds: [links[1]?.id || ""],
      loopActive: false,
      severity: "warning",
      sourceNodeId: "sw1",
      destNodeId: "sw3",
      explanation: {
        beginner:
          "All switches flush old MAC table entries after 15s so data is not sent towards the dead cable.",
        advanced:
          "TC flag is propagated for (Max Age + Forward Delay) = 35 seconds. CAM aging timer drops from 300s to 15s.",
        protocolRule: "Root Bridge sets TC Flag (Bit 0); CAM Aging timer reduced to Forward Delay (15s).",
      },
    });

    // Step 5: Unblocking Alternate Link & Recovery
    addStep({
      title: "6. Backup Link Unblocks & Restores Connectivity",
      description:
        "SW3 unblocks port Gi0/2 (Alternate -> Forwarding). Traffic from SW2 is now rerouted via SW3 to reach the Root!",
      switchesState: calcAfter.switches,
      linksState: failedLinksState,
      activeBpdu: createBpduFrame(calcAfter.rootSwitch, calcAfter.rootSwitch.ports[0]),
      activeLinkIds: [links[1]?.id || "", links[2]?.id || ""],
      loopActive: false,
      severity: "success",
      sourceNodeId: "sw2",
      destNodeId: "sw3",
      explanation: {
        beginner:
          "Automatic failover complete! The backup link is now active and full connectivity is restored.",
        advanced:
          "SW2 elects Gi0/2 as its new Root Port (RPC = 4 + 4 = 8). SW3 Gi0/2 transitions to Designated Forwarding.",
        protocolRule: "STP Topology Re-converged: Alternate path unblocked, new spanning tree active.",
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SCENARIO 3: RSTP Rapid Convergence (802.1w Proposal/Agreement Handshake)
  // ─────────────────────────────────────────────────────────────────────────────
  else if (scenarioId === "rstp_rapid_convergence") {
    const calc = runSpanningTreeAlgorithm(switches, links, { version: "rstp" });

    // Step 0: Point-to-Point Link Up & Proposal Sent
    const propSwitches: StpSwitchNode[] = JSON.parse(JSON.stringify(calc.switches));
    const propBpdu = createBpduFrame(propSwitches[0], propSwitches[0].ports[0], "rstp", {
      proposal: true,
      portRole: "designated",
      forwarding: false,
      learning: false,
    });
    addStep({
      title: "1. RSTP Proposal Transmitted (Bit 1)",
      description:
        "Core Root switch transmits an RSTP BPDU with the Proposal bit set to rapidly negotiate port forwarding without timers.",
      switchesState: propSwitches,
      linksState: links,
      activeBpdu: propBpdu,
      activeLinkIds: [links[0]?.id || ""],
      loopActive: false,
      severity: "info",
      sourceNodeId: propSwitches[0]?.id,
      destNodeId: propSwitches[1]?.id,
      explanation: {
        beginner:
          "RSTP asks neighbor directly: 'Can I immediately start forwarding on this link?'",
        advanced:
          "IEEE 802.1w Clause 17.29: Designated port in Discarding state asserts Proposal flag (Bit 1).",
        protocolRule: "RSTP Proposal / Agreement Sync State Machine: Point-to-point full-duplex link required.",
      },
    });

    // Step 1: Neighbor Sync Process (Non-edge ports placed in Discarding)
    const syncSwitches: StpSwitchNode[] = JSON.parse(JSON.stringify(propSwitches));
    addStep({
      title: "2. Downstream Sync State (Isolating Loop Paths)",
      description:
        "Downstream switch puts all other non-edge ports into Sync state (Discarding) to guarantee loop freedom.",
      switchesState: syncSwitches,
      linksState: links,
      activeBpdu: propBpdu,
      activeLinkIds: [links[0]?.id || ""],
      loopActive: false,
      severity: "info",
      sourceNodeId: propSwitches[1]?.id,
      destNodeId: propSwitches[0]?.id,
      explanation: {
        beginner:
          "To be 100% sure there is no loop, the switch momentarily blocks other ports while agreeing to the new connection.",
        advanced:
          "Sync process ensures the new Root Port can be brought to Forwarding without any possibility of a temporary loop.",
        protocolRule: "RSTP Sync: All non-edge designated ports are moved to Discarding.",
      },
    });

    // Step 2: Agreement BPDU Returned
    const agreeBpdu = createBpduFrame(syncSwitches[1], syncSwitches[1].ports[0], "rstp", {
      agreement: true,
      portRole: "root",
      forwarding: true,
      learning: true,
    });
    addStep({
      title: "3. Agreement BPDU Returned (Bit 6)",
      description:
        "Downstream switch responds with an Agreement BPDU (Bit 6 = 1), confirming it has synchronized its ports.",
      switchesState: syncSwitches,
      linksState: links,
      activeBpdu: agreeBpdu,
      activeLinkIds: [links[0]?.id || ""],
      loopActive: false,
      severity: "success",
      sourceNodeId: propSwitches[1]?.id,
      destNodeId: propSwitches[0]?.id,
      explanation: {
        beginner:
          "Downstream switch replies: 'Agreed! My ports are synced, you can forward now.'",
        advanced:
          "Agreement flag (Bit 6) sent in reply matching the Root Bridge ID and Root Path Cost from the Proposal.",
        protocolRule: "Agreement BPDU sent out new Root Port in response to superior Proposal.",
      },
    });

    // Step 3: Instant Forwarding (Sub-Second Convergence)
    addStep({
      title: "4. Instant Sub-Second Forwarding (<50ms)",
      description:
        "Both ports transition directly to Forwarding in milliseconds! Zero 30-second timer delays required.",
      switchesState: calc.switches,
      linksState: links,
      activeBpdu: createBpduFrame(calc.rootSwitch, calc.rootSwitch.ports[0], "rstp"),
      activeLinkIds: [links[0]?.id || "", links[1]?.id || ""],
      loopActive: false,
      severity: "success",
      explanation: {
        beginner:
          "RSTP converged instantly in less than 50 milliseconds without waiting for 30s Listening/Learning timers!",
        advanced:
          "Explicit handshake eliminates the need for 2x Forward Delay timers (30s) on full-duplex point-to-point links.",
        protocolRule: "IEEE 802.1w Rapid Spanning Tree Protocol: Sub-second deterministic convergence.",
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SCENARIO 4: Root Election Tie-Breaker Deep Dive
  // ─────────────────────────────────────────────────────────────────────────────
  else if (scenarioId === "root_election_tiebreak") {
    const calc = runSpanningTreeAlgorithm(switches, links, { version: "stp" });
    const rootSw = calc.rootSwitch;

    addStep({
      title: "1. Criterion 1: Lowest Root Path Cost (RPC)",
      description:
        "Switches first compare cumulative Root Path Cost. Ports with lowest RPC to the Root Bridge win Root Port role.",
      switchesState: calc.switches,
      linksState: links,
      activeBpdu: createBpduFrame(rootSw, rootSw.ports[0]),
      activeLinkIds: [links[0]?.id || ""],
      loopActive: false,
      severity: "info",
      explanation: {
        beginner: "Step 1 of 4: The fastest/lowest-cost link to the Root Bridge is always preferred first.",
        advanced: "RPC = Ingress Port Cost + Received BPDU Path Cost. 10G=2, 1G=4, 100M=19, 10M=100.",
        protocolRule: "Tiebreaker 1: Lowest Root Path Cost (Cumulative).",
      },
    });

    addStep({
      title: "2. Criterion 2: Lowest Sender Bridge ID (BID)",
      description:
        "If path costs are equal on multiple links, the switch compares the Bridge ID of the sending neighbors.",
      switchesState: calc.switches,
      linksState: links,
      activeBpdu: createBpduFrame(rootSw, rootSw.ports[1]),
      activeLinkIds: [links[1]?.id || ""],
      loopActive: false,
      severity: "info",
      explanation: {
        beginner: "Step 2 of 4: If path cost is tied, the neighbor with the lower Bridge ID (Priority + MAC) is chosen.",
        advanced: "Sender Bridge ID = Priority (e.g. 4096 < 32768) + MAC address string comparison.",
        protocolRule: "Tiebreaker 2: Lowest Sender Bridge ID.",
      },
    });

    addStep({
      title: "3. Criterion 3: Lowest Sender Port ID (PID)",
      description:
        "If connected to the same switch via parallel links, the port receiving BPDU from the lowest remote Port ID (e.g. Gi0/1 vs Gi0/2) wins.",
      switchesState: calc.switches,
      linksState: links,
      activeBpdu: createBpduFrame(rootSw, rootSw.ports[0]),
      activeLinkIds: [links[0]?.id || ""],
      loopActive: false,
      severity: "info",
      explanation: {
        beginner: "Step 3 of 4: If parallel cables go to the SAME switch, port Gi0/1 is chosen over Gi0/2.",
        advanced: "Port ID = 8-bit Port Priority (128) + 8-bit Port Number (1 vs 2). e.g. 128.1 < 128.2.",
        protocolRule: "Tiebreaker 3: Lowest Sender Port Identifier (PID).",
      },
    });

    addStep({
      title: "4. Criterion 4: Lowest Local Self Port ID",
      description:
        "Ultimate fallback tie-breaker: The lowest local physical interface index on this switch is selected.",
      switchesState: calc.switches,
      linksState: links,
      activeBpdu: createBpduFrame(rootSw, rootSw.ports[0]),
      activeLinkIds: [links[0]?.id || "", links[1]?.id || ""],
      loopActive: false,
      severity: "success",
      explanation: {
        beginner: "Step 4 of 4: If all else is identical (e.g. via an unmanaged hub), lowest local port number wins.",
        advanced: "Local Port Priority (128) + Local Port Index. Guarantees 100% deterministic decision in all cases.",
        protocolRule: "Tiebreaker 4: Lowest Local Port Identifier.",
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SCENARIO 5: Rogue Root Bridge Attack & Root Guard Protection
  // ─────────────────────────────────────────────────────────────────────────────
  else if (scenarioId === "rogue_root_attack") {
    const calcNormal = runSpanningTreeAlgorithm(switches, links, { version: "stp" });

    // Step 0: Normal Enterprise Hierarchy
    addStep({
      title: "1. Normal Enterprise Topology (Core = Root)",
      description: "Core Switch SW1 is Root Bridge with Priority 4096. Access switches connect endpoints.",
      switchesState: calcNormal.switches,
      linksState: links,
      activeBpdu: createBpduFrame(calcNormal.rootSwitch, calcNormal.rootSwitch.ports[0]),
      activeLinkIds: [links[0]?.id || ""],
      loopActive: false,
      severity: "success",
      explanation: {
        beginner: "Core switch sits at the center of the network handling high-speed backbone routing.",
        advanced: "Priority 4096 guarantees Core switch operates as the active STP Root Bridge.",
        protocolRule: "Enterprise Best Practice: Root placed at core/distribution layer.",
      },
    });

    // Step 1: Rogue Switch Injected with Priority 0
    const rogueSwitches: StpSwitchNode[] = JSON.parse(JSON.stringify(calcNormal.switches));
    const rogueSw = rogueSwitches[rogueSwitches.length - 1];
    if (rogueSw) {
      rogueSw.name = "Rogue / Attacker Switch";
      rogueSw.bridgeId = { priority: 0, sysIdExtension: 1, macAddress: "00:00:00:DE:AD:01" };
      rogueSw.rootBridgeId = rogueSw.bridgeId;
      rogueSw.isRoot = true;
    }
    const rogueBpdu = createBpduFrame(rogueSw || rogueSwitches[0], (rogueSw || rogueSwitches[0]).ports[0]);
    addStep({
      title: "2. Rogue Switch Injected with Priority 0!",
      description:
        "An unauthorized switch is plugged into an access port broadcasting BPDUs with Priority 0 to hijack the Root Bridge role!",
      switchesState: rogueSwitches,
      linksState: links,
      activeBpdu: rogueBpdu,
      activeLinkIds: [links[links.length - 1]?.id || ""],
      loopActive: true,
      severity: "error",
      sourceNodeId: rogueSw?.id || "sw3",
      destNodeId: "sw1",
      explanation: {
        beginner:
          "An attacker or misconfigured switch plugged into a wall jack is claiming to be the new Master Root Bridge!",
        advanced:
          "Superior BPDU with Priority 0 and MAC 00:00:00:DE:AD:01 would force all corporate traffic across a slow access port.",
        protocolRule: "Security Vulnerability: STP has no built-in cryptographic authentication.",
      },
    });

    // Step 2: Root Guard Blocks the Port!
    const protectedSwitches: StpSwitchNode[] = JSON.parse(JSON.stringify(calcNormal.switches));
    const accessSw = protectedSwitches[protectedSwitches.length - 1];
    if (accessSw) {
      const p = accessSw.ports[accessSw.ports.length - 1];
      if (p) {
        p.role = "disabled";
        p.state = "broken";
        p.rootGuardEnabled = true;
      }
    }
    addStep({
      title: "3. Root Guard Triggered -> Port Root-Inconsistent",
      description:
        "Cisco/IEEE Root Guard detects superior BPDU on access port and puts it into 'Root-Inconsistent' state, blocking the attack!",
      switchesState: protectedSwitches,
      linksState: links,
      activeBpdu: rogueBpdu,
      activeLinkIds: [],
      loopActive: false,
      severity: "success",
      sourceNodeId: accessSw?.id || "sw3",
      destNodeId: rogueSw?.id || "sw3",
      explanation: {
        beginner:
          "Root Guard caught the rogue switch and immediately blocked the port, keeping the real Core Switch as Root!",
        advanced:
          "Root Guard ensures a designated port never becomes a Root Port. Port transitions to Root-Inconsistent (discarding) until superior BPDUs cease.",
        protocolRule: "Cisco Root Guard / BPDU Guard: Enforces designated-only status on customer-facing edge ports.",
      },
    });
  }

  return { events, packets, steps };
}

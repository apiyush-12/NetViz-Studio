import type {
  BridgeId,
  StpSwitchNode,
  StpLink,
  StpPort,
  BpduFrame,
  BpduFlags,
} from "./stp.types";

export function formatBridgeId(bid: BridgeId): string {
  const totalPri = (bid.priority || 32768) + (bid.sysIdExtension || 1);
  return `${totalPri} / ${bid.macAddress}`;
}

export function compareBridgeIds(a: BridgeId, b: BridgeId): number {
  const priA = (a.priority ?? 32768) + (a.sysIdExtension ?? 1);
  const priB = (b.priority ?? 32768) + (b.sysIdExtension ?? 1);
  if (priA !== priB) return priA - priB;
  return a.macAddress.localeCompare(b.macAddress);
}

export function comparePortIds(pA: { priority: number; number: number }, pB: { priority: number; number: number }): number {
  if (pA.priority !== pB.priority) return pA.priority - pB.priority;
  return pA.number - pB.number;
}

export interface TreeCalculationResult {
  rootSwitch: StpSwitchNode;
  switches: StpSwitchNode[];
  links: StpLink[];
  rootPorts: StpPort[];
  designatedPorts: StpPort[];
  blockedPorts: StpPort[];
}

export function runSpanningTreeAlgorithm(
  inputSwitches: StpSwitchNode[],
  inputLinks: StpLink[],
  options?: {
    failedLinkId?: string;
    rootGuardBlockedPortId?: string;
    version?: "stp" | "rstp";
  }
): TreeCalculationResult {
  const switches: StpSwitchNode[] = JSON.parse(JSON.stringify(inputSwitches));
  const links: StpLink[] = JSON.parse(JSON.stringify(inputLinks));

  // Handle link failure
  if (options?.failedLinkId) {
    const failedLink = links.find((l) => l.id === options.failedLinkId);
    if (failedLink) failedLink.enabled = false;
  }

  // 1. Root Bridge Election: Find switch with lowest Bridge ID
  let rootSwitch = switches[0];
  for (const sw of switches) {
    if (compareBridgeIds(sw.bridgeId, rootSwitch.bridgeId) < 0) {
      rootSwitch = sw;
    }
  }

  // Mark root bridge
  for (const sw of switches) {
    sw.isRoot = sw.id === rootSwitch.id;
    sw.rootBridgeId = rootSwitch.bridgeId;
  }

  // 2. Shortest Path Tree calculation from Root Bridge (Dijkstra / Bellman-Ford)
  const distances: Record<
    string,
    {
      cost: number;
      viaPortId: string | null;
      viaSenderBid: BridgeId | null;
      viaSenderPort: { priority: number; number: number } | null;
    }
  > = {};

  for (const sw of switches) {
    distances[sw.id] = {
      cost: sw.isRoot ? 0 : Infinity,
      viaPortId: null,
      viaSenderBid: null,
      viaSenderPort: null,
    };
  }

  // Relax paths
  let updated = true;
  let iterations = 0;
  while (updated && iterations < switches.length * 2) {
    updated = false;
    iterations++;

    for (const link of links) {
      if (!link.enabled) continue;

      const swA = switches.find((s) => s.id === link.sourceSwitchId);
      const swB = switches.find((s) => s.id === link.targetSwitchId);
      const portA = swA?.ports.find((p) => p.id === link.sourcePortId);
      const portB = swB?.ports.find((p) => p.id === link.targetPortId);

      if (!swA || !swB || !portA || !portB) continue;

      // Path from A to B
      if (distances[swA.id].cost !== Infinity) {
        const costToB = distances[swA.id].cost + portB.cost;
        const currentB = distances[swB.id];

        let isBetter = false;
        if (costToB < currentB.cost) {
          isBetter = true;
        } else if (costToB === currentB.cost && currentB.viaSenderBid) {
          // Tie-break 1: Lowest Sender Bridge ID
          const cmpBid = compareBridgeIds(swA.bridgeId, currentB.viaSenderBid);
          if (cmpBid < 0) {
            isBetter = true;
          } else if (cmpBid === 0 && currentB.viaSenderPort) {
            // Tie-break 2: Lowest Sender Port ID
            const cmpPid = comparePortIds(
              { priority: portA.portPriority, number: portA.portNumber },
              currentB.viaSenderPort
            );
            if (cmpPid < 0) isBetter = true;
          }
        }

        if (isBetter) {
          distances[swB.id] = {
            cost: costToB,
            viaPortId: portB.id,
            viaSenderBid: swA.bridgeId,
            viaSenderPort: { priority: portA.portPriority, number: portA.portNumber },
          };
          updated = true;
        }
      }

      // Path from B to A
      if (distances[swB.id].cost !== Infinity) {
        const costToA = distances[swB.id].cost + portA.cost;
        const currentA = distances[swA.id];

        let isBetter = false;
        if (costToA < currentA.cost) {
          isBetter = true;
        } else if (costToA === currentA.cost && currentA.viaSenderBid) {
          const cmpBid = compareBridgeIds(swB.bridgeId, currentA.viaSenderBid);
          if (cmpBid < 0) {
            isBetter = true;
          } else if (cmpBid === 0 && currentA.viaSenderPort) {
            const cmpPid = comparePortIds(
              { priority: portB.portPriority, number: portB.portNumber },
              currentA.viaSenderPort
            );
            if (cmpPid < 0) isBetter = true;
          }
        }

        if (isBetter) {
          distances[swA.id] = {
            cost: costToA,
            viaPortId: portA.id,
            viaSenderBid: swB.bridgeId,
            viaSenderPort: { priority: portB.portPriority, number: portB.portNumber },
          };
          updated = true;
        }
      }
    }
  }

  // Update switches with Root Path Costs & Root Port IDs
  for (const sw of switches) {
    sw.rootPathCost = distances[sw.id]?.cost ?? 0;
    sw.rootPortId = distances[sw.id]?.viaPortId ?? null;
  }

  // 3. Assign Port Roles for each Switch Port
  const rootPorts: StpPort[] = [];
  const designatedPorts: StpPort[] = [];
  const blockedPorts: StpPort[] = [];

  // Initialize all ports
  for (const sw of switches) {
    for (const port of sw.ports) {
      if (sw.isRoot) {
        port.role = "designated";
        port.state = "forwarding";
        port.designatedBridgeId = sw.bridgeId;
        port.designatedPortId = port.id;
        designatedPorts.push(port);
      } else if (port.id === sw.rootPortId) {
        port.role = "root";
        port.state = "forwarding";
        rootPorts.push(port);
      } else {
        port.role = "alternate";
        port.state = options?.version === "rstp" ? "discarding" : "blocking";
      }
    }
  }

  // Determine Designated Ports on each link
  for (const link of links) {
    const swA = switches.find((s) => s.id === link.sourceSwitchId);
    const swB = switches.find((s) => s.id === link.targetSwitchId);
    const portA = swA?.ports.find((p) => p.id === link.sourcePortId);
    const portB = swB?.ports.find((p) => p.id === link.targetPortId);

    if (!swA || !swB || !portA || !portB) continue;

    if (!link.enabled) {
      portA.role = "disabled";
      portA.state = "disabled";
      portB.role = "disabled";
      portB.state = "disabled";
      continue;
    }

    // If one is Root Port, the other end is Designated
    if (portA.role === "root") {
      portB.role = "designated";
      portB.state = "forwarding";
      portB.designatedBridgeId = swB.bridgeId;
      portB.designatedPortId = portB.id;
      designatedPorts.push(portB);
      continue;
    }
    if (portB.role === "root") {
      portA.role = "designated";
      portA.state = "forwarding";
      portA.designatedBridgeId = swA.bridgeId;
      portA.designatedPortId = portA.id;
      designatedPorts.push(portA);
      continue;
    }

    // Both are non-root ports on this segment: elect Designated Port
    let desgSwitch = swA;
    let desgPort = portA;
    let otherPort = portB;

    if (swA.rootPathCost < swB.rootPathCost) {
      desgSwitch = swA;
      desgPort = portA;
      otherPort = portB;
    } else if (swB.rootPathCost < swA.rootPathCost) {
      desgSwitch = swB;
      desgPort = portB;
      otherPort = portA;
    } else {
      // Tie-break: lowest Bridge ID
      if (compareBridgeIds(swA.bridgeId, swB.bridgeId) < 0) {
        desgSwitch = swA;
        desgPort = portA;
        otherPort = portB;
      } else {
        desgSwitch = swB;
        desgPort = portB;
        otherPort = portA;
      }
    }

    desgPort.role = "designated";
    desgPort.state = "forwarding";
    desgPort.designatedBridgeId = desgSwitch.bridgeId;
    desgPort.designatedPortId = desgPort.id;
    designatedPorts.push(desgPort);

    otherPort.role = "alternate";
    otherPort.state = options?.version === "rstp" ? "discarding" : "blocking";
    blockedPorts.push(otherPort);
  }

  // Handle Root Guard violation if configured
  if (options?.rootGuardBlockedPortId) {
    for (const sw of switches) {
      for (const p of sw.ports) {
        if (p.id === options.rootGuardBlockedPortId) {
          p.role = "disabled";
          p.state = "broken";
        }
      }
    }
  }

  return {
    rootSwitch,
    switches,
    links,
    rootPorts,
    designatedPorts,
    blockedPorts,
  };
}

export function createBpduFrame(
  sourceSwitch: StpSwitchNode,
  port: StpPort,
  type: "config" | "tcn" | "rstp" = "config",
  flagsOverride?: Partial<BpduFlags>
): BpduFrame {
  const flags: BpduFlags = {
    topologyChangeAck: false,
    agreement: type === "rstp",
    forwarding: port.state === "forwarding",
    learning: port.state === "learning" || port.state === "forwarding",
    portRole: port.role,
    proposal: false,
    topologyChange: sourceSwitch.topologyChangeFlag,
    ...flagsOverride,
  };

  return {
    id: `bpdu-${sourceSwitch.id}-${port.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    protocolId: 0,
    version: type === "rstp" ? 2 : 0,
    flags,
    rootBridgeId: sourceSwitch.rootBridgeId,
    rootPathCost: sourceSwitch.rootPathCost,
    senderBridgeId: sourceSwitch.bridgeId,
    portId: { priority: port.portPriority, number: port.portNumber },
    messageAge: 0,
    maxAge: sourceSwitch.maxAge,
    helloTime: sourceSwitch.helloTimer,
    forwardDelay: sourceSwitch.forwardDelay,
    sourceMac: sourceSwitch.bridgeId.macAddress,
    destMac: "01:80:C2:00:00:00", // Standard STP Multicast MAC
  };
}

import type { OspfNeighborState, OspfNeighbor, OspfRouter, OspfLink } from "./ospf.types";

export interface NeighborCheckResult {
  compatible: boolean;
  reason?: string;
  targetState: OspfNeighborState;
}

export function checkOspfNeighborCompatibility(
  routerA: OspfRouter,
  ifaceAId: string,
  routerB: OspfRouter,
  ifaceBId: string,
  link: OspfLink
): NeighborCheckResult {
  if (!link.enabled || link.status === "down") {
    return { compatible: false, reason: "Physical link is down/disabled.", targetState: "down" };
  }

  const ifaceA = routerA.interfaces.find((i) => i.id === ifaceAId);
  const ifaceB = routerB.interfaces.find((i) => i.id === ifaceBId);

  if (!ifaceA || !ifaceB) {
    return { compatible: false, reason: "Interface not found on router.", targetState: "down" };
  }

  if (!ifaceA.enabled || !ifaceB.enabled) {
    return { compatible: false, reason: "Interface administratively disabled (shutdown).", targetState: "down" };
  }

  if (ifaceA.passive || ifaceB.passive) {
    return {
      compatible: false,
      reason: "Interface is configured as passive — OSPF does not send or receive Hello packets.",
      targetState: "down",
    };
  }

  if (routerA.routerId === routerB.routerId) {
    return {
      compatible: false,
      reason: `Duplicate Router ID detected (${routerA.routerId}). OSPF requires unique Router IDs.`,
      targetState: "down",
    };
  }

  if (ifaceA.areaId !== ifaceB.areaId) {
    return {
      compatible: false,
      reason: `Area ID mismatch: ${routerA.name} is in Area ${ifaceA.areaId} while ${routerB.name} is in Area ${ifaceB.areaId}.`,
      targetState: "down",
    };
  }

  if (ifaceA.helloInterval !== ifaceB.helloInterval) {
    return {
      compatible: false,
      reason: `Hello timer mismatch: ${ifaceA.helloInterval}s vs ${ifaceB.helloInterval}s.`,
      targetState: "down",
    };
  }

  if (ifaceA.deadInterval !== ifaceB.deadInterval) {
    return {
      compatible: false,
      reason: `Dead timer mismatch: ${ifaceA.deadInterval}s vs ${ifaceB.deadInterval}s.`,
      targetState: "down",
    };
  }

  return { compatible: true, targetState: "full" };
}

export function createOspfNeighborRecord(
  neighborRouter: OspfRouter,
  localIfaceId: string,
  localIfaceName: string,
  state: OspfNeighborState
): OspfNeighbor {
  return {
    neighborId: neighborRouter.routerId,
    neighborIp: neighborRouter.interfaces[0]?.ipAddress ?? "10.0.0.1",
    interfaceId: localIfaceId,
    interfaceName: localIfaceName,
    state,
    drPriority: 1,
    role: "DR",
    deadTimer: 40,
  };
}

export const OSPF_NEIGHBOR_STATE_EXPLANATIONS: Record<OspfNeighborState, {
  summary: string;
  meaning: string;
  previous: string;
  next: string;
  stuckReason: string;
}> = {
  down: {
    summary: "Down State",
    meaning: "Initial state. No Hello packets have been received from this neighbor yet.",
    previous: "None (starting state) or session timed out / link broke.",
    next: "Init (once a valid Hello packet is received).",
    stuckReason: "Link is disconnected, interface is shut down, or passive interface is configured.",
  },
  init: {
    summary: "Init State",
    meaning: "A Hello packet was received from the neighbor, but the local router's ID was not listed in the neighbor's Hello packet.",
    previous: "Down (Hello received).",
    next: "2-Way (when local router ID is seen in neighbor's Hello).",
    stuckReason: "Unidirectional link, access-list blocking Hellos in one direction, or multicast issues.",
  },
  "2-way": {
    summary: "2-Way State",
    meaning: "Bidirectional communication is established. Local router sees its own ID in the neighbor's Hello packet. DR/BDR election occurs here.",
    previous: "Init (local Router ID seen in neighbor Hello).",
    next: "ExStart (for routers forming adjacency) or remains 2-Way between DROthers on broadcast networks.",
    stuckReason: "Normal state between two DROther routers on a broadcast network; otherwise MTU or priority issues.",
  },
  exstart: {
    summary: "ExStart State",
    meaning: "First step of adjacency formation. Routers negotiate master/slave relationship and initial DD sequence number using empty Database Description (DBD) packets.",
    previous: "2-Way (decision to form full adjacency).",
    next: "Exchange (master/slave agreed upon).",
    stuckReason: "MTU mismatch between connecting interfaces or duplicate Router IDs.",
  },
  exchange: {
    summary: "Exchange State",
    meaning: "Routers describe their complete Link-State Databases by sending Database Description (DBD) packets with LSA headers.",
    previous: "ExStart (master/slave established).",
    next: "Loading (if LSAs need to be requested) or Full (if databases are already identical).",
    stuckReason: "MTU mismatch, packet corruption, or unexpected sequence numbers.",
  },
  loading: {
    summary: "Loading State",
    meaning: "Routers send Link-State Requests (LSR) for newer or missing LSAs discovered during Exchange. Neighbor responds with Link-State Updates (LSU).",
    previous: "Exchange (DBD exchange complete, missing LSAs identified).",
    next: "Full (all requested LSAs received and acknowledged).",
    stuckReason: "Corrupted LSA request, memory allocation failure, or high packet drop rate.",
  },
  full: {
    summary: "Full State",
    meaning: "Adjacency is fully formed! Both routers have completely synchronized Link-State Databases (LSDB) and can calculate shortest paths using Dijkstra's algorithm.",
    previous: "Loading (all LSAs received and acknowledged).",
    next: "Stable converged state; transitions to Down only on link failure or timer expiration.",
    stuckReason: "N/A (This is the ideal operational state for adjacent OSPF routers).",
  },
};

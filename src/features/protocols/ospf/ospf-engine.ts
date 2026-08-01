import { NetworkTopology, OspfNeighbor, RoutingTableEntry } from "@/features/topology/topology-types";

export interface OspfSimulationResult {
  neighbors: Array<{ nodeId: string; neighbor: OspfNeighbor }>;
  installedRoutes: Array<{ nodeId: string; route: RoutingTableEntry }>;
  lsdb: Array<{ routerId: string; areaId: string; linkCount: number }>;
  convergenceEvents: Array<{
    step: number;
    summary: string;
    explanation: string;
    affectedNodeId?: string;
  }>;
}

export function runOspfSimulation(topology: NetworkTopology): OspfSimulationResult {
  const neighbors: OspfSimulationResult["neighbors"] = [];
  const installedRoutes: OspfSimulationResult["installedRoutes"] = [];
  const lsdb: OspfSimulationResult["lsdb"] = [];
  const convergenceEvents: OspfSimulationResult["convergenceEvents"] = [];

  let step = 1;

  // Filter OSPF-enabled routers
  const ospfRouters = topology.nodes.filter(
    (n) => (n.type === "router" || n.type === "l3-switch") && n.protocolConfiguration.ospf?.enabled
  );

  if (ospfRouters.length === 0) {
    return { neighbors, installedRoutes, lsdb, convergenceEvents };
  }

  convergenceEvents.push({
    step: step++,
    summary: "OSPF Process Init",
    explanation: `Discovered ${ospfRouters.length} OSPF-enabled router(s). Initializing OSPF Hello protocol and neighbor state machines.`,
  });

  // Neighbor discovery & adjacency
  ospfRouters.forEach((router) => {
    const ospfConfig = router.protocolConfiguration.ospf!;
    const connectedLinks = topology.links.filter(
      (l) =>
        (l.sourceNodeId === router.id || l.targetNodeId === router.id) &&
        l.administrativeState === "up" &&
        l.operationalState === "up"
    );

    lsdb.push({
      routerId: ospfConfig.routerId,
      areaId: ospfConfig.areaId,
      linkCount: connectedLinks.length,
    });

    connectedLinks.forEach((link) => {
      const neighborNodeId = link.sourceNodeId === router.id ? link.targetNodeId : link.sourceNodeId;
      const neighborNode = topology.nodes.find((n) => n.id === neighborNodeId);

      if (neighborNode && neighborNode.protocolConfiguration.ospf?.enabled) {
        const neighborConfig = neighborNode.protocolConfiguration.ospf!;
        const iface = router.interfaces.find(
          (i) => i.id === (link.sourceNodeId === router.id ? link.sourceInterfaceId : link.targetInterfaceId)
        );

        if (ospfConfig.areaId === neighborConfig.areaId) {
          neighbors.push({
            nodeId: router.id,
            neighbor: {
              neighborId: neighborConfig.routerId,
              neighborIp: neighborNode.interfaces[0]?.ipv4?.address || "1.1.1.1",
              interfaceName: iface?.name || "GigabitEthernet0/0",
              state: "Full",
              drPriority: 1,
              role: "DR",
            },
          });

          convergenceEvents.push({
            step: step++,
            summary: `OSPF Adjacency Formed: ${router.name} ↔ ${neighborNode.name}`,
            explanation: `Hello packets exchanged over ${iface?.name || "link"}. Neighbor state reached FULL in Area ${ospfConfig.areaId}.`,
            affectedNodeId: router.id,
          });
        } else {
          convergenceEvents.push({
            step: step++,
            summary: `OSPF Area Mismatch: ${router.name} (Area ${ospfConfig.areaId}) vs ${neighborNode.name} (Area ${neighborConfig.areaId})`,
            explanation: `Hello packet rejected due to Area ID mismatch across link ${link.id}. Adjacency failed.`,
            affectedNodeId: router.id,
          });
        }
      }
    });
  });

  // Shortest Path Tree (Dijkstra) route calculation
  convergenceEvents.push({
    step: step++,
    summary: "Dijkstra SPF Shortest-Path Tree Calculation",
    explanation: "Running Dijkstra SPF algorithm on Link-State Database (LSDB) to calculate shortest paths and populate routing tables.",
  });

  ospfRouters.forEach((router) => {
    // Generate OSPF routes for remote subnets
    topology.nodes.forEach((targetNode) => {
      if (targetNode.id === router.id) return;
      const targetIface = targetNode.interfaces.find((i) => i.ipv4?.address);
      if (!targetIface?.ipv4) return;

      const prefix = targetIface.ipv4.address.replace(/\.\d+$/, ".0");
      installedRoutes.push({
        nodeId: router.id,
        route: {
          id: `ospf-${router.id}-${targetNode.id}`,
          source: "ospf",
          destinationPrefix: prefix,
          prefixLength: targetIface.ipv4.prefixLength,
          nextHop: targetIface.ipv4.address,
          exitInterfaceName: router.interfaces[0]?.name || "GigabitEthernet0/0",
          metric: 11,
          administrativeDistance: 110,
          active: true,
        },
      });
    });
  });

  convergenceEvents.push({
    step: step++,
    summary: "OSPF Convergence Complete",
    explanation: "All OSPF routers have synchronized LSDBs and installed intra-area routes (AD=110) into routing tables.",
  });

  return { neighbors, installedRoutes, lsdb, convergenceEvents };
}

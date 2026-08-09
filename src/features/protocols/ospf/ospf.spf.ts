import type { OspfRouter, OspfLink, OspfRoute, OspfSpfStep } from "./ospf.types";

export interface SpfCalculationResult {
  rootNodeId: string;
  steps: OspfSpfStep[];
  shortestPaths: Record<string, { cost: number; nextHop: string; exitInterface: string; path: string[] }>;
  routingTable: OspfRoute[];
}

export function runDijkstraSpf(
  rootNodeId: string,
  routers: OspfRouter[],
  links: OspfLink[]
): SpfCalculationResult {
  const rootRouter = routers.find((r) => r.nodeId === rootNodeId);
  if (!rootRouter) {
    return {
      rootNodeId,
      steps: [],
      shortestPaths: {},
      routingTable: [],
    };
  }

  // Active routers map
  const routerMap = new Map<string, OspfRouter>();
  routers.forEach((r) => {
    if (r.state !== "Disabled") routerMap.set(r.nodeId, r);
  });

  // Graph adjacency list: nodeId -> Array<{ neighborNodeId: string; cost: number; linkId: string; localIfaceId: string }>
  const adjacency = new Map<
    string,
    Array<{ neighborNodeId: string; cost: number; linkId: string; localIfaceId: string }>
  >();

  routers.forEach((r) => adjacency.set(r.nodeId, []));

  links.forEach((l) => {
    if (!l.enabled || l.status === "down") return;
    if (!routerMap.has(l.sourceRouterId) || !routerMap.has(l.targetRouterId)) return;

    adjacency.get(l.sourceRouterId)?.push({
      neighborNodeId: l.targetRouterId,
      cost: l.cost,
      linkId: l.id,
      localIfaceId: l.sourceInterfaceId,
    });
    adjacency.get(l.targetRouterId)?.push({
      neighborNodeId: l.sourceRouterId,
      cost: l.cost,
      linkId: l.id,
      localIfaceId: l.targetInterfaceId,
    });
  });

  // Dijkstra data structures
  const visited = new Set<string>();
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const paths: Record<string, string[]> = {};
  const firstHops: Record<string, { nextHopNodeId: string; exitInterface: string }> = {};

  routers.forEach((r) => {
    distances[r.nodeId] = Infinity;
    previous[r.nodeId] = null;
    paths[r.nodeId] = [];
  });

  distances[rootNodeId] = 0;
  paths[rootNodeId] = [rootNodeId];

  const steps: OspfSpfStep[] = [];
  let stepCount = 1;

  // Candidates: Map<nodeId, { cost: number; viaNodeId: string; path: string[] }>
  const candidates = new Map<string, { cost: number; viaNodeId: string; path: string[] }>();
  candidates.set(rootNodeId, { cost: 0, viaNodeId: rootNodeId, path: [rootNodeId] });

  while (candidates.size > 0) {
    // Pick candidate with minimum cost
    let minNodeId: string | null = null;
    let minCost = Infinity;

    for (const [nodeId, candidate] of candidates.entries()) {
      if (candidate.cost < minCost) {
        minCost = candidate.cost;
        minNodeId = nodeId;
      }
    }

    if (!minNodeId || minCost === Infinity) break;

    const currentCandidate = candidates.get(minNodeId)!;
    candidates.delete(minNodeId);
    visited.add(minNodeId);
    distances[minNodeId] = currentCandidate.cost;
    paths[minNodeId] = currentCandidate.path;

    // Snapshot SPT state
    const sptSnapshot: Record<string, { cost: number; via: string; path: string[] }> = {};
    for (const v of visited) {
      sptSnapshot[v] = {
        cost: distances[v],
        via: previous[v] ?? "(root)",
        path: paths[v],
      };
    }

    // Inspect neighbors
    const neighbors = adjacency.get(minNodeId) ?? [];
    for (const edge of neighbors) {
      if (visited.has(edge.neighborNodeId)) continue;

      const newCost = minCost + edge.cost;
      const existingCandidate = candidates.get(edge.neighborNodeId);

      if (!existingCandidate || newCost < existingCandidate.cost) {
        const newPath = [...paths[minNodeId], edge.neighborNodeId];
        candidates.set(edge.neighborNodeId, {
          cost: newCost,
          viaNodeId: minNodeId,
          path: newPath,
        });
        previous[edge.neighborNodeId] = minNodeId;

        // Record first hop from root
        if (minNodeId === rootNodeId) {
          const iface = rootRouter.interfaces.find((i) => i.id === edge.localIfaceId);
          firstHops[edge.neighborNodeId] = {
            nextHopNodeId: edge.neighborNodeId,
            exitInterface: iface?.name ?? "GigabitEthernet0/1",
          };
        } else if (firstHops[minNodeId]) {
          firstHops[edge.neighborNodeId] = firstHops[minNodeId];
        }
      }
    }

    const candidateList = Array.from(candidates.entries()).map(([nId, data]) => ({
      nodeId: nId,
      cost: data.cost,
      viaNodeId: data.viaNodeId,
      path: data.path,
    }));

    steps.push({
      stepNumber: stepCount++,
      currentNodeId: minNodeId,
      currentCost: minCost,
      visitedNodes: Array.from(visited),
      candidateList,
      shortestPathTree: sptSnapshot,
      description:
        minNodeId === rootNodeId
          ? `Root router ${rootNodeId} initialized at cost 0. Inspecting connected neighbors.`
          : `Selected ${minNodeId} with lowest tentative cost (${minCost}). Added to Shortest Path Tree (SPT).`,
    });
  }

  // Build shortest paths dictionary
  const shortestPaths: Record<
    string,
    { cost: number; nextHop: string; exitInterface: string; path: string[] }
  > = {};

  const routingTable: OspfRoute[] = [];

  // Directly connected LANs
  rootRouter.interfaces.forEach((iface) => {
    if (!iface.enabled) return;
    const destSubnet = iface.ipAddress.replace(/\.\d+$/, ".0");
    routingTable.push({
      destination: `${destSubnet}/24`,
      prefixLength: 24,
      nextHop: "0.0.0.0 (Directly Connected)",
      nextHopRouterId: rootRouter.routerId,
      cost: iface.cost,
      exitInterface: iface.name,
      source: "Connected",
      path: [rootNodeId],
    });
  });

  // Remote router destinations
  routers.forEach((destRouter) => {
    if (destRouter.nodeId === rootNodeId) return;

    const cost = distances[destRouter.nodeId];
    if (cost < Infinity) {
      const hopInfo = firstHops[destRouter.nodeId];
      const nextHopRouter = routers.find((r) => r.nodeId === hopInfo?.nextHopNodeId);
      const nextHopIp = nextHopRouter?.interfaces[0]?.ipAddress ?? "10.0.0.1";

      shortestPaths[destRouter.nodeId] = {
        cost,
        nextHop: nextHopIp,
        exitInterface: hopInfo?.exitInterface ?? "GigabitEthernet0/1",
        path: paths[destRouter.nodeId] ?? [],
      };

      // Add route to remote router's loopback/ID and stub LAN subnets
      destRouter.interfaces.forEach((destIface) => {
        if (!destIface.enabled) return;
        const destSubnet = destIface.ipAddress.replace(/\.\d+$/, ".0");
        const alreadyExists = routingTable.some((r) => r.destination === `${destSubnet}/24`);
        if (!alreadyExists) {
          routingTable.push({
            destination: `${destSubnet}/24`,
            prefixLength: 24,
            nextHop: nextHopIp,
            nextHopRouterId: nextHopRouter?.routerId ?? destRouter.routerId,
            cost: cost + destIface.cost,
            exitInterface: hopInfo?.exitInterface ?? "GigabitEthernet0/1",
            source: "OSPF",
            path: paths[destRouter.nodeId] ?? [],
          });
        }
      });
    }
  });

  return {
    rootNodeId,
    steps,
    shortestPaths,
    routingTable,
  };
}

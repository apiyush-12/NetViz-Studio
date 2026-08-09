import type {
  SimulationResult,
  TopologyDefinition,
} from "@/features/simulation/simulation-types";
import type { OspfConfig, OspfRouter, OspfLink, OspfArea } from "./ospf.types";
import { defaultOspfConfig, getOspfPresetData } from "./ospf.defaults";
import { ospfConfigSchema } from "./ospf.schema";
import { checkOspfNeighborCompatibility, createOspfNeighborRecord } from "./ospf.neighbors";
import { buildSynchronizedLsdb } from "./ospf.lsdb";
import { runDijkstraSpf } from "./ospf.spf";
import { buildOspfSimulationSequence } from "./ospf.events";
import { validateOspfConfiguration } from "./ospf.validators";

export function generateOspfSimulation(
  _topology: TopologyDefinition,
  rawConfig: Record<string, unknown>
): SimulationResult {
  const config: OspfConfig = ospfConfigSchema.parse({
    ...defaultOspfConfig,
    ...rawConfig,
  }) as OspfConfig;

  // Load selected topology preset data
  const presetData = getOspfPresetData(config.topologyPreset ?? "diamond");
  const routers: OspfRouter[] = presetData.routers;
  const links: OspfLink[] = presetData.links;
  const areas: OspfArea[] = presetData.areas;

  // Apply custom router config if provided
  if (config.routers && config.routers.length > 0) {
    config.routers.forEach((rConf) => {
      const router = routers.find((r) => r.nodeId === rConf.nodeId);
      if (router) {
        router.routerId = rConf.routerId ?? router.routerId;
        router.processId = rConf.processId ?? router.processId;
        router.areaId = rConf.areaId ?? router.areaId;
        if (!rConf.enabled) router.state = "Disabled";

        if (rConf.interfaces) {
          rConf.interfaces.forEach((ifConf) => {
            const iface = router.interfaces.find((i) => i.id === ifConf.id);
            if (iface) {
              iface.cost = ifConf.cost ?? iface.cost;
              iface.helloInterval = ifConf.helloInterval ?? iface.helloInterval;
              iface.deadInterval = ifConf.deadInterval ?? iface.deadInterval;
              iface.passive = ifConf.passive ?? iface.passive;
              iface.enabled = ifConf.enabled !== undefined ? ifConf.enabled : iface.enabled;
            }
          });
        }
      }
    });
  }

  // Apply custom link config if provided
  if (config.links && config.links.length > 0) {
    config.links.forEach((lConf) => {
      const link = links.find((l) => l.id === lConf.id);
      if (link) {
        link.cost = lConf.cost ?? link.cost;
        link.enabled = lConf.enabled !== undefined ? lConf.enabled : link.enabled;
        link.status = link.enabled ? "up" : "down";
      }
    });
  }

  // Apply predefined failure scenarios
  if (config.failureScenario === "r2_r4_cost_high") {
    const linkR2R4 = links.find((l) => l.id === "link-R2-R4");
    if (linkR2R4) linkR2R4.cost = 50;
  } else if (config.failureScenario === "r2_r4_break") {
    const linkR2R4 = links.find((l) => l.id === "link-R2-R4");
    if (linkR2R4) {
      linkR2R4.enabled = false;
      linkR2R4.status = "down";
    }
  } else if (config.failureScenario === "ring_break") {
    const linkR1R2 = links.find((l) => l.id === "link-R1-R2");
    if (linkR1R2) {
      linkR1R2.enabled = false;
      linkR1R2.status = "down";
    }
  } else if (config.failureScenario === "abr_failure") {
    const r2 = routers.find((r) => r.nodeId === "R2");
    if (r2) r2.state = "Disabled";
  } else if (config.failureScenario === "area_mismatch") {
    const r2 = routers.find((r) => r.nodeId === "R2");
    if (r2) {
      r2.areaId = "1";
      r2.interfaces.forEach((i) => (i.areaId = "1"));
    }
  } else if (config.failureScenario === "timer_mismatch") {
    const r3 = routers.find((r) => r.nodeId === "R3");
    if (r3) {
      r3.interfaces.forEach((i) => {
        i.helloInterval = 20;
        i.deadInterval = 80;
      });
    }
  } else if (config.failureScenario === "duplicate_rid") {
    const r2 = routers.find((r) => r.nodeId === "R2");
    if (r2) r2.routerId = "1.1.1.1";
  }

  // Calculate neighbor adjacencies for each router
  routers.forEach((router) => {
    if (router.state === "Disabled") {
      router.neighbors = [];
      return;
    }

    const neighborList = [];
    for (const iface of router.interfaces) {
      if (!iface.enabled || iface.passive) continue;

      const connectedLink = links.find(
        (l) =>
          l.enabled &&
          l.status === "up" &&
          ((l.sourceRouterId === router.nodeId && l.sourceInterfaceId === iface.id) ||
            (l.targetRouterId === router.nodeId && l.targetInterfaceId === iface.id))
      );

      if (connectedLink) {
        const neighborNodeId =
          connectedLink.sourceRouterId === router.nodeId
            ? connectedLink.targetRouterId
            : connectedLink.sourceRouterId;
        const neighborIfaceId =
          connectedLink.sourceRouterId === router.nodeId
            ? connectedLink.targetInterfaceId
            : connectedLink.sourceInterfaceId;
        const neighborRouter = routers.find((r) => r.nodeId === neighborNodeId);

        if (neighborRouter && neighborRouter.state !== "Disabled") {
          const check = checkOspfNeighborCompatibility(
            router,
            iface.id,
            neighborRouter,
            neighborIfaceId,
            connectedLink
          );
          if (check.compatible) {
            neighborList.push(
              createOspfNeighborRecord(
                neighborRouter,
                iface.id,
                iface.name,
                check.targetState
              )
            );
          }
        }
      }
    }
    router.neighbors = neighborList;
    router.state = neighborList.length > 0 ? "Full" : "Init";
  });

  // Generate synchronized LSDB
  const globalLsdb = buildSynchronizedLsdb(routers, links);
  routers.forEach((r) => (r.lsdb = globalLsdb));

  // Run Dijkstra SPF for each router
  const spfResults: Record<string, ReturnType<typeof runDijkstraSpf>> = {};
  routers.forEach((r) => {
    if (r.state !== "Disabled") {
      const res = runDijkstraSpf(r.nodeId, routers, links);
      spfResults[r.nodeId] = res;
      r.routingTable = res.routingTable;
    }
  });

  // Run validation
  const validationErrors = validateOspfConfiguration(routers, links);

  // Identify root & destination nodes
  const rootId = config.rootRouterId ?? "R1";
  const targetNodeId = routers[routers.length - 1]?.nodeId ?? "R4";

  // Generate Simulation events & packets
  const spfRoot = spfResults[rootId] ?? { steps: [], shortestPaths: {} };
  const { events, packets } = buildOspfSimulationSequence(
    routers,
    links,
    spfRoot,
    config.labelMode === "simple"
  );

  const activePath = spfRoot.shortestPaths[targetNodeId]?.path ?? [rootId, targetNodeId];
  const activeCost = spfRoot.shortestPaths[targetNodeId]?.cost ?? 15;

  return {
    events,
    packets,
    initialState: {
      routers,
      links,
      areas,
      topologyPreset: config.topologyPreset ?? "diamond",
      rootRouterId: rootId,
      targetRouterId: targetNodeId,
      spfResults,
      validationErrors,
      selectedRouterId: rootId,
      activeShortestPath: activePath,
      totalCost: activeCost,
      failureScenario: config.failureScenario,
    },
  };
}

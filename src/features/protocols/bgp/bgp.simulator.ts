import type {
  SimulationResult,
  TopologyDefinition,
} from "@/features/simulation/simulation-types";
import type { BgpConfig, BgpRouter, BgpLink, AutonomousSystem } from "./bgp.types";
import { defaultBgpConfig, getBgpPresetData } from "./bgp.defaults";
import { bgpConfigSchema } from "./bgp.schema";
import { checkBgpPeeringCompatibility } from "./bgp.sessions";
import { generateBgpTablesForTopology } from "./bgp.route-table";
import { buildBgpSimulationSequence } from "./bgp.events";
import { validateBgpConfiguration } from "./bgp.validators";

export function generateBgpSimulation(
  _topology: TopologyDefinition,
  rawConfig: Record<string, unknown>
): SimulationResult {
  const config: BgpConfig = bgpConfigSchema.parse({
    ...defaultBgpConfig,
    ...rawConfig,
  }) as BgpConfig;

  // Load selected topology preset data
  const presetData = getBgpPresetData(config.topologyPreset ?? "multi-homed");
  const routers: BgpRouter[] = presetData.routers;
  const links: BgpLink[] = presetData.links;
  const autonomousSystems: AutonomousSystem[] = presetData.autonomousSystems;

  // Apply custom router config
  if (config.routers && config.routers.length > 0) {
    config.routers.forEach((rConf) => {
      const router = routers.find((r) => r.nodeId === rConf.nodeId);
      if (router) {
        router.routerId = rConf.routerId ?? router.routerId;
        router.localAsn = rConf.localAsn ?? router.localAsn;
        if (!rConf.enabled) router.state = "Disabled";

        if (rConf.peers) {
          rConf.peers.forEach((pConf) => {
            const peer = router.peers.find((p) => p.id === pConf.id);
            if (peer) {
              peer.remoteAsn = pConf.remoteAsn ?? peer.remoteAsn;
              peer.enabled = pConf.enabled !== undefined ? pConf.enabled : peer.enabled;
              peer.localPreference = pConf.localPreference ?? peer.localPreference;
              peer.med = pConf.med ?? peer.med;
              peer.asPathPrependCount = pConf.asPathPrependCount ?? peer.asPathPrependCount;
            }
          });
        }
      }
    });
  }

  // Apply custom link config
  if (config.links && config.links.length > 0) {
    config.links.forEach((lConf) => {
      const link = links.find((l) => l.id === lConf.id);
      if (link) {
        link.enabled = lConf.enabled !== undefined ? lConf.enabled : link.enabled;
        link.status = link.enabled ? "up" : "down";
      }
    });
  }

  let isWithdrawal = false;

  // Apply failure scenario presets
  if (config.failureScenario === "break_as65001_as65002") {
    const link = links.find((l) => l.id === "link-R1-R2");
    if (link) {
      link.enabled = false;
      link.status = "down";
    }
  } else if (config.failureScenario === "tier1_failover") {
    const link = links.find((l) => l.id === "link-R1-R2");
    if (link) {
      link.enabled = false;
      link.status = "down";
    }
  } else if (config.failureScenario === "peer_as_down") {
    const r3 = routers.find((r) => r.nodeId === "R3");
    if (r3) r3.state = "Disabled";
  } else if (config.failureScenario === "as_path_prepend_as65002") {
    const r1 = routers.find((r) => r.nodeId === "R1");
    const peerR1R2 = r1?.peers.find((p) => p.id === "peer-R1-R2");
    const peerR1R3 = r1?.peers.find((p) => p.id === "peer-R1-R3");
    if (peerR1R2 && peerR1R3) {
      peerR1R2.localPreference = 100;
      peerR1R3.localPreference = 100;
      peerR1R2.asPathPrependCount = 3;
    }
  } else if (config.failureScenario === "withdraw_prefix") {
    isWithdrawal = true;
  } else if (config.failureScenario === "invalid_remote_asn") {
    const r1 = routers.find((r) => r.nodeId === "R1");
    const peerR1R2 = r1?.peers.find((p) => p.id === "peer-R1-R2");
    if (peerR1R2) peerR1R2.remoteAsn = 99999;
  } else if (config.failureScenario === "med_influence") {
    const r1 = routers.find((r) => r.nodeId === "R1");
    const peerR1R2 = r1?.peers.find((p) => p.id === "peer-R1-R2");
    const peerR1R3 = r1?.peers.find((p) => p.id === "peer-R1-R3");
    if (peerR1R2 && peerR1R3) {
      peerR1R2.localPreference = 100;
      peerR1R3.localPreference = 100;
      peerR1R2.med = 200;
      peerR1R3.med = 50;
    }
  }

  // Update session states for each router's peers
  routers.forEach((router) => {
    router.peers.forEach((peer) => {
      const neighborRouter = routers.find((r) => r.localAsn === peer.remoteAsn || r.nodeId === peer.id.split("-")[2]);
      const link = links.find(
        (l) =>
          (l.sourceRouterId === router.nodeId && l.targetRouterId === neighborRouter?.nodeId) ||
          (l.targetRouterId === router.nodeId && l.sourceRouterId === neighborRouter?.nodeId)
      );

      if (neighborRouter && link) {
        const neighborPeer = neighborRouter.peers.find((p) => p.remoteAsn === router.localAsn);
        if (neighborPeer) {
          const check = checkBgpPeeringCompatibility(router, peer, neighborRouter, neighborPeer, link);
          peer.state = check.targetState;
        } else {
          peer.state = "idle";
        }
      } else {
        peer.state = "idle";
      }
    });

    const hasEstablished = router.peers.some((p) => p.state === "established");
    router.state = router.state === "Disabled" ? "Disabled" : hasEstablished ? "Established" : "Idle";
  });

  // Run BGP table and IP route generation
  const { bgpTables, ipRoutingTables, bestPathEvaluationR1 } = generateBgpTablesForTopology(
    routers,
    links,
    "203.0.113.0/24",
    isWithdrawal
  );

  routers.forEach((r) => {
    r.bgpTable = bgpTables[r.nodeId] ?? [];
    r.routingTable = ipRoutingTables[r.nodeId] ?? [];
  });

  // Run validation
  const validationErrors = validateBgpConfiguration(routers, links);

  // Generate Simulation events & packets
  const { events, packets } = buildBgpSimulationSequence(
    routers,
    links,
    bestPathEvaluationR1.bestRoute,
    config.labelMode === "simple",
    isWithdrawal
  );

  // Resolve best path nodes based on winner route next-hop
  let activeBestPath: string[] = [];
  if (!isWithdrawal && bestPathEvaluationR1.bestRoute) {
    if (config.topologyPreset === "tier1-hub") {
      activeBestPath = bestPathEvaluationR1.bestRoute.nextHop === "192.0.2.2"
        ? ["R1", "R2", "R5", "R4"]
        : ["R1", "R3", "R5", "R4"];
    } else if (config.topologyPreset === "triangle") {
      activeBestPath = bestPathEvaluationR1.bestRoute.nextHop === "192.0.2.2"
        ? ["R1", "R3"]
        : ["R1", "R2", "R3"];
    } else if (config.topologyPreset === "ibgp-ebgp") {
      activeBestPath = ["R1A", "R1B", "R2"];
    } else {
      activeBestPath = bestPathEvaluationR1.bestRoute.nextHop === "192.0.2.2"
        ? ["R1", "R2", "R4"]
        : ["R1", "R3", "R4"];
    }
  }

  return {
    events,
    packets,
    initialState: {
      routers,
      links,
      autonomousSystems,
      topologyPreset: config.topologyPreset ?? "multi-homed",
      bgpTables,
      ipRoutingTables,
      bestPathEvaluationR1,
      validationErrors,
      selectedRouterId: routers[0]?.nodeId ?? "R1",
      activeBestPath,
      failureScenario: config.failureScenario,
      isWithdrawal,
    },
  };
}

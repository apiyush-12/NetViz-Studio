import { NetworkTopology, BgpRouteEntry } from "@/features/topology/topology-types";

export interface BgpSimulationResult {
  bgpRoutes: Array<{ nodeId: string; routes: BgpRouteEntry[] }>;
  events: Array<{
    step: number;
    summary: string;
    explanation: string;
    affectedNodeId?: string;
  }>;
}

export function runBgpSimulation(topology: NetworkTopology): BgpSimulationResult {
  const bgpRoutes: BgpSimulationResult["bgpRoutes"] = [];
  const events: BgpSimulationResult["events"] = [];

  let step = 1;

  const bgpRouters = topology.nodes.filter(
    (n) => (n.type === "router" || n.type === "isp-router") && n.protocolConfiguration.bgp?.enabled
  );

  if (bgpRouters.length === 0) {
    return { bgpRoutes, events };
  }

  events.push({
    step: step++,
    summary: "BGP Process Initialization",
    explanation: `Discovered ${bgpRouters.length} BGP speaker router(s) across Autonomous Systems.`,
  });

  bgpRouters.forEach((router) => {
    const bgpConfig = router.protocolConfiguration.bgp!;
    const routes: BgpRouteEntry[] = [];

    events.push({
      step: step++,
      summary: `BGP Peer Session Establishment on ${router.name} (AS ${bgpConfig.asn})`,
      explanation: `Initiating TCP port 179 session with configured BGP peers. Sending BGP OPEN and KEEPALIVE messages.`,
      affectedNodeId: router.id,
    });

    bgpConfig.peers.forEach((peer) => {
      if (!peer.enabled) return;

      bgpConfig.advertisedPrefixes.forEach((prefixStr) => {
        const [net, prefixLen] = prefixStr.includes("/") ? prefixStr.split("/") : [prefixStr, "24"];
        routes.push({
          network: net,
          prefixLength: Number(prefixLen),
          nextHop: peer.neighborIp,
          metric: peer.med || 0,
          localPref: peer.localPreference || 100,
          weight: 0,
          asPath: [bgpConfig.asn, peer.remoteAsn],
          best: true,
        });
      });
    });

    bgpRoutes.push({ nodeId: router.id, routes });
  });

  events.push({
    step: step++,
    summary: "BGP Best-Path Decision Algorithm",
    explanation: "Evaluated paths using BGP Decision Process: 1. Highest Weight, 2. Highest Local Preference, 3. Shortest AS-Path, 4. Lowest MED, 5. eBGP over iBGP.",
  });

  return { bgpRoutes, events };
}

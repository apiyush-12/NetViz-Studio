import type { BgpRoute, BgpIpRoute, BgpRouter, BgpLink } from "./bgp.types";
import { evaluateBgpBestPath } from "./bgp.best-path";

export function generateBgpTablesForTopology(
  routers: BgpRouter[],
  links: BgpLink[],
  advertisedPrefix = "203.0.113.0/24",
  isPrefixWithdrawn = false
): {
  bgpTables: Record<string, BgpRoute[]>;
  ipRoutingTables: Record<string, BgpIpRoute[]>;
  bestPathEvaluationR1: ReturnType<typeof evaluateBgpBestPath>;
} {
  const bgpTables: Record<string, BgpRoute[]> = {};
  const ipRoutingTables: Record<string, BgpIpRoute[]> = {};

  routers.forEach((r) => {
    bgpTables[r.nodeId] = [];
    ipRoutingTables[r.nodeId] = [];
  });

  if (isPrefixWithdrawn) {
    return {
      bgpTables,
      ipRoutingTables,
      bestPathEvaluationR1: evaluateBgpBestPath([], 65001),
    };
  }

  // ----------------------------------------------------
  // 1. TIER-1 HUB TOPOLOGY (5 AS: R1, R2, R3, R5, R4)
  // ----------------------------------------------------
  if (routers.some((r) => r.nodeId === "R5")) {
    const r4 = routers.find((r) => r.nodeId === "R4");
    if (r4 && r4.state !== "Disabled") {
      bgpTables["R4"].push({
        id: "bgp-r4-orig",
        prefix: advertisedPrefix,
        prefixLength: 24,
        nextHop: "0.0.0.0 (Locally Originated)",
        localPreference: 100,
        asPath: [65004],
        med: 0,
        origin: "igp",
        valid: true,
        best: true,
      });
    }

    const linkR5R4 = links.find((l) => l.id === "link-R5-R4" && l.enabled && l.status === "up");
    const r5 = routers.find((r) => r.nodeId === "R5");
    if (linkR5R4 && r5 && r5.state !== "Disabled" && bgpTables["R4"].length > 0) {
      bgpTables["R5"].push({
        id: "bgp-r5-via-r4",
        prefix: advertisedPrefix,
        prefixLength: 24,
        nextHop: "192.0.2.26",
        localPreference: 100,
        asPath: [65004],
        med: 0,
        origin: "igp",
        valid: true,
        best: true,
      });
    }

    const linkR2R5 = links.find((l) => l.id === "link-R2-R5" && l.enabled && l.status === "up");
    const r2 = routers.find((r) => r.nodeId === "R2");
    if (linkR2R5 && r2 && r2.state !== "Disabled" && bgpTables["R5"].length > 0) {
      bgpTables["R2"].push({
        id: "bgp-r2-via-r5",
        prefix: advertisedPrefix,
        prefixLength: 24,
        nextHop: "192.0.2.18",
        localPreference: 100,
        asPath: [65005, 65004],
        med: 0,
        origin: "igp",
        valid: true,
        best: true,
      });
    }

    const linkR3R5 = links.find((l) => l.id === "link-R3-R5" && l.enabled && l.status === "up");
    const r3 = routers.find((r) => r.nodeId === "R3");
    if (linkR3R5 && r3 && r3.state !== "Disabled" && bgpTables["R5"].length > 0) {
      bgpTables["R3"].push({
        id: "bgp-r3-via-r5",
        prefix: advertisedPrefix,
        prefixLength: 24,
        nextHop: "192.0.2.22",
        localPreference: 100,
        asPath: [65005, 65004],
        med: 0,
        origin: "igp",
        valid: true,
        best: true,
      });
    }

    const candidateRoutesR1: BgpRoute[] = [];
    const linkR1R2 = links.find((l) => l.id === "link-R1-R2" && l.enabled && l.status === "up");
    const peerR1R2 = r1GetPeer(routers, "R1", "peer-R1-R2");
    if (linkR1R2 && bgpTables["R2"].length > 0) {
      candidateRoutesR1.push({
        id: "path-a-via-r2",
        prefix: advertisedPrefix,
        prefixLength: 24,
        nextHop: "192.0.2.2",
        localPreference: peerR1R2?.localPreference ?? 200,
        asPath: [65002, 65005, 65004],
        med: peerR1R2?.med ?? 0,
        origin: "igp",
        valid: true,
        best: false,
      });
    }

    const linkR1R3 = links.find((l) => l.id === "link-R1-R3" && l.enabled && l.status === "up");
    const peerR1R3 = r1GetPeer(routers, "R1", "peer-R1-R3");
    if (linkR1R3 && bgpTables["R3"].length > 0) {
      candidateRoutesR1.push({
        id: "path-b-via-r3",
        prefix: advertisedPrefix,
        prefixLength: 24,
        nextHop: "192.0.2.6",
        localPreference: peerR1R3?.localPreference ?? 100,
        asPath: [65003, 65005, 65004],
        med: peerR1R3?.med ?? 0,
        origin: "igp",
        valid: true,
        best: false,
      });
    }

    const evaluationR1 = evaluateBgpBestPath(candidateRoutesR1, 65001);
    bgpTables["R1"] = evaluationR1.evaluatedRoutes;
    return { bgpTables, ipRoutingTables, bestPathEvaluationR1: evaluationR1 };
  }

  // ----------------------------------------------------
  // 2. TRIANGLE TOPOLOGY (3 AS: R1 in AS 100, R2 in AS 200, R3 in AS 300)
  // ----------------------------------------------------
  if (routers.length === 3 && routers.some((r) => r.localAsn === 100)) {
    const r3 = routers.find((r) => r.nodeId === "R3");
    if (r3 && r3.state !== "Disabled") {
      bgpTables["R3"].push({
        id: "bgp-r3-orig",
        prefix: advertisedPrefix,
        prefixLength: 24,
        nextHop: "0.0.0.0 (Locally Originated)",
        localPreference: 100,
        asPath: [300],
        med: 0,
        origin: "igp",
        valid: true,
        best: true,
      });
    }

    const linkR2R3 = links.find((l) => l.id === "link-R2-R3" && l.enabled && l.status === "up");
    const r2 = routers.find((r) => r.nodeId === "R2");
    if (linkR2R3 && r2 && r2.state !== "Disabled" && bgpTables["R3"].length > 0) {
      bgpTables["R2"].push({
        id: "bgp-r2-via-r3",
        prefix: advertisedPrefix,
        prefixLength: 24,
        nextHop: "192.0.2.10",
        localPreference: 100,
        asPath: [300],
        med: 0,
        origin: "igp",
        valid: true,
        best: true,
      });
    }

    const candidateRoutesR1: BgpRoute[] = [];
    const linkR1R3 = links.find((l) => l.id === "link-R1-R3" && l.enabled && l.status === "up");
    const peerR1R3 = r1GetPeer(routers, "R1", "peer-R1-R3");
    if (linkR1R3 && bgpTables["R3"].length > 0) {
      candidateRoutesR1.push({
        id: "path-direct-r3",
        prefix: advertisedPrefix,
        prefixLength: 24,
        nextHop: "192.0.2.2",
        localPreference: peerR1R3?.localPreference ?? 200,
        asPath: [300],
        med: peerR1R3?.med ?? 0,
        origin: "igp",
        valid: true,
        best: false,
      });
    }

    const linkR1R2 = links.find((l) => l.id === "link-R1-R2" && l.enabled && l.status === "up");
    const peerR1R2 = r1GetPeer(routers, "R1", "peer-R1-R2");
    if (linkR1R2 && bgpTables["R2"].length > 0) {
      candidateRoutesR1.push({
        id: "path-transit-r2",
        prefix: advertisedPrefix,
        prefixLength: 24,
        nextHop: "192.0.2.6",
        localPreference: peerR1R2?.localPreference ?? 100,
        asPath: [200, 300],
        med: peerR1R2?.med ?? 0,
        origin: "igp",
        valid: true,
        best: false,
      });
    }

    const evaluationR1 = evaluateBgpBestPath(candidateRoutesR1, 100);
    bgpTables["R1"] = evaluationR1.evaluatedRoutes;
    return { bgpTables, ipRoutingTables, bestPathEvaluationR1: evaluationR1 };
  }

  // ----------------------------------------------------
  // 3. iBGP + eBGP HYBRID (R1A, R1B in AS 65001, R2 in AS 65002)
  // ----------------------------------------------------
  if (routers.some((r) => r.nodeId === "R1A")) {
    const r2 = routers.find((r) => r.nodeId === "R2");
    if (r2 && r2.state !== "Disabled") {
      bgpTables["R2"].push({
        id: "bgp-r2-orig",
        prefix: advertisedPrefix,
        prefixLength: 24,
        nextHop: "0.0.0.0 (Locally Originated)",
        localPreference: 100,
        asPath: [65002],
        med: 0,
        origin: "igp",
        valid: true,
        best: true,
      });
    }

    const linkR1BR2 = links.find((l) => l.id === "link-R1B-R2" && l.enabled && l.status === "up");
    const r1b = routers.find((r) => r.nodeId === "R1B");
    if (linkR1BR2 && r1b && r1b.state !== "Disabled" && bgpTables["R2"].length > 0) {
      bgpTables["R1B"].push({
        id: "bgp-r1b-via-r2",
        prefix: advertisedPrefix,
        prefixLength: 24,
        nextHop: "192.0.2.2",
        localPreference: 200,
        asPath: [65002],
        med: 0,
        origin: "igp",
        valid: true,
        best: true,
      });
    }

    const linkR1AR1B = links.find((l) => l.id === "link-R1A-R1B" && l.enabled && l.status === "up");
    const candidateRoutesR1A: BgpRoute[] = [];
    if (linkR1AR1B && bgpTables["R1B"].length > 0) {
      candidateRoutesR1A.push({
        id: "path-ibgp-r1b",
        prefix: advertisedPrefix,
        prefixLength: 24,
        nextHop: "10.0.0.2",
        localPreference: 100,
        asPath: [65002],
        med: 0,
        origin: "igp",
        valid: true,
        best: true,
      });
    }

    const evaluationR1A = evaluateBgpBestPath(candidateRoutesR1A, 65001);
    bgpTables["R1A"] = evaluationR1A.evaluatedRoutes;
    return { bgpTables, ipRoutingTables, bestPathEvaluationR1: evaluationR1A };
  }

  // ----------------------------------------------------
  // 4. DEFAULT 4-AS MULTI-HOMED TOPOLOGY
  // ----------------------------------------------------
  const r4 = routers.find((r) => r.nodeId === "R4");
  if (r4 && r4.state !== "Disabled") {
    const origRoute: BgpRoute = {
      id: "bgp-r4-orig",
      prefix: advertisedPrefix,
      prefixLength: 24,
      nextHop: "0.0.0.0 (Locally Originated)",
      localPreference: 100,
      asPath: [65004],
      med: 0,
      origin: "igp",
      valid: true,
      best: true,
    };
    bgpTables["R4"].push(origRoute);
    ipRoutingTables["R4"].push({
      destination: advertisedPrefix,
      nextHop: "0.0.0.0",
      asPath: [65004],
      source: "Connected",
      metric: 0,
    });
  }

  // Check link R2-R4
  const linkR2R4 = links.find((l) => l.id === "link-R2-R4" && l.enabled && l.status === "up");
  const r2 = routers.find((r) => r.nodeId === "R2");
  if (linkR2R4 && r2 && r2.state !== "Disabled" && bgpTables["R4"].length > 0) {
    const routeAtR2: BgpRoute = {
      id: "bgp-r2-via-r4",
      prefix: advertisedPrefix,
      prefixLength: 24,
      nextHop: "192.0.2.10",
      localPreference: 100,
      asPath: [65004],
      med: 0,
      origin: "igp",
      valid: true,
      best: true,
    };
    bgpTables["R2"].push(routeAtR2);
    ipRoutingTables["R2"].push({
      destination: advertisedPrefix,
      nextHop: "192.0.2.10",
      asPath: [65004],
      source: "BGP (eBGP)",
      metric: 0,
    });
  }

  // Check link R3-R4
  const linkR3R4 = links.find((l) => l.id === "link-R3-R4" && l.enabled && l.status === "up");
  const r3 = routers.find((r) => r.nodeId === "R3");
  if (linkR3R4 && r3 && r3.state !== "Disabled" && bgpTables["R4"].length > 0) {
    const routeAtR3: BgpRoute = {
      id: "bgp-r3-via-r4",
      prefix: advertisedPrefix,
      prefixLength: 24,
      nextHop: "192.0.2.14",
      localPreference: 100,
      asPath: [65004],
      med: 0,
      origin: "igp",
      valid: true,
      best: true,
    };
    bgpTables["R3"].push(routeAtR3);
    ipRoutingTables["R3"].push({
      destination: advertisedPrefix,
      nextHop: "192.0.2.14",
      asPath: [65004],
      source: "BGP (eBGP)",
      metric: 0,
    });
  }

  // Routes arriving at R1 (AS 65001)
  const candidateRoutesR1: BgpRoute[] = [];

  // Path via R2 (AS 65002)
  const linkR1R2 = links.find((l) => l.id === "link-R1-R2" && l.enabled && l.status === "up");
  const peerR1R2 = r1GetPeer(routers, "R1", "peer-R1-R2");
  if (linkR1R2 && bgpTables["R2"].length > 0) {
    const prependCount = peerR1R2?.asPathPrependCount ?? 0;
    const prependedAs = Array(prependCount).fill(65002);

    candidateRoutesR1.push({
      id: "path-a-via-r2",
      prefix: advertisedPrefix,
      prefixLength: 24,
      nextHop: "192.0.2.2",
      localPreference: peerR1R2?.localPreference ?? 200,
      asPath: [...prependedAs, 65002, 65004],
      med: peerR1R2?.med ?? 100,
      origin: "igp",
      valid: true,
      best: false,
      asPathPrependCount: prependCount,
    });
  }

  // Path via R3 (AS 65003)
  const linkR1R3 = links.find((l) => l.id === "link-R1-R3" && l.enabled && l.status === "up");
  const peerR1R3 = r1GetPeer(routers, "R1", "peer-R1-R3");
  if (linkR1R3 && bgpTables["R3"].length > 0) {
    const prependCount = peerR1R3?.asPathPrependCount ?? 0;
    const prependedAs = Array(prependCount).fill(65003);

    candidateRoutesR1.push({
      id: "path-b-via-r3",
      prefix: advertisedPrefix,
      prefixLength: 24,
      nextHop: "192.0.2.6",
      localPreference: peerR1R3?.localPreference ?? 100,
      asPath: [...prependedAs, 65003, 65004],
      med: peerR1R3?.med ?? 20,
      origin: "igp",
      valid: true,
      best: false,
      asPathPrependCount: prependCount,
    });
  }

  const evaluationR1 = evaluateBgpBestPath(candidateRoutesR1, 65001);
  bgpTables["R1"] = evaluationR1.evaluatedRoutes;

  if (evaluationR1.bestRoute) {
    ipRoutingTables["R1"].push({
      destination: advertisedPrefix,
      nextHop: evaluationR1.bestRoute.nextHop,
      asPath: evaluationR1.bestRoute.asPath,
      source: "BGP (eBGP)",
      metric: evaluationR1.bestRoute.med,
    });
  }

  return {
    bgpTables,
    ipRoutingTables,
    bestPathEvaluationR1: evaluationR1,
  };
}

function r1GetPeer(routers: BgpRouter[], routerId: string, peerId: string) {
  const router = routers.find((r) => r.nodeId === routerId);
  return router?.peers.find((p) => p.id === peerId);
}

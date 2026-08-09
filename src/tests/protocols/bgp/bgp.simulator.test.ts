import { describe, it, expect } from "vitest";
import { generateBgpSimulation } from "@/features/protocols/bgp/bgp.simulator";
import { DEFAULT_BGP_TOPOLOGY, defaultBgpConfig } from "@/features/protocols/bgp/bgp.defaults";
import { evaluateBgpBestPath } from "@/features/protocols/bgp/bgp.best-path";
import type { BgpRoute } from "@/features/protocols/bgp/bgp.types";

describe("BGP Protocol Engine & Simulator", () => {
  it("generates BGP peering events and OPEN/KEEPALIVE packets", () => {
    const result = generateBgpSimulation(DEFAULT_BGP_TOPOLOGY, defaultBgpConfig);
    expect(result.events.length).toBeGreaterThan(8);
    expect(result.packets.length).toBeGreaterThan(0);

    const openEvents = result.events.filter((e) => e.title.includes("OPEN"));
    expect(openEvents.length).toBeGreaterThanOrEqual(1);

    const establishedEvents = result.events.filter((e) => e.title.includes("Established"));
    expect(establishedEvents.length).toBeGreaterThanOrEqual(1);
  });

  it("selects Path A because LOCAL_PREF (200) is evaluated before AS_PATH or MED", () => {
    const pathA: BgpRoute = {
      id: "path-a",
      prefix: "203.0.113.0/24",
      prefixLength: 24,
      nextHop: "192.0.2.2",
      localPreference: 200,
      asPath: [65002, 65004],
      med: 100,
      origin: "igp",
      valid: true,
      best: false,
    };

    const pathB: BgpRoute = {
      id: "path-b",
      prefix: "203.0.113.0/24",
      prefixLength: 24,
      nextHop: "192.0.2.6",
      localPreference: 100,
      asPath: [65003, 65004],
      med: 20,
      origin: "igp",
      valid: true,
      best: false,
    };

    const result = evaluateBgpBestPath([pathA, pathB], 65001);
    expect(result.bestRoute).toBeDefined();
    expect(result.bestRoute?.id).toBe("path-a");
    expect(result.winningReason).toContain("Higher LOCAL_PREF");
  });

  it("selects Path B when AS-path prepending makes Path A longer and LOCAL_PREF is equalized", () => {
    const result = generateBgpSimulation(DEFAULT_BGP_TOPOLOGY, {
      ...defaultBgpConfig,
      failureScenario: "as_path_prepend_as65002",
    });

    const state = result.initialState as {
      activeBestPath: string[];
      bestPathEvaluationR1: { bestRoute: BgpRoute | null };
      isWithdrawal: boolean;
      bgpTables: Record<string, BgpRoute[]>;
    };
    expect(state).toBeDefined();
    expect(state.activeBestPath).toEqual(["R1", "R3", "R4"]);
    expect(state.bestPathEvaluationR1.bestRoute?.id).toBe("path-b-via-r3");
  });

  it("supports Tier-1 Hub topology preset (5 ASes)", () => {
    const result = generateBgpSimulation(DEFAULT_BGP_TOPOLOGY, {
      ...defaultBgpConfig,
      topologyPreset: "tier1-hub",
    });
    const state = result.initialState as {
      autonomousSystems: Array<{ asn: number }>;
      routers: Array<{ nodeId: string }>;
      activeBestPath: string[];
    };
    expect(state.autonomousSystems.length).toBe(5);
    expect(state.routers.length).toBe(5);
    expect(state.activeBestPath).toEqual(["R1", "R2", "R5", "R4"]);
  });

  it("supports Triangle Peering topology preset (3 ASes)", () => {
    const result = generateBgpSimulation(DEFAULT_BGP_TOPOLOGY, {
      ...defaultBgpConfig,
      topologyPreset: "triangle",
    });
    const state = result.initialState as {
      autonomousSystems: Array<{ asn: number }>;
      routers: Array<{ nodeId: string }>;
      activeBestPath: string[];
    };
    expect(state.autonomousSystems.length).toBe(3);
    expect(state.routers.length).toBe(3);
    expect(state.activeBestPath).toEqual(["R1", "R3"]);
  });

  it("supports iBGP + eBGP Hybrid topology preset", () => {
    const result = generateBgpSimulation(DEFAULT_BGP_TOPOLOGY, {
      ...defaultBgpConfig,
      topologyPreset: "ibgp-ebgp",
    });
    const state = result.initialState as {
      autonomousSystems: Array<{ asn: number }>;
      routers: Array<{ nodeId: string }>;
      activeBestPath: string[];
    };
    expect(state.autonomousSystems.length).toBe(2);
    expect(state.routers.length).toBe(3);
    expect(state.activeBestPath).toEqual(["R1A", "R1B", "R2"]);
  });

  it("handles link failure between AS 65001 and AS 65002 by falling back to AS 65003", () => {
    const result = generateBgpSimulation(DEFAULT_BGP_TOPOLOGY, {
      ...defaultBgpConfig,
      failureScenario: "break_as65001_as65002",
    });

    const state = result.initialState as {
      activeBestPath: string[];
    };
    expect(state).toBeDefined();
    expect(state.activeBestPath).toEqual(["R1", "R3", "R4"]);
  });

  it("handles prefix withdrawal by removing route from RIB", () => {
    const result = generateBgpSimulation(DEFAULT_BGP_TOPOLOGY, {
      ...defaultBgpConfig,
      failureScenario: "withdraw_prefix",
    });

    const state = result.initialState as {
      isWithdrawal: boolean;
      bgpTables: Record<string, BgpRoute[]>;
    };
    expect(state.isWithdrawal).toBe(true);
    expect(state.bgpTables["R1"].length).toBe(0);
  });

  it("detects AS loop when local ASN is present in AS_PATH and marks route invalid", () => {
    const loopedRoute: BgpRoute = {
      id: "path-loop",
      prefix: "203.0.113.0/24",
      prefixLength: 24,
      nextHop: "192.0.2.2",
      localPreference: 300,
      asPath: [65002, 65001, 65004], // contains 65001 (local AS)
      med: 0,
      origin: "igp",
      valid: true,
      best: false,
    };

    const result = evaluateBgpBestPath([loopedRoute], 65001);
    expect(result.bestRoute).toBeNull();
    expect(result.evaluatedRoutes[0].valid).toBe(false);
    expect(result.evaluatedRoutes[0].rejectionReason).toContain("AS Loop Detected");
  });
});

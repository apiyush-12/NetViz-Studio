import { describe, it, expect } from "vitest";
import { generateOspfSimulation } from "@/features/protocols/ospf/ospf.simulator";
import { DEFAULT_OSPF_TOPOLOGY, defaultOspfConfig } from "@/features/protocols/ospf/ospf.defaults";
import { runDijkstraSpf } from "@/features/protocols/ospf/ospf.spf";
import { DEFAULT_OSPF_ROUTERS, DEFAULT_OSPF_LINKS } from "@/features/protocols/ospf/ospf.defaults";

describe("OSPF Protocol Engine & Simulator", () => {
  it("generates OSPF simulation events and packets", () => {
    const result = generateOspfSimulation(DEFAULT_OSPF_TOPOLOGY, defaultOspfConfig);
    expect(result.events.length).toBeGreaterThan(10);
    expect(result.packets.length).toBeGreaterThan(0);

    const helloEvents = result.events.filter((e) => e.title.includes("Hello"));
    expect(helloEvents.length).toBeGreaterThanOrEqual(2);

    const neighborEvents = result.events.filter((e) => e.type === "neighbor-discovered" || e.type === "state-change");
    expect(neighborEvents.length).toBeGreaterThan(0);
  });

  it("calculates shortest path from R1 to R4 as R1 -> R2 -> R4 with cost 15", () => {
    const spf = runDijkstraSpf("R1", DEFAULT_OSPF_ROUTERS, DEFAULT_OSPF_LINKS);
    expect(spf.shortestPaths["R4"]).toBeDefined();
    expect(spf.shortestPaths["R4"].cost).toBe(15);
    expect(spf.shortestPaths["R4"].path).toEqual(["R1", "R2", "R4"]);
  });

  it("recalculates shortest path to R1 -> R3 -> R4 (cost 25) when R2-R4 cost increases to 50", () => {
    const modifiedLinks = DEFAULT_OSPF_LINKS.map((l) =>
      l.id === "link-R2-R4" ? { ...l, cost: 50 } : l
    );
    const spf = runDijkstraSpf("R1", DEFAULT_OSPF_ROUTERS, modifiedLinks);
    expect(spf.shortestPaths["R4"]).toBeDefined();
    expect(spf.shortestPaths["R4"].cost).toBe(25);
    expect(spf.shortestPaths["R4"].path).toEqual(["R1", "R3", "R4"]);
  });

  it("handles link failure by routing around the broken link", () => {
    const result = generateOspfSimulation(DEFAULT_OSPF_TOPOLOGY, {
      ...defaultOspfConfig,
      failureScenario: "r2_r4_break",
    });
    const state = result.initialState as {
      spfResults: Record<string, { shortestPaths: Record<string, { cost: number; path: string[] }> }>;
    };
    expect(state).toBeDefined();
    const spfR1 = state.spfResults["R1"];
    expect(spfR1.shortestPaths["R4"].path).toEqual(["R1", "R3", "R4"]);
    expect(spfR1.shortestPaths["R4"].cost).toBe(25);
  });

  it("supports Redundant Ring topology preset (5 Routers) and computes loop-free SPF", () => {
    const result = generateOspfSimulation(DEFAULT_OSPF_TOPOLOGY, {
      ...defaultOspfConfig,
      topologyPreset: "ring",
    });
    const state = result.initialState as {
      routers: Array<{ nodeId: string }>;
      spfResults: Record<string, { shortestPaths: Record<string, { cost: number; path: string[] }> }>;
    };
    expect(state.routers.length).toBe(5);
    const spfR1 = state.spfResults["R1"];
    expect(spfR1.shortestPaths["R3"]).toBeDefined();
    expect(spfR1.shortestPaths["R3"].cost).toBe(20);
  });

  it("supports Multi-Area Hierarchy topology preset with ABR", () => {
    const result = generateOspfSimulation(DEFAULT_OSPF_TOPOLOGY, {
      ...defaultOspfConfig,
      topologyPreset: "multi-area",
    });
    const state = result.initialState as {
      areas: Array<{ id: string }>;
      routers: Array<{ nodeId: string }>;
    };
    expect(state.areas.length).toBe(2);
    expect(state.routers.length).toBe(4);
  });

  it("supports Triangle Mesh topology preset and root router re-calculation", () => {
    const result = generateOspfSimulation(DEFAULT_OSPF_TOPOLOGY, {
      ...defaultOspfConfig,
      topologyPreset: "triangle",
      rootRouterId: "R2",
    });
    const state = result.initialState as {
      routers: Array<{ nodeId: string }>;
      rootRouterId: string;
      spfResults: Record<string, { shortestPaths: Record<string, { cost: number; path: string[] }> }>;
    };
    expect(state.routers.length).toBe(3);
    expect(state.rootRouterId).toBe("R2");
    expect(state.spfResults["R2"].shortestPaths["R3"].cost).toBe(10);
  });

  it("detects Area ID mismatch in validation", () => {
    const result = generateOspfSimulation(DEFAULT_OSPF_TOPOLOGY, {
      ...defaultOspfConfig,
      failureScenario: "area_mismatch",
    });
    const state = result.initialState as {
      validationErrors: Array<{ field: string }>;
    };
    const errors = state.validationErrors;
    expect(errors.some((e) => e.field === "areaId")).toBe(true);
  });

  it("detects duplicate Router ID in validation", () => {
    const result = generateOspfSimulation(DEFAULT_OSPF_TOPOLOGY, {
      ...defaultOspfConfig,
      failureScenario: "duplicate_rid",
    });
    const state = result.initialState as {
      validationErrors: Array<{ field: string }>;
    };
    const errors = state.validationErrors;
    expect(errors.some((e) => e.field === "routerId")).toBe(true);
  });
});

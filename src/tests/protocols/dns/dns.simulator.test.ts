import { describe, it, expect } from "vitest";
import { generateDnsSimulation } from "@/features/protocols/dns/dns.simulator";
import { defaultDnsConfig, getDnsPresetData } from "@/features/protocols/dns/dns.defaults";

describe("DNS Protocol Engine & Simulator", () => {
  const presetData = getDnsPresetData("iterative-hierarchy");

  it("generates DNS query and response simulation events and packets", () => {
    const result = generateDnsSimulation(presetData.topology, defaultDnsConfig);
    expect(result.events.length).toBeGreaterThanOrEqual(4);
    expect(result.packets.length).toBeGreaterThanOrEqual(3);

    const queryPkt = result.packets.find((p) => p.label.includes("DNS Q"));
    const ansPkt = result.packets.find((p) => p.label.includes("DNS"));
    expect(queryPkt).toBeDefined();
    expect(ansPkt).toBeDefined();
  });

  it("resolves www.example.com to 93.184.216.34 through iterative hierarchy traversal", () => {
    const result = generateDnsSimulation(presetData.topology, defaultDnsConfig);
    const state = result.initialState as {
      resolvedRecords: Array<{ name: string; type: string; value: string }>;
      outcome: { success: boolean; rcode: string };
    };

    expect(state.outcome.success).toBe(true);
    expect(state.outcome.rcode).toBe("NOERROR");
    expect(state.resolvedRecords.length).toBeGreaterThan(0);
    expect(state.resolvedRecords[0].value).toBe("93.184.216.34");
  });

  it("handles Local Resolver Cache HIT without querying upstream servers", () => {
    const result = generateDnsSimulation(presetData.topology, {
      ...defaultDnsConfig,
      failureScenario: "cache_hit",
    });
    const state = result.initialState as { outcome: { isCacheHit: boolean } };
    expect(state.outcome.isCacheHit).toBe(true);
    expect(result.packets.length).toBe(2); // Only Client <-> Resolver
  });

  it("handles CNAME Alias Chain resolution", () => {
    const result = generateDnsSimulation(presetData.topology, {
      ...defaultDnsConfig,
      topologyPreset: "cname-chain",
      failureScenario: "cname_resolution",
      queryHostname: "store.example.com",
    });
    const state = result.initialState as {
      resolvedRecords: Array<{ type: string; value: string }>;
      outcome: { success: boolean };
    };

    expect(state.outcome.success).toBe(true);
    expect(state.resolvedRecords.some((r) => r.type === "CNAME")).toBe(true);
    expect(state.resolvedRecords.some((r) => r.type === "A" && r.value === "198.51.100.42")).toBe(true);
  });

  it("handles Non-Existent Domain (NXDOMAIN) return code", () => {
    const result = generateDnsSimulation(presetData.topology, {
      ...defaultDnsConfig,
      failureScenario: "nxdomain_not_found",
      queryHostname: "unknown.invalid",
    });
    const state = result.initialState as { outcome: { success: boolean; rcode: string } };
    expect(state.outcome.success).toBe(false);
    expect(state.outcome.rcode).toBe("NXDOMAIN");
  });

  it("handles Nameserver Timeout with SERVFAIL return code", () => {
    const result = generateDnsSimulation(presetData.topology, {
      ...defaultDnsConfig,
      failureScenario: "authoritative_timeout_servfail",
    });
    const state = result.initialState as { outcome: { success: boolean; rcode: string } };
    expect(state.outcome.success).toBe(false);
    expect(state.outcome.rcode).toBe("SERVFAIL");
  });

  it("supports Split-Horizon DNS topology preset", () => {
    const result = generateDnsSimulation(presetData.topology, {
      ...defaultDnsConfig,
      topologyPreset: "split-brain-lan",
    });
    const state = result.initialState as { nodes: Array<{ id: string }> };
    expect(state.nodes.some((n) => n.id === "resolver-internal")).toBe(true);
    expect(state.nodes.some((n) => n.id === "resolver-external")).toBe(true);
  });
});

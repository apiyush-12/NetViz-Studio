import { describe, it, expect } from "vitest";
import { generateDhcpSimulation } from "@/features/protocols/dhcp/dhcp.simulator";
import { defaultDhcpConfig, getDhcpPresetData } from "@/features/protocols/dhcp/dhcp.defaults";

describe("DHCP Protocol Engine & Simulator", () => {
  const presetData = getDhcpPresetData("simple-lan");

  it("generates DORA simulation events and packets", () => {
    const result = generateDhcpSimulation(presetData.topology, defaultDhcpConfig);
    expect(result.events.length).toBeGreaterThanOrEqual(4);
    expect(result.packets.length).toBeGreaterThanOrEqual(4);

    const discoverPkt = result.packets.find((p) => p.label.includes("DISCOVER"));
    const offerPkt = result.packets.find((p) => p.label.includes("OFFER"));
    const requestPkt = result.packets.find((p) => p.label.includes("REQUEST"));
    const ackPkt = result.packets.find((p) => p.label.includes("ACK"));

    expect(discoverPkt).toBeDefined();
    expect(offerPkt).toBeDefined();
    expect(requestPkt).toBeDefined();
    expect(ackPkt).toBeDefined();
  });

  it("advances client FSM through INIT -> SELECTING -> REQUESTING -> BOUND", () => {
    const result = generateDhcpSimulation(presetData.topology, defaultDhcpConfig);
    const state = result.initialState as {
      fsmSteps: Array<{ fromState: string; toState: string }>;
      activeLease: { ipAddress: string; state: string } | null;
    };

    expect(state.fsmSteps.length).toBeGreaterThanOrEqual(4);
    expect(state.fsmSteps[0].fromState).toBe("INIT");
    expect(state.fsmSteps[0].toState).toBe("SELECTING");
    expect(state.activeLease).toBeDefined();
    expect(state.activeLease?.state).toBe("active");
    expect(state.activeLease?.ipAddress).toMatch(/^192\.168\.1\.\d+$/);
  });

  it("supports Dual-Server Redundancy topology preset", () => {
    const result = generateDhcpSimulation(presetData.topology, {
      ...defaultDhcpConfig,
      topologyPreset: "dual-server",
    });
    const state = result.initialState as { nodes: Array<{ role?: string }> };
    const servers = state.nodes.filter((n) => n.role?.includes("server"));
    expect(servers.length).toBe(2);
  });

  it("supports DHCP Relay Agent (IP Helper) topology preset", () => {
    const result = generateDhcpSimulation(presetData.topology, {
      ...defaultDhcpConfig,
      topologyPreset: "relay-agent",
    });
    const state = result.initialState as { nodes: Array<{ type: string }> };
    expect(state.nodes.some((n) => n.type === "relay")).toBe(true);
  });

  it("supports Exhaustion & Rogue Server topology preset", () => {
    const result = generateDhcpSimulation(presetData.topology, {
      ...defaultDhcpConfig,
      topologyPreset: "exhaustion-rogue",
    });
    const state = result.initialState as { nodes: Array<{ role?: string }> };
    expect(state.nodes.some((n) => n.role === "rogue-server")).toBe(true);
  });

  it("handles Address Pool Exhaustion failure scenario", () => {
    const result = generateDhcpSimulation(presetData.topology, {
      ...defaultDhcpConfig,
      failureScenario: "pool_exhausted",
    });
    const state = result.initialState as {
      activeLease: unknown;
      validationErrors: Array<{ id: string }>;
    };
    expect(state.activeLease).toBeNull();
    const dropEvent = result.events.find((e) => e.type === "packet-dropped");
    expect(dropEvent).toBeDefined();
  });

  it("handles IP Address Conflict by sending DHCPDECLINE", () => {
    const result = generateDhcpSimulation(presetData.topology, {
      ...defaultDhcpConfig,
      failureScenario: "ip_conflict_decline",
    });
    const declinePkt = result.packets.find((p) => p.label.includes("DECLINE"));
    expect(declinePkt).toBeDefined();
  });

  it("handles invalid scope by issuing DHCPNAK", () => {
    const result = generateDhcpSimulation(presetData.topology, {
      ...defaultDhcpConfig,
      failureScenario: "dhcp_nak",
    });
    const nakPkt = result.packets.find((p) => p.label.includes("NAK"));
    expect(nakPkt).toBeDefined();
  });
});

import { describe, it, expect } from "vitest";
import { generateTcpSimulation } from "@/features/protocols/tcp/tcp.simulator";
import { DEFAULT_TWO_HOST_TOPOLOGY } from "@/features/protocols/shared/protocol-utils";
import { defaultTcpConfig } from "@/features/protocols/tcp/tcp.config";

describe("tcp.simulator", () => {
  it("generates handshake events", () => {
    const result = generateTcpSimulation(DEFAULT_TWO_HOST_TOPOLOGY, defaultTcpConfig);
    expect(result.events.length).toBeGreaterThan(0);
    expect(result.packets.length).toBeGreaterThan(0);

    const handshakeEvents = result.events.filter((e) => e.type === "handshake-step");
    expect(handshakeEvents.length).toBeGreaterThanOrEqual(3);
  });

  it("generates retransmission on packet drop", () => {
    const result = generateTcpSimulation(DEFAULT_TWO_HOST_TOPOLOGY, {
      ...defaultTcpConfig,
      dropPacketIndex: 0,
    });

    const dropped = result.events.filter((e) => e.type === "packet-dropped");
    const timeout = result.events.filter((e) => e.type === "timeout");
    const retrans = result.events.filter((e) => e.type === "retransmission");

    expect(dropped.length).toBeGreaterThanOrEqual(1);
    expect(timeout.length).toBeGreaterThanOrEqual(1);
    expect(retrans.length).toBeGreaterThanOrEqual(1);
  });

  it("includes state-change events", () => {
    const result = generateTcpSimulation(DEFAULT_TWO_HOST_TOPOLOGY, defaultTcpConfig);
    const stateChanges = result.events.filter((e) => e.type === "state-change");
    expect(stateChanges.length).toBeGreaterThan(0);
  });
});

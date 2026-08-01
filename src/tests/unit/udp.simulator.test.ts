import { describe, it, expect } from "vitest";
import { generateUdpSimulation } from "@/features/protocols/udp/udp.simulator";
import { DEFAULT_TWO_HOST_TOPOLOGY } from "@/features/protocols/shared/protocol-utils";
import { defaultUdpConfig } from "@/features/protocols/udp/udp.config";

describe("udp.simulator", () => {
  it("generates datagram events without native ACKs", () => {
    const result = generateUdpSimulation(DEFAULT_TWO_HOST_TOPOLOGY, defaultUdpConfig);

    const ackEvents = result.events.filter((e) => e.type === "acknowledgement-sent");
    expect(ackEvents.length).toBe(0);

    const sent = result.events.filter((e) => e.type === "packet-sent");
    expect(sent.length).toBeGreaterThan(0);
  });

  it("marks dropped datagrams without retransmission", () => {
    const result = generateUdpSimulation(DEFAULT_TWO_HOST_TOPOLOGY, {
      ...defaultUdpConfig,
      dropIndices: [1],
    });

    const dropped = result.events.filter((e) => e.type === "packet-dropped");
    const retrans = result.events.filter((e) => e.type === "retransmission");
    expect(dropped.length).toBeGreaterThanOrEqual(1);
    expect(retrans.length).toBe(0);
  });

  it("labels application response as not UDP ACK", () => {
    const result = generateUdpSimulation(DEFAULT_TWO_HOST_TOPOLOGY, defaultUdpConfig);
    const appResponse = result.events.find((e) =>
      e.title.includes("Application-Level Response")
    );
    expect(appResponse).toBeDefined();
    expect(appResponse?.payload?.notUdpAck).toBe(true);
  });
});

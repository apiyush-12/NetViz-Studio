import { describe, it, expect } from "vitest";
import { runForwardingSimulation } from "@/features/forwarding/forwarding-engine";
import { SAMPLE_TOPOLOGIES } from "@/data/sample-topologies";

describe("Forwarding & Simulation Engine", () => {
  it("should successfully forward ping packet in 2-host LAN", () => {
    const topo = SAMPLE_TOPOLOGIES[0].getTopology();
    const result = runForwardingSimulation(topo, {
      id: "scen-1",
      name: "Ping Test",
      trafficType: "ping",
      sourceNodeId: "pc-1",
      destinationNodeId: "pc-2",
      protocol: "ICMP",
    });

    expect(result.success).toBe(true);
    expect(result.events.length).toBeGreaterThan(0);
    expect(result.packet.status).toBe("delivered");
  });

  it("should forward packet across gateway router in 2-subnet lab", () => {
    const topo = SAMPLE_TOPOLOGIES[1].getTopology();
    const result = runForwardingSimulation(topo, {
      id: "scen-2",
      name: "Cross-Subnet Ping",
      trafficType: "ping",
      sourceNodeId: "pc-1",
      destinationNodeId: "pc-2",
      protocol: "ICMP",
    });

    expect(result.success).toBe(true);
    expect(result.totalHops).toBe(5); // PC1 -> SW1 -> Router -> SW2 -> PC2
  });
});

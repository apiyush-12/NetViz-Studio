import { describe, it, expect } from "vitest";
import { processSwitchFrame } from "@/features/forwarding/switching-engine";
import { SAMPLE_TOPOLOGIES } from "@/data/sample-topologies";

describe("Layer 2 Switching Engine", () => {
  it("should flood unknown unicast frame and learn source MAC", () => {
    const topo = SAMPLE_TOPOLOGIES[0].getTopology();
    const switchNode = topo.nodes.find((n) => n.type === "l2-switch")!;

    const decision = processSwitchFrame(
      switchNode,
      "GigabitEthernet0/1",
      "02:00:00:00:00:01",
      "02:00:00:00:00:02",
      1
    );

    expect(decision.action).toBe("flood");
    expect(decision.updatedMacTable.length).toBeGreaterThan(0);
    expect(decision.updatedMacTable[0].macAddress).toBe("02:00:00:00:00:01");
  });

  it("should forward known unicast frame directly to target port", () => {
    const topo = SAMPLE_TOPOLOGIES[0].getTopology();
    const switchNode = topo.nodes.find((n) => n.type === "l2-switch")!;

    switchNode.macTable = [
      {
        macAddress: "02:00:00:00:00:02",
        vlanId: 1,
        portName: "GigabitEthernet0/2",
        type: "dynamic",
        remainingAgeSeconds: 300,
      },
    ];

    const decision = processSwitchFrame(
      switchNode,
      "GigabitEthernet0/1",
      "02:00:00:00:00:01",
      "02:00:00:00:00:02",
      1
    );

    expect(decision.action).toBe("forward");
    expect(decision.targetPortNames).toContain("GigabitEthernet0/2");
  });
});

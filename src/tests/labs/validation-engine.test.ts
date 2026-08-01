import { describe, it, expect } from "vitest";
import { evaluateTaskValidation } from "@/features/labs/validation/validation-engine";
import { SAMPLE_TOPOLOGIES } from "@/data/sample-topologies";
import { LabTask } from "@/features/labs/lab-types";

describe("Lab Validation Engine", () => {
  it("should validate interfaceAddressEquals validator", () => {
    const topo = SAMPLE_TOPOLOGIES[0].getTopology();
    topo.nodes[0].interfaces[0].ipv4 = { address: "192.168.1.10", prefixLength: 24 };

    const task: LabTask = {
      id: "t1",
      order: 1,
      title: "Configure IP",
      instruction: "Configure PC-1 IP",
      type: "configure-ip",
      required: true,
      points: 10,
      validator: {
        type: "interfaceAddressEquals",
        nodeId: topo.nodes[0].id,
        address: "192.168.1.10",
        prefixLength: 24,
      },
      successMessage: "Success",
      failureMessage: "Failed",
    };

    const result = evaluateTaskValidation(task, topo);
    expect(result.passed).toBe(true);
    expect(result.scoreAwarded).toBe(10);
  });

  it("should validate answerEquals validator for MCQ tasks", () => {
    const topo = SAMPLE_TOPOLOGIES[0].getTopology();
    const task: LabTask = {
      id: "t2",
      order: 2,
      title: "Answer Question",
      instruction: "Select protocol",
      type: "answer-mcq",
      required: true,
      points: 5,
      validator: {
        type: "answerEquals",
        expected: "UDP",
      },
      successMessage: "Correct",
      failureMessage: "Wrong",
    };

    const result = evaluateTaskValidation(task, topo, "UDP");
    expect(result.passed).toBe(true);

    const wrongResult = evaluateTaskValidation(task, topo, "TCP");
    expect(wrongResult.passed).toBe(false);
  });

  it("should validate packetDelivered validator using forwarding simulation", () => {
    const topo = SAMPLE_TOPOLOGIES[0].getTopology();
    const task: LabTask = {
      id: "t3",
      order: 3,
      title: "Ping Test",
      instruction: "Ping PC-2",
      type: "send-ping",
      required: true,
      points: 20,
      validator: {
        type: "packetDelivered",
        sourceNodeId: "pc-1",
        destinationNodeId: "pc-2",
      },
      successMessage: "Delivered",
      failureMessage: "Dropped",
    };

    const result = evaluateTaskValidation(task, topo);
    expect(result.passed).toBe(true);
  });
});

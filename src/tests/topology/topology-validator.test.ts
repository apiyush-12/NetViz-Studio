import { describe, it, expect } from "vitest";
import { validateTopology } from "@/features/topology/topology-validator";
import { SAMPLE_TOPOLOGIES } from "@/data/sample-topologies";

describe("Topology Validation Engine", () => {
  it("should validate sample topologies without critical errors", () => {
    SAMPLE_TOPOLOGIES.forEach((sample) => {
      const topo = sample.getTopology();
      const issues = validateTopology(topo);
      const criticals = issues.filter((i) => i.severity === "critical" || i.severity === "error");
      expect(criticals.length).toBe(0);
    });
  });

  it("should detect duplicate IP addresses across interfaces", () => {
    const topo = SAMPLE_TOPOLOGIES[0].getTopology();
    topo.nodes[0].interfaces[0].ipv4 = { address: "192.168.1.100", prefixLength: 24 };
    topo.nodes[2].interfaces[0].ipv4 = { address: "192.168.1.100", prefixLength: 24 };

    const issues = validateTopology(topo);
    const dupIpIssue = issues.find((i) => i.title.includes("Duplicate IP Address"));
    expect(dupIpIssue).toBeDefined();
    expect(dupIpIssue?.severity).toBe("critical");
  });

  it("should detect default gateway outside host subnet", () => {
    const topo = SAMPLE_TOPOLOGIES[1].getTopology();
    const pc1 = topo.nodes.find((n) => n.id === "pc-1")!;
    pc1.configuration.defaultGateway = "10.0.0.1";

    const issues = validateTopology(topo);
    const gwIssue = issues.find((i) => i.title.includes("Default Gateway Outside Subnet"));
    expect(gwIssue).toBeDefined();
  });
});

import { describe, it, expect } from "vitest";
import { calculateCidr, splitSubnet } from "@/features/cidr/cidr-calculator";

describe("cidr-calculator", () => {
  it("calculates 192.168.1.10/24 correctly", () => {
    const result = calculateCidr("192.168.1.10/24");
    expect(result.isValid).toBe(true);
    if (!result.isValid) return;

    expect(result.networkAddress).toBe("192.168.1.0");
    expect(result.broadcastAddress).toBe("192.168.1.255");
    expect(result.firstUsableHost).toBe("192.168.1.1");
    expect(result.lastUsableHost).toBe("192.168.1.254");
    expect(result.totalAddresses).toBe("256");
    expect(result.usableHostCount).toBe("254");
    expect(result.subnetMask).toBe("255.255.255.0");
    expect(result.wildcardMask).toBe("0.0.0.255");
  });

  it("handles /32 host route", () => {
    const result = calculateCidr("10.0.0.1/32");
    expect(result.isValid).toBe(true);
    if (!result.isValid) return;

    expect(result.networkAddress).toBe("10.0.0.1");
    expect(result.broadcastAddress).toBe("10.0.0.1");
    expect(result.usableHostCount).toBe("1");
    expect(result.isHostRoute).toBe(true);
  });

  it("handles /31 point-to-point", () => {
    const result = calculateCidr("192.168.1.0/31");
    expect(result.isValid).toBe(true);
    if (!result.isValid) return;

    expect(result.usableHostCount).toBe("2");
    expect(result.firstUsableHost).toBe("192.168.1.0");
    expect(result.lastUsableHost).toBe("192.168.1.1");
    expect(result.isPointToPoint).toBe(true);
  });

  it("handles /30", () => {
    const result = calculateCidr("192.168.1.0/30");
    expect(result.isValid).toBe(true);
    if (!result.isValid) return;

    expect(result.usableHostCount).toBe("2");
    expect(result.firstUsableHost).toBe("192.168.1.1");
    expect(result.lastUsableHost).toBe("192.168.1.2");
  });

  it("handles /0", () => {
    const result = calculateCidr("0.0.0.0/0");
    expect(result.isValid).toBe(true);
    if (!result.isValid) return;

    expect(result.networkAddress).toBe("0.0.0.0");
    expect(result.broadcastAddress).toBe("255.255.255.255");
  });

  it("splits /24 into four /26 subnets", () => {
    const result = splitSubnet("192.168.1.0/24", 26);
    expect("subnets" in result).toBe(true);
    if (!("subnets" in result)) return;

    expect(result.subnets).toHaveLength(4);
    expect(result.subnets[0].networkAddress).toBe("192.168.1.0");
    expect(result.subnets[1].networkAddress).toBe("192.168.1.64");
    expect(result.subnets[2].networkAddress).toBe("192.168.1.128");
    expect(result.subnets[3].networkAddress).toBe("192.168.1.192");
    expect(result.subnets[0].usableHostCount).toBe("62");
  });

  it("returns error for invalid IP", () => {
    const result = calculateCidr("999.999.999.999/24");
    expect(result.isValid).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import { ipToBigInt, bigIntToIp, parseCidrInput, maskToPrefix } from "@/features/cidr/ipv4-parser";

describe("ipv4-parser", () => {
  it("converts IP to BigInt and back", () => {
    expect(ipToBigInt("192.168.1.10")).toBe(0xc0a8010an);
    expect(bigIntToIp(0xc0a8010an)).toBe("192.168.1.10");
  });

  it("rejects invalid octets", () => {
    expect(ipToBigInt("256.1.1.1")).toBeNull();
    expect(ipToBigInt("192.168.1")).toBeNull();
  });

  it("parses CIDR notation", () => {
    const result = parseCidrInput("192.168.1.10/24");
    expect("ip" in result && result.ip).toBe("192.168.1.10");
    expect("prefix" in result && result.prefix).toBe(24);
  });

  it("rejects invalid prefix", () => {
    const result = parseCidrInput("192.168.1.10/33");
    expect("isValid" in result && result.isValid).toBe(false);
  });

  it("converts subnet mask to prefix", () => {
    expect(maskToPrefix("255.255.255.0")).toBe(24);
    expect(maskToPrefix("255.255.0.0")).toBe(16);
  });

  it("rejects non-contiguous mask", () => {
    expect(maskToPrefix("255.0.255.0")).toBeNull();
  });
});

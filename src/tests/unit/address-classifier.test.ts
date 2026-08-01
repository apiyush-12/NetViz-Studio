import { describe, it, expect } from "vitest";
import { classifyAddress, getLegacyClass } from "@/features/cidr/address-classifier";

describe("address-classifier", () => {
  it("classifies private addresses", () => {
    expect(classifyAddress("192.168.1.1")).toContain("private");
    expect(classifyAddress("10.0.0.1")).toContain("private");
    expect(classifyAddress("172.16.0.1")).toContain("private");
  });

  it("classifies loopback", () => {
    expect(classifyAddress("127.0.0.1")).toContain("loopback");
  });

  it("classifies link-local", () => {
    expect(classifyAddress("169.254.1.1")).toContain("link-local");
  });

  it("classifies multicast", () => {
    expect(classifyAddress("224.0.0.1")).toContain("multicast");
  });

  it("classifies public addresses", () => {
    expect(classifyAddress("8.8.8.8")).toContain("public");
  });

  it("returns legacy class", () => {
    expect(getLegacyClass(10)).toBe("A");
    expect(getLegacyClass(172)).toBe("B");
    expect(getLegacyClass(192)).toBe("C");
  });
});

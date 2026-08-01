import { describe, it, expect } from "vitest";
import { calculateCidr } from "@/features/cidr/cidr-calculator";
import { INITIAL_LABS } from "@/data/lab-catalog";
import { CORE_FEATURES, PROTOCOL_CATALOG, FAQS } from "@/features/landing/landing-content";

describe("Landing Page Data Models & Helpers", () => {
  it("has valid core feature items with mandatory fields", () => {
    expect(CORE_FEATURES.length).toBeGreaterThanOrEqual(6);
    CORE_FEATURES.forEach((feature) => {
      expect(feature.id).toBeTruthy();
      expect(feature.title).toBeTruthy();
      expect(feature.description).toBeTruthy();
      expect(feature.status).toBe("available");
    });
  });

  it("has accurate protocol catalog statuses without marking unreleased items as available", () => {
    const tcp = PROTOCOL_CATALOG.find((p) => p.id === "tcp");
    const udp = PROTOCOL_CATALOG.find((p) => p.id === "udp");
    const ospf = PROTOCOL_CATALOG.find((p) => p.id === "ospf");

    expect(tcp?.status).toBe("available");
    expect(udp?.status).toBe("available");
    expect(ospf?.status).toBe("planned");
  });

  it("calculates real CIDR subnet values for default landing page input 192.168.1.10/24", () => {
    const result = calculateCidr("192.168.1.10/24");
    expect(result.isValid).toBe(true);
    if ("isValid" in result && result.isValid) {
      expect(result.networkAddress).toBe("192.168.1.0");
      expect(result.broadcastAddress).toBe("192.168.1.255");
      expect(result.firstUsableHost).toBe("192.168.1.1");
      expect(result.lastUsableHost).toBe("192.168.1.254");
      expect(result.totalAddresses).toBe("256");
      expect(result.usableHostCount).toBe("254");
      expect(result.networkBits).toBe(24);
      expect(result.hostBits).toBe(8);
    }
  });

  it("handles invalid CIDR input on landing preview gracefully", () => {
    const result = calculateCidr("invalid-ip-string");
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.message).toBeTruthy();
    }
  });

  it("contains 12 accessible FAQ items", () => {
    expect(FAQS.length).toBe(12);
    FAQS.forEach((faq) => {
      expect(faq.question).toBeTruthy();
      expect(faq.answer).toBeTruthy();
    });
  });

  it("loads 8 featured lab metadata items from INITIAL_LABS", () => {
    expect(INITIAL_LABS.length).toBeGreaterThanOrEqual(8);
  });
});

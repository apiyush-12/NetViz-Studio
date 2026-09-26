import type { IcmpConfig, IcmpNode, IcmpLink } from "./icmp.types";

export interface IcmpValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateIcmpConfig(config: IcmpConfig): IcmpValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (config.packetSizeBytes < 28) {
    errors.push("Minimum IPv4 + ICMP packet size is 28 bytes (20 bytes IP header + 8 bytes ICMP header).");
  }

  if (config.packetSizeBytes > 9000) {
    errors.push("Packet size cannot exceed jumbo frame limit of 9000 bytes.");
  }

  if (config.startingTtl < 1 || config.startingTtl > 255) {
    errors.push("Starting TTL must be between 1 and 255.");
  }

  if (config.scenarioId === "pmtud_df_fragmentation_needed" && !config.dontFragmentFlag) {
    warnings.push("PMTUD scenario requires Don't Fragment (DF=1) to trigger ICMP Fragmentation Needed.");
  }

  if (config.scenarioId === "traceroute_ttl_exceeded" && config.startingTtl > 30) {
    warnings.push("Traceroute typically begins with TTL=1 and increments sequentially.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateIcmpTopology(nodes: IcmpNode[], links: IcmpLink[]): IcmpValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (nodes.length < 2) {
    errors.push("Topology must contain at least two nodes to simulate ICMP communications.");
  }

  const hasSource = nodes.some((n) => n.type === "host");
  const hasTarget = nodes.some((n) => n.type === "server" || n.type === "host");

  if (!hasSource) {
    errors.push("Topology requires at least one source client host.");
  }
  if (!hasTarget) {
    errors.push("Topology requires at least one destination target.");
  }

  // Check link MTUs
  links.forEach((link) => {
    if (link.mtu < 68) {
      errors.push(`Link ${link.id} has MTU ${link.mtu}, which is below the minimum IPv4 requirement of 68 bytes.`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

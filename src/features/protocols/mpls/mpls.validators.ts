import type { MplsConfig, MplsNode, MplsLink } from "./mpls.types";

export interface MplsValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateMplsConfig(config: MplsConfig): MplsValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (config.trafficClassExp < 0 || config.trafficClassExp > 7) {
    errors.push(`Traffic Class / EXP must be between 0 and 7 (received: ${config.trafficClassExp}).`);
  }

  if (config.scenarioId === "php_implicit_null" && !config.phpEnabled) {
    warnings.push("PHP scenario is active but PHP toggle is disabled; router will perform regular POP instead of Penultimate Hop Popping.");
  }

  if (config.scenarioId === "frr_link_failure_detour" && config.topologyPreset !== "mpls_fast_reroute_frr") {
    warnings.push("FRR scenario is typically visualized with the Fast Reroute preset topology.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateMplsTopology(nodes: MplsNode[], links: MplsLink[]): MplsValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Verify that an ingress LER and egress LER exist
  const hasIngress = nodes.some((n) => n.role === "ingress-ler");
  const hasEgress = nodes.some((n) => n.role === "egress-ler");

  if (!hasIngress) {
    errors.push("Topology is missing an Ingress Label Edge Router (Ingress LER).");
  }
  if (!hasEgress) {
    errors.push("Topology is missing an Egress Label Edge Router (Egress LER).");
  }

  // Check for broken LSP links
  const lspLinks = links.filter((l) => l.isLsp);
  if (lspLinks.length === 0) {
    errors.push("No Label Switched Path (LSP) links defined in topology.");
  }

  // Validate reserved labels
  nodes.forEach((node) => {
    node.lfib.forEach((entry) => {
      if (entry.inLabel >= 0 && entry.inLabel <= 15) {
        if (entry.inLabel !== 3 && entry.inLabel !== 0 && entry.inLabel !== 1 && entry.inLabel !== 2) {
          warnings.push(`Router ${node.name} has incoming label ${entry.inLabel} in reserved range (0-15).`);
        }
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

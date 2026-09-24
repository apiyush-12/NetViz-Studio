import type {
  SimulationResult,
  TopologyDefinition,
} from "@/features/simulation/simulation-types";
import type { MplsConfig, MplsSimulationOutcome } from "./mpls.types";
import { defaultMplsConfig, MPLS_PRESETS } from "./mpls.defaults";
import { generateMplsEventSequence } from "./mpls.events";
import { mplsConfigSchema } from "./mpls.schema";
import { validateMplsConfig, validateMplsTopology } from "./mpls.validators";

export function simulateMplsTransaction(
  rawConfig: Record<string, unknown> = {}
): MplsSimulationOutcome {
  const parsed = mplsConfigSchema.safeParse({
    ...defaultMplsConfig,
    ...rawConfig,
  });
  const config: MplsConfig = parsed.success ? (parsed.data as MplsConfig) : defaultMplsConfig;
  return generateMplsEventSequence(config);
}

export function generateMplsSimulation(
  _topology: TopologyDefinition,
  rawConfig: Record<string, unknown>
): SimulationResult {
  const outcome = simulateMplsTransaction(rawConfig);
  const config = { ...defaultMplsConfig, ...rawConfig } as MplsConfig;
  const preset = MPLS_PRESETS[config.topologyPreset] || MPLS_PRESETS.standard_core_lsp;
  const configValidation = validateMplsConfig(config);
  const topologyValidation = validateMplsTopology(preset.nodes, preset.links);

  return {
    events: outcome.events,
    packets: outcome.packets,
    initialState: {
      steps: outcome.steps,
      nodes: outcome.finalNodes,
      links: outcome.finalLinks,
      config,
      validationErrors: [...configValidation.errors, ...topologyValidation.errors],
      selectedNodeId: outcome.finalNodes[0]?.id ?? "pe-1",
    },
  };
}

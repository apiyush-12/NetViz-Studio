import type {
  SimulationResult,
  TopologyDefinition,
} from "@/features/simulation/simulation-types";
import type { IcmpConfig, IcmpSimulationOutcome } from "./icmp.types";
import { defaultIcmpConfig, ICMP_PRESETS } from "./icmp.defaults";
import { generateIcmpEventSequence } from "./icmp.events";
import { icmpConfigSchema } from "./icmp.schema";
import { validateIcmpConfig, validateIcmpTopology } from "./icmp.validators";

export function simulateIcmpTransaction(
  rawConfig: Record<string, unknown> = {}
): IcmpSimulationOutcome {
  const parsed = icmpConfigSchema.safeParse({
    ...defaultIcmpConfig,
    ...rawConfig,
  });
  const config: IcmpConfig = parsed.success ? (parsed.data as IcmpConfig) : defaultIcmpConfig;
  return generateIcmpEventSequence(config);
}

export function generateIcmpSimulation(
  _topology: TopologyDefinition,
  rawConfig: Record<string, unknown>
): SimulationResult {
  const outcome = simulateIcmpTransaction(rawConfig);
  const config = { ...defaultIcmpConfig, ...rawConfig } as IcmpConfig;
  const preset = ICMP_PRESETS[config.topologyPreset] || ICMP_PRESETS.standard_internet_path;
  const configValidation = validateIcmpConfig(config);
  const topologyValidation = validateIcmpTopology(preset.nodes, preset.links);

  return {
    events: outcome.events,
    packets: outcome.packets,
    initialState: {
      steps: outcome.steps,
      nodes: outcome.finalNodes,
      links: outcome.finalLinks,
      config,
      validationErrors: [...configValidation.errors, ...topologyValidation.errors],
      selectedNodeId: outcome.finalNodes[0]?.id ?? "host-a",
    },
  };
}

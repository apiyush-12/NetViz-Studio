import type {
  SimulationResult,
  TopologyDefinition,
} from "@/features/simulation/simulation-types";
import type {
  VlanConfig,
  VlanNode,
  VlanLink,
  VlanSimulationOutcome,
} from "./vlan.types";
import { defaultVlanConfig, getVlanPresetData } from "./vlan.defaults";
import { vlanConfigSchema } from "./vlan.schema";
import { buildVlanSimulationSequence } from "./vlan.events";
import { validateVlanConfiguration } from "./vlan.validators";

export function simulateVlanTransaction(
  rawConfig: Record<string, unknown> = {}
): VlanSimulationOutcome {
  const parsed = vlanConfigSchema.safeParse({
    ...defaultVlanConfig,
    ...rawConfig,
  });

  const config: VlanConfig = parsed.success
    ? (parsed.data as VlanConfig)
    : defaultVlanConfig;

  // 1. Get preset topology data
  const presetData = getVlanPresetData(config.topologyPreset || "multi_vlan_access_switch");
  const nodes: VlanNode[] = JSON.parse(JSON.stringify(presetData.nodes));
  const links: VlanLink[] = JSON.parse(JSON.stringify(presetData.links));

  // 2. Build simulation sequence
  const { events, packets, steps } = buildVlanSimulationSequence(
    nodes,
    links,
    config
  );

  const lastStep = steps[steps.length - 1];
  const finalNodes = lastStep ? lastStep.nodes : nodes;
  const finalLinks = lastStep ? lastStep.links : links;

  return {
    events,
    packets,
    steps,
    finalNodes,
    finalLinks,
  };
}

export function generateVlanSimulation(
  _topology: TopologyDefinition,
  rawConfig: Record<string, unknown>
): SimulationResult {
  const outcome = simulateVlanTransaction(rawConfig);
  const config = { ...defaultVlanConfig, ...rawConfig };
  const presetData = getVlanPresetData(config.topologyPreset || "multi_vlan_access_switch");
  const validationErrors = validateVlanConfiguration(
    presetData.nodes,
    presetData.links,
    config as VlanConfig
  );

  return {
    events: outcome.events,
    packets: outcome.packets,
    initialState: {
      steps: outcome.steps,
      nodes: outcome.finalNodes,
      links: outcome.finalLinks,
      config,
      validationErrors,
      selectedNodeId: outcome.finalNodes[0]?.id ?? "sw-1",
    },
  };
}

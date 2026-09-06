import type {
  SimulationResult,
  TopologyDefinition,
} from "@/features/simulation/simulation-types";
import type {
  StpConfig,
  StpSwitchNode,
  StpLink,
  StpSimulationOutcome,
} from "./stp.types";
import { defaultStpConfig, getStpPresetData } from "./stp.defaults";
import { stpConfigSchema } from "./stp.schema";
import { buildStpSimulationSequence } from "./stp.events";
import { validateStpConfiguration } from "./stp.validators";
import { runSpanningTreeAlgorithm } from "./stp-engine";

export function simulateStpTransaction(
  rawConfig: Record<string, unknown> = {}
): StpSimulationOutcome {
  const parsed = stpConfigSchema.safeParse({
    ...defaultStpConfig,
    ...rawConfig,
  });

  const config: StpConfig = parsed.success ? (parsed.data as StpConfig) : defaultStpConfig;

  // 1. Get preset topology data
  const presetData = getStpPresetData(config.topologyPreset || "triangle_loop");
  const switches: StpSwitchNode[] = presetData.switches;
  const links: StpLink[] = presetData.links;

  // Apply custom switch priorities if provided
  if (config.switches && config.switches.length > 0) {
    for (const swCustom of config.switches) {
      const match = switches.find((s) => s.id === swCustom.id);
      if (match) {
        match.bridgeId.priority = swCustom.priority;
      }
    }
  }

  // Apply custom link costs if provided
  if (config.customLinkCosts && config.customLinkCosts.length > 0) {
    for (const linkCustom of config.customLinkCosts) {
      const match = links.find((l) => l.id === linkCustom.linkId);
      if (match) {
        match.cost = linkCustom.cost;
        const swA = switches.find((s) => s.id === match.sourceSwitchId);
        const swB = switches.find((s) => s.id === match.targetSwitchId);
        const pA = swA?.ports.find((p) => p.id === match.sourcePortId);
        const pB = swB?.ports.find((p) => p.id === match.targetPortId);
        if (pA) pA.cost = linkCustom.cost;
        if (pB) pB.cost = linkCustom.cost;
      }
    }
  }

  // Calculate final Spanning Tree state
  const finalTree = runSpanningTreeAlgorithm(switches, links, {
    version: config.version,
  });

  // Build step-by-step simulation events and packets
  const { events, packets, steps } = buildStpSimulationSequence(
    switches,
    links,
    config
  );

  return {
    events,
    packets,
    steps,
    finalSwitches: finalTree.switches,
    finalLinks: finalTree.links,
    rootBridgeId: finalTree.rootSwitch.bridgeId,
  };
}

export function generateStpSimulation(
  _topology: TopologyDefinition,
  rawConfig: Record<string, unknown>
): SimulationResult {
  const outcome = simulateStpTransaction(rawConfig);
  const config = { ...defaultStpConfig, ...rawConfig };
  const presetData = getStpPresetData(config.topologyPreset || "triangle_loop");
  const validationErrors = validateStpConfiguration(presetData.switches, presetData.links);

  return {
    events: outcome.events,
    packets: outcome.packets,
    initialState: {
      steps: outcome.steps,
      switches: outcome.finalSwitches,
      links: outcome.finalLinks,
      rootBridgeId: outcome.rootBridgeId,
      config,
      validationErrors,
      selectedSwitchId: outcome.finalSwitches[0]?.id ?? "sw1",
    },
  };
}

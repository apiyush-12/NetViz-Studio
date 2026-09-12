import type {
  SimulationResult,
  TopologyDefinition,
} from "@/features/simulation/simulation-types";
import type {
  ArpConfig,
  ArpNode,
  ArpLink,
  ArpSimulationOutcome,
} from "./arp.types";
import { defaultArpConfig, getArpPresetData } from "./arp.defaults";
import { arpConfigSchema } from "./arp.schema";
import { buildArpSimulationSequence } from "./arp.events";
import { validateArpConfiguration } from "./arp.validators";

export function simulateArpTransaction(
  rawConfig: Record<string, unknown> = {}
): ArpSimulationOutcome {
  const parsed = arpConfigSchema.safeParse({
    ...defaultArpConfig,
    ...rawConfig,
  });

  const config: ArpConfig = parsed.success
    ? (parsed.data as ArpConfig)
    : defaultArpConfig;

  // 1. Get preset topology data
  const presetData = getArpPresetData(config.topologyPreset || "standard_lan");
  const nodes: ArpNode[] = JSON.parse(JSON.stringify(presetData.nodes));
  const links: ArpLink[] = JSON.parse(JSON.stringify(presetData.links));

  // 2. Build simulation sequence
  const { events, packets, steps } = buildArpSimulationSequence(
    nodes,
    links,
    config
  );

  const lastStep = steps[steps.length - 1];
  const finalNodes = lastStep ? lastStep.nodes : nodes;
  const finalLinks = lastStep ? lastStep.links : links;

  // Find resolved MAC if available from source's cache
  const srcNode = finalNodes.find((n) => n.id === config.sourceNodeId);
  const resolvedEntry = srcNode?.arpCache.find(
    (e) => e.ipAddress === config.targetIp && e.state === "resolved"
  );

  return {
    events,
    packets,
    steps,
    finalNodes,
    finalLinks,
    resolvedMac: resolvedEntry?.macAddress,
  };
}

export function generateArpSimulation(
  _topology: TopologyDefinition,
  rawConfig: Record<string, unknown>
): SimulationResult {
  const outcome = simulateArpTransaction(rawConfig);
  const config = { ...defaultArpConfig, ...rawConfig };
  const presetData = getArpPresetData(config.topologyPreset || "standard_lan");
  const validationErrors = validateArpConfiguration(
    presetData.nodes,
    presetData.links,
    config as ArpConfig
  );

  return {
    events: outcome.events,
    packets: outcome.packets,
    initialState: {
      steps: outcome.steps,
      nodes: outcome.finalNodes,
      links: outcome.finalLinks,
      resolvedMac: outcome.resolvedMac,
      config,
      validationErrors,
      selectedNodeId: outcome.finalNodes[0]?.id ?? "host-a",
    },
  };
}

import type {
  SimulationResult,
  TopologyDefinition,
  SimulationEvent,
  Packet,
} from "@/features/simulation/simulation-types";
import type { IsisConfig, IsisSimulationOutcome } from "./isis.types";
import { defaultIsisConfig, TOPOLOGY_PRESETS } from "./isis.defaults";
import { generateIsisSimulationSteps } from "./isis.events";
import { isisConfigSchema } from "./isis.schema";
import { validateIsisTopologyAndConfig } from "./isis.validators";

export function simulateIsisTransaction(
  rawConfig: Record<string, unknown> = {}
): IsisSimulationOutcome {
  const parsed = isisConfigSchema.safeParse({
    ...defaultIsisConfig,
    ...rawConfig,
  });
  const config: IsisConfig = parsed.success ? (parsed.data as IsisConfig) : defaultIsisConfig;
  return generateIsisSimulationSteps(config);
}

export function generateIsisSimulation(
  _topology: TopologyDefinition,
  rawConfig: Record<string, unknown>
): SimulationResult {
  const parsed = isisConfigSchema.safeParse({
    ...defaultIsisConfig,
    ...rawConfig,
  });
  const config: IsisConfig = parsed.success ? (parsed.data as IsisConfig) : defaultIsisConfig;
  const outcome = generateIsisSimulationSteps(config);
  const preset = TOPOLOGY_PRESETS[config.topologyPreset] || TOPOLOGY_PRESETS.multi_area_hierarchy;
  const validationIssues = validateIsisTopologyAndConfig(config, preset.nodes, preset.links);

  const events: SimulationEvent[] = outcome.steps.map((step, idx) => ({
    id: `isis-evt-${idx}`,
    timestamp: idx * 1000,
    sequenceNumber: idx + 1,
    type: step.phase === "init" ? "configuration-changed" : "packet-sent",
    sourceNodeId: step.senderId || step.activeNodeId || "r1",
    destinationNodeId: step.receiverIds?.[0] || "r2",
    protocol: "isis",
    title: step.title,
    description: step.description,
    status: "completed",
    severity:
      step.phase === "route_leak"
        ? "warning"
        : step.phase === "dis_elect"
        ? "success"
        : "info",
    metadata: {
      phase: step.phase,
      cliOutputs: step.cliOutputs,
      eventExplanation: step.eventExplanation,
    },
  }));

  const packets: Packet[] = outcome.steps
    .filter((step) => step.activePdu)
    .map((step, idx) => ({
      id: `isis-pkt-${idx}`,
      protocol: "isis",
      label: `${step.activePdu!.pduTypeName} (${step.activePdu!.tlvs.length} TLVs)`,
      source: step.activePdu!.sourceSystemId,
      destination: step.activePdu!.level === "L1" ? "01-80-C2-00-00-14" : "01-80-C2-00-00-15",
      headers: {
        ethernet: {
          dstMac: step.activePdu!.level === "L1" ? "01:80:C2:00:00:14" : "01:80:C2:00:00:15",
          srcMac: "00:1A:2B:3C:4D:5E",
          sap: "0xFEFE (OSI LLC)",
        },
        application: {
          nlpid: "0x83 (IS-IS)",
          pduType: step.activePdu!.pduTypeName,
          level: step.activePdu!.level,
          systemId: step.activePdu!.sourceSystemId,
          hostname: step.activePdu!.sourceHostname,
        },
      },
      payload: JSON.stringify(step.activePdu!.tlvs),
      size: step.activePdu!.packetLength,
      status: "delivered",
      colorKey:
        step.activePdu!.level === "L2"
          ? "blue"
          : step.activePdu!.flags?.attached
          ? "purple"
          : "emerald",
      createdAt: idx * 1000,
    }));

  return {
    events,
    packets,
    initialState: {
      steps: outcome.steps,
      nodes: outcome.finalNodes,
      links: outcome.finalLinks,
      config,
      validationIssues,
      selectedNodeId: outcome.finalNodes[0]?.id ?? "r1",
    },
  };
}

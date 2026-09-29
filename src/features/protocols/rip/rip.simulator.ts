import type {
  SimulationResult,
  TopologyDefinition,
  SimulationEvent,
  Packet,
} from "@/features/simulation/simulation-types";
import type { RipConfig, RipSimulationOutcome } from "./rip.types";
import { defaultRipConfig, TOPOLOGY_PRESETS } from "./rip.defaults";
import { generateRipSimulationSteps } from "./rip.events";
import { ripConfigSchema } from "./rip.schema";
import { validateRipTopologyAndConfig } from "./rip.validators";

export function simulateRipTransaction(
  rawConfig: Record<string, unknown> = {}
): RipSimulationOutcome {
  const parsed = ripConfigSchema.safeParse({
    ...defaultRipConfig,
    ...rawConfig,
  });
  const config: RipConfig = parsed.success ? (parsed.data as RipConfig) : defaultRipConfig;
  return generateRipSimulationSteps(config);
}

export function generateRipSimulation(
  _topology: TopologyDefinition,
  rawConfig: Record<string, unknown>
): SimulationResult {
  const parsed = ripConfigSchema.safeParse({
    ...defaultRipConfig,
    ...rawConfig,
  });
  const config: RipConfig = parsed.success ? (parsed.data as RipConfig) : defaultRipConfig;
  const outcome = generateRipSimulationSteps(config);
  const preset = TOPOLOGY_PRESETS[config.topologyPreset] || TOPOLOGY_PRESETS.linear_4_router;
  const validationIssues = validateRipTopologyAndConfig(config, preset.nodes, preset.links);

  const events: SimulationEvent[] = outcome.steps.map((step, idx) => ({
    id: `rip-evt-${idx}`,
    timestamp: idx * 1000,
    sequenceNumber: idx + 1,
    type: step.phase === "init" ? "configuration-changed" : "packet-sent",
    sourceNodeId: step.senderId || step.activeNodeId || "r1",
    destinationNodeId: step.receiverIds?.[0] || "r2",
    protocol: "rip",
    title: step.title,
    description: step.description,
    status: "completed",
    severity: step.phase === "loop_count" ? "error" : step.phase === "poison_reverse" ? "warning" : "info",
    metadata: {
      phase: step.phase,
      cliOutputs: step.cliOutputs,
      eventExplanation: step.eventExplanation,
    },
  }));

  const packets: Packet[] = outcome.steps
    .filter((step) => step.activePacket)
    .map((step, idx) => ({
      id: `rip-pkt-${idx}`,
      protocol: "rip",
      label: `RIPv${step.activePacket!.version} Response (${step.activePacket!.entries.length} RTEs)`,
      source: step.activePacket!.sourceIp,
      destination: step.activePacket!.destIp,
      headers: {
        ethernet: { srcMac: "00:1A:2B:3C:4D:5E", dstMac: "01:00:5E:00:00:09", type: "0x0800" },
        ipv4: { srcIp: step.activePacket!.sourceIp, dstIp: step.activePacket!.destIp, protocol: 17, ttl: 2 },
        udp: { srcPort: 520, dstPort: 520, length: step.activePacket!.packetLength + 8 },
        application: {
          command: step.activePacket!.command === 2 ? "Response (2)" : "Request (1)",
          version: `RIPv${step.activePacket!.version}`,
          rteCount: step.activePacket!.entries.length,
        },
      },
      payload: JSON.stringify(step.activePacket!.entries),
      size: step.activePacket!.packetLength + 28,
      status: "delivered",
      colorKey: step.phase === "poison_reverse" ? "purple" : "blue",
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

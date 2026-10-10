import type {
  SimulationResult,
  TopologyDefinition,
  SimulationEvent,
  Packet,
} from "@/features/simulation/simulation-types";
import type { TlsConfig, TlsSimulationOutcome } from "./tls.types";
import { defaultTlsConfig, DEFAULT_TLS_CHAIN } from "./tls.defaults";
import { generateTlsSimulation as generateTlsSteps } from "./tls.events";
import { tlsConfigSchema } from "./tls.schema";
import { validateTlsConfig } from "./tls.validators";

export function simulateTlsTransaction(
  rawConfig: Record<string, unknown> = {}
): TlsSimulationOutcome {
  const parsed = tlsConfigSchema.safeParse({
    ...defaultTlsConfig,
    ...rawConfig,
  });
  const config: TlsConfig = parsed.success ? (parsed.data as TlsConfig) : defaultTlsConfig;
  return generateTlsSteps(config);
}

export function generateTlsSimulationBridge(
  _topology: TopologyDefinition,
  rawConfig: Record<string, unknown>
): SimulationResult {
  const parsed = tlsConfigSchema.safeParse({
    ...defaultTlsConfig,
    ...rawConfig,
  });
  const config: TlsConfig = parsed.success ? (parsed.data as TlsConfig) : defaultTlsConfig;
  const outcome = generateTlsSteps(config);
  const validationIssues = validateTlsConfig(config, DEFAULT_TLS_CHAIN);

  const events: SimulationEvent[] = outcome.steps.map((step, idx) => ({
    id: `tls-evt-${idx}`,
    timestamp: idx * 1000,
    sequenceNumber: idx + 1,
    type: step.activeRecord?.contentTypeName === "Alert" ? "state-change" : "packet-sent",
    sourceNodeId: step.from.toLowerCase(),
    destinationNodeId: step.to.toLowerCase(),
    protocol: "tls",
    title: step.title,
    description: step.description,
    status: "completed",
    severity:
      step.activeRecord?.contentTypeName === "Alert"
        ? "error"
        : step.phase === "application_traffic"
        ? "success"
        : "info",
    metadata: {
      flight: step.flight,
      rttLabel: step.rttLabel,
      phase: step.phase,
      cliOutputs: step.cliOutputs,
      eventExplanation: step.eventExplanation,
    },
  }));

  const packets: Packet[] = outcome.steps
    .filter((s) => s.activeRecord)
    .map((step, idx) => ({
      id: `tls-pkt-${idx}`,
      timestamp: idx * 1000,
      protocol: "tls",
      label: step.title,
      source: step.from.toLowerCase(),
      destination: step.to.toLowerCase(),
      sourceNodeId: step.from.toLowerCase(),
      destinationNodeId: step.to.toLowerCase(),
      size: step.activeRecord!.length + 5,
      status: "delivered",
      colorKey:
        step.phase === "application_traffic"
          ? "emerald"
          : step.phase === "handshake_traffic"
          ? "purple"
          : "blue",
      createdAt: idx * 1000,
      headers: {
        ethernet: {
          dstMac: "00:1A:2B:3C:4D:5E",
          srcMac: "00:11:22:33:44:55",
        },
        ip: {
          version: 4,
          srcIp: step.from === "Client" ? "192.168.1.100" : "104.18.25.10",
          dstIp: step.from === "Client" ? "104.18.25.10" : "192.168.1.100",
          protocol: "TCP",
          ttl: 64,
        },
        tcp: {
          srcPort: step.from === "Client" ? 54320 : 443,
          dstPort: step.from === "Client" ? 443 : 54320,
          seqNumber: 1000 + idx * 500,
          ackNumber: 2000 + idx * 500,
          flags: "ACK, PSH",
        },
        application: {
          protocol: "TLS",
          version: config.version,
          contentType: step.activeRecord!.contentTypeName,
          length: step.activeRecord!.length,
          encrypted: step.activeRecord!.isEncrypted ? "true" : "false",
        },
      },
      payload: step.activeRecord!.applicationPayload || JSON.stringify(step.activeRecord!.handshakeMessage || {}),
    }));

  return {
    events,
    packets,
    initialState: {
      steps: outcome.steps,
      config,
      validationIssues,
      keySchedule: outcome.finalKeySchedule,
      certChain: outcome.finalCertChain,
      totalRtt: outcome.totalRtt,
      isSuccess: outcome.isHandshakeSuccess,
    },
  };
}

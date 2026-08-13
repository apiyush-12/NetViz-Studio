import type {
  SimulationResult,
  TopologyDefinition,
} from "@/features/simulation/simulation-types";
import type { DnsConfig, DnsNode, DnsLink, DnsCacheEntry } from "./dns.types";
import { defaultDnsConfig, getDnsPresetData } from "./dns.defaults";
import { dnsConfigSchema } from "./dns.schema";
import { performDnsResolution } from "./dns.resolver";
import { createDefaultDnsCache } from "./dns.cache";
import { buildDnsSimulationSequence } from "./dns.events";
import { validateDnsConfiguration } from "./dns.validators";

export function generateDnsSimulation(
  _topology: TopologyDefinition,
  rawConfig: Record<string, unknown>
): SimulationResult {
  const config: DnsConfig = dnsConfigSchema.parse({
    ...defaultDnsConfig,
    ...rawConfig,
  }) as DnsConfig;

  // Load preset data
  const presetData = getDnsPresetData(config.topologyPreset ?? "iterative-hierarchy");
  const nodes: DnsNode[] = presetData.nodes;
  const links: DnsLink[] = presetData.links;

  const queryHostname = config.queryHostname ?? "www.example.com";
  const queryType = config.queryType ?? "A";
  const cacheEntries: DnsCacheEntry[] = createDefaultDnsCache();

  // Check if cache hit scenario
  let isCached = false;
  let cachedRecord = undefined;

  if (config.failureScenario === "cache_hit") {
    isCached = true;
    cachedRecord = {
      id: "rec-cache-hit",
      name: queryHostname,
      type: queryType,
      value: "93.184.216.34 (Cached)",
      ttl: 300,
      section: "answer" as const,
    };
  }

  // Run resolution algorithm
  const outcome = performDnsResolution(
    queryHostname,
    queryType,
    nodes,
    isCached,
    cachedRecord,
    config.failureScenario
  );

  // Validate configuration
  const validationErrors = validateDnsConfiguration(nodes, queryHostname, outcome.resolvedRecords);

  // Generate Simulation events & packets
  const { events, packets } = buildDnsSimulationSequence(
    nodes,
    outcome,
    queryHostname,
    queryType,
    config.labelMode === "technical"
  );

  return {
    events,
    packets,
    initialState: {
      nodes,
      links,
      queryHostname,
      queryType,
      outcome,
      cacheEntries,
      resolvedRecords: outcome.resolvedRecords,
      validationErrors,
      selectedNodeId: "client-1",
      topologyPreset: config.topologyPreset ?? "iterative-hierarchy",
      failureScenario: config.failureScenario,
    },
  };
}

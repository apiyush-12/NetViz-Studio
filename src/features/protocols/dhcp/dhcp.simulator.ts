import type {
  SimulationResult,
  TopologyDefinition,
} from "@/features/simulation/simulation-types";
import type { DhcpConfig, DhcpNode, DhcpLink, DhcpPool, DhcpLease } from "./dhcp.types";
import { defaultDhcpConfig, getDhcpPresetData } from "./dhcp.defaults";
import { dhcpConfigSchema } from "./dhcp.schema";
import { allocateLeaseFromPool } from "./dhcp.fsm";
import { buildDhcpSimulationSequence } from "./dhcp.events";
import { validateDhcpConfiguration } from "./dhcp.validators";

export function generateDhcpSimulation(
  _topology: TopologyDefinition,
  rawConfig: Record<string, unknown>
): SimulationResult {
  const config: DhcpConfig = dhcpConfigSchema.parse({
    ...defaultDhcpConfig,
    ...rawConfig,
  }) as DhcpConfig;

  // Load selected preset data
  const presetData = getDhcpPresetData(config.topologyPreset ?? "simple-lan");
  const nodes: DhcpNode[] = presetData.nodes;
  const links: DhcpLink[] = presetData.links;
  const pool: DhcpPool = presetData.pool;

  // Apply user pool customizations
  if (config.poolStart) pool.startAddress = config.poolStart;
  if (config.poolEnd) pool.endAddress = config.poolEnd;
  if (config.leaseDurationSeconds) {
    pool.leaseDurationSeconds = config.leaseDurationSeconds;
    pool.t1Seconds = Math.round(config.leaseDurationSeconds * 0.5);
    pool.t2Seconds = Math.round(config.leaseDurationSeconds * 0.875);
  }

  // Update client node MAC if provided
  const clientNode = nodes.find((n) => n.type === "client");
  if (clientNode && config.clientMac) {
    clientNode.macAddress = config.clientMac;
  }
  if (clientNode && config.clientHostname) {
    clientNode.name = config.clientHostname;
  }

  // Handle failure scenarios
  let isPoolExhausted = false;
  if (config.failureScenario === "pool_exhausted") {
    isPoolExhausted = true;
  }

  const existingLeases: DhcpLease[] = [
    {
      ipAddress: "192.168.1.50",
      macAddress: "00:11:22:33:44:55",
      hostname: "printer-office",
      leaseStarts: Date.now() - 3600000,
      leaseExpires: Date.now() + 82800000,
      serverId: "server-1",
      serverIp: "192.168.1.2",
      state: "active",
    },
  ];

  const primaryServer = nodes.find((n) => n.role === "primary-server") ?? nodes[2];
  const { lease: activeLease } = allocateLeaseFromPool(
    pool,
    existingLeases,
    clientNode?.macAddress ?? "00:1A:2B:3C:4D:5E",
    clientNode?.name ?? "workstation-01",
    primaryServer?.id ?? "server-1",
    primaryServer?.ipAddress ?? "192.168.1.2",
    isPoolExhausted
  );

  const leases = activeLease ? [...existingLeases, activeLease] : existingLeases;

  // Run validation
  const validationErrors = validateDhcpConfiguration(nodes, pool, leases);

  // Generate Simulation events & packets
  const { events, packets, fsmSteps } = buildDhcpSimulationSequence(
    nodes,
    links,
    pool,
    activeLease,
    config.failureScenario,
    config.labelMode === "technical"
  );

  return {
    events,
    packets,
    initialState: {
      nodes,
      links,
      pool,
      leases,
      activeLease,
      fsmSteps,
      validationErrors,
      selectedNodeId: clientNode?.id ?? "client-1",
      topologyPreset: config.topologyPreset ?? "simple-lan",
      failureScenario: config.failureScenario,
    },
  };
}

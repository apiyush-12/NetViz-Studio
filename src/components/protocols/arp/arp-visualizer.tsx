"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  GitBranch,
  Radio,
} from "lucide-react";
import { Badge, Tabs } from "@/components/ui";
import { SimulationControls } from "@/components/simulation/simulation-controls";
import { EventTimeline } from "@/components/simulation/event-timeline";
import { useSimulationStore } from "@/features/simulation/simulation-store";
import { ArpTopology } from "./arp-topology";
import { ArpNodeSummary } from "./arp-node-summary";
import { ArpCacheTable } from "./arp-cache-table";
import { ArpPacketInspector } from "./arp-packet-inspector";
import { ArpConfigPanel } from "./arp-config-panel";
import { ArpEventDetails } from "./arp-event-details";
import { ArpNdpComparisonModal } from "@/components/protocols/comparison/arp-ndp-comparison-modal";
import type {
  ArpConfig,
  ArpNode,
  ArpLink,
  ArpScenarioId,
  ArpSimulationStepState,
  ArpPacketData,
} from "@/features/protocols/arp/arp.types";
import {
  defaultArpConfig,
  STANDARD_LAN_NODES,
  STANDARD_LAN_LINKS,
  ARP_SCENARIOS,
} from "@/features/protocols/arp/arp.defaults";
import { simulateArpTransaction } from "@/features/protocols/arp/arp.simulator";

export function ArpVisualizer() {
  const [config, setConfig] = useState<ArpConfig>(defaultArpConfig);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("host-a");
  const [simulationMode, setSimulationMode] = useState<"realtime" | "simulation">("simulation");
  const [activeTab, setActiveTab] = useState<string>("cache");

  const loadProtocol = useSimulationStore((s) => s.loadProtocol);
  const storeStep = useSimulationStore((s) => s.currentStep);
  const scrubTo = useSimulationStore((s) => s.scrubTo);

  // Load ARP protocol into simulation store whenever config changes
  useEffect(() => {
    loadProtocol("arp", config as unknown as Record<string, unknown>);
  }, [loadProtocol, config]);

  // Compute simulation outcome
  const outcome = useMemo(() => {
    return simulateArpTransaction(config as unknown as Record<string, unknown>);
  }, [config]);

  const activeStepIndex =
    storeStep >= 0 && storeStep < outcome.steps.length ? storeStep : 0;
  const currentStepState: ArpSimulationStepState =
    outcome.steps[activeStepIndex] || outcome.steps[0];

  const currentNodes: ArpNode[] =
    currentStepState?.nodes || outcome.finalNodes || STANDARD_LAN_NODES;
  const currentLinks: ArpLink[] =
    currentStepState?.links || outcome.finalLinks || STANDARD_LAN_LINKS;

  const selectedNode: ArpNode =
    currentNodes.find((n) => n.id === selectedNodeId) ||
    currentNodes[0] ||
    STANDARD_LAN_NODES[0];

  const activePacket: ArpPacketData | undefined = currentStepState?.activePacket;

  const handleUpdateConfig = (updates: Partial<ArpConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    scrubTo(0);
  };

  const handleResetDefaults = () => {
    setConfig(defaultArpConfig);
    setSelectedNodeId("host-a");
    scrubTo(0);
  };

  const handleSelectScenario = (scenarioId: ArpScenarioId) => {
    let topologyPreset = config.topologyPreset;
    let targetIp = config.targetIp;
    let attackerEnabled = config.attackerEnabled;
    let proxyArpEnabled = config.proxyArpEnabled;

    if (scenarioId === "gateway_cross_subnet") {
      topologyPreset = "cross_subnet_router";
      targetIp = "192.168.2.10";
    } else if (scenarioId === "gratuitous_arp_conflict") {
      topologyPreset = "vrrp_failover";
      targetIp = "192.168.1.100";
    } else if (scenarioId === "proxy_arp_wan") {
      topologyPreset = "cross_subnet_router";
      proxyArpEnabled = true;
      targetIp = "172.16.0.50";
    } else if (scenarioId === "arp_spoofing_dai") {
      topologyPreset = "security_dai_lan";
      attackerEnabled = true;
      targetIp = "192.168.1.1";
    } else {
      topologyPreset = "standard_lan";
      targetIp = "192.168.1.20";
    }

    setConfig((prev) => ({
      ...prev,
      scenarioId,
      topologyPreset,
      targetIp,
      attackerEnabled,
      proxyArpEnabled,
    }));
    scrubTo(0);
  };

  return (
    <div className="flex flex-col gap-3 p-3 max-w-[1700px] mx-auto w-full min-h-0">
      {/* Top Header Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                Address Resolution Protocol (ARP) Studio
              </h2>
              <Badge
                variant="default"
                className="text-[10px] font-mono bg-emerald-500 text-slate-950 font-bold"
              >
                RFC 826 / RFC 5227
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Layer 2 Resolution · 28-Byte Frame Inspector · Broadcast Flooding · Gratuitous ARP · Proxy ARP · Dynamic ARP Inspection (DAI)
            </p>
          </div>
        </div>

        {/* Quick Actions: Comparison Modal & Mode Toggle */}
        <div className="flex items-center gap-2">
          <ArpNdpComparisonModal />

          {/* Mode Switcher */}
          <div className="flex items-center rounded-lg border border-border bg-secondary/30 p-0.5 text-xs">
            <button
              onClick={() => setSimulationMode("realtime")}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                simulationMode === "realtime"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Real Time
            </button>
            <button
              onClick={() => setSimulationMode("simulation")}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                simulationMode === "simulation"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Step Simulation
            </button>
          </div>
        </div>
      </div>

      {/* Scenario Quick Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase shrink-0 flex items-center gap-1">
          <GitBranch className="h-3 w-3" /> Scenarios:
        </span>
        {ARP_SCENARIOS.map((sc) => {
          const isSelected = config.scenarioId === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => handleSelectScenario(sc.id)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                  : "bg-card/70 border-border text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              {sc.name}
            </button>
          );
        })}
      </div>

      {/* Main Workspace Layout (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        {/* Left Column: Topology Canvas & Timeline (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3 min-h-0">
          {/* Interactive Topology SVG */}
          <ArpTopology
            nodes={currentNodes}
            links={currentLinks}
            selectedNodeId={selectedNodeId}
            onSelectNode={(id) => setSelectedNodeId(id)}
            activePacket={activePacket}
            activeLinkIds={currentStepState?.activeLinkIds || []}
            broadcastLinkIds={currentStepState?.broadcastLinkIds || []}
            poisonedNodeIds={currentStepState?.poisonedNodeIds || []}
          />

          {/* Playback Controls & Event Timeline */}
          <div className="flex flex-col gap-3">
            <SimulationControls />
            <EventTimeline />
          </div>

          {/* Step-by-Step Pedagogical Explanation Card */}
          <ArpEventDetails
            stepState={currentStepState}
            currentStepIndex={activeStepIndex}
            totalSteps={outcome.steps.length}
          />
        </div>

        {/* Right Column: Node Summary, ARP Cache Table & Packet Inspector (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3 min-h-0">
          {/* Selected Node Identity Banner */}
          <ArpNodeSummary selectedNode={selectedNode} />

          {/* Right Inspector Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            tabs={[
              { id: "cache", label: "ARP Cache / CAM" },
              { id: "packet", label: "RFC 826 Inspector" },
              { id: "config", label: "Config & Presets" },
            ]}
          />

          <div className="min-h-0">
            {activeTab === "cache" && (
              <ArpCacheTable selectedNode={selectedNode} />
            )}

            {activeTab === "packet" && (
              <ArpPacketInspector packet={activePacket} />
            )}

            {activeTab === "config" && (
              <ArpConfigPanel
                config={config}
                nodes={currentNodes}
                onUpdateConfig={handleUpdateConfig}
                onResetDefaults={handleResetDefaults}
                onSelectScenario={handleSelectScenario}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

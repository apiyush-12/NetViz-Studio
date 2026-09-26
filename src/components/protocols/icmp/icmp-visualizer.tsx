"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Activity,
} from "lucide-react";
import { Badge, Tabs } from "@/components/ui";
import { SimulationControls } from "@/components/simulation/simulation-controls";
import { EventTimeline } from "@/components/simulation/event-timeline";
import { useSimulationStore } from "@/features/simulation/simulation-store";
import { IcmpTopology } from "./icmp-topology";
import { IcmpNodeSummary } from "./icmp-node-summary";
import { IcmpPacketInspector } from "./icmp-packet-inspector";
import { IcmpCliTerminal } from "./icmp-cli-terminal";
import { IcmpConfigPanel } from "./icmp-config-panel";
import { IcmpEventDetails } from "./icmp-event-details";
import { IcmpV4V6ComparisonModal } from "@/components/protocols/comparison/icmp-v4-v6-comparison-modal";
import type {
  IcmpConfig,
  IcmpNode,
  IcmpLink,
  IcmpScenarioId,
  IcmpSimulationStepState,
  IcmpPacketData,
} from "@/features/protocols/icmp/icmp.types";
import {
  defaultIcmpConfig,
  STANDARD_INTERNET_NODES,
  STANDARD_INTERNET_LINKS,
  ICMP_SCENARIOS,
} from "@/features/protocols/icmp/icmp.defaults";
import { simulateIcmpTransaction } from "@/features/protocols/icmp/icmp.simulator";

export function IcmpVisualizer() {
  const [config, setConfig] = useState<IcmpConfig>(defaultIcmpConfig);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("host-a");
  const [activeTab, setActiveTab] = useState<string>("inspector");

  const loadProtocol = useSimulationStore((s) => s.loadProtocol);
  const storeStep = useSimulationStore((s) => s.currentStep);
  const scrubTo = useSimulationStore((s) => s.scrubTo);

  // Load ICMP protocol into simulation store whenever config changes
  useEffect(() => {
    loadProtocol("icmp", config as unknown as Record<string, unknown>);
  }, [loadProtocol, config]);

  // Compute simulation outcome
  const outcome = useMemo(() => {
    return simulateIcmpTransaction(config as unknown as Record<string, unknown>);
  }, [config]);

  const activeStepIndex =
    storeStep >= 0 && storeStep < outcome.steps.length ? storeStep : 0;
  const currentStepState: IcmpSimulationStepState =
    outcome.steps[activeStepIndex] || outcome.steps[0];

  const currentNodes: IcmpNode[] =
    currentStepState?.nodes || outcome.finalNodes || STANDARD_INTERNET_NODES;
  const currentLinks: IcmpLink[] =
    currentStepState?.links || outcome.finalLinks || STANDARD_INTERNET_LINKS;

  const selectedNode: IcmpNode =
    currentNodes.find((n) => n.id === selectedNodeId) ||
    currentNodes[0] ||
    STANDARD_INTERNET_NODES[0];

  const activePacket: IcmpPacketData | undefined = currentStepState?.activePacket;

  const handleUpdateConfig = (updates: Partial<IcmpConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    scrubTo(0);
  };

  const handleResetDefaults = () => {
    setConfig(defaultIcmpConfig);
    setSelectedNodeId("host-a");
    scrubTo(0);
  };

  const handleSelectScenario = (scenarioId: IcmpScenarioId) => {
    const scn = ICMP_SCENARIOS[scenarioId];
    if (!scn) return;

    const topologyPreset = scn.presetId;
    let packetSizeBytes = config.packetSizeBytes;
    let dontFragmentFlag = config.dontFragmentFlag;
    let startingTtl = config.startingTtl;

    if (scenarioId === "pmtud_df_fragmentation_needed") {
      packetSizeBytes = 1500;
      dontFragmentFlag = true;
    } else if (scenarioId === "traceroute_ttl_exceeded") {
      startingTtl = 1;
      packetSizeBytes = 60;
    } else if (scenarioId === "echo_ping_roundtrip") {
      packetSizeBytes = 64;
      startingTtl = 64;
    }

    setConfig((prev) => ({
      ...prev,
      scenarioId,
      topologyPreset,
      packetSizeBytes,
      dontFragmentFlag,
      startingTtl,
    }));
    scrubTo(0);
  };

  return (
    <div className="flex flex-col gap-3 p-3 max-w-[1600px] mx-auto w-full">
      {/* Top Banner Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-foreground">
                ICMP Protocol Studio
              </h1>
              <Badge variant="default" className="text-[10px] bg-blue-500/20 text-blue-400 border-blue-500/30 font-mono">
                RFC 792 / RFC 1191
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                Network Layer Diagnostics & Control
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ping (Echo Request/Reply), Traceroute (TTL Exceeded), Path MTU Discovery (PMTUD), Destination Unreachable, & Router Redirects
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <IcmpV4V6ComparisonModal />
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left / Center 8 Cols: Topology Canvas, Controls, Timeline, & CLI Terminal */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Animated SVG Topology Canvas */}
          <IcmpTopology
            nodes={currentNodes}
            links={currentLinks}
            stepState={currentStepState}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />

          {/* Timeline & Simulation Playback Controls */}
          <SimulationControls />
          <EventTimeline />

          {/* Live Simulated CLI Terminal */}
          <IcmpCliTerminal
            lines={currentStepState?.cliOutputs || []}
            activeScenarioTitle={ICMP_SCENARIOS[config.scenarioId]?.title}
          />
        </div>

        {/* Right 4 Cols: Step Details & Tabbed Inspection Panels */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Dual-Track Step Details Card */}
          <IcmpEventDetails stepState={currentStepState} />

          {/* Tab Navigation */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            tabs={[
              { id: "inspector", label: "ICMP Header" },
              { id: "node", label: "Node State" },
              { id: "config", label: "Labs & Scenarios" },
            ]}
          />

          {/* Tab Content Panels */}
          {activeTab === "inspector" && (
            <IcmpPacketInspector packet={activePacket} />
          )}

          {activeTab === "node" && (
            <IcmpNodeSummary node={selectedNode} />
          )}

          {activeTab === "config" && (
            <IcmpConfigPanel
              config={config}
              onUpdateConfig={handleUpdateConfig}
              onResetDefaults={handleResetDefaults}
              onSelectScenario={handleSelectScenario}
            />
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  GitBranch,
  Layers,
} from "lucide-react";
import { Badge, Tabs } from "@/components/ui";
import { SimulationControls } from "@/components/simulation/simulation-controls";
import { EventTimeline } from "@/components/simulation/event-timeline";
import { useSimulationStore } from "@/features/simulation/simulation-store";
import { VlanTopology } from "./vlan-topology";
import { VlanNodeSummary } from "./vlan-node-summary";
import { VlanTable } from "./vlan-table";
import { VlanFrameInspector } from "./vlan-frame-inspector";
import { VlanConfigPanel } from "./vlan-config-panel";
import { VlanEventDetails } from "./vlan-event-details";
import { VlanVxlanComparisonModal } from "@/components/protocols/comparison/vlan-vxlan-comparison-modal";
import type {
  VlanConfig,
  VlanNode,
  VlanLink,
  VlanScenarioId,
  VlanSimulationStepState,
  VlanFrameData,
} from "@/features/protocols/vlan/vlan.types";
import {
  defaultVlanConfig,
  ACCESS_SWITCH_NODES,
  ACCESS_SWITCH_LINKS,
  VLAN_SCENARIOS,
} from "@/features/protocols/vlan/vlan.defaults";
import { simulateVlanTransaction } from "@/features/protocols/vlan/vlan.simulator";

export function VlanVisualizer() {
  const [config, setConfig] = useState<VlanConfig>(defaultVlanConfig);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("sw-1");
  const [simulationMode, setSimulationMode] = useState<"realtime" | "simulation">("simulation");
  const [activeTab, setActiveTab] = useState<string>("vlan");

  const loadProtocol = useSimulationStore((s) => s.loadProtocol);
  const storeStep = useSimulationStore((s) => s.currentStep);
  const scrubTo = useSimulationStore((s) => s.scrubTo);

  // Load VLAN protocol into simulation store whenever config changes
  useEffect(() => {
    loadProtocol("vlan", config as unknown as Record<string, unknown>);
  }, [loadProtocol, config]);

  // Compute simulation outcome
  const outcome = useMemo(() => {
    return simulateVlanTransaction(config as unknown as Record<string, unknown>);
  }, [config]);

  const activeStepIndex =
    storeStep >= 0 && storeStep < outcome.steps.length ? storeStep : 0;
  const currentStepState: VlanSimulationStepState =
    outcome.steps[activeStepIndex] || outcome.steps[0];

  const currentNodes: VlanNode[] =
    currentStepState?.nodes || outcome.finalNodes || ACCESS_SWITCH_NODES;
  const currentLinks: VlanLink[] =
    currentStepState?.links || outcome.finalLinks || ACCESS_SWITCH_LINKS;

  const selectedNode: VlanNode =
    currentNodes.find((n) => n.id === selectedNodeId) ||
    currentNodes[0] ||
    ACCESS_SWITCH_NODES[0];

  const activeFrame: VlanFrameData | undefined = currentStepState?.activeFrame;

  const handleUpdateConfig = (updates: Partial<VlanConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    scrubTo(0);
  };

  const handleResetDefaults = () => {
    setConfig(defaultVlanConfig);
    setSelectedNodeId("sw-1");
    scrubTo(0);
  };

  const handleSelectScenario = (scenarioId: VlanScenarioId) => {
    let topologyPreset = config.topologyPreset;
    let sourceNodeId = config.sourceNodeId;
    let targetNodeId = config.targetNodeId;
    let routingMode = config.routingMode;

    if (scenarioId === "intra_vlan_broadcast_isolation") {
      topologyPreset = "multi_vlan_access_switch";
      sourceNodeId = "pc-1";
      targetNodeId = "pc-2";
      routingMode = "none";
    } else if (scenarioId === "trunk_8021q_tagging") {
      topologyPreset = "two_switch_trunking";
      sourceNodeId = "pc-1";
      targetNodeId = "pc-3";
      routingMode = "none";
    } else if (scenarioId === "inter_vlan_router_on_a_stick") {
      topologyPreset = "router_on_a_stick";
      sourceNodeId = "pc-1";
      targetNodeId = "pc-2";
      routingMode = "roas";
    } else if (scenarioId === "inter_vlan_l3_svi") {
      topologyPreset = "layer3_switch_svi";
      sourceNodeId = "pc-1";
      targetNodeId = "pc-2";
      routingMode = "svi";
    } else if (scenarioId === "native_vlan_untagged") {
      topologyPreset = "two_switch_trunking";
      sourceNodeId = "sw-1";
      targetNodeId = "sw-2";
      routingMode = "none";
    } else if (scenarioId === "vlan_hopping_attack") {
      topologyPreset = "vlan_hopping_security";
      sourceNodeId = "attacker-1";
      targetNodeId = "victim-1";
      routingMode = "none";
    }

    setConfig((prev) => ({
      ...prev,
      scenarioId,
      topologyPreset,
      sourceNodeId,
      targetNodeId,
      routingMode,
    }));
    scrubTo(0);
  };

  return (
    <div className="flex flex-col gap-3 p-3 max-w-[1700px] mx-auto w-full min-h-0">
      {/* Top Header Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                Virtual Local Area Network (VLAN / 802.1Q) Studio
              </h2>
              <Badge
                variant="default"
                className="text-[10px] font-mono bg-blue-500 text-slate-950 font-bold"
              >
                IEEE 802.1Q / 802.1p
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Broadcast Domain Isolation · 4-Byte 802.1Q Trunk Tagging · Access vs Trunk Ports · Router-on-a-Stick (ROAS) · Layer 3 Switch SVIs · VLAN Hopping Defense
            </p>
          </div>
        </div>

        {/* Quick Actions: Comparison Modal & Mode Toggle */}
        <div className="flex items-center gap-2">
          <VlanVxlanComparisonModal />

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
        {VLAN_SCENARIOS.map((sc) => {
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
          <VlanTopology
            nodes={currentNodes}
            links={currentLinks}
            selectedNodeId={selectedNodeId}
            onSelectNode={(id) => setSelectedNodeId(id)}
            activeFrame={activeFrame}
            activeLinkIds={currentStepState?.activeLinkIds || []}
            broadcastLinkIds={currentStepState?.broadcastLinkIds || []}
            isolatedNodeIds={currentStepState?.isolatedNodeIds || []}
          />

          {/* Playback Controls & Event Timeline */}
          <div className="flex flex-col gap-3">
            <SimulationControls />
            <EventTimeline />
          </div>

          {/* Step-by-Step Pedagogical Explanation Card */}
          <VlanEventDetails
            stepState={currentStepState}
            currentStepIndex={activeStepIndex}
            totalSteps={outcome.steps.length}
          />
        </div>

        {/* Right Column: Node Summary, VLAN Table & Frame Inspector (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3 min-h-0">
          {/* Selected Node Identity Banner */}
          <VlanNodeSummary selectedNode={selectedNode} />

          {/* Right Inspector Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            tabs={[
              { id: "vlan", label: "VLAN & Trunk Table" },
              { id: "frame", label: "802.1Q Frame Decoder" },
              { id: "config", label: "Config & Presets" },
            ]}
          />

          <div className="min-h-0">
            {activeTab === "vlan" && (
              <VlanTable selectedNode={selectedNode} />
            )}

            {activeTab === "frame" && (
              <VlanFrameInspector frame={activeFrame} />
            )}

            {activeTab === "config" && (
              <VlanConfigPanel
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

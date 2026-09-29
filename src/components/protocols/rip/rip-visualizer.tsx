"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Activity,
} from "lucide-react";
import { Badge, Tabs } from "@/components/ui";
import { SimulationControls } from "@/components/simulation/simulation-controls";
import { EventTimeline } from "@/components/simulation/event-timeline";
import { useSimulationStore } from "@/features/simulation/simulation-store";
import { RipTopology } from "./rip-topology";
import { RipNodeSummary } from "./rip-node-summary";
import { RipPacketInspector } from "./rip-packet-inspector";
import { RipRoutingTable } from "./rip-routing-table";
import { RipConfigPanel } from "./rip-config-panel";
import { RipEventDetails } from "./rip-event-details";
import { RipOspfComparisonModal } from "@/components/protocols/comparison/rip-ospf-comparison-modal";
import type {
  RipConfig,
  RipNode,
  RipLink,
  RipScenarioId,
  RipSimulationStepState,
  RipPacketData,
} from "@/features/protocols/rip/rip.types";
import {
  defaultRipConfig,
  LINEAR_4_ROUTER_NODES,
  LINEAR_4_ROUTER_LINKS,
  RIP_SCENARIOS,
} from "@/features/protocols/rip/rip.defaults";
import { simulateRipTransaction } from "@/features/protocols/rip/rip.simulator";

export function RipVisualizer() {
  const [config, setConfig] = useState<RipConfig>(defaultRipConfig);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("r1");
  const [activeTab, setActiveTab] = useState<string>("inspector");

  const loadProtocol = useSimulationStore((s) => s.loadProtocol);
  const storeStep = useSimulationStore((s) => s.currentStep);
  const scrubTo = useSimulationStore((s) => s.scrubTo);

  // Load RIP protocol into simulation store whenever config changes
  useEffect(() => {
    loadProtocol("rip", config as unknown as Record<string, unknown>);
  }, [loadProtocol, config]);

  // Compute simulation outcome
  const outcome = useMemo(() => {
    return simulateRipTransaction(config as unknown as Record<string, unknown>);
  }, [config]);

  const activeStepIndex =
    storeStep >= 0 && storeStep < outcome.steps.length ? storeStep : 0;
  const currentStepState: RipSimulationStepState =
    outcome.steps[activeStepIndex] || outcome.steps[0];

  const currentNodes: RipNode[] =
    currentStepState?.nodes || outcome.finalNodes || LINEAR_4_ROUTER_NODES;
  const currentLinks: RipLink[] =
    currentStepState?.links || outcome.finalLinks || LINEAR_4_ROUTER_LINKS;

  const selectedNode: RipNode =
    currentNodes.find((n) => n.id === selectedNodeId) ||
    currentNodes[0] ||
    LINEAR_4_ROUTER_NODES[0];

  const activePacket: RipPacketData | undefined = currentStepState?.activePacket;

  const handleUpdateConfig = (updates: Partial<RipConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    scrubTo(0);
  };

  const handleResetDefaults = () => {
    setConfig(defaultRipConfig);
    setSelectedNodeId("r1");
    scrubTo(0);
  };

  const handleSelectScenario = (scenarioId: RipScenarioId) => {
    const scn = RIP_SCENARIOS[scenarioId];
    if (!scn) return;

    let splitHorizon = config.splitHorizon;
    let poisonReverse = config.poisonReverse;
    let version = config.version;

    if (scenarioId === "count_to_infinity_loop") {
      splitHorizon = false;
      poisonReverse = false;
    } else if (scenarioId === "link_failure_split_horizon") {
      splitHorizon = true;
      poisonReverse = true;
    } else if (scenarioId === "ripv2_vlsm_cidr_tagging") {
      version = "ripv2";
    }

    setConfig((prev) => ({
      ...prev,
      scenarioId,
      topologyPreset: scn.presetId,
      splitHorizon,
      poisonReverse,
      version,
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
                RIP Protocol Studio
              </h1>
              <Badge variant="default" className="text-[10px] bg-blue-500/20 text-blue-400 border-blue-500/30 font-mono">
                RFC 1058 / RFC 2453
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                Distance-Vector Routing (UDP 520)
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Bellman-Ford Algorithm, Split Horizon & Poison Reverse, Count-to-Infinity Loop Simulation, VLSM Subnets & Route Timers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <RipOspfComparisonModal />
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left / Center 8 Cols: Topology Canvas, Controls, Timeline, & Cisco Routing Table */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Animated SVG Topology Canvas */}
          <RipTopology
            nodes={currentNodes}
            links={currentLinks}
            stepState={currentStepState}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />

          {/* Timeline & Simulation Playback Controls */}
          <SimulationControls />
          <EventTimeline />

          {/* Interactive Cisco / Juniper Routing Table (RIB) */}
          <RipRoutingTable
            nodes={currentNodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />
        </div>

        {/* Right 4 Cols: Step Details & Tabbed Inspection Panels */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Dual-Track Step Details Card */}
          <RipEventDetails stepState={currentStepState} />

          {/* Tab Navigation */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            tabs={[
              { id: "inspector", label: "RIP Header" },
              { id: "node", label: "Router State" },
              { id: "config", label: "Labs & Scenarios" },
            ]}
          />

          {/* Tab Content Panels */}
          {activeTab === "inspector" && (
            <RipPacketInspector packet={activePacket} />
          )}

          {activeTab === "node" && (
            <RipNodeSummary node={selectedNode} />
          )}

          {activeTab === "config" && (
            <RipConfigPanel
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

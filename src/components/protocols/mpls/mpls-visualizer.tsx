"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Layers,
} from "lucide-react";
import { Badge, Tabs } from "@/components/ui";
import { SimulationControls } from "@/components/simulation/simulation-controls";
import { EventTimeline } from "@/components/simulation/event-timeline";
import { useSimulationStore } from "@/features/simulation/simulation-store";
import { MplsTopology } from "./mpls-topology";
import { MplsNodeSummary } from "./mpls-node-summary";
import { MplsLfibTable } from "./mpls-lfib-table";
import { MplsHeaderInspector } from "./mpls-header-inspector";
import { MplsConfigPanel } from "./mpls-config-panel";
import { MplsEventDetails } from "./mpls-event-details";
import { MplsTraditionalIpComparisonModal } from "@/components/protocols/comparison/mpls-traditional-ip-comparison-modal";
import type {
  MplsConfig,
  MplsNode,
  MplsLink,
  MplsScenarioId,
  MplsSimulationStepState,
  MplsPacketData,
} from "@/features/protocols/mpls/mpls.types";
import {
  defaultMplsConfig,
  STANDARD_CORE_NODES,
  STANDARD_CORE_LINKS,
  MPLS_SCENARIOS,
} from "@/features/protocols/mpls/mpls.defaults";
import { simulateMplsTransaction } from "@/features/protocols/mpls/mpls.simulator";

export function MplsVisualizer() {
  const [config, setConfig] = useState<MplsConfig>(defaultMplsConfig);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("pe-1");
  const [activeTab, setActiveTab] = useState<string>("lfib");

  const loadProtocol = useSimulationStore((s) => s.loadProtocol);
  const storeStep = useSimulationStore((s) => s.currentStep);
  const scrubTo = useSimulationStore((s) => s.scrubTo);

  // Load MPLS protocol into simulation store whenever config changes
  useEffect(() => {
    loadProtocol("mpls", config as unknown as Record<string, unknown>);
  }, [loadProtocol, config]);

  // Compute simulation outcome
  const outcome = useMemo(() => {
    return simulateMplsTransaction(config as unknown as Record<string, unknown>);
  }, [config]);

  const activeStepIndex =
    storeStep >= 0 && storeStep < outcome.steps.length ? storeStep : 0;
  const currentStepState: MplsSimulationStepState =
    outcome.steps[activeStepIndex] || outcome.steps[0];

  const currentNodes: MplsNode[] =
    currentStepState?.nodes || outcome.finalNodes || STANDARD_CORE_NODES;
  const currentLinks: MplsLink[] =
    currentStepState?.links || outcome.finalLinks || STANDARD_CORE_LINKS;

  const selectedNode: MplsNode =
    currentNodes.find((n) => n.id === selectedNodeId) ||
    currentNodes[0] ||
    STANDARD_CORE_NODES[0];

  const activePacket: MplsPacketData | undefined = currentStepState?.activePacket;

  const handleUpdateConfig = (updates: Partial<MplsConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    scrubTo(0);
  };

  const handleResetDefaults = () => {
    setConfig(defaultMplsConfig);
    setSelectedNodeId("pe-1");
    scrubTo(0);
  };

  const handleSelectScenario = (scenarioId: MplsScenarioId) => {
    const scn = MPLS_SCENARIOS[scenarioId];
    if (!scn) return;

    const topologyPreset = scn.presetId;
    let customerVrf = config.customerVrf;
    let simulateLinkFailure = false;

    if (scenarioId === "l3vpn_multi_tenant_traffic") {
      customerVrf = "VRF_RED_CUSTOMER_A";
    } else if (scenarioId === "frr_link_failure_detour") {
      simulateLinkFailure = true;
    }

    setConfig((prev) => ({
      ...prev,
      scenarioId,
      topologyPreset,
      customerVrf,
      simulateLinkFailure,
    }));
    scrubTo(0);
  };

  return (
    <div className="flex flex-col gap-3 p-3 max-w-[1600px] mx-auto w-full">
      {/* Top Banner Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-foreground">
                MPLS Protocol Studio
              </h1>
              <Badge variant="default" className="text-[10px] bg-blue-500/20 text-blue-400 border-blue-500/30 font-mono">
                RFC 3031 / RFC 3032
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                Layer 2.5 Multi-Protocol Label Switching
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Exact-Match 20-bit Label Indexing, Multi-Label Stacking, Penultimate Hop Popping (PHP), BGP/MPLS L3VPN, & 50ms Fast Reroute
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <MplsTraditionalIpComparisonModal />
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left / Center 8 Cols: Topology Canvas, Controls, & Timeline */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Animated SVG Topology Canvas */}
          <MplsTopology
            nodes={currentNodes}
            links={currentLinks}
            stepState={currentStepState}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />

          {/* Timeline & Simulation Playback Controls */}
          <SimulationControls />
          <EventTimeline />

          {/* Selected Router Node Summary Card */}
          <MplsNodeSummary
            node={selectedNode}
            activePacketLabel={activePacket?.labelStack[0]?.label}
          />
        </div>

        {/* Right 4 Cols: Step Details & Tabbed Forwarding/Inspector Cards */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Dual-Track Step Details Card */}
          <MplsEventDetails stepState={currentStepState} />

          {/* Tab Navigation */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            tabs={[
              { id: "lfib", label: "LFIB & CEF Tables" },
              { id: "inspector", label: "32-Bit Shim" },
              { id: "config", label: "Labs & Scenarios" },
            ]}
          />

          {/* Tab Content Panels */}
          {activeTab === "lfib" && (
            <MplsLfibTable
              nodes={currentNodes}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              activePacketInLabel={activePacket?.labelStack[0]?.label}
            />
          )}

          {activeTab === "inspector" && (
            <MplsHeaderInspector packet={activePacket} />
          )}

          {activeTab === "config" && (
            <MplsConfigPanel
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

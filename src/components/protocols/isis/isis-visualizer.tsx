"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Layers,
  Award,
  ShieldAlert,
  Cpu,
  Globe,
} from "lucide-react";
import { Badge, Tabs, Button } from "@/components/ui";
import { SimulationControls } from "@/components/simulation/simulation-controls";
import { EventTimeline } from "@/components/simulation/event-timeline";
import { useSimulationStore } from "@/features/simulation/simulation-store";
import { IsisTopology } from "./isis-topology";
import { IsisNodeSummary } from "./isis-node-summary";
import { IsisPduInspector } from "./isis-pdu-inspector";
import { IsisDatabaseTable } from "./isis-database-table";
import { IsisConfigPanel } from "./isis-config-panel";
import { IsisEventDetails } from "./isis-event-details";
import { IsisOspfComparisonModal } from "@/components/protocols/comparison/isis-ospf-comparison-modal";
import type {
  IsisConfig,
  IsisNode,
  IsisLink,
  IsisScenarioId,
  IsisSimulationStepState,
  IsisPduData,
} from "@/features/protocols/isis/isis.types";
import {
  defaultIsisConfig,
  MULTI_AREA_HIERARCHY_NODES,
  MULTI_AREA_HIERARCHY_LINKS,
  ISIS_SCENARIOS,
} from "@/features/protocols/isis/isis.defaults";
import { simulateIsisTransaction } from "@/features/protocols/isis/isis.simulator";

export function IsisVisualizer() {
  const [config, setConfig] = useState<IsisConfig>(defaultIsisConfig);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("r1");
  const [activeTab, setActiveTab] = useState<string>("inspector");
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);

  const loadProtocol = useSimulationStore((s) => s.loadProtocol);
  const storeStep = useSimulationStore((s) => s.currentStep);
  const scrubTo = useSimulationStore((s) => s.scrubTo);

  // Load IS-IS protocol into simulation store whenever config changes
  useEffect(() => {
    loadProtocol("isis", config as unknown as Record<string, unknown>);
  }, [loadProtocol, config]);

  // Compute simulation outcome
  const outcome = useMemo(() => {
    return simulateIsisTransaction(config as unknown as Record<string, unknown>);
  }, [config]);

  const activeStepIndex =
    storeStep >= 0 && storeStep < outcome.steps.length ? storeStep : 0;
  const currentStepState: IsisSimulationStepState =
    outcome.steps[activeStepIndex] || outcome.steps[0];

  const currentNodes: IsisNode[] =
    currentStepState?.nodes || outcome.finalNodes || MULTI_AREA_HIERARCHY_NODES;
  const currentLinks: IsisLink[] =
    currentStepState?.links || outcome.finalLinks || MULTI_AREA_HIERARCHY_LINKS;

  const selectedNode: IsisNode =
    currentNodes.find((n) => n.id === selectedNodeId) ||
    currentNodes[0] ||
    MULTI_AREA_HIERARCHY_NODES[0];

  const activePdu: IsisPduData | undefined = currentStepState?.activePdu;

  const handleUpdateConfig = (updates: Partial<IsisConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    scrubTo(0);
  };

  const handleResetDefaults = () => {
    setConfig(defaultIsisConfig);
    setSelectedNodeId("r1");
    scrubTo(0);
  };

  const handleSelectScenario = (scenarioId: IsisScenarioId) => {
    const scn = ISIS_SCENARIOS[scenarioId];
    if (!scn) return;

    const metricStyle = config.metricStyle;
    let routeLeakingEnabled = config.routeLeakingEnabled;
    let overloadBit = config.overloadBit;
    let dualStackEnabled = config.dualStackEnabled;

    if (scenarioId === "route_leaking_up_down") {
      routeLeakingEnabled = true;
    } else if (scenarioId === "overload_bit_maintenance") {
      overloadBit = true;
    } else if (scenarioId === "dual_stack_ipv4_ipv6") {
      dualStackEnabled = true;
    }

    setConfig((prev) => ({
      ...prev,
      scenarioId,
      topologyPreset: scn.presetId,
      metricStyle,
      routeLeakingEnabled,
      overloadBit,
      dualStackEnabled,
    }));
    scrubTo(0);
  };

  // Metrics summary
  const disCount = currentNodes.filter((n) => n.isDis || n.interfaces.some((i) => i.isDis)).length;
  const olCount = currentNodes.filter((n) => n.overloadBit).length;
  const attCount = currentNodes.filter((n) => n.attachedBit).length;

  return (
    <div className="flex flex-col gap-3 p-3 max-w-[1600px] mx-auto w-full">
      {/* Top Banner Toolbar & Quick Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-foreground">
                IS-IS Protocol Studio (ISO/IEC 10589 / RFC 1195)
              </h1>
              <Badge variant="default" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-mono text-[10px]">
                {config.metricStyle === "wide" ? "RFC 5305 Wide Metric" : "RFC 1195 Narrow Metric"}
              </Badge>
              {config.routeLeakingEnabled && (
                <Badge variant="default" className="bg-blue-500/20 text-blue-400 border-blue-500/30 font-mono text-[10px]">
                  RFC 2966 Route Leaking
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Layer 2 LLC / NLPID 0x83 Framing &bull; Two-Level Hierarchy &bull; DIS Election &bull; TLV Architecture &bull; Dual-Stack IPv4/IPv6
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsComparisonOpen(true)}
            className="h-8 text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 gap-1.5"
          >
            <Cpu className="h-3.5 w-3.5" />
            IS-IS vs OSPF vs BGP
          </Button>
        </div>
      </div>

      {/* Quick Metric Badges Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-2.5 rounded-lg bg-card border border-border/70 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-muted-foreground block font-sans">Active Routers</span>
            <span className="text-base font-bold font-mono text-foreground">{currentNodes.length} Nodes</span>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 border-emerald-500/30">
            {currentNodes.filter((n) => n.routerLevel === "L1_L2").length} L1/L2 Border
          </Badge>
        </div>

        <div className="p-2.5 rounded-lg bg-card border border-border/70 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-muted-foreground block font-sans">DIS Elected</span>
            <span className="text-base font-bold font-mono text-amber-400">{disCount} LAN DIS</span>
          </div>
          <Award className="h-4 w-4 text-amber-400 opacity-80" />
        </div>

        <div className="p-2.5 rounded-lg bg-card border border-border/70 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-muted-foreground block font-sans">Attached Bit (ATT)</span>
            <span className="text-base font-bold font-mono text-blue-400">{attCount} Border Default</span>
          </div>
          <Globe className="h-4 w-4 text-blue-400 opacity-80" />
        </div>

        <div className="p-2.5 rounded-lg bg-card border border-border/70 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-muted-foreground block font-sans">Overload (OL) Flags</span>
            <span className={`text-base font-bold font-mono ${olCount > 0 ? "text-rose-400" : "text-slate-400"}`}>
              {olCount} Drain Mode
            </span>
          </div>
          <ShieldAlert className={`h-4 w-4 ${olCount > 0 ? "text-rose-400" : "text-slate-500"} opacity-80`} />
        </div>
      </div>

      {/* Main Grid Workspace Layout (8 cols Left / 4 cols Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left / Center 8 Cols: Topology Canvas (Top), Playback Controls, Timeline, & CLI Tables */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Animated SVG Topology Canvas Prominently at the Top */}
          <IsisTopology
            nodes={currentNodes}
            links={currentLinks}
            stepState={currentStepState}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />

          {/* Simulation Controls */}
          <SimulationControls />

          {/* Event Timeline */}
          <EventTimeline />

          {/* Cisco / Juniper CLI Database & Routing Forwarding Tables */}
          <IsisDatabaseTable
            nodes={currentNodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />
        </div>

        {/* Right 4 Cols: Step Details & Tabbed Inspection Panels */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Dual-Track Pedagogical Step Details Card */}
          <IsisEventDetails stepState={currentStepState} />

          {/* Tab Navigation */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            tabs={[
              { id: "inspector", label: "PDU & TLVs" },
              { id: "node", label: "Router Summary" },
              { id: "config", label: "Scenarios & Knobs" },
            ]}
          />

          {/* Tab Content Panels */}
          {activeTab === "inspector" && (
            <IsisPduInspector pdu={activePdu} />
          )}

          {activeTab === "node" && (
            <IsisNodeSummary node={selectedNode} />
          )}

          {activeTab === "config" && (
            <IsisConfigPanel
              config={config}
              onUpdateConfig={handleUpdateConfig}
              onResetDefaults={handleResetDefaults}
              onSelectScenario={handleSelectScenario}
              onOpenComparisonModal={() => setIsComparisonOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Comparison Modal */}
      <IsisOspfComparisonModal
        isOpen={isComparisonOpen}
        onOpenChange={setIsComparisonOpen}
      />
    </div>
  );
}

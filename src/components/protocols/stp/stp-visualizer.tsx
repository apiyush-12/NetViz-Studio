"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Network,
  GitBranch,
} from "lucide-react";
import { Badge, Tabs } from "@/components/ui";
import { SimulationControls } from "@/components/simulation/simulation-controls";
import { EventTimeline } from "@/components/simulation/event-timeline";
import { useSimulationStore } from "@/features/simulation/simulation-store";
import { StpTopology } from "./stp-topology";
import { StpBridgeSummary } from "./stp-bridge-summary";
import { StpPortTable } from "./stp-port-table";
import { StpBpduInspector } from "./stp-bpdu-inspector";
import { StpConfigPanel } from "./stp-config-panel";
import { StpEventDetails } from "./stp-event-details";
import { StpRstpComparisonModal } from "@/components/protocols/comparison/stp-rstp-comparison-modal";
import type {
  StpConfig,
  StpSwitchNode,
  StpLink,
  StpScenarioId,
  StpSimulationStepState,
  BpduFrame,
} from "@/features/protocols/stp/stp.types";
import {
  defaultStpConfig,
  TRIANGLE_SWITCHES,
  TRIANGLE_LINKS,
  STP_SCENARIOS,
} from "@/features/protocols/stp/stp.defaults";
import { simulateStpTransaction } from "@/features/protocols/stp/stp.simulator";

export function StpVisualizer() {
  const [config, setConfig] = useState<StpConfig>(defaultStpConfig);
  const [selectedSwitchId, setSelectedSwitchId] = useState<string>("sw1");
  const [selectedPortId, setSelectedPortId] = useState<string | null>(null);
  const [simulationMode, setSimulationMode] = useState<"realtime" | "simulation">("simulation");
  const [activeTab, setActiveTab] = useState<string>("ports");

  const loadProtocol = useSimulationStore((s) => s.loadProtocol);
  const storeStep = useSimulationStore((s) => s.currentStep);
  const scrubTo = useSimulationStore((s) => s.scrubTo);

  // Load STP protocol into simulation store
  useEffect(() => {
    loadProtocol("stp", config as unknown as Record<string, unknown>);
  }, [loadProtocol, config]);

  // Compute simulation outcome
  const outcome = useMemo(() => {
    return simulateStpTransaction(config as unknown as Record<string, unknown>);
  }, [config]);

  const activeStepIndex =
    storeStep >= 0 && storeStep < outcome.steps.length ? storeStep : 0;
  const currentStepState: StpSimulationStepState =
    outcome.steps[activeStepIndex] || outcome.steps[0];

  const currentSwitches: StpSwitchNode[] =
    currentStepState?.switches || outcome.finalSwitches || TRIANGLE_SWITCHES;
  const currentLinks: StpLink[] =
    currentStepState?.links || outcome.finalLinks || TRIANGLE_LINKS;

  const selectedSwitch: StpSwitchNode =
    currentSwitches.find((s) => s.id === selectedSwitchId) ||
    currentSwitches[0] ||
    TRIANGLE_SWITCHES[0];

  const activeBpdu: BpduFrame | undefined = currentStepState?.activeBpdu;

  const handleUpdateConfig = (updates: Partial<StpConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    scrubTo(0);
  };

  const handleResetDefaults = () => {
    setConfig(defaultStpConfig);
    setSelectedSwitchId("sw1");
    scrubTo(0);
  };

  const handleSelectScenario = (scenarioId: StpScenarioId) => {
    let version = config.version;
    if (scenarioId === "rstp_rapid_convergence") {
      version = "rstp";
    }
    setConfig((prev) => ({
      ...prev,
      scenarioId,
      version,
    }));
    scrubTo(0);
  };

  const handleToggleLink = () => {
    // If on standard convergence, switch to link failure scenario
    if (config.scenarioId === "standard_convergence") {
      handleSelectScenario("root_link_failure");
    } else {
      handleSelectScenario("standard_convergence");
    }
  };

  return (
    <div className="flex flex-col gap-3 p-3 max-w-[1700px] mx-auto w-full min-h-0">
      {/* Top Header Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                Spanning Tree Protocol (STP / RSTP) Studio
              </h2>
              <Badge
                variant="default"
                className="text-[10px] font-mono bg-emerald-500 text-slate-950 font-bold"
              >
                IEEE 802.1D / 802.1w
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Loop Prevention · Root Bridge Election · Root Path Cost · Port Roles (RP/DP/AP) · Rapid Proposal/Agreement Sync
            </p>
          </div>
        </div>

        {/* Quick Actions: Comparison Modal & Mode Toggle */}
        <div className="flex items-center gap-2">
          <StpRstpComparisonModal />

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
        {STP_SCENARIOS.map((sc) => {
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
          <StpTopology
            switches={currentSwitches}
            links={currentLinks}
            selectedSwitchId={selectedSwitchId}
            onSelectSwitch={(id) => setSelectedSwitchId(id)}
            onToggleLink={handleToggleLink}
            activeBpdu={activeBpdu}
            activeLinkIds={currentStepState?.activeLinkIds || []}
            loopActive={currentStepState?.loopActive || false}
          />

          {/* Playback Controls & Event Timeline */}
          <div className="flex flex-col gap-3">
            <SimulationControls />
            <EventTimeline />
          </div>

          {/* Step-by-Step Pedagogical Explanation Card */}
          <StpEventDetails
            stepState={currentStepState}
            currentStepIndex={activeStepIndex}
            totalSteps={outcome.steps.length}
          />
        </div>

        {/* Right Column: Switch Summary, Port Status & BPDU Inspector (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3 min-h-0">
          {/* Selected Switch Header Summary */}
          <StpBridgeSummary
            selectedSwitch={selectedSwitch}
          />

          {/* Right Inspector Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            tabs={[
              { id: "ports", label: "Port Status" },
              { id: "bpdu", label: "BPDU Decoder" },
              { id: "config", label: "Config & Presets" },
            ]}
          />

          <div className="min-h-0">
            {activeTab === "ports" && (
              <StpPortTable
                ports={selectedSwitch.ports}
                selectedPortId={selectedPortId}
                onSelectPort={(p) => setSelectedPortId(p.id)}
              />
            )}

            {activeTab === "bpdu" && (
              <StpBpduInspector bpdu={activeBpdu} />
            )}

            {activeTab === "config" && (
              <StpConfigPanel
                config={config}
                switches={currentSwitches}
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

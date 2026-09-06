"use client";

import React from "react";
import {
  RotateCcw,
  Zap,
  Network,
  GitBranch,
  Sliders,
} from "lucide-react";
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import type {
  StpConfig,
  StpTopologyPresetId,
  StpScenarioId,
  StpSwitchNode,
} from "@/features/protocols/stp/stp.types";
import { STP_SCENARIOS } from "@/features/protocols/stp/stp.defaults";

interface StpConfigPanelProps {
  config: StpConfig;
  switches: StpSwitchNode[];
  onUpdateConfig: (updates: Partial<StpConfig>) => void;
  onResetDefaults: () => void;
  onSelectScenario: (scenarioId: StpScenarioId) => void;
}

export function StpConfigPanel({
  config,
  switches,
  onUpdateConfig,
  onResetDefaults,
  onSelectScenario,
}: StpConfigPanelProps) {
  const topologyPresets: { id: StpTopologyPresetId; label: string; desc: string }[] = [
    {
      id: "triangle_loop",
      label: "3-Switch Triangle",
      desc: "Classic Layer 2 loop with 1 blocked port",
    },
    {
      id: "diamond_core",
      label: "4-Switch Diamond",
      desc: "Redundant Core & Distribution mesh",
    },
    {
      id: "hierarchical_campus",
      label: "Hierarchical 3-Tier",
      desc: "Enterprise Core, Distribution & Access",
    },
    {
      id: "ring_network",
      label: "5-Switch Ring",
      desc: "Metro ring topology breaking furthest link",
    },
  ];

  const priorityOptions = [0, 4096, 8192, 16384, 28672, 32768, 61440];

  const handlePriorityChange = (switchId: string, priority: number) => {
    const currentSwitches = config.switches || switches.map((s) => ({ id: s.id, priority: s.bridgeId.priority }));
    const updated = currentSwitches.map((s) => (s.id === switchId ? { ...s, priority } : s));
    if (!updated.some((s) => s.id === switchId)) {
      updated.push({ id: switchId, priority });
    }
    onUpdateConfig({ switches: updated });
  };

  return (
    <div className="space-y-3 text-xs">
      {/* 1. Topology Preset Selector */}
      <Card className="border-border bg-card/60 backdrop-blur-sm shadow-sm">
        <CardHeader className="p-3 pb-2 border-b border-border/50">
          <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-foreground">
            <Network className="h-3.5 w-3.5 text-primary" /> Topology Preset
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid grid-cols-2 gap-2">
            {topologyPresets.map((preset) => {
              const isSelected = config.topologyPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => onUpdateConfig({ topologyPreset: preset.id })}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-xs"
                      : "border-border/50 bg-secondary/20 hover:bg-secondary/40"
                  }`}
                >
                  <div className="font-semibold text-foreground text-xs">{preset.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{preset.desc}</div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 2. STP Version Switcher (802.1D vs 802.1w RSTP) */}
      <Card className="border-border bg-card/60 backdrop-blur-sm shadow-sm">
        <CardHeader className="p-3 pb-2 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-foreground">
              <Zap className="h-3.5 w-3.5 text-primary" /> Protocol Standard & Mode
            </CardTitle>
            <Badge variant="outline" className="text-[10px] font-mono">
              {config.version === "rstp" ? "IEEE 802.1w" : "IEEE 802.1D"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onUpdateConfig({ version: "stp" })}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                config.version === "stp"
                  ? "border-primary bg-primary/10 font-bold"
                  : "border-border/50 bg-secondary/20 hover:bg-secondary/40"
              }`}
            >
              <div className="text-xs text-foreground font-semibold">Classic STP (802.1D)</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Listening & Learning 30-50s timers
              </div>
            </button>

            <button
              onClick={() => onUpdateConfig({ version: "rstp" })}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                config.version === "rstp"
                  ? "border-cyan-500 bg-cyan-500/10 font-bold"
                  : "border-border/50 bg-secondary/20 hover:bg-secondary/40"
              }`}
            >
              <div className="text-xs text-foreground font-semibold flex items-center gap-1">
                <Zap className="h-3 w-3 text-cyan-400" /> Rapid STP (802.1w)
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Proposal/Agreement sub-second sync
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 3. Switch Bridge Priorities Customizer */}
      <Card className="border-border bg-card/60 backdrop-blur-sm shadow-sm">
        <CardHeader className="p-3 pb-2 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-foreground">
              <Sliders className="h-3.5 w-3.5 text-primary" /> Bridge Priorities (Multiples of 4096)
            </CardTitle>
            <span className="text-[10px] text-muted-foreground">Lowest = Root</span>
          </div>
        </CardHeader>
        <CardContent className="p-3 space-y-2.5">
          {switches.map((sw) => {
            const currentPri =
              config.switches?.find((s) => s.id === sw.id)?.priority ?? sw.bridgeId.priority;
            return (
              <div
                key={sw.id}
                className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 border border-border/40"
              >
                <div>
                  <span className="font-semibold text-foreground text-xs">{sw.name}</span>
                  <span className="text-[10px] text-muted-foreground ml-2 font-mono">
                    {sw.bridgeId.macAddress}
                  </span>
                </div>
                <div className="w-28">
                  <select
                    value={currentPri}
                    onChange={(e) => handlePriorityChange(sw.id, Number(e.target.value))}
                    className="h-8 w-full rounded border border-border bg-background px-2 text-xs font-mono font-semibold"
                  >
                    {priorityOptions.map((pri) => (
                      <option key={pri} value={pri}>
                        {pri} {pri === 0 ? "(Master)" : pri === 4096 ? "(Core)" : pri === 32768 ? "(Default)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 4. Scenario Selector */}
      <Card className="border-border bg-card/60 backdrop-blur-sm shadow-sm">
        <CardHeader className="p-3 pb-2 border-b border-border/50">
          <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-foreground">
            <GitBranch className="h-3.5 w-3.5 text-primary" /> Simulation & Convergence Scenarios
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-2">
          {STP_SCENARIOS.map((sc) => {
            const isSelected = config.scenarioId === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => onSelectScenario(sc.id)}
                className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-xs"
                    : "border-border/50 bg-secondary/20 hover:bg-secondary/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground text-xs">{sc.name}</span>
                  <Badge variant="outline" className="text-[9px] font-mono">
                    {sc.badge}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                  {sc.description}
                </p>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Action Buttons: Reset */}
      <div className="flex items-center justify-between pt-1">
        <Button
          size="sm"
          variant="outline"
          onClick={onResetDefaults}
          className="text-xs cursor-pointer gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset All Defaults
        </Button>
      </div>
    </div>
  );
}

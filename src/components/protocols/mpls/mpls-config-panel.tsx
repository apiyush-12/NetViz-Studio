"use client";

import React from "react";
import {
  Settings2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Button, Label, Switch, Badge } from "@/components/ui";
import type {
  MplsConfig,
  MplsTopologyPresetId,
  MplsScenarioId,
  TtlPropagationMode,
} from "@/features/protocols/mpls/mpls.types";
import { MPLS_SCENARIOS } from "@/features/protocols/mpls/mpls.defaults";

interface MplsConfigPanelProps {
  config: MplsConfig;
  onUpdateConfig: (updates: Partial<MplsConfig>) => void;
  onResetDefaults: () => void;
  onSelectScenario: (scenarioId: MplsScenarioId) => void;
}

export function MplsConfigPanel({
  config,
  onUpdateConfig,
  onResetDefaults,
  onSelectScenario,
}: MplsConfigPanelProps) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="py-3 px-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary border border-primary/20">
              <Settings2 className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-semibold text-foreground">
              MPLS Protocol & Topology Configuration
            </CardTitle>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onResetDefaults}
            className="h-7 text-xs text-muted-foreground hover:text-foreground cursor-pointer gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs">
        {/* Scenario Selection Cards */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Interactive Guided Scenarios</span>
            </Label>
            <span className="text-[11px] text-muted-foreground">Select a pre-built lab</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {(Object.entries(MPLS_SCENARIOS) as [MplsScenarioId, (typeof MPLS_SCENARIOS)[MplsScenarioId]][]).map(
              ([id, scn]) => {
                const isSelected = config.scenarioId === id;
                return (
                  <button
                    key={id}
                    onClick={() => onSelectScenario(id)}
                    className={`p-2.5 rounded-lg text-left transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-primary/10 border-primary shadow-sm"
                        : "bg-secondary/20 hover:bg-secondary/40 border-border/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`font-semibold text-xs ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {scn.title}
                      </span>
                      <Badge variant="outline" className="text-[9px] uppercase px-1.5 py-0">
                        {scn.category}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {scn.summary}
                    </p>
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-border/60">
          {/* Topology Preset */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground block font-medium">Topology Preset</Label>
            <select
              value={config.topologyPreset}
              onChange={(e) =>
                onUpdateConfig({ topologyPreset: e.target.value as MplsTopologyPresetId })
              }
              className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground cursor-pointer"
            >
              <option value="standard_core_lsp">Standard 5-Router Core LSP</option>
              <option value="penultimate_hop_popping">Penultimate Hop Popping (PHP)</option>
              <option value="l3vpn_two_label_stack">BGP/MPLS L3VPN (2-Label Stack)</option>
              <option value="mpls_fast_reroute_frr">MPLS-TE Fast Reroute (FRR)</option>
              <option value="ttl_uniform_vs_pipe">TTL Uniform vs Pipe Mode</option>
            </select>
          </div>

          {/* TTL Mode */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground block font-medium">TTL Propagation (RFC 3443)</Label>
            <select
              value={config.ttlMode}
              onChange={(e) =>
                onUpdateConfig({ ttlMode: e.target.value as TtlPropagationMode })
              }
              className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground cursor-pointer"
            >
              <option value="uniform">Uniform Mode (Visible Core Hops)</option>
              <option value="pipe">Pipe Mode (Hidden 1-Hop Core)</option>
            </select>
          </div>

          {/* Traffic Class / EXP */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground block font-medium">Traffic Class / EXP (0-7)</Label>
            <select
              value={config.trafficClassExp}
              onChange={(e) =>
                onUpdateConfig({ trafficClassExp: Number(e.target.value) })
              }
              className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground cursor-pointer"
            >
              <option value="0">0: Best Effort (BE / CS0)</option>
              <option value="1">1: Priority 1 (CS1 / Scavenger)</option>
              <option value="2">2: Priority 2 (CS2 / Low Latency)</option>
              <option value="3">3: Priority 3 (CS3 / Video)</option>
              <option value="4">4: Priority 4 (CS4 / Real-Time)</option>
              <option value="5">5: Priority 5 (EF / Voice)</option>
              <option value="6">6: Priority 6 (CS6 / Control)</option>
              <option value="7">7: Priority 7 (CS7 / High)</option>
            </select>
          </div>

          {/* Customer VRF (if L3VPN) */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground block font-medium">Customer Tenant VRF</Label>
            <select
              value={config.customerVrf}
              onChange={(e) =>
                onUpdateConfig({ customerVrf: e.target.value as MplsConfig["customerVrf"] })
              }
              className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground cursor-pointer"
            >
              <option value="VRF_RED_CUSTOMER_A">Acme Corp (VRF_RED - Label 501)</option>
              <option value="VRF_BLUE_CUSTOMER_B">Globex Corp (VRF_BLUE - Label 502)</option>
              <option value="GLOBAL_IP">Global IP Routing</option>
            </select>
          </div>
        </div>

        {/* Feature Switches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/20 border border-border/50">
            <div className="space-y-0.5">
              <Label className="text-xs font-semibold">Penultimate Hop Popping (PHP)</Label>
              <p className="text-[11px] text-muted-foreground">
                Egress LER signals Implicit Null (Label 3) to penultimate LSR
              </p>
            </div>
            <Switch
              checked={config.phpEnabled}
              onCheckedChange={(checked) => onUpdateConfig({ phpEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/20 border border-border/50">
            <div className="space-y-0.5">
              <Label className="text-xs font-semibold">Simulate Link Failure (FRR Detour)</Label>
              <p className="text-[11px] text-muted-foreground">
                Triggers 50ms fast reroute bypass detour around primary link
              </p>
            </div>
            <Switch
              checked={config.simulateLinkFailure}
              onCheckedChange={(checked) => onUpdateConfig({ simulateLinkFailure: checked })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import React from "react";
import {
  Settings2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Button, Label, Switch, Badge } from "@/components/ui";
import type {
  RipConfig,
  RipTopologyPresetId,
  RipScenarioId,
  RipVersion,
} from "@/features/protocols/rip/rip.types";
import { RIP_SCENARIOS, TOPOLOGY_PRESETS } from "@/features/protocols/rip/rip.defaults";

interface RipConfigPanelProps {
  config: RipConfig;
  onUpdateConfig: (updates: Partial<RipConfig>) => void;
  onResetDefaults: () => void;
  onSelectScenario: (scenarioId: RipScenarioId) => void;
}

export function RipConfigPanel({
  config,
  onUpdateConfig,
  onResetDefaults,
  onSelectScenario,
}: RipConfigPanelProps) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="py-3 px-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary border border-primary/20">
              <Settings2 className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-semibold text-foreground">
              RIP Parameters & Scenario Labs
            </CardTitle>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={onResetDefaults}
            className="text-xs h-7 px-2.5 gap-1.5 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Reset Defaults
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs">
        {/* Scenario Labs Carousel / Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Guided Distance-Vector Labs
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              {Object.keys(RIP_SCENARIOS).length} Presets
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.values(RIP_SCENARIOS).map((scn) => {
              const isSelected = config.scenarioId === scn.id;
              return (
                <button
                  key={scn.id}
                  type="button"
                  onClick={() => onSelectScenario(scn.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary/10 border-primary text-foreground ring-1 ring-primary/40 shadow-sm"
                      : "bg-secondary/20 border-border/50 hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-semibold text-xs text-foreground line-clamp-1">
                      {scn.title}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] uppercase px-1.5 py-0 ${
                        scn.category === "loop_prevention"
                          ? "bg-red-500/10 text-red-400 border-red-500/30"
                          : scn.category === "failure"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      }`}
                    >
                      {scn.category}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {scn.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Protocol Toggles & Controls */}
        <div className="space-y-3 pt-3 border-t border-border/60">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Protocol Tuning & Loop Prevention
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Split Horizon */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/20 border border-border/50">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold">Split Horizon</Label>
                <p className="text-[11px] text-muted-foreground">
                  Suppresses advertising routes out the ingress interface
                </p>
              </div>
              <Switch
                checked={config.splitHorizon}
                onCheckedChange={(checked) => onUpdateConfig({ splitHorizon: checked })}
              />
            </div>

            {/* Poison Reverse */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/20 border border-border/50">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold">Poison Reverse</Label>
                <p className="text-[11px] text-muted-foreground">
                  Advertises reverse routes with Metric 16 (&infin;)
                </p>
              </div>
              <Switch
                checked={config.poisonReverse}
                onCheckedChange={(checked) => onUpdateConfig({ poisonReverse: checked })}
              />
            </div>

            {/* Triggered Updates */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/20 border border-border/50">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold">Triggered Flash Updates</Label>
                <p className="text-[11px] text-muted-foreground">
                  Immediate flash broadcast upon link cut
                </p>
              </div>
              <Switch
                checked={config.triggeredUpdates}
                onCheckedChange={(checked) => onUpdateConfig({ triggeredUpdates: checked })}
              />
            </div>

            {/* RIP Version */}
            <div className="space-y-1 p-2.5 rounded-lg bg-secondary/20 border border-border/50">
              <Label className="text-xs font-semibold block">RIP Version</Label>
              <select
                value={config.version}
                onChange={(e) => onUpdateConfig({ version: e.target.value as RipVersion })}
                className="flex h-7 w-full rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground cursor-pointer"
              >
                <option value="ripv2">RIPv2 (RFC 2453 — Classless, Multicast 224.0.0.9)</option>
                <option value="ripv1">RIPv1 (RFC 1058 — Classful, Broadcast 255.255.255.255)</option>
              </select>
            </div>
          </div>

          {/* Topology Preset Selector */}
          <div className="space-y-1 pt-1">
            <Label className="text-xs font-semibold block">Active Network Topology</Label>
            <select
              value={config.topologyPreset}
              onChange={(e) =>
                onUpdateConfig({ topologyPreset: e.target.value as RipTopologyPresetId })
              }
              className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground cursor-pointer"
            >
              {Object.entries(TOPOLOGY_PRESETS).map(([id, p]) => (
                <option key={id} value={id}>
                  {p.name} — {p.description}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

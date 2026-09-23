"use client";

import React from "react";
import {
  Settings,
  RotateCcw,
  Shield,
  Network,
  Radio,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Label,
  Switch,
  Badge,
} from "@/components/ui";
import type {
  VlanConfig,
  VlanNode,
  VlanScenarioId,
  VlanTopologyPresetId,
} from "@/features/protocols/vlan/vlan.types";
import {
  VLAN_PRESETS,
  VLAN_SCENARIOS,
} from "@/features/protocols/vlan/vlan.defaults";

interface VlanConfigPanelProps {
  config: VlanConfig;
  nodes: VlanNode[];
  onUpdateConfig: (updates: Partial<VlanConfig>) => void;
  onResetDefaults: () => void;
  onSelectScenario: (scenarioId: VlanScenarioId) => void;
}

export function VlanConfigPanel({
  config,
  nodes,
  onUpdateConfig,
  onResetDefaults,
  onSelectScenario,
}: VlanConfigPanelProps) {
  const hostNodes = nodes.filter((n) => n.type === "host" || n.type === "server" || n.type === "attacker");

  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-secondary/30 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary" />
          <h4 className="text-xs font-bold text-foreground">
            VLAN & Trunking Configuration
          </h4>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onResetDefaults}
          className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </Button>
      </div>

      <CardContent className="p-3.5 space-y-4 text-xs">
        {/* Topology Preset Selector */}
        <div className="space-y-1.5">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
            <Network className="h-3 w-3 text-primary" /> Topology Preset
          </Label>
          <div className="grid grid-cols-2 gap-1.5">
            {VLAN_PRESETS.map((preset) => {
              const isSelected = config.topologyPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    onUpdateConfig({
                      topologyPreset: preset.id as VlanTopologyPresetId,
                    });
                  }}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary/10 border-primary text-foreground font-semibold shadow-xs"
                      : "bg-secondary/20 border-border/70 text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  <div className="text-xs font-bold">{preset.name}</div>
                  <div className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                    {preset.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scenario Selector */}
        <div className="space-y-1.5">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
            <Radio className="h-3 w-3 text-emerald-400" /> Operational Scenarios
          </Label>
          <div className="space-y-1.5">
            {VLAN_SCENARIOS.map((sc) => {
              const isSelected = config.scenarioId === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => onSelectScenario(sc.id)}
                  className={`w-full p-2 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "bg-emerald-500/10 border-emerald-500 text-foreground font-semibold shadow-xs"
                      : "bg-secondary/15 border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{sc.name}</div>
                    <div className="text-[10px] text-muted-foreground line-clamp-1">
                      {sc.description}
                    </div>
                  </div>
                  {isSelected && (
                    <Badge variant="success" className="text-[9px] uppercase font-mono">
                      Active
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Source & Target Parameters */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Source Host</Label>
            <select
              value={config.sourceNodeId}
              onChange={(e) => onUpdateConfig({ sourceNodeId: e.target.value })}
              className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
            >
              {hostNodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label} (VLAN {n.vlanId})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Target Host</Label>
            <select
              value={config.targetNodeId}
              onChange={(e) => onUpdateConfig({ targetNodeId: e.target.value })}
              className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
            >
              {hostNodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label} (VLAN {n.vlanId})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Trunk & Security Parameters */}
        <div className="space-y-2 pt-2 border-t border-border/50">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
            <Shield className="h-3 w-3 text-cyan-400" /> 802.1Q Trunk & Security Settings
          </Label>

          {/* Native VLAN Selector */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/15 border border-border/60">
            <div className="flex flex-col gap-0.5 pr-2">
              <span className="text-xs font-semibold text-foreground">
                Trunk Native VLAN ID
              </span>
              <span className="text-[10px] text-muted-foreground">
                VLAN transmitted untagged across 802.1Q trunks
              </span>
            </div>
            <select
              value={config.nativeVlanId}
              onChange={(e) => onUpdateConfig({ nativeVlanId: Number(e.target.value) })}
              className="h-7 rounded border border-input bg-background px-2 text-xs font-mono"
            >
              <option value={1}>VLAN 1 (Default)</option>
              <option value={99}>VLAN 99 (Dedicated)</option>
              <option value={999}>VLAN 999 (Unused Dummy)</option>
            </select>
          </div>

          {/* Tag Native VLAN Toggle */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/15 border border-border/60">
            <div className="flex flex-col gap-0.5 pr-2">
              <span className="text-xs font-semibold text-foreground">
                Explicit Native Tagging (`vlan dot1q tag native`)
              </span>
              <span className="text-[10px] text-muted-foreground">
                Forces 4-byte 802.1Q tags on Native VLAN to mitigate Hopping
              </span>
            </div>
            <Switch
              checked={config.tagNativeVlan}
              onCheckedChange={(val) => onUpdateConfig({ tagNativeVlan: val })}
              aria-label="Toggle Explicit Native Tagging"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

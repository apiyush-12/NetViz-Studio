"use client";

import React from "react";
import {
  Settings,
  RotateCcw,
  Sliders,
  Shield,
  Network,
  Radio,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Switch,
  Slider,
  Badge,
} from "@/components/ui";
import type {
  ArpConfig,
  ArpNode,
  ArpScenarioId,
  ArpTopologyPresetId,
} from "@/features/protocols/arp/arp.types";
import {
  ARP_PRESETS,
  ARP_SCENARIOS,
} from "@/features/protocols/arp/arp.defaults";

interface ArpConfigPanelProps {
  config: ArpConfig;
  nodes: ArpNode[];
  onUpdateConfig: (updates: Partial<ArpConfig>) => void;
  onResetDefaults: () => void;
  onSelectScenario: (scenarioId: ArpScenarioId) => void;
}

export function ArpConfigPanel({
  config,
  nodes,
  onUpdateConfig,
  onResetDefaults,
  onSelectScenario,
}: ArpConfigPanelProps) {
  const hostNodes = nodes.filter((n) => n.type !== "switch");

  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-secondary/30 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary" />
          <h4 className="text-xs font-bold text-foreground">
            ARP Configuration & Scenario Studio
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
            {ARP_PRESETS.map((preset) => {
              const isSelected = config.topologyPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    onUpdateConfig({
                      topologyPreset: preset.id as ArpTopologyPresetId,
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
            {ARP_SCENARIOS.map((sc) => {
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
                  {n.label} ({n.ipAddress || n.id})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Target IPv4 Address</Label>
            <Input
              value={config.targetIp}
              onChange={(e) => onUpdateConfig({ targetIp: e.target.value })}
              placeholder="e.g. 192.168.1.20"
              className="h-8 text-xs font-mono"
            />
          </div>
        </div>

        {/* Protocol Feature Toggles */}
        <div className="space-y-2 pt-2 border-t border-border/50">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
            <Shield className="h-3 w-3 text-cyan-400" /> Security & Protocol Flags
          </Label>

          {/* Dynamic ARP Inspection (DAI) */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/15 border border-border/60">
            <div className="flex flex-col gap-0.5 pr-2">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                Dynamic ARP Inspection (DAI)
              </span>
              <span className="text-[10px] text-muted-foreground">
                Drop invalid ARP frames violating DHCP Snooping table
              </span>
            </div>
            <Switch
              checked={config.daiEnabled}
              onCheckedChange={(val) => onUpdateConfig({ daiEnabled: val })}
              aria-label="Toggle Dynamic ARP Inspection"
            />
          </div>

          {/* Proxy ARP */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/15 border border-border/60">
            <div className="flex flex-col gap-0.5 pr-2">
              <span className="text-xs font-semibold text-foreground">
                Proxy ARP (RFC 1027)
              </span>
              <span className="text-[10px] text-muted-foreground">
                Router answers ARP requests for remote subnets
              </span>
            </div>
            <Switch
              checked={config.proxyArpEnabled}
              onCheckedChange={(val) => onUpdateConfig({ proxyArpEnabled: val })}
              aria-label="Toggle Proxy ARP"
            />
          </div>

          {/* Rogue Attacker Spoofing */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/15 border border-border/60">
            <div className="flex flex-col gap-0.5 pr-2">
              <span className="text-xs font-semibold text-foreground">
                Enable Rogue Attacker Node
              </span>
              <span className="text-[10px] text-muted-foreground">
                Inject malicious ARP poison frames into subnet
              </span>
            </div>
            <Switch
              checked={config.attackerEnabled}
              onCheckedChange={(val) => onUpdateConfig({ attackerEnabled: val })}
              aria-label="Toggle Attacker Spoofing"
            />
          </div>
        </div>

        {/* Cache Aging Timeout Slider */}
        <div className="space-y-1.5 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs">
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
              <Sliders className="h-3 w-3 text-purple-400" /> Cache TTL Timeout
            </Label>
            <span className="font-mono text-xs font-bold text-foreground">
              {config.cacheTimeoutSeconds}s
            </span>
          </div>
          <Slider
            value={[config.cacheTimeoutSeconds]}
            onValueChange={([val]) => onUpdateConfig({ cacheTimeoutSeconds: val })}
            min={10}
            max={300}
            step={10}
            aria-label="ARP Cache TTL Timeout"
          />
          <div className="flex justify-between text-[9px] text-muted-foreground font-mono">
            <span>10s (Fast Flushes)</span>
            <span>60s (Linux default)</span>
            <span>300s (Cisco default)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import React from "react";
import {
  Settings2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Button, Label, Switch, Badge } from "@/components/ui";
import type {
  IcmpConfig,
  IcmpTopologyPresetId,
  IcmpScenarioId,
} from "@/features/protocols/icmp/icmp.types";
import { ICMP_SCENARIOS } from "@/features/protocols/icmp/icmp.defaults";

interface IcmpConfigPanelProps {
  config: IcmpConfig;
  onUpdateConfig: (updates: Partial<IcmpConfig>) => void;
  onResetDefaults: () => void;
  onSelectScenario: (scenarioId: IcmpScenarioId) => void;
}

export function IcmpConfigPanel({
  config,
  onUpdateConfig,
  onResetDefaults,
  onSelectScenario,
}: IcmpConfigPanelProps) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="py-3 px-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary border border-primary/20">
              <Settings2 className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-semibold text-foreground">
              ICMP Parameters & Scenario Labs
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
            <span className="text-[11px] text-muted-foreground">Select an ICMP scenario</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {(Object.entries(ICMP_SCENARIOS) as [IcmpScenarioId, (typeof ICMP_SCENARIOS)[IcmpScenarioId]][]).map(
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
                onUpdateConfig({ topologyPreset: e.target.value as IcmpTopologyPresetId })
              }
              className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground cursor-pointer"
            >
              <option value="standard_internet_path">Multi-Hop Internet Path</option>
              <option value="pmtud_bottleneck_path">Path MTU Bottleneck Link</option>
              <option value="unreachable_firewall_network">Firewall & Closed Port</option>
              <option value="local_redirect_subnet">Local Subnet Redirect</option>
            </select>
          </div>

          {/* Packet Size */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground block font-medium">Packet Size (Bytes)</Label>
            <select
              value={config.packetSizeBytes}
              onChange={(e) =>
                onUpdateConfig({ packetSizeBytes: Number(e.target.value) })
              }
              className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground cursor-pointer"
            >
              <option value="64">64 Bytes (Standard Ping)</option>
              <option value="128">128 Bytes</option>
              <option value="512">512 Bytes</option>
              <option value="1300">1300 Bytes (Tunnel MTU)</option>
              <option value="1500">1500 Bytes (Full MTU)</option>
            </select>
          </div>

          {/* Starting TTL */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground block font-medium">Starting IP TTL</Label>
            <select
              value={config.startingTtl}
              onChange={(e) =>
                onUpdateConfig({ startingTtl: Number(e.target.value) })
              }
              className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground cursor-pointer"
            >
              <option value="1">1 (Traceroute Hop 1)</option>
              <option value="2">2 (Traceroute Hop 2)</option>
              <option value="3">3 (Traceroute Hop 3)</option>
              <option value="64">64 (Standard Linux/Unix)</option>
              <option value="128">128 (Windows Default)</option>
              <option value="255">255 (Max Hop Limit)</option>
            </select>
          </div>

          {/* Ping Count */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground block font-medium">Ping Probe Count</Label>
            <select
              value={config.pingCount}
              onChange={(e) =>
                onUpdateConfig({ pingCount: Number(e.target.value) })
              }
              className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground cursor-pointer"
            >
              <option value="1">1 Probe</option>
              <option value="4">4 Probes (Standard)</option>
              <option value="10">10 Probes</option>
            </select>
          </div>
        </div>

        {/* Feature Switches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/20 border border-border/50">
            <div className="space-y-0.5">
              <Label className="text-xs font-semibold">Don&apos;t Fragment Flag (DF=1)</Label>
              <p className="text-[11px] text-muted-foreground">
                Forces routers to drop oversized packets and send ICMP Frag Needed
              </p>
            </div>
            <Switch
              checked={config.dontFragmentFlag}
              onCheckedChange={(checked) => onUpdateConfig({ dontFragmentFlag: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/20 border border-border/50">
            <div className="space-y-0.5">
              <Label className="text-xs font-semibold">Target Destination Endpoint</Label>
              <p className="text-[11px] text-muted-foreground">
                Destination Server IP: <span className="font-mono font-semibold text-foreground">203.0.113.80</span>
              </p>
            </div>
            <Badge variant="outline" className="font-mono text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              Target Online
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

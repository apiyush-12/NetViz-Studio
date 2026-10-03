"use client";

import React from "react";
import {
  Settings2,
  RotateCcw,
  Sparkles,
  Layers,
  Network,
  Split,
  ShieldAlert,
  Globe,
  Sliders,
  Cpu,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
} from "@/components/ui";
import type {
  IsisConfig,
  IsisScenarioId,
  IsisMetricStyle,
} from "@/features/protocols/isis/isis.types";
import { ISIS_SCENARIOS } from "@/features/protocols/isis/isis.defaults";

interface IsisConfigPanelProps {
  config: IsisConfig;
  onUpdateConfig: (updates: Partial<IsisConfig>) => void;
  onResetDefaults: () => void;
  onSelectScenario: (scenarioId: IsisScenarioId) => void;
  onOpenComparisonModal?: () => void;
}

export function IsisConfigPanel({
  config,
  onUpdateConfig,
  onResetDefaults,
  onSelectScenario,
  onOpenComparisonModal,
}: IsisConfigPanelProps) {
  const currentScenario = config.scenarioId || "multi_area_hierarchy";

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="py-3 px-4 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Settings2 className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                IS-IS Protocol Scenarios & Knobs
              </CardTitle>
              <p className="text-[11px] text-muted-foreground">
                ISO/IEC 10589 &bull; RFC 1195 &bull; RFC 5305 &bull; RFC 5308 &bull; RFC 2966
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenComparisonModal && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenComparisonModal}
                className="h-7 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 gap-1.5"
              >
                <Cpu className="h-3.5 w-3.5" />
                IS-IS vs OSPF Deep Compare
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onResetDefaults}
              className="h-7 text-xs gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs">
        {/* Scenario Selection Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground text-xs flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Pre-built Interactive Scenarios:
            </span>
            <Badge variant="secondary" className="text-[10px] font-mono">
              {Object.keys(ISIS_SCENARIOS).length} Presets Available
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {Object.entries(ISIS_SCENARIOS).map(([id, scn]) => {
              const isSelected = currentScenario === id;
              return (
                <button
                  key={id}
                  onClick={() => onSelectScenario(id as IsisScenarioId)}
                  className={`p-2.5 rounded-lg border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? "bg-emerald-500/15 border-emerald-500 text-foreground shadow-sm ring-1 ring-emerald-500/50"
                      : "bg-secondary/20 hover:bg-secondary/40 border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        {id === "multi_area_hierarchy" && <Layers className="h-3.5 w-3.5 text-emerald-400" />}
                        {id === "attached_bit_default_route" && <Layers className="h-3.5 w-3.5 text-blue-400" />}
                        {id === "dis_pseudonode_election" && <Network className="h-3.5 w-3.5 text-amber-400" />}
                        {id === "route_leaking_up_down" && <Split className="h-3.5 w-3.5 text-blue-400" />}
                        {id === "overload_bit_maintenance" && <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />}
                        {id === "dual_stack_ipv4_ipv6" && <Globe className="h-3.5 w-3.5 text-cyan-400" />}
                        {scn.title}
                      </span>
                      {isSelected && (
                        <Badge variant="default" className="bg-emerald-500 text-slate-950 font-bold text-[9px] px-1 py-0">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {scn.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Protocol Knobs */}
        <div className="space-y-3 pt-3 border-t border-border/60">
          <span className="font-semibold text-foreground text-xs flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-emerald-400" />
            Live Protocol Control Plane Knobs:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Metric Style */}
            <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground text-xs">Metric Style</span>
                <Badge variant="outline" className="text-[9px] font-mono">
                  {config.metricStyle === "wide" ? "RFC 5305" : "RFC 1195"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <button
                  onClick={() => onUpdateConfig({ metricStyle: "wide" as IsisMetricStyle })}
                  className={`p-1 rounded text-center font-semibold transition-colors ${
                    config.metricStyle === "wide"
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-card hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  Wide (24b)
                </button>
                <button
                  onClick={() => onUpdateConfig({ metricStyle: "narrow" as IsisMetricStyle })}
                  className={`p-1 rounded text-center font-semibold transition-colors ${
                    config.metricStyle === "narrow"
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-card hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  Narrow (6b)
                </button>
              </div>
            </div>

            {/* Route Leaking (RFC 2966) */}
            <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground text-xs">Route Leaking</span>
                <Badge variant="outline" className="text-[9px] font-mono">
                  U/D Bit
                </Badge>
              </div>
              <button
                onClick={() => onUpdateConfig({ routeLeakingEnabled: !config.routeLeakingEnabled })}
                className={`w-full p-1.5 rounded font-semibold text-center transition-colors text-[11px] ${
                  config.routeLeakingEnabled
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                    : "bg-card text-muted-foreground border border-border/50"
                }`}
              >
                {config.routeLeakingEnabled ? "✓ Enabled (L2 → L1)" : "✕ Disabled (ATT Default)"}
              </button>
            </div>

            {/* Overload Bit (OL) */}
            <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground text-xs">Overload (OL) Bit</span>
                <Badge variant="outline" className="text-[9px] font-mono">
                  RFC 3787
                </Badge>
              </div>
              <button
                onClick={() => onUpdateConfig({ overloadBit: !config.overloadBit })}
                className={`w-full p-1.5 rounded font-semibold text-center transition-colors text-[11px] ${
                  config.overloadBit
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : "bg-card text-muted-foreground border border-border/50"
                }`}
              >
                {config.overloadBit ? "⚠ Set OL (Drain Transit)" : "✓ Normal Forwarding"}
              </button>
            </div>

            {/* Dual Stack IPv4/IPv6 */}
            <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground text-xs">Dual-Stack IPv6</span>
                <Badge variant="outline" className="text-[9px] font-mono">
                  TLV 236
                </Badge>
              </div>
              <button
                onClick={() => onUpdateConfig({ ipv6Enabled: !config.ipv6Enabled })}
                className={`w-full p-1.5 rounded font-semibold text-center transition-colors text-[11px] ${
                  config.ipv6Enabled
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "bg-card text-muted-foreground border border-border/50"
                }`}
              >
                {config.ipv6Enabled ? "✓ IPv4 + IPv6 Active" : "IPv4 Only"}
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

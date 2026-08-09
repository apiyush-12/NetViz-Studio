"use client";

import React from "react";
import { Label, Input, Button, Switch, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Network, Sliders, AlertTriangle } from "lucide-react";
import type { OspfRouter, OspfLink } from "@/features/protocols/ospf/ospf.types";
import type { OspfValidationError } from "@/features/protocols/ospf/ospf.validators";

interface OspfConfigPanelProps {
  routers: OspfRouter[];
  links: OspfLink[];
  topologyPreset?: string;
  rootRouterId?: string;
  validationErrors: OspfValidationError[];
  onSelectTopologyPreset?: (preset: "diamond" | "ring" | "multi-area" | "triangle") => void;
  onSelectRootRouter?: (rootId: string) => void;
  onUpdateRouter: (nodeId: string, updates: Partial<OspfRouter>) => void;
  onUpdateLinkCost: (linkId: string, cost: number) => void;
  onToggleLink: (linkId: string) => void;
  onSelectFailureScenario: (scenario: string) => void;
}

export function OspfConfigPanel({
  routers,
  links,
  topologyPreset = "diamond",
  rootRouterId = "R1",
  validationErrors,
  onSelectTopologyPreset,
  onSelectRootRouter,
  onUpdateRouter,
  onUpdateLinkCost,
  onToggleLink,
  onSelectFailureScenario,
}: OspfConfigPanelProps) {
  return (
    <div className="space-y-4">
      {/* 1. Topology Preset Chooser */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Network Topology Presets</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "diamond", name: "Diamond 4-Router", desc: "Area 0 ECMP Multi-Path" },
              { id: "ring", name: "Redundant Ring 5R", desc: "5-Node Loop Failover" },
              { id: "multi-area", name: "Multi-Area Hierarchy", desc: "Area 0 + Area 1 ABR" },
              { id: "triangle", name: "Triangle 3-Router", desc: "3-Node Direct Cost Mesh" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() =>
                  onSelectTopologyPreset?.(
                    p.id as "diamond" | "ring" | "multi-area" | "triangle"
                  )
                }
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  topologyPreset === p.id
                    ? "bg-primary/15 border-primary text-primary"
                    : "bg-secondary/40 border-border hover:bg-accent/40 text-muted-foreground"
                }`}
              >
                <span className="font-semibold text-xs text-foreground block">{p.name}</span>
                <span className="text-[11px] text-muted-foreground">{p.desc}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2. Validation Errors Banner */}
      {validationErrors.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/10">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <CardTitle className="text-sm text-amber-400">
                OSPF Configuration Diagnosis ({validationErrors.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {validationErrors.map((err) => (
              <div key={err.id} className="p-2 bg-card/60 rounded border border-amber-500/20">
                <span className="font-semibold text-amber-300 block">{err.title}</span>
                <p className="text-muted-foreground mt-0.5">{err.message}</p>
                <p className="text-primary mt-1 font-mono text-[11px]">→ {err.recommendation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 3. Root Router & User Failure Scenarios */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">User Conditions & SPF Root Selection</CardTitle>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">SPF Root:</Label>
              <select
                value={rootRouterId}
                onChange={(e) => onSelectRootRouter?.(e.target.value)}
                className="bg-slate-900 border border-border rounded px-2 py-1 text-xs font-mono text-primary"
              >
                {routers.map((r) => (
                  <option key={r.nodeId} value={r.nodeId}>
                    {r.nodeId} ({r.routerId})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => onSelectFailureScenario("none")}>
            Normal Condition (Optimal Cost)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectFailureScenario("r2_r4_cost_high")}
          >
            High Cost on R2-R4 (Cost: 50)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectFailureScenario("r2_r4_break")}
          >
            Break Link R2-R4 (Failover)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectFailureScenario("ring_break")}
          >
            Break Ring Link R1-R2
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectFailureScenario("abr_failure")}
          >
            ABR Router R2 Failure
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectFailureScenario("area_mismatch")}
          >
            Area ID Mismatch
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectFailureScenario("timer_mismatch")}
          >
            Hello/Dead Timer Mismatch
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectFailureScenario("duplicate_rid")}
          >
            Duplicate Router ID Conflict
          </Button>
        </CardContent>
      </Card>

      {/* 4. Interactive Link Costs & Physical State Customizer */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Link Metrics & Up/Down Condition Customizer</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            {links.map((link) => (
              <div key={link.id} className="p-3 bg-secondary/40 rounded-lg border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-foreground">
                    {link.sourceRouterId} ↔ {link.targetRouterId} ({link.id})
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">
                      {link.enabled ? "UP" : "DOWN"}
                    </span>
                    <Switch
                      checked={link.enabled}
                      onCheckedChange={() => onToggleLink(link.id)}
                      aria-label={`Toggle link ${link.id}`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-[11px] text-muted-foreground w-16">Link Cost:</Label>
                  <Input
                    type="number"
                    min={1}
                    max={65535}
                    value={link.cost}
                    onChange={(e) => onUpdateLinkCost(link.id, Number(e.target.value))}
                    className="h-7 text-xs font-mono w-24"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    (Lower = preferred)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 5. Router Identity & Timers Customizer */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Router Identity & Area Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            {routers.map((router) => (
              <div key={router.nodeId} className="p-3 bg-secondary/40 rounded-lg border border-border space-y-2">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-primary">{router.name}</span>
                  <span className="text-[11px] text-muted-foreground">Area: {router.areaId}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[11px] text-muted-foreground block mb-1">Router ID</Label>
                    <Input
                      value={router.routerId}
                      onChange={(e) => onUpdateRouter(router.nodeId, { routerId: e.target.value })}
                      className="h-7 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground block mb-1">Area ID</Label>
                    <Input
                      value={router.areaId}
                      onChange={(e) => onUpdateRouter(router.nodeId, { areaId: e.target.value })}
                      className="h-7 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import React from "react";
import { Label, Input, Button, Switch, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Network, Sliders, AlertTriangle } from "lucide-react";
import type { BgpRouter, BgpLink } from "@/features/protocols/bgp/bgp.types";
import type { BgpValidationError } from "@/features/protocols/bgp/bgp.validators";

interface BgpConfigPanelProps {
  routers: BgpRouter[];
  links: BgpLink[];
  topologyPreset?: string;
  validationErrors: BgpValidationError[];
  onSelectTopologyPreset?: (preset: "multi-homed" | "tier1-hub" | "triangle" | "ibgp-ebgp") => void;
  onUpdatePeerAttribute: (
    routerNodeId: string,
    peerId: string,
    field: "localPreference" | "med" | "asPathPrependCount" | "remoteAsn",
    value: number
  ) => void;
  onToggleLink: (linkId: string) => void;
  onSelectFailureScenario: (scenario: string) => void;
}

export function BgpConfigPanel({
  routers,
  links,
  topologyPreset = "multi-homed",
  validationErrors,
  onSelectTopologyPreset,
  onUpdatePeerAttribute,
  onToggleLink,
  onSelectFailureScenario,
}: BgpConfigPanelProps) {
  const r1 = routers.find((r) => r.nodeId === "R1" || r.nodeId === "R1A");

  return (
    <div className="space-y-4">
      {/* 1. Topology Preset Chooser */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Autonomous System Topologies</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "multi-homed", name: "Dual-Homed 4AS", desc: "Enterprise Dual-ISP Transit" },
              { id: "tier1-hub", name: "Tier-1 Hub 5AS", desc: "Backbone Interconnect" },
              { id: "triangle", name: "Triangle Peering", desc: "3-AS Direct vs Transit" },
              { id: "ibgp-ebgp", name: "iBGP + eBGP", desc: "Internal Mesh + Border" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() =>
                  onSelectTopologyPreset?.(
                    p.id as "multi-homed" | "tier1-hub" | "triangle" | "ibgp-ebgp"
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

      {/* 2. Validation Diagnosis Banner */}
      {validationErrors.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/10">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <CardTitle className="text-sm text-amber-400">
                BGP Configuration Diagnosis ({validationErrors.length})
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

      {/* 3. Predefined Scenarios & Injections */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">BGP Policy & Outage Conditions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => onSelectFailureScenario("none")}>
            Normal Condition (LOCAL_PREF 200 vs 100)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectFailureScenario("as_path_prepend_as65002")}
          >
            AS-Path Prepend on AS 65002 (3x)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectFailureScenario("break_as65001_as65002")}
          >
            Break Peering AS 65001 ↔ AS 65002
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectFailureScenario("tier1_failover")}
          >
            Transit Link Outage (Failover)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectFailureScenario("withdraw_prefix")}
          >
            Withdraw Prefix 203.0.113.0/24
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectFailureScenario("invalid_remote_asn")}
          >
            Remote ASN Mismatch
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectFailureScenario("med_influence")}
          >
            MED Metric Influence (50 vs 200)
          </Button>
        </CardContent>
      </Card>

      {/* 4. Policy Traffic Engineering Controls (LOCAL_PREF, MED, AS_PATH) */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">{r1?.name ?? "Customer Router"} — Inbound Path Policy Tuner</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            {r1?.peers.map((peer) => (
              <div key={peer.id} className="p-3 bg-secondary/40 border border-border rounded-lg space-y-2">
                <span className="font-semibold text-primary block">
                  {peer.name} (Remote AS {peer.remoteAsn})
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[11px] text-muted-foreground block mb-1">LOCAL_PREF</Label>
                    <Input
                      type="number"
                      min={0}
                      max={1000}
                      value={peer.localPreference ?? 100}
                      onChange={(e) =>
                        onUpdatePeerAttribute(r1.nodeId, peer.id, "localPreference", Number(e.target.value))
                      }
                      className="h-7 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground block mb-1">MED</Label>
                    <Input
                      type="number"
                      min={0}
                      max={1000}
                      value={peer.med ?? 0}
                      onChange={(e) =>
                        onUpdatePeerAttribute(r1.nodeId, peer.id, "med", Number(e.target.value))
                      }
                      className="h-7 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[11px] text-muted-foreground block mb-1">
                    AS-Path Prepend Multiplier ({peer.asPathPrependCount ?? 0}x)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={peer.asPathPrependCount ?? 0}
                    onChange={(e) =>
                      onUpdatePeerAttribute(r1.nodeId, peer.id, "asPathPrependCount", Number(e.target.value))
                    }
                    className="h-7 text-xs font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 5. Physical Peering Links State Customizer */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Physical Peering Links State</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            {links.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-2.5 bg-secondary/40 rounded-lg border border-border">
                <span className="font-mono font-medium">
                  {link.id} (AS{link.sourceAsn} ↔ AS{link.targetAsn})
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-[11px]">
                    {link.enabled ? "UP" : "DOWN"}
                  </span>
                  <Switch
                    checked={link.enabled}
                    onCheckedChange={() => onToggleLink(link.id)}
                    aria-label={`Toggle link ${link.id}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

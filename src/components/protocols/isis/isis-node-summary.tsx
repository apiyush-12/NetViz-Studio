"use client";

import React from "react";
import {
  Network,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Zap,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import type { IsisNode } from "@/features/protocols/isis/isis.types";

interface IsisNodeSummaryProps {
  node: IsisNode;
}

export function IsisNodeSummary({ node }: IsisNodeSummaryProps) {
  const getLevelBadge = (level: IsisNode["routerLevel"]) => {
    switch (level) {
      case "L1":
        return <Badge variant="default" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">Level 1 (Intra-Area)</Badge>;
      case "L2":
        return <Badge variant="default" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">Level 2 (Backbone)</Badge>;
      case "L1_L2":
      default:
        return <Badge variant="default" className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]">Level 1/2 Border Router</Badge>;
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="py-3 px-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Network className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                {node.name}
                <span className="text-xs font-mono font-normal text-muted-foreground">({node.systemId})</span>
              </CardTitle>
              <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                NET: <strong className="text-foreground">{node.netAddress}</strong>
              </div>
            </div>
          </div>
          {getLevelBadge(node.routerLevel)}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3.5 text-xs font-sans">
        {/* OSI Address Details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center font-mono">
          <div className="p-2 rounded-md bg-secondary/30 border border-border/40">
            <span className="text-[10px] text-muted-foreground block font-sans">AREA ID</span>
            <span className="font-bold text-foreground">{node.areaId}</span>
          </div>
          <div className="p-2 rounded-md bg-secondary/30 border border-border/40">
            <span className="text-[10px] text-muted-foreground block font-sans">SYSTEM ID</span>
            <span className="font-bold text-blue-400">{node.systemId}</span>
          </div>
          <div className="p-2 rounded-md bg-secondary/30 border border-border/40">
            <span className="text-[10px] text-muted-foreground block font-sans">N-SELECTOR</span>
            <span className="font-bold text-purple-400">00 (IS Router)</span>
          </div>
        </div>

        {/* Flag Status Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Attached Bit (ATT) */}
          <div className="flex items-center justify-between p-2 rounded-md bg-secondary/20 border border-border/40">
            <div className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-blue-400" />
              <span className="font-semibold text-foreground text-[11px]">Attached Bit (ATT):</span>
            </div>
            <Badge
              variant="outline"
              className={
                node.attachedBit
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]"
                  : "bg-slate-500/20 text-slate-400 border-slate-500/30 text-[10px]"
              }
            >
              {node.attachedBit ? "ATT = 1 (L2 Gateway)" : "ATT = 0"}
            </Badge>
          </div>

          {/* Overload Bit (OL) */}
          <div className="flex items-center justify-between p-2 rounded-md bg-secondary/20 border border-border/40">
            <div className="flex items-center gap-1.5">
              {node.overloadBit ? (
                <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              )}
              <span className="font-semibold text-foreground text-[11px]">Overload (OL-Bit):</span>
            </div>
            <Badge
              variant="outline"
              className={
                node.overloadBit
                  ? "bg-red-500/20 text-red-400 border-red-500/30 text-[10px]"
                  : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]"
              }
            >
              {node.overloadBit ? "OL = 1 (Transit Bypassed)" : "OL = 0 (Normal)"}
            </Badge>
          </div>
        </div>

        {/* Interface Circuits */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            IS-IS Interface Circuits ({node.interfaces.length})
          </span>
          <div className="space-y-1">
            {node.interfaces.map((iface) => (
              <div
                key={iface.id}
                className="p-2 rounded-md bg-secondary/15 border border-border/30 flex items-center justify-between font-mono text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{iface.name}</span>
                  <span className="text-muted-foreground">({iface.ipAddress})</span>
                  <Badge variant="outline" className="text-[9px] bg-secondary/30">
                    {iface.circuitType.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] bg-purple-500/10 text-purple-400 border-purple-500/20">
                    {iface.level}
                  </Badge>
                  {iface.isDis && (
                    <Badge variant="default" className="text-[9px] bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1">
                      <Zap className="h-2.5 w-2.5" /> DIS
                    </Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    Metric: {iface.metric}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import React from "react";
import {
  Network,
  Clock,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import type { RipNode } from "@/features/protocols/rip/rip.types";

interface RipNodeSummaryProps {
  node: RipNode;
}

export function RipNodeSummary({ node }: RipNodeSummaryProps) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="py-3 px-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Network className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                {node.name}
                <span className="text-xs font-mono font-normal text-muted-foreground">({node.id})</span>
              </CardTitle>
              <div className="text-[11px] text-muted-foreground font-mono">
                Router ID: <strong className="text-foreground">{node.ipAddress}</strong>
              </div>
            </div>
          </div>
          <Badge
            variant="default"
            className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]"
          >
            RIP Router
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3.5 text-xs">
        {/* Timers & Split Horizon Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="p-2 rounded-md bg-secondary/30 border border-border/40">
            <span className="text-[10px] text-muted-foreground block font-mono">UPDATE TIMER</span>
            <span className="font-mono font-bold text-foreground">{node.timers.update}s</span>
          </div>
          <div className="p-2 rounded-md bg-secondary/30 border border-border/40">
            <span className="text-[10px] text-muted-foreground block font-mono">INVALID TIMER</span>
            <span className="font-mono font-bold text-amber-400">{node.timers.invalid}s</span>
          </div>
          <div className="p-2 rounded-md bg-secondary/30 border border-border/40">
            <span className="text-[10px] text-muted-foreground block font-mono">HOLDDOWN</span>
            <span className="font-mono font-bold text-purple-400">{node.timers.holddown}s</span>
          </div>
          <div className="p-2 rounded-md bg-secondary/30 border border-border/40">
            <span className="text-[10px] text-muted-foreground block font-mono">FLUSH TIMER</span>
            <span className="font-mono font-bold text-red-400">{node.timers.flush}s</span>
          </div>
        </div>

        {/* Feature State */}
        <div className="flex items-center justify-between p-2.5 rounded-md bg-secondary/20 border border-border/40">
          <div className="flex items-center gap-2">
            {node.splitHorizonEnabled ? (
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-red-400" />
            )}
            <span className="font-semibold text-foreground">Split Horizon State:</span>
          </div>
          <Badge
            variant="outline"
            className={
              node.splitHorizonEnabled
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-red-500/10 text-red-400 border-red-500/30"
            }
          >
            {node.splitHorizonEnabled
              ? node.poisonReverseEnabled
                ? "Poison Reverse Enabled"
                : "Split Horizon Only"
              : "DISABLED (Risk of Loops)"}
          </Badge>
        </div>

        {/* Interface List */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Configured RIP Interfaces ({node.interfaces.length})
          </span>
          <div className="space-y-1">
            {node.interfaces.map((iface) => (
              <div
                key={iface.id}
                className="p-2 rounded-md bg-secondary/15 border border-border/30 flex items-center justify-between font-mono text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{iface.name}</span>
                  <span className="text-muted-foreground">({iface.ipAddress}/{iface.subnetMask})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {iface.passive ? (
                    <Badge variant="outline" className="text-[9px] bg-secondary/40 text-muted-foreground">
                      Passive LAN
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[9px] bg-blue-500/10 text-blue-400 border-blue-500/20">
                      RIP Active
                    </Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Cost: {iface.cost}
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

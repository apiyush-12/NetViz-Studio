"use client";

import React from "react";
import { Crown, Clock, HardDrive } from "lucide-react";
import { Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import type { StpSwitchNode } from "@/features/protocols/stp/stp.types";
import { formatBridgeId } from "@/features/protocols/stp/stp-engine";

interface StpBridgeSummaryProps {
  selectedSwitch: StpSwitchNode;
}

export function StpBridgeSummary({
  selectedSwitch,
}: StpBridgeSummaryProps) {
  const isRoot = selectedSwitch.isRoot;

  return (
    <Card className="border-border bg-card/60 backdrop-blur-sm shadow-sm">
      <CardHeader className="p-3 pb-2 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-md ${
                isRoot
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
              }`}
            >
              {isRoot ? <Crown className="h-4 w-4" /> : <HardDrive className="h-4 w-4" />}
            </div>
            <div>
              <CardTitle className="text-xs font-bold text-foreground">
                {selectedSwitch.name}
              </CardTitle>
              <p className="text-[10px] text-muted-foreground font-mono">
                {selectedSwitch.bridgeId.macAddress}
              </p>
            </div>
          </div>
          {isRoot ? (
            <Badge
              variant="default"
              className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] gap-1 font-semibold"
            >
              <Crown className="h-3 w-3" /> ROOT BRIDGE
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
              Non-Root Bridge
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-3 text-xs">
        {/* Bridge ID Matrix */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-secondary/30 border border-border/50 space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
              Bridge ID (BID)
            </span>
            <div className="font-mono text-xs font-bold text-foreground">
              {formatBridgeId(selectedSwitch.bridgeId)}
            </div>
            <div className="text-[9px] text-muted-foreground">
              Pri: {selectedSwitch.bridgeId.priority} + SysID: {selectedSwitch.bridgeId.sysIdExtension}
            </div>
          </div>

          <div className="p-2 rounded-lg bg-secondary/30 border border-border/50 space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
              Root Bridge ID
            </span>
            <div className="font-mono text-xs font-bold text-amber-400">
              {formatBridgeId(selectedSwitch.rootBridgeId)}
            </div>
            <div className="text-[9px] text-muted-foreground">
              {isRoot ? "This Bridge is Root" : `Root Port: ${selectedSwitch.rootPortId || "None"}`}
            </div>
          </div>
        </div>

        {/* Cost & Root Port Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg bg-secondary/20 border border-border/40 text-center">
            <div className="text-[10px] text-muted-foreground">Root Path Cost</div>
            <div className="text-sm font-bold font-mono text-foreground">
              {selectedSwitch.rootPathCost}
            </div>
          </div>

          <div className="p-2 rounded-lg bg-secondary/20 border border-border/40 text-center">
            <div className="text-[10px] text-muted-foreground">CAM Aging</div>
            <div
              className={`text-sm font-bold font-mono ${
                selectedSwitch.camAgingTime === 15 ? "text-amber-400 animate-pulse" : "text-foreground"
              }`}
            >
              {selectedSwitch.camAgingTime}s
            </div>
          </div>

          <div className="p-2 rounded-lg bg-secondary/20 border border-border/40 text-center">
            <div className="text-[10px] text-muted-foreground">TC Flag</div>
            <div className="text-sm font-bold font-mono">
              {selectedSwitch.topologyChangeFlag ? (
                <span className="text-rose-400">ACTIVE</span>
              ) : (
                <span className="text-emerald-400">CLEARED</span>
              )}
            </div>
          </div>
        </div>

        {/* Protocol Timers IEEE 802.1D */}
        <div className="p-2 rounded-lg bg-secondary/30 border border-border/50 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Active Protocol Timers
            </span>
            <span className="text-[9px] text-muted-foreground font-mono">IEEE 802.1D</span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-center font-mono text-[11px]">
            <div className="bg-background/40 p-1 rounded border border-border/30">
              <span className="text-[9px] block text-muted-foreground">Hello</span>
              <span className="font-bold text-foreground">{selectedSwitch.helloTimer}s</span>
            </div>
            <div className="bg-background/40 p-1 rounded border border-border/30">
              <span className="text-[9px] block text-muted-foreground">Max Age</span>
              <span className="font-bold text-foreground">{selectedSwitch.maxAge}s</span>
            </div>
            <div className="bg-background/40 p-1 rounded border border-border/30">
              <span className="text-[9px] block text-muted-foreground">Fwd Delay</span>
              <span className="font-bold text-foreground">{selectedSwitch.forwardDelay}s</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

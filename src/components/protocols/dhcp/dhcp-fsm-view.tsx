"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { DhcpFsmStep } from "@/features/protocols/dhcp/dhcp.fsm";
import type { DhcpClientState, DhcpPool } from "@/features/protocols/dhcp/dhcp.types";

interface DhcpFsmViewProps {
  currentState?: DhcpClientState;
  fsmSteps: DhcpFsmStep[];
  pool: DhcpPool;
}

const ALL_STATES: Array<{ state: DhcpClientState; name: string; desc: string }> = [
  { state: "INIT", name: "INIT", desc: "No IP configuration. Broadcasts DHCPDISCOVER." },
  { state: "SELECTING", name: "SELECTING", desc: "Awaiting DHCPOFFERs from servers." },
  { state: "REQUESTING", name: "REQUESTING", desc: "Broadcasts DHCPREQUEST to choose server." },
  { state: "BOUND", name: "BOUND", desc: "Lease committed. Interface fully configured." },
  { state: "RENEWING", name: "RENEWING (T1)", desc: "Unicast request at 50% lease time." },
  { state: "REBINDING", name: "REBINDING (T2)", desc: "Broadcast request at 87.5% lease time." },
  { state: "RELEASE", name: "RELEASE", desc: "Graceful surrender of active lease." },
  { state: "DECLINE", name: "DECLINE", desc: "Refused lease due to ARP conflict." },
];

export function DhcpFsmView({
  currentState = "BOUND",
  fsmSteps,
  pool,
}: DhcpFsmViewProps) {
  return (
    <div className="space-y-4">
      {/* 1. Client FSM State Badges Grid */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Client Finite State Machine (RFC 2131)</CardTitle>
            <Badge variant="default" className="font-mono text-xs">
              Current: {currentState}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ALL_STATES.map((s) => {
              const isActive = currentState === s.state;
              return (
                <div
                  key={s.state}
                  className={cn(
                    "p-2.5 rounded-lg border text-left transition-all",
                    isActive
                      ? "bg-primary/15 border-primary ring-1 ring-primary shadow-sm"
                      : "bg-secondary/40 border-border opacity-70"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "font-mono font-bold text-xs",
                        isActive ? "text-primary" : "text-foreground"
                      )}
                    >
                      {s.name}
                    </span>
                    {isActive && (
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 2. Lease Timers (T1 & T2) Visualizer */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Lease Lifespan & Timer Thresholds</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative h-6 bg-secondary/70 rounded-full overflow-hidden border border-border flex items-center">
            {/* 0% to 50% Bound phase */}
            <div className="h-full bg-emerald-500/30 w-1/2 border-r border-emerald-500/50 flex items-center justify-center text-[10px] font-mono text-emerald-300">
              BOUND (0% → 50%)
            </div>
            {/* 50% to 87.5% Renewing phase */}
            <div className="h-full bg-amber-500/30 w-[37.5%] border-r border-amber-500/50 flex items-center justify-center text-[10px] font-mono text-amber-300">
              RENEWING (T1: 50% → 87.5%)
            </div>
            {/* 87.5% to 100% Rebinding phase */}
            <div className="h-full bg-rose-500/30 w-[12.5%] flex items-center justify-center text-[10px] font-mono text-rose-300">
              T2 (87.5% → 100%)
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
            <div className="p-2 bg-secondary/40 rounded border border-border">
              <span className="text-muted-foreground block text-[10px]">T1 (Renewal - Unicast)</span>
              <span className="font-bold text-amber-400">{pool.t1Seconds}s (50%)</span>
            </div>
            <div className="p-2 bg-secondary/40 rounded border border-border">
              <span className="text-muted-foreground block text-[10px]">T2 (Rebinding - Broadcast)</span>
              <span className="font-bold text-rose-400">{pool.t2Seconds}s (87.5%)</span>
            </div>
            <div className="p-2 bg-secondary/40 rounded border border-border">
              <span className="text-muted-foreground block text-[10px]">Total Lease Duration</span>
              <span className="font-bold text-emerald-400">{pool.leaseDurationSeconds}s (100%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Transition Steps Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">FSM Transition Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-border text-left font-sans text-muted-foreground">
                  <th className="py-2">Step</th>
                  <th className="py-2">From State</th>
                  <th className="py-2">Trigger Event</th>
                  <th className="py-2">To State</th>
                  <th className="py-2">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {fsmSteps.map((step) => (
                  <tr key={step.stepIndex} className="hover:bg-accent/40">
                    <td className="py-2 font-bold text-primary">{step.stepIndex}</td>
                    <td className="py-2">
                      <Badge variant="outline" className="text-[10px]">
                        {step.fromState}
                      </Badge>
                    </td>
                    <td className="py-2 text-foreground font-sans">{step.trigger}</td>
                    <td className="py-2">
                      <Badge variant="default" className="text-[10px]">
                        {step.toState}
                      </Badge>
                    </td>
                    <td className="py-2 text-muted-foreground font-sans text-[11px]">
                      {step.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

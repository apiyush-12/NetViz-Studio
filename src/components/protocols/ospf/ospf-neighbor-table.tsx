"use client";

import React, { useState } from "react";
import { Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { OspfRouter, OspfNeighborState } from "@/features/protocols/ospf/ospf.types";
import { OSPF_NEIGHBOR_STATE_EXPLANATIONS } from "@/features/protocols/ospf/ospf.neighbors";

const NEIGHBOR_FSM_STATES: OspfNeighborState[] = [
  "down",
  "init",
  "2-way",
  "exstart",
  "exchange",
  "loading",
  "full",
];

interface OspfNeighborTableProps {
  router: OspfRouter;
  allRouters?: OspfRouter[];
}

export function OspfNeighborTable({ router }: OspfNeighborTableProps) {
  const [selectedState, setSelectedState] = useState<OspfNeighborState>("full");
  const stateDetails = OSPF_NEIGHBOR_STATE_EXPLANATIONS[selectedState];

  return (
    <div className="space-y-4">
      {/* Neighbor Adjacency Table */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">
            {router.name} ({router.routerId}) — Neighbor Adjacencies
          </CardTitle>
          <Badge variant="outline">{router.neighbors.length} Neighbors</Badge>
        </CardHeader>
        <CardContent>
          {router.neighbors.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              No active OSPF neighbors discovered. Check links, Area ID, and timers.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-left">
                    <th className="py-2">Neighbor RID</th>
                    <th className="py-2">Neighbor IP</th>
                    <th className="py-2">Local Interface</th>
                    <th className="py-2">State</th>
                    <th className="py-2">Role</th>
                    <th className="py-2">Dead Timer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono">
                  {router.neighbors.map((n) => (
                    <tr key={n.neighborId} className="hover:bg-accent/30 transition-colors">
                      <td className="py-2 font-medium text-primary">{n.neighborId}</td>
                      <td className="py-2 text-muted-foreground">{n.neighborIp}</td>
                      <td className="py-2 text-muted-foreground">{n.interfaceName}</td>
                      <td className="py-2">
                        <button
                          onClick={() => setSelectedState(n.state)}
                          className={cn(
                            "px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider cursor-pointer border",
                            n.state === "full"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"
                              : "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30"
                          )}
                        >
                          {n.state}
                        </button>
                      </td>
                      <td className="py-2 text-muted-foreground">{n.role}</td>
                      <td className="py-2 text-muted-foreground">{n.deadTimer}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 7-State Neighbor FSM Visualizer */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">OSPF Neighbor State Machine (FSM)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {NEIGHBOR_FSM_STATES.map((state, idx) => {
              const isSelected = selectedState === state;
              const hasNeighborInState = router.neighbors.some((n) => n.state === state);

              return (
                <React.Fragment key={state}>
                  <button
                    onClick={() => setSelectedState(state)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : hasNeighborInState
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                          : "bg-secondary text-muted-foreground border-border hover:bg-accent"
                    )}
                  >
                    {state.toUpperCase()}
                  </button>
                  {idx < NEIGHBOR_FSM_STATES.length - 1 && (
                    <span className="text-muted-foreground text-xs font-mono">→</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Interactive State Deep Dive Card */}
          {stateDetails && (
            <div className="p-3 bg-secondary/40 border border-border rounded-lg space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-primary">{stateDetails.summary}</span>
                <Badge variant="outline">RFC 2328 State</Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed">{stateDetails.meaning}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 border-t border-border/50 text-[11px]">
                <div>
                  <span className="text-muted-foreground block font-medium">Previous:</span>
                  <span>{stateDetails.previous}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Next:</span>
                  <span>{stateDetails.next}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Potential Issue:</span>
                  <span className="text-amber-400">{stateDetails.stuckReason}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { BgpRouter, BgpSessionState } from "@/features/protocols/bgp/bgp.types";
import { BGP_SESSION_STATE_EXPLANATIONS } from "@/features/protocols/bgp/bgp.sessions";

const BGP_FSM_STATES: BgpSessionState[] = [
  "idle",
  "connect",
  "active",
  "opensent",
  "openconfirm",
  "established",
];

interface BgpPeerTableProps {
  router: BgpRouter;
  allRouters?: BgpRouter[];
}

export function BgpPeerTable({ router }: BgpPeerTableProps) {
  const [selectedState, setSelectedState] = useState<BgpSessionState>("established");
  const stateDetails = BGP_SESSION_STATE_EXPLANATIONS[selectedState];

  return (
    <div className="space-y-4">
      {/* Active Peering Sessions Table */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">
            {router.name} (AS {router.localAsn}) — BGP Peering Sessions
          </CardTitle>
          <Badge variant="outline">{router.peers.length} Peers Configured</Badge>
        </CardHeader>
        <CardContent>
          {router.peers.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">No BGP peers configured.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-left">
                    <th className="py-2">Neighbor Name</th>
                    <th className="py-2">Neighbor IP</th>
                    <th className="py-2">Remote AS</th>
                    <th className="py-2">Session State</th>
                    <th className="py-2">Hold Time</th>
                    <th className="py-2">Prefixes Rcvd</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono">
                  {router.peers.map((peer) => (
                    <tr key={peer.id} className="hover:bg-accent/30 transition-colors">
                      <td className="py-2 font-medium text-primary font-sans">{peer.name}</td>
                      <td className="py-2 text-muted-foreground">{peer.neighborIp}</td>
                      <td className="py-2 text-foreground font-semibold">AS {peer.remoteAsn}</td>
                      <td className="py-2">
                        <button
                          onClick={() => setSelectedState(peer.state)}
                          className={cn(
                            "px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider cursor-pointer border",
                            peer.state === "established"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"
                              : "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30"
                          )}
                        >
                          {peer.state}
                        </button>
                      </td>
                      <td className="py-2 text-muted-foreground">{peer.holdTime}s</td>
                      <td className="py-2 text-muted-foreground">{peer.receivedPrefixes.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 6-State BGP Peering FSM Visualizer */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">BGP Finite State Machine (FSM)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {BGP_FSM_STATES.map((state, idx) => {
              const isSelected = selectedState === state;
              const hasPeerInState = router.peers.some((p) => p.state === state);

              return (
                <React.Fragment key={state}>
                  <button
                    onClick={() => setSelectedState(state)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : hasPeerInState
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                          : "bg-secondary text-muted-foreground border-border hover:bg-accent"
                    )}
                  >
                    {state.toUpperCase()}
                  </button>
                  {idx < BGP_FSM_STATES.length - 1 && (
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
                <Badge variant="outline">RFC 4271 State</Badge>
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

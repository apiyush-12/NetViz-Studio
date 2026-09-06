"use client";

import React, { useState } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { Scale, X, Zap, Layers } from "lucide-react";

export function StpRstpComparisonModal() {
  const [isOpen, setIsOpen] = useState(false);

  const comparisonRows = [
    {
      dimension: "IEEE Standard & Year",
      stp: "IEEE 802.1D (1990 / 1998)",
      rstp: "IEEE 802.1w (2001) / 802.1D-2004",
      mstp: "IEEE 802.1s (2002) / 802.1Q-2005",
    },
    {
      dimension: "Convergence Time",
      stp: "30 – 50 seconds (Timer-based delay)",
      rstp: "< 1 second (~10–50 ms explicit handshake)",
      mstp: "< 1 second (~10–50 ms per region)",
    },
    {
      dimension: "Port Operational States",
      stp: "5 States: Disabled, Blocking, Listening, Learning, Forwarding",
      rstp: "3 States: Discarding, Learning, Forwarding",
      mstp: "3 States: Discarding, Learning, Forwarding",
    },
    {
      dimension: "Port Roles",
      stp: "Root Port (RP), Designated Port (DP), Non-Designated / Blocked",
      rstp: "Root Port, Designated Port, Alternate Port (AP), Backup Port (BP), Disabled",
      mstp: "Master Port, Regional Root, Designated, Alternate, Backup",
    },
    {
      dimension: "Convergence Mechanism",
      stp: "Passive Timer Wait: 20s MaxAge + 15s Listening + 15s Learning",
      rstp: "Active Proposal / Agreement Handshake on Point-to-Point links",
      mstp: "Active Proposal / Agreement per MSTI instance within CST",
    },
    {
      dimension: "BPDU Format & Version",
      stp: "Version 0 (Config BPDU 0x00, TCN BPDU 0x80, only 2 flag bits used)",
      rstp: "Version 2 (RSTP BPDU 0x02, all 8 flag bits utilized)",
      mstp: "Version 3 (MSTP BPDU with M-records per instance)",
    },
    {
      dimension: "Topology Change (TC) Handling",
      stp: "TCN generated upstream to Root; Root broadcasts TC; 15s CAM aging",
      rstp: "Direct TC broadcast flooded out all non-edge ports; instant CAM flush",
      mstp: "Instance-isolated TC flooding; independent per VLAN group",
    },
    {
      dimension: "Edge / Host Port Support",
      stp: "Proprietary Cisco PortFast feature required",
      rstp: "Standardized Edge Port (AdminEdge / AutoEdge)",
      mstp: "Standardized Edge Port per region",
    },
    {
      dimension: "VLAN Topology Support",
      stp: "Single Common Spanning Tree (CST) across all VLANs",
      rstp: "CST or Cisco Rapid-PVST+ (1 STP instance per VLAN)",
      mstp: "Maps multiple VLANs to instances (MSTI), saving CPU/memory",
    },
    {
      dimension: "Backwards Compatibility",
      stp: "Legacy Baseline",
      rstp: "100% Backwards compatible (falls back to 802.1D on legacy ports)",
      mstp: "Backwards compatible with RSTP and 802.1D STP",
    },
  ];

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/10 cursor-pointer"
      >
        <Scale className="h-3.5 w-3.5" />
        STP vs RSTP vs MSTP
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <Card className="w-full max-w-5xl max-h-[90vh] flex flex-col border-border bg-card shadow-2xl overflow-hidden">
            <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between shrink-0 bg-secondary/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Spanning Tree Protocol Evolution: STP vs RSTP vs MSTP
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Architectural comparison of IEEE 802.1D, IEEE 802.1w Rapid STP, and IEEE 802.1s Multiple STP
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>

            <CardContent className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-border/70 bg-secondary/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-xs">Classic STP (802.1D)</span>
                    <Badge variant="outline" className="text-[10px] font-mono">1990</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Reliable loop prevention using fixed 30-50 second Forward Delay timers. Suitable for legacy networks but slow for modern real-time voice and video traffic.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-cyan-500/40 bg-cyan-500/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400 text-xs flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5" /> Rapid STP (802.1w)
                    </span>
                    <Badge variant="default" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[10px] font-mono">
                      Sub-Second
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Replaces passive timers with an active point-to-point Proposal/Agreement handshake. Delivers 10-50ms failover and fast-forwarding edge ports.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-purple-500/40 bg-purple-500/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-400 text-xs flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" /> Multiple STP (802.1s)
                    </span>
                    <Badge variant="default" className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-[10px] font-mono">
                      VLAN Groups
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Groups hundreds of VLANs into a few Spanning Tree Instances (MSTIs), balancing traffic across multiple uplinks while saving switch CPU cycles.
                  </p>
                </div>
              </div>

              {/* Comprehensive Comparison Table */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-secondary/40 text-[11px] font-semibold text-muted-foreground uppercase">
                        <th className="p-3 w-1/4">Dimension</th>
                        <th className="p-3 w-1/4 text-foreground">Classic STP (802.1D)</th>
                        <th className="p-3 w-1/4 text-cyan-400">Rapid STP (802.1w)</th>
                        <th className="p-3 w-1/4 text-purple-400">Multiple STP (802.1s)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {comparisonRows.map((row, i) => (
                        <tr
                          key={row.dimension}
                          className={i % 2 === 0 ? "bg-background/40" : "bg-secondary/15"}
                        >
                          <td className="p-3 font-semibold text-foreground">{row.dimension}</td>
                          <td className="p-3 text-muted-foreground font-mono text-[11px]">{row.stp}</td>
                          <td className="p-3 text-foreground font-mono text-[11px] font-semibold">{row.rstp}</td>
                          <td className="p-3 text-muted-foreground font-mono text-[11px]">{row.mstp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Port State Transition Mapping */}
              <div className="p-3 rounded-xl border border-border bg-secondary/20 space-y-2">
                <h4 className="font-bold text-foreground text-xs">
                  802.1D to 802.1w State Simplification Mapping
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-center text-[11px]">
                  <div className="p-2 rounded-lg bg-background border border-border/50">
                    <div className="text-[10px] text-muted-foreground font-sans">802.1D States:</div>
                    <div className="text-amber-400 font-bold">Disabled + Blocking + Listening</div>
                    <div className="text-[10px] text-muted-foreground font-sans mt-1">Maps to 802.1w:</div>
                    <div className="text-foreground font-bold bg-secondary/40 py-0.5 rounded">Discarding</div>
                  </div>

                  <div className="p-2 rounded-lg bg-background border border-border/50">
                    <div className="text-[10px] text-muted-foreground font-sans">802.1D State:</div>
                    <div className="text-cyan-400 font-bold">Learning</div>
                    <div className="text-[10px] text-muted-foreground font-sans mt-1">Maps to 802.1w:</div>
                    <div className="text-cyan-400 font-bold bg-secondary/40 py-0.5 rounded">Learning</div>
                  </div>

                  <div className="p-2 rounded-lg bg-background border border-border/50">
                    <div className="text-[10px] text-muted-foreground font-sans">802.1D State:</div>
                    <div className="text-emerald-400 font-bold">Forwarding</div>
                    <div className="text-[10px] text-muted-foreground font-sans mt-1">Maps to 802.1w:</div>
                    <div className="text-emerald-400 font-bold bg-secondary/40 py-0.5 rounded">Forwarding</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

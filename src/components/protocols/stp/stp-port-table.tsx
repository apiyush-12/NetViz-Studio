"use client";

import React from "react";
import { ShieldCheck, Zap, AlertOctagon } from "lucide-react";
import { Badge } from "@/components/ui";
import type { StpPort, StpPortRole, StpPortState } from "@/features/protocols/stp/stp.types";
import { formatBridgeId } from "@/features/protocols/stp/stp-engine";

interface StpPortTableProps {
  ports: StpPort[];
  onSelectPort?: (port: StpPort) => void;
  selectedPortId?: string | null;
}

export function StpPortTable({
  ports,
  onSelectPort,
  selectedPortId,
}: StpPortTableProps) {
  const getRoleBadge = (role: StpPortRole) => {
    switch (role) {
      case "root":
        return (
          <Badge
            variant="default"
            className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono uppercase font-bold"
          >
            ROOT (RP)
          </Badge>
        );
      case "designated":
        return (
          <Badge
            variant="default"
            className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono uppercase font-bold"
          >
            DESG (DP)
          </Badge>
        );
      case "alternate":
        return (
          <Badge
            variant="default"
            className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono uppercase font-bold"
          >
            ALTN (AP)
          </Badge>
        );
      case "backup":
        return (
          <Badge
            variant="default"
            className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono uppercase font-bold"
          >
            BACK (BP)
          </Badge>
        );
      case "disabled":
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground text-[10px] font-mono uppercase">
            DISAB
          </Badge>
        );
    }
  };

  const getStateBadge = (state: StpPortState) => {
    switch (state) {
      case "forwarding":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            FWD
          </span>
        );
      case "blocking":
      case "discarding":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            {state === "discarding" ? "DISC" : "BLK"}
          </span>
        );
      case "listening":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            LST (15s)
          </span>
        );
      case "learning":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            LRN (15s)
          </span>
        );
      case "broken":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
            <AlertOctagon className="h-3 w-3" />
            ROOT-INCON
          </span>
        );
      case "disabled":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground bg-secondary/30 px-2 py-0.5 rounded border border-border/40">
            DOWN
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden shadow-sm">
      <div className="p-3 border-b border-border/50 flex items-center justify-between bg-secondary/20">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground">Spanning Tree Port Status Table</span>
          <span className="text-[10px] text-muted-foreground font-mono">IEEE 802.1D / 802.1w</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>Priority.Nbr (PID)</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/40 bg-secondary/30 text-[10px] text-muted-foreground uppercase font-semibold">
              <th className="p-2.5">Port</th>
              <th className="p-2.5">Role</th>
              <th className="p-2.5">State</th>
              <th className="p-2.5">Cost</th>
              <th className="p-2.5">Port ID</th>
              <th className="p-2.5">Designated Bridge</th>
              <th className="p-2.5">Type / Guard</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {ports.map((p) => {
              const isSelected = selectedPortId === p.id;
              return (
                <tr
                  key={p.id}
                  onClick={() => onSelectPort?.(p)}
                  className={`transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-primary/10 border-l-2 border-primary"
                      : "hover:bg-secondary/40"
                  }`}
                >
                  <td className="p-2.5 font-mono font-bold text-foreground">
                    {p.name}
                  </td>
                  <td className="p-2.5">{getRoleBadge(p.role)}</td>
                  <td className="p-2.5">{getStateBadge(p.state)}</td>
                  <td className="p-2.5 font-mono">
                    <span className="text-foreground font-semibold">{p.cost}</span>
                    <span className="text-[10px] text-muted-foreground ml-1">
                      ({p.speedMbps >= 1000 ? `${p.speedMbps / 1000}G` : `${p.speedMbps}M`})
                    </span>
                  </td>
                  <td className="p-2.5 font-mono text-[11px] text-muted-foreground">
                    {p.portPriority}.{p.portNumber}
                  </td>
                  <td className="p-2.5 font-mono text-[11px] text-muted-foreground truncate max-w-[130px]">
                    {p.designatedBridgeId ? formatBridgeId(p.designatedBridgeId) : "—"}
                  </td>
                  <td className="p-2.5">
                    <div className="flex items-center gap-1">
                      {p.isEdgePort && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20 font-mono">
                          <Zap className="h-2.5 w-2.5" /> Edge
                        </span>
                      )}
                      {p.rootGuardEnabled && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-cyan-400 bg-cyan-500/10 px-1 py-0.5 rounded border border-cyan-500/20 font-mono">
                          <ShieldCheck className="h-2.5 w-2.5" /> RootGuard
                        </span>
                      )}
                      {!p.isEdgePort && !p.rootGuardEnabled && (
                        <span className="text-[10px] text-muted-foreground font-mono">P2P</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

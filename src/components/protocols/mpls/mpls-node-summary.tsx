"use client";

import React from "react";
import {
  Server,
  Network,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import type { MplsNode } from "@/features/protocols/mpls/mpls.types";

interface MplsNodeSummaryProps {
  node: MplsNode;
  activePacketLabel?: number;
}

export function MplsNodeSummary({ node }: MplsNodeSummaryProps) {
  const getRoleBadge = (role: MplsNode["role"]) => {
    switch (role) {
      case "ingress-ler":
        return <Badge variant="default" className="bg-blue-500/20 text-blue-400 border-blue-500/30">Ingress LER (PE)</Badge>;
      case "core-lsr":
        return <Badge variant="default" className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">Core LSR (P)</Badge>;
      case "penultimate-lsr":
        return <Badge variant="default" className="bg-purple-500/20 text-purple-400 border-purple-500/30">Penultimate LSR (PHP)</Badge>;
      case "egress-ler":
        return <Badge variant="default" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Egress LER (PE)</Badge>;
      case "backup-lsr":
        return <Badge variant="default" className="bg-amber-500/20 text-amber-400 border-amber-500/30">FRR Backup LSR</Badge>;
      case "ce":
      default:
        return <Badge variant="outline" className="text-zinc-400">Customer Edge (CE)</Badge>;
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="py-3 px-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary border border-primary/20">
              {node.role === "ce" ? <Server className="h-4 w-4" /> : <Network className="h-4 w-4" />}
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                {node.name}
                <span className="text-xs font-mono font-normal text-muted-foreground">({node.id})</span>
              </CardTitle>
              <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                <span>Router-ID: <strong className="font-mono text-foreground">{node.routerId}</strong></span>
                {node.asn && <span>• ASN: <strong className="font-mono text-foreground">{node.asn}</strong></span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {getRoleBadge(node.role)}
            {node.phpEnabled && (
              <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/20">
                PHP Enabled (Label 3)
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3.5 text-xs">
        {/* Hardware & Protocol Identity */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-secondary/20 p-2.5 rounded-lg border border-border/40 font-mono">
          <div>
            <span className="text-[10px] text-muted-foreground block">LOOPBACK IP</span>
            <span className="font-semibold text-foreground">{node.loopbackIp}</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block">PHYSICAL IP</span>
            <span className="font-semibold text-foreground">{node.ipAddress}</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block">LFIB ENTRIES</span>
            <span className="font-semibold text-blue-400">{node.lfib.length} Active Rows</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block">OPERATING MODE</span>
            <span className="font-semibold text-emerald-400">
              {node.role === "ce" ? "Native IPv4" : "MPLS Fast-Path"}
            </span>
          </div>
        </div>

        {/* VRF Tables if present (L3VPN) */}
        {node.vrfs && node.vrfs.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
              <span>Configured VRF Instances (BGP/MPLS L3VPN)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {node.vrfs.map((vrf) => (
                <div
                  key={vrf.vrfName}
                  className="p-2 rounded-md bg-purple-500/5 border border-purple-500/20 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-300 text-[11px]">{vrf.vrfName}</span>
                    <Badge variant="outline" className="text-[9px] bg-purple-500/20 text-purple-300">
                      VPN Label: {vrf.vpnLabel}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-muted-foreground space-y-0.5">
                    <div>RD: <span className="font-mono text-foreground">{vrf.routeDistinguisher}</span></div>
                    <div>Target RT: <span className="font-mono text-foreground">{vrf.routeTargetExport}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Local Labels */}
        {node.activeLabels.length > 0 && (
          <div className="flex items-center gap-2 pt-1 border-t border-border/40">
            <Layers className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-[11px] text-muted-foreground">Locally Allocated Labels:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {node.activeLabels.map((lbl) => (
                <span
                  key={lbl}
                  className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono font-bold text-[11px]"
                >
                  {lbl === 3 ? "Label 3 (Implicit Null)" : `Label ${lbl}`}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

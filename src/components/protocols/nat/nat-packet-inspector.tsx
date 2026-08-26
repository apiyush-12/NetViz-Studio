"use client";

import React from "react";
import { RefreshCcw, CheckCircle2 } from "lucide-react";
import { Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";

interface NatPacketInspectorProps {
  beforeHeader: {
    srcIp: string;
    srcPort: number;
    dstIp: string;
    dstPort: number;
  };
  afterHeader: {
    srcIp: string;
    srcPort: number;
    dstIp: string;
    dstPort: number;
  };
  protocol: string;
}

export function NatPacketInspector({
  beforeHeader,
  afterHeader,
  protocol,
}: NatPacketInspectorProps) {
  const isSrcChanged = beforeHeader.srcIp !== afterHeader.srcIp || beforeHeader.srcPort !== afterHeader.srcPort;
  const isDstChanged = beforeHeader.dstIp !== afterHeader.dstIp || beforeHeader.dstPort !== afterHeader.dstPort;

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-xs flex items-center gap-1.5 text-primary">
          <RefreshCcw className="h-4 w-4" />
          <span>In-Place Header Rewriting & Checksum Recalculation</span>
        </h4>
        <Badge variant="outline" className="text-[10px] font-mono">
          RFC 1624 / RFC 3022
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Before Translation Header */}
        <Card className="border-border bg-secondary/20">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
              <span>Original Ingress Header (LAN)</span>
              <Badge variant="outline" className="text-[9px] font-mono">Pre-NAT</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 font-mono text-[11px]">
            <div className="p-2 rounded bg-background border border-border/60 space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source IPv4:</span>
                <span className="text-foreground font-bold">{beforeHeader.srcIp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source Port:</span>
                <span className="text-foreground font-bold">{beforeHeader.srcPort}</span>
              </div>
              <div className="flex justify-between border-t border-border/40 pt-1">
                <span className="text-muted-foreground">Destination IPv4:</span>
                <span className="text-foreground font-bold">{beforeHeader.dstIp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destination Port:</span>
                <span className="text-foreground font-bold">{beforeHeader.dstPort}</span>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground">
              Protocol: <strong className="text-primary">{protocol}</strong> · Zone: Inside Private LAN
            </div>
          </CardContent>
        </Card>

        {/* After Translation Header */}
        <Card className="border-border bg-emerald-500/5 ring-1 ring-emerald-500/30">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-xs font-semibold text-emerald-400 flex items-center justify-between">
              <span>Translated Egress Header (WAN)</span>
              <Badge variant="default" className="text-[9px] font-mono bg-emerald-500 text-slate-950">Post-NAT</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 font-mono text-[11px]">
            <div className="p-2 rounded bg-background border border-emerald-500/40 space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source IPv4:</span>
                <span className={isSrcChanged ? "text-emerald-400 font-bold underline" : "text-foreground"}>
                  {afterHeader.srcIp}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source Port:</span>
                <span className={isSrcChanged ? "text-emerald-400 font-bold underline" : "text-foreground"}>
                  {afterHeader.srcPort}
                </span>
              </div>
              <div className="flex justify-between border-t border-border/40 pt-1">
                <span className="text-muted-foreground">Destination IPv4:</span>
                <span className={isDstChanged ? "text-emerald-400 font-bold underline" : "text-foreground"}>
                  {afterHeader.dstIp}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destination Port:</span>
                <span className={isDstChanged ? "text-emerald-400 font-bold underline" : "text-foreground"}>
                  {afterHeader.dstPort}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Incremental Checksum Updated
              </span>
              <span className="text-muted-foreground">Zone: Public WAN</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

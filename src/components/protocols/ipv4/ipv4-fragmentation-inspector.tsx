"use client";

import React from "react";
import { Split, Layers, AlertTriangle } from "lucide-react";
import { Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import type { Ipv4Fragment } from "@/features/protocols/ipv4/ipv4.types";

interface Ipv4FragmentationInspectorProps {
  fragments?: Ipv4Fragment[];
  packetSize: number;
  routerMtu: number;
  dfFlag: boolean;
}

export function Ipv4FragmentationInspector({
  fragments,
  packetSize,
  routerMtu,
  dfFlag,
}: Ipv4FragmentationInspectorProps) {
  const isFragmented = (fragments && fragments.length > 0) || packetSize > routerMtu;

  return (
    <div className="border border-border rounded-xl bg-card p-3 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Split className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span>IPv4 In-Flight MTU Fragmentation & Reassembly</span>
              <Badge
                variant="outline"
                className={isFragmented ? "text-[9px] font-mono text-amber-400 border-amber-500/30" : "text-[9px] font-mono text-emerald-400 border-emerald-500/30"}
              >
                {isFragmented ? `${fragments?.length ?? 0} Slices Generated` : "Unfragmented (Within MTU)"}
              </Badge>
            </h3>
            <p className="text-[10.5px] text-muted-foreground">
              Packet Size ({packetSize}B) vs Bottleneck Link MTU ({routerMtu}B) · 8-Byte Offset Alignment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] font-mono">
            DF Flag: {dfFlag ? "1 (Enabled)" : "0 (Disabled)"}
          </Badge>
        </div>
      </div>

      {/* DF Bit Alert if dropped */}
      {dfFlag && packetSize > routerMtu && (
        <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-xs flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-destructive">Packet Dropped: DF (Don&apos;t Fragment) Bit Set</span>
            <p className="text-[11px] text-muted-foreground">
              Packet size ({packetSize}B) exceeds MTU ({routerMtu}B). Router R2 dropped the packet and returned ICMP Type 3 Code 4 (Fragmentation Needed).
            </p>
          </div>
        </div>
      )}

      {/* Fragment Slices Breakdown */}
      {fragments && fragments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {fragments.map((frag, idx) => (
            <Card key={idx} className="border-border bg-secondary/20">
              <CardHeader className="pb-1.5 pt-2.5 px-3 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-amber-400" />
                  <span>Fragment Slice #{idx + 1}</span>
                </CardTitle>
                <Badge variant={frag.mf ? "default" : "outline"} className="text-[9px] font-mono">
                  MF: {frag.mf ? "1 (More)" : "0 (Last)"}
                </Badge>
              </CardHeader>
              <CardContent className="px-3 pb-2.5 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Length:</span>
                  <strong className="text-foreground">{frag.payloadLength + 20} Bytes</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payload Bytes:</span>
                  <span className="text-amber-400 font-bold">{frag.payloadLength} B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Byte Range:</span>
                  <span className="text-muted-foreground">{frag.data}</span>
                </div>
                <div className="flex justify-between border-t border-border/40 pt-1">
                  <span className="text-muted-foreground">Fragment Offset:</span>
                  <strong className="text-primary">{frag.offsetUnits} (8-byte units)</strong>
                </div>
                <div className="text-[10px] text-muted-foreground text-right">
                  Offset in Bytes: {frag.offset} B
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-xs text-muted-foreground italic rounded-lg border border-dashed border-border">
          Packet length ({packetSize} Bytes) fits within interface MTU ({routerMtu} Bytes). No fragmentation required.
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { Badge } from "@/components/ui";
import type { Ipv6Header } from "@/features/protocols/ipv6/ipv6.types";

interface Ipv6HeaderInspectorProps {
  header: Ipv6Header;
}

export function Ipv6HeaderInspector({ header }: Ipv6HeaderInspectorProps) {
  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-xs flex items-center gap-1.5 text-cyan-400">
          <span>RFC 8200 IPv6 Header Format (Fixed 40-Byte)</span>
        </h4>
        <Badge variant="outline" className="text-[10px] font-mono text-cyan-400 border-cyan-500/30">
          Total Length: {header.payloadLength + 40} Bytes
        </Badge>
      </div>

      {/* Visual Bitfield Grid Layout */}
      <div className="border border-border rounded-lg overflow-hidden font-mono text-[11px] bg-card">
        {/* Bit Column Header */}
        <div className="grid grid-cols-4 bg-secondary/60 border-b border-border text-[10px] text-muted-foreground text-center py-1 font-semibold">
          <div>Bit 0 - 7 (Byte 0)</div>
          <div>Bit 8 - 15 (Byte 1)</div>
          <div>Bit 16 - 23 (Byte 2)</div>
          <div>Bit 24 - 31 (Byte 3)</div>
        </div>

        {/* Row 1: Version, Traffic Class, Flow Label */}
        <div className="grid grid-cols-4 divide-x divide-border border-b border-border/60">
          <div className="p-2 text-center bg-blue-500/10">
            <span className="text-[10px] text-muted-foreground block">Version (4b)</span>
            <strong className="text-blue-400">{header.version}</strong>
          </div>
          <div className="p-2 text-center bg-cyan-500/10">
            <span className="text-[10px] text-muted-foreground block">Traffic Class (8b)</span>
            <strong className="text-cyan-400">{header.trafficClass}</strong>
          </div>
          <div className="col-span-2 p-2 text-center bg-purple-500/10">
            <span className="text-[10px] text-muted-foreground block">Flow Label (20b QoS)</span>
            <strong className="text-purple-300">0x{header.flowLabel.toString(16).toUpperCase()} ({header.flowLabel})</strong>
          </div>
        </div>

        {/* Row 2: Payload Length, Next Header, Hop Limit */}
        <div className="grid grid-cols-4 divide-x divide-border border-b border-border/60">
          <div className="col-span-2 p-2 text-center bg-emerald-500/10">
            <span className="text-[10px] text-muted-foreground block">Payload Length (16b)</span>
            <strong className="text-emerald-400">{header.payloadLength} Bytes</strong>
          </div>
          <div className="p-2 text-center bg-indigo-500/10">
            <span className="text-[10px] text-muted-foreground block">Next Header (8b)</span>
            <strong className="text-indigo-300">{header.nextHeaderName}</strong>
          </div>
          <div className="p-2 text-center bg-rose-500/10">
            <span className="text-[10px] text-muted-foreground block">Hop Limit (8b)</span>
            <strong className="text-rose-400">{header.hopLimit} Hops</strong>
          </div>
        </div>

        {/* Row 3: Source IPv6 Address (128 bits) */}
        <div className="p-2.5 bg-cyan-500/5 border-b border-border/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Source IPv6 Address (128 bits):</span>
            <Badge variant="outline" className="text-[9px] font-mono">16 Bytes</Badge>
          </div>
          <div className="text-foreground text-xs font-bold break-all">
            {header.sourceIp}
          </div>
        </div>

        {/* Row 4: Destination IPv6 Address (128 bits) */}
        <div className="p-2.5 bg-emerald-500/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Destination IPv6 Address (128 bits):</span>
            <Badge variant="outline" className="text-[9px] font-mono">16 Bytes</Badge>
          </div>
          <div className="text-emerald-400 text-xs font-bold break-all">
            {header.destinationIp}
          </div>
        </div>
      </div>
    </div>
  );
}

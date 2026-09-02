"use client";

import React from "react";
import { Badge } from "@/components/ui";
import type { Ipv4Header } from "@/features/protocols/ipv4/ipv4.types";

interface Ipv4HeaderInspectorProps {
  header: Ipv4Header;
}

export function Ipv4HeaderInspector({ header }: Ipv4HeaderInspectorProps) {
  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-xs flex items-center gap-1.5 text-primary">
          <span>RFC 791 IPv4 Header Format (20-Byte Fixed)</span>
        </h4>
        <Badge variant="outline" className="text-[10px] font-mono">
          Total Length: {header.totalLength} Bytes
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

        {/* Row 1: Version, IHL, DSCP, ECN, Total Length */}
        <div className="grid grid-cols-4 divide-x divide-border border-b border-border/60">
          <div className="p-2 text-center bg-blue-500/10">
            <span className="text-[10px] text-muted-foreground block">Version (4b)</span>
            <strong className="text-blue-400">{header.version}</strong>
          </div>
          <div className="p-2 text-center bg-cyan-500/10">
            <span className="text-[10px] text-muted-foreground block">IHL (4b)</span>
            <strong className="text-cyan-400">{header.ihl} ({header.ihl * 4}B)</strong>
          </div>
          <div className="p-2 text-center">
            <span className="text-[10px] text-muted-foreground block">DSCP (6b) / ECN (2b)</span>
            <span className="text-foreground">{header.dscp} / {header.ecn}</span>
          </div>
          <div className="p-2 text-center bg-emerald-500/10">
            <span className="text-[10px] text-muted-foreground block">Total Length (16b)</span>
            <strong className="text-emerald-400">{header.totalLength} B</strong>
          </div>
        </div>

        {/* Row 2: Identification, Flags, Fragment Offset */}
        <div className="grid grid-cols-4 divide-x divide-border border-b border-border/60">
          <div className="col-span-2 p-2 text-center bg-purple-500/10">
            <span className="text-[10px] text-muted-foreground block">Identification (16b)</span>
            <strong className="text-purple-300">0x{header.identification.toString(16).toUpperCase()} ({header.identification})</strong>
          </div>
          <div className="p-2 text-center bg-amber-500/10">
            <span className="text-[10px] text-muted-foreground block">Flags (3b)</span>
            <div className="flex justify-center gap-1 text-[10px]">
              <span className={header.flags.df ? "text-amber-400 font-bold" : "text-muted-foreground"}>DF:{header.flags.df ? "1" : "0"}</span>
              <span className={header.flags.mf ? "text-emerald-400 font-bold" : "text-muted-foreground"}>MF:{header.flags.mf ? "1" : "0"}</span>
            </div>
          </div>
          <div className="p-2 text-center bg-amber-500/10">
            <span className="text-[10px] text-muted-foreground block">Fragment Offset (13b)</span>
            <strong className="text-amber-400">{header.fragmentOffset} ({header.fragmentOffset * 8} B)</strong>
          </div>
        </div>

        {/* Row 3: TTL, Protocol, Header Checksum */}
        <div className="grid grid-cols-4 divide-x divide-border border-b border-border/60">
          <div className="p-2 text-center bg-rose-500/10">
            <span className="text-[10px] text-muted-foreground block">TTL (8b)</span>
            <strong className="text-rose-400">{header.ttl} Hops</strong>
          </div>
          <div className="p-2 text-center bg-indigo-500/10">
            <span className="text-[10px] text-muted-foreground block">Protocol (8b)</span>
            <strong className="text-indigo-300">{header.protocolName} ({header.protocol})</strong>
          </div>
          <div className="col-span-2 p-2 text-center bg-emerald-500/10">
            <span className="text-[10px] text-muted-foreground block">Header Checksum (16b)</span>
            <strong className="text-emerald-400">{header.headerChecksum}</strong>
          </div>
        </div>

        {/* Row 4: Source IP */}
        <div className="p-2.5 bg-blue-500/5 border-b border-border/60 flex items-center justify-between">
          <span className="text-muted-foreground">Source IPv4 Address (32 bits):</span>
          <strong className="text-foreground text-xs">{header.sourceIp}</strong>
        </div>

        {/* Row 5: Destination IP */}
        <div className="p-2.5 bg-emerald-500/5 flex items-center justify-between">
          <span className="text-muted-foreground">Destination IPv4 Address (32 bits):</span>
          <strong className="text-emerald-400 text-xs">{header.destinationIp}</strong>
        </div>
      </div>
    </div>
  );
}

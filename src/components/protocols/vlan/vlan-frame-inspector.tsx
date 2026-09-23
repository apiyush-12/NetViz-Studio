"use client";

import React, { useState } from "react";
import {
  Binary,
  Radio,
  FileCode,
  Layers,
  Tag,
  ShieldAlert,
} from "lucide-react";
import { Badge, Card, CardContent } from "@/components/ui";
import type { VlanFrameData } from "@/features/protocols/vlan/vlan.types";
import { format8021QHexDump } from "@/features/protocols/vlan/vlan-engine";
import { DEFAULT_VLANS } from "@/features/protocols/vlan/vlan.defaults";

interface VlanFrameInspectorProps {
  frame?: VlanFrameData;
}

export function VlanFrameInspector({ frame }: VlanFrameInspectorProps) {
  const [activeHighlightField, setActiveHighlightField] = useState<string | null>(null);

  if (!frame) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <div className="p-3 bg-secondary/30 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Binary className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-bold text-foreground">
              IEEE 802.1Q Frame Inspector
            </h4>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            No Frame In Flight
          </Badge>
        </div>
        <CardContent className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
          <Radio className="h-8 w-8 text-muted-foreground/40 animate-pulse" />
          <p className="font-semibold text-foreground">No Active Ethernet Frame on Wire</p>
          <p className="text-[11px] max-w-sm">
            Step through the timeline using playback controls to inspect 802.1Q 4-byte Tag headers, 16-bit TCI bitfield structures, and raw hex decoders.
          </p>
        </CardContent>
      </Card>
    );
  }

  const vlanDef = DEFAULT_VLANS.find((v) => v.vlanId === frame.sourceVlanId);
  const rawBytes = format8021QHexDump(frame);

  const wiresharkSummary = frame.isTagged && frame.dot1q
    ? `IEEE 802.1Q, VLAN ID: ${frame.dot1q.vlanId} (${vlanDef?.name || "VLAN"}), Priority: ${frame.dot1q.pcp} (CoS), DEI: ${frame.dot1q.dei ? "1" : "0"}, EtherType: 0x0800, length 18`
    : `Ethernet II, Src: ${frame.sourceMac}, Dst: ${frame.destMac}, Untagged (Standard Access Frame), length 14`;

  const getFieldColor = (fieldKey: string) => {
    switch (fieldKey) {
      case "tpid":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      case "tci":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/40";
      case "destMac":
        return "bg-blue-500/20 text-blue-400 border-blue-500/40";
      case "sourceMac":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
      case "ethertype":
        return "bg-purple-500/20 text-purple-400 border-purple-500/40";
      case "payload":
      default:
        return "bg-secondary text-muted-foreground border-border";
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden">
      {/* Header Banner */}
      <div className="p-3 bg-secondary/30 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Binary className="h-4 w-4 text-primary" />
          <h4 className="text-xs font-bold text-foreground">
            {frame.isTagged ? "IEEE 802.1Q Tagged Frame (18 Bytes)" : "Standard Ethernet II Frame (14 Bytes)"}
          </h4>
        </div>
        <div className="flex items-center gap-1.5">
          {frame.isTagged && frame.dot1q ? (
            <Badge
              variant="default"
              className="text-[10px] font-mono font-bold bg-amber-500 text-slate-950"
            >
              802.1Q TAGGED (VID {frame.dot1q.vlanId})
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] font-mono">
              UNTAGGED (PVID {frame.sourceVlanId})
            </Badge>
          )}
          {frame.isDoubleTagged && (
            <Badge variant="destructive" className="text-[10px] font-mono animate-pulse flex items-center gap-1">
              <ShieldAlert className="h-2.5 w-2.5" /> DOUBLE-TAGGED
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-3 flex flex-col gap-3">
        {/* Wireshark Style Trace Line */}
        <div className="p-2.5 rounded-lg bg-slate-950 border border-border/80 font-mono text-xs flex items-center gap-2 overflow-x-auto text-emerald-400">
          <span className="text-muted-foreground shrink-0 text-[11px]">[Wireshark]</span>
          <span className="text-foreground shrink-0 font-bold">{wiresharkSummary}</span>
        </div>

        {/* 802.1Q 4-Byte Tag Architecture Callout (if tagged) */}
        {frame.isTagged && frame.dot1q ? (
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400">
              <span className="flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                <Tag className="h-3.5 w-3.5" /> 4-Byte IEEE 802.1Q Tag Shim Breakdown
              </span>
              <span className="font-mono text-[11px]">32 Bits Total</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-xs font-mono text-center">
              {/* TPID */}
              <div
                onMouseEnter={() => setActiveHighlightField("tpid")}
                onMouseLeave={() => setActiveHighlightField(null)}
                className={`p-1.5 rounded border transition-all cursor-pointer ${
                  activeHighlightField === "tpid"
                    ? "bg-amber-500/20 border-amber-400 ring-1 ring-amber-400"
                    : "bg-card border-border"
                }`}
              >
                <div className="text-[9px] text-muted-foreground uppercase">TPID (16b)</div>
                <div className="font-bold text-amber-400 mt-0.5">0x8100</div>
              </div>

              {/* PCP */}
              <div
                onMouseEnter={() => setActiveHighlightField("tci")}
                onMouseLeave={() => setActiveHighlightField(null)}
                className={`p-1.5 rounded border transition-all cursor-pointer ${
                  activeHighlightField === "tci"
                    ? "bg-cyan-500/20 border-cyan-400 ring-1 ring-cyan-400"
                    : "bg-card border-border"
                }`}
              >
                <div className="text-[9px] text-muted-foreground uppercase">PCP (3b CoS)</div>
                <div className="font-bold text-cyan-400 mt-0.5">{frame.dot1q.pcp} (BestEff)</div>
              </div>

              {/* DEI */}
              <div
                onMouseEnter={() => setActiveHighlightField("tci")}
                onMouseLeave={() => setActiveHighlightField(null)}
                className={`p-1.5 rounded border transition-all cursor-pointer ${
                  activeHighlightField === "tci"
                    ? "bg-cyan-500/20 border-cyan-400 ring-1 ring-cyan-400"
                    : "bg-card border-border"
                }`}
              >
                <div className="text-[9px] text-muted-foreground uppercase">DEI (1b)</div>
                <div className="font-bold text-cyan-400 mt-0.5">{frame.dot1q.dei ? "1" : "0"}</div>
              </div>

              {/* VID */}
              <div
                onMouseEnter={() => setActiveHighlightField("tci")}
                onMouseLeave={() => setActiveHighlightField(null)}
                className={`p-1.5 rounded border transition-all cursor-pointer ${
                  activeHighlightField === "tci"
                    ? "bg-cyan-500/20 border-cyan-400 ring-1 ring-cyan-400"
                    : "bg-card border-border"
                }`}
              >
                <div className="text-[9px] text-muted-foreground uppercase">VID (12b)</div>
                <div className="font-bold text-emerald-400 mt-0.5">VLAN {frame.dot1q.vlanId}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-secondary/15 border border-border/70 flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" /> Standard 14-byte Ethernet II framing on access port.
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              Untagged Egress
            </Badge>
          </div>
        )}

        {/* Framing Overview Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Source & Destination MAC */}
          <div
            onMouseEnter={() => setActiveHighlightField("sourceMac")}
            onMouseLeave={() => setActiveHighlightField(null)}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
              activeHighlightField === "sourceMac"
                ? "bg-emerald-500/15 border-emerald-500"
                : "bg-card border-border"
            }`}
          >
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">Source MAC</span>
            <div className="font-mono font-bold text-foreground text-xs mt-0.5 tracking-wider truncate">
              {frame.sourceMac}
            </div>
          </div>

          <div
            onMouseEnter={() => setActiveHighlightField("destMac")}
            onMouseLeave={() => setActiveHighlightField(null)}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
              activeHighlightField === "destMac"
                ? "bg-blue-500/15 border-blue-500"
                : "bg-card border-border"
            }`}
          >
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">Destination MAC</span>
            <div className="font-mono font-bold text-foreground text-xs mt-0.5 tracking-wider truncate">
              {frame.destMac}
            </div>
          </div>
        </div>

        {/* Interactive Raw Hex Dump */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
              <FileCode className="h-3 w-3 text-primary" /> Wire Hex Dump ({rawBytes.length} Octets)
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              Hover octet to decode field
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-950 border border-border/80 font-mono text-xs">
            <div className="grid grid-cols-8 sm:grid-cols-14 gap-1">
              {rawBytes.map((b) => {
                const isFieldActive = activeHighlightField === b.fieldKey;
                const colorClass = getFieldColor(b.fieldKey);

                return (
                  <div
                    key={b.offset}
                    onMouseEnter={() => setActiveHighlightField(b.fieldKey)}
                    onMouseLeave={() => setActiveHighlightField(null)}
                    title={`Offset 0x${b.offset.toString(16).padStart(2, "0")}: ${b.fieldName}`}
                    className={`px-1 py-1 rounded text-center text-[11px] font-bold border transition-all cursor-help ${colorClass} ${
                      isFieldActive ? "ring-2 ring-primary scale-105 z-10" : "opacity-90 hover:opacity-100"
                    }`}
                  >
                    {b.hex}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

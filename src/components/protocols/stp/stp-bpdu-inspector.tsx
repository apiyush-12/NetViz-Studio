"use client";

import React from "react";
import { FileCode, Binary } from "lucide-react";
import { Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import type { BpduFrame, BpduFlags } from "@/features/protocols/stp/stp.types";
import { formatBridgeId } from "@/features/protocols/stp/stp-engine";

interface StpBpduInspectorProps {
  bpdu?: BpduFrame;
}

export function StpBpduInspector({ bpdu }: StpBpduInspectorProps) {
  if (!bpdu) {
    return (
      <div className="p-6 rounded-xl border border-dashed border-border bg-card/40 text-center text-xs text-muted-foreground">
        <FileCode className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="font-semibold">No BPDU Selected</p>
        <p className="text-[11px] mt-1">
          Play or scrub the simulation timeline to capture and decode in-flight Bridge Protocol Data Units.
        </p>
      </div>
    );
  }

  const flags: BpduFlags = bpdu.flags;

  return (
    <div className="space-y-3 text-xs">
      {/* Top Banner: Protocol Header */}
      <div className="p-3 rounded-xl border border-border bg-card/70 backdrop-blur-sm shadow-sm space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="default"
              className={`text-[10px] font-mono uppercase font-bold ${
                bpdu.type === "tcn"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : bpdu.version === 2
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                  : "bg-blue-500/20 text-blue-300 border-blue-500/40"
              }`}
            >
              {bpdu.type === "tcn" ? "TCN BPDU (0x80)" : bpdu.version === 2 ? "RSTP BPDU (0x02)" : "CONFIG BPDU (0x00)"}
            </Badge>
            <span className="text-xs font-semibold text-foreground">
              {bpdu.version === 2 ? "IEEE 802.1w Rapid BPDU" : "IEEE 802.1D Spanning Tree Frame"}
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            Dest: {bpdu.destMac} (STP Multicast)
          </span>
        </div>

        {/* 802.3 LLC & Protocol Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] pt-1 border-t border-border/40">
          <div className="bg-secondary/30 p-1.5 rounded border border-border/30">
            <span className="text-[9px] block text-muted-foreground uppercase font-sans">Protocol ID</span>
            <span className="font-bold text-foreground">0x0000 (STP)</span>
          </div>
          <div className="bg-secondary/30 p-1.5 rounded border border-border/30">
            <span className="text-[9px] block text-muted-foreground uppercase font-sans">Version</span>
            <span className="font-bold text-foreground">{bpdu.version} ({bpdu.version === 2 ? "RSTP" : "Classic STP"})</span>
          </div>
          <div className="bg-secondary/30 p-1.5 rounded border border-border/30">
            <span className="text-[9px] block text-muted-foreground uppercase font-sans">BPDU Type</span>
            <span className="font-bold text-foreground">{bpdu.type === "tcn" ? "0x80 (TCN)" : bpdu.type === "rstp" ? "0x02 (RSTP)" : "0x00 (Config)"}</span>
          </div>
          <div className="bg-secondary/30 p-1.5 rounded border border-border/30">
            <span className="text-[9px] block text-muted-foreground uppercase font-sans">Source MAC</span>
            <span className="font-bold text-foreground truncate block">{bpdu.sourceMac}</span>
          </div>
        </div>
      </div>

      {/* Interactive 8-Bit BPDU Flags Inspector */}
      <Card className="border-border bg-card/60 backdrop-blur-sm shadow-sm">
        <CardHeader className="p-3 pb-2 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-foreground">
              <Binary className="h-3.5 w-3.5 text-primary" /> BPDU Flags Byte (Bit-by-Bit Breakdown)
            </CardTitle>
            <span className="text-[10px] font-mono text-muted-foreground">1 Byte (8 Bits)</span>
          </div>
        </CardHeader>
        <CardContent className="p-3 space-y-3">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 font-mono text-center">
            {/* Bit 7: TCA */}
            <div
              className={`p-2 rounded border transition-all ${
                flags.topologyChangeAck
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold"
                  : "bg-secondary/20 border-border/30 text-muted-foreground"
              }`}
            >
              <div className="text-[9px] uppercase font-sans">Bit 7</div>
              <div className="text-xs">{flags.topologyChangeAck ? "1" : "0"}</div>
              <div className="text-[9px] truncate font-sans">TCA</div>
            </div>

            {/* Bit 6: Agreement */}
            <div
              className={`p-2 rounded border transition-all ${
                flags.agreement
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold"
                  : "bg-secondary/20 border-border/30 text-muted-foreground"
              }`}
            >
              <div className="text-[9px] uppercase font-sans">Bit 6</div>
              <div className="text-xs">{flags.agreement ? "1" : "0"}</div>
              <div className="text-[9px] truncate font-sans">Agreement</div>
            </div>

            {/* Bit 5: Forwarding */}
            <div
              className={`p-2 rounded border transition-all ${
                flags.forwarding
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold"
                  : "bg-secondary/20 border-border/30 text-muted-foreground"
              }`}
            >
              <div className="text-[9px] uppercase font-sans">Bit 5</div>
              <div className="text-xs">{flags.forwarding ? "1" : "0"}</div>
              <div className="text-[9px] truncate font-sans">Forwarding</div>
            </div>

            {/* Bit 4: Learning */}
            <div
              className={`p-2 rounded border transition-all ${
                flags.learning
                  ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold"
                  : "bg-secondary/20 border-border/30 text-muted-foreground"
              }`}
            >
              <div className="text-[9px] uppercase font-sans">Bit 4</div>
              <div className="text-xs">{flags.learning ? "1" : "0"}</div>
              <div className="text-[9px] truncate font-sans">Learning</div>
            </div>

            {/* Bits 3-2: Port Role */}
            <div
              className={`p-2 rounded border col-span-2 transition-all ${
                flags.portRole !== "disabled"
                  ? "bg-primary/20 border-primary/50 text-primary font-bold"
                  : "bg-secondary/20 border-border/30 text-muted-foreground"
              }`}
            >
              <div className="text-[9px] uppercase font-sans">Bits 3-2</div>
              <div className="text-xs uppercase">{flags.portRole}</div>
              <div className="text-[9px] font-sans">Port Role</div>
            </div>

            {/* Bit 1: Proposal */}
            <div
              className={`p-2 rounded border transition-all ${
                flags.proposal
                  ? "bg-blue-500/20 border-blue-500/50 text-blue-300 font-bold"
                  : "bg-secondary/20 border-border/30 text-muted-foreground"
              }`}
            >
              <div className="text-[9px] uppercase font-sans">Bit 1</div>
              <div className="text-xs">{flags.proposal ? "1" : "0"}</div>
              <div className="text-[9px] truncate font-sans">Proposal</div>
            </div>

            {/* Bit 0: TC */}
            <div
              className={`p-2 rounded border transition-all ${
                flags.topologyChange
                  ? "bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold"
                  : "bg-secondary/20 border-border/30 text-muted-foreground"
              }`}
            >
              <div className="text-[9px] uppercase font-sans">Bit 0</div>
              <div className="text-xs">{flags.topologyChange ? "1" : "0"}</div>
              <div className="text-[9px] truncate font-sans">TC</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* STP Vectors & Payload Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="p-3 rounded-xl border border-border bg-card/60 space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground font-semibold">
            <span>Root Bridge Identifier (8B)</span>
            <span className="font-mono text-[10px]">Priority + MAC</span>
          </div>
          <div className="font-mono text-sm font-bold text-amber-400">
            {formatBridgeId(bpdu.rootBridgeId)}
          </div>
          <div className="text-[11px] text-muted-foreground">
            Current acknowledged root in BPDU advertisement.
          </div>
        </div>

        <div className="p-3 rounded-xl border border-border bg-card/60 space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground font-semibold">
            <span>Root Path Cost (4B)</span>
            <span className="font-mono text-[10px]">Accumulated</span>
          </div>
          <div className="font-mono text-sm font-bold text-foreground">
            {bpdu.rootPathCost}
          </div>
          <div className="text-[11px] text-muted-foreground">
            Cost from sending bridge to Root Bridge.
          </div>
        </div>

        <div className="p-3 rounded-xl border border-border bg-card/60 space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground font-semibold">
            <span>Sender Bridge Identifier (8B)</span>
            <span className="font-mono text-[10px]">Transmitter</span>
          </div>
          <div className="font-mono text-sm font-bold text-foreground">
            {formatBridgeId(bpdu.senderBridgeId)}
          </div>
          <div className="text-[11px] text-muted-foreground">
            Bridge ID of the switch transmitting this frame.
          </div>
        </div>

        <div className="p-3 rounded-xl border border-border bg-card/60 space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground font-semibold">
            <span>Port Identifier (2B)</span>
            <span className="font-mono text-[10px]">Priority.Number</span>
          </div>
          <div className="font-mono text-sm font-bold text-foreground">
            {bpdu.portId.priority}.{bpdu.portId.number}
          </div>
          <div className="text-[11px] text-muted-foreground">
            Port ID used as tertiary tie-breaker on parallel links.
          </div>
        </div>
      </div>

      {/* Timers & Protocol Parameters */}
      <div className="p-3 rounded-xl border border-border bg-secondary/20 flex items-center justify-between flex-wrap gap-2 text-[11px] font-mono">
        <div>
          <span className="text-muted-foreground mr-1">Message Age:</span>
          <span className="font-bold text-foreground">{bpdu.messageAge}s</span>
        </div>
        <div>
          <span className="text-muted-foreground mr-1">Max Age:</span>
          <span className="font-bold text-foreground">{bpdu.maxAge}s</span>
        </div>
        <div>
          <span className="text-muted-foreground mr-1">Hello Time:</span>
          <span className="font-bold text-foreground">{bpdu.helloTime}s</span>
        </div>
        <div>
          <span className="text-muted-foreground mr-1">Forward Delay:</span>
          <span className="font-bold text-foreground">{bpdu.forwardDelay}s</span>
        </div>
      </div>
    </div>
  );
}

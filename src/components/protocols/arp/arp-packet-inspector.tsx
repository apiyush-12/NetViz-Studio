"use client";

import React, { useState } from "react";
import {
  Binary,
  Radio,
  FileCode,
  Layers,
} from "lucide-react";
import { Badge, Card, CardContent } from "@/components/ui";
import type { ArpPacketData } from "@/features/protocols/arp/arp.types";
import { ipToHex, macToHexBytes } from "@/features/protocols/arp/arp-engine";

interface ArpPacketInspectorProps {
  packet?: ArpPacketData;
}

export function ArpPacketInspector({ packet }: ArpPacketInspectorProps) {
  const [activeHighlightField, setActiveHighlightField] = useState<string | null>(null);

  if (!packet) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <div className="p-3 bg-secondary/30 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Binary className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-bold text-foreground">
              RFC 826 ARP Packet Inspector (28 Bytes)
            </h4>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            No Frame In Flight
          </Badge>
        </div>
        <CardContent className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
          <Radio className="h-8 w-8 text-muted-foreground/40 animate-pulse" />
          <p className="font-semibold text-foreground">No Active ARP Frame on Wire</p>
          <p className="text-[11px] max-w-sm">
            Step through the timeline using playback controls to inspect ARP Request/Reply frame payloads and raw 28-byte hex decoders.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Construct Wireshark-style summary line
  const wiresharkSummary =
    packet.opcode === 1
      ? `ARP, Request who-has ${packet.targetIp} tell ${packet.senderIp}, length 28`
      : packet.opcode === 2
      ? `ARP, Reply ${packet.senderIp} is-at ${packet.senderMac}, length 28`
      : `ARP, Opcode ${packet.opcode}, length 28`;

  // Compute raw byte arrays for 28-byte ARP payload
  // [0..1] HTYPE 0x0001
  // [2..3] PTYPE 0x0800
  // [4] HLEN 0x06
  // [5] PLEN 0x04
  // [6..7] OPER 0x0001 / 0x0002
  // [8..13] SHA (6 bytes)
  // [14..17] SPA (4 bytes)
  // [18..23] THA (6 bytes)
  // [24..27] TPA (4 bytes)

  const rawBytes: { offset: number; hex: string; fieldKey: string; fieldName: string }[] = [];

  // HTYPE (0x00, 0x01)
  rawBytes.push({ offset: 0, hex: "00", fieldKey: "htype", fieldName: "Hardware Type (HTYPE)" });
  rawBytes.push({ offset: 1, hex: "01", fieldKey: "htype", fieldName: "Hardware Type (HTYPE)" });

  // PTYPE (0x08, 0x00)
  rawBytes.push({ offset: 2, hex: "08", fieldKey: "ptype", fieldName: "Protocol Type (PTYPE)" });
  rawBytes.push({ offset: 3, hex: "00", fieldKey: "ptype", fieldName: "Protocol Type (PTYPE)" });

  // HLEN (0x06)
  rawBytes.push({ offset: 4, hex: "06", fieldKey: "hlen", fieldName: "Hardware Length (HLEN)" });

  // PLEN (0x04)
  rawBytes.push({ offset: 5, hex: "04", fieldKey: "plen", fieldName: "Protocol Length (PLEN)" });

  // OPER (0x00, 0x01 or 0x02)
  rawBytes.push({ offset: 6, hex: "00", fieldKey: "oper", fieldName: "Operation Code (OPER)" });
  rawBytes.push({
    offset: 7,
    hex: packet.opcode.toString(16).padStart(2, "0").toUpperCase(),
    fieldKey: "oper",
    fieldName: "Operation Code (OPER)",
  });

  // SHA (6 bytes)
  const shaHex = macToHexBytes(packet.senderMac);
  shaHex.forEach((b: string, idx: number) => {
    rawBytes.push({
      offset: 8 + idx,
      hex: b.toUpperCase(),
      fieldKey: "sha",
      fieldName: "Sender Hardware Addr (SHA)",
    });
  });

  // SPA (4 bytes)
  const spaHex = ipToHex(packet.senderIp).match(/.{1,2}/g) || ["C0", "A8", "01", "01"];
  spaHex.forEach((b: string, idx: number) => {
    rawBytes.push({
      offset: 14 + idx,
      hex: b.toUpperCase(),
      fieldKey: "spa",
      fieldName: "Sender Protocol Addr (SPA)",
    });
  });

  // THA (6 bytes)
  const thaHex = macToHexBytes(packet.targetMac);
  thaHex.forEach((b: string, idx: number) => {
    rawBytes.push({
      offset: 18 + idx,
      hex: b.toUpperCase(),
      fieldKey: "tha",
      fieldName: "Target Hardware Addr (THA)",
    });
  });

  // TPA (4 bytes)
  const tpaHex = ipToHex(packet.targetIp).match(/.{1,2}/g) || ["C0", "A8", "01", "14"];
  tpaHex.forEach((b: string, idx: number) => {
    rawBytes.push({
      offset: 24 + idx,
      hex: b.toUpperCase(),
      fieldKey: "tpa",
      fieldName: "Target Protocol Addr (TPA)",
    });
  });

  const getFieldColor = (fieldKey: string) => {
    switch (fieldKey) {
      case "oper":
        return packet.opcode === 1
          ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
          : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
      case "sha":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/40";
      case "spa":
        return "bg-blue-500/20 text-blue-400 border-blue-500/40";
      case "tha":
        return "bg-pink-500/20 text-pink-400 border-pink-500/40";
      case "tpa":
        return "bg-purple-500/20 text-purple-400 border-purple-500/40";
      case "htype":
      case "ptype":
      case "hlen":
      case "plen":
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
            RFC 826 ARP Frame Inspector
          </h4>
        </div>
        <div className="flex items-center gap-1.5">
          {packet.opcode === 1 ? (
            <Badge variant="warning" className="text-[10px] font-mono">
              OPCODE 1: REQUEST
            </Badge>
          ) : (
            <Badge variant="success" className="text-[10px] font-mono">
              OPCODE 2: REPLY
            </Badge>
          )}
          {packet.isPoisoned && (
            <Badge variant="destructive" className="text-[10px] font-mono animate-pulse">
              POISONED
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

        {/* Layer 2 Ethernet Header Section */}
        <div className="p-2.5 rounded-lg bg-secondary/15 border border-border/70 flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
            <Layers className="h-3 w-3 text-primary" /> Layer 2: Ethernet II Header (14 Bytes)
          </span>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-1.5 rounded bg-card border border-border/60 flex flex-col">
              <span className="text-[9px] text-muted-foreground uppercase">Dest MAC</span>
              <span className="font-bold text-foreground truncate">
                {packet.destEthernetMac}
              </span>
            </div>
            <div className="p-1.5 rounded bg-card border border-border/60 flex flex-col">
              <span className="text-[9px] text-muted-foreground uppercase">Source MAC</span>
              <span className="font-bold text-foreground truncate">
                {packet.sourceEthernetMac}
              </span>
            </div>
            <div className="p-1.5 rounded bg-card border border-border/60 flex flex-col">
              <span className="text-[9px] text-muted-foreground uppercase">EtherType</span>
              <span className="font-bold text-primary">0x0806 (ARP)</span>
            </div>
          </div>
        </div>

        {/* 28-Byte Field Breakdown Grid */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
            <FileCode className="h-3 w-3 text-emerald-400" /> RFC 826 Payload Fields (28 Bytes)
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Sender SHA & SPA */}
            <div
              onMouseEnter={() => setActiveHighlightField("sha")}
              onMouseLeave={() => setActiveHighlightField(null)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                activeHighlightField === "sha"
                  ? "bg-cyan-500/15 border-cyan-500 shadow-xs"
                  : "bg-card border-border hover:border-cyan-500/50"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="font-semibold uppercase text-cyan-400">SHA (Sender MAC)</span>
                <span className="font-mono">6 Octets</span>
              </div>
              <div className="font-mono font-bold text-foreground text-xs mt-0.5 tracking-wider truncate">
                {packet.senderMac}
              </div>
            </div>

            <div
              onMouseEnter={() => setActiveHighlightField("spa")}
              onMouseLeave={() => setActiveHighlightField(null)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                activeHighlightField === "spa"
                  ? "bg-blue-500/15 border-blue-500 shadow-xs"
                  : "bg-card border-border hover:border-blue-500/50"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="font-semibold uppercase text-blue-400">SPA (Sender IP)</span>
                <span className="font-mono">4 Octets</span>
              </div>
              <div className="font-mono font-bold text-foreground text-xs mt-0.5">
                {packet.senderIp}
              </div>
            </div>

            {/* Target THA & TPA */}
            <div
              onMouseEnter={() => setActiveHighlightField("tha")}
              onMouseLeave={() => setActiveHighlightField(null)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                activeHighlightField === "tha"
                  ? "bg-pink-500/15 border-pink-500 shadow-xs"
                  : "bg-card border-border hover:border-pink-500/50"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="font-semibold uppercase text-pink-400">THA (Target MAC)</span>
                <span className="font-mono">6 Octets</span>
              </div>
              <div className="font-mono font-bold text-foreground text-xs mt-0.5 tracking-wider truncate">
                {packet.targetMac}
              </div>
            </div>

            <div
              onMouseEnter={() => setActiveHighlightField("tpa")}
              onMouseLeave={() => setActiveHighlightField(null)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                activeHighlightField === "tpa"
                  ? "bg-purple-500/15 border-purple-500 shadow-xs"
                  : "bg-card border-border hover:border-purple-500/50"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="font-semibold uppercase text-purple-400">TPA (Target IP)</span>
                <span className="font-mono">4 Octets</span>
              </div>
              <div className="font-mono font-bold text-foreground text-xs mt-0.5">
                {packet.targetIp}
              </div>
            </div>
          </div>
        </div>

        {/* Raw 28-Byte Hex Offset Grid */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
              <Binary className="h-3 w-3 text-primary" /> Wire Hex Dump (0x00 - 0x1B)
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              Hover byte to inspect field
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-950 border border-border/80 font-mono text-xs">
            <div className="grid grid-cols-7 sm:grid-cols-14 gap-1">
              {rawBytes.map((b) => {
                const isFieldActive =
                  activeHighlightField === b.fieldKey ||
                  (activeHighlightField === null && false);
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

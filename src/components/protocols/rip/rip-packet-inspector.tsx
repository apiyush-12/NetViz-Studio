"use client";

import React, { useState } from "react";
import {
  Layers,
  ChevronDown,
  ChevronRight,
  Route,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Tabs } from "@/components/ui";
import type { RipPacketData } from "@/features/protocols/rip/rip.types";
import { formatRipHexDump } from "@/features/protocols/rip/rip-engine";

interface RipPacketInspectorProps {
  packet?: RipPacketData;
}

export function RipPacketInspector({ packet }: RipPacketInspectorProps) {
  const [activeTab, setActiveTab] = useState<string>("bitfield");
  const [treeExpanded, setTreeExpanded] = useState<Record<string, boolean>>({
    eth: true,
    ip: true,
    udp: true,
    rip: true,
  });

  const toggleTree = (key: string) => {
    setTreeExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!packet) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="py-3 px-4 border-b border-border/60">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-400" />
            RIP Packet & RTE Inspector
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center text-xs text-muted-foreground">
          No in-flight RIP packet at this simulation step. Step forward to inspect live RIP response datagrams.
        </CardContent>
      </Card>
    );
  }

  const hexLines = formatRipHexDump(packet);

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="py-3 px-4 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                RIPv{packet.version} Response Inspector
                <Badge variant="default" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px] font-mono">
                  {packet.entries.length} RTE{packet.entries.length > 1 ? "s" : ""}
                </Badge>
              </CardTitle>
              <div className="text-[11px] text-muted-foreground font-mono">
                {packet.sourceIp}:520 → {packet.destIp}:520 (UDP)
              </div>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            tabs={[
              { id: "bitfield", label: "32-Bit Header" },
              { id: "tree", label: "Wireshark Tree" },
              { id: "hex", label: "Hex Dump" },
            ]}
          />
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs font-mono">
        {/* 1. 32-Bit Aligned Bitfield View */}
        {activeTab === "bitfield" && (
          <div className="space-y-3">
            {/* RIP Header (4 Bytes) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block font-sans">
                RIP Packet Header (4 Bytes / 32 Bits)
              </span>
              <div className="grid grid-cols-4 gap-1.5 text-center">
                <div className="p-2.5 rounded bg-blue-500/15 border border-blue-500/30">
                  <span className="text-[10px] text-blue-300/80 block">Command (8b)</span>
                  <span className="font-bold text-blue-300">
                    {packet.command} ({packet.command === 2 ? "Response" : "Request"})
                  </span>
                </div>
                <div className="p-2.5 rounded bg-blue-500/15 border border-blue-500/30">
                  <span className="text-[10px] text-blue-300/80 block">Version (8b)</span>
                  <span className="font-bold text-blue-300">{packet.version} (RIPv{packet.version})</span>
                </div>
                <div className="col-span-2 p-2.5 rounded bg-blue-500/15 border border-blue-500/30">
                  <span className="text-[10px] text-blue-300/80 block">Routing Domain / Zero (16b)</span>
                  <span className="font-bold text-blue-300">0x{packet.routingDomain.toString(16).padStart(4, "0")}</span>
                </div>
              </div>
            </div>

            {/* Route Table Entries (20 Bytes per RTE) */}
            <div className="space-y-2 pt-2 border-t border-border/50 font-sans">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Route Table Entries ({packet.entries.length} x 20 Bytes)
              </span>

              {packet.entries.map((rte, idx) => {
                const isPoison = rte.metric >= 16;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border font-mono space-y-2 ${
                      isPoison
                        ? "bg-red-500/10 border-red-500/30"
                        : "bg-secondary/20 border-border/50"
                    }`}
                  >
                    <div className="flex items-center justify-between font-sans">
                      <div className="flex items-center gap-2">
                        <Route className="h-3.5 w-3.5 text-blue-400" />
                        <span className="font-bold text-xs text-foreground font-mono">
                          RTE #{idx + 1}: {rte.ipAddress}/{rte.subnetMask}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          isPoison
                            ? "bg-red-500/20 text-red-400 border-red-500/30 text-[10px]"
                            : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]"
                        }
                      >
                        Metric: {rte.metric} {isPoison ? "(POISON / INFINITY)" : "Hops"}
                      </Badge>
                    </div>

                    {/* 32-bit aligned 20-byte RTE grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center text-[11px]">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block">AFI (16b)</span>
                        <span className="font-bold text-slate-200">2 (IPv4)</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block">Route Tag (16b)</span>
                        <span className="font-bold text-purple-300">
                          {rte.routeTag ? `0x${rte.routeTag.toString(16).padStart(4, "0")}` : "0x0000"}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block">Subnet Mask (32b)</span>
                        <span className="font-bold text-slate-200">{rte.subnetMask}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block">Next Hop (32b)</span>
                        <span className="font-bold text-slate-200">{rte.nextHop}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Wireshark Protocol Hierarchy Tree */}
        {activeTab === "tree" && (
          <div className="space-y-1.5 font-mono text-xs">
            {/* Ethernet II */}
            <div className="rounded border border-border/50 bg-secondary/15 p-2">
              <button
                type="button"
                onClick={() => toggleTree("eth")}
                className="flex items-center gap-1.5 w-full text-left font-semibold text-foreground cursor-pointer"
              >
                {treeExpanded.eth ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                Frame: Ethernet II (Dst: 01:00:5e:00:00:09, Type: IPv4 0x0800)
              </button>
            </div>

            {/* IPv4 */}
            <div className="rounded border border-border/50 bg-secondary/15 p-2">
              <button
                type="button"
                onClick={() => toggleTree("ip")}
                className="flex items-center gap-1.5 w-full text-left font-semibold text-foreground cursor-pointer"
              >
                {treeExpanded.ip ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                Internet Protocol Version 4 (Src: {packet.sourceIp}, Dst: {packet.destIp}, Protocol: UDP 17, TTL: 2)
              </button>
              {treeExpanded.ip && (
                <div className="pl-6 pt-1.5 space-y-0.5 text-[11px] text-muted-foreground">
                  <div>Protocol: UDP (17)</div>
                  <div>Header Checksum: Valid</div>
                  <div>Time to Live (TTL): 2 (Local link scope)</div>
                </div>
              )}
            </div>

            {/* UDP */}
            <div className="rounded border border-border/50 bg-secondary/15 p-2">
              <button
                type="button"
                onClick={() => toggleTree("udp")}
                className="flex items-center gap-1.5 w-full text-left font-semibold text-foreground cursor-pointer"
              >
                {treeExpanded.udp ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                User Datagram Protocol (Src Port: 520, Dst Port: 520, Len: {packet.packetLength + 8})
              </button>
            </div>

            {/* RIPv2 Protocol */}
            <div className="rounded border border-blue-500/30 bg-blue-500/10 p-2 text-blue-300">
              <button
                type="button"
                onClick={() => toggleTree("rip")}
                className="flex items-center gap-1.5 w-full text-left font-semibold text-blue-300 cursor-pointer"
              >
                {treeExpanded.rip ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                Routing Information Protocol (RIPv{packet.version}) — RFC 2453
              </button>
              {treeExpanded.rip && (
                <div className="pl-6 pt-1.5 space-y-1 text-[11px] text-blue-200/80">
                  <div>Command: {packet.command === 2 ? "Response (2)" : "Request (1)"}</div>
                  <div>Version: {packet.version}</div>
                  <div>Routing Domain: 0x{packet.routingDomain.toString(16).padStart(4, "0")}</div>
                  <div className="pt-1">
                    <span className="font-bold">Route Table Entries:</span>
                    <ul className="list-disc pl-4 space-y-0.5 mt-0.5 text-foreground">
                      {packet.entries.map((rte, idx) => (
                        <li key={idx}>
                          IP: {rte.ipAddress}/{rte.subnetMask} | Metric: {rte.metric} | Next-Hop: {rte.nextHop}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Wire Hex Dump */}
        {activeTab === "hex" && (
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] overflow-x-auto space-y-0.5 text-slate-300">
            {hexLines.map((line, idx) => (
              <div key={idx} className="leading-tight hover:bg-slate-900 px-1 rounded">
                {line}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

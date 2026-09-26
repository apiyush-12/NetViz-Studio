"use client";

import React, { useState } from "react";
import {
  Layers,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Tabs } from "@/components/ui";
import type { IcmpPacketData } from "@/features/protocols/icmp/icmp.types";
import { formatIcmpHexDump } from "@/features/protocols/icmp/icmp-engine";

interface IcmpPacketInspectorProps {
  packet?: IcmpPacketData;
}

export function IcmpPacketInspector({ packet }: IcmpPacketInspectorProps) {
  const [activeInspectorTab, setActiveInspectorTab] = useState<string>("bitfield");
  const [treeExpanded, setTreeExpanded] = useState<Record<string, boolean>>({
    eth: true,
    ip: true,
    icmp: true,
    quote: true,
  });

  const toggleTree = (key: string) => {
    setTreeExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!packet) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-8 text-center text-muted-foreground text-xs">
          No packet in flight. Step through the timeline to inspect live 32-bit aligned ICMP headers.
        </CardContent>
      </Card>
    );
  }

  const h = packet.icmpHeader;
  const hexDump = formatIcmpHexDump(packet);

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="py-3 px-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                RFC 792 / RFC 1191 ICMP Header Inspector
                <Badge variant="outline" className="text-[10px] font-mono">
                  {h.typeName}
                </Badge>
              </CardTitle>
              <span className="text-[11px] text-muted-foreground">
                32-Bit Aligned Structure, Error Message Quoting, & Wire Hex Dump
              </span>
            </div>
          </div>

          <Badge
            variant="default"
            className={
              packet.isErrorResponse
                ? "bg-amber-500/20 text-amber-400 border-amber-500/30 font-mono text-xs"
                : h.type === 0
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-mono text-xs"
                : "bg-blue-500/20 text-blue-400 border-blue-500/30 font-mono text-xs"
            }
          >
            Type: {h.type} • Code: {h.code}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs">
        {/* View Switcher Tabs */}
        <Tabs
          value={activeInspectorTab}
          onValueChange={setActiveInspectorTab}
          tabs={[
            { id: "bitfield", label: "32-Bit Bitfield Grid" },
            { id: "wireshark", label: "Wireshark Protocol Tree" },
            { id: "hexdump", label: "Wire Hex Dump" },
          ]}
        />

        {/* 1. BITFIELD VIEW */}
        {activeInspectorTab === "bitfield" && (
          <div className="space-y-3">
            {/* 32-Bit Aligned Visual Header */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono px-1">
                <span>Bit 0</span>
                <span>Bit 7</span>
                <span>Bit 8</span>
                <span>Bit 15</span>
                <span>Bit 16</span>
                <span>Bit 31</span>
              </div>

              {/* Row 1: Type (8b) | Code (8b) | Checksum (16b) */}
              <div className="grid grid-cols-12 gap-1.5 font-mono text-center text-xs font-semibold">
                <div className="col-span-3 p-2.5 rounded-lg bg-blue-500/15 border-2 border-blue-500/40 text-blue-400 space-y-0.5">
                  <div className="text-[9px] uppercase tracking-wider text-blue-300">Type (8b)</div>
                  <div className="text-base font-bold text-blue-300">{h.type}</div>
                  <div className="text-[9px] text-blue-400/80">0x{h.type.toString(16).padStart(2, "0").toUpperCase()}</div>
                </div>

                <div className="col-span-3 p-2.5 rounded-lg bg-indigo-500/15 border-2 border-indigo-500/40 text-indigo-400 space-y-0.5">
                  <div className="text-[9px] uppercase tracking-wider text-indigo-300">Code (8b)</div>
                  <div className="text-base font-bold text-indigo-300">{h.code}</div>
                  <div className="text-[9px] text-indigo-400/80">0x{h.code.toString(16).padStart(2, "0").toUpperCase()}</div>
                </div>

                <div className="col-span-6 p-2.5 rounded-lg bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-400 space-y-0.5">
                  <div className="text-[9px] uppercase tracking-wider text-emerald-300">Checksum (16b)</div>
                  <div className="text-base font-bold text-emerald-300">0x{h.checksum.toString(16).padStart(4, "0").toUpperCase()}</div>
                  <div className="text-[9px] text-emerald-400/80">RFC 1071 (Verified Correct)</div>
                </div>
              </div>

              {/* Row 2: Message-Specific 32-Bit Field */}
              <div className="grid grid-cols-12 gap-1.5 font-mono text-center text-xs font-semibold pt-1">
                {h.identifier !== undefined && h.sequenceNumber !== undefined ? (
                  <>
                    <div className="col-span-6 p-2.5 rounded-lg bg-purple-500/15 border-2 border-purple-500/40 text-purple-400 space-y-0.5">
                      <div className="text-[9px] uppercase tracking-wider text-purple-300">Identifier (16b)</div>
                      <div className="text-base font-bold text-purple-300">0x{h.identifier.toString(16).padStart(4, "0").toUpperCase()}</div>
                      <div className="text-[9px] text-purple-400/80">Process ID / Session</div>
                    </div>
                    <div className="col-span-6 p-2.5 rounded-lg bg-purple-500/15 border-2 border-purple-500/40 text-purple-400 space-y-0.5">
                      <div className="text-[9px] uppercase tracking-wider text-purple-300">Sequence Number (16b)</div>
                      <div className="text-base font-bold text-purple-300">{h.sequenceNumber}</div>
                      <div className="text-[9px] text-purple-400/80">Probe Counter</div>
                    </div>
                  </>
                ) : h.nextHopMtu !== undefined ? (
                  <>
                    <div className="col-span-6 p-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-500 space-y-0.5">
                      <div className="text-[9px] uppercase tracking-wider">Unused (16b)</div>
                      <div className="text-base font-bold">0x0000</div>
                    </div>
                    <div className="col-span-6 p-2.5 rounded-lg bg-amber-500/15 border-2 border-amber-500/40 text-amber-400 space-y-0.5">
                      <div className="text-[9px] uppercase tracking-wider text-amber-300">Next-Hop MTU (16b)</div>
                      <div className="text-base font-bold text-amber-300">{h.nextHopMtu} Bytes</div>
                      <div className="text-[9px] text-amber-400/80">RFC 1191 PMTUD Feedback</div>
                    </div>
                  </>
                ) : h.gatewayAddress !== undefined ? (
                  <div className="col-span-12 p-2.5 rounded-lg bg-purple-500/15 border-2 border-purple-500/40 text-purple-400 space-y-0.5">
                    <div className="text-[9px] uppercase tracking-wider text-purple-300">Gateway Internet Address (32b)</div>
                    <div className="text-base font-bold text-purple-300">{h.gatewayAddress}</div>
                    <div className="text-[9px] text-purple-400/80">Direct Next-Hop Router Address</div>
                  </div>
                ) : (
                  <div className="col-span-12 p-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-500 space-y-0.5">
                    <div className="text-[9px] uppercase tracking-wider">Unused / Reserved (32b)</div>
                    <div className="text-base font-bold">0x00000000</div>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message Quoted Original Datagram Card */}
            {h.originalIpHeader && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-300 text-xs">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>RFC 792 Quoted Original Datagram (First 64 Bits of Payload)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono bg-background/60 p-2 rounded border border-border/40">
                  <div>
                    <span className="text-[9px] text-muted-foreground block">ORIGINAL SRC</span>
                    <span className="text-foreground font-semibold">{h.originalIpHeader.sourceIp}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground block">ORIGINAL DST</span>
                    <span className="text-foreground font-semibold">{h.originalIpHeader.destIp}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground block">L4 PROTOCOL</span>
                    <span className="text-blue-400 font-semibold">{h.originalIpHeader.protocolName} ({h.originalIpHeader.protocol})</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground block">ORIGINAL LENGTH</span>
                    <span className="text-foreground font-semibold">{h.originalIpHeader.totalLength} Bytes</span>
                  </div>
                </div>
                {h.originalPayloadFirst8Bytes && (
                  <div className="text-[10px] text-muted-foreground font-mono">
                    Quoted Payload Snippet: <code className="text-foreground font-semibold">{h.originalPayloadFirst8Bytes}</code>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. WIRESHARK PROTOCOL TREE */}
        {activeInspectorTab === "wireshark" && (
          <div className="space-y-2 font-mono text-xs bg-background/60 p-3 rounded-lg border border-border/60">
            {/* Ethernet II */}
            <div className="border-b border-border/40 pb-2">
              <button
                onClick={() => toggleTree("eth")}
                className="flex items-center gap-1.5 text-foreground font-semibold hover:text-primary cursor-pointer w-full text-left"
              >
                {treeExpanded.eth ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                <span>Ethernet II, Src: 00:11:22:33:44:55, Dst: 00:1a:2b:3c:4d:5e</span>
              </button>
              {treeExpanded.eth && (
                <div className="pl-6 pt-1 text-[11px] text-muted-foreground space-y-0.5">
                  <div>Destination: 00:1a:2b:3c:4d:5e</div>
                  <div>Source: 00:11:22:33:44:55</div>
                  <div>Type: IPv4 (0x0800)</div>
                </div>
              )}
            </div>

            {/* IPv4 */}
            <div className="border-b border-border/40 pb-2">
              <button
                onClick={() => toggleTree("ip")}
                className="flex items-center gap-1.5 text-blue-400 font-semibold hover:text-blue-300 cursor-pointer w-full text-left"
              >
                {treeExpanded.ip ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                <span>Internet Protocol Version 4, Src: {packet.sourceIp}, Dst: {packet.destIp}</span>
              </button>
              {treeExpanded.ip && (
                <div className="pl-6 pt-1 text-[11px] text-muted-foreground space-y-0.5">
                  <div>Version: 4, Header Length: 20 bytes</div>
                  <div>Total Length: {packet.totalLengthBytes} bytes</div>
                  <div>Flags: {packet.ipDontFragment ? "0x4000, Don't Fragment (DF=1)" : "0x0000 (Allow Fragment)"}</div>
                  <div>Time to Live (TTL): {packet.ipTtl}</div>
                  <div>Protocol: ICMP (1)</div>
                </div>
              )}
            </div>

            {/* ICMP */}
            <div className="border-b border-border/40 pb-2">
              <button
                onClick={() => toggleTree("icmp")}
                className="flex items-center gap-1.5 text-emerald-400 font-semibold hover:text-emerald-300 cursor-pointer w-full text-left"
              >
                {treeExpanded.icmp ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                <span>Internet Control Message Protocol ({h.typeName})</span>
              </button>
              {treeExpanded.icmp && (
                <div className="pl-6 pt-1 text-[11px] text-muted-foreground space-y-0.5">
                  <div>Type: <strong className="text-foreground">{h.type}</strong> ({h.typeName})</div>
                  <div>Code: <strong className="text-foreground">{h.code}</strong></div>
                  <div>Checksum: 0x{h.checksum.toString(16).padStart(4, "0")} [correct]</div>
                  {h.identifier !== undefined && <div>Identifier (BE): {h.identifier} (0x{h.identifier.toString(16)})</div>}
                  {h.sequenceNumber !== undefined && <div>Sequence Number (BE): {h.sequenceNumber}</div>}
                  {h.nextHopMtu !== undefined && <div>Next-Hop MTU: <strong className="text-amber-300">{h.nextHopMtu} bytes</strong></div>}
                  {h.gatewayAddress !== undefined && <div>Gateway IP: <strong className="text-purple-300">{h.gatewayAddress}</strong></div>}
                </div>
              )}
            </div>

            {/* Quoted Header if error */}
            {h.originalIpHeader && (
              <div>
                <button
                  onClick={() => toggleTree("quote")}
                  className="flex items-center gap-1.5 text-amber-400 font-semibold hover:text-amber-300 cursor-pointer w-full text-left"
                >
                  {treeExpanded.quote ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  <span>Quoted IP Packet: Src {h.originalIpHeader.sourceIp} -&gt; Dst {h.originalIpHeader.destIp}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. WIRE HEX DUMP */}
        {activeInspectorTab === "hexdump" && (
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-black/80 font-mono text-xs text-emerald-400 border border-border overflow-x-auto whitespace-pre leading-relaxed">
              {hexDump}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

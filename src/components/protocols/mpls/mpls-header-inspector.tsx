"use client";

import React, { useState } from "react";
import {
  Layers,
  Binary,
  CheckCircle2,
  Shield,
  FileCode,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Tabs } from "@/components/ui";
import type { MplsPacketData, MplsShimHeader } from "@/features/protocols/mpls/mpls.types";
import { encodeShimHeaderToBytes, formatMplsHexDump } from "@/features/protocols/mpls/mpls-engine";

interface MplsHeaderInspectorProps {
  packet?: MplsPacketData;
}

export function MplsHeaderInspector({ packet }: MplsHeaderInspectorProps) {
  const [activeInspectorTab, setActiveInspectorTab] = useState<string>("bitfield");
  const [selectedShimIndex, setSelectedShimIndex] = useState<number>(0);
  const [treeExpanded, setTreeExpanded] = useState<Record<string, boolean>>({
    eth: true,
    mpls: true,
    ip: true,
    payload: true,
  });

  const toggleTree = (key: string) => {
    setTreeExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!packet) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-8 text-center text-muted-foreground text-xs">
          No packet in flight. Step through the timeline to inspect live 32-bit MPLS shim headers.
        </CardContent>
      </Card>
    );
  }

  const labelStack = packet.labelStack || [];
  const currentShim: MplsShimHeader | undefined =
    labelStack[selectedShimIndex] || labelStack[0];

  const shimEncoded = currentShim ? encodeShimHeaderToBytes(currentShim) : null;
  const hexDump = formatMplsHexDump(packet);

  const getTrafficClassDescription = (tc: number) => {
    switch (tc) {
      case 0:
        return "Best Effort (BE / CS0 / DSCP 0)";
      case 1:
        return "Priority 1 (CS1 / Scavenger)";
      case 2:
        return "Priority 2 (CS2 / Low Latency)";
      case 3:
        return "Priority 3 (CS3 / Video Streaming)";
      case 4:
        return "Priority 4 (CS4 / Real-Time Interactive)";
      case 5:
        return "Priority 5 (EF / Expedited Forwarding / Voice)";
      case 6:
        return "Priority 6 (CS6 / Network Control IGP)";
      case 7:
        return "Priority 7 (CS7 / Reserved High Priority)";
      default:
        return `EXP ${tc}`;
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="py-3 px-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                RFC 3032 MPLS Shim Header Inspector
                <Badge variant="outline" className="text-[10px] font-mono">
                  Stack Depth: {labelStack.length} {labelStack.length === 1 ? "Label" : "Labels"}
                </Badge>
              </CardTitle>
              <span className="text-[11px] text-muted-foreground">
                32-Bit Bitfield Structure, Wireshark Protocol Hierarchy, & Wire Hex Dump
              </span>
            </div>
          </div>

          <Badge
            variant="default"
            className={
              labelStack.length > 0
                ? "bg-blue-500/20 text-blue-400 border-blue-500/30 font-mono text-xs"
                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-mono text-xs"
            }
          >
            {labelStack.length > 0 ? "EtherType: 0x8847 (MPLS)" : "EtherType: 0x0800 (IPv4)"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs">
        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between">
          <Tabs
            value={activeInspectorTab}
            onValueChange={setActiveInspectorTab}
            tabs={[
              { id: "bitfield", label: "32-Bit Bitfield Grid" },
              { id: "wireshark", label: "Wireshark Protocol Tree" },
              { id: "hexdump", label: "Wire Hex Dump" },
            ]}
          />

          {/* If Multi-Label Stack, show layer switcher */}
          {labelStack.length > 1 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">Layer:</span>
              {labelStack.map((shim, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedShimIndex(idx)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors cursor-pointer ${
                    selectedShimIndex === idx
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-secondary/40 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {idx === 0 ? "Top (Outer)" : idx === labelStack.length - 1 ? "Bottom (Inner)" : `Mid ${idx}`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 1. BITFIELD VIEW */}
        {activeInspectorTab === "bitfield" && (
          <div className="space-y-3">
            {labelStack.length === 0 ? (
              <div className="p-6 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-center space-y-1">
                <span className="font-semibold text-emerald-400 block text-xs">
                  Native IPv4 Datagram (No MPLS Header)
                </span>
                <p className="text-[11px] text-muted-foreground">
                  This packet is untagged and routed natively via standard Layer 3 IP forwarding.
                </p>
              </div>
            ) : currentShim && shimEncoded ? (
              <>
                {/* 32-Bit Visual Grid */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono px-1">
                    <span>Bit 0</span>
                    <span>Bit 19</span>
                    <span>Bit 20</span>
                    <span>Bit 22</span>
                    <span>Bit 23</span>
                    <span>Bit 24</span>
                    <span>Bit 31</span>
                  </div>

                  <div className="grid grid-cols-12 gap-1.5 font-mono text-center text-xs font-semibold">
                    {/* Label (20 Bits) - Columns 1 to 7 */}
                    <div className="col-span-7 p-2.5 rounded-lg bg-blue-500/15 border-2 border-blue-500/40 text-blue-400 space-y-1">
                      <div className="text-[10px] uppercase tracking-wider text-blue-300">
                        Label Value (20 Bits)
                      </div>
                      <div className="text-base font-bold text-blue-300">
                        {currentShim.label}
                      </div>
                      <div className="text-[9px] text-blue-400/80">
                        0x{currentShim.label.toString(16).toUpperCase()} • {currentShim.labelName || "FEC Index"}
                      </div>
                    </div>

                    {/* EXP / Traffic Class (3 Bits) - Columns 8 to 9 */}
                    <div className="col-span-2 p-2.5 rounded-lg bg-purple-500/15 border-2 border-purple-500/40 text-purple-400 space-y-1">
                      <div className="text-[10px] uppercase tracking-wider text-purple-300">
                        TC/EXP (3b)
                      </div>
                      <div className="text-base font-bold text-purple-300">
                        {currentShim.trafficClass}
                      </div>
                      <div className="text-[9px] text-purple-400/80">
                        CoS {currentShim.trafficClass}
                      </div>
                    </div>

                    {/* S-Bit (1 Bit) - Column 10 */}
                    <div
                      className={`col-span-1 p-2.5 rounded-lg border-2 text-center space-y-1 ${
                        currentShim.bottomOfStack
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                          : "bg-amber-500/15 border-amber-500/40 text-amber-400"
                      }`}
                    >
                      <div className="text-[9px] uppercase tracking-wider">
                        S (1b)
                      </div>
                      <div className="text-base font-bold">
                        {currentShim.bottomOfStack ? "1" : "0"}
                      </div>
                      <div className="text-[8px]">
                        {currentShim.bottomOfStack ? "Bottom" : "More"}
                      </div>
                    </div>

                    {/* TTL (8 Bits) - Columns 11 to 12 */}
                    <div className="col-span-2 p-2.5 rounded-lg bg-red-500/15 border-2 border-red-500/40 text-red-400 space-y-1">
                      <div className="text-[10px] uppercase tracking-wider text-red-300">
                        TTL (8 Bits)
                      </div>
                      <div className="text-base font-bold text-red-300">
                        {currentShim.ttl}
                      </div>
                      <div className="text-[9px] text-red-400/80">
                        0x{currentShim.ttl.toString(16).toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Field Details Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-lg bg-secondary/20 border border-border/50 space-y-1">
                    <span className="text-[11px] font-semibold text-blue-400 flex items-center gap-1.5">
                      <Binary className="h-3.5 w-3.5" />
                      Label Value: {currentShim.label}
                    </span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {currentShim.label === 3 ? (
                        <strong className="text-purple-400">
                          Reserved Label 3 (Implicit Null) — Instructs penultimate LSR to pop label before egress.
                        </strong>
                      ) : currentShim.label === 0 ? (
                        <strong className="text-blue-400">
                          Reserved Label 0 (IPv4 Explicit Null) — Preserves EXP/QoS bits to egress.
                        </strong>
                      ) : currentShim.label < 16 ? (
                        <span className="text-amber-400">Reserved Label (0-15) per RFC 3032.</span>
                      ) : (
                        <span>Dynamic LSP Label allocated via LDP / MP-BGP. Max range is 1,048,575 ($2^{20}-1$).</span>
                      )}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-secondary/20 border border-border/50 space-y-1">
                    <span className="text-[11px] font-semibold text-purple-400 flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5" />
                      Traffic Class / EXP: {currentShim.trafficClass} ({getTrafficClassDescription(currentShim.trafficClass)})
                    </span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Maps to Differentiated Services Code Point (DSCP) for QoS prioritization and DiffServ Per-Hop Behaviors (PHB).
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-secondary/20 border border-border/50 space-y-1">
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Bottom of Stack (S-Bit): {currentShim.bottomOfStack ? "1 (TRUE)" : "0 (FALSE)"}
                    </span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {currentShim.bottomOfStack
                        ? "S=1: This is the innermost MPLS label. The next payload is the native IPv4/IPv6 packet."
                        : "S=0: More MPLS shim headers follow in the stack (e.g. Inner VPN or Transport label)."}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-secondary/20 border border-border/50 space-y-1">
                    <span className="text-[11px] font-semibold text-red-400 flex items-center gap-1.5">
                      <FileCode className="h-3.5 w-3.5" />
                      Time to Live (TTL): {currentShim.ttl} Hops
                    </span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Decremented at each LSR hop to prevent forwarding loops. Propagated via Uniform or Pipe mode (RFC 3443).
                    </p>
                  </div>
                </div>
              </>
            ) : null}
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
                  <div>
                    Type: <span className="text-foreground">{labelStack.length > 0 ? "MPLS Unicast (0x8847)" : "IPv4 (0x0800)"}</span>
                  </div>
                </div>
              )}
            </div>

            {/* MPLS Headers */}
            {labelStack.length > 0 && (
              <div className="border-b border-border/40 pb-2">
                <button
                  onClick={() => toggleTree("mpls")}
                  className="flex items-center gap-1.5 text-blue-400 font-semibold hover:text-blue-300 cursor-pointer w-full text-left"
                >
                  {treeExpanded.mpls ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  <span>MultiProtocol Label Switching Header ({labelStack.length} Labels Stacked)</span>
                </button>
                {treeExpanded.mpls && (
                  <div className="pl-6 pt-1 text-[11px] text-muted-foreground space-y-1.5">
                    {labelStack.map((shim, sIdx) => (
                      <div key={sIdx} className="p-1.5 rounded bg-blue-500/10 border border-blue-500/20 space-y-0.5">
                        <div className="text-blue-300 font-semibold">
                          [Label {sIdx + 1}: {shim.labelName || `Label ${shim.label}`}]
                        </div>
                        <div className="pl-2 space-y-0.5">
                          <div>.... .... .... .... .... {shim.label.toString(2).padStart(20, "0")} = MPLS Label: <strong className="text-blue-300">{shim.label}</strong></div>
                          <div>.... .... .... .... .... .... .... . {shim.trafficClass.toString(2).padStart(3, "0")}. = Traffic Class / EXP: {shim.trafficClass}</div>
                          <div>.... .... .... .... .... .... .... .... ...{shim.bottomOfStack ? "1" : "0"} = Bottom of Stack (S): <strong className={shim.bottomOfStack ? "text-emerald-400" : "text-amber-400"}>{shim.bottomOfStack ? "1 (Bottom of Stack)" : "0 (Inner Label Follows)"}</strong></div>
                          <div>Time to Live (TTL): <strong className="text-red-400">{shim.ttl}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* IPv4 Payload Header */}
            <div className="border-b border-border/40 pb-2">
              <button
                onClick={() => toggleTree("ip")}
                className="flex items-center gap-1.5 text-emerald-400 font-semibold hover:text-emerald-300 cursor-pointer w-full text-left"
              >
                {treeExpanded.ip ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                <span>Internet Protocol Version 4, Src: {packet.sourceIp}, Dst: {packet.destIp}</span>
              </button>
              {treeExpanded.ip && (
                <div className="pl-6 pt-1 text-[11px] text-muted-foreground space-y-0.5">
                  <div>Version: 4</div>
                  <div>Header Length: 20 bytes (5)</div>
                  <div>Total Length: 60 bytes</div>
                  <div>Time to Live: {packet.ipTtl}</div>
                  <div>Protocol: {packet.payloadType === "ICMP_ECHO" ? "ICMP (1)" : packet.payloadType === "TCP_DATA" ? "TCP (6)" : "UDP (17)"}</div>
                  <div>Source Address: {packet.sourceIp}</div>
                  <div>Destination Address: {packet.destIp}</div>
                  {packet.customerName && <div>Customer VRF: <span className="text-purple-400">{packet.customerName}</span></div>}
                </div>
              )}
            </div>

            {/* Application / Transport Payload */}
            <div>
              <button
                onClick={() => toggleTree("payload")}
                className="flex items-center gap-1.5 text-foreground font-semibold hover:text-primary cursor-pointer w-full text-left"
              >
                {treeExpanded.payload ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                <span>Payload: {packet.payloadSummary}</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. WIRE HEX DUMP */}
        {activeInspectorTab === "hexdump" && (
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-black/80 font-mono text-xs text-emerald-400 border border-border overflow-x-auto whitespace-pre leading-relaxed">
              {hexDump}
            </div>
            <p className="text-[11px] text-muted-foreground">
              EtherType <code>0x8847</code> signifies an RFC 3032 MPLS Unicast shim header immediately preceding the L3 payload.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

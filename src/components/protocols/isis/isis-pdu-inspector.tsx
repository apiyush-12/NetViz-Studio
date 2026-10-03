"use client";

import React, { useState } from "react";
import {
  Layers,
  ChevronDown,
  ChevronRight,
  Shield,
  Tag,
  Radio,
  Clock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Tabs } from "@/components/ui";
import type { IsisPduData, IsisTlv } from "@/features/protocols/isis/isis.types";
import { formatIsisHexDump } from "@/features/protocols/isis/isis-engine";

interface IsisPduInspectorProps {
  pdu?: IsisPduData;
}

export function IsisPduInspector({ pdu }: IsisPduInspectorProps) {
  const [activeTab, setActiveTab] = useState<string>("bitfield");
  const [expandedTlvs, setExpandedTlvs] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
  });

  const toggleTlv = (idx: number) => {
    setExpandedTlvs((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (!pdu) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="py-3 px-4 border-b border-border/60">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-400" />
            IS-IS PDU & TLV Inspector
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center text-xs text-muted-foreground">
          No in-flight IS-IS PDU at this simulation step. Step forward or scrub through the timeline to inspect Link State PDUs (LSPs), IIH Hellos, and CSNPs.
        </CardContent>
      </Card>
    );
  }

  const hexLines = formatIsisHexDump(pdu);

  const getPduBadgeVariant = (type: IsisPduData["pduType"], typeName?: string) => {
    const name = typeName || "";
    if (type === 18 || name.includes("L1_LSP")) {
      return { bg: "bg-emerald-500/20", border: "border-emerald-500/30", text: "text-emerald-400", label: "Level 1 LSP" };
    }
    if (type === 20 || name.includes("L2_LSP")) {
      return { bg: "bg-blue-500/20", border: "border-blue-500/30", text: "text-blue-400", label: "Level 2 LSP" };
    }
    if (type === 15 || type === 16 || name.includes("LAN_IIH")) {
      return { bg: "bg-purple-500/20", border: "border-purple-500/30", text: "text-purple-400", label: "LAN Hello (IIH)" };
    }
    if (type === 17 || name.includes("P2P_IIH")) {
      return { bg: "bg-indigo-500/20", border: "border-indigo-500/30", text: "text-indigo-400", label: "P2P Hello (IIH)" };
    }
    if (type === 24 || type === 25 || name.includes("CSNP")) {
      return { bg: "bg-amber-500/20", border: "border-amber-500/30", text: "text-amber-400", label: "CSNP Database Sync" };
    }
    if (type === 26 || type === 27 || name.includes("PSNP")) {
      return { bg: "bg-rose-500/20", border: "border-rose-500/30", text: "text-rose-400", label: "PSNP Ack / Req" };
    }
    return { bg: "bg-slate-500/20", border: "border-slate-500/30", text: "text-slate-400", label: name || `PDU Type ${type}` };
  };

  const badgeStyle = getPduBadgeVariant(pdu.pduType, pdu.pduTypeName);

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="py-3 px-4 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${badgeStyle.bg} ${badgeStyle.text} border ${badgeStyle.border}`}>
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                IS-IS {pdu.pduType} Inspector
                <Badge variant="default" className={`${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border} text-[10px] font-mono`}>
                  {badgeStyle.label}
                </Badge>
                {pdu.tlvs && pdu.tlvs.length > 0 && (
                  <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                    {pdu.tlvs.length} TLV{pdu.tlvs.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </CardTitle>
              <div className="text-[11px] text-muted-foreground font-mono">
                Source: <span className="text-foreground">{pdu.sourceSystemId}</span> → Dest: <span className="text-foreground">{pdu.destMacOrSystemId}</span> (OSI LLC 0xFEFE / NLPID 0x83)
              </div>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            tabs={[
              { id: "bitfield", label: "32-Bit PDU Header" },
              { id: "tlv", label: "TLV Tree Decoder" },
              { id: "hex", label: "OSI Frame Hex Dump" },
            ]}
          />
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs font-mono">
        {/* TAB 1: 32-Bit Aligned PDU Structure */}
        {activeTab === "bitfield" && (
          <div className="space-y-4">
            {/* Generic 8-Byte Fixed IS-IS Header */}
            <div className="space-y-1.5 font-sans">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-emerald-400" />
                  IS-IS Generic Header (8 Octets / 64 Bits — ISO/IEC 10589)
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">Layer 2 LLC / NLPID Framing</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-xs">
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400/80 block font-sans">IntraDomain RPID (8b)</span>
                  <span className="font-bold text-emerald-300">0x{pdu.genericHeader.nlpid.toString(16).toUpperCase()} (IS-IS)</span>
                </div>
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400/80 block font-sans">Length Indicator (8b)</span>
                  <span className="font-bold text-emerald-300">{pdu.genericHeader.lengthIndicator} Bytes</span>
                </div>
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400/80 block font-sans">Version / Proto Ext (8b)</span>
                  <span className="font-bold text-emerald-300">0x0{pdu.genericHeader.version}</span>
                </div>
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400/80 block font-sans">ID Length (8b)</span>
                  <span className="font-bold text-emerald-300">{pdu.genericHeader.idLength} (6-Byte SystemID)</span>
                </div>

                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400/80 block font-sans">PDU Type (8b)</span>
                  <span className="font-bold text-emerald-300">{pdu.pduType}</span>
                </div>
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400/80 block font-sans">PDU Version (8b)</span>
                  <span className="font-bold text-emerald-300">0x0{pdu.genericHeader.version2}</span>
                </div>
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400/80 block font-sans">Reserved (8b)</span>
                  <span className="font-bold text-emerald-300">0x00</span>
                </div>
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400/80 block font-sans">Max Area Addresses (8b)</span>
                  <span className="font-bold text-emerald-300">{pdu.genericHeader.maxAreaAddresses} (3 max)</span>
                </div>
              </div>
            </div>

            {/* PDU-Specific Header (LSP Header or Hello Header or CSNP Header) */}
            {pdu.lspHeader && (
              <div className="space-y-2 pt-2 border-t border-border/50 font-sans">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-blue-400" />
                  LSP Specific Header (19 Octets)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center font-mono text-xs">
                  <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30">
                    <span className="text-[10px] text-blue-400/80 block font-sans">PDU Length (16b)</span>
                    <span className="font-bold text-blue-300">{pdu.lspHeader.pduLength} Bytes</span>
                  </div>
                  <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30">
                    <span className="text-[10px] text-blue-400/80 block font-sans">Remaining Lifetime (16b)</span>
                    <span className="font-bold text-blue-300">{pdu.lspHeader.remainingLifetime}s</span>
                  </div>
                  <div className="col-span-2 p-2 rounded bg-blue-500/10 border border-blue-500/30">
                    <span className="text-[10px] text-blue-400/80 block font-sans">LSP ID (64b SystemID.Pseudonode-Frag)</span>
                    <span className="font-bold text-blue-300">{pdu.lspHeader.lspId}</span>
                  </div>

                  <div className="col-span-2 p-2 rounded bg-blue-500/10 border border-blue-500/30">
                    <span className="text-[10px] text-blue-400/80 block font-sans">Sequence Number (32b)</span>
                    <span className="font-bold text-blue-300">0x{pdu.lspHeader.sequenceNumber.toString(16).padStart(8, "0").toUpperCase()}</span>
                  </div>
                  <div className="col-span-2 p-2 rounded bg-blue-500/10 border border-blue-500/30">
                    <span className="text-[10px] text-blue-400/80 block font-sans">Fletcher Checksum (16b)</span>
                    <span className="font-bold text-blue-300">0x{pdu.lspHeader.checksum.toString(16).padStart(4, "0").toUpperCase()}</span>
                  </div>
                </div>

                {/* LSP Flags Breakdown (ATT, OL, IS-Type) */}
                <div className="p-3 rounded-lg bg-secondary/30 border border-border/60 space-y-2">
                  <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider block font-sans">
                    LSP Type-Block Flags (Octet 27)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className={`p-2 rounded border ${pdu.lspHeader.flags.attached ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-card border-border/50 text-muted-foreground"}`}>
                      <div className="font-semibold font-sans flex items-center justify-between">
                        <span>ATT (Attached Bit)</span>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono">
                          {pdu.lspHeader.flags.attached ? "1" : "0"}
                        </Badge>
                      </div>
                      <p className="text-[10px] mt-1 font-sans text-muted-foreground">
                        {pdu.lspHeader.flags.attached ? "L1/L2 Border router attached to backbone (default route signal)" : "Not attached to other areas"}
                      </p>
                    </div>

                    <div className={`p-2 rounded border ${pdu.lspHeader.flags.overload ? "bg-rose-500/20 border-rose-500/40 text-rose-300" : "bg-card border-border/50 text-muted-foreground"}`}>
                      <div className="font-semibold font-sans flex items-center justify-between">
                        <span>OL (Overload Bit)</span>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono">
                          {pdu.lspHeader.flags.overload ? "1" : "0"}
                        </Badge>
                      </div>
                      <p className="text-[10px] mt-1 font-sans text-muted-foreground">
                        {pdu.lspHeader.flags.overload ? "Memory/BGP drain; transit traffic will bypass this router" : "Normal transit traffic forwarding"}
                      </p>
                    </div>

                    <div className={`p-2 rounded border ${pdu.lspHeader.flags.partitionRepair ? "bg-purple-500/20 border-purple-500/40 text-purple-300" : "bg-card border-border/50 text-muted-foreground"}`}>
                      <div className="font-semibold font-sans flex items-center justify-between">
                        <span>Partition Repair</span>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono">
                          {pdu.lspHeader.flags.partitionRepair ? "1" : "0"}
                        </Badge>
                      </div>
                      <p className="text-[10px] mt-1 font-sans text-muted-foreground">
                        {pdu.lspHeader.flags.partitionRepair ? "Supported" : "Not supported (Standard)"}
                      </p>
                    </div>

                    <div className="p-2 rounded bg-card border border-border/50 text-foreground">
                      <div className="font-semibold font-sans flex items-center justify-between">
                        <span>IS-Type</span>
                        <Badge variant="default" className="text-[9px] px-1.5 py-0 font-mono bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          {pdu.lspHeader.flags.isType === 3 ? "L1/L2 (3)" : pdu.lspHeader.flags.isType === 2 ? "L2 (2)" : "L1 (1)"}
                        </Badge>
                      </div>
                      <p className="text-[10px] mt-1 font-sans text-muted-foreground">
                        Intermediate System Level capability
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Hello Specific Header */}
            {pdu.helloHeader && (
              <div className="space-y-2 pt-2 border-t border-border/50 font-sans">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block flex items-center gap-1.5">
                  <Radio className="h-3.5 w-3.5 text-purple-400" />
                  IIH (Intermediate System to Intermediate System Hello) Specific Header
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center font-mono text-xs">
                  <div className="p-2 rounded bg-purple-500/10 border border-purple-500/30">
                    <span className="text-[10px] text-purple-400/80 block font-sans">Circuit Type</span>
                    <span className="font-bold text-purple-300">
                      {pdu.helloHeader.circuitType === 3 ? "L1/L2 (3)" : pdu.helloHeader.circuitType === 2 ? "L2 (2)" : "L1 (1)"}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-purple-500/10 border border-purple-500/30">
                    <span className="text-[10px] text-purple-400/80 block font-sans">Holding Timer</span>
                    <span className="font-bold text-purple-300">{pdu.helloHeader.holdingTimer}s</span>
                  </div>
                  <div className="p-2 rounded bg-purple-500/10 border border-purple-500/30">
                    <span className="text-[10px] text-purple-400/80 block font-sans">DIS Priority (7b)</span>
                    <span className="font-bold text-purple-300">{pdu.helloHeader.priority} (0-127)</span>
                  </div>
                  <div className="p-2 rounded bg-purple-500/10 border border-purple-500/30">
                    <span className="text-[10px] text-purple-400/80 block font-sans">Circuit ID / Pseudonode</span>
                    <span className="font-bold text-purple-300">{pdu.helloHeader.lanIdOrCircuitId || "0x01"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* CSNP Specific Header */}
            {pdu.csnpHeader && (
              <div className="space-y-2 pt-2 border-t border-border/50 font-sans">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  CSNP (Complete Sequence Numbers PDU) Header
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-center font-mono text-xs">
                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30">
                    <span className="text-[10px] text-amber-400/80 block font-sans">Source System ID</span>
                    <span className="font-bold text-amber-300">{pdu.csnpHeader.sourceSystemId}</span>
                  </div>
                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30">
                    <span className="text-[10px] text-amber-400/80 block font-sans">Start LSP ID</span>
                    <span className="font-bold text-amber-300">{pdu.csnpHeader.startLspId}</span>
                  </div>
                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30">
                    <span className="text-[10px] text-amber-400/80 block font-sans">End LSP ID</span>
                    <span className="font-bold text-amber-300">{pdu.csnpHeader.endLspId}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TLV Tree Decoder */}
        {activeTab === "tlv" && (
          <div className="space-y-3 font-sans">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Variable Length TLVs ({pdu.tlvs?.length || 0} items)
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                Total payload size: {pdu.tlvs?.reduce((acc, t) => acc + 2 + t.length, 0) || 0} bytes
              </span>
            </div>

            {(!pdu.tlvs || pdu.tlvs.length === 0) ? (
              <div className="p-4 rounded-lg bg-secondary/20 border border-border/50 text-center text-xs text-muted-foreground">
                No TLVs carried in this PDU.
              </div>
            ) : (
              <div className="space-y-2">
                {pdu.tlvs.map((tlv: IsisTlv, idx: number) => {
                  const isExpanded = !!expandedTlvs[idx];
                  return (
                    <div
                      key={idx}
                      className="rounded-lg border border-border/70 bg-card/60 overflow-hidden text-xs"
                    >
                      <button
                        onClick={() => toggleTlv(idx)}
                        className="w-full px-3 py-2 bg-secondary/30 hover:bg-secondary/50 flex items-center justify-between transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 border-emerald-500/40 text-emerald-400">
                            Type {tlv.type}
                          </Badge>
                          <span className="font-semibold text-foreground text-xs">
                            {tlv.name}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          Length: {tlv.length} octets
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="p-3 bg-secondary/10 border-t border-border/40 font-mono text-xs space-y-2">
                          <p className="text-[11px] text-muted-foreground font-sans">
                            {tlv.description}
                          </p>

                          {/* Specific rendering based on TLV Type */}
                          {tlv.type === 1 && tlv.areaAddresses && (
                            <div className="space-y-1">
                              <span className="text-[10px] font-sans font-semibold text-muted-foreground uppercase">Area Addresses:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {tlv.areaAddresses.map((area, aIdx) => (
                                  <Badge key={aIdx} variant="secondary" className="font-mono text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                                    {area}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {tlv.type === 2 && tlv.neighbors && (
                            <div className="space-y-1">
                              <span className="text-[10px] font-sans font-semibold text-muted-foreground uppercase">IS Reachability Neighbors:</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {tlv.neighbors.map((nb, nIdx) => (
                                  <div key={nIdx} className="p-2 rounded bg-card border border-border/50 flex items-center justify-between text-xs">
                                    <span className="font-bold text-foreground">{nb.neighborId}</span>
                                    <span className="text-muted-foreground">Metric: <span className="text-emerald-400 font-bold">{nb.metric}</span></span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {tlv.type === 128 && tlv.ipInternalReachability && (
                            <div className="space-y-1">
                              <span className="text-[10px] font-sans font-semibold text-muted-foreground uppercase">Narrow Metric IP Reachability (RFC 1195):</span>
                              <div className="space-y-1">
                                {tlv.ipInternalReachability.map((ip, iIdx) => (
                                  <div key={iIdx} className="p-2 rounded bg-card border border-border/50 flex items-center justify-between text-xs">
                                    <div>
                                      <span className="font-bold text-foreground">{ip.prefix}</span>
                                      <span className="text-muted-foreground ml-1 font-sans text-[10px]">({ip.mask})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {ip.upDown !== undefined && (
                                        <Badge variant="outline" className={`text-[9px] ${ip.upDown ? "text-amber-400 border-amber-500/40" : "text-emerald-400 border-emerald-500/40"}`}>
                                          U/D = {ip.upDown ? "1 (Down/Leaked)" : "0 (Up)"}
                                        </Badge>
                                      )}
                                      <span className="text-muted-foreground">Metric: <span className="text-blue-400 font-bold">{ip.metric}</span></span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {tlv.type === 135 && tlv.extendedIpReachability && (
                            <div className="space-y-1">
                              <span className="text-[10px] font-sans font-semibold text-muted-foreground uppercase">Extended IPv4 Wide Metric Reachability (RFC 5305):</span>
                              <div className="space-y-1">
                                {tlv.extendedIpReachability.map((eip, eIdx) => (
                                  <div key={eIdx} className="p-2 rounded bg-card border border-border/50 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-foreground">{eip.prefix}</span>
                                      {eip.upDown ? (
                                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px]">
                                          U/D=1 (Leaked from L2)
                                        </Badge>
                                      ) : (
                                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px]">
                                          U/D=0 (Native L1/L2)
                                        </Badge>
                                      )}
                                    </div>
                                    <span className="text-muted-foreground">Wide Metric: <span className="text-emerald-400 font-bold">{eip.metric.toLocaleString()}</span> (24-bit)</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {tlv.type === 137 && tlv.hostname && (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-sans font-semibold text-muted-foreground uppercase">Dynamic Hostname:</span>
                              <Badge variant="default" className="bg-purple-500/20 text-purple-300 border-purple-500/40 font-mono text-xs">
                                {tlv.hostname}
                              </Badge>
                            </div>
                          )}

                          {tlv.type === 236 && tlv.ipv6Reachability && (
                            <div className="space-y-1">
                              <span className="text-[10px] font-sans font-semibold text-muted-foreground uppercase">IPv6 Reachability (RFC 5308):</span>
                              <div className="space-y-1">
                                {tlv.ipv6Reachability.map((ip6, ip6Idx) => (
                                  <div key={ip6Idx} className="p-2 rounded bg-card border border-border/50 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-foreground">{ip6.prefix}/{ip6.prefixLength}</span>
                                      {ip6.upDown && (
                                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px]">
                                          U/D=1
                                        </Badge>
                                      )}
                                    </div>
                                    <span className="text-muted-foreground">Metric: <span className="text-emerald-400 font-bold">{ip6.metric}</span></span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: OSI LLC / NLPID 0x83 Raw Hex Dump */}
        {activeTab === "hex" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-sans">
                OSI LLC / Raw Frame Byte Dump (16-Byte Aligned)
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                DSAP=0xFE SSAP=0xFE Control=0x03 NLPID=0x83
              </span>
            </div>

            <div className="p-3 rounded-lg bg-black/80 border border-border/50 overflow-x-auto font-mono text-[11px] leading-5 text-emerald-400/90 shadow-inner">
              {hexLines.map((line, idx) => (
                <div key={idx} className="whitespace-pre hover:bg-emerald-500/10 px-1 rounded transition-colors">
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

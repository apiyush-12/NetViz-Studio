"use client";

import React, { useState } from "react";
import {
  Layers,
  Shield,
  Key,
  Globe,
  Tag,
  Hash,
  ChevronRight,
  ChevronDown,
  Lock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Tabs } from "@/components/ui";
import type { TlsRecordData, TlsExtension } from "@/features/protocols/tls/tls.types";
import { formatTlsHexDump } from "@/features/protocols/tls/tls-engine";

interface TlsRecordInspectorProps {
  record?: TlsRecordData;
}

export function TlsRecordInspector({ record }: TlsRecordInspectorProps) {
  const [activeTab, setActiveTab] = useState<string>("bitfield");
  const [expandedExtensions, setExpandedExtensions] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
    3: true,
  });

  const toggleExtension = (idx: number) => {
    setExpandedExtensions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (!record) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="py-3 px-4 border-b border-border/60">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-400" />
            TLS Record & Wire Frame Inspector
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center text-xs text-muted-foreground">
          No in-flight TLS record selected. Scrub or step forward in the timeline to inspect live Handshake and Application Data records.
        </CardContent>
      </Card>
    );
  }

  const hexLines = formatTlsHexDump(record);
  const msg = record.handshakeMessage;

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="py-3 px-4 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                TLS {record.contentTypeName} Inspector
                <Badge
                  variant="default"
                  className={`text-[10px] font-mono ${
                    record.isEncrypted
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                      : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                  }`}
                >
                  {record.isEncrypted ? "AEAD Encrypted" : "Cleartext"}
                </Badge>
                {msg && (
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {msg.typeName} (Type {msg.type})
                  </Badge>
                )}
              </CardTitle>
              <div className="text-[11px] text-muted-foreground font-mono">
                Record Length: {record.length} bytes &bull; Content Type: 0x{record.contentType.toString(16).toUpperCase()} ({record.contentTypeName})
              </div>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            tabs={[
              { id: "bitfield", label: "32-Bit Header" },
              { id: "extensions", label: "TLV Extensions" },
              { id: "hex", label: "Wire Hex Dump" },
            ]}
          />
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs font-mono">
        {/* Tab 1: 32-Bit Record Header & Handshake Structure */}
        {activeTab === "bitfield" && (
          <div className="space-y-4 font-sans">
            {/* Record Layer Header (5 Octets) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-emerald-400" />
                  TLS Record Layer Header (5 Octets / 40 Bits — RFC 8446 Section 5.1)
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">TCP Payload Framing</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-xs">
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400/80 block font-sans">Content Type (8b)</span>
                  <span className="font-bold text-emerald-300">{record.contentType} ({record.contentTypeName})</span>
                </div>
                <div className="col-span-2 p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400/80 block font-sans">Legacy Version (16b)</span>
                  <span className="font-bold text-emerald-300">{record.legacyVersion} (TLS 1.2 Compat)</span>
                </div>
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400/80 block font-sans">Length (16b)</span>
                  <span className="font-bold text-emerald-300">{record.length} Bytes</span>
                </div>
              </div>
            </div>

            {/* Handshake Message Header (4 Octets) if Handshake Type */}
            {msg && (
              <div className="space-y-1.5 pt-2 border-t border-border/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-blue-400" />
                  Handshake Message Header (4 Octets — RFC 8446 Section 4)
                </span>

                <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-xs">
                  <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30">
                    <span className="text-[10px] text-blue-400/80 block font-sans">Handshake Type (8b)</span>
                    <span className="font-bold text-blue-300">{msg.type} ({msg.typeName})</span>
                  </div>
                  <div className="col-span-3 p-2 rounded bg-blue-500/10 border border-blue-500/30">
                    <span className="text-[10px] text-blue-400/80 block font-sans">Handshake Body Length (24b)</span>
                    <span className="font-bold text-blue-300">{msg.length} Bytes</span>
                  </div>
                </div>

                {/* Handshake Specific Fields */}
                <div className="p-3 rounded-lg bg-secondary/30 border border-border/60 space-y-2 mt-2">
                  <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider block">
                    Message Body Details:
                  </span>

                  {msg.clientRandom && (
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground block">Client Random (32 Bytes):</span>
                      <p className="p-1.5 rounded bg-background border border-border/40 text-[11px] text-blue-300 break-all select-all">
                        {msg.clientRandom}
                      </p>
                    </div>
                  )}

                  {msg.serverRandom && (
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground block">Server Random (32 Bytes):</span>
                      <p className="p-1.5 rounded bg-background border border-border/40 text-[11px] text-emerald-300 break-all select-all">
                        {msg.serverRandom}
                      </p>
                    </div>
                  )}

                  {msg.cipherSuite && (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-muted-foreground">Selected Cipher Suite:</span>
                      <Badge variant="outline" className="font-mono text-emerald-400 border-emerald-500/30">
                        {msg.cipherSuite}
                      </Badge>
                    </div>
                  )}

                  {msg.keySharePublic && (
                    <div className="space-y-0.5 pt-1">
                      <span className="text-[10px] text-muted-foreground block">
                        ECDHE Public Key Share ({msg.namedGroup || "x25519"}):
                      </span>
                      <p className="p-1.5 rounded bg-background border border-border/40 text-[11px] text-purple-300 break-all select-all">
                        {msg.keySharePublic}
                      </p>
                    </div>
                  )}

                  {msg.signatureHex && (
                    <div className="space-y-0.5 pt-1">
                      <span className="text-[10px] text-muted-foreground block">
                        CertificateVerify Signature ({msg.signatureAlgorithm}):
                      </span>
                      <p className="p-1.5 rounded bg-background border border-border/40 text-[11px] text-amber-300 break-all select-all">
                        {msg.signatureHex}
                      </p>
                    </div>
                  )}

                  {msg.verifyData && (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-muted-foreground">Finished verify_data HMAC:</span>
                      <span className="font-mono font-bold text-emerald-300">{msg.verifyData}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AEAD Authentication Tag if Encrypted */}
            {record.isEncrypted && record.authTag && (
              <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-purple-300 text-xs flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" />
                    AEAD Authentication Tag (16 Octets / 128 Bits)
                  </span>
                  <Badge variant="outline" className="font-mono text-[9px] text-purple-400 border-purple-500/40">
                    AES-GCM / Poly1305 MAC
                  </Badge>
                </div>
                <p className="text-[11px] text-purple-200/90 font-mono break-all select-all">
                  {record.authTag}
                </p>
                <p className="text-[10px] text-muted-foreground font-sans">
                  Guarantees that ciphertext cannot be modified or reordered by an attacker in transit without immediate rejection.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: TLV Extensions */}
        {activeTab === "extensions" && (
          <div className="space-y-3 font-sans">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                TLS Extensions ({msg?.extensions.length || 0} items)
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                RFC 8446 TLV Architecture
              </span>
            </div>

            {(!msg || msg.extensions.length === 0) ? (
              <div className="p-4 rounded-lg bg-secondary/20 border border-border/50 text-center text-xs text-muted-foreground">
                No extensions carried in this message.
              </div>
            ) : (
              <div className="space-y-2">
                {msg.extensions.map((ext: TlsExtension, idx: number) => {
                  const isExpanded = !!expandedExtensions[idx];
                  return (
                    <div
                      key={idx}
                      className="rounded-lg border border-border/70 bg-card/60 overflow-hidden text-xs"
                    >
                      <button
                        onClick={() => toggleExtension(idx)}
                        className="w-full px-3 py-2 bg-secondary/30 hover:bg-secondary/50 flex items-center justify-between transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 border-emerald-500/40 text-emerald-400">
                            Type {ext.type}
                          </Badge>
                          <span className="font-semibold text-foreground text-xs">
                            {ext.name}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          Length: {ext.length} octets
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="p-3 bg-secondary/10 border-t border-border/40 font-mono text-xs space-y-2">
                          <p className="text-[11px] text-muted-foreground font-sans">
                            {ext.description}
                          </p>

                          <div className="p-2 rounded bg-background border border-border/50 space-y-1">
                            <span className="text-[10px] font-sans font-semibold text-muted-foreground uppercase">
                              Extension Data Fields:
                            </span>
                            <pre className="text-[11px] text-foreground/90 whitespace-pre-wrap break-all">
                              {JSON.stringify(ext.data, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Wire Hex Dump */}
        {activeTab === "hex" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between font-sans">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Wireshark Raw TLS Wire Frame Dump (16-Byte Aligned)
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                TCP Port 443 Stream
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

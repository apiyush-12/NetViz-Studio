"use client";

import React, { useState } from "react";
import {
  KeyRound,
  ShieldCheck,
  Lock,
  ArrowDown,
  Layers,
  Sparkles,
  Info,
  Check,
  Copy,
  Binary,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Tabs } from "@/components/ui";
import type {
  TlsKeySchedule,
  TlsEncryptionPhase,
  TlsVersion,
} from "@/features/protocols/tls/tls.types";

interface TlsKeyScheduleViewProps {
  keySchedule?: TlsKeySchedule;
  currentPhase?: TlsEncryptionPhase;
  version?: TlsVersion;
}

export function TlsKeyScheduleView({
  keySchedule,
  currentPhase = "cleartext",
  version = "TLS 1.3",
}: TlsKeyScheduleViewProps) {
  const [activeTab, setActiveTab] = useState<string>("graph");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (label: string, value?: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const isTls13 = version === "TLS 1.3";

  // Phase highlighting helpers
  const isEarlyActive = currentPhase === "early_data_0rtt";
  const isHandshakeActive =
    currentPhase === "handshake_traffic" || currentPhase === "application_traffic";
  const isMasterActive = currentPhase === "application_traffic";

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="py-3 px-4 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span>Cryptographic Key Schedule</span>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30 text-[10px]"
                >
                  {isTls13 ? "RFC 8446 HKDF Tree" : "RFC 5246 TLS 1.2 PRF"}
                </Badge>
              </CardTitle>
              <span className="text-[11px] text-muted-foreground">
                {isTls13
                  ? "Hierarchical HKDF-Extract & HKDF-Expand key derivation from ECDHE X25519"
                  : "Legacy Pseudo-Random Function (HMAC-SHA256) deriving Master Secret from Pre-Master"}
              </span>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            tabs={[
              { id: "graph", label: "Derivation Tree" },
              { id: "secrets", label: "Key Material Table" },
            ]}
          />
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Phase Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-secondary/30 border border-border/60 text-xs">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Current Handshake Phase:</span>
            <Badge
              className={
                currentPhase === "application_traffic"
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : currentPhase === "handshake_traffic"
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : currentPhase === "early_data_0rtt"
                  ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                  : "bg-secondary text-muted-foreground border-border"
              }
            >
              {currentPhase.replace(/_/g, " ").toUpperCase()}
            </Badge>
          </div>

          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>Forward Secrecy: <strong>ECDHE Ephemeral (PFS Guaranteed)</strong></span>
          </div>
        </div>

        {activeTab === "graph" ? (
          <div className="space-y-4">
            {/* Step 1: Ephemeral Diffie-Hellman / Shared Secret */}
            <div className="p-3.5 rounded-lg border border-border/60 bg-background/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-mono">
                    1
                  </span>
                  <span>ECDHE X25519 Ephemeral Key Exchange</span>
                </div>
                <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-300">
                  Curve25519 (256-bit)
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-card/60 border border-border/40 font-mono text-[11px]">
                  <span className="text-muted-foreground block text-[10px] mb-0.5">
                    Client Ephemeral Public Share:
                  </span>
                  <span className="text-cyan-300 truncate block">
                    0x9a8f4c2e...b56d10fa
                  </span>
                </div>
                <div className="p-2 rounded bg-card/60 border border-border/40 font-mono text-[11px]">
                  <span className="text-muted-foreground block text-[10px] mb-0.5">
                    Server Ephemeral Public Share:
                  </span>
                  <span className="text-cyan-300 truncate block">
                    0x7d3e21ba...c8901fe4
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[10px] text-cyan-400/80 block uppercase tracking-wider">
                    Derived ECDHE Shared Secret (DHE)
                  </span>
                  <span className="text-cyan-200 text-xs">
                    {keySchedule?.sharedSecretDhe || "Waiting for ServerHello key share..."}
                  </span>
                </div>
                {keySchedule?.sharedSecretDhe && (
                  <button
                    onClick={() => handleCopy("dhe", keySchedule.sharedSecretDhe)}
                    className="p-1 rounded hover:bg-cyan-500/20 text-cyan-400"
                    title="Copy Shared Secret"
                  >
                    {copiedKey === "dhe" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-center text-muted-foreground">
              <ArrowDown className="h-4 w-4 text-emerald-400/60" />
            </div>

            {/* Step 2: Early Secret & 0-RTT */}
            <div
              className={`p-3.5 rounded-lg border transition-all ${
                isEarlyActive
                  ? "border-purple-500/60 bg-purple-950/10 shadow-sm"
                  : "border-border/60 bg-background/50"
              } space-y-2`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-mono">
                    2
                  </span>
                  <span>Early Secret Stage (HKDF-Extract(0, PSK))</span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    isEarlyActive
                      ? "border-purple-500 text-purple-300 bg-purple-500/10"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  0-RTT Early Traffic Secret
                </Badge>
              </div>

              <div className="p-2.5 rounded bg-purple-950/20 border border-purple-500/30 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[10px] text-purple-400/80 block uppercase tracking-wider">
                    Early Secret
                  </span>
                  <span className="text-purple-200 text-xs">
                    {keySchedule?.earlySecret || "0x0000000000000000 (No PSK in Full Handshake)"}
                  </span>
                </div>
                {keySchedule?.earlySecret && (
                  <button
                    onClick={() => handleCopy("early", keySchedule.earlySecret)}
                    className="p-1 rounded hover:bg-purple-500/20 text-purple-400"
                    title="Copy Early Secret"
                  >
                    {copiedKey === "early" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-center text-muted-foreground">
              <ArrowDown className="h-4 w-4 text-amber-400/60" />
            </div>

            {/* Step 3: Handshake Secret Stage */}
            <div
              className={`p-3.5 rounded-lg border transition-all ${
                isHandshakeActive
                  ? "border-amber-500/60 bg-amber-950/10 shadow-sm"
                  : "border-border/60 bg-background/50"
              } space-y-2.5`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-mono">
                    3
                  </span>
                  <span>Handshake Secret Stage (HKDF-Extract(Derived Early, DHE))</span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    isHandshakeActive
                      ? "border-amber-500 text-amber-300 bg-amber-500/10"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  Encrypted Handshake Records
                </Badge>
              </div>

              <div className="p-2.5 rounded bg-amber-950/20 border border-amber-500/30 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[10px] text-amber-400/80 block uppercase tracking-wider">
                    Handshake Secret
                  </span>
                  <span className="text-amber-200 text-xs">
                    {keySchedule?.handshakeSecret || "Waiting for ECDHE resolution..."}
                  </span>
                </div>
                {keySchedule?.handshakeSecret && (
                  <button
                    onClick={() => handleCopy("hs", keySchedule.handshakeSecret)}
                    className="p-1 rounded hover:bg-amber-500/20 text-amber-400"
                    title="Copy Handshake Secret"
                  >
                    {copiedKey === "hs" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-card/60 border border-amber-500/20 space-y-1">
                  <span className="text-[10px] text-muted-foreground block font-sans font-medium">
                    Client Handshake Traffic Key & IV:
                  </span>
                  <div className="text-[11px] text-foreground truncate">
                    <span className="text-amber-400/80">Key: </span>
                    {keySchedule?.clientHandshakeKey || "--"}
                  </div>
                  <div className="text-[11px] text-foreground truncate">
                    <span className="text-amber-400/80">IV: </span>
                    {keySchedule?.clientHandshakeIv || "--"}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-card/60 border border-amber-500/20 space-y-1">
                  <span className="text-[10px] text-muted-foreground block font-sans font-medium">
                    Server Handshake Traffic Key & IV:
                  </span>
                  <div className="text-[11px] text-foreground truncate">
                    <span className="text-amber-400/80">Key: </span>
                    {keySchedule?.serverHandshakeKey || "--"}
                  </div>
                  <div className="text-[11px] text-foreground truncate">
                    <span className="text-amber-400/80">IV: </span>
                    {keySchedule?.serverHandshakeIv || "--"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center text-muted-foreground">
              <ArrowDown className="h-4 w-4 text-emerald-400/60" />
            </div>

            {/* Step 4: Master Secret Stage */}
            <div
              className={`p-3.5 rounded-lg border transition-all ${
                isMasterActive
                  ? "border-emerald-500/60 bg-emerald-950/10 shadow-sm"
                  : "border-border/60 bg-background/50"
              } space-y-2.5`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-mono">
                    4
                  </span>
                  <span>Master Secret Stage (HKDF-Extract(Derived Handshake, 0))</span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    isMasterActive
                      ? "border-emerald-500 text-emerald-300 bg-emerald-500/10"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  Application Data Traffic
                </Badge>
              </div>

              <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[10px] text-emerald-400/80 block uppercase tracking-wider">
                    Master Secret
                  </span>
                  <span className="text-emerald-200 text-xs">
                    {keySchedule?.masterSecret || "Waiting for Finished messages..."}
                  </span>
                </div>
                {keySchedule?.masterSecret && (
                  <button
                    onClick={() => handleCopy("master", keySchedule.masterSecret)}
                    className="p-1 rounded hover:bg-emerald-500/20 text-emerald-400"
                    title="Copy Master Secret"
                  >
                    {copiedKey === "master" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-card/60 border border-emerald-500/20 space-y-1">
                  <span className="text-[10px] text-muted-foreground block font-sans font-medium">
                    Client Application Traffic Key & IV:
                  </span>
                  <div className="text-[11px] text-foreground truncate">
                    <span className="text-emerald-400/80">Key: </span>
                    {keySchedule?.clientAppKey || "--"}
                  </div>
                  <div className="text-[11px] text-foreground truncate">
                    <span className="text-emerald-400/80">IV: </span>
                    {keySchedule?.clientAppIv || "--"}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-card/60 border border-emerald-500/20 space-y-1">
                  <span className="text-[10px] text-muted-foreground block font-sans font-medium">
                    Server Application Traffic Key & IV:
                  </span>
                  <div className="text-[11px] text-foreground truncate">
                    <span className="text-emerald-400/80">Key: </span>
                    {keySchedule?.serverAppKey || "--"}
                  </div>
                  <div className="text-[11px] text-foreground truncate">
                    <span className="text-emerald-400/80">IV: </span>
                    {keySchedule?.serverAppIv || "--"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Tab: Full Key Material Table */
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-secondary/40 px-3 py-2 border-b border-border text-xs font-semibold text-foreground flex items-center gap-2">
              <Binary className="h-4 w-4 text-emerald-400" />
              <span>Full TLS Keying Material & Derived Symmetric Keys</span>
            </div>
            <div className="divide-y divide-border/60 text-xs font-mono">
              {[
                { label: "ECDHE Shared Secret", val: keySchedule?.sharedSecretDhe, desc: "X25519 DH output" },
                { label: "Early Secret", val: keySchedule?.earlySecret, desc: "0-RTT resumption root" },
                { label: "Handshake Secret", val: keySchedule?.handshakeSecret, desc: "Server/Client HS root" },
                { label: "Client HS Traffic Secret", val: keySchedule?.clientHandshakeTrafficSecret, desc: "Client HS encryption" },
                { label: "Server HS Traffic Secret", val: keySchedule?.serverHandshakeTrafficSecret, desc: "Server HS encryption" },
                { label: "Client HS Key / IV", val: `${keySchedule?.clientHandshakeKey || "--"} | ${keySchedule?.clientHandshakeIv || "--"}`, desc: "AES-128-GCM 16-byte key + 12-byte IV" },
                { label: "Server HS Key / IV", val: `${keySchedule?.serverHandshakeKey || "--"} | ${keySchedule?.serverHandshakeIv || "--"}`, desc: "AES-128-GCM 16-byte key + 12-byte IV" },
                { label: "Master Secret", val: keySchedule?.masterSecret, desc: "Application phase root" },
                { label: "Client App Key / IV", val: `${keySchedule?.clientAppKey || "--"} | ${keySchedule?.clientAppIv || "--"}`, desc: "Symmetric key for client HTTP payloads" },
                { label: "Server App Key / IV", val: `${keySchedule?.serverAppKey || "--"} | ${keySchedule?.serverAppIv || "--"}`, desc: "Symmetric key for server HTTP payloads" },
              ].map((row, idx) => (
                <div
                  key={idx}
                  className="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-accent/30 transition-colors"
                >
                  <div className="w-48 shrink-0">
                    <span className="font-sans font-medium text-foreground block text-xs">{row.label}</span>
                    <span className="text-[10px] text-muted-foreground font-sans">{row.desc}</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <span className="text-[11px] text-emerald-300 break-all select-all">
                      {row.val || "Not derived yet"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RFC Footnote */}
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-start gap-2 text-xs">
          <Info className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
          <p className="leading-relaxed">
            <strong>RFC 8446 Key Separation Principle:</strong> TLS 1.3 completely separates Handshake Keys
            from Application Data Keys. Even if an attacker somehow breaks a server handshake record or records traffic,
            forward secrecy prevents decrypting application data or previous sessions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

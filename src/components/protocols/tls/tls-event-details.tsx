"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  ShieldAlert,
  Terminal,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Tabs } from "@/components/ui";
import type { TlsSimulationStepState } from "@/features/protocols/tls/tls.types";

interface TlsEventDetailsProps {
  stepState?: TlsSimulationStepState;
}

export function TlsEventDetails({ stepState }: TlsEventDetailsProps) {
  const [pedagogyTrack, setPedagogyTrack] = useState<string>("beginner");
  const [copiedLog, setCopiedLog] = useState<boolean>(false);

  if (!stepState) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-6 text-center text-xs text-muted-foreground">
          Select or play a step to see real-time TLS handshake state transitions, cryptographic key derivations, and dual-track pedagogical explanations.
        </CardContent>
      </Card>
    );
  }

  const { title, description, eventExplanation, cliOutputs, clientState, serverState } = stepState;

  const handleCopyLogs = () => {
    if (!cliOutputs || cliOutputs.length === 0) return;
    const text = cliOutputs.map((c) => c.text).join("\n");
    navigator.clipboard.writeText(text);
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 1800);
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="py-3 px-4 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                {title}
              </CardTitle>
              <span className="text-[11px] text-muted-foreground line-clamp-1">
                {description}
              </span>
            </div>
          </div>

          {/* Dual-Track Switcher */}
          <Tabs
            value={pedagogyTrack}
            onValueChange={setPedagogyTrack}
            tabs={[
              { id: "beginner", label: "Beginner Intuition" },
              { id: "advanced", label: "RFC 8446 Deep Dive" },
            ]}
          />
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs">
        {/* Dynamic Track Explanation */}
        <div className="p-3.5 rounded-lg bg-secondary/20 border border-border/50 space-y-2">
          <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
            {pedagogyTrack === "beginner" ? (
              <>
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Intuitive Physical Analogy & Concept</span>
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 text-emerald-400" />
                <span>RFC 8446 / RFC 5246 Technical Specification</span>
              </>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed text-xs">
            {pedagogyTrack === "beginner"
              ? eventExplanation.beginner
              : eventExplanation.advanced}
          </p>
        </div>

        {/* Security Note / Threat Mitigation */}
        {eventExplanation.securityNote && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300">
            <ShieldAlert className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-[11px] uppercase tracking-wider block text-red-400">
                Security & Threat Analysis:
              </span>
              <span className="text-xs text-red-200/90 leading-relaxed block">
                {eventExplanation.securityNote}
              </span>
            </div>
          </div>
        )}

        {/* Endpoint Finite State Machine (Client & Server) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-2.5 rounded-lg border border-border/60 bg-background/50 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Client TLS State</span>
              <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-300 border-blue-500/30">
                {clientState?.handshakeState || "IDLE"}
              </Badge>
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Keys Available:</span>
              <span className="font-mono text-cyan-300 uppercase text-[10px]">
                {clientState?.keysReady || "None"}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg border border-border/60 bg-background/50 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Server TLS State</span>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
                {serverState?.handshakeState || "IDLE"}
              </Badge>
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Keys Available:</span>
              <span className="font-mono text-cyan-300 uppercase text-[10px]">
                {serverState?.keysReady || "None"}
              </span>
            </div>
          </div>
        </div>

        {/* Fields Changed / State Deltas */}
        {eventExplanation.fieldsChanged && eventExplanation.fieldsChanged.length > 0 && (
          <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/50 space-y-1.5">
            <span className="text-[11px] font-semibold text-foreground block">
              Cryptographic & State Deltas in this Step:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {eventExplanation.fieldsChanged.map((field, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-[10px] bg-card border-border/70 text-cyan-300 font-mono"
                >
                  <ArrowRight className="h-2.5 w-2.5 mr-1 text-cyan-400" />
                  {field}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* OpenSSL / Wireshark CLI Syslog Console */}
        {cliOutputs && cliOutputs.length > 0 && (
          <div className="rounded-lg border border-border overflow-hidden bg-black/90 font-mono">
            <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900 border-b border-border/50 text-[11px] text-neutral-400">
              <div className="flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                <span>OpenSSL s_client Live Event Output</span>
              </div>
              <button
                onClick={handleCopyLogs}
                className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                title="Copy terminal output"
              >
                {copiedLog ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedLog ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <div className="p-2.5 space-y-1 max-h-48 overflow-y-auto text-[11px] leading-relaxed">
              {cliOutputs.map((line, idx) => {
                let color = "text-neutral-300";
                if (line.level === "error" || line.type === "error") color = "text-red-400";
                if (line.level === "warning" || line.type === "warning") color = "text-amber-400";
                if (line.level === "success" || line.type === "success") color = "text-emerald-400";
                if (line.type === "command") color = "text-cyan-400 font-semibold";

                return (
                  <div key={idx} className="flex gap-2">
                    <span className="text-neutral-600 select-none">$</span>
                    <span className={`break-all ${color}`}>{line.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

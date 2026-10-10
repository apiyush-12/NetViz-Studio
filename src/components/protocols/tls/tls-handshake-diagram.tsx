"use client";

import React, { useRef, useEffect } from "react";
import {
  Shield,
  Lock,
  ArrowRight,
  ArrowLeft,
  Key,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui";
import type {
  TlsSimulationStepState,
  TlsEncryptionPhase,
} from "@/features/protocols/tls/tls.types";

interface TlsHandshakeDiagramProps {
  steps: TlsSimulationStepState[];
  currentStepIndex: number;
  onSelectStep: (stepIndex: number) => void;
}

export function TlsHandshakeDiagram({
  steps,
  currentStepIndex,
  onSelectStep,
}: TlsHandshakeDiagramProps) {
  const currentStep = steps[currentStepIndex] || steps[0];
  const activeStepRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the active step when it changes
  useEffect(() => {
    if (activeStepRef.current && scrollContainerRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [currentStepIndex]);

  const getPhaseStyle = (phase: TlsEncryptionPhase) => {
    switch (phase) {
      case "application_traffic":
        return {
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/40",
          text: "text-emerald-400",
          badgeBg: "bg-emerald-500/20",
          badgeText: "text-emerald-300",
          label: "Application Traffic Key (AES-GCM)",
          icon: <Lock className="h-3.5 w-3.5 text-emerald-400" />,
        };
      case "handshake_traffic":
        return {
          bg: "bg-purple-500/10",
          border: "border-purple-500/40",
          text: "text-purple-400",
          badgeBg: "bg-purple-500/20",
          badgeText: "text-purple-300",
          label: "Handshake Traffic Key",
          icon: <Key className="h-3.5 w-3.5 text-purple-400" />,
        };
      case "cleartext":
      default:
        return {
          bg: "bg-blue-500/10",
          border: "border-blue-500/40",
          text: "text-blue-400",
          badgeBg: "bg-blue-500/20",
          badgeText: "text-blue-300",
          label: "Cleartext Negotiation",
          icon: <Globe className="h-3.5 w-3.5 text-blue-400" />,
        };
    }
  };

  return (
    <div className="relative w-full rounded-xl border border-border bg-slate-950/95 overflow-hidden select-none flex flex-col shadow-inner">
      {/* Top Header & Status Legend */}
      <div className="p-3 border-b border-border/70 bg-slate-900/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              TLS Handshake Sequence Ladder
              <Badge variant="outline" className="font-mono text-[9px] text-emerald-400 border-emerald-500/30">
                {currentStep?.rttLabel || "1-RTT"}
              </Badge>
            </span>
            <span className="text-[11px] text-slate-400">
              Interactive flight timing, key phase transitions, and record delivery
            </span>
          </div>
        </div>

        {/* Phase Legend */}
        <div className="flex items-center gap-2 text-[10px] flex-wrap">
          <span className="flex items-center gap-1 text-blue-400">
            <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" /> Cleartext
          </span>
          <span className="flex items-center gap-1 text-purple-400">
            <span className="h-2 w-2 rounded-full bg-purple-500 inline-block" /> Handshake Keys
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> Application Keys
          </span>
        </div>
      </div>

      {/* Ladder Diagram Workspace — scrollable */}
      <div ref={scrollContainerRef} className="p-4 space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {/* Endpoint Headers: Client on Left, Server on Right */}
        <div className="grid grid-cols-2 gap-4 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="h-3 w-3 rounded-full bg-blue-400 animate-pulse" />
            <div>
              <span className="font-bold text-xs text-blue-300 block font-mono">CLIENT</span>
              <span className="text-[10px] text-slate-400">Browser / REST Client (Port 54320)</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-right">
            <div>
              <span className="font-bold text-xs text-emerald-300 block font-mono">SERVER</span>
              <span className="text-[10px] text-slate-400">api.secure-bank.io (Port 443)</span>
            </div>
            <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* Vertical Lifelines & Interactive Flight Messages */}
        <div className="space-y-2.5 relative">
          {/* Subtle vertical center guideline */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-800/60 pointer-events-none -translate-x-1/2" />

          {steps.map((step, idx) => {
            const isSelected = idx === currentStepIndex;
            const isClientToServer = step.from === "Client";
            const isAttacker = step.from === "Attacker" || step.to === "Attacker";
            const phaseStyle = getPhaseStyle(step.phase);
            const isAlert = step.activeRecord?.contentTypeName === "Alert";

            return (
              <div
                key={idx}
                ref={isSelected ? activeStepRef : undefined}
                onClick={() => onSelectStep(idx)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer relative ${
                  isSelected
                    ? "bg-slate-900 border-emerald-500 ring-1 ring-emerald-500/60 shadow-lg"
                    : "bg-slate-950/70 hover:bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  {/* Step & Flight Badge */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge
                      variant="default"
                      className={`font-mono text-[9px] px-1.5 py-0 ${
                        isSelected ? "bg-emerald-500 text-slate-950 font-bold" : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      Step {step.stepIndex + 1}
                    </Badge>
                    <Badge variant="outline" className="font-mono text-[9px] text-slate-400 border-slate-800">
                      Flight {step.flight} &bull; {step.rttLabel}
                    </Badge>
                  </div>

                  {/* Message Vector Arrow & Label */}
                  <div className="flex-1 flex items-center justify-center gap-2 px-2 overflow-hidden">
                    {isClientToServer ? (
                      <div className="w-full flex items-center justify-start gap-2">
                        <span className="text-[10px] text-blue-400 font-mono font-semibold">Client</span>
                        <div className="flex-1 flex items-center">
                          <div className={`h-0.5 w-full ${isAlert ? "bg-rose-500" : isSelected ? "bg-emerald-400" : "bg-slate-700"}`} />
                          <ArrowRight className={`h-3.5 w-3.5 shrink-0 -ml-1 ${isAlert ? "text-rose-400" : isSelected ? "text-emerald-400" : "text-slate-500"}`} />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Server</span>
                      </div>
                    ) : (
                      <div className="w-full flex items-center justify-end gap-2">
                        <span className="text-[10px] text-slate-400 font-mono">Client</span>
                        <div className="flex-1 flex items-center">
                          <ArrowLeft className={`h-3.5 w-3.5 shrink-0 -mr-1 ${isAlert ? "text-rose-400" : isSelected ? "text-emerald-400" : "text-slate-500"}`} />
                          <div className={`h-0.5 w-full ${isAlert ? "bg-rose-500" : isSelected ? "bg-emerald-400" : "bg-slate-700"}`} />
                        </div>
                        <span className={`text-[10px] ${isAttacker ? "text-rose-400" : "text-emerald-400"} font-mono font-semibold`}>
                          {step.from}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Encryption Phase Badge */}
                  <div className="shrink-0">
                    <Badge
                      variant="secondary"
                      className={`text-[9px] font-mono flex items-center gap-1 ${phaseStyle.badgeBg} ${phaseStyle.badgeText}`}
                    >
                      {phaseStyle.icon}
                      <span className="hidden sm:inline">{step.phase === "application_traffic" ? "AEAD App" : step.phase === "handshake_traffic" ? "Handshake Key" : "Cleartext"}</span>
                    </Badge>
                  </div>
                </div>

                {/* Message Title & Subtitle */}
                <div className="mt-2 flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className={`font-semibold text-xs block ${isSelected ? "text-emerald-300" : "text-slate-200"}`}>
                      {step.title}
                    </span>
                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-1">
                      {step.description}
                    </p>
                  </div>

                  {step.activeRecord && (
                    <Badge
                      variant="outline"
                      className={`font-mono text-[9px] shrink-0 ${
                        isAlert
                          ? "border-rose-500/50 text-rose-300 bg-rose-500/10"
                          : "border-slate-800 text-slate-400"
                      }`}
                    >
                      {step.activeRecord.contentTypeName} ({step.activeRecord.length}B)
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

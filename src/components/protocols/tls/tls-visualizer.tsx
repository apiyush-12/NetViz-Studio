"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Zap,
  Lock,
  Clock,
  Sparkles,
  Layers,
  FileCheck2,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import { Badge, Tabs, Button } from "@/components/ui";
import { SimulationControls } from "@/components/simulation/simulation-controls";
import { EventTimeline } from "@/components/simulation/event-timeline";
import { useSimulationStore } from "@/features/simulation/simulation-store";
import { TlsHandshakeDiagram } from "./tls-handshake-diagram";
import { TlsRecordInspector } from "./tls-record-inspector";
import { TlsCertificateViewer } from "./tls-certificate-viewer";
import { TlsKeyScheduleView } from "./tls-key-schedule-view";
import { TlsEventDetails } from "./tls-event-details";
import { TlsConfigPanel } from "./tls-config-panel";
import { Tls12Tls13ComparisonModal } from "@/components/protocols/comparison/tls12-tls13-comparison-modal";
import type {
  TlsConfig,
  TlsScenarioId,
  TlsSimulationStepState,
  TlsRecordData,
} from "@/features/protocols/tls/tls.types";
import { defaultTlsConfig, TLS_SCENARIOS } from "@/features/protocols/tls/tls.defaults";
import { simulateTlsTransaction } from "@/features/protocols/tls/tls.simulator";

export function TlsVisualizer() {
  const [config, setConfig] = useState<TlsConfig>(defaultTlsConfig);
  const [activeRightTab, setActiveRightTab] = useState<string>("inspector");
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);

  const loadProtocol = useSimulationStore((s) => s.loadProtocol);
  const storeStep = useSimulationStore((s) => s.currentStep);
  const scrubTo = useSimulationStore((s) => s.scrubTo);

  // Sync simulation store when configuration changes
  useEffect(() => {
    loadProtocol("tls", config as unknown as Record<string, unknown>);
  }, [loadProtocol, config]);

  // Compute simulation outcome
  const outcome = useMemo(() => {
    return simulateTlsTransaction(config as unknown as Record<string, unknown>);
  }, [config]);

  const activeStepIndex =
    storeStep >= 0 && storeStep < outcome.steps.length ? storeStep : 0;
  const currentStepState: TlsSimulationStepState =
    outcome.steps[activeStepIndex] || outcome.steps[0];

  const activeRecord: TlsRecordData | undefined = currentStepState?.activeRecord;

  const handleUpdateConfig = (updates: Partial<TlsConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    scrubTo(0);
  };

  const handleResetDefaults = () => {
    setConfig(defaultTlsConfig);
    scrubTo(0);
  };

  const handleSelectScenario = (scenarioId: TlsScenarioId) => {
    const scn = TLS_SCENARIOS[scenarioId];
    if (!scn) return;

    let version = scn.version;
    let cipherSuite = config.cipherSuite;
    let zeroRttEnabled = false;
    let mTlsEnabled = false;
    let certStatus = config.certStatus;

    if (scenarioId === "tls13_full_handshake") {
      version = "TLS 1.3";
      cipherSuite = "TLS_AES_128_GCM_SHA256";
      certStatus = "valid";
    } else if (scenarioId === "tls12_vs_tls13_latency") {
      version = "TLS 1.2";
      cipherSuite = "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256";
      certStatus = "valid";
    } else if (scenarioId === "tls13_zero_rtt_psk") {
      version = "TLS 1.3";
      zeroRttEnabled = true;
      cipherSuite = "TLS_AES_128_GCM_SHA256";
      certStatus = "valid";
    } else if (scenarioId === "mtls_mutual_authentication") {
      version = "TLS 1.3";
      mTlsEnabled = true;
      cipherSuite = "TLS_AES_128_GCM_SHA256";
      certStatus = "valid";
    } else if (scenarioId === "pki_cert_chain_validation") {
      version = "TLS 1.3";
      certStatus = "valid";
    } else if (scenarioId === "mitm_untrusted_cert_attack") {
      version = "TLS 1.3";
      certStatus = "expired";
    }

    setConfig((prev) => ({
      ...prev,
      scenarioId,
      version,
      cipherSuite,
      zeroRttEnabled,
      mTlsEnabled,
      certStatus,
    }));
    scrubTo(0);
  };

  return (
    <div className="flex flex-col gap-3 p-3 max-w-[1600px] mx-auto w-full">
      {/* Top Banner Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold text-foreground">
                Transport Layer Security Studio ({config.version})
              </h1>
              <Badge
                variant="outline"
                className={`font-mono text-[10px] ${
                  config.version === "TLS 1.3"
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                }`}
              >
                {config.version === "TLS 1.3" ? "RFC 8446 (1-RTT)" : "RFC 5246 (2-RTT)"}
              </Badge>
              <Badge
                variant="outline"
                className="bg-blue-500/15 text-blue-300 border-blue-500/30 font-mono text-[10px]"
              >
                {config.cipherSuite}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[10px] font-mono ${
                  outcome.isHandshakeSuccess
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-red-500/15 text-red-400 border-red-500/30"
                }`}
              >
                {outcome.isHandshakeSuccess ? "Secure Session Established" : "Handshake Fatal Alert"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sequence Ladder &bull; 32-bit Wire Records &bull; X.509 PKI Chain Validation &bull; HKDF Derivation Tree &bull; 0-RTT & mTLS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsComparisonOpen(true)}
            className="h-8 text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            TLS 1.3 vs TLS 1.2
          </Button>
        </div>
      </div>

      {/* Quick Metrics Ribbon (4 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-2.5 rounded-lg bg-card border border-border/70 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-muted-foreground block font-sans">
              Handshake Latency
            </span>
            <span className="text-base font-bold font-mono text-foreground">
              {outcome.totalRtt.toFixed(1)} RTT
            </span>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] font-mono ${
              outcome.totalRtt <= 1.0
                ? "text-emerald-400 border-emerald-500/30"
                : "text-amber-400 border-amber-500/30"
            }`}
          >
            {config.version === "TLS 1.3" ? "50% Faster" : "2 Round Trips"}
          </Badge>
        </div>

        <div className="p-2.5 rounded-lg bg-card border border-border/70 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-muted-foreground block font-sans">
              Forward Secrecy (PFS)
            </span>
            <span className="text-base font-bold font-mono text-cyan-400">
              ECDHE {config.namedGroup.toUpperCase()}
            </span>
          </div>
          <ShieldCheck className="h-4 w-4 text-cyan-400 opacity-80" />
        </div>

        <div className="p-2.5 rounded-lg bg-card border border-border/70 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-muted-foreground block font-sans">
              AEAD Encryption
            </span>
            <span className="text-base font-bold font-mono text-emerald-400">
              AES-GCM / Poly
            </span>
          </div>
          <KeyRound className="h-4 w-4 text-emerald-400 opacity-80" />
        </div>

        <div className="p-2.5 rounded-lg bg-card border border-border/70 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-muted-foreground block font-sans">
              Security Evaluation
            </span>
            <span
              className={`text-base font-bold font-mono ${
                outcome.securityRating.startsWith("A") ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              Grade {outcome.securityRating}
            </span>
          </div>
          {outcome.securityRating.startsWith("A") ? (
            <ShieldCheck className="h-4 w-4 text-emerald-400 opacity-80" />
          ) : (
            <ShieldAlert className="h-4 w-4 text-rose-400 opacity-80" />
          )}
        </div>
      </div>

      {/* Main 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left 7 Columns: Handshake Diagram, Controls, Timeline, Step Details */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {/* Animated Sequence Ladder Handshake Diagram */}
          <TlsHandshakeDiagram
            steps={outcome.steps}
            currentStepIndex={activeStepIndex}
            onSelectStep={scrubTo}
          />

          {/* Simulation Controls */}
          <SimulationControls />

          {/* Event Timeline */}
          <EventTimeline />

          {/* Dual-Track Step Details & OpenSSL Terminal Syslog */}
          <TlsEventDetails stepState={currentStepState} />
        </div>

        {/* Right 5 Columns: Tabbed Deep-Inspection Panels */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Tabs header */}
          <Tabs
            value={activeRightTab}
            onValueChange={setActiveRightTab}
            tabs={[
              { id: "inspector", label: "Wire Record & Hex" },
              { id: "cert", label: "X.509 Chain & OCSP" },
              { id: "keys", label: "HKDF Key Schedule" },
            ]}
          />

          {/* Tab 1: 32-bit Wire Record & Hex Dump */}
          {activeRightTab === "inspector" && (
            <TlsRecordInspector record={activeRecord} />
          )}

          {/* Tab 2: X.509 Certificate Chain & OCSP */}
          {activeRightTab === "cert" && (
            <TlsCertificateViewer
              chain={currentStepState?.certChain || outcome.finalCertChain}
            />
          )}

          {/* Tab 3: HKDF Key Schedule */}
          {activeRightTab === "keys" && (
            <TlsKeyScheduleView
              keySchedule={currentStepState?.keySchedule || outcome.finalKeySchedule}
              currentPhase={currentStepState?.phase}
              version={config.version}
            />
          )}
        </div>
      </div>

      {/* Full-Width Configuration & Scenario Switcher */}
      <TlsConfigPanel
        config={config}
        onUpdateConfig={handleUpdateConfig}
        onSelectScenario={handleSelectScenario}
        onResetDefaults={handleResetDefaults}
      />

      {/* TLS 1.3 vs 1.2 Comparison Modal */}
      <Tls12Tls13ComparisonModal
        isOpen={isComparisonOpen}
        onOpenChange={setIsComparisonOpen}
      />
    </div>
  );
}

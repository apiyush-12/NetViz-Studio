"use client";

import { useEffect, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/layout/app-sidebar";
import { SimulationCanvas } from "@/components/simulation/simulation-canvas";
import { SimulationControls } from "@/components/simulation/simulation-controls";
import { EventTimeline } from "@/components/simulation/event-timeline";
import { ExplanationPanel } from "@/components/simulation/explanation-panel";
import { PacketInspector } from "@/components/simulation/packet-inspector";
import { TcpStatePanel, UdpComparisonPanel, StatisticsPanel } from "@/components/simulation/statistics-panel";
import { ProtocolSelector, ProtocolConfigForm } from "@/components/protocols/protocol-config-form";
import { useSimulationStore } from "@/features/simulation/simulation-store";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { Tabs } from "@/components/ui";

function VisualizerContent() {
  const searchParams = useSearchParams();
  const protocolId = useSimulationStore((s) => s.protocolId);
  const loadProtocol = useSimulationStore((s) => s.loadProtocol);
  const [rightTab, setRightTab] = useState("explain");

  useKeyboardShortcuts();

  useEffect(() => {
    const param = searchParams.get("protocol") ?? "tcp";
    loadProtocol(param);
  }, [searchParams, loadProtocol]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border space-y-3">
        <div className="w-48">
          <label className="text-xs text-muted-foreground mb-1 block">Protocol</label>
          <ProtocolSelector
            value={protocolId ?? "tcp"}
            onChange={(id) => loadProtocol(id)}
          />
        </div>
        <ProtocolConfigForm />
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3 p-3 min-h-0">
        <div className="flex flex-col gap-3 min-h-0">
          <SimulationCanvas />
          <SimulationControls />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <TcpStatePanel />
            <UdpComparisonPanel />
            <StatisticsPanel />
          </div>
          <EventTimeline />
        </div>

        <div className="flex flex-col gap-3 min-h-0 lg:max-h-[calc(100vh-8rem)]">
          <Tabs
            value={rightTab}
            onValueChange={setRightTab}
            tabs={[
              { id: "explain", label: "Explanation" },
              { id: "inspect", label: "Inspector" },
            ]}
          />
          {rightTab === "explain" ? <ExplanationPanel /> : <PacketInspector />}
        </div>
      </div>
    </div>
  );
}

export default function VisualizerPage() {
  return (
    <>
      <AppHeader
        title="Protocol Visualizer"
        description="Interactive simulation workspace for network protocols"
      />
      <Suspense fallback={<div className="p-6 text-muted-foreground">Loading visualizer...</div>}>
        <VisualizerContent />
      </Suspense>
    </>
  );
}

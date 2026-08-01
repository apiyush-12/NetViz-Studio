"use client";

import { useEffect, Suspense, useState } from "react";
import { useParams } from "next/navigation";
import { AppHeader } from "@/components/layout/app-sidebar";
import { SimulationCanvas } from "@/components/simulation/simulation-canvas";
import { SimulationControls } from "@/components/simulation/simulation-controls";
import { EventTimeline } from "@/components/simulation/event-timeline";
import { ExplanationPanel } from "@/components/simulation/explanation-panel";
import { PacketInspector } from "@/components/simulation/packet-inspector";
import { TcpStatePanel, UdpComparisonPanel, StatisticsPanel } from "@/components/simulation/statistics-panel";
import { ProtocolConfigForm } from "@/components/protocols/protocol-config-form";
import { useSimulationStore } from "@/features/simulation/simulation-store";
import { getProtocol } from "@/features/protocols/registry";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { Tabs, Badge } from "@/components/ui";
import Link from "next/link";

function ProtocolDetailContent() {
  const params = useParams();
  const protocolId = params.protocolId as string;
  const protocol = getProtocol(protocolId);
  const loadProtocol = useSimulationStore((s) => s.loadProtocol);
  const [rightTab, setRightTab] = useState("explain");

  useKeyboardShortcuts();

  useEffect(() => {
    if (protocol?.status !== "planned") {
      loadProtocol(protocolId);
    }
  }, [protocolId, loadProtocol, protocol?.status]);

  if (!protocol) {
    return <div className="p-6">Protocol not found.</div>;
  }

  if (protocol.status === "planned") {
    return (
      <div className="p-6 text-center space-y-4">
        <h2 className="text-xl font-semibold">{protocol.name}</h2>
        <Badge variant="outline">Planned for future phase</Badge>
        <p className="text-muted-foreground max-w-md mx-auto">{protocol.summary}</p>
        <Link href="/protocols" className="text-primary hover:underline text-sm">
          ← Back to protocol library
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
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
        <div className="flex flex-col gap-3 min-h-0">
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

function ProtocolPageHeader() {
  const params = useParams();
  const protocol = getProtocol(params.protocolId as string);
  return (
    <AppHeader
      title={protocol?.name ?? "Protocol"}
      description={protocol?.summary}
    />
  );
}

export default function ProtocolDetailPage() {
  return (
    <>
      <ProtocolPageHeader />
      <Suspense fallback={<div className="p-6 text-muted-foreground">Loading...</div>}>
        <ProtocolDetailContent />
      </Suspense>
    </>
  );
}

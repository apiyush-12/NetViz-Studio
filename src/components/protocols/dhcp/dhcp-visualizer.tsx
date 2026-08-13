"use client";

import React, { useState, useEffect } from "react";
import { useSimulationStore } from "@/features/simulation/simulation-store";
import { SimulationControls } from "@/components/simulation/simulation-controls";
import { EventTimeline } from "@/components/simulation/event-timeline";
import { Tabs, Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { DhcpTopology } from "./dhcp-topology";
import { DhcpFsmView } from "./dhcp-fsm-view";
import { DhcpPoolTable } from "./dhcp-pool-table";
import { DhcpPacketDecoder } from "./dhcp-packet-decoder";
import { DhcpConfigPanel } from "./dhcp-config-panel";
import { DhcpEventDetails } from "./dhcp-event-details";
import { NetworkServicesComparisonModal } from "@/components/protocols/comparison/network-services-comparison-modal";
import type { DhcpNode, DhcpLink, DhcpPool, DhcpLease } from "@/features/protocols/dhcp/dhcp.types";
import type { DhcpFsmStep } from "@/features/protocols/dhcp/dhcp.fsm";
import type { DhcpValidationError } from "@/features/protocols/dhcp/dhcp.validators";
import { SIMPLE_LAN_NODES, SIMPLE_LAN_LINKS, SIMPLE_LAN_POOL } from "@/features/protocols/dhcp/dhcp.defaults";

export function DhcpVisualizer() {
  const loadProtocol = useSimulationStore((s) => s.loadProtocol);
  const protocolState = useSimulationStore((s) => s.protocolState);
  const events = useSimulationStore((s) => s.events);
  const packets = useSimulationStore((s) => s.packets);
  const currentStep = useSimulationStore((s) => s.currentStep);
  const selectedEventId = useSimulationStore((s) => s.selectedEventId);

  // Local Visualizer UI States
  const [simulationMode, setSimulationMode] = useState<"realtime" | "simulation">("simulation");
  const [selectedNodeId, setSelectedNodeId] = useState<string>("client-1");
  const [activeTab, setActiveTab] = useState<string>("events");
  const [rightInspectorTab, setRightInspectorTab] = useState<string>("general");
  const [labelMode, setLabelMode] = useState<"simple" | "technical">("simple");

  useEffect(() => {
    loadProtocol("dhcp");
  }, [loadProtocol]);

  // Extract DHCP state from simulator initialState
  const rawNodes = protocolState.nodes as DhcpNode[] | undefined;
  const nodes: DhcpNode[] = Array.isArray(rawNodes) && rawNodes.length > 0 ? rawNodes : SIMPLE_LAN_NODES;

  const rawLinks = protocolState.links as DhcpLink[] | undefined;
  const links: DhcpLink[] = Array.isArray(rawLinks) && rawLinks.length > 0 ? rawLinks : SIMPLE_LAN_LINKS;

  const pool: DhcpPool = (protocolState.pool as DhcpPool) ?? SIMPLE_LAN_POOL;
  const leases: DhcpLease[] = (protocolState.leases as DhcpLease[]) ?? [];
  const activeLease: DhcpLease | null = (protocolState.activeLease as DhcpLease) ?? null;
  const fsmSteps: DhcpFsmStep[] = (protocolState.fsmSteps as DhcpFsmStep[]) ?? [];
  const validationErrors: DhcpValidationError[] = (protocolState.validationErrors as DhcpValidationError[]) ?? [];
  const topologyPreset = (protocolState.topologyPreset as string) ?? "simple-lan";

  const activeEvent = currentStep >= 0 && events[currentStep] ? events[currentStep] : null;
  const activePacket = activeEvent?.packetId
    ? packets.find((p) => p.id === activeEvent.packetId) ?? null
    : null;

  const selectedNode: DhcpNode =
    nodes.find((n) => n.id === selectedNodeId) ?? nodes[0] ?? SIMPLE_LAN_NODES[0];

  // Handlers for topology preset & condition customization
  const handleSelectTopologyPreset = (
    preset: "simple-lan" | "dual-server" | "relay-agent" | "exhaustion-rogue"
  ) => {
    loadProtocol("dhcp", { topologyPreset: preset, failureScenario: "none" });
    setSelectedNodeId("client-1");
  };

  const handleUpdatePool = (updates: Partial<DhcpPool>) => {
    loadProtocol("dhcp", {
      poolStart: updates.startAddress ?? pool.startAddress,
      poolEnd: updates.endAddress ?? pool.endAddress,
      leaseDurationSeconds: updates.leaseDurationSeconds ?? pool.leaseDurationSeconds,
    });
  };

  const handleUpdateClient = (mac: string, hostname: string) => {
    loadProtocol("dhcp", { clientMac: mac, clientHostname: hostname });
  };

  const handleSelectScenario = (scenario: string) => {
    loadProtocol("dhcp", { failureScenario: scenario });
  };

  return (
    <div className="flex flex-col gap-3 p-3 h-full min-h-0">
      {/* Top Header Bar with Mode Toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs uppercase tracking-wider font-mono">
            DHCP
          </Badge>
          <div>
            <h2 className="text-sm font-semibold">Dynamic Host Configuration Protocol (Network Services)</h2>
            <p className="text-xs text-muted-foreground hidden sm:block">
              DORA handshake, 8-state client FSM, RFC 2132 options, lease timers, and security mitigations
            </p>
          </div>
        </div>

        {/* Real Time vs Simulation Mode Toggle & Comparison Modal */}
        <div className="flex items-center gap-2">
          <NetworkServicesComparisonModal />
          <div className="flex items-center gap-1 bg-secondary/70 p-1 rounded-lg border border-border">
            <button
              onClick={() => setSimulationMode("realtime")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${simulationMode === "realtime"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Real Time
            </button>
            <button
              onClick={() => setSimulationMode("simulation")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${simulationMode === "simulation"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Simulation
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-3 min-h-0">
        {/* Left Column: Topology Canvas & Simulation Controls */}
        <div className="flex flex-col gap-3 min-h-0">
          <div className="flex-1 min-h-[460px]">
            <DhcpTopology
              nodes={nodes}
              links={links}
              activeLease={activeLease}
              topologyPreset={topologyPreset}
              selectedNodeId={selectedNode?.id ?? null}
              activeEvent={activeEvent}
              activePacket={activePacket}
              labelMode={labelMode}
              onSelectNode={setSelectedNodeId}
              onToggleLabelMode={() => setLabelMode((m) => (m === "simple" ? "technical" : "simple"))}
              onSelectFailureScenario={handleSelectScenario}
              onSelectTopologyPreset={handleSelectTopologyPreset}
            />
          </div>

          {simulationMode === "simulation" && <SimulationControls />}

          {/* Bottom Dock Tabs */}
          <div className="border border-border rounded-lg bg-card p-3 flex flex-col gap-3">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              tabs={[
                { id: "events", label: "Events Timeline" },
                { id: "fsm", label: "DORA & Client FSM" },
                { id: "pool", label: "Address Pool & Leases" },
                { id: "packetDecoder", label: "Packet Decoder (Opt 53)" },
                { id: "config", label: "Topology & Conditions" },
              ]}
            />

            <div className="min-h-[220px]">
              {activeTab === "events" && <EventTimeline />}
              {activeTab === "fsm" && (
                <DhcpFsmView
                  currentState={activeLease ? "BOUND" : "INIT"}
                  fsmSteps={fsmSteps}
                  pool={pool}
                />
              )}
              {activeTab === "pool" && (
                <DhcpPoolTable pool={pool} leases={leases} />
              )}
              {activeTab === "packetDecoder" && (
                <DhcpPacketDecoder packet={activePacket} />
              )}
              {activeTab === "config" && (
                <DhcpConfigPanel
                  pool={pool}
                  topologyPreset={topologyPreset}
                  validationErrors={validationErrors}
                  onSelectTopologyPreset={handleSelectTopologyPreset}
                  onUpdatePool={handleUpdatePool}
                  onUpdateClient={handleUpdateClient}
                  onSelectFailureScenario={handleSelectScenario}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Node Inspector & Event Explanations */}
        <div className="flex flex-col gap-3 min-h-0">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Device Inspector: {selectedNode?.name ?? "Device"}</CardTitle>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {selectedNode?.type ?? "device"} · {selectedNode?.id ?? "id"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-3 overflow-auto space-y-3">
              <Tabs
                value={rightInspectorTab}
                onValueChange={setRightInspectorTab}
                tabs={[
                  { id: "general", label: "General" },
                  { id: "explanation", label: "Event Details" },
                ]}
              />

              {rightInspectorTab === "general" && (
                <div className="space-y-3 text-xs font-mono">
                  <div className="bg-secondary/40 p-2.5 rounded-lg border border-border space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Node Type:</span>
                      <span className="font-semibold capitalize">{selectedNode?.type ?? "client"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">MAC Address:</span>
                      <span className="text-primary font-semibold">{selectedNode?.macAddress ?? "00:00:00:00:00:00"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">IP Address:</span>
                      <span>{selectedNode?.ipAddress ? selectedNode.ipAddress : activeLease ? activeLease.ipAddress : "0.0.0.0 (Unconfigured)"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Subnet Mask:</span>
                      <span>{pool.subnetMask}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Default Gateway:</span>
                      <span>{pool.gateway}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">DNS Server:</span>
                      <span>{pool.dnsServers.join(", ")}</span>
                    </div>
                  </div>
                </div>
              )}

              {rightInspectorTab === "explanation" && (
                <DhcpEventDetails
                  event={events.find((e) => e.id === selectedEventId) ?? activeEvent}
                  mode="advanced"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useSimulationStore } from "@/features/simulation/simulation-store";
import { SimulationControls } from "@/components/simulation/simulation-controls";
import { EventTimeline } from "@/components/simulation/event-timeline";
import { Tabs, Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { DnsTopology } from "./dns-topology";
import { DnsHierarchyView } from "./dns-hierarchy-view";
import { DnsCacheTable } from "./dns-cache-table";
import { DnsRecordsTable } from "./dns-records-table";
import { DnsHeaderDecoder } from "./dns-header-decoder";
import { DnsConfigPanel } from "./dns-config-panel";
import { DnsEventDetails } from "./dns-event-details";
import { NetworkServicesComparisonModal } from "@/components/protocols/comparison/network-services-comparison-modal";
import type { DnsNode, DnsLink, DnsCacheEntry, DnsResourceRecord, DnsRecordType } from "@/features/protocols/dns/dns.types";
import type { DnsResolutionOutcome } from "@/features/protocols/dns/dns.resolver";
import type { DnsValidationError } from "@/features/protocols/dns/dns.validators";
import { HIERARCHY_NODES, HIERARCHY_LINKS } from "@/features/protocols/dns/dns.defaults";

export function DnsVisualizer() {
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
    loadProtocol("dns");
  }, [loadProtocol]);

  // Extract DNS state from simulator initialState
  const rawNodes = protocolState.nodes as DnsNode[] | undefined;
  const nodes: DnsNode[] = Array.isArray(rawNodes) && rawNodes.length > 0 ? rawNodes : HIERARCHY_NODES;

  const rawLinks = protocolState.links as DnsLink[] | undefined;
  const links: DnsLink[] = Array.isArray(rawLinks) && rawLinks.length > 0 ? rawLinks : HIERARCHY_LINKS;

  const queryHostname = (protocolState.queryHostname as string) ?? "www.example.com";
  const queryType = (protocolState.queryType as DnsRecordType) ?? "A";
  const cacheEntries: DnsCacheEntry[] = (protocolState.cacheEntries as DnsCacheEntry[]) ?? [];
  const outcome = (protocolState.outcome as DnsResolutionOutcome) ?? {
    success: true,
    rcode: "NOERROR",
    resolvedRecords: [],
    steps: [],
    flags: { qr: true, opcode: 0, aa: true, tc: false, rd: true, ra: true, rcode: "NOERROR" },
    isCacheHit: false,
  };
  const resolvedRecords: DnsResourceRecord[] = (protocolState.resolvedRecords as DnsResourceRecord[]) ?? [];
  const validationErrors: DnsValidationError[] = (protocolState.validationErrors as DnsValidationError[]) ?? [];
  const topologyPreset = (protocolState.topologyPreset as string) ?? "iterative-hierarchy";

  const activeEvent = currentStep >= 0 && events[currentStep] ? events[currentStep] : null;
  const activePacket = activeEvent?.packetId
    ? packets.find((p) => p.id === activeEvent.packetId) ?? null
    : null;

  const selectedNode: DnsNode =
    nodes.find((n) => n.id === selectedNodeId) ?? nodes[0] ?? HIERARCHY_NODES[0];

  const hostedRecords: DnsResourceRecord[] = Array.isArray(selectedNode?.records)
    ? selectedNode.records
    : [];

  // Handlers for topology preset & query updates
  const handleSelectTopologyPreset = (
    preset: "iterative-hierarchy" | "recursive-caching" | "cname-chain" | "split-brain-lan"
  ) => {
    loadProtocol("dns", { topologyPreset: preset, failureScenario: "none" });
    setSelectedNodeId(preset === "split-brain-lan" ? "client-internal" : "client-1");
  };

  const handleUpdateQuery = (hostname: string, type: DnsRecordType) => {
    loadProtocol("dns", { queryHostname: hostname, queryType: type });
  };

  const handleSelectScenario = (scenario: string) => {
    loadProtocol("dns", { failureScenario: scenario });
  };

  return (
    <div className="flex flex-col gap-3 p-3 h-full min-h-0">
      {/* Top Header Bar with Mode Toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs uppercase tracking-wider font-mono">
            DNS
          </Badge>
          <div>
            <h2 className="text-sm font-semibold">Domain Name System (Network Services)</h2>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Iterative hierarchy traversal, recursive caching, CNAME chaining, and DNS header decoding
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
            <DnsTopology
              nodes={nodes}
              links={links}
              queryHostname={queryHostname}
              resolvedRecords={resolvedRecords}
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
                { id: "hierarchy", label: "Delegation Hierarchy" },
                { id: "cache", label: "Resolver Cache & TTL" },
                { id: "records", label: "Zone Records" },
                { id: "headerDecoder", label: "Header & Flags" },
                { id: "config", label: "Architecture & Conditions" },
              ]}
            />

            <div className="min-h-[220px]">
              {activeTab === "events" && <EventTimeline />}
              {activeTab === "hierarchy" && (
                <DnsHierarchyView
                  queryHostname={queryHostname}
                  steps={outcome.steps}
                  rcode={outcome.rcode}
                />
              )}
              {activeTab === "cache" && (
                <DnsCacheTable cacheEntries={cacheEntries} />
              )}
              {activeTab === "records" && (
                <DnsRecordsTable nodes={nodes} />
              )}
              {activeTab === "headerDecoder" && (
                <DnsHeaderDecoder packet={activePacket} />
              )}
              {activeTab === "config" && (
                <DnsConfigPanel
                  queryHostname={queryHostname}
                  queryType={queryType}
                  topologyPreset={topologyPreset}
                  validationErrors={validationErrors}
                  onSelectTopologyPreset={handleSelectTopologyPreset}
                  onUpdateQuery={handleUpdateQuery}
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
                <CardTitle className="text-sm">Nameserver Inspector: {selectedNode?.name ?? "Node"}</CardTitle>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {selectedNode?.type ?? "server"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-3 overflow-auto space-y-3">
              <Tabs
                value={rightInspectorTab}
                onValueChange={setRightInspectorTab}
                tabs={[
                  { id: "general", label: "General" },
                  { id: "records", label: "Hosted Records" },
                  { id: "explanation", label: "Event Details" },
                ]}
              />

              {rightInspectorTab === "general" && (
                <div className="space-y-3 text-xs font-mono">
                  <div className="bg-secondary/40 p-2.5 rounded-lg border border-border space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Node Role:</span>
                      <span className="font-semibold capitalize">{selectedNode?.type ?? "server"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">IP Address:</span>
                      <span className="text-primary font-semibold">{selectedNode?.ipAddress ?? "0.0.0.0"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Zone Delegation:</span>
                      <span>{selectedNode?.zone ? selectedNode.zone : "Local Domain"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Hosted Records:</span>
                      <span>{hostedRecords.length} RRs</span>
                    </div>
                  </div>
                </div>
              )}

              {rightInspectorTab === "records" && (
                <div className="space-y-2 text-xs">
                  {hostedRecords.length === 0 ? (
                    <p className="text-muted-foreground p-2">No resource records hosted locally on this node.</p>
                  ) : (
                    hostedRecords.map((r) => (
                      <div
                        key={r.id}
                        className="p-2.5 rounded-lg border border-border bg-secondary/30 space-y-1 font-mono text-[11px]"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-primary">{r.name}</span>
                          <Badge variant="outline" className="text-[9px]">
                            {r.type}
                          </Badge>
                        </div>
                        <div className="text-emerald-400 font-bold">{r.value}</div>
                        <div className="text-[10px] text-muted-foreground font-sans">
                          TTL: {r.ttl}s · Section: {r.section}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {rightInspectorTab === "explanation" && (
                <DnsEventDetails
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

"use client";

import React, { useState, useEffect } from "react";
import { useSimulationStore } from "@/features/simulation/simulation-store";
import { SimulationControls } from "@/components/simulation/simulation-controls";
import { EventTimeline } from "@/components/simulation/event-timeline";
import { Tabs, Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { OspfTopology } from "./ospf-topology";
import { OspfLsdbView } from "./ospf-lsdb";
import { OspfSpfView } from "./ospf-spf-view";
import { OspfRoutingTable } from "./ospf-routing-table";
import { OspfNeighborTable } from "./ospf-neighbor-table";
import { OspfConfigPanel } from "./ospf-config-panel";
import { OspfEventDetails } from "./ospf-event-details";
import { OspfBgpComparisonModal } from "@/components/protocols/comparison/ospf-bgp-comparison-modal";
import type {
  OspfRouter,
  OspfLink,
  OspfArea,
  OspfSpfStep,
} from "@/features/protocols/ospf/ospf.types";
import type { OspfValidationError } from "@/features/protocols/ospf/ospf.validators";
import {
  DEFAULT_OSPF_ROUTERS,
  DEFAULT_OSPF_LINKS,
  DEFAULT_OSPF_AREAS,
} from "@/features/protocols/ospf/ospf.defaults";

export function OspfVisualizer() {
  const loadProtocol = useSimulationStore((s) => s.loadProtocol);
  const protocolState = useSimulationStore((s) => s.protocolState);
  const events = useSimulationStore((s) => s.events);
  const packets = useSimulationStore((s) => s.packets);
  const currentStep = useSimulationStore((s) => s.currentStep);
  const selectedEventId = useSimulationStore((s) => s.selectedEventId);

  // Local Visualizer UI States
  const [simulationMode, setSimulationMode] = useState<"realtime" | "simulation">("simulation");
  const [selectedRouterId, setSelectedRouterId] = useState<string>("R1");
  const [selectedRouteDest, setSelectedRouteDest] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("events");
  const [rightInspectorTab, setRightInspectorTab] = useState<string>("general");
  const [labelMode, setLabelMode] = useState<"simple" | "technical">("simple");

  useEffect(() => {
    loadProtocol("ospf");
  }, [loadProtocol]);

  // Extract OSPF state from simulator initialState
  const rawRouters = protocolState.routers as OspfRouter[] | undefined;
  const routers: OspfRouter[] = Array.isArray(rawRouters) && rawRouters.length > 0 ? rawRouters : DEFAULT_OSPF_ROUTERS;

  const rawLinks = protocolState.links as OspfLink[] | undefined;
  const links: OspfLink[] = Array.isArray(rawLinks) && rawLinks.length > 0 ? rawLinks : DEFAULT_OSPF_LINKS;

  const rawAreas = protocolState.areas as OspfArea[] | undefined;
  const areas: OspfArea[] = Array.isArray(rawAreas) && rawAreas.length > 0 ? rawAreas : DEFAULT_OSPF_AREAS;

  const topologyPreset = (protocolState.topologyPreset as string) ?? "diamond";
  const rootRouterId = (protocolState.rootRouterId as string) ?? "R1";
  const spfResults = (protocolState.spfResults as Record<string, { steps: OspfSpfStep[]; shortestPaths: Record<string, { cost: number; nextHop: string; exitInterface: string; path: string[] }> }>) ?? {};
  const validationErrors: OspfValidationError[] = (protocolState.validationErrors as OspfValidationError[]) ?? [];
  const activeShortestPath = (protocolState.activeShortestPath as string[]) ?? ["R1", "R2", "R4"];

  const activeEvent = currentStep >= 0 && events[currentStep] ? events[currentStep] : null;
  const activePacket = activeEvent?.packetId
    ? packets.find((p) => p.id === activeEvent.packetId) ?? null
    : null;

  const selectedRouter: OspfRouter =
    routers.find((r) => r.nodeId === selectedRouterId) ?? routers[0] ?? DEFAULT_OSPF_ROUTERS[0];
  const spfForSelected = spfResults[selectedRouter?.nodeId ?? "R1"] ?? { steps: [], shortestPaths: {} };

  const routerNeighbors = Array.isArray(selectedRouter?.neighbors) ? selectedRouter.neighbors : [];
  const routerInterfaces = Array.isArray(selectedRouter?.interfaces) ? selectedRouter.interfaces : [];

  // Handlers for interactive condition customization
  const handleSelectTopologyPreset = (preset: "diamond" | "ring" | "multi-area" | "triangle") => {
    loadProtocol("ospf", { topologyPreset: preset, rootRouterId: "R1", failureScenario: "none" });
    setSelectedRouterId("R1");
    setSelectedRouteDest(null);
  };

  const handleSelectRootRouter = (rootId: string) => {
    loadProtocol("ospf", { rootRouterId: rootId });
    setSelectedRouterId(rootId);
  };

  const handleUpdateRouter = (nodeId: string, updates: Partial<OspfRouter>) => {
    loadProtocol("ospf", {
      topologyPreset,
      routerOverrides: { [nodeId]: updates },
    });
  };

  const handleUpdateLinkCost = (linkId: string, cost: number) => {
    loadProtocol("ospf", {
      topologyPreset,
      linkCostOverrides: { [linkId]: cost },
    });
  };

  const handleToggleLink = (linkId: string) => {
    loadProtocol("ospf", {
      topologyPreset,
      toggledLinkId: linkId,
    });
  };

  const handleSelectScenario = (scenario: string) => {
    loadProtocol("ospf", { failureScenario: scenario });
  };

  return (
    <div className="flex flex-col gap-3 p-3 h-full min-h-0">
      {/* Top Header Bar with Mode Toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs uppercase tracking-wider font-mono">
            OSPFv2
          </Badge>
          <div>
            <h2 className="text-sm font-semibold">OSPF Protocol Studio (Interior Gateway)</h2>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Area 0 Backbone · Dijkstra SPF algorithm, LSDB synchronization, neighbor adjacencies, and convergence
            </p>
          </div>
        </div>

        {/* Real Time vs Simulation Mode Toggle & Comparison Modal */}
        <div className="flex items-center gap-2">
          <OspfBgpComparisonModal />
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
            <OspfTopology
              routers={routers}
              links={links}
              areas={areas}
              topologyPreset={topologyPreset}
              activeShortestPath={activeShortestPath}
              selectedRouterId={selectedRouter?.nodeId ?? "R1"}
              activeEvent={activeEvent}
              activePacket={activePacket}
              labelMode={labelMode}
              onSelectRouter={setSelectedRouterId}
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
                { id: "lsdb", label: "LSDB (Link-State DB)" },
                { id: "spfTree", label: "Dijkstra SPF Tree" },
                { id: "routes", label: "Routing Table (FIB)" },
                { id: "neighbors", label: "Neighbors (FSM)" },
                { id: "config", label: "Topology & Conditions" },
              ]}
            />

            <div className="min-h-[220px]">
              {activeTab === "events" && <EventTimeline />}
              {activeTab === "lsdb" && (
                <OspfLsdbView
                  routers={routers}
                  selectedRouterId={selectedRouter?.nodeId ?? "R1"}
                  onSelectRouter={setSelectedRouterId}
                />
              )}
              {activeTab === "spfTree" && (
                <OspfSpfView
                  rootNodeId={rootRouterId}
                  steps={spfForSelected.steps}
                  shortestPaths={spfForSelected.shortestPaths}
                />
              )}
              {activeTab === "routes" && (
                <OspfRoutingTable
                  router={selectedRouter}
                  selectedRouteDestination={selectedRouteDest}
                  onSelectRoute={(dest) => setSelectedRouteDest(dest)}
                />
              )}
              {activeTab === "neighbors" && (
                <OspfNeighborTable
                  router={selectedRouter}
                  allRouters={routers}
                />
              )}
              {activeTab === "config" && (
                <OspfConfigPanel
                  routers={routers}
                  links={links}
                  topologyPreset={topologyPreset}
                  rootRouterId={rootRouterId}
                  validationErrors={validationErrors}
                  onSelectTopologyPreset={handleSelectTopologyPreset}
                  onSelectRootRouter={handleSelectRootRouter}
                  onUpdateRouter={handleUpdateRouter}
                  onUpdateLinkCost={handleUpdateLinkCost}
                  onToggleLink={handleToggleLink}
                  onSelectFailureScenario={handleSelectScenario}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Router Inspector & Event Explanations */}
        <div className="flex flex-col gap-3 min-h-0">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Router Inspector: {selectedRouter?.name ?? "Router"}</CardTitle>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {selectedRouter?.nodeId ?? "R1"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-3 overflow-auto space-y-3">
              <Tabs
                value={rightInspectorTab}
                onValueChange={setRightInspectorTab}
                tabs={[
                  { id: "general", label: "General" },
                  { id: "interfaces", label: "Interfaces" },
                  { id: "explanation", label: "Event Details" },
                ]}
              />

              {rightInspectorTab === "general" && (
                <div className="space-y-3 text-xs font-mono">
                  <div className="bg-secondary/40 p-2.5 rounded-lg border border-border space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Node ID:</span>
                      <span className="font-semibold">{selectedRouter?.nodeId ?? "R1"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Router ID:</span>
                      <span className="text-primary font-semibold">{selectedRouter?.routerId ?? "1.1.1.1"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Process ID:</span>
                      <span>{selectedRouter?.processId ?? 1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Area ID:</span>
                      <span>Area {selectedRouter?.areaId ?? "0.0.0.0"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Adjacency State:</span>
                      <span className="text-emerald-400 font-semibold">{selectedRouter?.state ?? "Full"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Neighbors Count:</span>
                      <span>{routerNeighbors.length}</span>
                    </div>
                  </div>
                </div>
              )}

              {rightInspectorTab === "interfaces" && (
                <div className="space-y-2 text-xs">
                  {routerInterfaces.map((iface) => (
                    <div
                      key={iface.id}
                      className="p-2.5 rounded-lg border border-border bg-secondary/30 space-y-1 font-mono text-[11px]"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-primary">{iface.name}</span>
                        <Badge variant={iface.enabled ? "success" : "outline"} className="text-[9px]">
                          {iface.enabled ? "UP" : "DOWN"}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground">
                        IP: {iface.ipAddress}/{iface.prefixLength} · Cost: {iface.cost}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-sans">
                        Hello: {iface.helloInterval}s · Dead: {iface.deadInterval}s {iface.passive && "· (Passive)"}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {rightInspectorTab === "explanation" && (
                <OspfEventDetails
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

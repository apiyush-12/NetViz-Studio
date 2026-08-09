"use client";

import React, { useState, useEffect } from "react";
import { useSimulationStore } from "@/features/simulation/simulation-store";
import { SimulationControls } from "@/components/simulation/simulation-controls";
import { EventTimeline } from "@/components/simulation/event-timeline";
import { Tabs, Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { BgpTopology } from "./bgp-topology";
import { BgpPeerTable } from "./bgp-peer-table";
import { BgpRouteTable } from "./bgp-route-table";
import { BgpBestPathPanel } from "./bgp-best-path-panel";
import { BgpConfigPanel } from "./bgp-config-panel";
import { BgpEventDetails } from "./bgp-event-details";
import type { BgpRouter, BgpLink, AutonomousSystem, BgpBestPathComparisonStep, BgpRoute } from "@/features/protocols/bgp/bgp.types";
import type { BgpValidationError } from "@/features/protocols/bgp/bgp.validators";
import { DEFAULT_BGP_ROUTERS, DEFAULT_BGP_LINKS, DEFAULT_AUTONOMOUS_SYSTEMS } from "@/features/protocols/bgp/bgp.defaults";

export function BgpVisualizer() {
  const loadProtocol = useSimulationStore((s) => s.loadProtocol);
  const protocolState = useSimulationStore((s) => s.protocolState);
  const events = useSimulationStore((s) => s.events);
  const packets = useSimulationStore((s) => s.packets);
  const currentStep = useSimulationStore((s) => s.currentStep);
  const selectedEventId = useSimulationStore((s) => s.selectedEventId);

  // Local Visualizer UI States
  const [simulationMode, setSimulationMode] = useState<"realtime" | "simulation">("simulation");
  const [selectedRouterId, setSelectedRouterId] = useState<string>("R1");
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("events");
  const [rightInspectorTab, setRightInspectorTab] = useState<string>("general");
  const [labelMode, setLabelMode] = useState<"simple" | "technical">("simple");

  useEffect(() => {
    loadProtocol("bgp");
  }, [loadProtocol]);

  // Extract BGP state from simulator initialState
  const routers: BgpRouter[] = (protocolState.routers as BgpRouter[]) ?? DEFAULT_BGP_ROUTERS;
  const links: BgpLink[] = (protocolState.links as BgpLink[]) ?? DEFAULT_BGP_LINKS;
  const autonomousSystems: AutonomousSystem[] = (protocolState.autonomousSystems as AutonomousSystem[]) ?? DEFAULT_AUTONOMOUS_SYSTEMS;
  const topologyPreset = (protocolState.topologyPreset as string) ?? "multi-homed";
  const bestPathEvalR1 = protocolState.bestPathEvaluationR1 as
    | {
        bestRoute: BgpRoute | null;
        comparisonSteps: BgpBestPathComparisonStep[];
        winningReason: string;
      }
    | undefined;
  const validationErrors: BgpValidationError[] = (protocolState.validationErrors as BgpValidationError[]) ?? [];
  const activeBestPath = (protocolState.activeBestPath as string[]) ?? ["R1", "R2", "R4"];

  const activeEvent = currentStep >= 0 && events[currentStep] ? events[currentStep] : null;
  const activePacket = activeEvent?.packetId
    ? packets.find((p) => p.id === activeEvent.packetId) ?? null
    : null;

  const selectedRouter = routers.find((r) => r.nodeId === selectedRouterId) ?? routers[0];

  // Handler for topology preset & condition modification
  const handleSelectTopologyPreset = (preset: "multi-homed" | "tier1-hub" | "triangle" | "ibgp-ebgp") => {
    loadProtocol("bgp", { topologyPreset: preset, failureScenario: "none" });
    const firstNodeId = preset === "ibgp-ebgp" ? "R1A" : "R1";
    setSelectedRouterId(firstNodeId);
    setSelectedRouteId(null);
  };

  const handleUpdatePeerAttribute = (
    routerNodeId: string,
    peerId: string,
    field: "localPreference" | "med" | "asPathPrependCount" | "remoteAsn",
    value: number
  ) => {
    const updatedRouters = routers.map((r) => {
      if (r.nodeId === routerNodeId) {
        const updatedPeers = r.peers.map((p) => (p.id === peerId ? { ...p, [field]: value } : p));
        return { ...r, peers: updatedPeers };
      }
      return r;
    });
    loadProtocol("bgp", { routers: updatedRouters });
  };

  const handleToggleLink = (linkId: string) => {
    const updatedLinks = links.map((l) =>
      l.id === linkId ? { ...l, enabled: !l.enabled, status: !l.enabled ? ("up" as const) : ("down" as const) } : l
    );
    loadProtocol("bgp", { links: updatedLinks });
  };

  const handleSelectScenario = (scenario: string) => {
    loadProtocol("bgp", { failureScenario: scenario });
  };

  return (
    <div className="flex flex-col gap-3 p-3 h-full min-h-0">
      {/* Top Header Bar with Mode Toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs uppercase tracking-wider font-mono">
            BGP-4
          </Badge>
          <div>
            <h2 className="text-sm font-semibold">Border Gateway Protocol (Policy-Driven Path Routing)</h2>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Multi-topology autonomous system selection, LOCAL_PREF, AS_PATH loop prevention, and MED comparisons
            </p>
          </div>
        </div>

        {/* Real Time vs Simulation Mode Toggle */}
        <div className="flex items-center gap-1 bg-secondary/70 p-1 rounded-lg border border-border">
          <button
            onClick={() => setSimulationMode("realtime")}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
              simulationMode === "realtime"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Real Time
          </button>
          <button
            onClick={() => setSimulationMode("simulation")}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
              simulationMode === "simulation"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Simulation
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-3 min-h-0">
        {/* Left Column: Topology Canvas & Simulation Controls */}
        <div className="flex flex-col gap-3 min-h-0">
          <div className="flex-1 min-h-[460px]">
            <BgpTopology
              routers={routers}
              links={links}
              autonomousSystems={autonomousSystems}
              topologyPreset={topologyPreset}
              selectedRouterId={selectedRouterId}
              activeBestPath={activeBestPath}
              activeEvent={activeEvent}
              activePacket={activePacket}
              labelMode={labelMode}
              onSelectRouter={(rId) => {
                setSelectedRouterId(rId);
                setSelectedRouteId(null);
              }}
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
                { id: "peers", label: "Peers & FSM" },
                { id: "bgpTable", label: "BGP Table (RIB)" },
                { id: "bestPath", label: "Best-Path Decision" },
                { id: "routes", label: "IP Routing Table" },
                { id: "config", label: "AS Topology & Policy" },
              ]}
            />

            <div className="min-h-[220px]">
              {activeTab === "events" && <EventTimeline />}
              {activeTab === "peers" && (
                <BgpPeerTable router={selectedRouter} />
              )}
              {activeTab === "bgpTable" && (
                <BgpRouteTable
                  router={selectedRouter}
                  selectedRouteId={selectedRouteId}
                  onSelectRoute={setSelectedRouteId}
                />
              )}
              {activeTab === "bestPath" && bestPathEvalR1 && (
                <BgpBestPathPanel
                  comparisonSteps={bestPathEvalR1.comparisonSteps ?? []}
                  winningReason={bestPathEvalR1.winningReason ?? "Optimal path selected"}
                  bestRouteName={
                    bestPathEvalR1.bestRoute?.nextHop === "192.0.2.2"
                      ? "Path A (via AS 65002)"
                      : bestPathEvalR1.bestRoute?.nextHop === "192.0.2.6"
                        ? "Path B (via AS 65003)"
                        : "None (Prefix Withdrawn)"
                  }
                />
              )}
              {activeTab === "routes" && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      {selectedRouter.name} (AS {selectedRouter.localAsn}) — IP Routing Table (FIB)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedRouter.routingTable.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">
                        No active BGP routes installed in IP forwarding table.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs font-mono">
                          <thead>
                            <tr className="border-b border-border text-muted-foreground text-left font-sans">
                              <th className="py-2">Protocol Source</th>
                              <th className="py-2">Destination Prefix</th>
                              <th className="py-2">Next Hop IP</th>
                              <th className="py-2">AS_PATH</th>
                              <th className="py-2">Metric</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40">
                            {selectedRouter.routingTable.map((route, i) => (
                              <tr key={i} className="hover:bg-accent/40">
                                <td className="py-2">
                                  <Badge variant="default" className="text-[10px]">
                                    {route.source}
                                  </Badge>
                                </td>
                                <td className="py-2 font-medium text-foreground">{route.destination}</td>
                                <td className="py-2 text-primary">{route.nextHop}</td>
                                <td className="py-2 text-muted-foreground">{route.asPath.join(" ")}</td>
                                <td className="py-2 text-muted-foreground">{route.metric}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              {activeTab === "config" && (
                <BgpConfigPanel
                  routers={routers}
                  links={links}
                  topologyPreset={topologyPreset}
                  validationErrors={validationErrors}
                  onSelectTopologyPreset={handleSelectTopologyPreset}
                  onUpdatePeerAttribute={handleUpdatePeerAttribute}
                  onToggleLink={handleToggleLink}
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
                <CardTitle className="text-sm">Router Inspector: {selectedRouter.name}</CardTitle>
                <Badge variant="outline" className="font-mono text-[10px]">
                  AS {selectedRouter.localAsn} · {selectedRouter.routerId}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-3 overflow-auto space-y-3">
              <Tabs
                value={rightInspectorTab}
                onValueChange={setRightInspectorTab}
                tabs={[
                  { id: "general", label: "General" },
                  { id: "networks", label: "Networks" },
                  { id: "explanation", label: "Event Details" },
                ]}
              />

              {rightInspectorTab === "general" && (
                <div className="space-y-3 text-xs font-mono">
                  <div className="bg-secondary/40 p-2.5 rounded-lg border border-border space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Node ID:</span>
                      <span className="font-semibold">{selectedRouter.nodeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Local ASN:</span>
                      <span className="text-primary font-semibold">AS {selectedRouter.localAsn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">BGP Router ID:</span>
                      <span>{selectedRouter.routerId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">BGP Session Status:</span>
                      <span className="text-emerald-400 font-semibold">{selectedRouter.state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Configured Peers:</span>
                      <span>{selectedRouter.peers.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Prefixes in RIB:</span>
                      <span>{selectedRouter.bgpTable.length}</span>
                    </div>
                  </div>
                </div>
              )}

              {rightInspectorTab === "networks" && (
                <div className="space-y-2 text-xs">
                  {selectedRouter.advertisedPrefixes.length === 0 ? (
                    <p className="text-muted-foreground p-2">No prefixes locally originated by this AS.</p>
                  ) : (
                    selectedRouter.advertisedPrefixes.map((p) => (
                      <div key={p} className="p-2.5 rounded-lg border border-border bg-secondary/30 flex justify-between items-center font-mono">
                        <span className="text-primary font-medium">{p}</span>
                        <Badge variant="success" className="text-[10px]">ORIGINATED (IGP)</Badge>
                      </div>
                    ))
                  )}
                </div>
              )}

              {rightInspectorTab === "explanation" && (
                <BgpEventDetails
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

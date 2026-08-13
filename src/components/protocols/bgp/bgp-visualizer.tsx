"use client";

import React, { useState, useEffect } from "react";
import { useSimulationStore } from "@/features/simulation/simulation-store";
import { SimulationControls } from "@/components/simulation/simulation-controls";
import { EventTimeline } from "@/components/simulation/event-timeline";
import { Tabs, Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { BgpTopology } from "./bgp-topology";
import { BgpRouteTable } from "./bgp-route-table";
import { BgpPeerTable } from "./bgp-peer-table";
import { BgpBestPathPanel } from "./bgp-best-path-panel";
import { BgpConfigPanel } from "./bgp-config-panel";
import { BgpEventDetails } from "./bgp-event-details";
import { OspfBgpComparisonModal } from "@/components/protocols/comparison/ospf-bgp-comparison-modal";
import type {
  BgpRouter,
  BgpLink,
  AutonomousSystem,
  BgpRoute,
  BgpBestPathComparisonStep,
} from "@/features/protocols/bgp/bgp.types";
import type { BgpValidationError } from "@/features/protocols/bgp/bgp.validators";
import {
  DEFAULT_BGP_ROUTERS,
  DEFAULT_BGP_LINKS,
  DEFAULT_AUTONOMOUS_SYSTEMS,
} from "@/features/protocols/bgp/bgp.defaults";

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
  const rawRouters = protocolState.routers as BgpRouter[] | undefined;
  const routers: BgpRouter[] = Array.isArray(rawRouters) && rawRouters.length > 0 ? rawRouters : DEFAULT_BGP_ROUTERS;

  const rawLinks = protocolState.links as BgpLink[] | undefined;
  const links: BgpLink[] = Array.isArray(rawLinks) && rawLinks.length > 0 ? rawLinks : DEFAULT_BGP_LINKS;

  const rawAs = protocolState.autonomousSystems as AutonomousSystem[] | undefined;
  const autonomousSystems: AutonomousSystem[] = Array.isArray(rawAs) && rawAs.length > 0 ? rawAs : DEFAULT_AUTONOMOUS_SYSTEMS;

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

  const selectedRouter: BgpRouter =
    routers.find((r) => r.nodeId === selectedRouterId) ?? routers[0] ?? DEFAULT_BGP_ROUTERS[0];

  const configuredPeers = Array.isArray(selectedRouter?.peers) ? selectedRouter.peers : [];
  const bgpTableEntries = Array.isArray(selectedRouter?.bgpTable) ? selectedRouter.bgpTable : [];
  const advertisedPrefixes = Array.isArray(selectedRouter?.advertisedPrefixes) ? selectedRouter.advertisedPrefixes : [];

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
    loadProtocol("bgp", {
      topologyPreset,
      peerPolicyOverride: {
        peerId,
        attribute: field === "asPathPrependCount" ? "asPathPrepend" : field,
        value,
      },
    });
  };

  const handleToggleLink = (linkId: string) => {
    loadProtocol("bgp", {
      topologyPreset,
      toggledLinkId: linkId,
    });
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
            <h2 className="text-sm font-semibold">Border Gateway Protocol Studio (Inter-Domain)</h2>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Multi-AS topologies, BGP decision algorithm, path attributes, policy filtering, and convergence
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
            <BgpTopology
              routers={routers}
              links={links}
              autonomousSystems={autonomousSystems}
              topologyPreset={topologyPreset}
              activeBestPath={activeBestPath}
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
                { id: "bgpTable", label: "BGP Table (RIB)" },
                { id: "peers", label: "Peering Sessions (FSM)" },
                { id: "bestPath", label: "Decision Algorithm" },
                { id: "config", label: "Topology & Conditions" },
              ]}
            />

            <div className="min-h-[220px]">
              {activeTab === "events" && <EventTimeline />}
              {activeTab === "bgpTable" && (
                <BgpRouteTable
                  router={selectedRouter}
                  selectedRouteId={selectedRouteId}
                  onSelectRoute={setSelectedRouteId}
                />
              )}
              {activeTab === "peers" && (
                <BgpPeerTable router={selectedRouter} allRouters={routers} />
              )}
              {activeTab === "bestPath" && (
                <BgpBestPathPanel
                  comparisonSteps={bestPathEvalR1?.comparisonSteps ?? []}
                  winningReason={bestPathEvalR1?.winningReason ?? "Optimal path selected."}
                  bestRouteName={bestPathEvalR1?.bestRoute?.prefix ?? "198.51.100.0/24"}
                />
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

        {/* Right Column: Router Inspector & Event Explanations */}
        <div className="flex flex-col gap-3 min-h-0">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">BGP Speaker: {selectedRouter?.name ?? "Router"}</CardTitle>
                <Badge variant="outline" className="font-mono text-[10px]">
                  AS {selectedRouter?.localAsn ?? 65001} · {selectedRouter?.nodeId ?? "R1"}
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
                      <span className="font-semibold">{selectedRouter?.nodeId ?? "R1"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Local ASN:</span>
                      <span className="text-primary font-semibold">AS {selectedRouter?.localAsn ?? 65001}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">BGP Router ID:</span>
                      <span>{selectedRouter?.routerId ?? "1.1.1.1"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">BGP Session Status:</span>
                      <span className="text-emerald-400 font-semibold">{selectedRouter?.state ?? "Established"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Configured Peers:</span>
                      <span>{configuredPeers.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Prefixes in RIB:</span>
                      <span>{bgpTableEntries.length}</span>
                    </div>
                  </div>
                </div>
              )}

              {rightInspectorTab === "networks" && (
                <div className="space-y-2 text-xs">
                  {advertisedPrefixes.length === 0 ? (
                    <p className="text-muted-foreground p-2">No prefixes locally originated by this AS.</p>
                  ) : (
                    advertisedPrefixes.map((p) => (
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

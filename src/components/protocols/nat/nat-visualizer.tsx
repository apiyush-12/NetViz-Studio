"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Shield,
  Radio,
  Play,
  Database,
} from "lucide-react";
import { Badge, Tabs, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { NatTopology } from "./nat-topology";
import { NatTableInspector } from "./nat-table-inspector";
import { NatPacketInspector } from "./nat-packet-inspector";
import { NatEventDetails } from "./nat-event-details";
import { NatPatComparisonModal } from "../comparison/nat-pat-comparison-modal";
import { SimulationControls } from "@/components/simulation/simulation-controls";
import { useSimulationStore } from "@/features/simulation/simulation-store";
import {
  defaultNatConfig,
  defaultNatNodes,
  defaultNatLinks,
  natScenarios,
} from "@/features/protocols/nat/nat.defaults";
import { simulateNatTransaction } from "@/features/protocols/nat/nat.simulator";
import type {
  NatConfig,
  NatScenarioId,
} from "@/features/protocols/nat/nat.types";

export function NatVisualizer() {
  const [config, setConfig] = useState<NatConfig>(defaultNatConfig);
  const [scenarioId, setScenarioId] = useState<NatScenarioId>("pat_web_browse");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("nat-router");
  const [simulationMode, setSimulationMode] = useState<"realtime" | "simulation">("realtime");
  const [activeBottomTab, setActiveBottomTab] = useState("table");
  const [activeRightTab, setActiveRightTab] = useState("node");

  const loadProtocol = useSimulationStore((s) => s.loadProtocol);
  const storeStep = useSimulationStore((s) => s.currentStep);
  const scrubTo = useSimulationStore((s) => s.scrubTo);

  // Initialize simulation store for NAT
  useEffect(() => {
    loadProtocol("nat", { mode: config.mode, scenarioId });
  }, [loadProtocol, config.mode, scenarioId]);

  // Calculate simulation outcome dynamically
  const outcome = useMemo(() => {
    return simulateNatTransaction(config, scenarioId);
  }, [config, scenarioId]);

  const activeEventIndex = storeStep >= 0 && storeStep < outcome.events.length ? storeStep : 0;
  const activeEvent = outcome.events[activeEventIndex] || outcome.events[0];
  const activePacket = outcome.packets[activeEventIndex] || outcome.packets[0];

  const selectedNode = defaultNatNodes.find((n) => n.id === selectedNodeId) || defaultNatNodes[2];

  const handleSelectScenario = (id: NatScenarioId) => {
    setScenarioId(id);
    const sc = natScenarios.find((s) => s.id === id);
    if (sc && sc.config) {
      setConfig((prev) => ({
        ...prev,
        ...sc.config,
      }));
    }
    scrubTo(0);
  };

  return (
    <div className="flex flex-col gap-3 p-3 max-w-[1700px] mx-auto w-full min-h-0">
      {/* Top Header Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                Network Address Translation (NAT / PAT) Studio
              </h2>
              <Badge variant="default" className="text-[10px] font-mono bg-emerald-500 text-slate-950">
                RFC 3022 / RFC 4787
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              IPv4 Header Rewriting · Stateful 4-Tuple Socket Tables · PAT Port Overload · DNAT Port Forwarding
            </p>
          </div>
        </div>

        {/* Quick Actions: Comparison Modal & Mode Toggle */}
        <div className="flex items-center gap-2">
          <NatPatComparisonModal />

          {/* Mode Switcher */}
          <div className="flex items-center rounded-lg border border-border bg-secondary/30 p-0.5 text-xs">
            <button
              onClick={() => setSimulationMode("realtime")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                simulationMode === "realtime"
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Radio className="h-3 w-3" />
              <span>Real-Time</span>
            </button>
            <button
              onClick={() => setSimulationMode("simulation")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                simulationMode === "simulation"
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Play className="h-3 w-3" />
              <span>Simulation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_360px] 2xl:grid-cols-[1fr_400px] gap-3 min-h-0">
        {/* Left Column: Topology Canvas + Controls + Bottom Dock */}
        <div className="flex flex-col gap-3 min-h-0">
          {/* Network Topology Canvas */}
          <div className="h-[320px] sm:h-[360px] lg:h-[400px] xl:h-[420px] w-full shrink-0">
            <NatTopology
              nodes={defaultNatNodes}
              links={defaultNatLinks}
              selectedNodeId={selectedNodeId}
              activePacket={activePacket}
              mode={config.mode}
              onSelectNode={setSelectedNodeId}
              onSelectScenario={handleSelectScenario}
            />
          </div>

          {/* Playback Scrubber (when in Simulation mode) */}
          {simulationMode === "simulation" && <SimulationControls />}

          {/* Bottom Dock Tabs */}
          <div className="border border-border rounded-xl bg-card p-3 flex flex-col gap-3 shadow-sm">
            <Tabs
              value={activeBottomTab}
              onValueChange={setActiveBottomTab}
              tabs={[
                { id: "table", label: `Translation Table (${outcome.translationTable.length})` },
                { id: "packet", label: "Packet Header Diff" },
                { id: "events", label: `Simulation Trace (${outcome.events.length} Steps)` },
              ]}
            />

            <div className="min-h-[180px] max-h-[280px] overflow-auto">
              {activeBottomTab === "table" && (
                <NatTableInspector translationTable={outcome.translationTable} />
              )}
              {activeBottomTab === "packet" && activeEvent && (
                <NatPacketInspector
                  beforeHeader={activeEvent.beforeHeader}
                  afterHeader={activeEvent.afterHeader}
                  protocol={activeEvent.protocol}
                />
              )}
              {activeBottomTab === "events" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {outcome.events.map((evt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          scrubTo(idx);
                          setActiveRightTab("event");
                        }}
                        className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                          activeEventIndex === idx
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border bg-secondary/20 hover:bg-secondary/40"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mb-1">
                          <span>Step {evt.step}</span>
                          <span className={evt.type === "packet-dropped" ? "text-red-400" : "text-emerald-400"}>
                            {evt.type.toUpperCase()}
                          </span>
                        </div>
                        <div className="font-semibold text-xs text-foreground truncate">
                          {evt.title}
                        </div>
                        <p className="text-[10.5px] text-muted-foreground truncate mt-0.5">
                          {evt.summary}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Contextual Inspector */}
        <div className="flex flex-col gap-3 min-h-0">
          <div className="border border-border rounded-xl bg-card p-3 flex flex-col gap-3 shadow-sm h-full max-h-[calc(100vh-140px)] overflow-y-auto">
            <Tabs
              value={activeRightTab}
              onValueChange={setActiveRightTab}
              tabs={[
                { id: "node", label: "Node Inspector" },
                { id: "event", label: "RFC Explanation" },
              ]}
            />

            {activeRightTab === "node" && (
              <div className="space-y-3 text-xs">
                <Card className="border-border bg-secondary/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold text-foreground">
                        {selectedNode.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] font-mono capitalize">
                        {selectedNode.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      {selectedNode.roleDescription}
                    </p>
                    <div className="pt-2 border-t border-border/50 space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Primary IP:</span>
                        <span className="text-foreground">{selectedNode.ipAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">MAC Address:</span>
                        <span className="text-muted-foreground">{selectedNode.macAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Zone Assignment:</span>
                        <span className={selectedNode.zone === "outside" ? "text-emerald-400 font-semibold" : "text-blue-400 font-semibold"}>
                          {selectedNode.zone.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {selectedNode.type === "nat-router" && (
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-emerald-400">
                        <Database className="h-3.5 w-3.5" />
                        <span>NAT Hardware Engine Specs</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1.5 text-[11px] font-mono">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Public WAN IP:</span>
                        <span className="text-emerald-400 font-bold">{config.publicIp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">LAN Subnet:</span>
                        <span className="text-foreground">{config.privateSubnet}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active Table Size:</span>
                        <span className="text-foreground">{outcome.translationTable.length} / 65,535</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeRightTab === "event" && (
              <NatEventDetails event={activeEvent} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

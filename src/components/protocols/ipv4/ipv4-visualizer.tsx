"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Layers,
  Radio,
  Play,
  Server,
} from "lucide-react";
import { Badge, Tabs, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Ipv4Topology } from "./ipv4-topology";
import { Ipv4HeaderInspector } from "./ipv4-header-inspector";
import { Ipv4FragmentationInspector } from "./ipv4-fragmentation-inspector";
import { Ipv4EventDetails } from "./ipv4-event-details";
import { Ipv4Ipv6ComparisonModal } from "../comparison/ipv4-ipv6-comparison-modal";
import { SimulationControls } from "@/components/simulation/simulation-controls";
import { useSimulationStore } from "@/features/simulation/simulation-store";
import {
  defaultIpv4Config,
  defaultIpv4Nodes,
  defaultIpv4Links,
  ipv4Scenarios,
} from "@/features/protocols/ipv4/ipv4.defaults";
import { simulateIpv4Transaction } from "@/features/protocols/ipv4/ipv4.simulator";
import type {
  Ipv4Config,
  Ipv4ScenarioId,
} from "@/features/protocols/ipv4/ipv4.types";

export function Ipv4Visualizer() {
  const [config, setConfig] = useState<Ipv4Config>(defaultIpv4Config);
  const [scenarioId, setScenarioId] = useState<Ipv4ScenarioId>("standard_forwarding");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("host-a");
  const [simulationMode, setSimulationMode] = useState<"realtime" | "simulation">("realtime");
  const [activeBottomTab, setActiveBottomTab] = useState("header");
  const [activeRightTab, setActiveRightTab] = useState("node");

  const loadProtocol = useSimulationStore((s) => s.loadProtocol);
  const storeStep = useSimulationStore((s) => s.currentStep);
  const scrubTo = useSimulationStore((s) => s.scrubTo);

  // Initialize simulation store for IPv4
  useEffect(() => {
    loadProtocol("ipv4", { ...config, scenarioId });
  }, [loadProtocol, config, scenarioId]);

  // Calculate simulation outcome dynamically
  const outcome = useMemo(() => {
    return simulateIpv4Transaction(config, scenarioId);
  }, [config, scenarioId]);

  const activeEventIndex = storeStep >= 0 && storeStep < outcome.events.length ? storeStep : 0;
  const activeEvent = outcome.events[activeEventIndex] || outcome.events[0];
  const activePacket = outcome.packets[activeEventIndex] || outcome.packets[0];

  const selectedNode = defaultIpv4Nodes.find((n) => n.id === selectedNodeId) || defaultIpv4Nodes[0];

  const handleSelectScenario = (id: Ipv4ScenarioId) => {
    setScenarioId(id);
    const sc = ipv4Scenarios.find((s) => s.id === id);
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
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                Internet Protocol version 4 (IPv4) Studio
              </h2>
              <Badge variant="default" className="text-[10px] font-mono bg-blue-500 text-slate-950">
                RFC 791 / RFC 815
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              32-Bit Dotted-Decimal Addressing · 20-Byte Fixed Header · MTU Fragmentation & Reassembly · TTL Decrement · CIDR Routing
            </p>
          </div>
        </div>

        {/* Quick Actions: Comparison Modal & Mode Toggle */}
        <div className="flex items-center gap-2">
          <Ipv4Ipv6ComparisonModal />

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
            <Ipv4Topology
              nodes={defaultIpv4Nodes}
              links={defaultIpv4Links}
              selectedNodeId={selectedNodeId}
              activePacket={activePacket}
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
                { id: "header", label: "20-Byte Header Bitfields" },
                { id: "frag", label: `MTU Fragmentation (${outcome.fragmentsGenerated} Slices)` },
                { id: "events", label: `Simulation Trace (${outcome.events.length} Steps)` },
              ]}
            />

            <div className="min-h-[180px] max-h-[300px] overflow-auto">
              {activeBottomTab === "header" && activeEvent && (
                <Ipv4HeaderInspector header={activeEvent.headerSnapshot} />
              )}
              {activeBottomTab === "frag" && (
                <Ipv4FragmentationInspector
                  fragments={activeEvent?.fragments}
                  packetSize={config.packetSize}
                  routerMtu={config.routerMtu}
                  dfFlag={config.dfFlag}
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
                          <span className={evt.type === "ttl-expired" ? "text-red-400" : "text-emerald-400"}>
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
                        <span className="text-muted-foreground">IPv4 Address:</span>
                        <span className="text-foreground">{selectedNode.ipAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subnet Mask:</span>
                        <span className="text-muted-foreground">{selectedNode.subnetMask}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Link MTU:</span>
                        <span className={selectedNode.mtu < 1500 ? "text-amber-400 font-bold" : "text-emerald-400 font-semibold"}>
                          {selectedNode.mtu} Bytes
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">MAC Address:</span>
                        <span className="text-muted-foreground">{selectedNode.macAddress}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-primary">
                      <Server className="h-3.5 w-3.5" />
                      <span>IPv4 Datagram Specs</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Datagram Size:</span>
                      <span className="text-foreground font-bold">{config.packetSize} Bytes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Initial TTL:</span>
                      <span className="text-foreground">{config.initialTtl} Hops</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hops Traversed:</span>
                      <span className="text-foreground">{outcome.hopsTraversed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Status:</span>
                      <span className={outcome.isDelivered ? "text-emerald-400 font-bold" : "text-destructive font-bold"}>
                        {outcome.isDelivered ? "DELIVERED" : "DROPPED"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeRightTab === "event" && (
              <Ipv4EventDetails event={activeEvent} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

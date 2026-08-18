"use client";

import React, { useState, useMemo } from "react";
import {
  Globe,
  Radio,
  Play,
  Shield,
} from "lucide-react";
import { Badge, Tabs, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { HttpTopology } from "./http-topology";
import { HttpRequestBuilder } from "./http-request-builder";
import { HttpResponseViewer } from "./http-response-viewer";
import { TlsHandshakeVisualizer } from "./tls-handshake-visualizer";
import { HttpMultiplexingView } from "./http-multiplexing-view";
import { HttpHeadersInspector } from "./http-headers-inspector";
import { HttpEventDetails } from "./http-event-details";
import { HttpHttpsComparisonModal } from "../comparison/http-https-comparison-modal";
import { SimulationControls } from "@/components/simulation/simulation-controls";
import {
  defaultHttpRequestData,
  defaultHttpNodes,
  defaultHttpLinks,
  httpScenarios,
} from "@/features/protocols/http/http.defaults";
import { simulateHttpRequest } from "@/features/protocols/http/http.simulator";
import type {
  HttpRequestData,
  HttpScenarioId,
} from "@/features/protocols/http/http.types";

export function HttpVisualizer() {
  const [request, setRequest] = useState<HttpRequestData>(defaultHttpRequestData);
  const [scenarioId, setScenarioId] = useState<HttpScenarioId>("https_tls13_handshake");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("web-server");
  const [simulationMode, setSimulationMode] = useState<"realtime" | "simulation">("realtime");
  const [activeBottomTab, setActiveBottomTab] = useState("response");
  const [activeRightTab, setActiveRightTab] = useState("node");

  // Calculate simulation trace dynamically
  const outcome = useMemo(() => {
    return simulateHttpRequest(request, scenarioId);
  }, [request, scenarioId]);

  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const activeEvent = outcome.events[activeEventIndex] || outcome.events[0];
  const activePacket = outcome.packets[activeEventIndex] || outcome.packets[0];

  const selectedNode = defaultHttpNodes.find((n) => n.id === selectedNodeId) || defaultHttpNodes[2];

  const handleSelectScenario = (id: HttpScenarioId) => {
    setScenarioId(id);
    const sc = httpScenarios.find((s) => s.id === id);
    if (sc && sc.request) {
      setRequest((prev) => ({
        ...prev,
        ...sc.request,
        headers: sc.request.headers || prev.headers,
      }));
    }
    setActiveEventIndex(0);
  };

  const handleSendCustomRequest = () => {
    setActiveEventIndex(0);
    // Instant re-simulation triggered via useMemo
  };

  return (
    <div className="flex flex-col gap-3 p-3 max-w-[1700px] mx-auto w-full min-h-0">
      {/* Top Header Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                HTTP / HTTPS Application Layer Studio
              </h2>
              <Badge variant="default" className="text-[10px] font-mono">
                RFC 9110 / RFC 8446
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Client Request Building · 1-RTT TLS 1.3 Handshake · HTTP/2 Multiplexing · Response Caching
            </p>
          </div>
        </div>

        {/* Quick Actions: Comparison Modal & Mode Toggle */}
        <div className="flex items-center gap-2">
          <HttpHttpsComparisonModal />

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
        {/* Left Column: Request Builder + Topology Canvas + Controls + Bottom Dock */}
        <div className="flex flex-col gap-3 min-h-0">
          {/* Postman-style Interactive Request Builder */}
          <HttpRequestBuilder
            request={request}
            onChangeRequest={setRequest}
            onSendRequest={handleSendCustomRequest}
          />

          {/* Network Topology Canvas */}
          <div className="h-[320px] sm:h-[360px] lg:h-[400px] xl:h-[420px] w-full shrink-0">
            <HttpTopology
              nodes={defaultHttpNodes}
              links={defaultHttpLinks}
              selectedNodeId={selectedNodeId}
              activePacket={activePacket}
              isHttps={request.useTls}
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
                { id: "response", label: `Server Response (${outcome.response.statusCode} ${outcome.response.statusText})` },
                { id: "tls", label: `TLS 1.3 Handshake (${outcome.tlsHandshakeSteps.length} Steps)` },
                { id: "streams", label: "HTTP/1.1 vs HTTP/2 Streams" },
                { id: "headers", label: "Security & Header Audit" },
                { id: "events", label: `Events (${outcome.events.length})` },
              ]}
            />

            <div className="min-h-[180px] max-h-[280px] overflow-auto">
              {activeBottomTab === "response" && (
                <HttpResponseViewer response={outcome.response} />
              )}
              {activeBottomTab === "tls" && (
                <TlsHandshakeVisualizer
                  steps={outcome.tlsHandshakeSteps}
                  isTlsEnabled={request.useTls}
                />
              )}
              {activeBottomTab === "streams" && (
                <HttpMultiplexingView />
              )}
              {activeBottomTab === "headers" && (
                <HttpHeadersInspector
                  requestHeaders={Object.fromEntries(
                    request.headers.filter((h) => h.enabled).map((h) => [h.name, h.value])
                  )}
                  responseHeaders={outcome.response.headers}
                  isHttps={request.useTls}
                />
              )}
              {activeBottomTab === "events" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {outcome.events.map((evt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveEventIndex(idx);
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
                          <span className={evt.isEncrypted ? "text-emerald-400" : "text-blue-400"}>
                            {evt.protocol}
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
                        <span className="text-muted-foreground">IP Address:</span>
                        <span className="text-foreground">{selectedNode.ipAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Default Port:</span>
                        <span className="text-foreground">{selectedNode.port}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="text-emerald-400 font-semibold uppercase">{selectedNode.status}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {selectedNode.tlsCertificate && (
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-emerald-400">
                        <Shield className="h-3.5 w-3.5" />
                        <span>TLS Server Certificate</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1.5 text-[11px] font-mono">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Subject CN:</span>
                        <span className="text-foreground">{selectedNode.tlsCertificate.commonName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Issuer:</span>
                        <span className="text-muted-foreground">{selectedNode.tlsCertificate.issuer}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Valid Range:</span>
                        <span className="text-emerald-400">
                          {selectedNode.tlsCertificate.validFrom} to {selectedNode.tlsCertificate.validTo}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeRightTab === "event" && (
              <HttpEventDetails event={activeEvent} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

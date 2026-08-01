"use client";

import React, { useState } from "react";
import { useTopologyStore } from "@/features/topology/topology-store";
import { SimulationScenario, PacketProtocol } from "@/features/topology/topology-types";
import { Button, Input, Label } from "@/components/ui";
import { Send, X } from "lucide-react";

export function TrafficSenderDialog() {
  const {
    isTrafficSenderOpen,
    setTrafficSenderOpen,
    topology,
    startSimulationScenario,
  } = useTopologyStore();

  const hostsAndServers = topology.nodes.filter(
    (n) => n.type !== "l2-switch" && n.type !== "access-point"
  );

  const [sourceNodeId, setSourceNodeId] = useState<string>(hostsAndServers[0]?.id || "");
  const [destinationNodeId, setDestinationNodeId] = useState<string>(hostsAndServers[1]?.id || hostsAndServers[0]?.id || "");
  const [trafficType, setTrafficType] = useState<SimulationScenario["trafficType"]>("ping");
  const [protocol, setProtocol] = useState<PacketProtocol>("ICMP");
  const [ttl, setTtl] = useState<number>(64);
  const [payloadSize, setPayloadSize] = useState<number>(64);

  if (!isTrafficSenderOpen) return null;

  const handleStartTraffic = () => {
    if (!sourceNodeId || !destinationNodeId) return;

    const scenario: SimulationScenario = {
      id: `scen-${Date.now()}`,
      name: `${trafficType.toUpperCase()} Test Flow`,
      trafficType,
      sourceNodeId,
      destinationNodeId,
      protocol: trafficType === "ping" ? "ICMP" : trafficType === "dns" ? "DNS" : trafficType === "http" ? "HTTP" : protocol,
      ttl,
      payloadSize,
      packetCount: 1,
    };

    startSimulationScenario(scenario);
    setTrafficSenderOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-emerald-400" />
            <h3 className="font-semibold text-base text-foreground">Send Test Traffic Flow</h3>
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setTrafficSenderOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-[11px]">Source Device</Label>
            <select
              value={sourceNodeId}
              onChange={(e) => setSourceNodeId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
            >
              {hostsAndServers.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.type})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px]">Destination Device</Label>
            <select
              value={destinationNodeId}
              onChange={(e) => setDestinationNodeId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
            >
              {hostsAndServers.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.type})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px]">Traffic Type / Protocol</Label>
            <select
              value={trafficType}
              onChange={(e) => {
                const val = e.target.value as SimulationScenario["trafficType"];
                setTrafficType(val);
                if (val === "ping") setProtocol("ICMP");
                if (val === "dns") setProtocol("DNS");
                if (val === "http") setProtocol("HTTP");
                if (val === "tcp") setProtocol("TCP");
                if (val === "udp") setProtocol("UDP");
              }}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
            >
              <option value="ping">Ping (ICMP Echo Request/Reply)</option>
              <option value="traceroute">Traceroute (Hop-by-hop Probe)</option>
              <option value="tcp">TCP Connection (3-Way Handshake)</option>
              <option value="udp">UDP Datagram Stream</option>
              <option value="dns">DNS Query (A Record Resolution)</option>
              <option value="http">HTTP GET Request / Web Traffic</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px]">Time-To-Live (TTL)</Label>
              <Input type="number" min={1} max={255} value={ttl} onChange={(e) => setTtl(Number(e.target.value))} />
            </div>
            <div>
              <Label className="text-[10px]">Payload Size (Bytes)</Label>
              <Input type="number" min={16} max={1500} value={payloadSize} onChange={(e) => setPayloadSize(Number(e.target.value))} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button size="sm" variant="outline" onClick={() => setTrafficSenderOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" variant="default" onClick={handleStartTraffic} className="gap-1.5 bg-emerald-600 hover:bg-emerald-500">
            <Send className="h-4 w-4" /> Start Simulation
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  AlertTriangle,
  Tag,
  Network,
  Monitor,
  Server,
  Globe,
  Database,
  Layers,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { DnsNode, DnsLink, DnsResourceRecord } from "@/features/protocols/dns/dns.types";
import type { Packet, SimulationEvent } from "@/features/simulation/simulation-types";
import { useSimulationStore } from "@/features/simulation/simulation-store";

interface DnsTopologyProps {
  nodes: DnsNode[];
  links: DnsLink[];
  queryHostname: string;
  resolvedRecords: DnsResourceRecord[];
  topologyPreset?: string;
  selectedNodeId: string | null;
  activeEvent?: SimulationEvent | null;
  activePacket: Packet | null;
  labelMode: "simple" | "technical";
  onSelectNode: (nodeId: string) => void;
  onToggleLabelMode: () => void;
  onSelectFailureScenario: (scenario: string) => void;
  onSelectTopologyPreset?: (preset: "iterative-hierarchy" | "recursive-caching" | "cname-chain" | "split-brain-lan") => void;
}

export function DnsTopology({
  nodes,
  links,
  queryHostname,
  resolvedRecords,
  topologyPreset = "iterative-hierarchy",
  selectedNodeId,
  activePacket,
  labelMode,
  onSelectNode,
  onToggleLabelMode,
  onSelectFailureScenario,
  onSelectTopologyPreset,
}: DnsTopologyProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showFailMenu, setShowFailMenu] = useState(false);
  const reducedMotion = useReducedMotion();

  const packets = useSimulationStore((s) => s.packets);
  const events = useSimulationStore((s) => s.events);
  const currentStep = useSimulationStore((s) => s.currentStep);
  const selectedPacketId = useSimulationStore((s) => s.selectedPacketId);
  const selectPacket = useSimulationStore((s) => s.selectPacket);

  const visibleEvents = currentStep >= 0 ? events.slice(0, currentStep + 1) : [];

  const handleZoomIn = () => setZoom((z) => Math.min(2, z + 0.15));
  const handleZoomOut = () => setZoom((z) => Math.max(0.6, z - 0.15));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const nodeMap = new Map<string, { x: number; y: number }>();
  nodes.forEach((n) => nodeMap.set(n.id, n.position));

  const sourcePos = activePacket ? nodeMap.get(activePacket.source) : null;
  const destPos = activePacket ? nodeMap.get(activePacket.destination) : null;

  const firstAnswer = resolvedRecords[resolvedRecords.length - 1];

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-950 grid-bg rounded-xl border border-border overflow-hidden select-none flex flex-col">
      {/* Top Header inside Canvas */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Topology Preset Selector */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 p-1 rounded-lg border border-border backdrop-blur">
          <div className="flex items-center gap-1 px-2 py-0.5 text-xs text-muted-foreground font-mono">
            <Network className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-foreground">Hierarchy:</span>
          </div>

          {[
            { id: "iterative-hierarchy", label: "Iterative Hierarchy" },
            { id: "recursive-caching", label: "Cache HIT / MISS" },
            { id: "cname-chain", label: "CNAME Chain" },
            { id: "split-brain-lan", label: "Split-Horizon" },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() =>
                onSelectTopologyPreset?.(
                  preset.id as "iterative-hierarchy" | "recursive-caching" | "cname-chain" | "split-brain-lan"
                )
              }
              className={cn(
                "px-2.5 py-1 text-xs rounded font-medium transition-colors cursor-pointer",
                topologyPreset === preset.id
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Right Tools (Resolved answer pill, Label Mode, Failure Injection) */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 p-1 rounded-lg border border-border backdrop-blur">
          <Badge variant="outline" className="font-mono text-[11px] text-emerald-400 border-emerald-500/40">
            {firstAnswer ? `${queryHostname} → ${firstAnswer.value}` : `${queryHostname}: Querying...`}
          </Badge>

          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleLabelMode}
            className="h-7 text-xs gap-1.5 font-mono"
            title="Toggle Simple / Technical Labels"
          >
            <Tag className="h-3.5 w-3.5 text-primary" />
            <span>{labelMode === "simple" ? "Simple" : "Tech"}</span>
          </Button>

          <div className="relative">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowFailMenu(!showFailMenu)}
              className="h-7 text-xs gap-1 text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Conditions</span>
            </Button>

            {showFailMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 border border-border rounded-lg shadow-xl p-1 z-50 text-xs flex flex-col gap-0.5">
                <button
                  onClick={() => { onSelectFailureScenario("none"); setShowFailMenu(false); }}
                  className="px-2.5 py-1.5 text-left rounded hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  ✓ Standard Iterative Query (A Record)
                </button>
                <button
                  onClick={() => { onSelectFailureScenario("cache_hit"); setShowFailMenu(false); }}
                  className="px-2.5 py-1.5 text-left rounded hover:bg-accent text-emerald-400 cursor-pointer"
                >
                  ⚡ Local Resolver Cache HIT (0 Hops)
                </button>
                <button
                  onClick={() => { onSelectFailureScenario("nxdomain_not_found"); setShowFailMenu(false); }}
                  className="px-2.5 py-1.5 text-left rounded hover:bg-accent text-amber-400 cursor-pointer"
                >
                  ⚠️ Non-Existent Domain (NXDOMAIN)
                </button>
                <button
                  onClick={() => { onSelectFailureScenario("cname_resolution"); setShowFailMenu(false); }}
                  className="px-2.5 py-1.5 text-left rounded hover:bg-accent text-primary cursor-pointer"
                >
                  ⚡ CNAME Alias Chain Resolution
                </button>
                <button
                  onClick={() => { onSelectFailureScenario("authoritative_timeout_servfail"); setShowFailMenu(false); }}
                  className="px-2.5 py-1.5 text-left rounded hover:bg-accent text-destructive cursor-pointer"
                >
                  ✕ Nameserver Timeout → SERVFAIL
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Left Canvas Navigation Toolbar */}
      <div className="absolute left-3 top-16 z-20 flex flex-col gap-1 bg-slate-900/90 p-1 rounded-lg border border-border backdrop-blur">
        <Button size="icon" variant="ghost" onClick={handleZoomIn} className="h-8 w-8" title="Zoom In">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={handleZoomOut} className="h-8 w-8" title="Zoom Out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={handleResetView} className="h-8 w-8" title="Fit View">
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={handleResetView} className="h-8 w-8" title="Reset">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Main SVG Canvas */}
      <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing">
        <svg
          viewBox="0 0 560 560"
          className="w-full h-full"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: "center center",
            transition: "transform 0.15s ease-out",
          }}
        >
          {/* Delegation Links */}
          {links.map((link) => {
            const src = nodeMap.get(link.sourceNodeId);
            const dst = nodeMap.get(link.targetNodeId);
            if (!src || !dst) return null;

            return (
              <line
                key={link.id}
                x1={src.x}
                y1={src.y}
                x2={dst.x}
                y2={dst.y}
                className="stroke-slate-700 stroke-2 stroke-dashed hover:stroke-slate-500 transition-colors"
              />
            );
          })}

          {/* DNS Hierarchy Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isRoot = node.type === "root-server";
            const isTld = node.type === "tld-server";
            const isAuth = node.type === "authoritative-server";
            const isResolver = node.type === "resolver";

            return (
              <g
                key={node.id}
                transform={`translate(${node.position.x}, ${node.position.y})`}
                onClick={() => onSelectNode(node.id)}
                className="cursor-pointer group"
              >
                {/* Node Glow on Selection */}
                {isSelected && (
                  <circle
                    r="27"
                    className="fill-primary/20 stroke-primary/50 stroke-2 animate-pulse"
                  />
                )}

                {/* Node Circle Box */}
                <circle
                  r="21"
                  className={cn(
                    "transition-all duration-200 stroke-2",
                    isRoot
                      ? "fill-card stroke-amber-400"
                      : isTld
                        ? "fill-card stroke-purple-400"
                        : isAuth
                          ? "fill-card stroke-emerald-400"
                          : isResolver
                            ? "fill-card stroke-blue-400"
                            : "fill-card stroke-border"
                  )}
                />

                {/* Node Icon */}
                <foreignObject x="-10" y="-10" width="20" height="20" className="pointer-events-none">
                  <div className="flex items-center justify-center h-full text-foreground">
                    {node.type === "client" && <Monitor className="h-4 w-4 text-slate-300" />}
                    {isResolver && <Database className="h-4 w-4 text-blue-400" />}
                    {isRoot && <Globe className="h-4 w-4 text-amber-400" />}
                    {isTld && <Layers className="h-4 w-4 text-purple-400" />}
                    {isAuth && <Server className="h-4 w-4 text-emerald-400" />}
                  </div>
                </foreignObject>

                {/* Node Name Label */}
                <text
                  textAnchor="middle"
                  y="33"
                  className="fill-foreground text-[10.5px] font-semibold tracking-tight"
                >
                  {node.name}
                </text>

                {/* Node IP / Zone Badge */}
                <text
                  textAnchor="middle"
                  y="43"
                  className="fill-muted-foreground text-[8.5px] font-mono"
                >
                  {node.zone ? `Zone: ${node.zone}` : node.ipAddress}
                </text>
              </g>
            );
          })}

          {/* Animated Protocol Message Capsule */}
          {activePacket && sourcePos && destPos && (
            <motion.g
              key={activePacket.id}
              initial={{ x: sourcePos.x, y: sourcePos.y }}
              animate={{ x: destPos.x, y: destPos.y }}
              transition={{ duration: reducedMotion ? 0 : 0.65, ease: "easeInOut" }}
            >
              <rect
                x="-45"
                y="-11"
                width="90"
                height="22"
                rx="11"
                className={cn(
                  "stroke-white stroke-1 shadow-lg",
                  activePacket.label.toLowerCase().includes("response") || activePacket.label.toLowerCase().includes("answer") || activePacket.label.toLowerCase().includes("hit") ? "fill-emerald-600" :
                    activePacket.label.toLowerCase().includes("error") ? "fill-rose-600" : "fill-blue-600"
                )}
              />
              <text
                textAnchor="middle"
                y="4"
                className="fill-white text-[9px] font-mono font-bold tracking-tight"
              >
                {activePacket.label}
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      {/* Bottom Packet Capsule Tracker */}
      <div className="p-2 border-t border-border/70 bg-slate-950/80 backdrop-blur flex items-center justify-between gap-2 text-xs">
        <span className="text-[11px] text-muted-foreground font-mono font-semibold shrink-0">
          DNS Query Stream:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {Array.from(new Map(packets.map((p) => [p.id, p])).values()).map((pkt, idx) => {
            const delivered = visibleEvents.some(
              (e) => e.packetId === pkt.id && (e.type === "packet-arrived" || e.type === "route-calculated")
            );
            const isSelected = selectedPacketId === pkt.id;

            return (
              <button
                key={`${pkt.id}-${idx}`}
                onClick={() => selectPacket(pkt.id)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border transition-all cursor-pointer",
                  delivered
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                    : "bg-secondary/60 border-border text-muted-foreground opacity-60",
                  isSelected && "ring-2 ring-primary border-primary font-bold opacity-100"
                )}
                title={`${pkt.label} (${pkt.source} → ${pkt.destination})`}
              >
                {pkt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

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
  Monitor,
  Network,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { OspfRouter, OspfLink, OspfArea } from "@/features/protocols/ospf/ospf.types";
import type { Packet, SimulationEvent } from "@/features/simulation/simulation-types";
import { OspfRouterNode } from "./ospf-router-node";
import { OspfAreaRegion } from "./ospf-area";
import { useSimulationStore } from "@/features/simulation/simulation-store";

interface OspfTopologyProps {
  routers: OspfRouter[];
  links: OspfLink[];
  areas?: OspfArea[];
  topologyPreset?: string;
  selectedRouterId: string | null;
  activeShortestPath: string[];
  activeEvent?: SimulationEvent | null;
  activePacket: Packet | null;
  labelMode: "simple" | "technical";
  onSelectRouter: (routerId: string) => void;
  onToggleLabelMode: () => void;
  onSelectFailureScenario: (scenario: string) => void;
  onSelectTopologyPreset?: (preset: "diamond" | "ring" | "multi-area" | "triangle") => void;
}

export function OspfTopology({
  routers,
  links,
  areas = [],
  topologyPreset = "diamond",
  selectedRouterId,
  activeShortestPath,
  activePacket,
  labelMode,
  onSelectRouter,
  onToggleLabelMode,
  onSelectFailureScenario,
  onSelectTopologyPreset,
}: OspfTopologyProps) {
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
  routers.forEach((r) => nodeMap.set(r.nodeId, r.position));

  if (topologyPreset === "diamond") {
    nodeMap.set("LAN-A", { x: 280, y: 50 });
    nodeMap.set("LAN-B", { x: 280, y: 510 });
  }

  const sourcePos = activePacket ? nodeMap.get(activePacket.source) : null;
  const destPos = activePacket ? nodeMap.get(activePacket.destination) : null;

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-950 grid-bg rounded-xl border border-border overflow-hidden select-none flex flex-col">
      {/* Top Header Bar inside Canvas */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Topology Preset Selector */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 p-1 rounded-lg border border-border backdrop-blur">
          <div className="flex items-center gap-1 px-2 py-0.5 text-xs text-muted-foreground font-mono">
            <Network className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-foreground">Topology:</span>
          </div>

          {[
            { id: "diamond", label: "Diamond 4R" },
            { id: "ring", label: "Ring 5R" },
            { id: "multi-area", label: "Multi-Area" },
            { id: "triangle", label: "Triangle 3R" },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() =>
                onSelectTopologyPreset?.(
                  preset.id as "diamond" | "ring" | "multi-area" | "triangle"
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

        {/* Right Tools (Path summary, Label Mode, Failure Injection) */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 p-1 rounded-lg border border-border backdrop-blur">
          <Badge variant="outline" className="font-mono text-[11px] text-emerald-400 border-emerald-500/40">
            Path: {activeShortestPath.length > 0 ? activeShortestPath.join(" → ") : "None"}
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
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-slate-900 border border-border rounded-lg shadow-xl p-1 z-50 text-xs flex flex-col gap-0.5">
                <button
                  onClick={() => { onSelectFailureScenario("none"); setShowFailMenu(false); }}
                  className="px-2.5 py-1.5 text-left rounded hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  ✓ Normal Condition (Optimal Cost)
                </button>
                <button
                  onClick={() => { onSelectFailureScenario("r2_r4_cost_high"); setShowFailMenu(false); }}
                  className="px-2.5 py-1.5 text-left rounded hover:bg-accent text-amber-400 cursor-pointer"
                >
                  ⚡ High Link Cost (R2-R4 = 50)
                </button>
                <button
                  onClick={() => { onSelectFailureScenario("r2_r4_break"); setShowFailMenu(false); }}
                  className="px-2.5 py-1.5 text-left rounded hover:bg-accent text-destructive cursor-pointer"
                >
                  ✕ Break Link R2-R4 (Failover)
                </button>
                <button
                  onClick={() => { onSelectFailureScenario("ring_break"); setShowFailMenu(false); }}
                  className="px-2.5 py-1.5 text-left rounded hover:bg-accent text-destructive cursor-pointer"
                >
                  ✕ Ring Link Break (R1-R2)
                </button>
                <button
                  onClick={() => { onSelectFailureScenario("area_mismatch"); setShowFailMenu(false); }}
                  className="px-2.5 py-1.5 text-left rounded hover:bg-accent text-amber-400 cursor-pointer"
                >
                  ⚠️ Area ID Mismatch Condition
                </button>
                <button
                  onClick={() => { onSelectFailureScenario("timer_mismatch"); setShowFailMenu(false); }}
                  className="px-2.5 py-1.5 text-left rounded hover:bg-accent text-amber-400 cursor-pointer"
                >
                  ⚠️ Timer Mismatch Condition
                </button>
                <button
                  onClick={() => { onSelectFailureScenario("duplicate_rid"); setShowFailMenu(false); }}
                  className="px-2.5 py-1.5 text-left rounded hover:bg-accent text-amber-400 cursor-pointer"
                >
                  ⚠️ Duplicate Router ID Conflict
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
          {/* Dynamic Area Regions */}
          {areas.map((area) => (
            <OspfAreaRegion
              key={area.id}
              areaId={area.id}
              name={area.name}
              x={area.x}
              y={area.y}
              width={area.width}
              height={area.height}
            />
          ))}

          {/* Links */}
          {links.map((link) => {
            const src = nodeMap.get(link.sourceRouterId);
            const dst = nodeMap.get(link.targetRouterId);
            if (!src || !dst) return null;

            const isDown = !link.enabled || link.status === "down";
            const isLinkInShortestPath =
              activeShortestPath.includes(link.sourceRouterId) &&
              activeShortestPath.includes(link.targetRouterId) &&
              Math.abs(
                activeShortestPath.indexOf(link.sourceRouterId) -
                activeShortestPath.indexOf(link.targetRouterId)
              ) === 1;

            const midX = (src.x + dst.x) / 2;
            const midY = (src.y + dst.y) / 2;

            return (
              <g key={link.id} className="transition-all duration-300">
                {/* Shortest Path Glow Underlay */}
                {isLinkInShortestPath && !isDown && (
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={dst.x}
                    y2={dst.y}
                    className="stroke-emerald-400/40 stroke-[8px] animate-pulse"
                  />
                )}

                {/* Base Link Line */}
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={dst.x}
                  y2={dst.y}
                  className={cn(
                    "transition-all duration-200 stroke-2",
                    isDown
                      ? "stroke-destructive/60 stroke-dasharray-[6,4]"
                      : isLinkInShortestPath
                        ? "stroke-emerald-400 stroke-[3px]"
                        : "stroke-slate-700 hover:stroke-slate-500"
                  )}
                />

                {/* Cost Badge */}
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x="-18"
                    y="-9"
                    width="36"
                    height="18"
                    rx="4"
                    fill="rgba(15, 23, 42, 0.85)"
                    stroke={isDown ? "rgba(239, 68, 68, 0.6)" : isLinkInShortestPath ? "rgba(16, 185, 129, 0.8)" : "rgba(100, 116, 139, 0.4)"}
                    strokeWidth="1"
                  />
                  <text
                    textAnchor="middle"
                    y="4"
                    className={cn(
                      "text-[10px] font-mono font-bold",
                      isDown ? "fill-destructive" : isLinkInShortestPath ? "fill-emerald-400" : "fill-muted-foreground"
                    )}
                  >
                    {isDown ? "✕" : `c=${link.cost}`}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Connected LAN Hosts for Diamond Topology */}
          {topologyPreset === "diamond" && (
            <>
              <line x1={280} y1={70} x2={280} y2={150} className="stroke-slate-700 stroke-2 stroke-dashed" />
              <g transform="translate(280, 50)">
                <circle r="18" className="fill-slate-900 stroke-blue-400/50 stroke-1" />
                <foreignObject x="-12" y="-12" width="24" height="24">
                  <div className="flex items-center justify-center h-full">
                    <Monitor className="h-4 w-4 text-blue-400" />
                  </div>
                </foreignObject>
                <text textAnchor="middle" y="28" className="fill-muted-foreground text-[9px] font-mono">
                  LAN-A (10.0.1.0/24)
                </text>
              </g>

              <line x1={280} y1={410} x2={280} y2={490} className="stroke-slate-700 stroke-2 stroke-dashed" />
              <g transform="translate(280, 510)">
                <circle r="18" className="fill-slate-900 stroke-emerald-400/50 stroke-1" />
                <foreignObject x="-12" y="-12" width="24" height="24">
                  <div className="flex items-center justify-center h-full">
                    <Monitor className="h-4 w-4 text-emerald-400" />
                  </div>
                </foreignObject>
                <text textAnchor="middle" y="28" className="fill-muted-foreground text-[9px] font-mono">
                  LAN-B (10.0.4.0/24)
                </text>
              </g>
            </>
          )}

          {/* OSPF Router Nodes */}
          {routers.map((router) => {
            const isSelected = selectedRouterId === router.nodeId;
            const isInShortestPath = activeShortestPath.includes(router.nodeId);

            return (
              <OspfRouterNode
                key={router.nodeId}
                router={router}
                isSelected={isSelected}
                isInShortestPath={isInShortestPath}
                onClick={() => onSelectRouter(router.nodeId)}
              />
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
                x="-36"
                y="-10"
                width="72"
                height="20"
                rx="10"
                className="fill-primary stroke-white stroke-1 shadow-lg"
              />
              <text
                textAnchor="middle"
                y="4"
                className="fill-primary-foreground text-[9px] font-mono font-bold tracking-tight"
              >
                {activePacket.label}
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      {/* Bottom Packet Capsule Tracker (Matching TCP/UDP Canvas) */}
      <div className="p-2 border-t border-border/70 bg-slate-950/80 backdrop-blur flex items-center justify-between gap-2 text-xs">
        <span className="text-[11px] text-muted-foreground font-mono font-semibold shrink-0">
          OSPF Message Stream:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {Array.from(new Map(packets.map((p) => [p.id, p])).values()).slice(0, 14).map((pkt, idx) => {
            const delivered = visibleEvents.some(
              (e) => e.packetId === pkt.id && (e.type === "packet-arrived" || e.type === "state-change" || e.type === "route-calculated")
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

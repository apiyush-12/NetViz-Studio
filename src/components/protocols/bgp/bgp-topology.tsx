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
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { BgpRouter, BgpLink, AutonomousSystem } from "@/features/protocols/bgp/bgp.types";
import type { Packet, SimulationEvent } from "@/features/simulation/simulation-types";
import { BgpRouterNode } from "./bgp-router-node";
import { AutonomousSystemRegion } from "./autonomous-system-region";
import { useSimulationStore } from "@/features/simulation/simulation-store";

interface BgpTopologyProps {
  routers: BgpRouter[];
  links: BgpLink[];
  autonomousSystems?: AutonomousSystem[];
  topologyPreset?: string;
  selectedRouterId: string | null;
  activeBestPath: string[];
  activeEvent?: SimulationEvent | null;
  activePacket: Packet | null;
  labelMode: "simple" | "technical";
  onSelectRouter: (routerId: string) => void;
  onToggleLabelMode: () => void;
  onSelectFailureScenario: (scenario: string) => void;
  onSelectTopologyPreset?: (preset: "multi-homed" | "tier1-hub" | "triangle" | "ibgp-ebgp") => void;
}

export function BgpTopology({
  routers,
  links,
  autonomousSystems = [],
  topologyPreset = "multi-homed",
  selectedRouterId,
  activeBestPath,
  activePacket,
  labelMode,
  onSelectRouter,
  onToggleLabelMode,
  onSelectFailureScenario,
  onSelectTopologyPreset,
}: BgpTopologyProps) {
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

  const sourcePos = activePacket ? nodeMap.get(activePacket.source) : null;
  const destPos = activePacket ? nodeMap.get(activePacket.destination) : null;

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-950 grid-bg rounded-xl border border-border overflow-hidden select-none flex flex-col">
      {/* Top Header inside Canvas */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Topology Preset Selector */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 p-1 rounded-lg border border-border backdrop-blur">
          <div className="flex items-center gap-1 px-2 py-0.5 text-xs text-muted-foreground font-mono">
            <Network className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-foreground">Topology:</span>
          </div>

          {[
            { id: "multi-homed", label: "Dual-Homed 4AS" },
            { id: "tier1-hub", label: "Tier-1 Hub 5AS" },
            { id: "triangle", label: "Triangle 3AS" },
            { id: "ibgp-ebgp", label: "iBGP+eBGP" },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() =>
                onSelectTopologyPreset?.(
                  preset.id as "multi-homed" | "tier1-hub" | "triangle" | "ibgp-ebgp"
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

        {/* Right Tools (Best-path summary, Label Mode, Failure Injection) */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 p-1 rounded-lg border border-border backdrop-blur">
          <Badge variant="outline" className="font-mono text-[11px] text-emerald-400 border-emerald-500/40">
            Selected Path: {activeBestPath.length > 0 ? activeBestPath.join(" → ") : "None (Withdrawn)"}
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
                  ✓ Normal Condition (LOCAL_PREF 200 vs 100)
                </button>
                <button
                  onClick={() => { onSelectFailureScenario("as_path_prepend_as65002"); setShowFailMenu(false); }}
                  className="px-2.5 py-1.5 text-left rounded hover:bg-accent text-amber-400 cursor-pointer"
                >
                  ⚡ AS-Path Prepend on AS 65002 (3x)
                </button>
                <button
                  onClick={() => { onSelectFailureScenario("break_as65001_as65002"); setShowFailMenu(false); }}
                  className="px-2.5 py-1.5 text-left rounded hover:bg-accent text-destructive cursor-pointer"
                >
                  ✕ Break Peering AS 65001 ↔ AS 65002
                </button>
                <button
                  onClick={() => { onSelectFailureScenario("tier1_failover"); setShowFailMenu(false); }}
                  className="px-2.5 py-1.5 text-left rounded hover:bg-accent text-destructive cursor-pointer"
                >
                  ✕ Transit Link Failover (Primary Down)
                </button>
                <button
                  onClick={() => { onSelectFailureScenario("withdraw_prefix"); setShowFailMenu(false); }}
                  className="px-2.5 py-1.5 text-left rounded hover:bg-accent text-amber-400 cursor-pointer"
                >
                  ⚠️ Withdraw Prefix 203.0.113.0/24
                </button>
                <button
                  onClick={() => { onSelectFailureScenario("invalid_remote_asn"); setShowFailMenu(false); }}
                  className="px-2.5 py-1.5 text-left rounded hover:bg-accent text-amber-400 cursor-pointer"
                >
                  ⚠️ Remote ASN Mismatch Error
                </button>
                <button
                  onClick={() => { onSelectFailureScenario("med_influence"); setShowFailMenu(false); }}
                  className="px-2.5 py-1.5 text-left rounded hover:bg-accent text-amber-400 cursor-pointer"
                >
                  ⚡ MED Metric Influence (50 vs 200)
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
          {/* Dynamic Autonomous System Regions */}
          {autonomousSystems.map((asInfo) => (
            <AutonomousSystemRegion
              key={asInfo.asn}
              asInfo={asInfo}
              x={asInfo.x ?? 30}
              y={asInfo.y ?? 200}
              width={asInfo.width ?? 140}
              height={asInfo.height ?? 160}
            />
          ))}

          {/* eBGP / iBGP Peering Links */}
          {links.map((link) => {
            const src = nodeMap.get(link.sourceRouterId);
            const dst = nodeMap.get(link.targetRouterId);
            if (!src || !dst) return null;

            const isDown = !link.enabled || link.status === "down";
            const isLinkInBestPath =
              activeBestPath.includes(link.sourceRouterId) &&
              activeBestPath.includes(link.targetRouterId) &&
              Math.abs(
                activeBestPath.indexOf(link.sourceRouterId) -
                  activeBestPath.indexOf(link.targetRouterId)
              ) === 1;

            const midX = (src.x + dst.x) / 2;
            const midY = (src.y + dst.y) / 2;

            return (
              <g key={link.id} className="transition-all duration-300">
                {/* Best Path Glow Underlay */}
                {isLinkInBestPath && !isDown && (
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
                      : isLinkInBestPath
                        ? "stroke-emerald-400 stroke-[3px]"
                        : "stroke-slate-700 hover:stroke-slate-500"
                  )}
                />

                {/* Peering Label Badge */}
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x="-32"
                    y="-10"
                    width="64"
                    height="20"
                    rx="4"
                    fill="rgba(15, 23, 42, 0.9)"
                    stroke={isDown ? "rgba(239, 68, 68, 0.6)" : isLinkInBestPath ? "rgba(16, 185, 129, 0.8)" : "rgba(100, 116, 139, 0.4)"}
                    strokeWidth="1"
                  />
                  <text
                    textAnchor="middle"
                    y="4"
                    className={cn(
                      "text-[9px] font-mono font-bold",
                      isDown ? "fill-destructive" : isLinkInBestPath ? "fill-emerald-400" : "fill-muted-foreground"
                    )}
                  >
                    {isDown ? "DOWN" : isLinkInBestPath ? "BEST PATH" : "CANDIDATE"}
                  </text>
                </g>
              </g>
            );
          })}

          {/* BGP Router Nodes */}
          {routers.map((router) => {
            const isSelected = selectedRouterId === router.nodeId;
            const isInBestPath = activeBestPath.includes(router.nodeId);

            return (
              <BgpRouterNode
                key={router.nodeId}
                router={router}
                isSelected={isSelected}
                isInBestPath={isInBestPath}
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
                x="-40"
                y="-11"
                width="80"
                height="22"
                rx="11"
                className="fill-emerald-600 stroke-white stroke-1 shadow-lg"
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

      {/* Bottom Packet Capsule Tracker (Matching TCP/UDP Canvas) */}
      <div className="p-2 border-t border-border/70 bg-slate-950/80 backdrop-blur flex items-center justify-between gap-2 text-xs">
        <span className="text-[11px] text-muted-foreground font-mono font-semibold shrink-0">
          BGP Message Stream:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {packets.slice(0, 14).map((pkt) => {
            const delivered = visibleEvents.some(
              (e) => e.packetId === pkt.id && (e.type === "packet-arrived" || e.type === "state-change" || e.type === "route-updated")
            );
            const isSelected = selectedPacketId === pkt.id;

            return (
              <button
                key={pkt.id}
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

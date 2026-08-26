"use client";

import React, { useState } from "react";
import {
  Monitor,
  Router as RouterIcon,
  Server,
  Globe,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Sparkles,
  Shield,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import type {
  NatNode,
  NatLink,
  NatSimulationPacket,
  NatScenarioId,
} from "@/features/protocols/nat/nat.types";
import { natScenarios } from "@/features/protocols/nat/nat.defaults";

interface NatTopologyProps {
  nodes: NatNode[];
  links: NatLink[];
  selectedNodeId: string | null;
  activePacket?: NatSimulationPacket;
  mode: string;
  onSelectNode: (nodeId: string) => void;
  onSelectScenario: (scenarioId: NatScenarioId) => void;
}

export function NatTopology({
  nodes,
  links,
  selectedNodeId,
  activePacket,
  mode,
  onSelectNode,
  onSelectScenario,
}: NatTopologyProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.15, 2.0));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.6));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "inside-host":
        return <Monitor className="h-4.5 w-4.5 text-blue-400" />;
      case "nat-router":
        return <RouterIcon className="h-4.5 w-4.5 text-emerald-400" />;
      case "isp-router":
        return <Globe className="h-4.5 w-4.5 text-purple-400" />;
      case "outside-server":
        return <Server className="h-4.5 w-4.5 text-cyan-400" />;
      default:
        return <Server className="h-4.5 w-4.5 text-foreground" />;
    }
  };

  return (
    <div className="relative w-full h-full border border-border rounded-xl bg-card overflow-hidden flex flex-col select-none shadow-sm">
      {/* Top Topology Ribbon */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Badge variant="outline" className="text-xs font-mono bg-card/90 backdrop-blur shadow-sm gap-1.5 py-1">
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold uppercase">Mode: {mode}</span>
          </Badge>
        </div>

        {/* Scenarios Preset Dropdown */}
        <div className="relative pointer-events-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowScenarioMenu(!showScenarioMenu)}
            className="h-8 text-xs gap-1.5 bg-card/90 backdrop-blur shadow-sm border-border cursor-pointer hover:bg-accent"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>NAT Preset Scenarios</span>
          </Button>

          {showScenarioMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-72 bg-card border border-border rounded-xl shadow-2xl p-1.5 z-50 text-xs flex flex-col gap-1">
              <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Select NAT Simulation Scenario
              </div>
              {natScenarios.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    onSelectScenario(sc.id);
                    setShowScenarioMenu(false);
                  }}
                  className="px-2.5 py-2 text-left rounded-lg hover:bg-accent transition-colors flex flex-col gap-0.5 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground group-hover:text-primary">{sc.name}</span>
                    <Badge variant="outline" className="text-[9px] font-mono">{sc.badge}</Badge>
                  </div>
                  <span className="text-[10.5px] text-muted-foreground leading-tight">{sc.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Canvas Navigation Toolbar */}
      <div className="absolute left-3 top-16 z-20 flex flex-col gap-1 bg-card/90 p-1 rounded-lg border border-border backdrop-blur shadow-sm">
        <Button size="icon" variant="ghost" onClick={handleZoomIn} className="h-7 w-7 cursor-pointer" title="Zoom In">
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="ghost" onClick={handleZoomOut} className="h-7 w-7 cursor-pointer" title="Zoom Out">
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="ghost" onClick={handleResetView} className="h-7 w-7 cursor-pointer" title="Fit View">
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="ghost" onClick={handleResetView} className="h-7 w-7 cursor-pointer" title="Reset">
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Main SVG Canvas */}
      <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing">
        <svg
          viewBox="0 50 560 440"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: "center center",
            transition: "transform 0.15s ease-out",
          }}
        >
          <defs>
            <filter id="nat-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Zone Boundary Demarcation Line */}
          <line x1="280" y1="50" x2="280" y2="490" className="stroke-border stroke-1 stroke-dasharray-4" strokeDasharray="4,4" />
          <text x="180" y="70" textAnchor="middle" className="fill-muted-foreground/60 text-[10px] font-mono font-semibold">
            PRIVATE LAN (RFC 1918)
          </text>
          <text x="380" y="70" textAnchor="middle" className="fill-emerald-400/60 text-[10px] font-mono font-semibold">
            PUBLIC WAN (INTERNET)
          </text>

          {/* Links */}
          {links.map((link) => {
            const src = nodeMap.get(link.sourceNodeId);
            const dst = nodeMap.get(link.targetNodeId);
            if (!src || !dst) return null;

            return (
              <g key={link.id}>
                <line
                  x1={src.position.x}
                  y1={src.position.y}
                  x2={dst.position.x}
                  y2={dst.position.y}
                  className={cn(
                    "transition-all duration-300 stroke-2",
                    link.zone === "outside" ? "stroke-emerald-500/40" : "stroke-blue-500/40"
                  )}
                />
              </g>
            );
          })}

          {/* Active Packet Animation */}
          {activePacket && (
            (() => {
              const src = nodeMap.get(activePacket.sourceId);
              const dst = nodeMap.get(activePacket.targetId);
              if (!src || !dst) return null;

              const midX = (src.position.x + dst.position.x) / 2;
              const midY = (src.position.y + dst.position.y) / 2;

              return (
                <g transform={`translate(${midX}, ${midY})`} className="animate-pulse">
                  <circle
                    r="16"
                    className={cn(
                      "fill-card stroke-2",
                      activePacket.isTranslated ? "stroke-emerald-400 fill-emerald-500/10" : "stroke-blue-400 fill-blue-500/10"
                    )}
                    filter="url(#nat-glow)"
                  />
                  <foreignObject x="-8" y="-8" width="16" height="16" className="pointer-events-none">
                    <div className="flex items-center justify-center h-full">
                      {activePacket.direction === "outbound" ? (
                        <ArrowRight className={cn("h-3.5 w-3.5", activePacket.isTranslated ? "text-emerald-400" : "text-blue-400")} />
                      ) : (
                        <ArrowLeft className={cn("h-3.5 w-3.5", activePacket.isTranslated ? "text-emerald-400" : "text-blue-400")} />
                      )}
                    </div>
                  </foreignObject>
                  <text
                    y="-20"
                    textAnchor="middle"
                    className="fill-primary text-[9.5px] font-mono font-bold"
                  >
                    {activePacket.label}
                  </text>
                </g>
              );
            })()
          )}

          {/* Topology Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${node.position.x}, ${node.position.y})`}
                onClick={() => onSelectNode(node.id)}
                className="cursor-pointer group select-none"
              >
                {/* Selected Ring */}
                {isSelected && (
                  <circle
                    r="30"
                    className="fill-primary/20 stroke-primary/60 stroke-2 animate-pulse"
                  />
                )}

                {/* Node Circle */}
                <circle
                  r="24"
                  className={cn(
                    "transition-all duration-200 stroke-2 fill-card",
                    isSelected
                      ? "stroke-primary shadow-lg"
                      : node.zone === "outside"
                        ? "stroke-emerald-500/70 group-hover:stroke-emerald-400"
                        : "stroke-blue-500/70 group-hover:stroke-blue-400"
                  )}
                />

                {/* Node Icon */}
                <foreignObject x="-12" y="-12" width="24" height="24" className="pointer-events-none">
                  <div className="flex items-center justify-center h-full">
                    {getNodeIcon(node.type)}
                  </div>
                </foreignObject>

                {/* Node Name */}
                <text
                  y="36"
                  textAnchor="middle"
                  className="fill-foreground text-[11px] font-semibold tracking-tight"
                >
                  {node.name}
                </text>

                {/* IP Subtitle */}
                <text
                  y="48"
                  textAnchor="middle"
                  className="fill-muted-foreground text-[9px] font-mono"
                >
                  {node.ipAddress}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

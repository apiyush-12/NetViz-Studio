"use client";

import React, { useState, useRef } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Server,
  Network,
  Layers,
} from "lucide-react";
import { Badge, Button } from "@/components/ui";
import type {
  MplsNode,
  MplsLink,
  MplsSimulationStepState,
} from "@/features/protocols/mpls/mpls.types";

interface MplsTopologyProps {
  nodes: MplsNode[];
  links: MplsLink[];
  stepState?: MplsSimulationStepState;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
}

export function MplsTopology({
  nodes,
  links,
  stepState,
  selectedNodeId,
  onSelectNode,
}: MplsTopologyProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const activePacket = stepState?.activePacket;
  const activeLinkIds = stepState?.activeLinkIds || [];
  const activeNodeId = stepState?.activeNodeId;
  const highlightedLspNodeIds = stepState?.highlightedLspNodeIds || [];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleZoomIn = () => setZoom((z) => Math.min(1.6, z + 0.15));
  const handleZoomOut = () => setZoom((z) => Math.max(0.65, z - 0.15));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Node color mapping
  const getNodeVisuals = (node: MplsNode) => {
    const isSelected = node.id === selectedNodeId;
    const isHighlighted = highlightedLspNodeIds.includes(node.id);

    switch (node.role) {
      case "ingress-ler":
        return {
          fill: "#1e3a8a",
          stroke: isSelected ? "#60a5fa" : "#3b82f6",
          badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/30",
          glow: isHighlighted ? "drop-shadow(0 0 14px rgba(59, 130, 246, 0.7))" : "",
        };
      case "core-lsr":
        return {
          fill: "#312e81",
          stroke: isSelected ? "#a5b4fc" : "#6366f1",
          badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
          glow: isHighlighted ? "drop-shadow(0 0 14px rgba(99, 102, 241, 0.7))" : "",
        };
      case "penultimate-lsr":
        return {
          fill: "#4c1d95",
          stroke: isSelected ? "#d8b4fe" : "#a855f7",
          badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/30",
          glow: isHighlighted ? "drop-shadow(0 0 14px rgba(168, 85, 247, 0.7))" : "",
        };
      case "egress-ler":
        return {
          fill: "#064e3b",
          stroke: isSelected ? "#6ee7b7" : "#10b981",
          badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
          glow: isHighlighted ? "drop-shadow(0 0 14px rgba(16, 185, 129, 0.7))" : "",
        };
      case "backup-lsr":
        return {
          fill: "#78350f",
          stroke: isSelected ? "#fcd34d" : "#f59e0b",
          badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          glow: isHighlighted ? "drop-shadow(0 0 14px rgba(245, 158, 11, 0.7))" : "",
        };
      case "ce":
      default:
        return {
          fill: "#1f2937",
          stroke: isSelected ? "#9ca3af" : "#4b5563",
          badgeBg: "bg-zinc-800 text-zinc-300 border-zinc-700",
          glow: isHighlighted ? "drop-shadow(0 0 10px rgba(156, 163, 175, 0.5))" : "",
        };
    }
  };

  return (
    <div className="relative w-full h-[460px] rounded-xl border border-border bg-slate-950 overflow-hidden select-none flex flex-col shadow-inner">
      {/* Top Overlay Legend & Header */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 shadow-md">
          <Layers className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-semibold text-slate-200">
            MPLS Provider Core & LSP Topology
          </span>
          <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20">
            RFC 3031 / RFC 3032
          </Badge>
        </div>

        {/* Legend Pills */}
        <div className="hidden sm:flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 shadow-md text-[10px] font-mono">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-300">Ingress LER (Push)</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-slate-300">Core LSR (Swap)</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-slate-300">PHP Penultimate (Pop)</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Egress LER (Pop)</span>
          </div>
        </div>
      </div>

      {/* Floating Canvas Controls */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-800 shadow-md">
        <Button
          size="icon"
          variant="ghost"
          onClick={handleZoomIn}
          className="h-7 w-7 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleZoomOut}
          className="h-7 w-7 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleResetView}
          className="h-7 w-7 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
          title="Reset View"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* SVG Canvas */}
      <svg
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        viewBox="0 0 1100 480"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Background Grid Pattern */}
          <pattern id="mplsGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
          </pattern>

          {/* Gradients */}
          <linearGradient id="coreZoneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.08)" />
            <stop offset="100%" stopColor="rgba(99, 102, 241, 0.04)" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="packetGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Pan / Zoom Group */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Background grid */}
          <rect x="-500" y="-300" width="2200" height="1200" fill="url(#mplsGrid)" />

          {/* Provider Core Domain Visual Box */}
          <rect
            x="210"
            y="50"
            width="670"
            height="360"
            rx="20"
            fill="url(#coreZoneGradient)"
            stroke="rgba(59, 130, 246, 0.2)"
            strokeDasharray="6 4"
            strokeWidth="1.5"
          />
          <text
            x="545"
            y="75"
            textAnchor="middle"
            fill="rgba(147, 197, 253, 0.6)"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
            letterSpacing="1.5"
          >
            PROVIDER CORE DOMAIN (AS 65000) • BGP-FREE CORE • LABEL SWITCHED PATH (LSP)
          </text>

          {/* Links */}
          {links.map((link) => {
            const srcNode = nodes.find((n) => n.id === link.sourceNodeId);
            const tgtNode = nodes.find((n) => n.id === link.targetNodeId);
            if (!srcNode || !tgtNode) return null;

            const isActive = activeLinkIds.includes(link.id);
            const isDown = link.status === "down";
            const isBypass = link.isBypassLsp;

            let strokeColor = "#334155";
            let strokeWidth = 2;
            let strokeDash = "none";

            if (isDown) {
              strokeColor = "#ef4444";
              strokeDash = "6 6";
              strokeWidth = 2.5;
            } else if (isActive) {
              strokeColor = isBypass ? "#f59e0b" : "#60a5fa";
              strokeWidth = 4;
            } else if (link.isLsp) {
              strokeColor = isBypass ? "rgba(245, 158, 11, 0.4)" : "rgba(99, 102, 241, 0.5)";
              strokeWidth = 2.5;
              if (isBypass) strokeDash = "4 4";
            }

            const midX = (srcNode.position.x + tgtNode.position.x) / 2;
            const midY = (srcNode.position.y + tgtNode.position.y) / 2;

            return (
              <g key={link.id}>
                {/* Underlay glow for active link */}
                {isActive && !isDown && (
                  <line
                    x1={srcNode.position.x}
                    y1={srcNode.position.y}
                    x2={tgtNode.position.x}
                    y2={tgtNode.position.y}
                    stroke={isBypass ? "#f59e0b" : "#3b82f6"}
                    strokeWidth={8}
                    strokeOpacity={0.3}
                    strokeLinecap="round"
                  />
                )}

                {/* Primary Link Line */}
                <line
                  x1={srcNode.position.x}
                  y1={srcNode.position.y}
                  x2={tgtNode.position.x}
                  y2={tgtNode.position.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDash}
                  strokeLinecap="round"
                />

                {/* Down link cross icon */}
                {isDown && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <circle r="12" fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeWidth="1.5" />
                    <line x1="-5" y1="-5" x2="5" y2="5" stroke="#ef4444" strokeWidth="2" />
                    <line x1="5" y1="-5" x2="-5" y2="5" stroke="#ef4444" strokeWidth="2" />
                    <text y="20" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold" fontFamily="monospace">
                      FIBER CUT
                    </text>
                  </g>
                )}

                {/* Active Link Label Badge */}
                {link.isLsp && !isDown && link.activeLabel && (
                  <g transform={`translate(${midX}, ${midY - 14})`}>
                    <rect
                      x="-32"
                      y="-10"
                      width="64"
                      height="18"
                      rx="4"
                      fill="#0f172a"
                      stroke={isActive ? "#60a5fa" : "rgba(99, 102, 241, 0.4)"}
                      strokeWidth="1"
                    />
                    <text
                      y="3"
                      textAnchor="middle"
                      fill={isActive ? "#93c5fd" : "#818cf8"}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {link.activeLabel === 3 ? "PHP Null (3)" : `LSP: ${link.activeLabel}`}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Animated In-Flight Multi-Label Packet */}
          {activePacket && activeLinkIds.length > 0 && (
            (() => {
              const activeLink = links.find((l) => l.id === activeLinkIds[0]);
              if (!activeLink) return null;
              const src = nodes.find((n) => n.id === activeLink.sourceNodeId);
              const tgt = nodes.find((n) => n.id === activeLink.targetNodeId);
              if (!src || !tgt) return null;

              const midX = (src.position.x + tgt.position.x) / 2;
              const midY = (src.position.y + tgt.position.y) / 2;
              const stack = activePacket.labelStack;

              return (
                <g transform={`translate(${midX}, ${midY})`} filter="url(#packetGlow)">
                  {/* Outer Packet Glow Ring */}
                  <circle r="18" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="1.5" />
                  <circle r="8" fill={stack.length > 0 ? "#60a5fa" : "#10b981"} />

                  {/* Floating Multi-Label Stack Card */}
                  <g transform="translate(0, -32)">
                    <rect
                      x="-65"
                      y="-14"
                      width="130"
                      height={stack.length > 1 ? "32" : "22"}
                      rx="6"
                      fill="#020617"
                      stroke={stack.length > 0 ? "#3b82f6" : "#10b981"}
                      strokeWidth="1.5"
                    />
                    {stack.length === 0 ? (
                      <text
                        y="1"
                        textAnchor="middle"
                        fill="#34d399"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        [Native IPv4 Datagram]
                      </text>
                    ) : stack.length === 1 ? (
                      <text
                        y="1"
                        textAnchor="middle"
                        fill="#93c5fd"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        [Shim: {stack[0].label} | S=1]
                      </text>
                    ) : (
                      <>
                        <text
                          y="-2"
                          textAnchor="middle"
                          fill="#93c5fd"
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          Top: {stack[0].label} (S=0)
                        </text>
                        <text
                          y="10"
                          textAnchor="middle"
                          fill="#c084fc"
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          Inner: {stack[1].label} (S=1)
                        </text>
                      </>
                    )}
                  </g>

                  {/* Operation Floating Badge */}
                  {activePacket.currentOperation && (
                    <g transform="translate(0, 28)">
                      <rect
                        x="-45"
                        y="-8"
                        width="90"
                        height="16"
                        rx="4"
                        fill={
                          activePacket.currentOperation === "PUSH"
                            ? "#1e3a8a"
                            : activePacket.currentOperation === "SWAP"
                            ? "#312e81"
                            : activePacket.currentOperation === "PHP"
                            ? "#581c87"
                            : activePacket.currentOperation === "POP"
                            ? "#064e3b"
                            : "#1e293b"
                        }
                        stroke="rgba(255, 255, 255, 0.3)"
                        strokeWidth="1"
                      />
                      <text
                        y="4"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="8.5"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {activePacket.currentOperation}
                      </text>
                    </g>
                  )}
                </g>
              );
            })()
          )}

          {/* Router Nodes */}
          {nodes.map((node) => {
            const isSelected = node.id === selectedNodeId;
            const isStepActive = node.id === activeNodeId;
            const visuals = getNodeVisuals(node);

            return (
              <g
                key={node.id}
                transform={`translate(${node.position.x}, ${node.position.y})`}
                onClick={() => onSelectNode(node.id)}
                className="cursor-pointer transition-transform hover:scale-110"
                style={{ filter: visuals.glow }}
              >
                {/* Selection / Active Node Outer Pulse Ring */}
                {(isSelected || isStepActive) && (
                  <circle
                    r="32"
                    fill="none"
                    stroke={visuals.stroke}
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    className="animate-spin"
                    style={{ animationDuration: "10s" }}
                  />
                )}

                {/* Main Node Body Circle */}
                <circle
                  r="24"
                  fill={visuals.fill}
                  stroke={visuals.stroke}
                  strokeWidth={isSelected ? 3 : 2}
                />

                {/* Node Icon */}
                <g transform="translate(-8, -8)" className="pointer-events-none text-slate-100">
                  {node.role === "ce" ? (
                    <Server className="h-4 w-4 stroke-slate-200" />
                  ) : (
                    <Network className="h-4 w-4 stroke-slate-200" />
                  )}
                </g>

                {/* Node Label (Below) */}
                <g transform="translate(0, 36)" className="pointer-events-none">
                  <rect
                    x="-55"
                    y="-10"
                    width="110"
                    height="20"
                    rx="4"
                    fill="#0f172a"
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="1"
                  />
                  <text
                    y="4"
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {node.label.split(" ")[0]}
                  </text>
                </g>

                {/* IP / Role Tag (Sub-label) */}
                <g transform="translate(0, 56)" className="pointer-events-none">
                  <text
                    y="0"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {node.loopbackIp || node.ipAddress}
                  </text>
                </g>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

"use client";

import React, { useState, useRef } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Network,
  Activity,
  Flame,
  Radio,
} from "lucide-react";
import { Badge, Button } from "@/components/ui";
import type {
  RipNode,
  RipLink,
  RipSimulationStepState,
  RipPacketData,
} from "@/features/protocols/rip/rip.types";

interface RipTopologyProps {
  nodes: RipNode[];
  links: RipLink[];
  stepState?: RipSimulationStepState;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
}

export function RipTopology({
  nodes,
  links,
  stepState,
  selectedNodeId,
  onSelectNode,
}: RipTopologyProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const activePacket = stepState?.activePacket;
  const activeLinkIds = stepState?.activeLinkIds || [];
  const activeNodeId = stepState?.activeNodeId;

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

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(2, z + 0.15));
  const handleZoomOut = () => setZoom((z) => Math.max(0.6, z - 0.15));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const getPacketBadgeColor = (packet: RipPacketData) => {
    const isPoison = packet.entries.some((e) => e.metric >= 16);
    if (isPoison) {
      return {
        bg: "#450a0a",
        border: "#ef4444",
        text: "#fca5a5",
        label: `POISON (Metric 16)`,
      };
    }
    if (stepState?.phase === "loop_count") {
      return {
        bg: "#581c87",
        border: "#a855f7",
        text: "#e9d5ff",
        label: `Looping Count (${packet.entries[0]?.metric || 3} Hops)`,
      };
    }
    return {
      bg: "#1e3a8a",
      border: "#3b82f6",
      text: "#93c5fd",
      label: `RIPv${packet.version} Response (${packet.entries.length} RTEs)`,
    };
  };

  return (
    <div className="relative w-full h-[460px] rounded-xl border border-border bg-slate-950 overflow-hidden select-none flex flex-col shadow-inner">
      {/* Top Overlay Header & Legend */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 shadow-md">
          <Activity className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-semibold text-slate-200">
            RIP Distance-Vector Topology
          </span>
          <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20">
            Bellman-Ford &bull; UDP 520
          </Badge>
        </div>

        {/* Legend Badges */}
        <div className="hidden sm:flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 shadow-md text-[10px] font-mono">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-300">Periodic Update</span>
          </div>
          <span className="text-slate-600">&bull;</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-slate-300">Poison Reverse (16)</span>
          </div>
          <span className="text-slate-600">&bull;</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-slate-300">Severed Link</span>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-800 shadow-md">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleZoomIn}
            className="h-7 w-7 text-slate-400 hover:text-white cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleZoomOut}
            className="h-7 w-7 text-slate-400 hover:text-white cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleResetZoom}
            className="h-7 w-7 text-slate-400 hover:text-white cursor-pointer"
            title="Reset View"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#334155" opacity="0.3" />
          </pattern>
          <filter id="ripGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Links */}
          {links.map((link) => {
            const srcNode = nodes.find((n) => n.id === link.sourceNodeId);
            const tgtNode = nodes.find((n) => n.id === link.targetNodeId);
            if (!srcNode || !tgtNode) return null;

            const isLinkActive = activeLinkIds.includes(link.id);
            const isDown = link.status === "down";

            const strokeColor = isDown
              ? "#ef4444"
              : isLinkActive
              ? "#3b82f6"
              : "rgba(148, 163, 184, 0.35)";

            const strokeWidth = isLinkActive ? 3.5 : 2;
            const strokeDash = isDown ? "6 6" : undefined;

            const midX = (srcNode.position.x + tgtNode.position.x) / 2;
            const midY = (srcNode.position.y + tgtNode.position.y) / 2;

            return (
              <g key={link.id}>
                {/* Active Link Glow */}
                {isLinkActive && !isDown && (
                  <line
                    x1={srcNode.position.x}
                    y1={srcNode.position.y}
                    x2={tgtNode.position.x}
                    y2={tgtNode.position.y}
                    stroke="#3b82f6"
                    strokeWidth="8"
                    opacity="0.3"
                    strokeLinecap="round"
                  />
                )}

                {/* Main Link Line */}
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

                {/* Severed Link Indicator */}
                {isDown ? (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <circle r="14" fill="#450a0a" stroke="#ef4444" strokeWidth="2" />
                    <Flame className="h-4 w-4 text-red-400 -translate-x-2 -translate-y-2" />
                    <text
                      y="26"
                      textAnchor="middle"
                      fill="#ef4444"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      LINK DOWN
                    </text>
                  </g>
                ) : (
                  /* Subnet & Metric Badge */
                  <g transform={`translate(${midX}, ${midY - 14})`}>
                    <rect
                      x="-36"
                      y="-10"
                      width="72"
                      height="18"
                      rx="4"
                      fill="#0f172a"
                      stroke="rgba(255, 255, 255, 0.15)"
                      strokeWidth="1"
                    />
                    <text
                      y="3"
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {link.subnet}
                    </text>
                  </g>
                )}

                {/* Interface Port Labels at Link Ends */}
                <g transform={`translate(${(srcNode.position.x * 2 + tgtNode.position.x) / 3}, ${(srcNode.position.y * 2 + tgtNode.position.y) / 3 + 12})`}>
                  <text textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">
                    {link.sourceInterface}
                  </text>
                </g>
                <g transform={`translate(${(srcNode.position.x + tgtNode.position.x * 2) / 3}, ${(srcNode.position.y + tgtNode.position.y * 2) / 3 + 12})`}>
                  <text textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">
                    {link.targetInterface}
                  </text>
                </g>
              </g>
            );
          })}

          {/* In-Flight RIP Packet Animation */}
          {activePacket && activeLinkIds.length > 0 && (
            (() => {
              const activeLink = links.find((l) => l.id === activeLinkIds[0]);
              if (!activeLink) return null;
              const src = nodes.find((n) => n.id === activeLink.sourceNodeId);
              const tgt = nodes.find((n) => n.id === activeLink.targetNodeId);
              if (!src || !tgt) return null;

              const midX = (src.position.x + tgt.position.x) / 2;
              const midY = (src.position.y + tgt.position.y) / 2;
              const badge = getPacketBadgeColor(activePacket);

              return (
                <g transform={`translate(${midX}, ${midY})`} filter="url(#ripGlow)">
                  <circle r="18" fill="rgba(59, 130, 246, 0.25)" stroke={badge.border} strokeWidth="1.5" />
                  <circle r="8" fill={badge.border} />

                  {/* Floating Packet Type Badge */}
                  <g transform="translate(0, -32)">
                    <rect
                      x="-85"
                      y="-12"
                      width="170"
                      height="24"
                      rx="6"
                      fill={badge.bg}
                      stroke={badge.border}
                      strokeWidth="1.5"
                    />
                    <text
                      y="4"
                      textAnchor="middle"
                      fill={badge.text}
                      fontSize="9.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {badge.label}
                    </text>
                  </g>
                </g>
              );
            })()
          )}

          {/* Router Nodes */}
          {nodes.map((node) => {
            const isSelected = node.id === selectedNodeId;
            const isStepActive = node.id === activeNodeId;

            return (
              <g
                key={node.id}
                transform={`translate(${node.position.x}, ${node.position.y})`}
                onClick={() => onSelectNode(node.id)}
                className="cursor-pointer transition-transform hover:scale-110"
              >
                {/* Active Node Pulse Ring */}
                {(isSelected || isStepActive) && (
                  <circle
                    r="34"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    className="animate-spin"
                    style={{ animationDuration: "10s" }}
                  />
                )}

                {/* Multicast Wave Animation */}
                {isStepActive && (
                  <circle
                    r="45"
                    fill="none"
                    stroke="rgba(59, 130, 246, 0.4)"
                    strokeWidth="1.5"
                    className="animate-ping"
                    style={{ animationDuration: "2s" }}
                  />
                )}

                {/* Router Node Circle */}
                <circle
                  r="26"
                  fill="#0f172a"
                  stroke={isSelected ? "#60a5fa" : isStepActive ? "#3b82f6" : "rgba(255, 255, 255, 0.2)"}
                  strokeWidth={isSelected ? 3 : 2}
                  filter={isSelected ? "url(#ripGlow)" : undefined}
                />

                {/* Router Icon */}
                <g transform="translate(-9, -9)" className="pointer-events-none text-blue-300">
                  <Network className="h-4.5 w-4.5 stroke-blue-300" />
                </g>

                {/* Node Name Label */}
                <g transform="translate(0, 40)" className="pointer-events-none">
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
                    {node.name}
                  </text>
                </g>

                {/* Router IP Badge */}
                <g transform="translate(0, 60)" className="pointer-events-none">
                  <text
                    y="0"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {node.ipAddress}
                  </text>
                </g>

                {/* Split Horizon status badge (Small icon above node) */}
                <g transform="translate(18, -18)">
                  <circle r="6" fill={node.splitHorizonEnabled ? "#065f46" : "#7f1d1d"} />
                  <Radio className="h-2.5 w-2.5 text-white -translate-x-1.5 -translate-y-1.5" />
                </g>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

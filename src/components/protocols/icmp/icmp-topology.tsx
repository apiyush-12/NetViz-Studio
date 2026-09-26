"use client";

import React, { useState, useRef } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Server,
  Network,
  Shield,
  Activity,
} from "lucide-react";
import { Badge, Button } from "@/components/ui";
import type {
  IcmpNode,
  IcmpLink,
  IcmpSimulationStepState,
} from "@/features/protocols/icmp/icmp.types";

interface IcmpTopologyProps {
  nodes: IcmpNode[];
  links: IcmpLink[];
  stepState?: IcmpSimulationStepState;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
}

export function IcmpTopology({
  nodes,
  links,
  stepState,
  selectedNodeId,
  onSelectNode,
}: IcmpTopologyProps) {
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

  const handleMouseUp = () => setIsDragging(false);

  const handleZoomIn = () => setZoom((z) => Math.min(1.6, z + 0.15));
  const handleZoomOut = () => setZoom((z) => Math.max(0.65, z - 0.15));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const getNodeVisuals = (node: IcmpNode) => {
    const isSelected = node.id === selectedNodeId;
    const isStepActive = node.id === activeNodeId;

    switch (node.type) {
      case "host":
        return {
          fill: "#1e3a8a",
          stroke: isSelected ? "#60a5fa" : "#3b82f6",
          glow: isStepActive ? "drop-shadow(0 0 14px rgba(59, 130, 246, 0.7))" : "",
        };
      case "router":
        return {
          fill: "#312e81",
          stroke: isSelected ? "#a5b4fc" : "#6366f1",
          glow: isStepActive ? "drop-shadow(0 0 14px rgba(99, 102, 241, 0.7))" : "",
        };
      case "firewall":
        return {
          fill: "#7f1d1d",
          stroke: isSelected ? "#f87171" : "#ef4444",
          glow: isStepActive ? "drop-shadow(0 0 14px rgba(239, 68, 68, 0.7))" : "",
        };
      case "server":
      default:
        return {
          fill: "#064e3b",
          stroke: isSelected ? "#6ee7b7" : "#10b981",
          glow: isStepActive ? "drop-shadow(0 0 14px rgba(16, 185, 129, 0.7))" : "",
        };
    }
  };

  const getPacketBadgeColor = (packet: NonNullable<typeof activePacket>) => {
    const type = packet.icmpHeader.type;
    const code = packet.icmpHeader.code;

    if (type === 8) return { bg: "#1e3a8a", border: "#3b82f6", text: "#93c5fd", label: `Echo Req (Seq ${packet.icmpHeader.sequenceNumber})` };
    if (type === 0) return { bg: "#064e3b", border: "#10b981", text: "#6ee7b7", label: `Echo Reply (${packet.rttMs ?? 24}ms)` };
    if (type === 11) return { bg: "#78350f", border: "#f59e0b", text: "#fde68a", label: `Time Exceeded (TTL=0)` };
    if (type === 3 && code === 4) return { bg: "#581c87", border: "#a855f7", text: "#e9d5ff", label: `Frag Needed (MTU ${packet.icmpHeader.nextHopMtu})` };
    if (type === 3) return { bg: "#7f1d1d", border: "#ef4444", text: "#fca5a5", label: `Dest Unreach (Code ${code})` };
    if (type === 5) return { bg: "#4c1d95", border: "#c084fc", text: "#f3e8ff", label: `Redirect -> R2` };
    return { bg: "#1e293b", border: "#64748b", text: "#cbd5e1", label: `ICMP T:${type} C:${code}` };
  };

  return (
    <div className="relative w-full h-[460px] rounded-xl border border-border bg-slate-950 overflow-hidden select-none flex flex-col shadow-inner">
      {/* Top Overlay Legend & Header */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 shadow-md">
          <Activity className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-semibold text-slate-200">
            ICMP Diagnostics & Multi-Hop Path Canvas
          </span>
          <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20">
            RFC 792 / RFC 1191
          </Badge>
        </div>

        {/* Legend Pills */}
        <div className="hidden sm:flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 shadow-md text-[10px] font-mono">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-300">Type 8 (Echo Req)</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Type 0 (Echo Reply)</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-300">Type 11 (TTL Exceeded)</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-slate-300">Type 3 (Unreachable)</span>
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
          <pattern id="icmpGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
          </pattern>

          {/* Glow Filters */}
          <filter id="icmpPacketGlow" x="-50%" y="-50%" width="200%" height="200%">
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
          <rect x="-500" y="-300" width="2200" height="1200" fill="url(#icmpGrid)" />

          {/* Links */}
          {links.map((link) => {
            const srcNode = nodes.find((n) => n.id === link.sourceNodeId);
            const tgtNode = nodes.find((n) => n.id === link.targetNodeId);
            if (!srcNode || !tgtNode) return null;

            const isActive = activeLinkIds.includes(link.id);
            const isBottleneck = link.isBottleneck;

            let strokeColor = "#334155";
            let strokeWidth = 2.5;
            let strokeDash = "none";

            if (isBottleneck) {
              strokeColor = isActive ? "#c084fc" : "#a855f7";
              strokeDash = "6 4";
              strokeWidth = 3;
            } else if (isActive) {
              strokeColor = "#60a5fa";
              strokeWidth = 4;
            }

            const midX = (srcNode.position.x + tgtNode.position.x) / 2;
            const midY = (srcNode.position.y + tgtNode.position.y) / 2;

            return (
              <g key={link.id}>
                {/* Active link glow underlay */}
                {isActive && (
                  <line
                    x1={srcNode.position.x}
                    y1={srcNode.position.y}
                    x2={tgtNode.position.x}
                    y2={tgtNode.position.y}
                    stroke={isBottleneck ? "#a855f7" : "#3b82f6"}
                    strokeWidth={8}
                    strokeOpacity={0.3}
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

                {/* Link MTU Badge */}
                <g transform={`translate(${midX}, ${midY - 14})`}>
                  <rect
                    x="-32"
                    y="-10"
                    width="64"
                    height="18"
                    rx="4"
                    fill="#0f172a"
                    stroke={isBottleneck ? "#a855f7" : "rgba(255, 255, 255, 0.15)"}
                    strokeWidth="1"
                  />
                  <text
                    y="3"
                    textAnchor="middle"
                    fill={isBottleneck ? "#e9d5ff" : "#94a3b8"}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    MTU: {link.mtu}
                  </text>
                </g>
              </g>
            );
          })}

          {/* In-Flight ICMP Packet */}
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
                <g transform={`translate(${midX}, ${midY})`} filter="url(#icmpPacketGlow)">
                  <circle r="18" fill="rgba(59, 130, 246, 0.2)" stroke={badge.border} strokeWidth="1.5" />
                  <circle r="8" fill={badge.border} />

                  {/* Floating Packet Type Badge */}
                  <g transform="translate(0, -30)">
                    <rect
                      x="-70"
                      y="-12"
                      width="140"
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

          {/* Nodes */}
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
                {/* Active Node Pulse Ring */}
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

                {/* Node Circle */}
                <circle
                  r="24"
                  fill={visuals.fill}
                  stroke={visuals.stroke}
                  strokeWidth={isSelected ? 3 : 2}
                />

                {/* Node Icon */}
                <g transform="translate(-8, -8)" className="pointer-events-none text-slate-100">
                  {node.type === "host" ? (
                    <Server className="h-4 w-4 stroke-slate-200" />
                  ) : node.type === "firewall" ? (
                    <Shield className="h-4 w-4 stroke-red-300" />
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
                    {node.name.split(" ")[0]}
                  </text>
                </g>

                {/* IP Tag */}
                <g transform="translate(0, 56)" className="pointer-events-none">
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
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

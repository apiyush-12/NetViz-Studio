"use client";

import React, { useState, useRef } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Activity,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui";
import type {
  IsisNode,
  IsisLink,
  IsisSimulationStepState,
  IsisPduData,
  IsisRouterLevel,
} from "@/features/protocols/isis/isis.types";

interface IsisTopologyProps {
  nodes: IsisNode[];
  links: IsisLink[];
  stepState?: IsisSimulationStepState;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
}

export function IsisTopology({
  nodes,
  links,
  stepState,
  selectedNodeId,
  onSelectNode,
}: IsisTopologyProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const activePdu = stepState?.activePdu;
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

  const getPduBadgeColor = (pdu: IsisPduData) => {
    const typeName = pdu.pduTypeName || "";
    if (typeName.includes("L1_LSP") || pdu.pduType === 18) {
      return {
        bg: "#064e3b",
        border: "#10b981",
        text: "#a7f3d0",
        label: `L1 LSP (${pdu.lspHeader?.lspId || pdu.sourceSystemId})`,
      };
    }
    if (typeName.includes("L2_LSP") || pdu.pduType === 20) {
      return {
        bg: "#1e3a8a",
        border: "#3b82f6",
        text: "#bfdbfe",
        label: `L2 LSP (${pdu.lspHeader?.lspId || pdu.sourceSystemId})`,
      };
    }
    if (typeName.includes("IIH") || pdu.pduType === 15 || pdu.pduType === 16 || pdu.pduType === 17) {
      return {
        bg: "#581c87",
        border: "#a855f7",
        text: "#f3e8ff",
        label: `IS-IS Hello (IIH)`,
      };
    }
    if (typeName.includes("CSNP") || pdu.pduType === 24 || pdu.pduType === 25) {
      return {
        bg: "#78350f",
        border: "#f59e0b",
        text: "#fef3c7",
        label: `DIS CSNP Summary`,
      };
    }
    return {
      bg: "#1e293b",
      border: "#64748b",
      text: "#e2e8f0",
      label: pdu.pduTypeName || `PDU Type ${pdu.pduType}`,
    };
  };

  const getNodeLevelColor = (level: IsisRouterLevel) => {
    switch (level) {
      case "L1":
        return {
          fill: "rgba(16, 185, 129, 0.15)",
          stroke: "#10b981",
          badgeBg: "bg-emerald-500/20",
          badgeText: "text-emerald-400",
          label: "L1",
        };
      case "L2":
        return {
          fill: "rgba(59, 130, 246, 0.15)",
          stroke: "#3b82f6",
          badgeBg: "bg-blue-500/20",
          badgeText: "text-blue-400",
          label: "L2",
        };
      case "L1_L2":
      default:
        return {
          fill: "rgba(168, 85, 247, 0.18)",
          stroke: "#a855f7",
          badgeBg: "bg-purple-500/20",
          badgeText: "text-purple-400",
          label: "L1/L2",
        };
    }
  };

  // Group nodes by Area to render area background boundaries
  const areas = Array.from(new Set(nodes.map((n) => n.areaId)));

  return (
    <div className="relative w-full h-[470px] rounded-xl border border-border bg-slate-950 overflow-hidden select-none flex flex-col shadow-inner">
      {/* Top Overlay Header & Status Legend */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 shadow-md">
          <Activity className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">
            IS-IS Two-Level Hierarchical Canvas
          </span>
          <span className="text-[11px] text-slate-400">|</span>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> L1 Area
            </span>
            <span className="flex items-center gap-1 text-blue-400">
              <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" /> L2 Backbone
            </span>
            <span className="flex items-center gap-1 text-purple-400">
              <span className="h-2 w-2 rounded-full bg-purple-500 inline-block" /> L1/L2 Border
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <Award className="h-3 w-3 text-amber-400 inline-block" /> DIS
            </span>
          </div>
        </div>

        {/* Viewport Controls */}
        <div className="flex items-center gap-1 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-800 shadow-md">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            className="h-7 w-7 text-slate-300 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            className="h-7 w-7 text-slate-300 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleResetZoom}
            className="h-7 w-7 text-slate-300 hover:text-white"
            title="Reset View"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 920 400"
          preserveAspectRatio="xMidYMid meet"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.15s ease-out",
          }}
        >
          <defs>
            <linearGradient id="l1Grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="l2Grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="l1l2Grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7e22ce" stopOpacity="0.9" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="pulseGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Area Boundaries / Background Enclosures */}
          {areas.map((areaId) => {
            const areaNodes = nodes.filter((n) => n.areaId === areaId);
            if (areaNodes.length === 0) return null;
            const minX = Math.min(...areaNodes.map((n) => n.position.x)) - 70;
            const maxX = Math.max(...areaNodes.map((n) => n.position.x)) + 70;
            const minY = Math.min(...areaNodes.map((n) => n.position.y)) - 65;
            const maxY = Math.max(...areaNodes.map((n) => n.position.y)) + 65;
            const width = maxX - minX;
            const height = maxY - minY;

            const isBackbone = areaId === "49.0002";
            const areaColor = isBackbone
              ? { stroke: "#3b82f6", fill: "rgba(59, 130, 246, 0.05)", label: "Level 2 Backbone (Area 49.0002)" }
              : areaId === "49.0001"
              ? { stroke: "#10b981", fill: "rgba(16, 185, 129, 0.05)", label: "Level 1 Area 49.0001" }
              : { stroke: "#a855f7", fill: "rgba(168, 85, 247, 0.05)", label: `Level 1 Area ${areaId}` };

            return (
              <g key={areaId} className="pointer-events-none">
                <rect
                  x={minX}
                  y={minY}
                  width={width}
                  height={height}
                  rx={24}
                  ry={24}
                  fill={areaColor.fill}
                  stroke={areaColor.stroke}
                  strokeWidth={1.5}
                  strokeDasharray="6 6"
                  opacity={0.85}
                />
                <text
                  x={minX + 16}
                  y={minY + 22}
                  fill={areaColor.stroke}
                  fontSize={11}
                  fontWeight="bold"
                  fontFamily="monospace"
                  opacity={0.9}
                >
                  {areaColor.label}
                </text>
              </g>
            );
          })}

          {/* Links / Circuits */}
          {links.map((link) => {
            const sourceNode = nodes.find((n) => n.id === link.sourceNodeId);
            const targetNode = nodes.find((n) => n.id === link.targetNodeId);
            if (!sourceNode || !targetNode) return null;

            const isActive = activeLinkIds.includes(link.id);
            const isL2 = link.level === "L2" || link.level === "L1_L2";
            const strokeColor = isL2 ? "#3b82f6" : "#10b981";

            const midX = (sourceNode.position.x + targetNode.position.x) / 2;
            const midY = (sourceNode.position.y + targetNode.position.y) / 2;

            return (
              <g key={link.id} className="transition-all duration-300">
                {/* Active Link Highlight Aura */}
                {isActive && (
                  <line
                    x1={sourceNode.position.x}
                    y1={sourceNode.position.y}
                    x2={targetNode.position.x}
                    y2={targetNode.position.y}
                    stroke={strokeColor}
                    strokeWidth={8}
                    strokeOpacity={0.4}
                    strokeLinecap="round"
                    filter="url(#glow)"
                  />
                )}

                {/* Base Link Line */}
                <line
                  x1={sourceNode.position.x}
                  y1={sourceNode.position.y}
                  x2={targetNode.position.x}
                  y2={targetNode.position.y}
                  stroke={strokeColor}
                  strokeWidth={isActive ? 3.5 : 2}
                  strokeDasharray={isActive ? "8 4" : link.circuitType === "broadcast" ? "4 4" : undefined}
                  className={isActive ? "animate-pulse" : undefined}
                />

                {/* Midpoint Metric / Circuit Badge */}
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x={-34}
                    y={-10}
                    width={68}
                    height={20}
                    rx={5}
                    ry={5}
                    fill="#0f172a"
                    stroke={isActive ? strokeColor : "#334155"}
                    strokeWidth={1.2}
                  />
                  <text
                    x={0}
                    y={3.5}
                    textAnchor="middle"
                    fill={isActive ? "#f8fafc" : "#94a3b8"}
                    fontSize={9.5}
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {link.level} &bull; M:{link.metric}
                  </text>
                </g>
              </g>
            );
          })}

          {/* In-Flight PDU Animation Capsule */}
          {activePdu && (() => {
            const src = nodes.find((n) => n.id === activePdu.sourceNodeId || n.systemId === activePdu.sourceSystemId);
            const dst = nodes.find((n) => n.id === activePdu.targetNodeId);
            if (!src || !dst) return null;

            const pduBadge = getPduBadgeColor(activePdu);
            const posX = src.position.x + (dst.position.x - src.position.x) * 0.5;
            const posY = src.position.y + (dst.position.y - src.position.y) * 0.5;

            return (
              <g
                transform={`translate(${posX}, ${posY})`}
                className="transition-all duration-500 ease-out"
                filter="url(#pulseGlow)"
              >
                <rect
                  x={-60}
                  y={-14}
                  width={120}
                  height={28}
                  rx={8}
                  ry={8}
                  fill={pduBadge.bg}
                  stroke={pduBadge.border}
                  strokeWidth={2}
                />
                <text
                  x={0}
                  y={4}
                  textAnchor="middle"
                  fill={pduBadge.text}
                  fontSize={10}
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {pduBadge.label}
                </text>
              </g>
            );
          })()}

          {/* Router Nodes */}
          {nodes.map((node) => {
            const isSelected = node.id === selectedNodeId;
            const isActiveNode = node.id === activeNodeId;
            const levelStyle = getNodeLevelColor(node.routerLevel);
            const isNodeDis = node.isDis || node.interfaces.some((i) => i.isDis);

            return (
              <g
                key={node.id}
                transform={`translate(${node.position.x}, ${node.position.y})`}
                onClick={() => onSelectNode(node.id)}
                className="cursor-pointer group"
              >
                {/* Selection & Active Pulse Rings */}
                {isSelected && (
                  <circle
                    r={32}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    strokeDasharray="4 3"
                    className="animate-spin"
                    style={{ animationDuration: "8s" }}
                  />
                )}
                {isActiveNode && (
                  <circle
                    r={36}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth={2}
                    opacity={0.7}
                    filter="url(#glow)"
                  />
                )}

                {/* Router Main Hexagon / Circle Node */}
                <circle
                  r={24}
                  fill="#0f172a"
                  stroke={levelStyle.stroke}
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition-all group-hover:stroke-emerald-400"
                />

                {/* Internal Level Gradient Center */}
                <circle
                  r={16}
                  fill={levelStyle.fill}
                  stroke={levelStyle.stroke}
                  strokeWidth={1}
                />

                {/* Node Label / Hostname */}
                <text
                  x={0}
                  y={4.5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={11}
                  fontWeight="bold"
                  fontFamily="monospace"
                  className="select-none"
                >
                  {node.name.split(" ")[1] || node.name}
                </text>

                {/* Level Badge above Node */}
                <g transform="translate(0, -32)">
                  <rect
                    x={-24}
                    y={-8}
                    width={48}
                    height={16}
                    rx={4}
                    ry={4}
                    fill="#020617"
                    stroke={levelStyle.stroke}
                    strokeWidth={1.2}
                  />
                  <text
                    x={0}
                    y={4}
                    textAnchor="middle"
                    fill={levelStyle.stroke}
                    fontSize={9}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {node.routerLevel}
                  </text>
                </g>

                {/* DIS Crown Indicator */}
                {isNodeDis && (
                  <g transform="translate(18, -18)">
                    <circle r={10} fill="#78350f" stroke="#f59e0b" strokeWidth={1.5} />
                    <text
                      x={0}
                      y={3.5}
                      textAnchor="middle"
                      fill="#fef3c7"
                      fontSize={8.5}
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      DIS
                    </text>
                  </g>
                )}

                {/* Overload OL Flag Indicator */}
                {node.overloadBit && (
                  <g transform="translate(-18, -18)">
                    <circle r={9} fill="#4c0519" stroke="#f43f5e" strokeWidth={1.5} />
                    <text
                      x={0}
                      y={3}
                      textAnchor="middle"
                      fill="#ffe4e6"
                      fontSize={8}
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      OL
                    </text>
                  </g>
                )}

                {/* Attached ATT Flag Indicator */}
                {node.attachedBit && (
                  <g transform="translate(18, 18)">
                    <circle r={9} fill="#7c2d12" stroke="#ea580c" strokeWidth={1.5} />
                    <text
                      x={0}
                      y={3}
                      textAnchor="middle"
                      fill="#ffedd5"
                      fontSize={8}
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      ATT
                    </text>
                  </g>
                )}

                {/* Subtext: NET Address */}
                <text
                  x={0}
                  y={42}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize={9}
                  fontFamily="monospace"
                  className="select-none"
                >
                  {node.netAddress}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

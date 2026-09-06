"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui";
import type {
  StpSwitchNode,
  StpLink,
  StpPortRole,
  StpPortState,
  BpduFrame,
} from "@/features/protocols/stp/stp.types";

interface StpTopologyProps {
  switches: StpSwitchNode[];
  links: StpLink[];
  selectedSwitchId: string | null;
  onSelectSwitch: (switchId: string) => void;
  onToggleLink?: (linkId: string) => void;
  activeBpdu?: BpduFrame;
  activeLinkIds?: string[];
  loopActive?: boolean;
}

export function StpTopology({
  switches,
  links,
  selectedSwitchId,
  onSelectSwitch,
  onToggleLink,
  activeBpdu,
  activeLinkIds = [],
  loopActive = false,
}: StpTopologyProps) {
  const [zoom, setZoom] = useState(1);
  const [showCosts, setShowCosts] = useState(true);

  const getRoleColor = (role: StpPortRole, state: StpPortState) => {
    if (state === "broken") return "#f43f5e"; // rose
    if (state === "disabled") return "#64748b"; // slate
    if (state === "blocking" || state === "discarding" || role === "alternate") return "#f59e0b"; // amber
    if (state === "listening" || state === "learning") return "#06b6d4"; // cyan
    if (role === "root") return "#06b6d4"; // cyan
    if (role === "designated") return "#10b981"; // emerald
    if (role === "backup") return "#a855f7"; // purple
    return "#3b82f6"; // blue
  };

  const getRoleLabel = (role: StpPortRole, state: StpPortState) => {
    if (state === "broken") return "INCON";
    if (state === "disabled") return "DOWN";
    if (state === "blocking" || state === "discarding" || role === "alternate") return "BLK";
    if (state === "listening") return "LST";
    if (state === "learning") return "LRN";
    if (role === "root") return "RP";
    if (role === "designated") return "DP";
    if (role === "backup") return "BP";
    return "FWD";
  };

  return (
    <div className="relative w-full h-[460px] rounded-2xl border border-border bg-slate-950/80 backdrop-blur-md overflow-hidden shadow-inner flex flex-col">
      {/* Top Topology Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Badge
            variant="default"
            className="bg-slate-900/90 text-slate-200 border-border text-xs px-2.5 py-1 backdrop-blur-md shadow-md"
          >
            Layer 2 Spanning Tree Canvas
          </Badge>

          {loopActive ? (
            <Badge
              variant="destructive"
              className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-xs px-2.5 py-1 animate-pulse shadow-md flex items-center gap-1 font-semibold"
            >
              <AlertTriangle className="h-3 w-3" /> Bridging Loop Active
            </Badge>
          ) : (
            <Badge
              variant="default"
              className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs px-2.5 py-1 shadow-md flex items-center gap-1 font-semibold"
            >
              <CheckCircle2 className="h-3 w-3" /> Loop-Free Spanning Tree
            </Badge>
          )}
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1 pointer-events-auto bg-slate-900/90 p-1 rounded-xl border border-border backdrop-blur-md shadow-md">
          <button
            onClick={() => setShowCosts(!showCosts)}
            className={`px-2 py-1 text-[11px] rounded font-medium transition-colors cursor-pointer ${
              showCosts ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Toggle Path Cost badges"
          >
            Costs
          </button>
          <div className="h-3 w-px bg-border mx-0.5" />
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.15, 1.6))}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.7))}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <svg
        className="w-full h-full select-none cursor-grab active:cursor-grabbing"
        viewBox="0 0 620 400"
        preserveAspectRatio="xMidYMid meet"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "center center",
          transition: "transform 0.2s ease-out",
        }}
      >
        <defs>
          {/* Background Grid Pattern */}
          <pattern id="stp-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          </pattern>

          {/* Glowing Filters */}
          <filter id="root-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="blocked-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Grid Background */}
        <rect width="100%" height="100%" fill="url(#stp-grid)" />

        {/* ─── Links Rendering ────────────────────────────────────────────── */}
        {links.map((link) => {
          const swA = switches.find((s) => s.id === link.sourceSwitchId);
          const swB = switches.find((s) => s.id === link.targetSwitchId);
          if (!swA || !swB) return null;

          const pA = swA.ports.find((p) => p.id === link.sourcePortId);
          const pB = swB.ports.find((p) => p.id === link.targetPortId);

          const isBlocked =
            pA?.role === "alternate" ||
            pB?.role === "alternate" ||
            pA?.state === "blocking" ||
            pB?.state === "blocking" ||
            pA?.state === "discarding" ||
            pB?.state === "discarding";

          const isBroken = pA?.state === "broken" || pB?.state === "broken";
          const isDown = !link.enabled || pA?.state === "disabled" || pB?.state === "disabled";
          const isActiveBpduLink = activeLinkIds.includes(link.id);

          const x1 = swA.position.x;
          const y1 = swA.position.y;
          const x2 = swB.position.x;
          const y2 = swB.position.y;
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;

          // Compute offsets for port role badges near switch perimeters
          const dx = x2 - x1;
          const dy = y2 - y1;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const offsetDist = 48; // distance from switch center

          const pAx = x1 + (dx / len) * offsetDist;
          const pAy = y1 + (dy / len) * offsetDist;
          const pBx = x2 - (dx / len) * offsetDist;
          const pBy = y2 - (dy / len) * offsetDist;

          return (
            <g key={link.id} className="cursor-pointer group" onClick={() => onToggleLink?.(link.id)}>
              {/* Active BPDU Pulse Glow */}
              {isActiveBpduLink && (
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={activeBpdu?.type === "tcn" ? "#f59e0b" : "#38bdf8"}
                  strokeWidth="8"
                  strokeOpacity="0.4"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              )}

              {/* Underlying Physical Link Line */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={
                  isDown
                    ? "#475569"
                    : isBroken
                    ? "#f43f5e"
                    : isBlocked
                    ? "#d97706"
                    : "#10b981"
                }
                strokeWidth={isDown ? 2 : isBlocked ? 3 : 4}
                strokeDasharray={isDown ? "6 6" : isBlocked ? "8 6" : undefined}
                strokeOpacity={isDown ? 0.4 : isBlocked ? 0.8 : 0.9}
                className="transition-all duration-300"
              />

              {/* Blocked Link Amber X Marker in center if blocked */}
              {isBlocked && !isDown && (
                <g transform={`translate(${midX}, ${midY})`}>
                  <circle r="12" fill="#78350f" stroke="#f59e0b" strokeWidth="2" />
                  <line x1="-5" y1="-5" x2="5" y2="5" stroke="#fef3c7" strokeWidth="2" />
                  <line x1="5" y1="-5" x2="-5" y2="5" stroke="#fef3c7" strokeWidth="2" />
                </g>
              )}

              {/* Path Cost Badge in Middle */}
              {showCosts && !isBlocked && (
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x="-24"
                    y="-9"
                    width="48"
                    height="18"
                    rx="9"
                    fill="#0f172a"
                    stroke="#334155"
                    strokeWidth="1"
                    className="shadow"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    Cost {link.cost}
                  </text>
                </g>
              )}

              {/* Port A Role Badge (Near Switch A) */}
              {pA && (
                <g transform={`translate(${pAx}, ${pAy})`}>
                  <rect
                    x="-14"
                    y="-8"
                    width="28"
                    height="16"
                    rx="4"
                    fill={getRoleColor(pA.role, pA.state)}
                    fillOpacity="0.25"
                    stroke={getRoleColor(pA.role, pA.state)}
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    fill={getRoleColor(pA.role, pA.state)}
                    fontSize="8.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {getRoleLabel(pA.role, pA.state)}
                  </text>
                </g>
              )}

              {/* Port B Role Badge (Near Switch B) */}
              {pB && (
                <g transform={`translate(${pBx}, ${pBy})`}>
                  <rect
                    x="-14"
                    y="-8"
                    width="28"
                    height="16"
                    rx="4"
                    fill={getRoleColor(pB.role, pB.state)}
                    fillOpacity="0.25"
                    stroke={getRoleColor(pB.role, pB.state)}
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    fill={getRoleColor(pB.role, pB.state)}
                    fontSize="8.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {getRoleLabel(pB.role, pB.state)}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* ─── Switches (Nodes) Rendering ─────────────────────────────────── */}
        {switches.map((sw) => {
          const isSelected = selectedSwitchId === sw.id;
          const isRoot = sw.isRoot;

          return (
            <g
              key={sw.id}
              transform={`translate(${sw.position.x}, ${sw.position.y})`}
              onClick={() => onSelectSwitch(sw.id)}
              className="cursor-pointer group"
            >
              {/* Selection Ring */}
              {isSelected && (
                <circle
                  r="38"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="4 3"
                  className="animate-spin"
                  style={{ animationDuration: "12s" }}
                />
              )}

              {/* Root Bridge Golden Aura Glow */}
              {isRoot && (
                <circle
                  r="34"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  filter="url(#root-glow)"
                  opacity="0.6"
                  className="animate-pulse"
                />
              )}

              {/* Switch Base Circle */}
              <circle
                r="30"
                fill={isRoot ? "#1e1b18" : "#0f172a"}
                stroke={
                  isRoot
                    ? "#f59e0b"
                    : isSelected
                    ? "#38bdf8"
                    : "#334155"
                }
                strokeWidth={isRoot ? 2.5 : isSelected ? 2 : 1.5}
                className="transition-all duration-200 group-hover:scale-105"
              />

              {/* Crown Icon for Root Bridge or Switch Icon */}
              {isRoot ? (
                <g transform="translate(-8, -18)">
                  <path
                    d="M 2 12 L 5 4 L 8 8 L 11 4 L 14 12 Z"
                    fill="#fbbf24"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <circle cx="2" cy="12" r="1.5" fill="#fef08a" />
                  <circle cx="8" cy="8" r="1.5" fill="#fef08a" />
                  <circle cx="14" cy="12" r="1.5" fill="#fef08a" />
                </g>
              ) : (
                <g transform="translate(-10, -18)">
                  {/* Mini Layer 2 Switch icon */}
                  <rect x="0" y="4" width="20" height="10" rx="2" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                  <line x1="4" y1="9" x2="16" y2="9" stroke="#38bdf8" strokeWidth="1.5" />
                  <line x1="7" y1="6.5" x2="13" y2="11.5" stroke="#38bdf8" strokeWidth="1" />
                  <line x1="7" y1="11.5" x2="13" y2="6.5" stroke="#38bdf8" strokeWidth="1" />
                </g>
              )}

              {/* Switch Label */}
              <text
                x="0"
                y="5"
                textAnchor="middle"
                fill={isRoot ? "#fef08a" : "#f8fafc"}
                fontSize="11"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                {sw.label}
              </text>

              {/* Priority & Path Cost pill under node */}
              <g transform="translate(0, 42)">
                <rect
                  x="-42"
                  y="-8"
                  width="84"
                  height="16"
                  rx="8"
                  fill="#020617"
                  stroke={isRoot ? "#f59e0b" : "#334155"}
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fill={isRoot ? "#fde047" : "#cbd5e1"}
                  fontSize="8.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {sw.bridgeId.priority} · {isRoot ? "ROOT" : `RPC:${sw.rootPathCost}`}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Legend Footer */}
      <div className="p-2 border-t border-border bg-slate-950/90 flex items-center justify-between flex-wrap gap-2 text-[10px] text-muted-foreground font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <strong className="text-emerald-400">DP:</strong> Designated (FWD)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            <strong className="text-cyan-400">RP:</strong> Root Port (FWD)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <strong className="text-amber-400">BLK/AP:</strong> Alternate (Blocked)
          </span>
        </div>
        <div className="text-[10px] text-muted-foreground">
          Tip: Click switches to inspect details · Click links to toggle failure
        </div>
      </div>
    </div>
  );
}

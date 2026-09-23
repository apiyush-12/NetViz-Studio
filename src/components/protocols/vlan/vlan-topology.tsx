"use client";

import React, { useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Radio,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui";
import type {
  VlanNode,
  VlanLink,
  VlanFrameData,
} from "@/features/protocols/vlan/vlan.types";
import { DEFAULT_VLANS } from "@/features/protocols/vlan/vlan.defaults";

interface VlanTopologyProps {
  nodes: VlanNode[];
  links: VlanLink[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  activeFrame?: VlanFrameData;
  activeLinkIds?: string[];
  broadcastLinkIds?: string[];
  isolatedNodeIds?: string[];
}

export function VlanTopology({
  nodes,
  links,
  selectedNodeId,
  onSelectNode,
  activeFrame,
  activeLinkIds = [],
  broadcastLinkIds = [],
  isolatedNodeIds = [],
}: VlanTopologyProps) {
  const [zoom, setZoom] = useState(1);
  const [showZones, setShowZones] = useState(true);

  const getNodeColor = (node: VlanNode) => {
    if (node.isAttacker || node.type === "attacker") return "#ef4444"; // red
    if (node.type === "router") return "#f59e0b"; // amber
    if (node.type === "layer3-switch") return "#a855f7"; // purple
    if (node.type === "switch") return "#38bdf8"; // cyan/blue

    // For host/server: match VLAN color
    const vlan = DEFAULT_VLANS.find((v) => v.vlanId === node.vlanId);
    return vlan?.color || "#10b981";
  };

  const getLinkColor = (link: VlanLink) => {
    if (link.linkType === "trunk") return "#f59e0b"; // golden amber for trunk
    const vlan = DEFAULT_VLANS.find((v) => v.vlanId === link.pvid);
    return vlan?.color || "#3b82f6";
  };

  return (
    <div className="relative w-full h-[460px] rounded-2xl border border-border bg-slate-950/80 backdrop-blur-md overflow-hidden shadow-inner flex flex-col">
      {/* Top Controls Ribbon */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Badge
            variant="default"
            className="bg-slate-900/90 text-slate-200 border-border text-xs px-2.5 py-1 backdrop-blur-md shadow-md"
          >
            IEEE 802.1Q VLAN & Trunking Canvas
          </Badge>

          {broadcastLinkIds.length > 0 && (
            <Badge
              variant="warning"
              className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs px-2.5 py-1 animate-pulse shadow-md flex items-center gap-1 font-semibold"
            >
              <Radio className="h-3 w-3" /> Intra-VLAN Broadcast Active
            </Badge>
          )}

          {isolatedNodeIds.length > 0 && (
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30 text-xs px-2.5 py-1 shadow-md flex items-center gap-1"
            >
              <Layers className="h-3 w-3" /> {isolatedNodeIds.length} Nodes Isolated
            </Badge>
          )}
        </div>

        {/* View & Zoom Controls */}
        <div className="flex items-center gap-1 pointer-events-auto bg-slate-900/90 p-1 rounded-xl border border-border backdrop-blur-md shadow-md">
          <button
            onClick={() => setShowZones(!showZones)}
            className={`px-2 py-1 text-[11px] rounded font-medium transition-colors cursor-pointer ${
              showZones ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Toggle VLAN colored visual zones"
          >
            Zones
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

      {/* SVG Canvas */}
      <svg
        className="w-full h-full select-none cursor-grab active:cursor-grabbing"
        viewBox="0 0 660 410"
        preserveAspectRatio="xMidYMid meet"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "center center",
          transition: "transform 0.2s ease-out",
        }}
      >
        <defs>
          {/* Background Grid Pattern */}
          <pattern id="vlan-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          </pattern>

          {/* Glow Filters */}
          <filter id="vlan-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="trunk-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Grid Background */}
        <rect width="100%" height="100%" fill="url(#vlan-grid)" />

        {/* ─── Visual VLAN Shaded Zones ───────────────────────────────────── */}
        {showZones && (
          <g className="transition-opacity duration-300">
            {/* Zone 1: VLAN 10 (Engineering - Left/Top) */}
            <rect
              x="30"
              y="40"
              width="250"
              height="330"
              rx="16"
              fill="#3b82f6"
              fillOpacity="0.04"
              stroke="#3b82f6"
              strokeWidth="1"
              strokeDasharray="6 4"
              strokeOpacity="0.25"
            />
            <text x="45" y="65" fill="#60a5fa" fontSize="10" fontWeight="bold" fontFamily="monospace">
              VLAN 10: ENGINEERING (192.168.10.0/24)
            </text>

            {/* Zone 2: VLAN 20 (Sales - Right/Bottom) */}
            <rect
              x="380"
              y="40"
              width="250"
              height="330"
              rx="16"
              fill="#10b981"
              fillOpacity="0.04"
              stroke="#10b981"
              strokeWidth="1"
              strokeDasharray="6 4"
              strokeOpacity="0.25"
            />
            <text x="395" y="65" fill="#34d399" fontSize="10" fontWeight="bold" fontFamily="monospace">
              VLAN 20: SALES (192.168.20.0/24)
            </text>
          </g>
        )}

        {/* ─── Links Rendering ────────────────────────────────────────────── */}
        {links.map((link) => {
          const nodeA = nodes.find((n) => n.id === link.sourceNodeId);
          const nodeB = nodes.find((n) => n.id === link.targetNodeId);
          if (!nodeA || !nodeB) return null;

          const isActive = activeLinkIds.includes(link.id);
          const isBroadcastActive = broadcastLinkIds.includes(link.id);
          const isTrunk = link.linkType === "trunk";
          const linkColor = getLinkColor(link);

          const x1 = nodeA.position.x;
          const y1 = nodeA.position.y;
          const x2 = nodeB.position.x;
          const y2 = nodeB.position.y;
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;

          // Offsets for port labels
          const dx = x2 - x1;
          const dy = y2 - y1;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const offsetDist = 42;

          const pAx = x1 + (dx / len) * offsetDist;
          const pAy = y1 + (dy / len) * offsetDist;
          const pBx = x2 - (dx / len) * offsetDist;
          const pBy = y2 - (dy / len) * offsetDist;

          return (
            <g key={link.id} className="group">
              {/* Active Pulse Glow */}
              {(isActive || isBroadcastActive) && (
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isTrunk ? "#f59e0b" : linkColor}
                  strokeWidth="8"
                  strokeOpacity="0.45"
                  strokeLinecap="round"
                  filter="url(#trunk-glow)"
                  className="animate-pulse"
                />
              )}

              {/* Physical Line */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isTrunk ? "#f59e0b" : linkColor}
                strokeWidth={isTrunk ? 3.5 : 2.5}
                strokeDasharray={isTrunk ? "8 5" : undefined}
                strokeOpacity={isActive || isBroadcastActive ? 1 : 0.7}
                className="transition-all duration-300"
              />

              {/* In-Flight Packet Badge */}
              {(isActive || isBroadcastActive) && activeFrame && (
                <g transform={`translate(${midX}, ${midY})`} className="animate-bounce">
                  <rect
                    x="-48"
                    y="-11"
                    width="96"
                    height="22"
                    rx="11"
                    fill="#020617"
                    stroke={activeFrame.isTagged ? "#f59e0b" : linkColor}
                    strokeWidth="1.5"
                    className="shadow-lg"
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    fill={activeFrame.isTagged ? "#fde68a" : "#6ee7b7"}
                    fontSize="8.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {activeFrame.isTagged
                      ? `802.1Q [VID:${activeFrame.dot1q?.vlanId}]`
                      : `UNTAGGED [VLAN ${activeFrame.sourceVlanId}]`}
                  </text>
                </g>
              )}

              {/* Trunk Badge on Link Midpoint if not active */}
              {isTrunk && !isActive && !isBroadcastActive && (
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x="-32"
                    y="-8"
                    width="64"
                    height="16"
                    rx="8"
                    fill="#0f172a"
                    stroke="#f59e0b"
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    fill="#fbbf24"
                    fontSize="7.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    802.1Q TRUNK
                  </text>
                </g>
              )}

              {/* Port A Label */}
              {link.sourcePortName && (
                <g transform={`translate(${pAx}, ${pAy})`}>
                  <rect
                    x="-12"
                    y="-6"
                    width="24"
                    height="12"
                    rx="3"
                    fill="#0f172a"
                    stroke="#334155"
                    strokeWidth="0.8"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="7.5"
                    fontFamily="monospace"
                  >
                    {link.sourcePortName}
                  </text>
                </g>
              )}

              {/* Port B Label */}
              {link.targetPortName && (
                <g transform={`translate(${pBx}, ${pBy})`}>
                  <rect
                    x="-12"
                    y="-6"
                    width="24"
                    height="12"
                    rx="3"
                    fill="#0f172a"
                    stroke="#334155"
                    strokeWidth="0.8"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="7.5"
                    fontFamily="monospace"
                  >
                    {link.targetPortName}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* ─── Nodes Rendering ────────────────────────────────────────────── */}
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isIsolated = isolatedNodeIds.includes(node.id);
          const color = getNodeColor(node);

          return (
            <g
              key={node.id}
              transform={`translate(${node.position.x}, ${node.position.y})`}
              onClick={() => onSelectNode(node.id)}
              className="cursor-pointer group"
            >
              {/* Selection Ring */}
              {isSelected && (
                <circle
                  r="36"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="4 3"
                  className="animate-spin"
                  style={{ animationDuration: "12s" }}
                />
              )}

              {/* Base Circle */}
              <circle
                r="28"
                fill="#0f172a"
                stroke={isSelected ? "#38bdf8" : color}
                strokeWidth={isSelected ? 2.5 : 1.8}
                opacity={isIsolated ? 0.6 : 1}
                className="transition-all duration-200 group-hover:scale-105 shadow-md"
              />

              {/* Device Icon Geometry */}
              {node.type === "switch" && (
                <g transform="translate(-10, -18)">
                  <rect x="0" y="4" width="20" height="10" rx="2" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
                  <line x1="4" y1="9" x2="16" y2="9" stroke="#60a5fa" strokeWidth="1.5" />
                  <line x1="7" y1="6.5" x2="13" y2="11.5" stroke="#60a5fa" strokeWidth="1" />
                  <line x1="7" y1="11.5" x2="13" y2="6.5" stroke="#60a5fa" strokeWidth="1" />
                </g>
              )}

              {node.type === "layer3-switch" && (
                <g transform="translate(-10, -18)">
                  <rect x="0" y="4" width="20" height="10" rx="2" fill="#2e1065" stroke="#a855f7" strokeWidth="1" />
                  <circle cx="10" cy="9" r="4" fill="#c084fc" />
                </g>
              )}

              {node.type === "router" && (
                <g transform="translate(-10, -18)">
                  <circle cx="10" cy="9" r="8" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" />
                  <line x1="5" y1="9" x2="15" y2="9" stroke="#fbbf24" strokeWidth="1.5" />
                  <line x1="10" y1="4" x2="10" y2="14" stroke="#fbbf24" strokeWidth="1.5" />
                </g>
              )}

              {node.type === "attacker" && (
                <g transform="translate(-8, -18)">
                  <path
                    d="M 2 4 L 14 4 L 14 10 Q 14 15 8 18 Q 2 15 2 10 Z"
                    fill="#7f1d1d"
                    stroke="#ef4444"
                    strokeWidth="1.2"
                  />
                  <line x1="5" y1="8" x2="11" y2="14" stroke="#fca5a5" strokeWidth="1.5" />
                  <line x1="11" y1="8" x2="5" y2="14" stroke="#fca5a5" strokeWidth="1.5" />
                </g>
              )}

              {node.type === "server" && (
                <g transform="translate(-8, -18)">
                  <rect x="0" y="2" width="16" height="5" rx="1" fill="#1e293b" stroke="#a855f7" strokeWidth="1" />
                  <rect x="0" y="8" width="16" height="5" rx="1" fill="#1e293b" stroke="#a855f7" strokeWidth="1" />
                  <rect x="0" y="14" width="16" height="5" rx="1" fill="#1e293b" stroke="#a855f7" strokeWidth="1" />
                  <circle cx="13" cy="4.5" r="0.8" fill="#c084fc" />
                  <circle cx="13" cy="10.5" r="0.8" fill="#c084fc" />
                </g>
              )}

              {node.type === "host" && (
                <g transform="translate(-8, -18)">
                  <rect x="0" y="3" width="16" height="11" rx="1.5" fill="#1e293b" stroke={color} strokeWidth="1" />
                  <line x1="5" y1="16" x2="11" y2="16" stroke={color} strokeWidth="1.5" />
                  <line x1="8" y1="14" x2="8" y2="16" stroke={color} strokeWidth="1.2" />
                </g>
              )}

              {/* Node Label */}
              <text
                x="0"
                y="5"
                textAnchor="middle"
                fill="#f8fafc"
                fontSize="10"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                {node.label || node.name}
              </text>

              {/* VLAN & IP Pill */}
              <g transform="translate(0, 38)">
                <rect
                  x="-46"
                  y="-8"
                  width="92"
                  height="16"
                  rx="8"
                  fill="#020617"
                  stroke={color}
                  strokeWidth="1"
                  className="shadow-sm"
                />
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fill={color}
                  fontSize="8"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {node.type === "switch" || node.type === "layer3-switch"
                    ? "802.1Q Switch"
                    : node.type === "router"
                    ? "ROAS Gateway"
                    : `VLAN ${node.vlanId} · ${node.ipAddress.split(".")[3]}`}
                </text>
              </g>

              {/* Isolation Shield if isolated in current step */}
              {isIsolated && (
                <g transform="translate(18, -18)">
                  <circle cx="0" cy="0" r="8" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
                  <text x="0" y="3" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="bold">
                    🔒
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Topology Footer Legend */}
      <div className="p-2 border-t border-border bg-slate-950/90 flex items-center justify-between flex-wrap gap-2 text-[10px] text-muted-foreground font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <strong className="text-blue-400">VLAN 10:</strong> Engineering (192.168.10.0/24)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <strong className="text-emerald-400">VLAN 20:</strong> Sales (192.168.20.0/24)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <strong className="text-amber-400">Trunk Link:</strong> 802.1Q Multiplexed
          </span>
        </div>
        <div className="text-[10px] text-muted-foreground">
          Tip: Click devices to inspect their VLAN tables & port modes
        </div>
      </div>
    </div>
  );
}

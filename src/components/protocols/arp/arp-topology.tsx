"use client";

import React, { useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldAlert,
  Radio,
} from "lucide-react";
import { Badge } from "@/components/ui";
import type {
  ArpNode,
  ArpLink,
  ArpPacketData,
} from "@/features/protocols/arp/arp.types";

interface ArpTopologyProps {
  nodes: ArpNode[];
  links: ArpLink[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  activePacket?: ArpPacketData;
  activeLinkIds?: string[];
  broadcastLinkIds?: string[];
  poisonedNodeIds?: string[];
}

export function ArpTopology({
  nodes,
  links,
  selectedNodeId,
  onSelectNode,
  activePacket,
  activeLinkIds = [],
  broadcastLinkIds = [],
  poisonedNodeIds = [],
}: ArpTopologyProps) {
  const [zoom, setZoom] = useState(1);
  const [labelMode, setLabelMode] = useState<"ip" | "mac" | "both">("both");

  const getNodeColor = (node: ArpNode) => {
    if (node.isAttacker || node.type === "attacker") return "#ef4444"; // red
    if (node.type === "router") return "#f59e0b"; // amber
    if (node.type === "switch") return "#3b82f6"; // blue
    if (node.type === "server") return "#a855f7"; // purple
    return "#10b981"; // emerald
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
            Layer 2 Ethernet Subnet Canvas
          </Badge>

          {broadcastLinkIds.length > 0 && (
            <Badge
              variant="warning"
              className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs px-2.5 py-1 animate-pulse shadow-md flex items-center gap-1 font-semibold"
            >
              <Radio className="h-3 w-3" /> L2 Broadcast Flooding (FF:FF:FF:FF:FF:FF)
            </Badge>
          )}

          {poisonedNodeIds.length > 0 && (
            <Badge
              variant="destructive"
              className="bg-red-500/20 text-red-300 border-red-500/40 text-xs px-2.5 py-1 animate-pulse shadow-md flex items-center gap-1 font-semibold"
            >
              <ShieldAlert className="h-3 w-3" /> ARP Cache Poisoned
            </Badge>
          )}
        </div>

        {/* View & Zoom Controls */}
        <div className="flex items-center gap-1 pointer-events-auto bg-slate-900/90 p-1 rounded-xl border border-border backdrop-blur-md shadow-md">
          <div className="flex items-center rounded-lg bg-secondary/30 p-0.5 text-[10px]">
            <button
              onClick={() => setLabelMode("ip")}
              className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                labelMode === "ip" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              IP
            </button>
            <button
              onClick={() => setLabelMode("mac")}
              className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                labelMode === "mac" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              MAC
            </button>
            <button
              onClick={() => setLabelMode("both")}
              className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                labelMode === "both" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Both
            </button>
          </div>

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
        viewBox="0 0 640 420"
        preserveAspectRatio="xMidYMid meet"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "center center",
          transition: "transform 0.2s ease-out",
        }}
      >
        <defs>
          {/* Background Grid Pattern */}
          <pattern id="arp-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          </pattern>

          {/* Glowing Filters */}
          <filter id="broadcast-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="poison-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="unicast-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Grid Background */}
        <rect width="100%" height="100%" fill="url(#arp-grid)" />

        {/* ─── Links Rendering ────────────────────────────────────────────── */}
        {links.map((link) => {
          const nodeA = nodes.find((n) => n.id === link.sourceNodeId);
          const nodeB = nodes.find((n) => n.id === link.targetNodeId);
          if (!nodeA || !nodeB) return null;

          const isBroadcastActive = broadcastLinkIds.includes(link.id);
          const isUnicastActive = activeLinkIds.includes(link.id) && !isBroadcastActive;

          const x1 = nodeA.position.x;
          const y1 = nodeA.position.y;
          const x2 = nodeB.position.x;
          const y2 = nodeB.position.y;
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;

          // Compute offsets for port labels near node perimeters
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
              {/* Broadcast Ripple Pulse Effect */}
              {isBroadcastActive && (
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#f59e0b"
                  strokeWidth="8"
                  strokeOpacity="0.45"
                  strokeLinecap="round"
                  filter="url(#broadcast-glow)"
                  className="animate-pulse"
                />
              )}

              {/* Unicast Flow Glow Effect */}
              {isUnicastActive && (
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={activePacket?.isPoisoned ? "#ef4444" : "#10b981"}
                  strokeWidth="8"
                  strokeOpacity="0.5"
                  strokeLinecap="round"
                  filter="url(#unicast-glow)"
                  className="animate-pulse"
                />
              )}

              {/* Physical Cable Link */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={
                  isBroadcastActive
                    ? "#f59e0b"
                    : isUnicastActive
                    ? activePacket?.isPoisoned
                      ? "#ef4444"
                      : "#10b981"
                    : "#334155"
                }
                strokeWidth={isBroadcastActive || isUnicastActive ? 3.5 : 2}
                strokeOpacity={isBroadcastActive || isUnicastActive ? 1 : 0.7}
                strokeDasharray={isBroadcastActive ? "6 4" : undefined}
                className="transition-all duration-300"
              />

              {/* In-Flight Packet Badge at Link Midpoint */}
              {(isBroadcastActive || isUnicastActive) && activePacket && (
                <g transform={`translate(${midX}, ${midY})`} className="animate-bounce">
                  <rect
                    x="-42"
                    y="-11"
                    width="84"
                    height="22"
                    rx="11"
                    fill="#020617"
                    stroke={
                      activePacket.isPoisoned
                        ? "#ef4444"
                        : isBroadcastActive
                        ? "#f59e0b"
                        : "#10b981"
                    }
                    strokeWidth="1.5"
                    className="shadow-lg"
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    fill={
                      activePacket.isPoisoned
                        ? "#fca5a5"
                        : isBroadcastActive
                        ? "#fde68a"
                        : "#6ee7b7"
                    }
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {activePacket.opcode === 1
                      ? "ARP REQ"
                      : activePacket.isPoisoned
                      ? "POISON"
                      : "ARP REP"}
                  </text>
                </g>
              )}

              {/* Port A Label */}
              {link.sourcePort && (
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
                    {link.sourcePort}
                  </text>
                </g>
              )}

              {/* Port B Label */}
              {link.targetPort && (
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
                    {link.targetPort}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* ─── Nodes Rendering ────────────────────────────────────────────── */}
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isPoisoned = poisonedNodeIds.includes(node.id);
          const isBroadcasting =
            broadcastLinkIds.length > 0 &&
            (node.isSource || node.type === "switch");
          const color = getNodeColor(node);

          return (
            <g
              key={node.id}
              transform={`translate(${node.position.x}, ${node.position.y})`}
              onClick={() => onSelectNode(node.id)}
              className="cursor-pointer group"
            >
              {/* Selected Ring */}
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

              {/* Poisoned Warning Aura */}
              {isPoisoned && (
                <circle
                  r="34"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  filter="url(#poison-glow)"
                  opacity="0.7"
                  className="animate-pulse"
                />
              )}

              {/* Broadcasting Aura */}
              {isBroadcasting && (
                <circle
                  r="34"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  filter="url(#broadcast-glow)"
                  opacity="0.6"
                  className="animate-pulse"
                />
              )}

              {/* Base Device Circle */}
              <circle
                r="28"
                fill="#0f172a"
                stroke={isPoisoned ? "#ef4444" : isSelected ? "#38bdf8" : color}
                strokeWidth={isSelected ? 2.5 : 1.8}
                className="transition-all duration-200 group-hover:scale-105 shadow-md"
              />

              {/* Device Icon Geometry */}
              {node.type === "switch" && (
                <g transform="translate(-10, -18)">
                  <rect x="0" y="4" width="20" height="10" rx="2" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
                  <line x1="4" y1="9" x2="16" y2="9" stroke="#60a5fa" strokeWidth="1.5" />
                  <line x1="7" y1="6.5" x2="13" y2="11.5" stroke="#60a5fa" strokeWidth="1" />
                  <line x1="7" y1="11.5" x2="13" y2="6.5" stroke="#60a5fa" strokeWidth="1" />
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
                  <circle cx="13" cy="16.5" r="0.8" fill="#c084fc" />
                </g>
              )}

              {node.type === "host" && (
                <g transform="translate(-8, -18)">
                  <rect x="0" y="3" width="16" height="11" rx="1.5" fill="#1e293b" stroke="#10b981" strokeWidth="1" />
                  <line x1="5" y1="16" x2="11" y2="16" stroke="#10b981" strokeWidth="1.5" />
                  <line x1="8" y1="14" x2="8" y2="16" stroke="#10b981" strokeWidth="1.2" />
                </g>
              )}

              {/* Node Main Label */}
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

              {/* IP / MAC Address Pill Below Node */}
              <g transform="translate(0, 38)">
                <rect
                  x="-46"
                  y="-8"
                  width="92"
                  height="16"
                  rx="8"
                  fill="#020617"
                  stroke={isPoisoned ? "#ef4444" : "#334155"}
                  strokeWidth="1"
                  className="shadow-sm"
                />
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fill={isPoisoned ? "#fca5a5" : "#cbd5e1"}
                  fontSize="8"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {labelMode === "mac"
                    ? node.macAddress
                    : labelMode === "ip"
                    ? node.ipAddress || "L2 Switch"
                    : node.ipAddress || node.macAddress}
                </text>
              </g>

              {/* Secondary MAC Pill if mode is "both" */}
              {labelMode === "both" && node.ipAddress && (
                <g transform="translate(0, 56)">
                  <rect
                    x="-46"
                    y="-7"
                    width="92"
                    height="14"
                    rx="7"
                    fill="#090d16"
                    stroke="#1e293b"
                    strokeWidth="0.8"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="7"
                    fontFamily="monospace"
                  >
                    {node.macAddress}
                  </text>
                </g>
              )}

              {/* DAI Shield Badge for Switch */}
              {node.daiEnabled && (
                <g transform="translate(18, -18)">
                  <circle cx="0" cy="0" r="7" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
                  <path d="M -3 -1 L -1 2 L 3 -2" fill="none" stroke="#ffffff" strokeWidth="1.2" />
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
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <strong className="text-amber-400">Broadcast:</strong> ARP Request (FF:FF:FF:FF:FF:FF)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <strong className="text-emerald-400">Unicast:</strong> ARP Reply (Direct)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <strong className="text-red-400">Poison / Rogue:</strong> Spoofed Frame
          </span>
        </div>
        <div className="text-[10px] text-muted-foreground">
          Tip: Click devices to inspect their live `arp -a` cache table
        </div>
      </div>
    </div>
  );
}

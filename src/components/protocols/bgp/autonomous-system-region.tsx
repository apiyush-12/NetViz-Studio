"use client";

import React from "react";
import type { AutonomousSystem } from "@/features/protocols/bgp/bgp.types";

interface AutonomousSystemRegionProps {
  asInfo: AutonomousSystem;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function AutonomousSystemRegion({
  asInfo,
  x,
  y,
  width,
  height,
}: AutonomousSystemRegionProps) {
  return (
    <g className="pointer-events-none select-none">
      {/* Background Rounded Area with subtle glow */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="20"
        ry="20"
        fill={asInfo.color}
        stroke="rgba(148, 163, 184, 0.25)"
        strokeWidth="1.5"
        strokeDasharray="5 4"
      />

      {/* AS Header Label */}
      <g transform={`translate(${x + 12}, ${y + 20})`}>
        <rect
          x="0"
          y="-14"
          width="140"
          height="22"
          rx="6"
          fill="rgba(15, 23, 42, 0.85)"
          stroke="rgba(148, 163, 184, 0.3)"
          strokeWidth="1"
        />
        <text
          x="8"
          y="1"
          className="fill-foreground text-[11px] font-mono font-semibold"
        >
          AS {asInfo.asn}
        </text>
        <text
          x="64"
          y="1"
          className="fill-muted-foreground text-[10px] font-sans"
        >
          ({asInfo.routers.length} router)
        </text>
      </g>
    </g>
  );
}

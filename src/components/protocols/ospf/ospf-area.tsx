"use client";

import React from "react";

interface OspfAreaProps {
  areaId: string;
  label?: string;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}

export function OspfAreaRegion({
  areaId,
  label,
  name,
  x,
  y,
  width,
  height,
  color = "rgba(59, 130, 246, 0.08)",
}: OspfAreaProps) {
  const displayLabel = label ?? name ?? `Area ${areaId}`;
  return (
    <g className="pointer-events-none select-none">
      {/* Background Rounded Area with subtle glow */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="24"
        ry="24"
        fill={color}
        stroke="rgba(59, 130, 246, 0.25)"
        strokeWidth="1.5"
        strokeDasharray="6 4"
      />

      {/* Area Badge / Header */}
      <g transform={`translate(${x + 16}, ${y + 24})`}>
        <rect
          x="0"
          y="-14"
          width="130"
          height="22"
          rx="6"
          fill="rgba(15, 23, 42, 0.85)"
          stroke="rgba(59, 130, 246, 0.4)"
          strokeWidth="1"
        />
        <text
          x="8"
          y="1"
          className="fill-blue-400 text-[11px] font-mono font-semibold"
        >
          OSPF Area {areaId} · {displayLabel}
        </text>
      </g>
    </g>
  );
}

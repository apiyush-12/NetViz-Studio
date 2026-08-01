"use client";

import React from "react";
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath } from "@xyflow/react";
import { useTopologyStore } from "@/features/topology/topology-store";
import { cn } from "@/lib/utils";

export function NetworkLinkEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const labelVisibility = useTopologyStore((state) => state.topology.settings.labelVisibility);
  const linkData = (data || {}) as {
    bandwidthMbps?: number;
    latencyMs?: number;
    cost?: number;
    administrativeState?: string;
    operationalState?: string;
    type?: string;
    sourceInterfaceName?: string;
    targetInterfaceName?: string;
  };

  const isDown = linkData.administrativeState === "down" || linkData.operationalState === "down";

  const labels: string[] = [];
  if (labelVisibility.showBandwidth && linkData.bandwidthMbps) labels.push(`${linkData.bandwidthMbps}Mbps`);
  if (labelVisibility.showLatency && linkData.latencyMs) labels.push(`${linkData.latencyMs}ms`);
  if (labelVisibility.showLinkCost && linkData.cost) labels.push(`Cost:${linkData.cost}`);

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3 : 2,
          stroke: isDown ? "#ef4444" : selected ? "var(--color-primary)" : "#64748b",
          strokeDasharray: isDown ? "5 5" : undefined,
        }}
      />
      {(labels.length > 0 || linkData.sourceInterfaceName) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan flex flex-col items-center gap-0.5"
          >
            {labels.length > 0 && (
              <span
                className={cn(
                  "rounded border border-border px-1.5 py-0.5 text-[9px] font-mono shadow-sm",
                  isDown ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-card/90 text-foreground"
                )}
              >
                {labels.join(" | ")}
              </span>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

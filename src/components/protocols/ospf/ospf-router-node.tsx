"use client";

import React from "react";
import { Router as RouterIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OspfRouter } from "@/features/protocols/ospf/ospf.types";

interface OspfRouterNodeProps {
  router: OspfRouter;
  isSelected: boolean;
  isInShortestPath: boolean;
  onClick: () => void;
}

export function OspfRouterNode({
  router,
  isSelected,
  isInShortestPath,
  onClick,
}: OspfRouterNodeProps) {
  const isDown = router.state === "Disabled";

  return (
    <g
      transform={`translate(${router.position.x}, ${router.position.y})`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="cursor-pointer select-none group"
    >
      {/* Shortest Path Glow */}
      {isInShortestPath && (
        <circle
          r="38"
          className="fill-primary/20 stroke-primary/50 stroke-2 animate-pulse"
        />
      )}

      {/* Selected Halo */}
      {isSelected && (
        <circle
          r="34"
          className="fill-none stroke-blue-400 stroke-2 stroke-dasharray-[4,3] animate-spin-slow"
        />
      )}

      {/* Outer Node Circle */}
      <circle
        r="28"
        className={cn(
          "transition-all duration-200 stroke-2",
          isDown
            ? "fill-card stroke-destructive/60 opacity-60"
            : isSelected
              ? "fill-slate-900 stroke-primary shadow-lg"
              : isInShortestPath
                ? "fill-slate-900 stroke-primary"
                : "fill-card stroke-border group-hover:stroke-primary/70"
        )}
      />

      {/* Icon */}
      <foreignObject x="-14" y="-14" width="28" height="28" className="pointer-events-none">
        <div className="flex items-center justify-center h-full w-full">
          <RouterIcon
            className={cn(
              "h-5 w-5",
              isDown ? "text-destructive" : isInShortestPath ? "text-primary" : "text-blue-400"
            )}
          />
        </div>
      </foreignObject>

      {/* Router Name Label */}
      <text
        y="-34"
        textAnchor="middle"
        className="fill-foreground text-xs font-semibold tracking-wide"
      >
        {router.name}
      </text>

      {/* Router ID & State Badges */}
      <text
        y="42"
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] font-mono"
      >
        RID: {router.routerId}
      </text>
      <text
        y="54"
        textAnchor="middle"
        className={cn(
          "text-[9px] font-mono font-medium",
          isDown
            ? "fill-destructive"
            : router.state === "Full"
              ? "fill-emerald-400"
              : "fill-amber-400"
        )}
      >
        Area {router.areaId} · {router.state}
      </text>
    </g>
  );
}

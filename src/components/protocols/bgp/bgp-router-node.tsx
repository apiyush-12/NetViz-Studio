"use client";

import React from "react";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BgpRouter } from "@/features/protocols/bgp/bgp.types";

interface BgpRouterNodeProps {
  router: BgpRouter;
  isSelected: boolean;
  isInBestPath: boolean;
  onClick: () => void;
}

export function BgpRouterNode({
  router,
  isSelected,
  isInBestPath,
  onClick,
}: BgpRouterNodeProps) {
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
      {/* Best Path Glow Underlay */}
      {isInBestPath && (
        <circle
          r="29"
          className="fill-emerald-500/20 stroke-emerald-500/50 stroke-2 animate-pulse"
        />
      )}

      {/* Selected Halo */}
      {isSelected && (
        <circle
          r="26"
          className="fill-none stroke-blue-400 stroke-2 stroke-dasharray-[4,3] animate-spin-slow"
        />
      )}

      {/* Outer Node Circle */}
      <circle
        r="22"
        className={cn(
          "transition-all duration-200 stroke-2",
          isDown
            ? "fill-card stroke-destructive/60 opacity-60"
            : isSelected
              ? "fill-card stroke-primary shadow-lg"
              : isInBestPath
                ? "fill-card stroke-emerald-400"
                : "fill-card stroke-border group-hover:stroke-primary/70"
        )}
      />

      {/* Icon */}
      <foreignObject x="-11" y="-11" width="22" height="22" className="pointer-events-none">
        <div className="flex items-center justify-center h-full w-full">
          <Globe
            className={cn(
              "h-4 w-4",
              isDown ? "text-destructive" : isInBestPath ? "text-emerald-400" : "text-blue-400"
            )}
          />
        </div>
      </foreignObject>

      {/* Router Label */}
      <text
        y="-27"
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold tracking-wide"
      >
        {router.name}
      </text>

      {/* AS & RID Badges */}
      <text
        y="33"
        textAnchor="middle"
        className="fill-muted-foreground text-[9px] font-mono font-medium"
      >
        AS {router.localAsn} · RID: {router.routerId}
      </text>
      <text
        y="43"
        textAnchor="middle"
        className={cn(
          "text-[8.5px] font-mono font-medium",
          isDown
            ? "fill-destructive"
            : router.state === "Established"
              ? "fill-emerald-400"
              : "fill-amber-400"
        )}
      >
        BGP: {router.state}
      </text>
    </g>
  );
}

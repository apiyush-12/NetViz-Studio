"use client";

import React from "react";
import { Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { BgpBestPathComparisonStep } from "@/features/protocols/bgp/bgp.types";

interface BgpBestPathPanelProps {
  comparisonSteps: BgpBestPathComparisonStep[];
  winningReason: string;
  bestRouteName?: string;
}

export function BgpBestPathPanel({
  comparisonSteps,
  winningReason,
  bestRouteName = "Path A (via AS 65002)",
}: BgpBestPathPanelProps) {
  return (
    <div className="space-y-4">
      {/* Educational Disclaimer Banner */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/25 rounded-lg text-xs space-y-1">
        <span className="font-semibold text-blue-400 block">
          Educational Simplified BGP Decision Process
        </span>
        <p className="text-muted-foreground leading-relaxed">
          This visualizer uses a simplified vendor-neutral BGP decision process for education.
          Exact path selection can differ depending on implementation, configuration, and policy.
        </p>
      </div>

      {/* Winner Summary Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">BGP Path Selection Result</CardTitle>
            <Badge variant="success" className="font-mono text-xs">
              Selected: {bestRouteName}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Decision Reason: </span>
            <span className="text-emerald-400 font-semibold">{winningReason}</span>
          </p>
        </CardContent>
      </Card>

      {/* Step-by-Step Decision Ladder */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">BGP Decision Rules Step-by-Step</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="divide-y divide-border/40">
            {comparisonSteps.map((step) => (
              <div key={step.stepNumber} className="py-3 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">
                    {step.criterion}
                  </span>
                  {step.winnerRouteId && (
                    <Badge variant="success" className="text-[10px]">
                      DECIDED HERE
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* Candidate Comparison Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div
                    className={cn(
                      "p-2 rounded border",
                      step.candidateA.preferred
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                        : "bg-secondary/40 border-border text-muted-foreground"
                    )}
                  >
                    <span className="block text-[10px] font-sans text-muted-foreground">
                      {step.candidateA.pathName}
                    </span>
                    <span className="font-bold">{String(step.candidateA.value)}</span>
                  </div>

                  <div
                    className={cn(
                      "p-2 rounded border",
                      step.candidateB.preferred
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                        : "bg-secondary/40 border-border text-muted-foreground"
                    )}
                  >
                    <span className="block text-[10px] font-sans text-muted-foreground">
                      {step.candidateB.pathName}
                    </span>
                    <span className="font-bold">{String(step.candidateB.value)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Badge, Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { OspfSpfStep } from "@/features/protocols/ospf/ospf.types";

interface OspfSpfViewProps {
  rootNodeId: string;
  steps: OspfSpfStep[];
  shortestPaths: Record<string, { cost: number; nextHop: string; exitInterface: string; path: string[] }>;
}

export function OspfSpfView({ rootNodeId, steps, shortestPaths }: OspfSpfViewProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(steps.length > 0 ? steps.length - 1 : 0);
  const currentStep = steps[activeStepIndex] ?? steps[0];

  return (
    <div className="space-y-4">
      {/* Dijkstra Controls & Step Stepper */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm">
              Dijkstra SPF Calculation — Rooted at Router {rootNodeId}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Step-by-step Shortest Path First algorithm execution
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeStepIndex <= 0}
            >
              ← Prev Step
            </Button>
            <span className="text-xs font-mono font-medium px-2">
              Step {activeStepIndex + 1} / {steps.length}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
              disabled={activeStepIndex >= steps.length - 1}
            >
              Next Step →
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentStep && (
            <div className="p-3 bg-secondary/50 border border-border rounded-lg text-xs">
              <span className="text-primary font-semibold font-mono">
                [Step {currentStep.stepNumber}]
              </span>{" "}
              <span className="text-foreground">{currentStep.description}</span>
            </div>
          )}

          {/* Dijkstra State Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="py-2">Node</th>
                  <th className="py-2">Current Cost</th>
                  <th className="py-2">Previous Hop</th>
                  <th className="py-2">Visited</th>
                  <th className="py-2">Candidate Status</th>
                  <th className="py-2">Calculated Path</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {["R1", "R2", "R3", "R4"].map((nodeId) => {
                  const isVisited = currentStep?.visitedNodes.includes(nodeId);
                  const isCandidate = currentStep?.candidateList.some((c) => c.nodeId === nodeId);
                  const candidateData = currentStep?.candidateList.find((c) => c.nodeId === nodeId);
                  const sptData = currentStep?.shortestPathTree[nodeId];

                  const cost = isVisited
                    ? sptData?.cost
                    : isCandidate
                      ? candidateData?.cost
                      : Infinity;

                  const prevHop = isVisited
                    ? sptData?.via
                    : isCandidate
                      ? candidateData?.viaNodeId
                      : "—";

                  const path = isVisited
                    ? sptData?.path.join(" → ")
                    : isCandidate
                      ? candidateData?.path.join(" → ")
                      : "—";

                  return (
                    <tr
                      key={nodeId}
                      className={cn(
                        "transition-colors",
                        currentStep?.currentNodeId === nodeId
                          ? "bg-primary/20 font-semibold"
                          : isVisited
                            ? "bg-emerald-500/10 text-foreground"
                            : isCandidate
                              ? "bg-amber-500/10 text-foreground"
                              : "text-muted-foreground"
                      )}
                    >
                      <td className="py-2 font-medium text-primary">{nodeId}</td>
                      <td className="py-2">
                        {cost === Infinity ? "∞" : <span className="text-blue-400 font-bold">{cost}</span>}
                      </td>
                      <td className="py-2 text-muted-foreground">{prevHop}</td>
                      <td className="py-2">
                        <Badge
                          variant={isVisited ? "success" : "outline"}
                          className="text-[10px]"
                        >
                          {isVisited ? "YES" : "NO"}
                        </Badge>
                      </td>
                      <td className="py-2">
                        <Badge
                          variant={
                            currentStep?.currentNodeId === nodeId
                              ? "default"
                              : isCandidate
                                ? "warning"
                                : "outline"
                          }
                          className="text-[10px]"
                        >
                          {currentStep?.currentNodeId === nodeId
                            ? "SELECTED"
                            : isCandidate
                              ? "CANDIDATE"
                              : "UNSEEN"}
                        </Badge>
                      </td>
                      <td className="py-2 text-[11px] font-sans">{path}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Shortest Path Tree Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Final Shortest Path Tree (SPT)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-3">
            {Object.entries(shortestPaths).map(([destNodeId, info]) => (
              <div key={destNodeId} className="p-2.5 rounded-lg border border-border bg-secondary/30 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-primary font-mono">{rootNodeId} → {destNodeId}</span>
                  <Badge variant="success" className="text-[10px]">Cost: {info.cost}</Badge>
                </div>
                <p className="text-muted-foreground text-[11px] font-mono">
                  Path: {info.path.join(" → ")}
                </p>
                <p className="text-muted-foreground text-[11px] font-mono">
                  Exit: {info.exitInterface} ({info.nextHop})
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

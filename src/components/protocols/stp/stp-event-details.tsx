"use client";

import React, { useState } from "react";
import { BookOpen, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import type { StpSimulationStepState } from "@/features/protocols/stp/stp.types";

interface StpEventDetailsProps {
  stepState?: StpSimulationStepState;
  currentStepIndex: number;
  totalSteps: number;
}

export function StpEventDetails({
  stepState,
  currentStepIndex,
  totalSteps,
}: StpEventDetailsProps) {
  const [level, setLevel] = useState<"beginner" | "advanced">("beginner");

  if (!stepState) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-border bg-card/40 text-center text-xs text-muted-foreground">
        Select or play a step to see step-by-step Spanning Tree explanation.
      </div>
    );
  }

  const exp = stepState.eventExplanation;

  return (
    <Card className="border-border bg-card/70 backdrop-blur-sm shadow-sm">
      <CardHeader className="p-3 pb-2 border-b border-border/50">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono">
              Step {currentStepIndex + 1} of {totalSteps}
            </Badge>
            <CardTitle className="text-xs font-bold text-foreground">
              {stepState.title}
            </CardTitle>
          </div>

          <div className="flex items-center gap-1 bg-secondary/50 p-0.5 rounded-lg border border-border">
            <button
              onClick={() => setLevel("beginner")}
              className={`px-2 py-0.5 text-[11px] rounded font-medium transition-colors cursor-pointer ${
                level === "beginner"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Beginner
            </button>
            <button
              onClick={() => setLevel("advanced")}
              className={`px-2 py-0.5 text-[11px] rounded font-medium transition-colors cursor-pointer ${
                level === "advanced"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Advanced
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-3 text-xs">
        {/* Core Description */}
        <p className="text-muted-foreground leading-relaxed">
          {stepState.description}
        </p>

        {/* Pedagogical Explanation */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-foreground text-[11px]">
            {level === "beginner" ? (
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            ) : (
              <BookOpen className="h-3.5 w-3.5 text-primary" />
            )}
            <span>{level === "beginner" ? "What is happening here?" : "Protocol & Standard Analysis"}</span>
          </div>
          <p className="text-foreground/90 text-xs leading-relaxed">
            {level === "beginner" ? exp.beginner : exp.advanced}
          </p>
        </div>

        {/* Protocol Rule Callout */}
        <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/50 space-y-1">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1">
            <AlertCircle className="h-3 w-3 text-amber-400" /> IEEE Protocol Rule
          </span>
          <p className="font-mono text-[11px] text-foreground">
            {exp.protocolRule}
          </p>
        </div>

        {/* Tie-breaker callout if applicable */}
        {exp.tieBreakerUsed && (
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Tie-Breaker Decision
            </span>
            <p className="text-xs text-foreground font-mono">
              {exp.tieBreakerUsed}
            </p>
          </div>
        )}

        {/* Port Status Summary Pill */}
        <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40">
          <div className="flex items-center gap-2">
            <span>Root Ports: <strong className="text-cyan-400 font-mono">{stepState.rootPortIds.length}</strong></span>
            <span>·</span>
            <span>Designated Ports: <strong className="text-emerald-400 font-mono">{stepState.designatedPortIds.length}</strong></span>
            <span>·</span>
            <span>Blocked Ports: <strong className="text-amber-400 font-mono">{stepState.blockedPortIds.length}</strong></span>
          </div>
          <div>
            {stepState.loopActive ? (
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" /> Unconverged Loop
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Loop-Free Spanning Tree
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Sparkles,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Tag,
  Zap,
} from "lucide-react";
import { Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import type { ArpSimulationStepState } from "@/features/protocols/arp/arp.types";

interface ArpEventDetailsProps {
  stepState?: ArpSimulationStepState;
  currentStepIndex: number;
  totalSteps: number;
}

export function ArpEventDetails({
  stepState,
  currentStepIndex,
  totalSteps,
}: ArpEventDetailsProps) {
  const [level, setLevel] = useState<"beginner" | "advanced">("beginner");

  if (!stepState) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-border bg-card/40 text-center text-xs text-muted-foreground">
        Select or play a step to see step-by-step ARP transaction explanations.
      </div>
    );
  }

  const exp = stepState.eventExplanation;
  const isPoisoned = (stepState.poisonedNodeIds || []).length > 0;

  return (
    <Card className="border-border bg-card/70 backdrop-blur-sm shadow-sm">
      <CardHeader className="p-3 pb-2 border-b border-border/50">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono">
              Step {currentStepIndex + 1} of {totalSteps}
            </Badge>
            <CardTitle className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" />
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
        {/* Step Summary Description */}
        <p className="text-muted-foreground leading-relaxed">
          {stepState.description}
        </p>

        {/* Pedagogical Explanation Box */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-foreground text-[11px]">
            {level === "beginner" ? (
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            ) : (
              <BookOpen className="h-3.5 w-3.5 text-primary" />
            )}
            <span>
              {level === "beginner"
                ? "What is happening here?"
                : "RFC Protocol & Ethernet Standard Breakdown"}
            </span>
          </div>
          <p className="text-foreground/90 text-xs leading-relaxed">
            {level === "beginner" ? exp.beginner : exp.advanced}
          </p>
        </div>

        {/* RFC Rule Box */}
        <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/50 space-y-1">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1">
            <AlertCircle className="h-3 w-3 text-amber-400" /> RFC Protocol Rule
          </span>
          <p className="font-mono text-[11px] text-foreground">
            {exp.protocolRule}
          </p>
        </div>

        {/* Fields Changed Badges */}
        {exp.fieldsChanged && exp.fieldsChanged.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1 font-semibold">
              <Tag className="h-2.5 w-2.5" /> State Mutated:
            </span>
            {exp.fieldsChanged.map((field) => (
              <span
                key={field}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-secondary text-primary border border-border"
              >
                {field}
              </span>
            ))}
          </div>
        )}

        {/* Status Bar */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40">
          <div className="flex items-center gap-2">
            <span>
              Active Links: <strong className="text-primary font-mono">{stepState.activeLinkIds?.length || 0}</strong>
            </span>
            <span>·</span>
            <span>
              Broadcast Links: <strong className="text-amber-400 font-mono">{stepState.broadcastLinkIds?.length || 0}</strong>
            </span>
          </div>
          <div>
            {isPoisoned ? (
              <span className="text-red-400 font-semibold flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5 animate-pulse" /> Cache Poisoned
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Normal / Secure Operation
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

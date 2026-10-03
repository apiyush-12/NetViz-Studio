"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  BookOpen,
  Info,
  Sparkles,
  ArrowRight,
  Terminal,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Tabs } from "@/components/ui";
import type { IsisSimulationStepState } from "@/features/protocols/isis/isis.types";

interface IsisEventDetailsProps {
  stepState?: IsisSimulationStepState;
}

export function IsisEventDetails({ stepState }: IsisEventDetailsProps) {
  const [pedagogyTrack, setPedagogyTrack] = useState<string>("beginner");

  if (!stepState) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-6 text-center text-xs text-muted-foreground">
          Select or play a step to see real-time IS-IS protocol state transitions, SPF calculations, and pedagogical explanations.
        </CardContent>
      </Card>
    );
  }

  const { title, description, eventExplanation, cliOutputs } = stepState;

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="py-3 px-4 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                {title}
              </CardTitle>
              <span className="text-[11px] text-muted-foreground line-clamp-1">
                {description}
              </span>
            </div>
          </div>

          {/* Dual-Track Switcher */}
          <Tabs
            value={pedagogyTrack}
            onValueChange={setPedagogyTrack}
            tabs={[
              { id: "beginner", label: "Beginner Track" },
              { id: "advanced", label: "RFC Deep Dive" },
            ]}
          />
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3.5 text-xs">
        {/* Dynamic Track Explanation */}
        <div className="p-3 rounded-lg bg-secondary/20 border border-border/50 space-y-2">
          <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
            {pedagogyTrack === "beginner" ? (
              <>
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Intuitive Concept & Physical Analogy</span>
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 text-emerald-400" />
                <span>ISO/IEC 10589 & IETF RFC Technical Deep Dive</span>
              </>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed text-xs">
            {pedagogyTrack === "beginner"
              ? eventExplanation.beginner
              : eventExplanation.advanced}
          </p>
        </div>

        {/* Protocol Rule Badge */}
        {eventExplanation.protocolRule && (
          <div className="flex items-start gap-2 p-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <Info className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-[11px] uppercase tracking-wider block text-emerald-400">
                IS-IS Protocol Rule & Standard:
              </span>
              <span className="text-xs">{eventExplanation.protocolRule}</span>
            </div>
          </div>
        )}

        {/* Fields / States Changed Deltas */}
        {eventExplanation.fieldsChanged && eventExplanation.fieldsChanged.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Simulation State Deltas & Metric Changes:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono">
              {eventExplanation.fieldsChanged.map((change, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 p-2 rounded bg-card border border-border/60 text-[11px]"
                >
                  <ArrowRight className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="text-foreground">{change}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Router Console Preview if present */}
        {cliOutputs && cliOutputs.length > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-border/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-blue-400" />
                Live Router Console ({cliOutputs.length} event{cliOutputs.length > 1 ? "s" : ""})
              </span>
              <Badge variant="outline" className="font-mono text-[9px]">
                syslog / vty
              </Badge>
            </div>
            <div className="p-2.5 rounded-lg bg-black/80 border border-border/50 font-mono text-[11px] text-emerald-400/90 space-y-1">
              {cliOutputs.slice(0, 3).map((line, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-muted-foreground select-none">[{line.nodeId ? line.nodeId.toUpperCase() : "ISIS"}]</span>
                  <span className={line.level === "warning" ? "text-amber-300" : line.level === "error" ? "text-rose-400" : "text-emerald-300"}>
                    {line.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

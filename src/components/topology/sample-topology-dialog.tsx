"use client";

import React from "react";
import { useTopologyStore } from "@/features/topology/topology-store";
import { SAMPLE_TOPOLOGIES } from "@/data/sample-topologies";
import { Button } from "@/components/ui";
import { BookOpen, X, ArrowRight } from "lucide-react";

export function SampleTopologyDialog() {
  const { isSampleDialogOpen, setSampleDialogOpen, loadSampleTopology } = useTopologyStore();

  if (!isSampleDialogOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-base text-foreground">Ready-Made Sample Network Labs</h3>
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setSampleDialogOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {SAMPLE_TOPOLOGIES.map((sample) => (
            <div
              key={sample.id}
              onClick={() => loadSampleTopology(sample.id)}
              className="rounded-lg border border-border p-4 bg-accent/20 hover:bg-accent/60 hover:border-primary/50 transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                  {sample.name}
                </h4>
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-primary">
                  Load Lab <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">{sample.description}</p>

              <div className="rounded bg-accent/40 p-2 text-[11px] space-y-1">
                <p><span className="font-semibold text-foreground">Learning Objective:</span> {sample.learningObjective}</p>
                <p><span className="font-semibold text-foreground">Suggested Test:</span> {sample.suggestedSimulation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

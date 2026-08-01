"use client";

import React from "react";
import { Eye, Sliders, GitBranch, Wrench, CheckCircle2, BookOpen } from "lucide-react";

const WORKFLOW_STAGES = [
  { stage: "Observe", text: "Watch a prepared simulation step-by-step.", icon: Eye, color: "text-blue-400 border-blue-500/30" },
  { stage: "Experiment", text: "Change settings, protocol parameters, and compare outcomes.", icon: Sliders, color: "text-purple-400 border-purple-500/30" },
  { stage: "Configure", text: "Build custom topologies, interfaces, and static routes.", icon: GitBranch, color: "text-emerald-400 border-emerald-500/30" },
  { stage: "Troubleshoot", text: "Diagnose and repair intentionally broken network scenarios.", icon: Wrench, color: "text-amber-400 border-amber-500/30" },
  { stage: "Validate", text: "Receive real-time automated task validation feedback.", icon: CheckCircle2, color: "text-green-400 border-green-500/30" },
  { stage: "Review", text: "Study complete packet event timelines and final explanations.", icon: BookOpen, color: "text-cyan-400 border-cyan-500/30" },
];

export function LearningWorkflow() {
  return (
    <section className="py-16 md:py-24 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-mono uppercase tracking-widest text-primary font-bold">Tailored Learning Progression</p>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Designed for every learning style
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Whether you prefer watching prepared simulations or building complex multi-router topologies from scratch.
          </p>
        </div>

        {/* 6-Stage Progression Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {WORKFLOW_STAGES.map((ws, i) => {
            const Icon = ws.icon;
            return (
              <div
                key={ws.stage}
                className="p-4 rounded-xl border border-border bg-card/80 space-y-2 hover:border-primary/50 transition-all text-center flex flex-col items-center justify-between"
              >
                <div className="space-y-2">
                  <div className={`h-10 w-10 rounded-xl border flex items-center justify-center bg-secondary/50 ${ws.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">Stage {i + 1}</span>
                  <h3 className="text-sm font-bold text-foreground">{ws.stage}</h3>
                </div>

                <p className="text-[11px] text-muted-foreground pt-2 border-t border-border/50 leading-snug">
                  {ws.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

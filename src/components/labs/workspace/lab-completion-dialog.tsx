"use client";

import React from "react";
import Link from "next/link";
import { useLabStore } from "@/features/labs/lab-store";
import { Button, Badge } from "@/components/ui";
import { Award, CheckCircle2, Sparkles, ArrowRight, RotateCcw } from "lucide-react";

export function LabCompletionDialog() {
  const { currentLab, progress, isCompletionDialogOpen, setCompletionDialogOpen, resetLabProgress } = useLabStore();

  if (!isCompletionDialogOpen || !currentLab || !progress) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mx-auto ring-8 ring-emerald-500/5">
          <Award className="h-8 w-8 animate-bounce" />
        </div>

        <div className="space-y-1">
          <Badge variant="success" className="text-xs uppercase font-mono tracking-wider">
            Lab Completed!
          </Badge>
          <h2 className="font-bold text-2xl text-foreground">{currentLab.title}</h2>
          <p className="text-xs text-muted-foreground">Great job! You have completed all required objectives in this lab.</p>
        </div>

        <div className="grid grid-cols-3 gap-3 bg-accent/40 rounded-xl p-3 border border-border text-xs">
          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">Final Score</p>
            <p className="text-lg font-bold text-purple-400">{progress.score} pts</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">Time Taken</p>
            <p className="text-lg font-bold text-foreground">{formatTime(progress.elapsedSeconds)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">Tasks Done</p>
            <p className="text-lg font-bold text-emerald-400">{progress.completedTaskIds.length}</p>
          </div>
        </div>

        {currentLab.learningObjectives.length > 0 && (
          <div className="text-left space-y-2 bg-card/60 p-3 rounded-lg border border-border/60">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Key Concepts Mastered:
            </h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {currentLab.learningObjectives.slice(0, 3).map((obj, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              resetLabProgress(currentLab.id);
              setCompletionDialogOpen(false);
            }}
            className="gap-1.5"
          >
            <RotateCcw className="h-4 w-4" /> Retry Lab
          </Button>

          <Link href="/labs">
            <Button size="sm" variant="default" onClick={() => setCompletionDialogOpen(false)} className="gap-1.5">
              Continue to Labs Dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

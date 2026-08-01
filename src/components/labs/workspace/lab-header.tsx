"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useLabStore } from "@/features/labs/lab-store";
import { Button, Badge } from "@/components/ui";
import { ArrowLeft, Clock, RotateCcw, Award } from "lucide-react";

export function LabHeader() {
  const { currentLab, progress, elapsedSeconds, tickTimer, resetLabProgress } = useLabStore();

  useEffect(() => {
    const timer = setInterval(() => tickTimer(), 1000);
    return () => clearInterval(timer);
  }, [tickTimer]);

  if (!currentLab || !progress) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const completedCount = progress.completedTaskIds.length;
  const totalTasks = currentLab.tasks.length;
  const percent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between gap-3 shadow-sm z-30 shrink-0 select-none">
      <div className="flex items-center gap-3">
        <Link href={`/labs/${currentLab.id}`}>
          <Button size="icon" variant="ghost" className="h-8 w-8" title="Exit to Lab Details">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-sm text-foreground">{currentLab.title}</h2>
            <Badge variant="outline" className="text-[10px] capitalize">
              {currentLab.difficulty}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground hidden sm:block">
            {completedCount}/{totalTasks} Tasks Completed ({percent}%)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-accent/50 border border-border px-2.5 py-1 rounded text-xs font-mono">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{formatTime(elapsedSeconds)}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/30 px-2.5 py-1 rounded text-xs font-mono text-purple-400">
          <Award className="h-3.5 w-3.5" />
          <span>{progress.score} pts</span>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs gap-1"
          onClick={() => {
            if (confirm("Reset lab progress and restart initial state?")) {
              resetLabProgress(currentLab.id);
            }
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </Button>
      </div>
    </header>
  );
}

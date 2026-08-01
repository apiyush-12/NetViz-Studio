"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui";
import { Award, CheckCircle2, Clock, Zap } from "lucide-react";
import { loadAllLabProgress } from "@/features/labs/lab-persistence";
import { labRegistry } from "@/features/labs/lab-registry";

export function ProgressSummary() {
  const allProgress = loadAllLabProgress();
  const allLabs = labRegistry.getAllLabs();

  const totalLabs = allLabs.length;
  const completedLabs = Object.values(allProgress).filter((p) => p.status === "completed").length;
  const inProgressLabs = Object.values(allProgress).filter((p) => p.status === "in-progress").length;

  const totalSeconds = Object.values(allProgress).reduce((acc, p) => acc + (p.elapsedSeconds || 0), 0);
  const totalMinutes = Math.round(totalSeconds / 60);
  const totalScore = Object.values(allProgress).reduce((acc, p) => acc + (p.score || 0), 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="bg-card/70 border-border">
        <CardContent className="p-3.5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">Completed</p>
            <p className="text-base font-bold text-foreground">
              {completedLabs} / {totalLabs}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/70 border-border">
        <CardContent className="p-3.5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">In Progress</p>
            <p className="text-base font-bold text-foreground">{inProgressLabs}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/70 border-border">
        <CardContent className="p-3.5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">Time Spent</p>
            <p className="text-base font-bold text-foreground">{totalMinutes} mins</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/70 border-border">
        <CardContent className="p-3.5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">Total Points</p>
            <p className="text-base font-bold text-foreground">{totalScore} pts</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

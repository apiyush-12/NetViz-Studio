"use client";

import React from "react";
import Link from "next/link";
import { NetworkLab, LabProgress } from "@/features/labs/lab-types";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { Clock, CheckCircle2, Play, Zap } from "lucide-react";

interface LabCardProps {
  lab: NetworkLab;
  progress?: LabProgress;
}

export function LabCard({ lab, progress }: LabCardProps) {
  const isCompleted = progress?.status === "completed";
  const isInProgress = progress?.status === "in-progress";

  const completedCount = progress?.completedTaskIds.length || 0;
  const totalTasks = lab.tasks.length;
  const percent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const difficultyVariant =
    lab.difficulty === "beginner"
      ? "success"
      : lab.difficulty === "intermediate"
      ? "warning"
      : "destructive";

  return (
    <Card className="flex flex-col h-full hover:border-primary/50 transition-all hover:shadow-md group">
      <CardContent className="p-4 flex flex-col justify-between flex-1 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Badge variant={difficultyVariant} className="text-[10px] capitalize">
              {lab.difficulty}
            </Badge>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
              <Clock className="h-3 w-3" />
              <span>{lab.estimatedMinutes}m</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {lab.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{lab.description}</p>
          </div>

          <div className="flex flex-wrap gap-1 pt-1">
            <Badge variant="outline" className="text-[9px] uppercase font-mono">
              {lab.type}
            </Badge>
            {lab.protocols.slice(0, 3).map((proto) => (
              <Badge key={proto} variant="secondary" className="text-[9px] font-mono">
                {proto}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-border/50">
          {isInProgress && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                <span>Progress</span>
                <span>{percent}%</span>
              </div>
              <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${percent}%` }} />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground">
              {totalTasks} {totalTasks === 1 ? "Task" : "Tasks"}
            </span>

            <Link href={`/labs/${lab.id}`}>
              <Button size="sm" variant={isCompleted ? "outline" : isInProgress ? "default" : "secondary"} className="h-7 text-xs gap-1">
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Review
                  </>
                ) : isInProgress ? (
                  <>
                    <Play className="h-3.5 w-3.5" /> Continue
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5" /> Start
                  </>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

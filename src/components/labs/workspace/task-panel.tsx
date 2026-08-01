"use client";

import React, { useState } from "react";
import { useLabStore } from "@/features/labs/lab-store";
import { Button, Badge, Input, Label, ScrollArea } from "@/components/ui";
import { CheckCircle2, XCircle, Lightbulb, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function TaskPanel() {
  const { currentLab, progress, activeTaskId, setActiveTask, validateTask, revealNextHint, revealedHintLevels } =
    useLabStore();

  const [userInputs, setUserInputs] = useState<Record<string, string>>({});

  if (!currentLab || !progress) return null;

  const activeTask = currentLab.tasks.find((t) => t.id === activeTaskId) || currentLab.tasks[0];
  if (!activeTask) return null;

  const isCompleted = progress.completedTaskIds.includes(activeTask.id);
  const result = useLabStore.getState().taskValidationResults[activeTask.id];
  const revealedLevel = revealedHintLevels[activeTask.id] || 0;

  const handleCheckAnswer = () => {
    const inputVal = userInputs[activeTask.id];
    validateTask(activeTask.id, inputVal);
  };

  return (
    <aside className="w-80 border-r border-border bg-card flex flex-col h-full z-10 shrink-0 select-none">
      {/* Tasks List Header */}
      <div className="p-3 border-b border-border bg-accent/30 space-y-2">
        <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">Tasks Overview</h3>
        <div className="flex flex-wrap gap-1">
          {currentLab.tasks.map((task, index) => {
            const completed = progress.completedTaskIds.includes(task.id);
            const active = task.id === activeTask.id;

            return (
              <button
                key={task.id}
                onClick={() => setActiveTask(task.id)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold transition-all",
                  completed
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : active
                    ? "bg-primary text-primary-foreground shadow"
                    : "bg-accent text-muted-foreground hover:text-foreground"
                )}
              >
                {completed ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Task Details */}
      <ScrollArea className="flex-1 p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-[10px] uppercase font-mono">
              Task {activeTask.order} of {currentLab.tasks.length}
            </Badge>
            <span className="text-[11px] font-mono text-purple-400 font-semibold">+{activeTask.points} pts</span>
          </div>

          <h3 className="font-semibold text-base text-foreground leading-snug">{activeTask.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{activeTask.instruction}</p>
        </div>

        {/* Task Input (MCQ / Text / Numeric) */}
        {activeTask.type === "answer-mcq" && activeTask.mcqOptions && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <Label className="text-xs font-semibold">Select your answer:</Label>
            <div className="space-y-1.5 pt-1">
              {activeTask.mcqOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setUserInputs({ ...userInputs, [activeTask.id]: opt })}
                  className={cn(
                    "w-full text-left p-2.5 rounded-lg border text-xs transition-all",
                    userInputs[activeTask.id] === opt
                      ? "border-primary bg-primary/10 text-foreground font-medium"
                      : "border-border bg-card/60 text-muted-foreground hover:bg-accent"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {(activeTask.type === "answer-text" || activeTask.type === "answer-numeric") && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <Label className="text-xs font-semibold">Enter your answer:</Label>
            <Input
              value={userInputs[activeTask.id] || ""}
              onChange={(e) => setUserInputs({ ...userInputs, [activeTask.id]: e.target.value })}
              placeholder="Type answer..."
              className="h-9 text-xs"
            />
          </div>
        )}

        {/* Feedback Message */}
        {result && (
          <div
            className={cn(
              "rounded-lg border p-3 text-xs space-y-1 mt-2",
              result.passed
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            )}
          >
            <div className="flex items-center gap-1.5 font-semibold">
              {result.passed ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
              <span>{result.passed ? "Task Completed!" : "Check Failed"}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-foreground/90">{result.message}</p>
          </div>
        )}

        {/* Progressive hints */}
        {activeTask.hints && activeTask.hints.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Lightbulb className="h-3.5 w-3.5 text-amber-400" /> Hints ({revealedLevel}/{activeTask.hints.length})
              </span>
              {revealedLevel < activeTask.hints.length && (
                <button
                  onClick={() => revealNextHint(activeTask.id)}
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  Reveal Hint
                </button>
              )}
            </div>

            {activeTask.hints.slice(0, revealedLevel).map((hint) => (
              <div key={hint.id} className="rounded border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-300">
                <span className="font-semibold block text-[10px] uppercase text-amber-400 mb-0.5">Hint Level {hint.level}</span>
                {hint.content}
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4">
          <Button
            size="default"
            variant={isCompleted ? "outline" : "default"}
            onClick={handleCheckAnswer}
            className="w-full h-9 text-xs gap-1.5 font-semibold"
          >
            {isCompleted ? <Check className="h-4 w-4 text-emerald-400" /> : <ArrowRight className="h-4 w-4" />}
            {isCompleted ? "Re-validate Task" : "Check Answer & Continue"}
          </Button>
        </div>
      </ScrollArea>
    </aside>
  );
}

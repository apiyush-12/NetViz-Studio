"use client";

import React from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-sidebar";
import { loadAllLabProgress } from "@/features/labs/lab-persistence";
import { labRegistry } from "@/features/labs/lab-registry";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { Award, ArrowLeft } from "lucide-react";

export default function LabProgressPage() {
  const allProgress = loadAllLabProgress();
  const attemptsList = Object.values(allProgress);

  return (
    <>
      <AppHeader title="My Lab Progress & Analytics" description="Track your completion stats, study time, scores, and topic mastery." />
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
        <Link href="/labs">
          <Button size="sm" variant="ghost" className="gap-1.5 text-xs">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>

        <h2 className="text-xl font-bold text-foreground">Attempted Labs History</h2>

        {attemptsList.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center space-y-3">
              <Award className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground text-sm">No lab attempts recorded yet. Start a lab from the dashboard!</p>
              <Link href="/labs">
                <Button size="sm" variant="default">
                  Explore Labs Catalog
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {attemptsList.map((prog) => {
              const lab = labRegistry.getLab(prog.labId);
              if (!lab) return null;

              return (
                <Card key={prog.labId} className="border-border bg-card">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={prog.status === "completed" ? "success" : "warning"} className="text-[10px] uppercase font-mono">
                          {prog.status}
                        </Badge>
                        <h4 className="font-semibold text-sm text-foreground">{lab.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Score: {prog.score} pts | Completed Tasks: {prog.completedTaskIds.length}/{lab.tasks.length}
                      </p>
                    </div>

                    <Link href={`/labs/${lab.id}`}>
                      <Button size="sm" variant="outline" className="text-xs">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

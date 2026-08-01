"use client";

import React, { use } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-sidebar";
import { labRegistry } from "@/features/labs/lab-registry";
import { getLabProgress } from "@/features/labs/lab-persistence";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { Clock, CheckCircle2, Play, Zap, ArrowLeft, BookOpen, Sparkles } from "lucide-react";

interface LabDetailPageProps {
  params: Promise<{ labId: string }>;
}

export default function LabDetailPage({ params }: LabDetailPageProps) {
  const { labId } = use(params);
  const lab = labRegistry.getLab(labId);

  if (!lab) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">Lab Not Found</h2>
        <p className="text-muted-foreground text-sm">The requested lab could not be found in the catalog.</p>
        <Link href="/labs">
          <Button variant="outline" size="sm">
            Back to Labs Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const progress = getLabProgress(lab.id);
  const isCompleted = progress?.status === "completed";
  const isInProgress = progress?.status === "in-progress";

  return (
    <>
      <AppHeader title={lab.title} description={lab.description} />
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        <Link href="/labs">
          <Button size="sm" variant="ghost" className="gap-1.5 text-xs">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>

        {/* Overview Header Card */}
        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant={lab.difficulty === "beginner" ? "success" : lab.difficulty === "intermediate" ? "warning" : "destructive"}>
                  {lab.difficulty}
                </Badge>
                <Badge variant="outline" className="uppercase font-mono text-[10px]">
                  {lab.type}
                </Badge>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                <Clock className="h-4 w-4 text-primary" />
                <span>{lab.estimatedMinutes} Mins</span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-foreground">{lab.title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{lab.description}</p>

            <div className="flex flex-wrap gap-2 pt-2">
              {lab.protocols.map((proto) => (
                <Badge key={proto} variant="secondary" className="font-mono text-xs">
                  {proto}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
              <Link href={`/labs/${lab.id}/run`}>
                <Button size="default" variant="default" className="gap-2 font-semibold">
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Review Lab Workspace
                    </>
                  ) : isInProgress ? (
                    <>
                      <Play className="h-4 w-4" /> Resume Lab Workspace
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" /> Start Lab Workspace
                    </>
                  )}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Learning Objectives & Skills */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" /> Learning Objectives
              </h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {lab.learningObjectives.map((obj, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" /> Prerequisites & Skills
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <p className="font-medium text-foreground mb-1">Prerequisites:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {lab.prerequisites.map((p, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Skills Trained:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {lab.skills.map((s, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { labRegistry } from "@/features/labs/lab-registry";
import { loadAllLabProgress } from "@/features/labs/lab-persistence";
import { LabCard } from "./lab-card";
import { LearningPathCard } from "./learning-path-card";
import { ProgressSummary } from "./progress-summary";
import { Input, Button, Badge } from "@/components/ui";
import { Search, Filter, BookOpen, Compass, Award, PlusCircle, ArrowRight } from "lucide-react";

export function LabsDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  const allLabs = labRegistry.getAllLabs();
  const learningPaths = labRegistry.getLearningPaths();
  const allProgress = loadAllLabProgress();

  const filteredLabs = allLabs.filter((lab) => {
    const matchesSearch =
      lab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.protocols.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDiff = selectedDifficulty === "all" || lab.difficulty === selectedDifficulty;
    const matchesType = selectedType === "all" || lab.type === selectedType;

    return matchesSearch && matchesDiff && matchesType;
  });

  const recentProgressEntry = Object.values(allProgress).find((p) => p.status === "in-progress");
  const recentLab = recentProgressEntry ? labRegistry.getLab(recentProgressEntry.labId) : null;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Interactive Networking Labs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Learn networking by configuring, simulating, testing, and troubleshooting real scenarios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/labs/progress">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Award className="h-4 w-4 text-purple-400" /> My Analytics
            </Button>
          </Link>
          <Link href="/labs/custom">
            <Button size="sm" variant="default" className="gap-1.5 text-xs">
              <PlusCircle className="h-4 w-4" /> Build Custom Lab
            </Button>
          </Link>
        </div>
      </div>

      {/* Progress Summary Cards */}
      <ProgressSummary />

      {/* Continue Learning Banner */}
      {recentLab && (
        <div className="rounded-xl border border-primary/40 bg-primary/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Badge variant="success" className="text-[10px] uppercase font-mono">
              In Progress
            </Badge>
            <h3 className="font-semibold text-base text-foreground">{recentLab.title}</h3>
            <p className="text-xs text-muted-foreground">{recentLab.description}</p>
          </div>
          <Link href={`/labs/${recentLab.id}/run`}>
            <Button size="sm" variant="default" className="gap-1.5 font-semibold text-xs shrink-0">
              Resume Lab <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* Learning Paths */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-base text-foreground">Guided Learning Paths</h2>
          </div>
          <span className="text-xs text-muted-foreground">{learningPaths.length} Guided Paths</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {learningPaths.slice(0, 3).map((path) => (
            <LearningPathCard key={path.id} path={path} />
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4 pt-2 border-t border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-base text-foreground">All Networking Labs ({filteredLabs.length})</h2>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search labs, protocols, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <div className="flex items-center gap-1 bg-accent/60 p-1 rounded-lg text-xs">
              <Filter className="h-3.5 w-3.5 text-muted-foreground ml-1 mr-1" />
              {["all", "beginner", "intermediate", "advanced"].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium capitalize transition-colors ${
                    selectedDifficulty === diff ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-accent/60 p-1 rounded-lg text-xs hidden md:flex">
              {["all", "guided", "troubleshooting", "challenge"].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium capitalize transition-colors ${
                    selectedType === type ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Labs Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLabs.map((lab) => (
          <LabCard key={lab.id} lab={lab} progress={allProgress[lab.id]} />
        ))}
      </div>
    </div>
  );
}

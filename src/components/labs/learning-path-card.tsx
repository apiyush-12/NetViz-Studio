"use client";

import React from "react";
import { LearningPath } from "@/data/learning-paths";
import { Card, CardContent, Badge } from "@/components/ui";
import { BookOpen, Clock } from "lucide-react";

interface LearningPathCardProps {
  path: LearningPath;
}

export function LearningPathCard({ path }: LearningPathCardProps) {
  return (
    <Card className="flex flex-col justify-between border-border bg-card/80 hover:border-primary/50 transition-all hover:shadow-md cursor-pointer group">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-[10px]">
            {path.skillLevel}
          </Badge>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
            <Clock className="h-3 w-3" />
            <span>{path.estimatedHours}h</span>
          </div>
        </div>

        <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
          {path.title}
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-2">{path.description}</p>

        <div className="flex items-center gap-2 pt-2 text-xs font-medium text-primary">
          <BookOpen className="h-3.5 w-3.5" />
          <span>{path.labIds.length} Guided Labs</span>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  BookOpen,
  Info,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Tabs } from "@/components/ui";
import type { MplsSimulationStepState } from "@/features/protocols/mpls/mpls.types";

interface MplsEventDetailsProps {
  stepState?: MplsSimulationStepState;
}

export function MplsEventDetails({ stepState }: MplsEventDetailsProps) {
  const [pedagogyTrack, setPedagogyTrack] = useState<string>("beginner");

  if (!stepState) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-6 text-center text-xs text-muted-foreground">
          Select or play a step to see real-time step explanations.
        </CardContent>
      </Card>
    );
  }

  const { title, description, eventExplanation } = stepState;

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="py-3 px-4 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                {title}
              </CardTitle>
              <span className="text-[11px] text-muted-foreground line-clamp-1">
                {description}
              </span>
            </div>
          </div>

          {/* Beginner vs Advanced Mode Switcher */}
          <Tabs
            value={pedagogyTrack}
            onValueChange={setPedagogyTrack}
            tabs={[
              { id: "beginner", label: "Beginner Track" },
              { id: "advanced", label: "RFC Deep Dive" },
            ]}
          />
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3.5 text-xs">
        {/* Dynamic Track Explanation */}
        <div className="p-3 rounded-lg bg-secondary/20 border border-border/50 space-y-2">
          <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
            {pedagogyTrack === "beginner" ? (
              <>
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Intuitive Physical Analogy</span>
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 text-blue-400" />
                <span>RFC 3031 / RFC 3032 Technical Specification</span>
              </>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed text-xs">
            {pedagogyTrack === "beginner"
              ? eventExplanation.beginner
              : eventExplanation.advanced}
          </p>
        </div>

        {/* Protocol Rule Badge */}
        {eventExplanation.protocolRule && (
          <div className="flex items-start gap-2 p-2.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300">
            <Info className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-[11px] uppercase tracking-wider block text-blue-400">
                MPLS Protocol Rule:
              </span>
              <span className="text-xs">{eventExplanation.protocolRule}</span>
            </div>
          </div>
        )}

        {/* State / Header Deltas */}
        {eventExplanation.fieldsChanged && eventExplanation.fieldsChanged.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Packet & Label Stack Transformation:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {eventExplanation.fieldsChanged.map((change, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-[11px] bg-secondary/40 text-foreground border-border/60 font-mono py-0.5 px-2"
                >
                  {change}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

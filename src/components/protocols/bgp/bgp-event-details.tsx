"use client";

import React from "react";
import { Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import type { SimulationEvent } from "@/features/simulation/simulation-types";

interface BgpEventDetailsProps {
  event: SimulationEvent | null;
  mode: "beginner" | "advanced";
}

export function BgpEventDetails({ event, mode }: BgpEventDetailsProps) {
  if (!event) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm">BGP Event Inspector</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Select an event from the timeline to see step-by-step BGP message and policy breakdowns.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="default" className="text-[10px]">
            {event.type.replace(/-/g, " ")}
          </Badge>
          <span className="text-xs font-mono text-muted-foreground">{event.timestamp}ms</span>
        </div>
        <CardTitle className="text-sm mt-1">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div>
          <span className="font-semibold text-primary block mb-0.5">What Happened?</span>
          <p className="text-muted-foreground leading-relaxed">{event.description}</p>
        </div>

        <div>
          <span className="font-semibold text-primary block mb-0.5">BGP Policy Rule</span>
          <p className="text-muted-foreground leading-relaxed">
            {mode === "advanced"
              ? "RFC 4271 specifies Border Gateway Protocol path attribute validation, AS_PATH loop detection, and policy-driven Loc-RIB path selection."
              : "BGP autonomously advertises prefixes and selects the best path based on administrative policy rather than physical link distance."}
          </p>
        </div>

        {event.payload && (
          <div className="p-2.5 bg-secondary/50 rounded-lg border border-border space-y-1 font-mono text-[11px]">
            <span className="text-muted-foreground block font-sans font-semibold">Event Attributes</span>
            {Object.entries(event.payload).map(([k, v]) => (
              <div key={k} className="flex justify-between text-muted-foreground">
                <span>{k}:</span>
                <span className="text-foreground font-semibold">
                  {typeof v === "object" ? JSON.stringify(v) : String(v)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

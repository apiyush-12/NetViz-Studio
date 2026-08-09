"use client";

import React from "react";
import { Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import type { SimulationEvent } from "@/features/simulation/simulation-types";

interface OspfEventDetailsProps {
  event: SimulationEvent | null;
  mode: "beginner" | "advanced";
}

export function OspfEventDetails({ event, mode }: OspfEventDetailsProps) {
  if (!event) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm">OSPF Event Inspector</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Select a step or event from the timeline to inspect detailed protocol mechanics.
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
          <span className="font-semibold text-primary block mb-0.5">OSPF Protocol Rule</span>
          <p className="text-muted-foreground leading-relaxed">
            {mode === "advanced"
              ? "RFC 2328 specifies OSPF protocol state synchronization, link-state advertisement (LSA) flooding, and Shortest Path First (SPF) tree computation."
              : "OSPF routers dynamically maintain topology awareness by exchanging Hello packets and Link-State updates."}
          </p>
        </div>

        {event.payload && (
          <div className="p-2.5 bg-secondary/50 rounded-lg border border-border space-y-1 font-mono text-[11px]">
            <span className="text-muted-foreground block font-sans font-semibold">Event Parameters</span>
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

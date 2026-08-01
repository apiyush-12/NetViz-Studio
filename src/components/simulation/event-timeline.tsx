"use client";

import { cn } from "@/lib/utils";
import { Badge, ScrollArea } from "@/components/ui";
import { useSimulationStore } from "@/features/simulation/simulation-store";
import type { EventSeverity } from "@/features/simulation/simulation-types";

const severityVariant: Record<EventSeverity, "default" | "success" | "warning" | "destructive"> = {
  info: "default",
  success: "success",
  warning: "warning",
  error: "destructive",
};

export function EventTimeline() {
  const events = useSimulationStore((s) => s.events);
  const currentStep = useSimulationStore((s) => s.currentStep);
  const selectedEventId = useSimulationStore((s) => s.selectedEventId);
  const selectEvent = useSimulationStore((s) => s.selectEvent);

  return (
    <div className="border border-border rounded-lg bg-card flex flex-col h-full min-h-[200px]">
      <div className="px-3 py-2 border-b border-border">
        <h3 className="text-sm font-semibold">Event Timeline</h3>
        <p className="text-xs text-muted-foreground">{events.length} events</p>
      </div>
      <ScrollArea className="flex-1 max-h-[300px]">
        <div className="divide-y divide-border" role="list" aria-label="Simulation events">
          {events.map((event, index) => {
            const isActive = index === currentStep;
            const isSelected = event.id === selectedEventId;
            return (
              <button
                key={event.id}
                role="listitem"
                onClick={() => selectEvent(event.id)}
                className={cn(
                  "w-full text-left px-3 py-2.5 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  isActive && "bg-accent/30",
                  isSelected && "border-l-2 border-l-primary bg-accent/20"
                )}
                aria-current={isSelected ? "true" : undefined}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-mono text-muted-foreground w-6">
                    {index + 1}
                  </span>
                  <Badge variant={severityVariant[event.severity]} className="text-[10px]">
                    {event.type.replace(/-/g, " ")}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground ml-auto font-mono">
                    {event.timestamp}ms
                  </span>
                </div>
                <p className="text-sm font-medium pl-8">{event.title}</p>
                <p className="text-xs text-muted-foreground pl-8 line-clamp-1">{event.description}</p>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

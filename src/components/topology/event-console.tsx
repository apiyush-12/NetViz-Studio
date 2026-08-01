"use client";

import React, { useState } from "react";
import { SimulationEvent } from "@/features/topology/topology-types";
import { Badge, ScrollArea } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Terminal, Filter } from "lucide-react";

interface EventConsoleProps {
  events: SimulationEvent[];
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
}

export function EventConsole({ events, currentStepIndex, onSelectStep }: EventConsoleProps) {
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const categories: Array<{ id: string; label: string }> = [
    { id: "all", label: "All Events" },
    { id: "application", label: "Application" },
    { id: "routing", label: "Routing" },
    { id: "ARP", label: "ARP" },
    { id: "switching", label: "Switching" },
    { id: "security", label: "Security/FW" },
    { id: "error", label: "Errors" },
  ];

  const filteredEvents = events.filter((e) => {
    if (filterCategory === "all") return true;
    return e.category.toLowerCase() === filterCategory.toLowerCase();
  });

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-lg overflow-hidden text-xs">
      {/* Console Header & Filters */}
      <div className="flex items-center justify-between border-b border-border bg-accent/40 px-3 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-foreground">Event Console Log ({events.length})</h4>
        </div>

        <div className="flex items-center gap-1">
          <Filter className="h-3 w-3 text-muted-foreground mr-1" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-medium transition-colors",
                filterCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground border border-border"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <ScrollArea className="flex-1 p-2">
        {filteredEvents.length === 0 ? (
          <p className="p-4 text-center italic text-muted-foreground">No simulation events recorded yet. Click &quot;Send Traffic&quot; or start simulation scenario.</p>
        ) : (
          <div className="space-y-1.5 font-mono">
            {filteredEvents.map((evt, idx) => {
              const isSelected = idx === currentStepIndex;

              return (
                <div
                  key={evt.id}
                  onClick={() => onSelectStep(idx)}
                  className={cn(
                    "flex flex-col gap-1 rounded-md border p-2 cursor-pointer transition-all",
                    isSelected ? "border-primary bg-primary/10 ring-1 ring-primary/40" : "border-border/60 bg-card/60 hover:bg-accent/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary text-[10px]">#{evt.stepNumber}</span>
                      <Badge variant={evt.status === "error" || evt.status === "dropped" ? "destructive" : "success"} className="text-[9px]">
                        {evt.protocol}
                      </Badge>
                      <span className="font-semibold text-foreground">{evt.summary}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-sans leading-relaxed">{evt.explanation}</p>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

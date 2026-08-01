"use client";

import React from "react";
import { CAPABILITY_ITEMS } from "@/features/landing/landing-content";
import {
  Play,
  StepForward,
  Clock,
  Search,
  GitCommit,
  AlertTriangle,
  Database,
  Route,
  Calculator,
  Binary,
  GitBranch,
  CheckSquare,
  CheckCircle2,
  Zap,
  Bookmark,
  Smartphone,
  SunMoon,
  Eye,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Play,
  StepForward,
  Clock,
  Search,
  GitCommit,
  AlertTriangle,
  Database,
  Route,
  Calculator,
  Binary,
  GitBranch,
  CheckSquare,
  CheckCircle2,
  Zap,
  Bookmark,
  Smartphone,
  SunMoon,
  Eye,
};

export function CapabilitiesGrid() {
  return (
    <section className="py-16 md:py-24 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-mono uppercase tracking-widest text-primary font-bold">Feature Inventory</p>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Complete Platform Capabilities
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            A compact overview of the simulation controls, protocol inspection engines, and interactive learning tools built into NetViz Studio.
          </p>
        </div>

        {/* 18 Capabilities Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CAPABILITY_ITEMS.map((cap) => {
            const Icon = iconMap[cap.iconName] || CheckCircle2;
            return (
              <div
                key={cap.id}
                className="p-3.5 rounded-xl border border-border bg-card/80 space-y-2 hover:border-primary/50 transition-all"
              >
                <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-bold text-foreground truncate">{cap.title}</h3>
                <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">{cap.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

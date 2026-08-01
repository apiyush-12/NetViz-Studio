"use client";

import React from "react";
import { Badge } from "@/components/ui";
import { LayoutDashboard, FlaskConical, GitBranch, Layers } from "lucide-react";

export function DashboardPreview() {
  return (
    <section className="py-16 md:py-24 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-mono uppercase tracking-widest text-primary font-bold">Personalized Workspace Preview</p>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Your centralized learning dashboard
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Here is a preview of the personal dashboard available to registered learners to manage topologies, progress, and simulations.
          </p>
        </div>

        {/* Dashboard Preview Interface Mockup */}
        <div className="p-6 md:p-8 rounded-3xl border border-border bg-card/90 shadow-2xl space-y-6 max-w-5xl mx-auto relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              <span className="font-bold text-sm text-foreground">Learner Workspace Dashboard</span>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
              Dashboard Marketing Preview
            </Badge>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Card 1: Continue Learning */}
            <div className="p-4 rounded-2xl border border-border bg-secondary/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <FlaskConical className="h-4 w-4 text-emerald-400" /> Continue Learning
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-semibold">Active</span>
              </div>
              <p className="font-semibold text-foreground text-sm">Lab 1: Local Network Communication</p>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-3/4" />
              </div>
              <p className="text-[10px] text-muted-foreground">Task 3 of 4 Completed (75%)</p>
            </div>

            {/* Card 2: Saved Topologies */}
            <div className="p-4 rounded-2xl border border-border bg-secondary/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <GitBranch className="h-4 w-4 text-purple-400" /> Saved Topologies
                </span>
                <span className="text-[10px] text-purple-400 font-mono font-semibold">2 Saved</span>
              </div>
              <p className="font-semibold text-foreground text-sm">3-Router OSPF Subnet Topology</p>
              <p className="text-[10px] text-muted-foreground">6 Devices • 5 Links • Last edited 2 hours ago</p>
            </div>

            {/* Card 3: Protocols Explored */}
            <div className="p-4 rounded-2xl border border-border bg-secondary/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-blue-400" /> Protocols Explored
                </span>
                <span className="text-[10px] text-blue-400 font-mono font-semibold">5 Explored</span>
              </div>
              <p className="font-semibold text-foreground text-sm">TCP 3-Way Handshake & Windowing</p>
              <p className="text-[10px] text-muted-foreground">Last simulation run: SYN → SYN-ACK → ACK</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

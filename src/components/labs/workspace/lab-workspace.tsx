"use client";

import React, { useEffect, useState } from "react";
import { useLabStore } from "@/features/labs/lab-store";
import { useTopologyStore } from "@/features/topology/topology-store";
import { LabHeader } from "./lab-header";
import { TaskPanel } from "./task-panel";
import { TopologyCanvas } from "@/components/topology/topology-canvas";
import { SimulationPanel } from "@/components/topology/simulation-panel";
import { ConfigurationInspector } from "@/components/topology/configuration-inspector";
import { LabConsole } from "./lab-console";
import { LabCompletionDialog } from "./lab-completion-dialog";
import { TrafficSenderDialog } from "@/components/topology/traffic-sender-dialog";
import { ValidationDrawer } from "@/components/topology/validation-drawer";
import { Button } from "@/components/ui";
import { Terminal, Activity, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface LabWorkspaceProps {
  labId: string;
}

export function LabWorkspace({ labId }: LabWorkspaceProps) {
  const { startOrResumeLab, currentLab } = useLabStore();
  const { selectedNodeId, setTrafficSenderOpen } = useTopologyStore();
  const [bottomTab, setBottomTab] = useState<"simulation" | "terminal">("terminal");

  useEffect(() => {
    startOrResumeLab(labId);
  }, [labId, startOrResumeLab]);

  if (!currentLab) {
    return <div className="p-8 text-center text-muted-foreground">Loading Lab Workspace...</div>;
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      <LabHeader />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Task Panel */}
        <TaskPanel />

        {/* Center Interactive Topology Workspace */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <div className="flex-1 relative">
            <TopologyCanvas />

            {/* Quick Action Overlay */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
              <Button
                size="sm"
                variant="default"
                className="h-8 text-xs gap-1 bg-emerald-600 hover:bg-emerald-500 shadow-lg"
                onClick={() => setTrafficSenderOpen(true)}
              >
                <Send className="h-3.5 w-3.5" />
                Send Traffic
              </Button>
            </div>
          </div>

          {/* Bottom Diagnostics / Simulation Panel */}
          <div className="h-64 border-t border-border bg-card flex flex-col shrink-0">
            <div className="flex items-center justify-between border-b border-border bg-accent/40 px-3 py-1.5 text-xs shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setBottomTab("terminal")}
                  className={cn(
                    "px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1.5",
                    bottomTab === "terminal" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Terminal className="h-3.5 w-3.5" /> Diagnostic Terminal
                </button>
                <button
                  onClick={() => setBottomTab("simulation")}
                  className={cn(
                    "px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1.5",
                    bottomTab === "simulation" ? "bg-purple-600 text-white" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Activity className="h-3.5 w-3.5" /> Simulation & Events
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              {bottomTab === "terminal" ? <LabConsole /> : <SimulationPanel />}
            </div>
          </div>
        </div>

        {/* Right Configuration Inspector */}
        {selectedNodeId && <ConfigurationInspector />}
      </div>

      <TrafficSenderDialog />
      <ValidationDrawer />
      <LabCompletionDialog />
    </div>
  );
}

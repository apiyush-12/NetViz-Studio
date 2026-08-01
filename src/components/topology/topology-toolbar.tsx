"use client";

import React from "react";
import { useTopologyStore } from "@/features/topology/topology-store";
import { injectFailure } from "@/features/topology/topology-actions";
import { Button, Badge } from "@/components/ui";
import {
  GitBranch,
  Play,
  RotateCcw,
  Undo2,
  Redo2,
  Wand2,
  Send,
  AlertTriangle,
  FileDown,
  FolderOpen,
  BookOpen,
  ShieldAlert,
} from "lucide-react";

export function TopologyToolbar() {
  const {
    mode,
    setMode,
    validationIssues,
    runValidation,
    autoAssignIps,
    undo,
    redo,
    canUndo,
    canRedo,
    setSampleDialogOpen,
    setSaveDialogOpen,
    setImportDialogOpen,
    setTrafficSenderOpen,
    setValidationDrawerOpen,
    resetTopology,
  } = useTopologyStore();

  const criticalCount = validationIssues.filter((i) => i.severity === "critical" || i.severity === "error").length;
  const warningCount = validationIssues.filter((i) => i.severity === "warning").length;

  return (
    <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between gap-2 shadow-sm z-30 shrink-0 select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-sm text-foreground hidden sm:block">Network Topology Lab</h2>
        </div>

        <div className="flex items-center rounded-lg border border-border bg-accent/40 p-0.5 text-xs">
          <button
            onClick={() => setMode("design")}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              mode === "design" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Design Mode
          </button>
          <button
            onClick={() => setMode("simulation")}
            className={`px-3 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
              mode === "simulation" ? "bg-purple-600 text-white shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Play className="h-3 w-3 fill-current" />
            Simulation Mode
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {mode === "design" && (
          <>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
              <Redo2 className="h-4 w-4" />
            </Button>
            <div className="h-4 w-px bg-border mx-1" />

            <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => autoAssignIps()}>
              <Wand2 className="h-3.5 w-3.5 text-primary" />
              Auto IP Subnetting
            </Button>
          </>
        )}

        <Button size="sm" variant="default" className="h-8 text-xs gap-1 bg-emerald-600 hover:bg-emerald-500" onClick={() => setTrafficSenderOpen(true)}>
          <Send className="h-3.5 w-3.5" />
          Send Traffic
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            runValidation();
            setValidationDrawerOpen(true);
          }}
          className="h-8 text-xs gap-1.5"
        >
          <AlertTriangle className={`h-4 w-4 ${criticalCount > 0 ? "text-red-400 animate-bounce" : warningCount > 0 ? "text-amber-400" : "text-emerald-400"}`} />
          <span>Issues</span>
          {criticalCount > 0 && <Badge variant="destructive">{criticalCount}</Badge>}
          {criticalCount === 0 && warningCount > 0 && <Badge variant="warning">{warningCount}</Badge>}
          {criticalCount === 0 && warningCount === 0 && <Badge variant="success">Clean</Badge>}
        </Button>

        {mode === "simulation" && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs text-red-400 border-red-500/30 hover:bg-red-500/10 gap-1"
            onClick={() => injectFailure("restore-all")}
            title="Restore all broken links and nodes"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Restore All Links
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1 hidden md:flex" onClick={() => setSampleDialogOpen(true)}>
          <BookOpen className="h-3.5 w-3.5" />
          Sample Labs
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1 hidden sm:flex" onClick={() => setSaveDialogOpen(true)}>
          <FileDown className="h-3.5 w-3.5" />
          Export JSON
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1 hidden sm:flex" onClick={() => setImportDialogOpen(true)}>
          <FolderOpen className="h-3.5 w-3.5" />
          Import JSON
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={resetTopology} title="Reset Canvas">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

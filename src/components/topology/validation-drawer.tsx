"use client";

import React from "react";
import { useTopologyStore } from "@/features/topology/topology-store";
import { Button, Badge } from "@/components/ui";
import { AlertCircle, AlertTriangle, CheckCircle2, Wand2, X } from "lucide-react";

export function ValidationDrawer() {
  const {
    isValidationDrawerOpen,
    setValidationDrawerOpen,
    validationIssues,
    autoFixIssue,
    selectNode,
    selectLink,
  } = useTopologyStore();

  if (!isValidationDrawerOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 border-l border-border bg-card shadow-2xl flex flex-col p-4 text-xs">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Topology Validation Drawer</h3>
        </div>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setValidationDrawerOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 py-3">
        {validationIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            <p className="font-semibold text-foreground text-sm">No Configuration Issues Found</p>
            <p className="text-muted-foreground">Your network topology configuration is clean and ready for simulation!</p>
          </div>
        ) : (
          validationIssues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => {
                if (issue.nodeId) selectNode(issue.nodeId);
                if (issue.linkId) selectLink(issue.linkId);
              }}
              className="rounded-lg border border-border bg-accent/20 p-3 space-y-2 cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {issue.severity === "critical" || issue.severity === "error" ? (
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  )}
                  <span className="font-semibold text-foreground">{issue.title}</span>
                </div>
                <Badge variant={issue.severity === "critical" ? "destructive" : issue.severity === "error" ? "destructive" : "warning"}>
                  {issue.severity.toUpperCase()}
                </Badge>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">{issue.description}</p>

              {issue.suggestedFix && (
                <div className="rounded bg-accent/40 p-2 text-[10px] text-foreground">
                  <span className="font-semibold text-primary">Fix: </span>
                  {issue.suggestedFix}
                </div>
              )}

              {issue.canAutoFix && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-7 text-[10px] gap-1 mt-1 text-primary border-primary/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    autoFixIssue(issue.id);
                  }}
                >
                  <Wand2 className="h-3 w-3" /> Auto-Fix Problem
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

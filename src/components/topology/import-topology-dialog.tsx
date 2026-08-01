"use client";

import React, { useState } from "react";
import { useTopologyStore } from "@/features/topology/topology-store";
import { deserializeTopology } from "@/features/topology/topology-serializer";
import { Button, Label } from "@/components/ui";
import { FolderOpen, X, AlertCircle } from "lucide-react";

export function ImportTopologyDialog() {
  const { isImportDialogOpen, setImportDialogOpen, loadTopology } = useTopologyStore();
  const [jsonInput, setJsonInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isImportDialogOpen) return null;

  const handleImport = () => {
    setErrorMessage(null);
    const result = deserializeTopology(jsonInput);
    if (result.success && result.topology) {
      loadTopology(result.topology);
      setImportDialogOpen(false);
    } else {
      setErrorMessage(result.error || "Failed to import JSON topology.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-base text-foreground">Import Topology JSON</h3>
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setImportDialogOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="text-[11px]">Paste Topology JSON Object</Label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste raw JSON topology contents here..."
            className="w-full h-48 rounded-md border border-input bg-background p-3 font-mono text-[10px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/30 p-2.5 text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={() => setImportDialogOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" variant="default" onClick={handleImport} disabled={!jsonInput.trim()} className="gap-1.5">
            <FolderOpen className="h-4 w-4" /> Import Topology
          </Button>
        </div>
      </div>
    </div>
  );
}

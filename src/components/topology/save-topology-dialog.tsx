"use client";

import React, { useState } from "react";
import { useTopologyStore } from "@/features/topology/topology-store";
import { serializeTopology } from "@/features/topology/topology-serializer";
import { Button, Label } from "@/components/ui";
import { FileDown, X, Copy, Check } from "lucide-react";

export function SaveTopologyDialog() {
  const { isSaveDialogOpen, setSaveDialogOpen, topology } = useTopologyStore();
  const [copied, setCopied] = useState(false);

  if (!isSaveDialogOpen) return null;

  const jsonStr = serializeTopology(topology);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topology.name.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <FileDown className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-base text-foreground">Export Topology JSON</h3>
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setSaveDialogOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="text-[11px]">JSON Topology Specification</Label>
          <textarea
            readOnly
            value={jsonStr}
            className="w-full h-48 rounded-md border border-input bg-accent/30 p-3 font-mono text-[10px] text-foreground focus:outline-none resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5">
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy JSON"}
          </Button>
          <Button size="sm" variant="default" onClick={handleDownload} className="gap-1.5">
            <FileDown className="h-4 w-4" /> Download File
          </Button>
        </div>
      </div>
    </div>
  );
}

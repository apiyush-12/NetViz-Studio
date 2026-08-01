"use client";

import React from "react";
import { NetworkNode } from "@/features/topology/topology-types";
import { Input, Label, Switch } from "@/components/ui";

interface GeneralTabProps {
  node: NetworkNode;
  onUpdate: (updates: Partial<NetworkNode>) => void;
}

export function GeneralTab({ node, onUpdate }: GeneralTabProps) {
  return (
    <div className="space-y-4 p-4 text-xs">
      <div className="space-y-1">
        <Label htmlFor="node-name">Device Name</Label>
        <Input
          id="node-name"
          value={node.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="node-type">Device Type</Label>
        <Input id="node-type" value={node.type} disabled className="bg-accent/40 cursor-not-allowed uppercase font-mono" />
      </div>

      <div className="space-y-1">
        <Label htmlFor="location-label">Location / Rack Label</Label>
        <Input
          id="location-label"
          placeholder="e.g. Rack-1, Floor-2, DataCenter-A"
          value={node.configuration.locationLabel || ""}
          onChange={(e) =>
            onUpdate({
              configuration: { ...node.configuration, locationLabel: e.target.value },
            })
          }
        />
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="space-y-0.5">
          <Label htmlFor="admin-state">Administrative Power State</Label>
          <p className="text-[10px] text-muted-foreground">Power device on or shut down completely</p>
        </div>
        <Switch
          id="admin-state"
          checked={node.configuration.administrativeState === "up"}
          onCheckedChange={(checked) =>
            onUpdate({
              status: checked ? "online" : "offline",
              configuration: { ...node.configuration, administrativeState: checked ? "up" : "down" },
            })
          }
        />
      </div>
    </div>
  );
}

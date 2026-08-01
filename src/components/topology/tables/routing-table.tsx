"use client";

import React from "react";
import { RoutingTableEntry } from "@/features/topology/topology-types";
import { Badge } from "@/components/ui";

export function RoutingTable({ entries }: { entries: RoutingTableEntry[] }) {
  if (!entries || entries.length === 0) {
    return <p className="p-3 text-xs text-muted-foreground italic text-center">Routing table is empty.</p>;
  }

  const sourceBadgeVariantMap: Record<RoutingTableEntry["source"], "default" | "secondary" | "success" | "warning" | "outline"> = {
    connected: "success",
    local: "secondary",
    static: "default",
    rip: "warning",
    ospf: "success",
    bgp: "outline",
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-border bg-accent/40 text-muted-foreground font-medium">
            <th className="p-2">Type</th>
            <th className="p-2">Prefix</th>
            <th className="p-2">Next Hop</th>
            <th className="p-2">Interface</th>
            <th className="p-2">AD/Metric</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
              <td className="p-2">
                <Badge variant={sourceBadgeVariantMap[entry.source]} className="text-[10px] uppercase">
                  {entry.source}
                </Badge>
              </td>
              <td className="p-2 font-mono font-medium text-foreground">
                {entry.destinationPrefix}/{entry.prefixLength}
              </td>
              <td className="p-2 font-mono text-muted-foreground">{entry.nextHop}</td>
              <td className="p-2 text-muted-foreground">{entry.exitInterfaceName}</td>
              <td className="p-2 font-mono text-muted-foreground">
                [{entry.administrativeDistance}/{entry.metric}]
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

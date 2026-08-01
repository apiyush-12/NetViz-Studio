"use client";

import React from "react";
import { BgpRouteEntry } from "@/features/topology/topology-types";
import { Badge } from "@/components/ui";

export function BgpTable({ routes }: { routes: BgpRouteEntry[] }) {
  if (!routes || routes.length === 0) {
    return <p className="p-3 text-xs text-muted-foreground italic text-center">BGP table is currently empty.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-border bg-accent/40 text-muted-foreground font-medium">
            <th className="p-2">Network</th>
            <th className="p-2">Next Hop</th>
            <th className="p-2">Metric</th>
            <th className="p-2">LocPref</th>
            <th className="p-2">AS Path</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((rt, idx) => (
            <tr key={idx} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
              <td className="p-2 font-mono font-medium text-foreground">
                {rt.network}/{rt.prefixLength}
              </td>
              <td className="p-2 font-mono text-muted-foreground">{rt.nextHop}</td>
              <td className="p-2 font-mono text-muted-foreground">{rt.metric}</td>
              <td className="p-2 font-mono text-muted-foreground">{rt.localPref}</td>
              <td className="p-2 font-mono text-purple-400">{rt.asPath.join(" ")}</td>
              <td className="p-2">
                <Badge variant={rt.best ? "success" : "outline"} className="text-[10px]">
                  {rt.best ? "Best (*)" : "Valid"}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

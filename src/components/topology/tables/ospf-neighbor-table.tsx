"use client";

import React from "react";
import { OspfNeighbor } from "@/features/topology/topology-types";
import { Badge } from "@/components/ui";

export function OspfNeighborTable({ neighbors }: { neighbors: OspfNeighbor[] }) {
  if (!neighbors || neighbors.length === 0) {
    return <p className="p-3 text-xs text-muted-foreground italic text-center">No OSPF neighbors discovered.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-border bg-accent/40 text-muted-foreground font-medium">
            <th className="p-2">Neighbor ID</th>
            <th className="p-2">IP Address</th>
            <th className="p-2">State</th>
            <th className="p-2">Role</th>
            <th className="p-2">Interface</th>
          </tr>
        </thead>
        <tbody>
          {neighbors.map((nbr, idx) => (
            <tr key={idx} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
              <td className="p-2 font-mono font-medium text-foreground">{nbr.neighborId}</td>
              <td className="p-2 font-mono text-muted-foreground">{nbr.neighborIp}</td>
              <td className="p-2">
                <Badge variant={nbr.state === "Full" ? "success" : "warning"} className="text-[10px]">
                  {nbr.state}
                </Badge>
              </td>
              <td className="p-2 font-semibold text-foreground">{nbr.role}</td>
              <td className="p-2 text-muted-foreground">{nbr.interfaceName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import React from "react";
import { MacTableEntry } from "@/features/topology/topology-types";
import { Badge } from "@/components/ui";

export function MacAddressTable({ entries }: { entries: MacTableEntry[] }) {
  if (!entries || entries.length === 0) {
    return <p className="p-3 text-xs text-muted-foreground italic text-center">MAC Address Table is currently empty.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-border bg-accent/40 text-muted-foreground font-medium">
            <th className="p-2">MAC Address</th>
            <th className="p-2">VLAN</th>
            <th className="p-2">Port</th>
            <th className="p-2">Type</th>
            <th className="p-2">Age</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr key={idx} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
              <td className="p-2 font-mono font-medium text-foreground">{entry.macAddress}</td>
              <td className="p-2 text-muted-foreground">VLAN {entry.vlanId}</td>
              <td className="p-2 font-medium text-foreground">{entry.portName}</td>
              <td className="p-2">
                <Badge variant={entry.type === "static" ? "secondary" : "outline"} className="text-[10px]">
                  {entry.type}
                </Badge>
              </td>
              <td className="p-2 font-mono text-muted-foreground">{entry.remainingAgeSeconds}s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

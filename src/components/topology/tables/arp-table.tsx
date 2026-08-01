"use client";

import React from "react";
import { ArpEntry } from "@/features/topology/topology-types";
import { Badge } from "@/components/ui";

export function ArpTable({ entries }: { entries: ArpEntry[] }) {
  if (!entries || entries.length === 0) {
    return <p className="p-3 text-xs text-muted-foreground italic text-center">ARP cache is currently empty.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-border bg-accent/40 text-muted-foreground font-medium">
            <th className="p-2">IP Address</th>
            <th className="p-2">MAC Address</th>
            <th className="p-2">Interface</th>
            <th className="p-2">Type</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr key={idx} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
              <td className="p-2 font-mono font-medium text-foreground">{entry.ipAddress}</td>
              <td className="p-2 font-mono text-muted-foreground">{entry.macAddress}</td>
              <td className="p-2 text-muted-foreground">{entry.interfaceName}</td>
              <td className="p-2">
                <Badge variant={entry.type === "static" ? "secondary" : "outline"} className="text-[10px]">
                  {entry.type}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

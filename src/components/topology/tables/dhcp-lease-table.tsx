"use client";

import React from "react";
import { DhcpLease } from "@/features/topology/topology-types";
import { Badge } from "@/components/ui";

export function DhcpLeaseTable({ leases }: { leases: DhcpLease[] }) {
  if (!leases || leases.length === 0) {
    return <p className="p-3 text-xs text-muted-foreground italic text-center">No active DHCP leases.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-border bg-accent/40 text-muted-foreground font-medium">
            <th className="p-2">IP Address</th>
            <th className="p-2">Client Hostname</th>
            <th className="p-2">MAC Address</th>
            <th className="p-2">State</th>
          </tr>
        </thead>
        <tbody>
          {leases.map((lease, idx) => (
            <tr key={idx} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
              <td className="p-2 font-mono font-medium text-foreground">{lease.ipAddress}</td>
              <td className="p-2 font-medium text-foreground">{lease.clientHostname || "Unknown"}</td>
              <td className="p-2 font-mono text-muted-foreground">{lease.macAddress}</td>
              <td className="p-2">
                <Badge variant={lease.state === "active" ? "success" : "destructive"} className="text-[10px]">
                  {lease.state}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

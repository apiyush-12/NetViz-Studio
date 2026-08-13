"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import type { DhcpPool, DhcpLease } from "@/features/protocols/dhcp/dhcp.types";

interface DhcpPoolTableProps {
  pool: DhcpPool;
  leases: DhcpLease[];
}

export function DhcpPoolTable({ pool, leases }: DhcpPoolTableProps) {
  const startNum = parseInt(pool.startAddress.split(".")[3], 10);
  const endNum = parseInt(pool.endAddress.split(".")[3], 10);
  const totalCapacity = Math.max(0, endNum - startNum + 1);
  const activeCount = leases.filter((l) => l.state === "active").length;
  const utilization = totalCapacity > 0 ? Math.round((activeCount / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* 1. Pool Metrics & Capacity Overview */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">DHCP Server Scope: {pool.name}</CardTitle>
            <Badge variant="outline" className="font-mono text-xs">
              {pool.network}/{pool.prefixLength}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Utilization Progress Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Pool Utilization</span>
              <span className="font-mono font-bold text-foreground">
                {activeCount} / {totalCapacity} IPs Leased ({utilization}%)
              </span>
            </div>
            <div className="h-2.5 bg-secondary/80 rounded-full overflow-hidden border border-border">
              <div
                className={`h-full transition-all duration-300 ${
                  utilization >= 90
                    ? "bg-rose-500"
                    : utilization >= 60
                      ? "bg-amber-500"
                      : "bg-primary"
                }`}
                style={{ width: `${Math.min(100, utilization)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 bg-secondary/40 rounded-lg border border-border">
              <span className="text-muted-foreground block text-[10px]">Start IP</span>
              <span className="font-bold text-primary">{pool.startAddress}</span>
            </div>
            <div className="p-2.5 bg-secondary/40 rounded-lg border border-border">
              <span className="text-muted-foreground block text-[10px]">End IP</span>
              <span className="font-bold text-primary">{pool.endAddress}</span>
            </div>
            <div className="p-2.5 bg-secondary/40 rounded-lg border border-border">
              <span className="text-muted-foreground block text-[10px]">Default Gateway</span>
              <span className="font-bold text-foreground">{pool.gateway}</span>
            </div>
            <div className="p-2.5 bg-secondary/40 rounded-lg border border-border">
              <span className="text-muted-foreground block text-[10px]">DNS Servers</span>
              <span className="font-bold text-foreground">{pool.dnsServers.join(", ")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Active Leases Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Active Bindings & Leases Database</CardTitle>
        </CardHeader>
        <CardContent>
          {leases.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">No active client leases.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-border text-left font-sans text-muted-foreground">
                    <th className="py-2">Client IP</th>
                    <th className="py-2">MAC Address (CHADDR)</th>
                    <th className="py-2">Hostname</th>
                    <th className="py-2">Serving Server</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {leases.map((lease, i) => (
                    <tr key={i} className="hover:bg-accent/40">
                      <td className="py-2 font-bold text-emerald-400">{lease.ipAddress}</td>
                      <td className="py-2 text-primary">{lease.macAddress}</td>
                      <td className="py-2 text-foreground font-sans">{lease.hostname}</td>
                      <td className="py-2 text-muted-foreground">{lease.serverIp}</td>
                      <td className="py-2">
                        <Badge
                          variant={
                            lease.state === "active"
                              ? "success"
                              : lease.state === "declined"
                                ? "destructive"
                                : "outline"
                          }
                          className="text-[10px] uppercase"
                        >
                          {lease.state}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

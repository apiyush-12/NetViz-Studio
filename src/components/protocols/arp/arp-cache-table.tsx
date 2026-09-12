"use client";

import React from "react";
import {
  Table as TableIcon,
  ShieldAlert,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Cpu,
  Layers,
} from "lucide-react";
import { Badge, Card, CardContent } from "@/components/ui";
import type { ArpNode, ArpCacheEntry } from "@/features/protocols/arp/arp.types";

interface ArpCacheTableProps {
  selectedNode: ArpNode;
}

export function ArpCacheTable({ selectedNode }: ArpCacheTableProps) {
  const isSwitch = selectedNode.type === "switch";

  const getEntryStateBadge = (state: ArpCacheEntry["state"]) => {
    switch (state) {
      case "poisoned":
        return (
          <Badge
            variant="destructive"
            className="text-[10px] font-mono flex items-center gap-1 bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
          >
            <ShieldAlert className="h-2.5 w-2.5" /> POISONED
          </Badge>
        );
      case "resolved":
        return (
          <Badge
            variant="success"
            className="text-[10px] font-mono flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
          >
            <CheckCircle2 className="h-2.5 w-2.5" /> REACHABLE
          </Badge>
        );
      case "validated":
        return (
          <Badge
            variant="default"
            className="text-[10px] font-mono flex items-center gap-1 bg-blue-500/20 text-blue-400 border-blue-500/40"
          >
            <ShieldCheck className="h-2.5 w-2.5" /> DAI VERIFIED
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge
            variant="warning"
            className="text-[10px] font-mono flex items-center gap-1 bg-amber-500/20 text-amber-400 border-amber-500/40"
          >
            <Clock className="h-2.5 w-2.5" /> INCOMPLETE
          </Badge>
        );
    }
  };

  const getEntryTypeBadge = (type: ArpCacheEntry["type"]) => {
    switch (type) {
      case "static":
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            static
          </span>
        );
      case "incomplete":
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            incomplete
          </span>
        );
      case "dynamic":
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-secondary text-muted-foreground border border-border">
            dynamic
          </span>
        );
    }
  };

  if (isSwitch) {
    const camEntries = Object.entries(selectedNode.macTable || {});

    return (
      <Card className="border-border bg-card shadow-sm overflow-hidden">
        <div className="p-3 bg-secondary/30 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-400" />
            <h4 className="text-xs font-bold text-foreground">
              Switch CAM Forwarding Table (MAC Address Table)
            </h4>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            {camEntries.length} {camEntries.length === 1 ? "entry" : "entries"} learned
          </span>
        </div>

        <CardContent className="p-0">
          {camEntries.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
              <HelpCircle className="h-6 w-6 text-muted-foreground/50" />
              <p className="font-medium text-foreground">No MAC Entries Learned Yet</p>
              <p className="text-[11px] max-w-xs">
                Switch learns Source MAC addresses dynamically as frames enter physical ports.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/40 text-muted-foreground border-b border-border text-[10px] uppercase font-semibold">
                    <th className="py-2 px-3">VLAN</th>
                    <th className="py-2 px-3">MAC Address</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Port Interface</th>
                    <th className="py-2 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {camEntries.map(([port, mac]) => (
                    <tr
                      key={port}
                      className="hover:bg-secondary/20 transition-colors font-mono text-xs"
                    >
                      <td className="py-2 px-3 text-muted-foreground">1 (Default)</td>
                      <td className="py-2 px-3 font-bold text-emerald-400">
                        {mac}
                      </td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-secondary text-muted-foreground border border-border">
                          DYNAMIC
                        </span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-primary">
                        {port}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <Badge variant="success" className="text-[10px]">
                          LEARNED
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
    );
  }

  const entries = selectedNode.arpCache || [];

  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden">
      {/* Table Header Ribbon */}
      <div className="p-3 bg-secondary/30 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TableIcon className="h-4 w-4 text-emerald-400" />
          <h4 className="text-xs font-bold text-foreground">
            ARP Cache Table (`arp -a` / `ip neigh show`)
          </h4>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-muted-foreground">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </span>
        </div>
      </div>

      <CardContent className="p-0">
        {entries.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
            <AlertCircle className="h-6 w-6 text-muted-foreground/50" />
            <p className="font-medium text-foreground">ARP Cache is Empty</p>
            <p className="text-[11px] max-w-xs">
              No IPv4-to-MAC bindings cached. Start the simulation to watch ARP Requests and Unicast Replies populate this table in real-time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-secondary/40 text-muted-foreground border-b border-border text-[10px] uppercase font-semibold">
                  <th className="py-2 px-3">Internet Address (IP)</th>
                  <th className="py-2 px-3">Physical Address (MAC)</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">State</th>
                  <th className="py-2 px-3 text-right">TTL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {entries.map((entry) => {
                  const isPoisoned = entry.state === "poisoned";
                  return (
                    <tr
                      key={entry.ipAddress}
                      className={`hover:bg-secondary/20 transition-colors font-mono text-xs ${
                        isPoisoned ? "bg-red-500/5 hover:bg-red-500/10" : ""
                      }`}
                    >
                      {/* IP Address */}
                      <td className="py-2 px-3 font-semibold text-foreground">
                        {entry.ipAddress}
                      </td>

                      {/* MAC Address */}
                      <td className="py-2 px-3">
                        <span
                          className={`font-bold tracking-wider ${
                            isPoisoned
                              ? "text-red-400 line-through decoration-red-500/70"
                              : "text-emerald-400"
                          }`}
                        >
                          {entry.macAddress}
                        </span>
                        {isPoisoned && (
                          <div className="text-[10px] text-red-400 font-sans mt-0.5">
                            Attacker MAC substituted!
                          </div>
                        )}
                      </td>

                      {/* Entry Type */}
                      <td className="py-2 px-3">
                        {getEntryTypeBadge(entry.type)}
                      </td>

                      {/* State Badge */}
                      <td className="py-2 px-3">
                        {getEntryStateBadge(entry.state)}
                      </td>

                      {/* TTL / Age */}
                      <td className="py-2 px-3 text-right text-muted-foreground text-[11px]">
                        {entry.ttlSeconds}s
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* CLI Reference Footer */}
        <div className="p-2.5 bg-secondary/20 border-t border-border/70 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <span className="flex items-center gap-1.5">
            <Cpu className="h-3 w-3 text-primary" /> OS Command:
          </span>
          <span className="bg-card px-2 py-0.5 rounded border border-border text-foreground">
            Windows: `arp -a` &nbsp;|&nbsp; Linux: `ip neigh show`
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

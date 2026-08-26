"use client";

import React, { useState } from "react";
import { Database, Clock, RefreshCw, Trash2 } from "lucide-react";
import { Badge, Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { NatTranslationEntry } from "@/features/protocols/nat/nat.types";

interface NatTableInspectorProps {
  translationTable: NatTranslationEntry[];
  onClearEntries?: () => void;
  onRefresh?: () => void;
}

export function NatTableInspector({
  translationTable,
  onClearEntries,
  onRefresh,
}: NatTableInspectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProtocol, setFilterProtocol] = useState<string>("ALL");

  const filteredEntries = translationTable.filter((entry) => {
    const matchesSearch =
      entry.insideLocalIp.includes(searchQuery) ||
      entry.insideGlobalPort.toString().includes(searchQuery) ||
      entry.outsideGlobalIp.includes(searchQuery);

    const matchesProtocol = filterProtocol === "ALL" || entry.protocol === filterProtocol;

    return matchesSearch && matchesProtocol;
  });

  return (
    <div className="border border-border rounded-xl bg-card p-3 shadow-sm space-y-3">
      {/* Table Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span>Stateful NAT Translation Table (NAPT / PAT)</span>
              <Badge variant="outline" className="text-[9px] font-mono text-emerald-400 border-emerald-500/30">
                {translationTable.length} Active Mappings
              </Badge>
            </h3>
            <p className="text-[10.5px] text-muted-foreground">
              Maps Inside Local Sockets (LAN) $\leftrightarrow$ Inside Global Public Ports (WAN)
            </p>
          </div>
        </div>

        {/* Filter & Action Buttons */}
        <div className="flex items-center gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search IP or Port..."
            className="h-7 text-xs font-mono w-36 bg-background"
          />

          <select
            value={filterProtocol}
            onChange={(e) => setFilterProtocol(e.target.value)}
            className="h-7 px-2 rounded-lg border border-border bg-background text-xs font-mono cursor-pointer"
            aria-label="Filter Protocol"
          >
            <option value="ALL">All Protocols</option>
            <option value="TCP">TCP</option>
            <option value="UDP">UDP</option>
            <option value="ICMP">ICMP</option>
          </select>

          {onRefresh && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onRefresh}
              className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}

          {onClearEntries && (
            <Button
              size="sm"
              variant="outline"
              onClick={onClearEntries}
              className="h-7 px-2 text-xs gap-1 text-destructive hover:bg-destructive/10 cursor-pointer"
            >
              <Trash2 className="h-3 w-3" /> Clear Stale
            </Button>
          )}
        </div>
      </div>

      {/* Translation Entries Table */}
      <div className="max-h-[240px] overflow-y-auto rounded-lg border border-border">
        <table className="w-full text-xs text-left">
          <thead className="bg-secondary/40 border-b border-border text-[10.5px] font-semibold text-muted-foreground">
            <tr>
              <th className="p-2">Proto</th>
              <th className="p-2">Inside Local (LAN Host)</th>
              <th className="p-2 text-emerald-400">Inside Global (WAN Port)</th>
              <th className="p-2">Outside Global (Destination)</th>
              <th className="p-2">TTL Expiry</th>
              <th className="p-2 text-right">Packets</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 font-mono text-[11px]">
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-muted-foreground italic">
                  No active NAT translation entries matching filter.
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-accent/30 transition-colors">
                  {/* Protocol */}
                  <td className="p-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] font-mono",
                        entry.protocol === "TCP"
                          ? "text-blue-400 border-blue-500/30"
                          : entry.protocol === "UDP"
                            ? "text-purple-400 border-purple-500/30"
                            : "text-amber-400 border-amber-500/30"
                      )}
                    >
                      {entry.protocol}
                    </Badge>
                  </td>

                  {/* Inside Local */}
                  <td className="p-2 font-medium text-foreground">
                    <span>{entry.insideLocalIp}</span>
                    <span className="text-primary font-bold">:{entry.insideLocalPort}</span>
                  </td>

                  {/* Inside Global */}
                  <td className="p-2 font-semibold text-emerald-400 bg-emerald-500/5">
                    <span>{entry.insideGlobalIp}</span>
                    <span className="text-emerald-300 font-bold">:{entry.insideGlobalPort}</span>
                  </td>

                  {/* Outside Global */}
                  <td className="p-2 text-muted-foreground">
                    <span>{entry.outsideGlobalIp}</span>
                    <span className="text-foreground font-bold">:{entry.outsideGlobalPort}</span>
                  </td>

                  {/* TTL Expiry */}
                  <td className="p-2">
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3 text-amber-400" />
                      {entry.ttlSeconds}s
                    </span>
                  </td>

                  {/* Packets Translated */}
                  <td className="p-2 text-right font-semibold text-foreground">
                    {entry.packetsTranslated} pkts
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

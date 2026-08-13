"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import type { DnsCacheEntry } from "@/features/protocols/dns/dns.types";

interface DnsCacheTableProps {
  cacheEntries: DnsCacheEntry[];
}

export function DnsCacheTable({ cacheEntries }: DnsCacheTableProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Local Resolver Cache & TTL Monitor</CardTitle>
            <Badge variant="outline" className="font-mono text-xs">
              {cacheEntries.length} Records Cached
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {cacheEntries.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              Resolver cache is empty. Queries will traverse upstream nameservers.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-border text-left font-sans text-muted-foreground">
                    <th className="py-2">Cached Hostname</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Resolved Value</th>
                    <th className="py-2">TTL Remaining</th>
                    <th className="py-2">Hits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {cacheEntries.map((entry, idx) => {
                    const ttlPct = Math.round((entry.ttlRemaining / entry.initialTtl) * 100);
                    return (
                      <tr key={idx} className="hover:bg-accent/40">
                        <td className="py-2 font-bold text-foreground">{entry.hostname}</td>
                        <td className="py-2">
                          <Badge variant="outline" className="text-[10px]">
                            {entry.type}
                          </Badge>
                        </td>
                        <td className="py-2 text-emerald-400 font-bold">{entry.value}</td>
                        <td className="py-2 w-40">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-secondary/80 rounded-full overflow-hidden border border-border">
                              <div
                                className={`h-full ${
                                  ttlPct < 20 ? "bg-rose-500" : ttlPct < 50 ? "bg-amber-500" : "bg-emerald-500"
                                }`}
                                style={{ width: `${Math.max(5, ttlPct)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground shrink-0">{entry.ttlRemaining}s</span>
                          </div>
                        </td>
                        <td className="py-2 text-primary font-bold">{entry.hits}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

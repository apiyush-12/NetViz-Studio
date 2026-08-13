"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Input } from "@/components/ui";
import type { DnsNode, DnsResourceRecord } from "@/features/protocols/dns/dns.types";

interface DnsRecordsTableProps {
  nodes: DnsNode[];
}

export function DnsRecordsTable({ nodes }: DnsRecordsTableProps) {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  const allRecords: Array<DnsResourceRecord & { serverName: string; zone?: string }> = [];
  nodes.forEach((n) => {
    n.records.forEach((r) => {
      allRecords.push({ ...r, serverName: n.name, zone: n.zone });
    });
  });

  const filteredRecords = allRecords.filter((r) => {
    const matchesType = filterType === "ALL" || r.type === filterType;
    const matchesSearch =
      search === "" ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.value.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-sm">Authoritative Zone File Records</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Filter domain / value..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-7 w-44 text-xs"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-900 border border-border rounded px-2 py-1 text-xs font-mono text-primary"
              >
                <option value="ALL">All Types</option>
                <option value="A">A (IPv4)</option>
                <option value="AAAA">AAAA (IPv6)</option>
                <option value="CNAME">CNAME</option>
                <option value="MX">MX (Mail)</option>
                <option value="NS">NS</option>
                <option value="TXT">TXT</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-border text-left font-sans text-muted-foreground">
                  <th className="py-2">Domain Name (FQDN)</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Target Value</th>
                  <th className="py-2">TTL</th>
                  <th className="py-2">Serving Nameserver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredRecords.map((r, i) => (
                  <tr key={i} className="hover:bg-accent/40">
                    <td className="py-2 font-bold text-foreground">{r.name}</td>
                    <td className="py-2">
                      <Badge
                        variant={
                          r.type === "A"
                            ? "default"
                            : r.type === "CNAME"
                              ? "outline"
                              : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {r.type}
                      </Badge>
                    </td>
                    <td className="py-2 text-primary font-medium">{r.value}</td>
                    <td className="py-2 text-muted-foreground">{r.ttl}s</td>
                    <td className="py-2 text-muted-foreground font-sans text-[11px]">
                      {r.serverName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

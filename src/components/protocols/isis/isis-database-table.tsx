"use client";

import React, { useState } from "react";
import {
  Database,
  Route,
  Users,
  Tag,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from "@/components/ui";
import type { IsisNode } from "@/features/protocols/isis/isis.types";

interface IsisDatabaseTableProps {
  nodes: IsisNode[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
}

export function IsisDatabaseTable({
  nodes,
  selectedNodeId,
  onSelectNode,
}: IsisDatabaseTableProps) {
  const [viewMode, setViewMode] = useState<"database" | "routes" | "neighbors" | "hostname">("database");
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  if (!selectedNode) return null;

  const dbEntries = selectedNode.database;
  const l1Db = dbEntries.filter((e) => e.level === "L1");
  const l2Db = dbEntries.filter((e) => e.level === "L2");
  const isisRoutes = selectedNode.routingTable;

  return (
    <Card className="border-border bg-card shadow-sm font-sans">
      <CardHeader className="py-3 px-4 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Cisco / Juniper IS-IS Database & Forwarding Tables
              </CardTitle>
              <div className="text-[11px] text-muted-foreground font-mono">
                Active Router: <span className="font-bold text-foreground">{selectedNode.name}</span>
              </div>
            </div>
          </div>

          {/* Router Selectors */}
          <div className="flex items-center gap-1 flex-wrap">
            {nodes.map((node) => (
              <Button
                key={node.id}
                size="sm"
                variant={node.id === selectedNodeId ? "default" : "outline"}
                onClick={() => onSelectNode(node.id)}
                className="text-xs h-7 px-2.5 font-mono cursor-pointer"
              >
                {node.name.split(" ")[1] || node.id}
              </Button>
            ))}
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-border/40 text-xs flex-wrap font-mono">
          <Button
            size="sm"
            variant={viewMode === "database" ? "secondary" : "ghost"}
            onClick={() => setViewMode("database")}
            className="text-xs h-6 px-2.5 cursor-pointer gap-1"
          >
            <Database className="h-3 w-3" />
            show isis database ({dbEntries.length})
          </Button>
          <Button
            size="sm"
            variant={viewMode === "routes" ? "secondary" : "ghost"}
            onClick={() => setViewMode("routes")}
            className="text-xs h-6 px-2.5 cursor-pointer gap-1"
          >
            <Route className="h-3 w-3" />
            show ip route isis ({isisRoutes.length})
          </Button>
          <Button
            size="sm"
            variant={viewMode === "neighbors" ? "secondary" : "ghost"}
            onClick={() => setViewMode("neighbors")}
            className="text-xs h-6 px-2.5 cursor-pointer gap-1"
          >
            <Users className="h-3 w-3" />
            show isis neighbors
          </Button>
          <Button
            size="sm"
            variant={viewMode === "hostname" ? "secondary" : "ghost"}
            onClick={() => setViewMode("hostname")}
            className="text-xs h-6 px-2.5 cursor-pointer gap-1"
          >
            <Tag className="h-3 w-3" />
            show isis hostname
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* 1. Database View */}
        {viewMode === "database" && (
          <div className="space-y-3 p-3 font-mono text-xs">
            {/* Level 1 LSDB */}
            {l1Db.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400 text-xs">
                    IS-IS Level-1 Link State Database:
                  </span>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                    {l1Db.length} LSPs
                  </Badge>
                </div>
                <div className="overflow-x-auto rounded border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-secondary/40 text-muted-foreground text-[10px] uppercase border-b border-border">
                      <tr>
                        <th className="py-2 px-3">LSPID</th>
                        <th className="py-2 px-3">LSP Seq Num</th>
                        <th className="py-2 px-3">Checksum</th>
                        <th className="py-2 px-3">Holdtime</th>
                        <th className="py-2 px-3">ATT/P/OL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {l1Db.map((entry, idx) => (
                        <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-2 px-3 font-semibold text-foreground">
                            {entry.lspId} ({entry.hostname})
                          </td>
                          <td className="py-2 px-3 text-muted-foreground">{entry.seqNumber}</td>
                          <td className="py-2 px-3 text-blue-400">{entry.checksum}</td>
                          <td className="py-2 px-3 text-muted-foreground">{entry.lifetime}s</td>
                          <td className="py-2 px-3">
                            <Badge variant="outline" className="text-[9px] bg-secondary/30">
                              {entry.flags}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Level 2 LSDB */}
            {l2Db.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-border/40">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-400 text-xs">
                    IS-IS Level-2 Backbone Link State Database:
                  </span>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
                    {l2Db.length} LSPs
                  </Badge>
                </div>
                <div className="overflow-x-auto rounded border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-secondary/40 text-muted-foreground text-[10px] uppercase border-b border-border">
                      <tr>
                        <th className="py-2 px-3">LSPID</th>
                        <th className="py-2 px-3">LSP Seq Num</th>
                        <th className="py-2 px-3">Checksum</th>
                        <th className="py-2 px-3">Holdtime</th>
                        <th className="py-2 px-3">ATT/P/OL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {l2Db.map((entry, idx) => (
                        <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-2 px-3 font-semibold text-foreground">
                            {entry.lspId} ({entry.hostname})
                          </td>
                          <td className="py-2 px-3 text-muted-foreground">{entry.seqNumber}</td>
                          <td className="py-2 px-3 text-blue-400">{entry.checksum}</td>
                          <td className="py-2 px-3 text-muted-foreground">{entry.lifetime}s</td>
                          <td className="py-2 px-3">
                            <Badge variant="outline" className="text-[9px] bg-secondary/30">
                              {entry.flags}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Routes View */}
        {viewMode === "routes" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-secondary/40 text-muted-foreground text-[11px] uppercase border-b border-border">
                <tr>
                  <th className="py-2 px-3">Code</th>
                  <th className="py-2 px-3">Prefix / Destination</th>
                  <th className="py-2 px-3">AD / Metric</th>
                  <th className="py-2 px-3">Next-Hop</th>
                  <th className="py-2 px-3">Interface</th>
                  <th className="py-2 px-3">Flags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {isisRoutes.map((route, idx) => (
                  <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2 px-3">
                      <Badge
                        variant="outline"
                        className={
                          route.level === "i L1"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]"
                            : route.level === "i L2"
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]"
                            : "bg-slate-500/20 text-slate-300 border-slate-500/30 text-[10px]"
                        }
                      >
                        {route.level}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 font-semibold text-foreground">
                      {route.prefix}
                      {route.isDefault && (
                        <span className="ml-1 text-[10px] text-purple-400 font-normal">
                          [Default Candidate]
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">
                      [{route.adminDistance}/{route.metric}]
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">
                      {route.nextHop === "0.0.0.0" ? "Directly Connected" : `via ${route.nextHop}`}
                    </td>
                    <td className="py-2 px-3 font-semibold text-foreground">
                      {route.interfaceName}
                    </td>
                    <td className="py-2 px-3">
                      {route.upDownBit ? (
                        <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[9px]">
                          U/D = 1 (Leaked)
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">Internal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Neighbors View */}
        {viewMode === "neighbors" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-secondary/40 text-muted-foreground text-[11px] uppercase border-b border-border">
                <tr>
                  <th className="py-2 px-3">System ID</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Interface</th>
                  <th className="py-2 px-3">State</th>
                  <th className="py-2 px-3">Holdtime</th>
                  <th className="py-2 px-3">Circuit ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {selectedNode.interfaces
                  .filter((i) => i.connectedLinkId)
                  .map((iface, idx) => (
                    <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-2 px-3 font-semibold text-foreground">
                        {idx === 0 ? "0000.0000.0002" : "0000.0000.0003"}
                      </td>
                      <td className="py-2 px-3">
                        <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-400">
                          {iface.level}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-foreground">{iface.name}</td>
                      <td className="py-2 px-3">
                        <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                          Up (3-Way)
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">27s</td>
                      <td className="py-2 px-3 text-muted-foreground font-mono">
                        {iface.name}.01
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Hostname Mapping View */}
        {viewMode === "hostname" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-secondary/40 text-muted-foreground text-[11px] uppercase border-b border-border">
                <tr>
                  <th className="py-2 px-3">System ID</th>
                  <th className="py-2 px-3">Dynamic Hostname (TLV 137)</th>
                  <th className="py-2 px-3">NET Entity Title</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {nodes.map((node, idx) => (
                  <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2 px-3 font-semibold text-foreground">{node.systemId}</td>
                    <td className="py-2 px-3 text-purple-300 font-bold">{node.name.split(" ")[1] || node.id}</td>
                    <td className="py-2 px-3 text-muted-foreground">{node.netAddress}</td>
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

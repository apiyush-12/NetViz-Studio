"use client";

import React, { useState } from "react";
import {
  ListFilter,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from "@/components/ui";
import type { RipNode, RipRoutingTableRecord } from "@/features/protocols/rip/rip.types";

interface RipRoutingTableProps {
  nodes: RipNode[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
}

export function RipRoutingTable({
  nodes,
  selectedNodeId,
  onSelectNode,
}: RipRoutingTableProps) {
  const [viewMode, setViewMode] = useState<"route" | "database">("route");
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  if (!selectedNode) return null;

  const routes = selectedNode.routingTable;
  const ripRoutes = routes.filter((r) => r.routeType === "R");

  const getMetricBadge = (metric: number, state: RipRoutingTableRecord["state"]) => {
    if (metric >= 16 || state === "poisoned") {
      return (
        <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 font-mono text-[10px] gap-1">
          <Flame className="h-3 w-3" /> 16 (Poison)
        </Badge>
      );
    }
    if (state === "holddown") {
      return (
        <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30 font-mono text-[10px] gap-1">
          <AlertTriangle className="h-3 w-3" /> [120/{metric}] Holddown
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono text-[10px] gap-1">
        <CheckCircle2 className="h-3 w-3" /> [120/{metric}] Hops
      </Badge>
    );
  };

  return (
    <Card className="border-border bg-card shadow-sm font-sans">
      <CardHeader className="py-3 px-4 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary border border-primary/20">
              <ListFilter className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Cisco / Juniper Routing Table (RIB)
              </CardTitle>
              <div className="text-[11px] text-muted-foreground font-mono">
                Active Node: <span className="font-bold text-foreground">{selectedNode.name}</span>
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
        <div className="flex items-center gap-2 pt-2 border-t border-border/40 text-xs">
          <Button
            size="sm"
            variant={viewMode === "route" ? "secondary" : "ghost"}
            onClick={() => setViewMode("route")}
            className="text-xs h-6 px-2.5 cursor-pointer font-mono"
          >
            show ip route rip ({ripRoutes.length})
          </Button>
          <Button
            size="sm"
            variant={viewMode === "database" ? "secondary" : "ghost"}
            onClick={() => setViewMode("database")}
            className="text-xs h-6 px-2.5 cursor-pointer font-mono"
          >
            show ip rip database ({routes.length})
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-secondary/40 text-muted-foreground text-[11px] uppercase border-b border-border">
              <tr>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Destination Prefix</th>
                <th className="py-2 px-3">AD / Metric</th>
                <th className="py-2 px-3">Next-Hop</th>
                <th className="py-2 px-3">Interface</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {routes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-muted-foreground text-xs italic">
                    No routes found in routing table.
                  </td>
                </tr>
              ) : (
                routes.map((route, idx) => {
                  const isRip = route.routeType === "R";
                  const isPoisoned = route.metric >= 16 || route.state === "poisoned";

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-secondary/20 transition-colors ${
                        isPoisoned ? "bg-red-500/5 text-red-300" : ""
                      }`}
                    >
                      <td className="py-2 px-3">
                        <Badge
                          variant="outline"
                          className={
                            isRip
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]"
                              : "bg-slate-500/20 text-slate-300 border-slate-500/30 text-[10px]"
                          }
                        >
                          {route.routeType === "R" ? "R (RIP)" : "C (Direct)"}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 font-semibold text-foreground">
                        {route.prefix}
                        {route.tag && route.tag > 0 ? (
                          <span className="ml-1.5 text-[10px] text-purple-400 font-normal">
                            [tag {route.tag}]
                          </span>
                        ) : null}
                      </td>
                      <td className="py-2 px-3">
                        {route.routeType === "C" ? (
                          <span className="text-muted-foreground">[0/0] Connected</span>
                        ) : (
                          getMetricBadge(route.metric, route.state)
                        )}
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">
                        {route.nextHop === "0.0.0.0" ? "Directly Connected" : `via ${route.nextHop}`}
                      </td>
                      <td className="py-2 px-3 text-foreground font-semibold">
                        {route.interfaceName}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`text-[10px] uppercase font-bold ${
                            isPoisoned
                              ? "text-red-400"
                              : route.state === "holddown"
                              ? "text-amber-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {route.state}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Legend Footer */}
        <div className="p-3 bg-secondary/10 border-t border-border/40 flex items-center justify-between flex-wrap gap-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Codes:</span>
            <span className="font-semibold text-blue-400">R - RIP (AD 120)</span>
            <span>•</span>
            <span className="font-semibold text-slate-300">C - Connected (AD 0)</span>
          </div>
          <div className="font-mono text-[10px]">
            Max Metric = 15 hops (16 = Inaccessible)
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

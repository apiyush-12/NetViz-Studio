"use client";

import React, { useState } from "react";
import {
  Terminal,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Tabs } from "@/components/ui";
import type { MplsNode } from "@/features/protocols/mpls/mpls.types";

interface MplsLfibTableProps {
  nodes: MplsNode[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  activePacketInLabel?: number;
}

export function MplsLfibTable({
  nodes,
  selectedNodeId,
  onSelectNode,
  activePacketInLabel,
}: MplsLfibTableProps) {
  const [activeTableTab, setActiveTableTab] = useState<string>("lfib");

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const getActionBadge = (action: string) => {
    switch (action) {
      case "PUSH":
        return <Badge variant="default" className="bg-blue-500/20 text-blue-400 border-blue-500/30 font-mono text-[10px]">PUSH</Badge>;
      case "SWAP":
        return <Badge variant="default" className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 font-mono text-[10px]">SWAP</Badge>;
      case "PHP":
        return <Badge variant="default" className="bg-purple-500/20 text-purple-400 border-purple-500/30 font-mono text-[10px]">PHP (POP)</Badge>;
      case "POP":
        return <Badge variant="default" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-mono text-[10px]">POP</Badge>;
      default:
        return <Badge variant="outline" className="font-mono text-[10px]">{action}</Badge>;
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="py-3 px-4 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                Cisco / Juniper Forwarding Tables
                <Badge variant="outline" className="text-[10px] font-mono">
                  {selectedNode.name} ({selectedNode.routerId})
                </Badge>
              </CardTitle>
              <span className="text-[11px] text-muted-foreground">
                Live LFIB, LDP LIB, and CEF FIB hardware state
              </span>
            </div>
          </div>

          {/* Router Switcher Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {nodes.map((node) => (
              <button
                key={node.id}
                onClick={() => onSelectNode(node.id)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  node.id === selectedNodeId
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "bg-secondary/40 text-muted-foreground hover:bg-secondary/80 hover:text-foreground border border-border/50"
                }`}
              >
                {node.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Table Selector Tabs */}
        <div className="flex items-center justify-between">
          <Tabs
            value={activeTableTab}
            onValueChange={setActiveTableTab}
            tabs={[
              { id: "lfib", label: "show mpls forwarding-table (LFIB)" },
              { id: "lib", label: "show mpls ldp bindings (LIB)" },
              { id: "fib", label: "show ip cef (FIB)" },
            ]}
          />
          <span className="text-[11px] text-muted-foreground hidden md:inline">
            CLI: <code className="text-foreground font-mono">show mpls forwarding-table</code>
          </span>
        </div>

        {/* LFIB Table View */}
        {activeTableTab === "lfib" && (
          <div className="overflow-x-auto rounded-md border border-border/50 bg-background/50">
            {selectedNode.lfib.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No LFIB entries. (Router is in pure IP mode or has not received LDP label advertisements).
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-secondary/40 text-[11px] uppercase text-muted-foreground border-b border-border/60">
                  <tr>
                    <th className="py-2 px-3">Local (In) Label</th>
                    <th className="py-2 px-3">Outgoing (Out) Label</th>
                    <th className="py-2 px-3">Prefix or Tunnel / FEC</th>
                    <th className="py-2 px-3">Action</th>
                    <th className="py-2 px-3">Outgoing Interface</th>
                    <th className="py-2 px-3">Next Hop</th>
                    <th className="py-2 px-3 text-right">Bytes Swapped</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {selectedNode.lfib.map((row, idx) => {
                    const isRowActive = activePacketInLabel === row.inLabel;
                    return (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          isRowActive
                            ? "bg-blue-500/15 border-l-4 border-l-blue-500 font-semibold"
                            : "hover:bg-secondary/20"
                        }`}
                      >
                        <td className="py-2 px-3 text-blue-400 font-bold">
                          {row.inLabel}
                        </td>
                        <td className="py-2 px-3">
                          {row.outLabel === "POP" ? (
                            <span className="text-emerald-400 font-semibold">Pop Label</span>
                          ) : row.outLabel === "IMPLICIT_NULL" ? (
                            <span className="text-purple-400 font-semibold">Imp-Null (3) [PHP]</span>
                          ) : (
                            <span className="text-indigo-400 font-semibold">{row.outLabel}</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-foreground font-sans text-xs">
                          {row.prefix}
                        </td>
                        <td className="py-2 px-3">{getActionBadge(row.action)}</td>
                        <td className="py-2 px-3 text-muted-foreground">{row.outInterface}</td>
                        <td className="py-2 px-3 text-foreground">{row.nextHop}</td>
                        <td className="py-2 px-3 text-right text-muted-foreground">
                          {row.bytesSwapped.toLocaleString()} B
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* LIB Table View */}
        {activeTableTab === "lib" && (
          <div className="overflow-x-auto rounded-md border border-border/50 bg-background/50">
            {selectedNode.lib.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No LDP label bindings in LIB database.
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-secondary/40 text-[11px] uppercase text-muted-foreground border-b border-border/60">
                  <tr>
                    <th className="py-2 px-3">Destination FEC / Prefix</th>
                    <th className="py-2 px-3">Local Label Binding</th>
                    <th className="py-2 px-3">Remote Neighbor LDP Bindings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {selectedNode.lib.map((lib, idx) => (
                    <tr key={idx} className="hover:bg-secondary/20">
                      <td className="py-2.5 px-3 text-foreground font-semibold">{lib.prefix}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                          {lib.localLabel === 3 ? "Label 3 (Implicit Null)" : `Label ${lib.localLabel}`}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {lib.remoteBindings.map((rb, rIdx) => (
                            <span
                              key={rIdx}
                              className="px-2 py-0.5 rounded bg-secondary/50 text-foreground border border-border/60 text-[11px]"
                            >
                              Router {rb.neighborRouterId}: <strong className="text-indigo-400">Label {rb.neighborLabel}</strong>
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* FIB (CEF) Table View */}
        {activeTableTab === "fib" && (
          <div className="overflow-x-auto rounded-md border border-border/50 bg-background/50">
            {selectedNode.fib.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No CEF entries configured.
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-secondary/40 text-[11px] uppercase text-muted-foreground border-b border-border/60">
                  <tr>
                    <th className="py-2 px-3">IP Destination Prefix</th>
                    <th className="py-2 px-3">Next Hop Gateway</th>
                    <th className="py-2 px-3">Interface</th>
                    <th className="py-2 px-3">Action / Label Encap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {selectedNode.fib.map((fib, idx) => (
                    <tr key={idx} className="hover:bg-secondary/20">
                      <td className="py-2 px-3 text-foreground font-semibold">{fib.prefix}</td>
                      <td className="py-2 px-3 text-muted-foreground">{fib.nextHop}</td>
                      <td className="py-2 px-3 text-muted-foreground">{fib.outInterface}</td>
                      <td className="py-2 px-3">
                        {fib.action === "PUSH" ? (
                          <div className="flex items-center gap-1.5">
                            <Badge variant="default" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">
                              PUSH
                            </Badge>
                            {fib.pushLabels?.map((l) => (
                              <span key={l} className="text-blue-400 font-bold">
                                Label {l}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-zinc-400 text-[10px]">
                            {fib.action}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import React, { useState } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Scale, X } from "lucide-react";

export function ProtocolComparisonModal() {
  const [isOpen, setIsOpen] = useState(false);

  const comparisonRows = [
    {
      dimension: "Protocol Category",
      ospf: "Interior Gateway Protocol (IGP)",
      bgp: "Exterior Gateway Protocol (EGP) / Path-Vector",
    },
    {
      dimension: "Operating Scope",
      ospf: "Within a single Autonomous System / Enterprise domain",
      bgp: "Between distinct Autonomous Systems (Internet-wide) & large internal networks",
    },
    {
      dimension: "Algorithm & Approach",
      ospf: "Link-State approach using Dijkstra's Shortest Path First (SPF)",
      bgp: "Policy-driven decision tree using AS_PATH, LOCAL_PREF, MED, and BGP attributes",
    },
    {
      dimension: "Primary Metric",
      ospf: "Interface Bandwidth / Cost (Cumulative link costs)",
      bgp: "Path Attributes (LOCAL_PREF, AS_PATH length, MED, Origin code)",
    },
    {
      dimension: "Transport Protocol",
      ospf: "Directly over IP (Protocol 89) using multicast (224.0.0.5)",
      bgp: "TCP Connection over Port 179 for reliable transport",
    },
    {
      dimension: "Routing Objective",
      ospf: "Find the technically shortest / lowest cost path inside domain",
      bgp: "Enforce business relationships, administrative policies, and loop prevention",
    },
    {
      dimension: "Scalability & Hierarchy",
      ospf: "Hierarchical Areas (Area 0 backbone + Area 1/2 stub areas)",
      bgp: "Autonomous Systems (AS numbers: 1 to 4,294,967,295) interconnecting global Internet",
    },
    {
      dimension: "Convergence Speed",
      ospf: "Fast (sub-second to seconds) via immediate LSA flooding and local SPF runs",
      bgp: "Deliberate and damped (MRAI timers) to prevent global Internet flapping",
    },
  ];

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/10"
      >
        <Scale className="h-3.5 w-3.5" />
        <span>OSPF vs BGP Comparison</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border-border bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">
                  OSPF vs BGP — Protocol Architectural Comparison
                </CardTitle>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-4 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="py-2.5 px-3 text-muted-foreground font-medium w-1/4">
                        Dimension
                      </th>
                      <th className="py-2.5 px-3 text-blue-400 font-semibold w-3/8 bg-blue-500/5 rounded-t-lg">
                        OSPF (Open Shortest Path First)
                      </th>
                      <th className="py-2.5 px-3 text-emerald-400 font-semibold w-3/8 bg-emerald-500/5 rounded-t-lg">
                        BGP (Border Gateway Protocol)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {comparisonRows.map((row) => (
                      <tr key={row.dimension} className="hover:bg-accent/20 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-foreground">
                          {row.dimension}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground bg-blue-500/5 leading-relaxed">
                          {row.ospf}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground bg-emerald-500/5 leading-relaxed">
                          {row.bgp}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-secondary/40 border border-border rounded-lg text-xs space-y-1">
                <span className="font-semibold text-primary block">Summary Takeaway</span>
                <p className="text-muted-foreground leading-relaxed">
                  Inside an enterprise or data center, <strong>OSPF</strong> provides fast, automatic
                  shortest-path routing. When connecting external networks, cloud providers, or
                  independent autonomous organizations, <strong>BGP</strong> is used to enforce
                  administrative policy and path routing control.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

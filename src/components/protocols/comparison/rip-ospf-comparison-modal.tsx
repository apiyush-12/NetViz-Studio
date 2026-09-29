"use client";

import React, { useState } from "react";
import {
  Layers,
  Sparkles,
  X,
  Zap,
  CheckCircle2,
  GitFork,
  Globe,
} from "lucide-react";
import {
  Button,
  Tabs,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";

export function RipOspfComparisonModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("comparison");

  const comparisonData = [
    {
      dimension: "Routing Algorithm Family",
      rip: "Distance-Vector (Bellman-Ford / Ford-Fulkerson). Routers know only distance & next-hop vectors ('Routing by Rumor').",
      ospf: "Link-State (Dijkstra Shortest Path First - SPF). Every router possesses the complete topology graph (LSDB).",
      bgp: "Path-Vector (BGP-4 / RFC 4271). Evaluates autonomous system paths, communities, and administrative policies.",
    },
    {
      dimension: "Routing Metric & Formula",
      rip: "Hop Count strictly (1 to 15 hops; 16 = Infinity / Unreachable). Ignores bandwidth and latency completely.",
      ospf: "Cumulative Interface Cost based on Reference Bandwidth ($10^8 / \\text{Bandwidth in bps}$).",
      bgp: "Multi-Attribute Decision Tree: Weight, Local Preference, AS-Path Length, Origin, MED, eBGP > iBGP.",
    },
    {
      dimension: "Convergence Speed & Scale",
      rip: "Slow convergence (30s periodic timers, 180s invalid, 240s flush). Limited to 15 hops (small LANs).",
      ospf: "Very fast (sub-second Dijkstra SPF computation, event-driven LSA flooding). Scales to thousands of routers across Areas.",
      bgp: "Highly scalable across the entire global Internet (1,000,000+ prefixes), policy-driven convergence.",
    },
    {
      dimension: "Loop Prevention Mechanism",
      rip: "Split Horizon, Poisoned Reverse (Metric 16), Triggered Flash Updates, Holddown Timers.",
      ospf: "Inherently loop-free within Area via Dijkstra Directed Acyclic Graph (DAG) computation.",
      bgp: "AS-Path loop prevention: Discards any route containing its own local Autonomous System Number (ASN).",
    },
    {
      dimension: "Transport Protocol & Ports",
      rip: "UDP Port 520 (RIPv1: 255.255.255.255 Broadcast, RIPv2: 224.0.0.9 Multicast).",
      ospf: "Raw IP Protocol 89 (Multicast 224.0.0.5 AllSPFRouters, 224.0.0.6 AllDRouters).",
      bgp: "TCP Port 179 (Reliable Unicast BGP peering session).",
    },
    {
      dimension: "Subnet & VLSM Support",
      rip: "RIPv1 is Classful (no mask). RIPv2 (RFC 2453) is Classless (VLSM & CIDR supported).",
      ospf: "Fully Classless (VLSM, CIDR, Supernetting, Inter-Area Route Summarization).",
      bgp: "Fully Classless CIDR prefix aggregation and supernetting.",
    },
    {
      dimension: "Update Dissemination",
      rip: "Periodic full routing table updates every 30 seconds (high bandwidth consumption).",
      ospf: "Triggered incremental Link-State Advertisements (LSAs) on topology changes + 30-minute refresh.",
      bgp: "Incremental event-driven UPDATE and WITHDRAW messages only.",
    },
    {
      dimension: "Resource & Memory Footprint",
      rip: "Extremely low CPU and memory footprint. Ideal for basic hardware and small branch offices.",
      ospf: "Moderate-to-high CPU and RAM usage to maintain LSDB and re-run SPF calculations.",
      bgp: "Substantial RAM requirement to store global Internet routing tables (~1GB+ RAM per peer).",
    },
  ];

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="text-xs h-7 px-2.5 gap-1.5 cursor-pointer border-purple-500/40 hover:bg-purple-500/10 text-purple-300"
      >
        <Sparkles className="h-3.5 w-3.5 text-purple-400" />
        <span>RIP vs OSPF vs BGP Comparison</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <Card className="w-full max-w-5xl max-h-[90vh] flex flex-col border-border bg-card shadow-2xl overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-border flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Architectural Comparison: Distance-Vector vs Link-State vs Path-Vector
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    RIP (RFC 2453) &bull; OSPF (RFC 2328) &bull; BGP-4 (RFC 4271)
                  </p>
                </div>
              </div>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <div className="px-4 pt-2 border-b border-border bg-secondary/10">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                tabs={[
                  { id: "comparison", label: "Comparison Matrix" },
                  { id: "architectures", label: "Algorithm Taxonomy" },
                  { id: "takeaways", label: "Engineering Summary" },
                ]}
              />
            </div>

            <CardContent className="p-4 overflow-y-auto flex-1 space-y-4 text-xs font-sans">
              {/* 1. Comparison Matrix */}
              {activeTab === "comparison" && (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-secondary/40 text-muted-foreground text-[11px] uppercase border-b border-border">
                      <tr>
                        <th className="py-2.5 px-3">Dimension</th>
                        <th className="py-2.5 px-3 text-blue-400">RIPv2 (Distance-Vector)</th>
                        <th className="py-2.5 px-3 text-emerald-400">OSPF (Link-State)</th>
                        <th className="py-2.5 px-3 text-purple-400">BGP (Path-Vector)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {comparisonData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-2.5 px-3 font-semibold font-sans text-foreground">
                            {row.dimension}
                          </td>
                          <td className="py-2.5 px-3 text-blue-300/90 leading-relaxed font-sans">
                            {row.rip}
                          </td>
                          <td className="py-2.5 px-3 text-emerald-300/90 leading-relaxed font-sans">
                            {row.ospf}
                          </td>
                          <td className="py-2.5 px-3 text-purple-300/90 leading-relaxed font-sans">
                            {row.bgp}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 2. Algorithm Taxonomy */}
              {activeTab === "architectures" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-sans">
                  <div className="p-3.5 rounded-lg bg-blue-500/10 border border-blue-500/30 space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-400" />
                      <span className="font-bold text-blue-300">Distance-Vector (RIP)</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Routers possess only local neighbor perspectives (&ldquo;Routing by Rumor&rdquo;). Each router blindly trusts the hop counts advertised by its immediate neighbors and increments them by 1.
                    </p>
                    <div className="space-y-1 text-[11px] text-blue-300/80 pt-1 font-mono">
                      <div>&bull; Max Hop Limit: 15 hops</div>
                      <div>&bull; Algorithm: Bellman-Ford</div>
                      <div>&bull; Best For: Small simple LANs</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center gap-2">
                      <GitFork className="h-4 w-4 text-emerald-400" />
                      <span className="font-bold text-emerald-300">Link-State (OSPF / IS-IS)</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Every router floods local link states (LSAs) so every node in the Area builds an identical full topology map (LSDB), then runs Dijkstra SPF independently to form a loop-free Shortest Path Tree.
                    </p>
                    <div className="space-y-1 text-[11px] text-emerald-300/80 pt-1 font-mono">
                      <div>&bull; Metric: Cumulative Bandwidth Cost</div>
                      <div>&bull; Algorithm: Dijkstra SPF</div>
                      <div>&bull; Best For: Enterprise backbones</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-purple-500/10 border border-purple-500/30 space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-purple-400" />
                      <span className="font-bold text-purple-300">Path-Vector (BGP-4)</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Operates between entire Autonomous Systems (AS). Routes carry an explicit sequence of AS numbers (AS-Path), allowing fine-grained business policy routing and guaranteed inter-domain loop freedom.
                    </p>
                    <div className="space-y-1 text-[11px] text-purple-300/80 pt-1 font-mono">
                      <div>&bull; Metric: Policy & AS-Path length</div>
                      <div>&bull; Scale: 1,000,000+ Internet routes</div>
                      <div>&bull; Best For: Global ISP peering</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Takeaways */}
              {activeTab === "takeaways" && (
                <div className="space-y-3 text-xs font-sans">
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 space-y-1.5">
                    <span className="font-bold text-blue-300 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-blue-400" />
                      Key Takeaways for RIP (Routing Information Protocol):
                    </span>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground leading-relaxed">
                      <li>
                        <strong className="text-foreground">Why 15 Hops?</strong> Distance-vector loops bounce metric increments. Defining Metric 16 as Infinity bounds the worst-case Count-to-Infinity duration to 16 cycles.
                      </li>
                      <li>
                        <strong className="text-foreground">The Power of Split Horizon:</strong> Without Split Horizon, any link cut creates an immediate ping-pong loop between adjacent routers.
                      </li>
                      <li>
                        <strong className="text-foreground">RIPv1 vs RIPv2:</strong> RIPv1 is classful and relies on broadcast; RIPv2 introduces 32-bit subnet masks (VLSM), route tags, multicast (224.0.0.9), and MD5 authentication.
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-border">
                <Button size="sm" variant="outline" onClick={() => setIsOpen(false)} className="text-xs cursor-pointer">
                  Close Window
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

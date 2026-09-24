"use client";

import React, { useState } from "react";
import {
  Layers,
  Sparkles,
  X,
  Network,
  Zap,
  CheckCircle2,
} from "lucide-react";
import {
  Button,
  Tabs,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";

export function MplsTraditionalIpComparisonModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("comparison");

  const comparisonData = [
    {
      dimension: "Forwarding Decision",
      traditionalIp: "Longest Prefix Match (LPM) on 32-bit (IPv4) or 128-bit (IPv6) destination addresses.",
      mpls: "Exact-match indexed lookup on 20-bit label shim header (O(1) constant time in LFIB).",
      segmentRouting: "Source routing: Ingress node imposes an ordered list of Segment IDs (Prefix-SIDs / Adj-SIDs).",
    },
    {
      dimension: "Core Router State",
      traditionalIp: "Full global BGP Internet routing table required on every core router (>950,000 routes).",
      mpls: "BGP-Free Core: Core LSRs only store local LDP/RSVP labels for provider loopbacks (~1,000s).",
      segmentRouting: "Zero Core State: Core nodes maintain NO per-flow or per-tunnel state whatsoever.",
    },
    {
      dimension: "Traffic Engineering",
      traditionalIp: "Destination-only Shortest Path First (IGP metric based). Inflexible link utilization.",
      mpls: "RSVP-TE Explicit Paths: Steers traffic along arbitrary paths regardless of IGP metrics.",
      segmentRouting: "SDN-Driven Policy Paths: Centralized PCE calculates optimal paths encoded in SID stack.",
    },
    {
      dimension: "Failover Convergence",
      traditionalIp: "Slow global IGP reconvergence (2 to 5 seconds). Causes severe packet drops.",
      mpls: "Fast Reroute (FRR): Pre-computed local backup bypass tunnels switch in <50 milliseconds.",
      segmentRouting: "Topology-Independent LFA (TI-LFA): Instant 100% 50ms sub-second protection for any topology.",
    },
    {
      dimension: "Multi-Tenant VPNs",
      traditionalIp: "Complex IPsec / GRE tunnels with high MTU overhead and manual peering configuration.",
      mpls: "BGP/MPLS L3VPN (RFC 4364): Scalable 2-label hierarchy with overlapping customer IP space.",
      segmentRouting: "SR-L3VPN / SRv6: Network slicing with native EVPN integration and segment lists.",
    },
    {
      dimension: "Header Overhead",
      traditionalIp: "Standard 20-byte IPv4 / 40-byte IPv6 header without transport shims.",
      mpls: "4 bytes per shim header (20-bit Label, 3-bit EXP, 1-bit S, 8-bit TTL).",
      segmentRouting: "SR-MPLS: 4 bytes per SID in label stack; SRv6: 128-bit SRH IPv6 extension headers.",
    },
    {
      dimension: "Signaling Protocols",
      traditionalIp: "IGP (OSPF, IS-IS) + EGP (BGP).",
      mpls: "Requires LDP (RFC 5036) for label distribution and RSVP-TE for traffic engineering tunnels.",
      segmentRouting: "Eliminates LDP and RSVP-TE! IGP (OSPF/IS-IS) directly advertises SIDs.",
    },
  ];

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="text-xs cursor-pointer gap-1.5 border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
      >
        <Sparkles className="h-3.5 w-3.5 text-blue-400" />
        <span>Compare: IP vs MPLS vs Segment Routing</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <Card className="w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Architectural Evolution: Traditional IP vs MPLS vs Segment Routing
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    From Hop-by-Hop Longest Prefix Match to Label Switching and Next-Gen SDN Source Routing
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

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Tab Navigation */}
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                tabs={[
                  { id: "comparison", label: "Feature Comparison Matrix" },
                  { id: "architectures", label: "Core Architectures" },
                  { id: "takeaways", label: "Key Takeaways" },
                ]}
              />

              {/* 1. Comparison Matrix */}
              {activeTab === "comparison" && (
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-secondary/40 text-[11px] uppercase text-muted-foreground border-b border-border">
                      <tr>
                        <th className="py-2.5 px-3.5 font-bold w-1/4">Architecture Feature</th>
                        <th className="py-2.5 px-3.5 font-bold text-zinc-400 w-1/4">Traditional IP (Layer 3)</th>
                        <th className="py-2.5 px-3.5 font-bold text-blue-400 w-1/4">MPLS (Layer 2.5)</th>
                        <th className="py-2.5 px-3.5 font-bold text-purple-400 w-1/4">Segment Routing (SR-MPLS / SRv6)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {comparisonData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-2.5 px-3.5 font-semibold text-foreground">{row.dimension}</td>
                          <td className="py-2.5 px-3.5 text-muted-foreground leading-relaxed">{row.traditionalIp}</td>
                          <td className="py-2.5 px-3.5 text-blue-300 font-medium leading-relaxed bg-blue-500/5">{row.mpls}</td>
                          <td className="py-2.5 px-3.5 text-purple-300 leading-relaxed bg-purple-500/5">{row.segmentRouting}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 2. Architectures */}
              {activeTab === "architectures" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-lg bg-secondary/20 border border-border space-y-2">
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4 text-zinc-400" />
                      <span className="font-bold text-foreground">Traditional IP (L3)</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Every router inspects destination IP, performs slow longest prefix matching in huge routing tables, and independently forwards hop-by-hop along the shortest IGP metric path.
                    </p>
                    <div className="space-y-1 text-[11px] text-muted-foreground pt-1">
                      <div>• Routing: Hop-by-hop SPF</div>
                      <div>• Core State: Full Internet BGP</div>
                      <div>• Failover: 2-5s IGP Reconvergence</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-blue-500/10 border border-blue-500/30 space-y-2">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-blue-400" />
                      <span className="font-bold text-blue-300">MPLS (RFC 3031 / 3032)</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Replaces IP LPM with 20-bit label indexing. Ingress LER imposes labels, Core LSRs perform O(1) hardware swaps, and Egress LER strips labels. Enables VPNs and 50ms Fast Reroute.
                    </p>
                    <div className="space-y-1 text-[11px] text-blue-300/80 pt-1">
                      <div>• Forwarding: Exact-match 20-bit LFIB</div>
                      <div>• Core State: BGP-Free Core (LDP only)</div>
                      <div>• Failover: &lt;50ms Fast Reroute (FRR)</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-purple-500/10 border border-purple-500/30 space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-purple-400" />
                      <span className="font-bold text-purple-300">Segment Routing (SR)</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Next-gen evolution: Ingress router encodes the entire path into a sequence of Segment IDs. Eliminates LDP and RSVP-TE completely, while delivering 100% TI-LFA 50ms protection.
                    </p>
                    <div className="space-y-1 text-[11px] text-purple-300/80 pt-1">
                      <div>• Forwarding: Source Routing SIDs</div>
                      <div>• Core State: Zero Core State (Stateless)</div>
                      <div>• Failover: &lt;50ms Topology-Independent LFA</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Takeaways */}
              {activeTab === "takeaways" && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 space-y-1.5">
                    <span className="font-bold text-blue-300 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-blue-400" />
                      Why Service Providers Rely on MPLS:
                    </span>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground leading-relaxed">
                      <li>
                        <strong className="text-foreground">BGP-Free Core:</strong> Core routers do not need to know customer IP routes or the 950,000+ Internet routing table. They only switch labels between PE loopbacks.
                      </li>
                      <li>
                        <strong className="text-foreground">L3VPN & L2VPN Multi-Tenancy:</strong> Complete cryptographic and routing isolation across multiple corporate tenants sharing the same physical fiber.
                      </li>
                      <li>
                        <strong className="text-foreground">Traffic Engineering & Fast Reroute:</strong> Full control over path selection to bypass congestion, with sub-50ms local failover during fiber cuts.
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

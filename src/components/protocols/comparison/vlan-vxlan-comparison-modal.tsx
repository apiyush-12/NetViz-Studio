"use client";

import React, { useState } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Scale, X, Layers, Cloud } from "lucide-react";

export function VlanVxlanComparisonModal() {
  const [isOpen, setIsOpen] = useState(false);

  const comparisonRows = [
    {
      dimension: "Network Segment Identifier",
      vlan: "12-bit VLAN ID (VID) — Maximum 4,094 VLANs globally per switch domain.",
      vxlan: "24-bit VXLAN Network Identifier (VNI) — Up to 16.7 Million isolated segments.",
    },
    {
      dimension: "Encapsulation & Layer",
      vlan: "Layer 2 Shim Header — Inserts 4-byte 802.1Q tag directly into Ethernet frame.",
      vxlan: "Layer 3 UDP Overlay — MAC-in-UDP encapsulation (50-byte outer IP+UDP 4789 header).",
    },
    {
      dimension: "Underlay Network Transport",
      vlan: "Strictly limited to a local Layer 2 broadcast domain bounded by Spanning Tree (STP).",
      vxlan: "Runs across any standard Layer 3 IP routed network (Spine-Leaf Underlay).",
    },
    {
      dimension: "Link Utilization & Multipathing",
      vlan: "Spanning Tree Protocol (STP) disables redundant links (up to 50% bandwidth wasted).",
      vxlan: "Equal-Cost Multi-Pathing (ECMP) active-active across all Spine-Leaf links (100% utilization).",
    },
    {
      dimension: "Cloud Multi-Tenancy",
      vlan: "Inadequate for large cloud providers (4,094 limit easily exhausted by 10 tenants).",
      vxlan: "Massive multi-tenancy — powers AWS VPCs, Azure VNets, and Kubernetes Calico/Cilium overlays.",
    },
    {
      dimension: "Control Plane Architecture",
      vlan: "Data-plane flood-and-learn (broadcast ARP / unknown unicast flooding).",
      vxlan: "BGP EVPN (RFC 7432) control plane — replaces broadcast flooding with MP-BGP MAC route distribution.",
    },
    {
      dimension: "Termination Device",
      vlan: "Access switch ports or Router sub-interfaces.",
      vxlan: "VXLAN Tunnel Endpoints (VTEPs) in hardware ToR ASICs or software hypervisors (OVS/vSwitch).",
    },
    {
      dimension: "Frame MTU Requirement",
      vlan: "Standard 1500 MTU (plus 4-byte baby-giant frame 1522 MTU support).",
      vxlan: "Jumbo MTU recommended (Minimum 1550+ to 1600 bytes to prevent UDP fragmentation).",
    },
  ];

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="gap-1.5 text-xs font-semibold border-primary/40 hover:bg-primary/10 text-primary cursor-pointer"
      >
        <Scale className="h-3.5 w-3.5" />
        <span>VLAN vs VXLAN Comparison</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <Card className="w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    IEEE 802.1Q VLAN vs RFC 7348 VXLAN Architectural Comparison
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Traditional Layer 2 Broadcast Segmentation vs Cloud-Scale Layer 3 Overlay Networks
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
              {/* Architecture Highlights Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/5 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-blue-400 text-xs">
                    <Layers className="h-4 w-4" />
                    <span>IEEE 802.1Q VLAN (Campus & Enterprise LAN)</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Simple, hardware-native 4-byte tagging. Ideal for office buildings and campus switching, but limited to 4,094 segments and restricted by STP loop blocking.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-purple-500/30 bg-purple-500/5 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-purple-400 text-xs">
                    <Cloud className="h-4 w-4" />
                    <span>RFC 7348 VXLAN (Data Center & Cloud Overlay)</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    MAC-in-UDP encapsulation spanning Layer 3 Spine-Leaf fabrics. Unlocks 16.7M tenant segments, EVPN control planes, and 100% ECMP bandwidth utilization.
                  </p>
                </div>
              </div>

              {/* Detailed Matrix Table */}
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                    <tr>
                      <th className="p-3 w-1/4">Feature / Metric</th>
                      <th className="p-3 w-3/8 text-blue-400">802.1Q VLAN</th>
                      <th className="p-3 w-3/8 text-purple-400">RFC 7348 VXLAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {comparisonRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-accent/40 transition-colors">
                        <td className="p-3 font-semibold text-foreground bg-muted/20">
                          {row.dimension}
                        </td>
                        <td className="p-3 text-muted-foreground leading-relaxed font-mono text-[11px]">
                          {row.vlan}
                        </td>
                        <td className="p-3 text-foreground leading-relaxed font-mono text-[11px] bg-purple-500/5">
                          {row.vxlan}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

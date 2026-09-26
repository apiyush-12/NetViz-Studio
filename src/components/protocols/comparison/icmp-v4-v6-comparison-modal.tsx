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

export function IcmpV4V6ComparisonModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("comparison");

  const comparisonData = [
    {
      dimension: "Primary RFC Standard",
      icmpv4: "RFC 792 (Core), RFC 1191 (PMTUD), RFC 1256 (Router Discovery).",
      icmpv6: "RFC 4443 (Core), RFC 4861 (NDP), RFC 4862 (SLAAC), RFC 3810 (MLDv2).",
    },
    {
      dimension: "IP Protocol Number",
      icmpv4: "IPv4 Protocol 1 (`0x01` in IPv4 Header).",
      icmpv6: "IPv6 Next Header 58 (`0x3A` in IPv6 Header).",
    },
    {
      dimension: "Address Resolution (Layer 2 MAC)",
      icmpv4: "Separate protocol: Address Resolution Protocol (ARP / Broadcast Flooding).",
      icmpv6: "Built directly into ICMPv6: Neighbor Discovery Protocol (NDP NS/NA via Solicited-Node Multicast).",
    },
    {
      dimension: "Host Address Auto-Configuration",
      icmpv4: "Requires DHCP server or manual static configuration.",
      icmpv6: "Native Stateless Address Autoconfiguration (SLAAC) via ICMPv6 Router Solicitations & Advertisements (RS/RA).",
    },
    {
      dimension: "Multicast Group Management",
      icmpv4: "Separate protocol: Internet Group Management Protocol (IGMPv1/v2/v3).",
      icmpv6: "Built directly into ICMPv6: Multicast Listener Discovery (MLDv1/v2).",
    },
    {
      dimension: "Minimum Path MTU",
      icmpv4: "Minimum MTU is 576 bytes. Routers are allowed to fragment in transit if DF=0.",
      icmpv6: "Minimum MTU is 1280 bytes. Routers NEVER fragment in transit; PMTUD is mandatory.",
    },
    {
      dimension: "Error Message Quoting",
      icmpv4: "Quotes original IPv4 header + first 8 bytes (64 bits) of transport payload.",
      icmpv6: "Quotes as much of the original IPv6 packet as possible without exceeding 1280-byte MTU.",
    },
    {
      dimension: "Type & Code Numbers",
      icmpv4: "Type 8 = Echo Req, Type 0 = Echo Reply, Type 11 = Time Exceeded, Type 3 = Unreachable.",
      icmpv6: "Type 128 = Echo Req, Type 129 = Echo Reply, Type 3 = Time Exceeded, Type 1 = Unreachable, Type 2 = Packet Too Big.",
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
        <span>Compare: ICMPv4 vs ICMPv6</span>
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
                    Protocol Comparison: ICMPv4 (RFC 792) vs ICMPv6 (RFC 4443)
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    How ICMPv6 Consolidated ARP, IGMP, SLAAC, and NDP into a Single Unified Layer 3 Engine
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
                  { id: "architectures", label: "Architectural Evolution" },
                  { id: "takeaways", label: "Key Takeaways" },
                ]}
              />

              {/* 1. Comparison Matrix */}
              {activeTab === "comparison" && (
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-secondary/40 text-[11px] uppercase text-muted-foreground border-b border-border">
                      <tr>
                        <th className="py-2.5 px-3.5 font-bold w-1/4">Protocol Feature</th>
                        <th className="py-2.5 px-3.5 font-bold text-blue-400 w-3/8">ICMPv4 (RFC 792 / IPv4)</th>
                        <th className="py-2.5 px-3.5 font-bold text-purple-400 w-3/8">ICMPv6 (RFC 4443 / IPv6)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {comparisonData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-2.5 px-3.5 font-semibold text-foreground">{row.dimension}</td>
                          <td className="py-2.5 px-3.5 text-blue-300 font-medium leading-relaxed bg-blue-500/5">{row.icmpv4}</td>
                          <td className="py-2.5 px-3.5 text-purple-300 leading-relaxed bg-purple-500/5">{row.icmpv6}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 2. Architectures */}
              {activeTab === "architectures" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-lg bg-blue-500/10 border border-blue-500/30 space-y-2">
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4 text-blue-400" />
                      <span className="font-bold text-blue-300">ICMPv4 (Fragmented Ancillary Services)</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      In IPv4, ICMP only handles basic error reporting and diagnostics (Ping). Other fundamental Layer 3 tasks require separate auxiliary protocols: ARP for MAC mapping, IGMP for multicast, and DHCP for configuration.
                    </p>
                    <div className="space-y-1 text-[11px] text-blue-300/80 pt-1">
                      <div>• Diagnostics: ICMPv4 (Ping / Traceroute)</div>
                      <div>• MAC Resolution: ARP (Broadcast Flooding)</div>
                      <div>• Multicast: IGMPv1 / IGMPv2 / IGMPv3</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-purple-500/10 border border-purple-500/30 space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-purple-400" />
                      <span className="font-bold text-purple-300">ICMPv6 (Unified Autonomous Core)</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      In IPv6, ICMPv6 is mandatory and indispensable. It integrates Neighbor Discovery (NDP), SLAAC auto-addressing, router discovery (RS/RA), multicast listener discovery (MLD), and Path MTU Discovery into a single robust framework.
                    </p>
                    <div className="space-y-1 text-[11px] text-purple-300/80 pt-1">
                      <div>• MAC Resolution: ICMPv6 NDP (Solicited-Node Multicast)</div>
                      <div>• Addressing: SLAAC Router Advertisements</div>
                      <div>• Minimum MTU: 1280 Bytes with Zero Router Fragmentation</div>
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
                      Key Architectural Improvements in ICMPv6:
                    </span>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground leading-relaxed">
                      <li>
                        <strong className="text-foreground">Elimination of Broadcast Storms:</strong> ARP broadcast flooding is replaced by efficient ICMPv6 Neighbor Solicitations sent to targeted Solicited-Node Multicast addresses.
                      </li>
                      <li>
                        <strong className="text-foreground">Plug-and-Play SLAAC:</strong> Hosts automatically configure valid global IPv6 addresses from periodic ICMPv6 Router Advertisements without needing a DHCP server.
                      </li>
                      <li>
                        <strong className="text-foreground">Strict PMTUD:</strong> IPv6 routers never fragment packets in transit; they immediately send ICMPv6 Type 2 (Packet Too Big) to mandate sender MTU adaptation.
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

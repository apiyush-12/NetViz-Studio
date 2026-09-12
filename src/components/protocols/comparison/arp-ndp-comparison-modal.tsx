"use client";

import React, { useState } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Scale, X, Radio, ShieldCheck } from "lucide-react";

export function ArpNdpComparisonModal() {
  const [isOpen, setIsOpen] = useState(false);

  const comparisonRows = [
    {
      dimension: "Internet Layer Protocol",
      arp: "IPv4 (32-bit addresses, e.g. 192.168.1.10)",
      ndp: "IPv6 (128-bit addresses, e.g. 2001:db8::10)",
    },
    {
      dimension: "Framing & Protocol Stack",
      arp: "Direct Layer 2 frame (EtherType 0x0806). Not encapsulated in IP packets.",
      ndp: "ICMPv6 messages (Next Header 58, EtherType 0x86DD). Uses full IPv6 header.",
    },
    {
      dimension: "L2 Destination Mechanism",
      arp: "Broadcast (FF:FF:FF:FF:FF:FF) — Interrupts CPU of every host in the VLAN.",
      ndp: "Solicited-Node Multicast (FF02::1:FFxx:xxxx) — Filtered by NIC hardware ASIC.",
    },
    {
      dimension: "Resolution Messages",
      arp: "ARP Request (Opcode 1) and ARP Reply (Opcode 2).",
      ndp: "Neighbor Solicitation (NS, Type 135) and Neighbor Advertisement (NA, Type 136).",
    },
    {
      dimension: "Duplicate IP Detection",
      arp: "Gratuitous ARP (GARP / RFC 5227) — Optional, host-dependent.",
      ndp: "Duplicate Address Detection (DAD) — Mandatory step before assigning any IPv6 address.",
    },
    {
      dimension: "Router Discovery & SLAAC",
      arp: "None — Relies on separate DHCPv4 or static gateway configuration.",
      ndp: "Built-in Router Solicitation (RS, Type 133) & Router Advertisement (RA, Type 134) for SLAAC.",
    },
    {
      dimension: "Neighbor Unreachability Detection (NUD)",
      arp: "Passive timeout aging timers (typically 60s to 300s).",
      ndp: "Active NUD state machine (INCOMPLETE → REACHABLE → STALE → DELAY → PROBE).",
    },
    {
      dimension: "Security & Mitigations",
      arp: "Unauthenticated. Vulnerable to MITM; requires Switch Dynamic ARP Inspection (DAI).",
      ndp: "Supports Cryptographically Generated Addresses (CGA) and Secure Neighbor Discovery (SEND).",
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
        <span>ARP vs IPv6 NDP Comparison</span>
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
                    IPv4 ARP vs IPv6 Neighbor Discovery Protocol (NDP)
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    RFC 826 Broadcast Resolution vs RFC 4861 Multicast ICMPv6 Architecture
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
              {/* Top Architecture Highlight Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-500 text-xs">
                    <Radio className="h-4 w-4" />
                    <span>IPv4 ARP (RFC 826 / Layer 2 Broadcast)</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Floods broadcast requests to FF:FF:FF:FF:FF:FF. Has no native security; requires switch DAI to prevent poisoning.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-500 text-xs">
                    <ShieldCheck className="h-4 w-4" />
                    <span>IPv6 NDP (RFC 4861 / Multicast ICMPv6)</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Targeted Solicited-Node Multicast eliminates broadcast noise. Combines ARP, ICMP Redirect, and DHCP into a unified protocol.
                  </p>
                </div>
              </div>

              {/* Comprehensive Comparison Table */}
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                    <tr>
                      <th className="p-3 w-1/4">Feature / Metric</th>
                      <th className="p-3 w-3/8 text-amber-500">IPv4 ARP (RFC 826)</th>
                      <th className="p-3 w-3/8 text-emerald-500">IPv6 NDP (RFC 4861)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {comparisonRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-accent/40 transition-colors">
                        <td className="p-3 font-semibold text-foreground bg-muted/20">
                          {row.dimension}
                        </td>
                        <td className="p-3 text-muted-foreground leading-relaxed font-mono text-[11px]">
                          {row.arp}
                        </td>
                        <td className="p-3 text-foreground leading-relaxed font-mono text-[11px] bg-emerald-500/5">
                          {row.ndp}
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

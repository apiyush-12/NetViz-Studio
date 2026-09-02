"use client";

import React, { useState } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Scale, X } from "lucide-react";

export function Ipv4Ipv6ComparisonModal() {
  const [isOpen, setIsOpen] = useState(false);

  const comparisonRows = [
    {
      dimension: "Address Length & Space",
      ipv4: "32 bits (4 Bytes) -> ~4.29 Billion Addresses (Exhausted)",
      ipv6: "128 bits (16 Bytes) -> ~3.4 x 10^38 Addresses (Virtually Unlimited)",
    },
    {
      dimension: "Address Notation",
      ipv4: "Dotted-decimal (e.g. 192.168.1.1)",
      ipv6: "Hexadecimal colon with zero-compression (e.g. 2001:db8::1)",
    },
    {
      dimension: "Base Header Size",
      ipv4: "Variable (20 to 60 Bytes with Options field)",
      ipv6: "Fixed 40 Bytes (Streamlined for fast hardware parsing)",
    },
    {
      dimension: "Header Checksum",
      ipv4: "16-bit Header Checksum (Must be recalculated at every router hop)",
      ipv6: "NONE (Eliminated to accelerate router forwarding; L4 checksums mandatory)",
    },
    {
      dimension: "Packet Fragmentation",
      ipv4: "Performed by intermediate routers and source hosts",
      ipv6: "Source Host ONLY via Path MTU Discovery (PMTUD); routers never fragment",
    },
    {
      dimension: "Flow Identification & QoS",
      ipv4: "8-bit Type of Service (ToS / DSCP)",
      ipv6: "20-bit Flow Label + 8-bit Traffic Class (Enables fast ECMP routing)",
    },
    {
      dimension: "Address Autoconfiguration",
      ipv4: "DHCPv4 (Stateful) or Manual static configuration",
      ipv6: "SLAAC (Stateless ICMPv6 Router Advertisements) or DHCPv6",
    },
    {
      dimension: "Local Resolution Protocol",
      ipv4: "Broadcast ARP (Address Resolution Protocol)",
      ipv6: "Multicast ICMPv6 Neighbor Discovery Protocol (NDP / Solicited-Node)",
    },
    {
      dimension: "Optional Headers",
      ipv4: "Appended directly to base header via IHL (slow variable parsing)",
      ipv6: "Chained Extension Headers via 'Next Header' pointer (efficient daisy chain)",
    },
    {
      dimension: "NAT Requirement",
      ipv4: "Heavily reliant on NAT/PAT due to IPv4 address exhaustion",
      ipv6: "Native End-to-End global addressing; NAT is unnecessary",
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
        <span>IPv4 vs IPv6 Architectural Comparison</span>
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
                    IPv4 vs IPv6 Protocol Architecture & RFC Comparison
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    RFC 791 (IPv4) vs RFC 8200 (IPv6) In-Depth Architectural Differences
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
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                    <tr>
                      <th className="p-3 w-1/4">Architectural Metric</th>
                      <th className="p-3 w-3/8 text-blue-400">IPv4 (RFC 791)</th>
                      <th className="p-3 w-3/8 text-cyan-400">IPv6 (RFC 8200)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {comparisonRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-accent/40 transition-colors">
                        <td className="p-3 font-semibold text-foreground bg-muted/20">{row.dimension}</td>
                        <td className="p-3 text-muted-foreground leading-relaxed font-mono text-[11px] bg-blue-500/5">
                          {row.ipv4}
                        </td>
                        <td className="p-3 text-foreground leading-relaxed font-mono text-[11px] bg-cyan-500/5 font-medium">
                          {row.ipv6}
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

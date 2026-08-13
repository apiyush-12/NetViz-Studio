"use client";

import React, { useState } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Scale, X } from "lucide-react";

export function NetworkServicesComparisonModal() {
  const [isOpen, setIsOpen] = useState(false);

  const comparisonRows = [
    {
      dimension: "Primary Function",
      dhcp: "Host bootstrapping: assigns IP address, subnet mask, default gateway, and DNS servers to unconfigured hosts.",
      dns: "Name resolution: translates human-readable domain names (FQDNs) into routable IPv4 / IPv6 addresses.",
    },
    {
      dimension: "OSI Layer",
      dhcp: "Application (Layer 7) servicing Layer 3 network interface configuration.",
      dns: "Application (Layer 7) supporting all network applications (Web, Mail, APIs).",
    },
    {
      dimension: "Transport Protocol & Ports",
      dhcp: "UDP Port 67 (Server) and UDP Port 68 (Client).",
      dns: "UDP Port 53 (Standard queries) and TCP Port 53 (Zone transfers / responses > 512B).",
    },
    {
      dimension: "Communication Model",
      dhcp: "Broadcast discovery (255.255.255.255) locally on L2 segment; relayed across subnets via IP Helper / DHCP Relay (Option 82).",
      dns: "Hierarchical unicast queries across distributed global nameserver tiers (Root → TLD → Authoritative).",
    },
    {
      dimension: "Temporal Mechanics",
      dhcp: "Lease lifetimes (e.g. 24h) with renewal at T1 (50%) and rebinding at T2 (87.5%).",
      dns: "TTL (Time-to-Live) caching per record; resolvers cache answers until TTL expiration.",
    },
    {
      dimension: "Failure Impact",
      dhcp: "Clients fail to obtain IP configuration (self-assign APIPA 169.254.x.x) and cannot communicate outside link-local.",
      dns: "Clients have IP connectivity but cannot resolve hostnames (IP pings work, domain web requests fail).",
    },
    {
      dimension: "Security Threats",
      dhcp: "Rogue DHCP servers, DHCP starvation attacks (mitigated by DHCP Snooping & Option 82).",
      dns: "DNS cache poisoning, DNS amplification DDoS, Typosquatting (mitigated by DNSSEC, DoH, DoT).",
    },
  ];

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/10 cursor-pointer"
      >
        <Scale className="h-3.5 w-3.5" />
        <span>DHCP vs DNS Comparison</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <Card className="w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl border border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Scale className="h-4 w-4 text-primary" />
                  Network Services: DHCP vs DNS Architectural Comparison
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Side-by-side analysis of host bootstrapping vs name resolution protocols
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-4 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/80 bg-secondary/50 font-semibold text-foreground">
                      <th className="py-2.5 px-3 w-1/4 font-semibold text-foreground">
                        Architectural Dimension
                      </th>
                      <th className="py-2.5 px-3 w-[37.5%] text-blue-600 dark:text-blue-400 font-mono font-semibold">
                        DHCP (Host Configuration)
                      </th>
                      <th className="py-2.5 px-3 w-[37.5%] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                        DNS (Name Resolution)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {comparisonRows.map((row) => (
                      <tr key={row.dimension} className="hover:bg-secondary/30 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-foreground bg-secondary/20">
                          {row.dimension}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground leading-relaxed">
                          {row.dhcp}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground leading-relaxed">
                          {row.dns}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Insight Box */}
              <div className="p-3 bg-secondary/30 border border-border rounded-lg space-y-1.5 text-xs">
                <div className="font-semibold text-primary">Summary Architecture Insight:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-muted-foreground">
                  <div className="p-2.5 rounded bg-background/60 border border-border/50">
                    <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">DHCP Role:</span>
                    Brings a host online by automatically assigning its IP address, subnet mask, default gateway, and DNS resolver pointers.
                  </div>
                  <div className="p-2.5 rounded bg-background/60 border border-border/50">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">DNS Role:</span>
                    Allows configured hosts to translate human-friendly domain names (FQDNs) into IP addresses for connecting to websites, services, and APIs.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

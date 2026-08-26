"use client";

import React, { useState } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Scale, X } from "lucide-react";

export function NatPatComparisonModal() {
  const [isOpen, setIsOpen] = useState(false);

  const comparisonRows = [
    {
      dimension: "Full Name & RFC",
      snat: "Static NAT (1-to-1 Mapping)",
      pat: "PAT / NAPT (Port Address Translation Overload — RFC 3022)",
      dnat: "DNAT / Port Forwarding (Inbound WAN Mapping)",
    },
    {
      dimension: "Mapping Paradigm",
      snat: "Fixed 1-to-1 permanent IP assignment (1 Private IP = 1 Dedicated Public IP).",
      pat: "Many-to-1 Port Overload (Multiple LAN Hosts share 1 Public IP via unique L4 ports).",
      dnat: "1-to-1 Inbound Port Mapping (Public WAN Port -> Private Server IP/Port).",
    },
    {
      dimension: "Primary Use Case",
      snat: "Public servers needing consistent inbound/outbound IP identity (e.g. Mail Server).",
      pat: "Standard home & office LAN internet access (Hundreds of clients sharing 1 IP).",
      dnat: "Hosting internal web/SSH/game servers behind home or business firewalls.",
    },
    {
      dimension: "Public IP Pool Requirement",
      snat: "Requires N public IPv4 addresses for N internal hosts.",
      pat: "Requires only 1 public IPv4 address for up to ~65,535 concurrent socket streams.",
      dnat: "Uses router's WAN IP + specific port mappings (e.g. :8080 -> :80).",
    },
    {
      dimension: "Inbound Connection Initiation",
      snat: "Allowed (Inbound traffic to static public IP routes directly to internal host).",
      pat: "Blocked by default (Stateful filter drops unsolicited WAN connections).",
      dnat: "Explicitly Allowed on configured forward ports; all other ports dropped.",
    },
    {
      dimension: "Header Modification Level",
      snat: "Layer 3 Only (IP Header `srcIP` / `dstIP` rewritten).",
      snat_note: "Layer 3 & Layer 4 (IP Header + TCP/UDP `srcPort` / `dstPort` rewritten).",
      dnat: "Layer 3 & Layer 4 (IP Header + TCP/UDP `dstIp` / `dstPort` rewritten).",
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
        <span>Static NAT vs PAT vs DNAT Comparison</span>
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
                    NAT Architectural Flavors & RFC 3022 Comparison
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Static 1:1 NAT vs PAT Port Overload vs DNAT Port Forwarding
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
                      <th className="p-3 w-1/4">Feature / Metric</th>
                      <th className="p-3 w-1/4 text-blue-400">Static 1:1 NAT</th>
                      <th className="p-3 w-1/4 text-emerald-400">PAT / NAPT (Overload)</th>
                      <th className="p-3 w-1/4 text-purple-400">DNAT (Port Forward)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {comparisonRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-accent/40 transition-colors">
                        <td className="p-3 font-semibold text-foreground bg-muted/20">{row.dimension}</td>
                        <td className="p-3 text-muted-foreground leading-relaxed font-mono text-[11px]">{row.snat}</td>
                        <td className="p-3 text-foreground leading-relaxed font-mono text-[11px] bg-emerald-500/5">{row.pat}</td>
                        <td className="p-3 text-muted-foreground leading-relaxed font-mono text-[11px]">{row.dnat}</td>
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

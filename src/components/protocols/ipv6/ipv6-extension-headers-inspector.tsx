"use client";

import React from "react";
import { Link2, Layers, ArrowRight } from "lucide-react";
import { Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import type { Ipv6ExtensionHeader } from "@/features/protocols/ipv6/ipv6.types";

interface Ipv6ExtensionHeadersInspectorProps {
  extensionHeaders?: Ipv6ExtensionHeader[];
}

export function Ipv6ExtensionHeadersInspector({
  extensionHeaders,
}: Ipv6ExtensionHeadersInspectorProps) {
  const hasExtensions = extensionHeaders && extensionHeaders.length > 0;

  return (
    <div className="border border-border rounded-xl bg-card p-3 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Link2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span>IPv6 Extension Header Daisy-Chaining</span>
              <Badge
                variant="outline"
                className={hasExtensions ? "text-[9px] font-mono text-cyan-400 border-cyan-500/30" : "text-[9px] font-mono text-muted-foreground"}
              >
                {hasExtensions ? `${extensionHeaders.length} Chained Headers` : "No Extensions (Standard TCP)"}
              </Badge>
            </h3>
            <p className="text-[10.5px] text-muted-foreground">
              RFC 8200 Next Header Pointers · Eliminates Variable Base Header Overhead
            </p>
          </div>
        </div>
      </div>

      {/* Visual Header Chaining Diagram */}
      <div className="p-3 rounded-lg border border-border bg-secondary/10 space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="p-2 rounded bg-cyan-500/20 border border-cyan-500/40 text-center">
            <span className="text-[9px] text-muted-foreground block">Base Header (40B)</span>
            <strong className="text-cyan-300">IPv6 Header</strong>
            <span className="text-[9px] text-cyan-400 block mt-0.5">Next: {hasExtensions ? "0 (Hop-by-Hop)" : "6 (TCP)"}</span>
          </div>

          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />

          {hasExtensions &&
            extensionHeaders.map((ext, idx) => (
              <React.Fragment key={idx}>
                <div className="p-2 rounded bg-purple-500/20 border border-purple-500/40 text-center">
                  <span className="text-[9px] text-muted-foreground block">Ext Header ({ext.headerLength}B)</span>
                  <strong className="text-purple-300 capitalize">{ext.type}</strong>
                  <span className="text-[9px] text-purple-400 block mt-0.5">Next: {ext.nextHeader}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </React.Fragment>
            ))}

          <div className="p-2 rounded bg-emerald-500/20 border border-emerald-500/40 text-center">
            <span className="text-[9px] text-muted-foreground block">Upper Layer</span>
            <strong className="text-emerald-300">TCP Segment</strong>
            <span className="text-[9px] text-emerald-400 block mt-0.5">Port 443 (HTTPS)</span>
          </div>
        </div>
      </div>

      {/* Extension Header Details Cards */}
      {hasExtensions && (
        <div className="space-y-2">
          {extensionHeaders.map((ext, idx) => (
            <Card key={idx} className="border-border bg-secondary/20">
              <CardHeader className="pb-1.5 pt-2.5 px-3 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-purple-400" />
                  <span className="capitalize">{ext.type} Options Header</span>
                </CardTitle>
                <Badge variant="outline" className="text-[9px] font-mono">
                  Length: {ext.headerLength} Bytes
                </Badge>
              </CardHeader>
              <CardContent className="px-3 pb-2.5 space-y-1 font-mono text-[11px]">
                <div className="text-muted-foreground text-xs">{ext.details}</div>
                <div className="flex justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                  <span>Subsequent Header Protocol Number:</span>
                  <strong className="text-primary">{ext.nextHeader}</strong>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

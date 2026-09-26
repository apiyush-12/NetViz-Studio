"use client";

import React from "react";
import {
  Server,
  Network,
  Shield,
  Zap,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import type { IcmpNode } from "@/features/protocols/icmp/icmp.types";

interface IcmpNodeSummaryProps {
  node: IcmpNode;
}

export function IcmpNodeSummary({ node }: IcmpNodeSummaryProps) {
  const getNodeBadge = (type: IcmpNode["type"]) => {
    switch (type) {
      case "host":
        return <Badge variant="default" className="bg-blue-500/20 text-blue-400 border-blue-500/30">Client Host</Badge>;
      case "router":
        return <Badge variant="default" className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">L3 Router Gateway</Badge>;
      case "firewall":
        return <Badge variant="default" className="bg-red-500/20 text-red-400 border-red-500/30">Stateful Firewall</Badge>;
      case "server":
      default:
        return <Badge variant="default" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Target Server</Badge>;
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="py-3 px-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary border border-primary/20">
              {node.type === "host" ? (
                <Server className="h-4 w-4" />
              ) : node.type === "firewall" ? (
                <Shield className="h-4 w-4 text-red-400" />
              ) : (
                <Network className="h-4 w-4" />
              )}
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                {node.name}
                <span className="text-xs font-mono font-normal text-muted-foreground">({node.id})</span>
              </CardTitle>
              <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5 font-mono">
                <span>IP: <strong className="text-foreground">{node.ipAddress}</strong></span>
                {node.defaultGateway && (
                  <span>• Default GW: <strong className="text-foreground">{node.defaultGateway}</strong></span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {getNodeBadge(node.type)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3.5 text-xs">
        {/* Hardware & Network Properties Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-secondary/20 p-2.5 rounded-lg border border-border/40 font-mono">
          <div>
            <span className="text-[10px] text-muted-foreground block">INTERFACE MTU</span>
            <span className="font-semibold text-foreground">{node.interfaceMtu} Bytes</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block">SUBNET MASK</span>
            <span className="font-semibold text-foreground">{node.subnetMask}</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block">ICMP RATE LIMIT</span>
            <span className="font-semibold text-emerald-400">100 msgs/sec</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block">NODE STATUS</span>
            <span className="font-semibold text-blue-400 uppercase">{node.status}</span>
          </div>
        </div>

        {/* PMTUD Route Cache if present on Host */}
        {node.pathMtuCache && Object.keys(node.pathMtuCache).length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-purple-400" />
              <span>Kernel Path MTU (PMTUD) Route Cache</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(node.pathMtuCache).map(([dest, mtu]) => (
                <div
                  key={dest}
                  className="p-2 rounded-md bg-purple-500/10 border border-purple-500/20 flex items-center justify-between"
                >
                  <span className="font-mono text-purple-300 font-semibold">{dest}</span>
                  <Badge variant="outline" className="bg-purple-500/20 text-purple-300 font-mono text-[10px]">
                    Cached MTU: {mtu} Bytes
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Closed Ports if server */}
        {node.closedPorts && node.closedPorts.length > 0 && (
          <div className="flex items-center gap-2 pt-1 border-t border-border/40">
            <span className="text-[11px] text-muted-foreground">Closed UDP Ports (triggers Type 3 Code 3):</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {node.closedPorts.map((port) => (
                <span
                  key={port}
                  className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 font-mono font-bold text-[11px]"
                >
                  UDP {port}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

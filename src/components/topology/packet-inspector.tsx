"use client";

import React from "react";
import { NetworkPacket } from "@/features/topology/topology-types";
import { Badge } from "@/components/ui";
import { Layers } from "lucide-react";

export function PacketInspector({ packet }: { packet: NetworkPacket | null }) {
  if (!packet) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center text-xs text-muted-foreground italic border border-border rounded-lg bg-card">
        No packet selected for header inspection.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-lg p-3 text-xs space-y-3 overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-purple-400" />
          <h4 className="font-semibold text-foreground">Packet #{packet.packetNumber} Inspector</h4>
        </div>
        <Badge variant={packet.status === "delivered" ? "success" : packet.status === "dropped" ? "destructive" : "warning"}>
          {packet.status.toUpperCase()}
        </Badge>
      </div>

      {/* Frame / Ethernet Layer 2 */}
      <div className="space-y-1 bg-accent/30 rounded-md p-2 border border-border/50">
        <span className="font-semibold text-primary text-[10px] uppercase">Layer 2: Ethernet II Frame</span>
        <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
          <div>Src MAC: <span className="text-foreground">{packet.headers.sourceMac}</span></div>
          <div>Dst MAC: <span className="text-foreground">{packet.headers.destinationMac}</span></div>
        </div>
      </div>

      {/* IPv4 Layer 3 */}
      <div className="space-y-1 bg-accent/30 rounded-md p-2 border border-border/50">
        <span className="font-semibold text-emerald-400 text-[10px] uppercase">Layer 3: IPv4 Datagram</span>
        <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
          <div>Src IP: <span className="text-foreground">{packet.sourceIp}</span></div>
          <div>Dst IP: <span className="text-foreground">{packet.destinationIp}</span></div>
          <div>TTL: <span className="text-foreground">{packet.ttl}</span></div>
          <div>Protocol: <span className="text-foreground">{packet.protocol}</span></div>
        </div>
      </div>

      {/* Layer 4 / Payload */}
      <div className="space-y-1 bg-accent/30 rounded-md p-2 border border-border/50">
        <span className="font-semibold text-purple-400 text-[10px] uppercase">Layer 4 & Payload</span>
        <p className="text-[10px] font-mono text-muted-foreground">{packet.headers.payloadSummary || "No payload summary"}</p>
      </div>
    </div>
  );
}

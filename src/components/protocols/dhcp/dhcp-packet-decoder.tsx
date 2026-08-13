"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import type { Packet } from "@/features/simulation/simulation-types";
import type { DhcpOption } from "@/features/protocols/dhcp/dhcp.types";

interface DhcpPacketDecoderProps {
  packet: Packet | null;
}

export function DhcpPacketDecoder({ packet }: DhcpPacketDecoderProps) {
  if (!packet || !packet.payload) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">DHCP Packet & Options Inspector (RFC 2132)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground py-4 text-center">
            Select a DHCP packet from the canvas or stream tracker to decode its frame options.
          </p>
        </CardContent>
      </Card>
    );
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = typeof packet.payload === "string" ? JSON.parse(packet.payload) : (packet.payload as unknown as Record<string, unknown>) || {};
  } catch {
    payload = {};
  }
  const options = (payload.options as DhcpOption[]) || [];
  const messageType = payload.messageType as string;
  const xid = (payload.xid as number) || 0x39a2f14c;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">DHCP Frame Header: {packet.label}</CardTitle>
            <Badge variant="default" className="font-mono text-xs">
              UDP Port 67 ↔ 68
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 font-mono text-xs">
          {/* Header Fields Table */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="p-2 bg-secondary/40 rounded border border-border">
              <span className="text-muted-foreground block text-[10px]">Operation (OP)</span>
              <span className="font-bold text-foreground">
                {packet.label.includes("OFFER") || packet.label.includes("ACK")
                  ? "BOOTREPLY (2)"
                  : "BOOTREQUEST (1)"}
              </span>
            </div>
            <div className="p-2 bg-secondary/40 rounded border border-border">
              <span className="text-muted-foreground block text-[10px]">Transaction ID (XID)</span>
              <span className="font-bold text-primary">0x{xid.toString(16).toUpperCase()}</span>
            </div>
            <div className="p-2 bg-secondary/40 rounded border border-border">
              <span className="text-muted-foreground block text-[10px]">Magic Cookie</span>
              <span className="font-bold text-emerald-400">0x63825363 (DHCP)</span>
            </div>
            <div className="p-2 bg-secondary/40 rounded border border-border">
              <span className="text-muted-foreground block text-[10px]">Client IP (ciaddr)</span>
              <span>{(payload.ciaddr as string) || "0.0.0.0"}</span>
            </div>
            <div className="p-2 bg-secondary/40 rounded border border-border">
              <span className="text-muted-foreground block text-[10px]">Your IP (yiaddr)</span>
              <span className="font-bold text-emerald-400">
                {(payload.yiaddr as string) || "0.0.0.0"}
              </span>
            </div>
            <div className="p-2 bg-secondary/40 rounded border border-border">
              <span className="text-muted-foreground block text-[10px]">Client MAC (chaddr)</span>
              <span className="text-primary">{(payload.chaddr as string) || "Unknown"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Decoded Options Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Decoded DHCP Options (RFC 2132)</CardTitle>
        </CardHeader>
        <CardContent>
          {options.length === 0 ? (
            <div className="p-2 text-xs font-mono bg-secondary/40 rounded border border-border">
              <span className="text-muted-foreground">Message Type: </span>
              <span className="font-bold text-primary">{messageType}</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-border text-left font-sans text-muted-foreground">
                    <th className="py-2">Option Tag</th>
                    <th className="py-2">Option Name</th>
                    <th className="py-2">Decoded Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {options.map((opt) => (
                    <tr key={opt.code} className="hover:bg-accent/40">
                      <td className="py-2">
                        <Badge variant="outline" className="text-[10px]">
                          Option {opt.code}
                        </Badge>
                      </td>
                      <td className="py-2 text-foreground font-sans font-medium">{opt.name}</td>
                      <td className="py-2 text-primary font-bold">
                        {Array.isArray(opt.value) ? opt.value.join(", ") : opt.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

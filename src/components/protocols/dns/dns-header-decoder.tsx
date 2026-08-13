"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import type { Packet } from "@/features/simulation/simulation-types";
import type { DnsHeaderFlags, DnsResourceRecord } from "@/features/protocols/dns/dns.types";

interface DnsHeaderDecoderProps {
  packet: Packet | null;
}

export function DnsHeaderDecoder({ packet }: DnsHeaderDecoderProps) {
  if (!packet || !packet.payload) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">DNS Message & Header Flags Decoder (RFC 1035)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground py-4 text-center">
            Select a DNS packet from the canvas or stream tracker to decode its header flags and sections.
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
  const flags = (payload.flags as DnsHeaderFlags) || {
    qr: true,
    opcode: 0,
    aa: true,
    tc: false,
    rd: true,
    ra: true,
    rcode: "NOERROR",
  };
  const answers = (payload.answers as DnsResourceRecord[]) || [];

  return (
    <div className="space-y-4">
      {/* 1. Header Flags Matrix */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">DNS Header Flags: {packet.label}</CardTitle>
            <Badge variant="default" className="font-mono text-xs">
              UDP Port 53
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 font-mono text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2 bg-secondary/40 rounded border border-border">
              <span className="text-muted-foreground block text-[10px]">QR (Query/Response)</span>
              <span className="font-bold text-foreground">
                {flags.qr ? "1 (Response)" : "0 (Query)"}
              </span>
            </div>
            <div className="p-2 bg-secondary/40 rounded border border-border">
              <span className="text-muted-foreground block text-[10px]">AA (Authoritative)</span>
              <span className="font-bold text-primary">{flags.aa ? "1 (True)" : "0 (False)"}</span>
            </div>
            <div className="p-2 bg-secondary/40 rounded border border-border">
              <span className="text-muted-foreground block text-[10px]">RD (Recursion Desired)</span>
              <span className="font-bold text-foreground">{flags.rd ? "1 (True)" : "0 (False)"}</span>
            </div>
            <div className="p-2 bg-secondary/40 rounded border border-border">
              <span className="text-muted-foreground block text-[10px]">RA (Recursion Avail)</span>
              <span className="font-bold text-foreground">{flags.ra ? "1 (True)" : "0 (False)"}</span>
            </div>
            <div className="p-2 bg-secondary/40 rounded border border-border">
              <span className="text-muted-foreground block text-[10px]">RCODE (Return Code)</span>
              <span
                className={`font-bold ${
                  flags.rcode === "NOERROR"
                    ? "text-emerald-400"
                    : flags.rcode === "NXDOMAIN"
                      ? "text-amber-400"
                      : "text-rose-400"
                }`}
              >
                {flags.rcode}
              </span>
            </div>
            <div className="p-2 bg-secondary/40 rounded border border-border">
              <span className="text-muted-foreground block text-[10px]">Opcode</span>
              <span className="font-bold text-foreground">0 (Standard Query)</span>
            </div>
            <div className="p-2 bg-secondary/40 rounded border border-border">
              <span className="text-muted-foreground block text-[10px]">TC (Truncation)</span>
              <span>{flags.tc ? "1 (Truncated)" : "0 (No)"}</span>
            </div>
            <div className="p-2 bg-secondary/40 rounded border border-border">
              <span className="text-muted-foreground block text-[10px]">Answer Count</span>
              <span className="font-bold text-primary">{answers.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Answer Section */}
      {answers.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Answer Section Resource Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-border text-left font-sans text-muted-foreground">
                    <th className="py-2">Name</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Class</th>
                    <th className="py-2">TTL</th>
                    <th className="py-2">RDATA (Value)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {answers.map((ans, i) => (
                    <tr key={i} className="hover:bg-accent/40">
                      <td className="py-2 font-bold text-foreground">{ans.name}</td>
                      <td className="py-2">
                        <Badge variant="outline" className="text-[10px]">
                          {ans.type}
                        </Badge>
                      </td>
                      <td className="py-2 text-muted-foreground">IN</td>
                      <td className="py-2 text-muted-foreground">{ans.ttl}s</td>
                      <td className="py-2 text-emerald-400 font-bold">{ans.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

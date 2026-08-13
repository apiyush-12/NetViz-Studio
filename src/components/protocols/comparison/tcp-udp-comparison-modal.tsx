"use client";

import React, { useState } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Scale, X } from "lucide-react";

export function TcpUdpComparisonModal() {
  const [isOpen, setIsOpen] = useState(false);

  const comparisonRows = [
    {
      dimension: "Full Name & RFC",
      tcp: "Transmission Control Protocol (RFC 793 / 9293)",
      udp: "User Datagram Protocol (RFC 768)",
    },
    {
      dimension: "Connection Paradigm",
      tcp: "Connection-Oriented (Strict 3-Way SYN → SYN-ACK → ACK Handshake)",
      udp: "Connectionless / Stateless (Immediate fire-and-forget datagrams)",
    },
    {
      dimension: "Delivery Guarantee",
      tcp: "100% Reliable (ACK tracking, Retransmission timers, Sequence numbers)",
      udp: "Best-Effort (Packets can be lost, reordered, or duplicated without notice)",
    },
    {
      dimension: "Data Ordering",
      tcp: "Guaranteed In-Order (Receiver reassembles out-of-order segments)",
      udp: "No Ordering (Packets delivered as they arrive at destination)",
    },
    {
      dimension: "Flow & Congestion Control",
      tcp: "Advanced (Sliding Window, CWND, Slow Start, AIMD, Fast Retransmit)",
      udp: "None (Application layer must manage rate limits and network buffering)",
    },
    {
      dimension: "Header Size & Overhead",
      tcp: "20–60 Bytes (Source/Dest Port, Seq, Ack, Offset, Flags, Window, Checksum, Options)",
      udp: "Fixed 8 Bytes (Source Port, Dest Port, Length, Checksum)",
    },
    {
      dimension: "Latency & Speed",
      tcp: "Higher latency due to connection setup and round-trip ACK delays",
      udp: "Ultra-low latency with near-zero transmission overhead",
    },
    {
      dimension: "Addressing / Broadcast",
      tcp: "Unicast Point-to-Point only (Single socket pair)",
      udp: "Unicast, Multicast, and Broadcast supported",
    },
    {
      dimension: "Common Real-World Uses",
      tcp: "Web (HTTP/HTTPS), Secure Shell (SSH), File Transfer (FTP), Email (SMTP)",
      udp: "DNS (UDP 53), DHCP (UDP 67/68), VoIP, Live Video Streaming, Gaming",
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
        TCP vs UDP Comparison
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <Card className="w-full max-w-4xl max-h-[85vh] flex flex-col border border-border shadow-2xl bg-card">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Scale className="h-4 w-4 text-primary" />
                  Transport Layer: TCP vs UDP Architectural Comparison
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Side-by-side analysis of connection-oriented vs connectionless transport protocols
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
                      <th className="py-2.5 px-3 w-1/4">Architectural Dimension</th>
                      <th className="py-2.5 px-3 w-[37.5%] text-blue-600 dark:text-blue-400 font-mono font-semibold">
                        TCP (Reliable Stream)
                      </th>
                      <th className="py-2.5 px-3 w-[37.5%] text-amber-600 dark:text-amber-400 font-mono font-semibold">
                        UDP (Datagram)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {comparisonRows.map((row) => (
                      <tr
                        key={row.dimension}
                        className="hover:bg-secondary/30 transition-colors"
                      >
                        <td className="py-2.5 px-3 font-medium text-foreground bg-secondary/20">
                          {row.dimension}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground leading-relaxed">
                          {row.tcp}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground leading-relaxed">
                          {row.udp}
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
                    <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">When to choose TCP:</span>
                    When data accuracy is non-negotiable (e.g. web pages, financial transactions, file downloads, authentication tokens).
                  </div>
                  <div className="p-2.5 rounded bg-background/60 border border-border/50">
                    <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">When to choose UDP:</span>
                    When timeliness and minimum latency outweigh perfect reliability (e.g. real-time voice, video streaming, DNS lookups, multiplayer game physics).
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

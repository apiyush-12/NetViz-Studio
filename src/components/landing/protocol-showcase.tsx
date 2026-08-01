"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PROTOCOL_CATALOG } from "@/features/landing/landing-content";
import { Card, CardContent, Button, Badge } from "@/components/ui";
import { ArrowRight, CheckCircle2, Layers, Activity, Lock } from "lucide-react";

export function ProtocolShowcase() {
  const [selectedId, setSelectedId] = useState<string>("tcp");

  const selectedProtocol = PROTOCOL_CATALOG.find((p) => p.id === selectedId) || PROTOCOL_CATALOG[0];

  return (
    <section id="protocols" className="py-16 md:py-24 border-t border-border bg-card/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-mono uppercase tracking-widest text-primary font-bold">Deep Layer Inspection</p>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            From packet creation to protocol decisions
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Select a protocol below to preview its state machine, header structures, and frame delivery behavior.
          </p>
        </div>

        {/* Interactive Protocol Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
          {PROTOCOL_CATALOG.map((proto) => {
            const isSelected = proto.id === selectedId;
            const isAvailable = proto.status === "available";

            return (
              <button
                key={proto.id}
                onClick={() => setSelectedId(proto.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all border flex items-center gap-2 ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                    : isAvailable
                    ? "bg-card border-border text-foreground hover:bg-secondary"
                    : "bg-secondary/40 border-border/50 text-muted-foreground opacity-60 hover:opacity-100"
                }`}
              >
                <span>{proto.name.split(" ")[0]}</span>
                {!isAvailable && <Lock className="h-3 w-3 opacity-60" />}
              </button>
            );
          })}
        </div>

        {/* Interactive Selected Protocol Inspection Card */}
        <Card className="border border-border bg-card/90 shadow-2xl overflow-hidden max-w-5xl mx-auto">
          <CardContent className="p-6 md:p-8 grid md:grid-cols-12 gap-8 items-center">
            {/* Left Column: Metadata & Features */}
            <div className="md:col-span-6 space-y-5">
              <div className="flex items-center gap-2">
                <Badge variant={selectedProtocol.status === "available" ? "success" : "secondary"} className="text-xs">
                  {selectedProtocol.status === "available" ? "Fully Interactive" : selectedProtocol.status}
                </Badge>
                <span className="text-xs font-mono text-muted-foreground">{selectedProtocol.layer}</span>
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-foreground">{selectedProtocol.name}</h3>
                <p className="text-xs font-mono text-primary font-semibold mt-1">{selectedProtocol.category}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
                  {selectedProtocol.description}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/60">
                <p className="text-xs font-bold uppercase tracking-wider text-foreground">Key Technical Concepts</p>
                <ul className="space-y-2">
                  {selectedProtocol.keyFeatures.map((feat) => (
                    <li key={feat} className="text-xs text-foreground/90 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2">
                <Link href={selectedProtocol.href}>
                  <Button className="w-full sm:w-auto text-xs font-semibold gap-2">
                    <span>Explore {selectedProtocol.name.split(" ")[0]} Visualizer</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Visual Frame Flow Preview */}
            <div className="md:col-span-6 bg-secondary/30 p-5 rounded-2xl border border-border space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-primary" /> Visual Frame Step Trace
                </span>
                <span className="text-[10px] text-muted-foreground uppercase">{selectedId.toUpperCase()}</span>
              </div>

              {selectedId === "tcp" ? (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 flex items-center justify-between">
                    <span>1. [SYN] Host → Server</span>
                    <span className="text-[10px] opacity-75">Seq=100 Win=65535</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
                    <span>2. [SYN-ACK] Server → Host</span>
                    <span className="text-[10px] opacity-75">Seq=300 Ack=101</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 flex items-center justify-between">
                    <span>3. [ACK] Host → Server</span>
                    <span className="text-[10px] opacity-75">Ack=301 ESTABLISHED</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-300 flex items-center justify-between">
                    <span>4. [DATA] Host → Server</span>
                    <span className="text-[10px] opacity-75">Len=1460 bytes</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground italic font-sans pt-1">
                    See sequence numbers, acknowledgements, window behavior, packet loss, and retransmission.
                  </p>
                </div>
              ) : selectedId === "udp" ? (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-between">
                    <span>1. [UDP DATAGRAM 1] Host → Server</span>
                    <span className="text-[10px] opacity-75">SrcPort=54321 DstPort=53</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-between">
                    <span>2. [UDP DATAGRAM 2] Host → Server</span>
                    <span className="text-[10px] opacity-75">Length=512 bytes</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 flex items-center justify-between">
                    <span>3. [UDP DATAGRAM 3] DROPPED</span>
                    <span className="text-[10px] opacity-75">No ACK Returned</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground italic font-sans pt-1">
                    Observe connectionless delivery, low overhead, and the effect of unrecovered packet loss.
                  </p>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-muted-foreground space-y-2">
                  <Layers className="h-8 w-8 mx-auto text-primary opacity-60" />
                  <p>Interactive preview available for TCP and UDP transport protocols.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center pt-2">
          <Link href="/protocols">
            <Button size="lg" variant="outline" className="font-semibold text-xs gap-2">
              <span>Explore All Protocols Catalog</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

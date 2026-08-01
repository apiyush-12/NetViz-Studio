"use client";

import React from "react";
import { Eye, Sliders, Brain, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui";

const VALUE_ITEMS = [
  {
    icon: Eye,
    title: "Visualize",
    accentColor: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    description: "Watch packets, acknowledgements, 3-way handshakes, broadcasts, route updates, retransmissions, and link failures live.",
    bullets: ["Packet traversal step-by-step", "TCP SYN/ACK state machines", "Color-coded frame inspection"],
  },
  {
    icon: Sliders,
    title: "Configure",
    accentColor: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    description: "Build topologies, assign IP interface addresses, configure static routes, adjust link latency, and test connectivity.",
    bullets: ["Drag & drop network canvas", "Host, switch & router configuration", "Dynamic fault injection"],
  },
  {
    icon: Brain,
    title: "Understand",
    accentColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    description: "Inspect each event, packet header field, device table, and routing decision through guided step-by-step explanations.",
    bullets: ["Layer-by-layer header inspection", "Live ARP & MAC address tables", "Guided labs with auto-validation"],
  },
];

export function ValueProposition() {
  return (
    <section className="py-16 md:py-24 border-t border-border bg-card/40">
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-mono uppercase tracking-widest text-primary font-bold">Platform Value</p>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Networking concepts become easier when you can see them.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Move beyond static diagrams and dry text. NetViz Studio provides an interactive sandbox to experiment, configure, and master networking fundamentals.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {VALUE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="border border-border bg-card/80 shadow-md hover:border-primary/50 transition-all group">
                <CardContent className="p-6 space-y-4">
                  <div className={`h-12 w-12 rounded-2xl border flex items-center justify-center ${item.accentColor} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="text-xl font-bold text-foreground">{item.title}</h3>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>

                  <ul className="space-y-2 pt-2 border-t border-border/60">
                    {item.bullets.map((b) => (
                      <li key={b} className="text-xs text-foreground/90 flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

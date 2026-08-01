"use client";

import React from "react";
import { BookOpen, Sliders, Play, Search, ArrowRight } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Choose a Concept",
    description: "Select a protocol module, guided lab challenge, CIDR subnetting exercise, or custom network topology.",
    icon: BookOpen,
  },
  {
    step: "02",
    title: "Configure Scenario",
    description: "Change IPv4 interface addresses, add static routes, adjust link latency, set drop rates, or break links.",
    icon: Sliders,
  },
  {
    step: "03",
    title: "Run Simulation",
    description: "Play packet forwarding automatically or step through the network one event and handshake at a time.",
    icon: Play,
  },
  {
    step: "04",
    title: "Inspect & Understand",
    description: "Inspect header fields, ARP/MAC tables, routing decisions, event timelines, and detailed explanations.",
    icon: Search,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 border-t border-border bg-card/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-mono uppercase tracking-widest text-primary font-bold">Simple 4-Step Process</p>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            How NetViz Studio Works
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Designed for interactive discovery—from initial concept selection to deep packet header inspection.
          </p>
        </div>

        {/* Connected 4-Step Sequence Layout */}
        <div className="grid md:grid-cols-4 gap-6 relative">
          {STEPS.map((s, index) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="p-6 rounded-2xl border border-border bg-card/80 shadow-md relative space-y-4 flex flex-col justify-between group hover:border-primary/50 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-black text-primary/40 group-hover:text-primary transition-colors">
                      {s.step}
                    </span>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-foreground">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                </div>

                {index < STEPS.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-muted-foreground">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

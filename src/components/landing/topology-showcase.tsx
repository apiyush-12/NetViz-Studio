"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Monitor, Network, Router, Server, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent, Button, Badge } from "@/components/ui";

const TOPOLOGY_NODES = [
  { id: "pc1", name: "PC-1", ip: "192.168.1.10/24", icon: Monitor, type: "Host" },
  { id: "sw1", name: "Switch-1", ip: "VLAN 1 (Unmanaged)", icon: Network, type: "L2 Switch" },
  { id: "r1", name: "Router-1", ip: "eth0: 192.168.1.1/24 | eth1: 10.0.0.1/30", icon: Router, type: "L3 Router" },
  { id: "r2", name: "Router-2", ip: "eth0: 10.0.0.2/30 | eth1: 192.168.2.1/24", icon: Router, type: "L3 Router" },
  { id: "sw2", name: "Switch-2", ip: "VLAN 1 (Unmanaged)", icon: Network, type: "L2 Switch" },
  { id: "server", name: "Web Server", ip: "192.168.2.10/24", icon: Server, type: "Server" },
];

export function TopologyShowcase() {
  const [activeStep, setActiveStep] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % TOPOLOGY_NODES.length);
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="topology" className="py-16 md:py-24 border-t border-border bg-card/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-mono uppercase tracking-widest text-primary font-bold">Interactive Design Workspace</p>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Build the network. Then watch it operate.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Construct custom multi-router subnets, configure IP interfaces and static routes, inject link failures, and trace ICMP pings live on screen.
          </p>
        </div>

        {/* Topology Diagram Animation Preview Card */}
        <Card className="border border-border bg-card/90 shadow-2xl overflow-hidden max-w-5xl mx-auto">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                  Simulated End-to-End ICMP Ping Traversal Path
                </h3>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                ICMP Echo Request → Reply
              </Badge>
            </div>

            {/* Topology Flow Path Diagram */}
            <div className="relative py-8 px-4 bg-secondary/30 rounded-2xl border border-border overflow-x-auto grid-bg">
              <div className="flex items-center justify-between min-w-[700px] gap-2 px-4">
                {TOPOLOGY_NODES.map((node, index) => {
                  const Icon = node.icon;
                  const isActive = activeStep === index;
                  const isPassed = activeStep > index;

                  return (
                    <React.Fragment key={node.id}>
                      {/* Device Node Box */}
                      <div className="flex flex-col items-center space-y-2 relative group z-10 shrink-0">
                        <div
                          className={`h-12 w-12 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${
                            isActive
                              ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(59,130,246,0.6)] scale-110"
                              : isPassed
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                              : "bg-card text-muted-foreground border-border"
                          }`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>

                        <div className="text-center max-w-[100px]">
                          <p className="text-xs font-bold text-foreground truncate">{node.name}</p>
                          <p className="text-[9px] font-mono text-muted-foreground truncate">{node.type}</p>
                        </div>
                      </div>

                      {/* Link Line Connector between nodes */}
                      {index < TOPOLOGY_NODES.length - 1 && (
                        <div className="flex-1 h-0.5 bg-border relative mx-1 min-w-[40px]">
                          {isActive && (
                            <div className="absolute top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,1)] animate-ping left-1/2" />
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Active Node Interface Configuration Info Box */}
            <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Active Packet Location</span>
                <p className="font-bold text-foreground flex items-center gap-2">
                  <span className="text-primary font-extrabold">{TOPOLOGY_NODES[activeStep].name}</span> — {TOPOLOGY_NODES[activeStep].type}
                </p>
                <p className="text-muted-foreground">{TOPOLOGY_NODES[activeStep].ip}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-[11px]">
                  Link Status: 1000 Mbps UP
                </span>
              </div>
            </div>

            {/* Feature Bullets */}
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-2">
              <div className="p-3 rounded-xl border border-border bg-secondary/20 space-y-1">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Drag & Drop Canvas
                </span>
                <p className="text-muted-foreground text-[11px]">Add hosts, switches, routers, and firewalls</p>
              </div>

              <div className="p-3 rounded-xl border border-border bg-secondary/20 space-y-1">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Interface Addressing
                </span>
                <p className="text-muted-foreground text-[11px]">Assign IP addresses and subnets per port</p>
              </div>

              <div className="p-3 rounded-xl border border-border bg-secondary/20 space-y-1">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Static & Dynamic Routes
                </span>
                <p className="text-muted-foreground text-[11px]">Configure L3 routing tables & gateways</p>
              </div>

              <div className="p-3 rounded-xl border border-border bg-secondary/20 space-y-1">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Failure Injection
                </span>
                <p className="text-muted-foreground text-[11px]">Cut links and observe failover behavior</p>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-2 text-center">
              <Link href="/topology">
                <Button size="lg" className="font-bold gap-2 text-xs px-6">
                  <span>Build a Topology in Sandbox</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

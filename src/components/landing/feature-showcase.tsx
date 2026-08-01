"use client";

import React from "react";
import Link from "next/link";
import {
  Layers,
  GitBranch,
  Calculator,
  FlaskConical,
  Search,
  Table,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { CORE_FEATURES } from "@/features/landing/landing-content";
import { Card, CardContent, Badge, Button } from "@/components/ui";

const iconMap: Record<string, React.ElementType> = {
  Layers,
  GitBranch,
  Calculator,
  FlaskConical,
  Search,
  Table,
};

const PROTOCOL_BADGES = [
  { name: "TCP", status: "available" },
  { name: "UDP", status: "available" },
  { name: "ARP", status: "available" },
  { name: "ICMP", status: "available" },
  { name: "DHCP", status: "in-development" },
  { name: "DNS", status: "in-development" },
  { name: "HTTP", status: "in-development" },
  { name: "NAT", status: "in-development" },
  { name: "VLAN", status: "in-development" },
  { name: "OSPF", status: "planned" },
  { name: "BGP", status: "planned" },
  { name: "TLS", status: "planned" },
  { name: "STP", status: "planned" },
];

export function FeatureShowcase() {
  return (
    <section id="features" className="py-16 md:py-24 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-mono uppercase tracking-widest text-primary font-bold">Comprehensive Capabilities</p>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Everything you need to master computer networking
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Explores protocol details across every layer—from raw binary subnetting to dynamic packet routing and state machines.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CORE_FEATURES.map((feature) => {
            const Icon = iconMap[feature.iconName] || Layers;
            return (
              <Card
                key={feature.id}
                className="border border-border bg-card/90 shadow-md hover:border-primary/50 transition-all flex flex-col justify-between"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="success" className="text-[10px] gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Available Now
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-foreground">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {feature.details && (
                    <ul className="space-y-1.5 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                      {feature.details.map((d) => (
                        <li key={d} className="flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-primary" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>

                <div className="p-6 pt-0">
                  <Link href={feature.href}>
                    <Button variant="ghost" size="sm" className="w-full text-xs font-semibold gap-1.5 justify-between hover:bg-secondary">
                      <span>Explore {feature.title}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Protocol Availability Matrix Sub-Card */}
        <div className="p-6 rounded-2xl border border-border bg-secondary/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Protocol Implementation Status Matrix
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Accurate module status across available, in-development, and planned networking protocols.
              </p>
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Available
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> In Development
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-slate-500" /> Planned
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {PROTOCOL_BADGES.map((p) => (
              <span
                key={p.name}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold border ${
                  p.status === "available"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : p.status === "in-development"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    : "bg-secondary border-border text-muted-foreground opacity-75"
                }`}
              >
                {p.name}
                {p.status === "available" && <CheckCircle2 className="h-3 w-3" />}
                {p.status === "in-development" && <Clock className="h-3 w-3" />}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

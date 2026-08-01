"use client";

import Link from "next/link";
import { ArrowRight, Network, Search, BookOpen, Clock, Zap, CheckCircle2, Play, Activity, Calculator, Layers, SearchX } from "lucide-react";
import { AppHeader } from "@/components/layout/app-sidebar";
import { Button, Card, CardContent, Badge, Input } from "@/components/ui";
import { ProtocolCard } from "@/components/protocols/protocol-card";
import { QuickCidrWidget } from "@/components/cidr/cidr-calculator-view";
import { getAllProtocols } from "@/features/protocols/registry";
import { PROTOCOL_CATEGORIES } from "@/lib/constants";
import { platformStats } from "@/data/protocol-catalog";
import { labRegistry } from "@/features/labs/lab-registry";
import { loadAllLabProgress } from "@/features/labs/lab-persistence";
import { useState } from "react";

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const protocols = getAllProtocols();
  const allLabs = labRegistry.getAllLabs();
  const allProgress = loadAllLabProgress();

  const q = search.trim().toLowerCase();

  // 1. Filter Labs
  const filteredLabs = q
    ? allLabs.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.topic.toLowerCase().includes(q) ||
          l.difficulty.toLowerCase().includes(q) ||
          l.protocols.some((p) => p.toLowerCase().includes(q))
      )
    : allLabs.slice(0, 6);

  // 2. Filter Simulations & Tools
  const featuredSimulations = [
    {
      id: "sim-tcp",
      title: "TCP 3-Way Handshake & Flow",
      description: "Watch SYN, SYN-ACK, ACK, sequence numbers, data transfer, and RTO retransmissions.",
      category: "Transport",
      tag: "TCP / IP",
      badge: "Interactive",
      href: "/protocols/tcp",
      icon: Activity,
    },
    {
      id: "sim-udp",
      title: "UDP Datagram Flow",
      description: "Connectionless fire-and-forget datagram streaming with optional packet loss.",
      category: "Transport",
      tag: "UDP / IP",
      badge: "Connectionless",
      href: "/protocols/udp",
      icon: Activity,
    },
    {
      id: "tool-topology",
      title: "Network Topology Lab",
      description: "Drag hosts, switches, routers, and firewalls onto canvas to build custom networks.",
      category: "Workspace",
      tag: "React Flow",
      badge: "Full Canvas",
      href: "/topology",
      icon: Network,
    },
  ];

  const filteredSimulations = q
    ? featuredSimulations.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.tag.toLowerCase().includes(q)
      )
    : featuredSimulations;

  // 3. Filter CIDR Section
  const cidrKeywords = ["cidr", "subnet", "calculator", "ip", "addressing", "mask", "prefix"];
  const showCidrSection = !q || cidrKeywords.some((kw) => kw.includes(q) || q.includes(kw));

  // 4. Filter Protocols
  const filteredProtocols = q
    ? protocols.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.layer.toLowerCase().includes(q)
      )
    : protocols;

  const hasAnyResults =
    filteredLabs.length > 0 ||
    filteredSimulations.length > 0 ||
    showCidrSection ||
    filteredProtocols.length > 0;

  return (
    <>
      <AppHeader
        title="Learner Dashboard"
        description="Interactive Network Protocol Visualization Platform"
      />

      <div className="p-4 md:p-6 space-y-8 max-w-7xl mx-auto">
        {/* Hero */}
        <section className="relative rounded-2xl border border-border bg-card p-6 md:p-10 overflow-hidden shadow-lg">
          <div className="absolute inset-0 grid-bg opacity-30" aria-hidden="true" />
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Network className="h-8 w-8 text-primary" />
              <Badge variant="success">Interactive Platform</Badge>
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-3">
              Design, Simulate, and Master Computer Networks
            </h2>
            <p className="text-muted-foreground text-sm md:text-base mb-6 leading-relaxed">
              Interactive workspace for network topology design, packet-flow simulations, live protocol inspections, and 20 hands-on guided labs.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/topology">
                <Button size="lg" variant="default" className="gap-2 font-semibold">
                  <Network className="h-5 w-5" /> Topology Builder
                </Button>
              </Link>
              <Link href="/labs">
                <Button size="lg" variant="outline" className="gap-2 font-semibold">
                  <BookOpen className="h-5 w-5 text-primary" /> Explore 20 Interactive Labs
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Search + Stats Bar */}
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 h-10 text-xs"
              placeholder="Search protocols, simulations, CIDR calculator, or labs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search protocols and labs"
            />
          </div>
          <div className="flex gap-4 text-center">
            <StatBox label="Protocols" value={platformStats.protocolsTotal} />
            <StatBox label="Simulations" value={platformStats.implemented} />
            <StatBox label="Interactive Labs" value={allLabs.length} suffix=" Active" />
          </div>
        </div>

        {!hasAnyResults && (
          <div className="p-12 text-center border border-border rounded-xl bg-card space-y-3">
            <SearchX className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="font-semibold text-base">No results found for &quot;{search}&quot;</h3>
            <p className="text-xs text-muted-foreground">Try searching for keywords like &apos;TCP&apos;, &apos;OSPF&apos;, &apos;CIDR&apos;, &apos;subnet&apos;, or &apos;ping&apos;.</p>
            <Button size="sm" variant="outline" onClick={() => setSearch("")} className="mt-2 text-xs">
              Clear Search Filter
            </Button>
          </div>
        )}

        {/* Section 1: Interactive Guided Labs */}
        {filteredLabs.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" /> Interactive Guided Labs ({filteredLabs.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Hands-on network configuration, packet simulation, prediction, and troubleshooting labs.
                </p>
              </div>

              <Link href="/labs">
                <Button size="sm" variant="ghost" className="gap-1 text-xs">
                  View All {allLabs.length} Labs <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLabs.map((lab) => {
                const progress = allProgress[lab.id];
                const isCompleted = progress?.status === "completed";
                const isInProgress = progress?.status === "in-progress";

                return (
                  <Card key={lab.id} className="flex flex-col justify-between hover:border-primary/50 transition-all hover:shadow-md group bg-card/80 border-border">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={lab.difficulty === "beginner" ? "success" : lab.difficulty === "intermediate" ? "warning" : "destructive"} className="text-[10px] capitalize">
                          {lab.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                          <Clock className="h-3 w-3" />
                          <span>{lab.estimatedMinutes}m</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {lab.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{lab.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <Badge variant="outline" className="text-[9px] uppercase font-mono">
                          {lab.type}
                        </Badge>

                        <Link href={`/labs/${lab.id}`}>
                          <Button size="sm" variant={isCompleted ? "outline" : isInProgress ? "default" : "secondary"} className="h-7 text-xs gap-1">
                            {isCompleted ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Review
                              </>
                            ) : isInProgress ? (
                              <>
                                <Play className="h-3.5 w-3.5" /> Continue
                              </>
                            ) : (
                              <>
                                <Zap className="h-3.5 w-3.5" /> Start Lab
                              </>
                            )}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Section 2: Featured Simulations & Tools */}
        {filteredSimulations.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-400" /> Featured Simulations & Tools ({filteredSimulations.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Step-by-step protocol visualizers, CIDR calculator, and topology design canvas.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSimulations.map((sim) => {
                const IconComp = sim.icon;
                return (
                  <Card key={sim.id} className="flex flex-col justify-between hover:border-primary/50 transition-all hover:shadow-md group bg-card/80 border-border">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="success" className="text-[10px]">{sim.category}</Badge>
                        <span className="text-[10px] font-mono text-muted-foreground">{sim.tag}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                          {sim.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{sim.description}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <Badge variant="outline" className="text-[9px] uppercase font-mono">{sim.badge}</Badge>
                        <Link href={sim.href}>
                          <Button size="sm" variant="secondary" className="h-7 text-xs gap-1">
                            <IconComp className="h-3.5 w-3.5 text-primary" /> Launch Tool
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Section 3: CIDR Subnet Calculator Widget */}
        {showCidrSection && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-emerald-400" /> CIDR Subnet Calculator & Inspector
                </h3>
                <p className="text-xs text-muted-foreground">
                  Calculate network boundaries, broadcast addresses, usable host ranges, and binary bitmasks.
                </p>
              </div>

              <Link href="/cidr">
                <Button size="sm" variant="ghost" className="gap-1 text-xs">
                  Full CIDR Suite <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <Card className="border-border bg-card/80 p-4">
              <QuickCidrWidget />
            </Card>
          </section>
        )}

        {/* Section 4: Protocol Library Categories */}
        {filteredProtocols.length > 0 && (
          <section className="space-y-6 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" /> Protocol Library Catalog ({filteredProtocols.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Explore interactive visualizers for transport, network, data-link, and application layer protocols.
                </p>
              </div>
            </div>

            {PROTOCOL_CATEGORIES.map((cat) => {
              const catProtocols = filteredProtocols.filter((p) => p.category === cat.id);
              if (catProtocols.length === 0) return null;
              return (
                <div key={cat.id} className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{cat.label}</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {catProtocols.map((p) => (
                      <ProtocolCard key={p.id} protocol={p} />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </>
  );
}

function StatBox({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-2 shadow-sm">
      <p className="text-xl font-bold font-mono text-foreground">{value}{suffix && <span className="text-xs font-normal text-muted-foreground">{suffix}</span>}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

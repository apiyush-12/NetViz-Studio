"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, BookOpen, Layers } from "lucide-react";
import { AppHeader } from "@/components/layout/app-sidebar";
import { Input, Badge, Button } from "@/components/ui";
import { TopicCard } from "@/components/learn/topic-components";
import { learningTopics } from "@/data/learning-content";

const categories = [
  { id: "all", label: "All topics" },
  { id: "fundamentals", label: "Fundamentals" },
  { id: "addressing", label: "Addressing" },
  { id: "routing", label: "Routing" },
  { id: "services", label: "Services & Protocols" },
  { id: "security", label: "Security & Switching" },
] as const;

export default function LearnPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return learningTopics.filter((t) => {
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.keyTakeaways.some((k) => k.toLowerCase().includes(q));
      const matchesCategory = category === "all" || t.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <>
      <AppHeader
        title="Learn"
        description="Networking concepts explained clearly — from OSI layers to dynamic routing"
      />

      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header Hero Banner */}
        <section className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-20" aria-hidden="true" />
          <div className="relative z-10 max-w-3xl space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="text-xs">
                {learningTopics.length} Core Modules
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">Structured Networking Guides</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              Networking Fundamentals & Engineering Guides
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Structured learning topics covering packet encapsulation, IP addressing, binary subnetting, TCP flow control, OSPF link-state routing, BGP inter-domain peering, and VLAN segmentation.
            </p>
          </div>

          <div className="relative max-w-md pt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 text-xs h-10"
              placeholder="Search topics, protocols, or concepts (e.g. OSPF, BGP, ARP)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search learning topics"
            />
          </div>
        </section>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
            {categories.map((cat) => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={category === cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  category === cat.id
                    ? "border-primary bg-primary/15 text-primary shadow-sm"
                    : "border-border text-muted-foreground hover:border-primary/40 bg-card"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-muted-foreground font-mono">
            Showing {filtered.length} of {learningTopics.length} guides
          </span>
        </div>

        {/* Topic Cards Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
            <BookOpen className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="font-semibold text-base">No learning topics match &quot;{search}&quot;</h3>
            <p className="text-xs text-muted-foreground">Try clearing your search filter or selecting another category.</p>
            <Button size="sm" variant="outline" onClick={() => { setSearch(""); setCategory("all"); }}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        )}

        {/* Interactive Workspace Callout */}
        <div className="rounded-xl border border-border bg-secondary/30 p-4 md:p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="text-[10px]">Hands-On Practice</Badge>
              <h4 className="font-semibold text-sm">Ready to put theory into practice?</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Test your knowledge with 20 interactive labs or build custom topologies on our canvas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/labs">
              <Button size="sm" variant="default" className="text-xs gap-1 font-semibold">
                <BookOpen className="h-3.5 w-3.5" /> Launch Interactive Labs
              </Button>
            </Link>
            <Link href="/topology">
              <Button size="sm" variant="outline" className="text-xs gap-1">
                <Layers className="h-3.5 w-3.5" /> Topology Builder
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

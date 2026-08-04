"use client";

import Link from "next/link";
import { ArrowRight, Clock, Layers, CheckCircle2, AlertTriangle, AlertCircle, Info, ThumbsUp, ThumbsDown, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import type { LearningTopic } from "@/data/learning-content";
import { cn } from "@/lib/utils";

const categoryLabels: Record<LearningTopic["category"], string> = {
  fundamentals: "Fundamentals",
  addressing: "Addressing",
  routing: "Routing",
  services: "Services",
  security: "Security",
};

const categoryColors: Record<LearningTopic["category"], string> = {
  fundamentals: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  addressing: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  routing: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  services: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  security: "text-rose-400 border-rose-500/30 bg-rose-500/10",
};

export function TopicCard({ topic }: { topic: LearningTopic }) {
  return (
    <Link href={`/learn/${topic.id}`} className="group block h-full">
      <Card className="h-full flex flex-col justify-between transition-all border-border bg-card/80 hover:border-primary/50 hover:shadow-md">
        <CardHeader className="pb-2 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className={cn("text-[10px] uppercase font-mono", categoryColors[topic.category])}>
              {categoryLabels[topic.category]}
            </Badge>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono shrink-0">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {topic.readTime}
            </span>
          </div>
          <CardTitle className="text-base group-hover:text-primary transition-colors">
            {topic.title}
          </CardTitle>
          <p className="text-xs text-muted-foreground line-clamp-1">{topic.subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-4 pt-1">
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
            {topic.summary}
          </p>

          <div className="pt-3 border-t border-border/50 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-mono">
              {topic.sections.length} Topic Sections
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-primary font-medium group-hover:translate-x-0.5 transition-transform">
              Read guide <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function LayerStack({
  layers,
  title,
}: {
  layers: NonNullable<LearningTopic["layers"]>;
  title: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-border bg-secondary/30">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" aria-hidden="true" />
          {title}
        </h3>
      </div>
      <div className="divide-y divide-border" role="list" aria-label={title}>
        {layers.map((layer) => (
          <div
            key={layer.name}
            role="listitem"
            className="flex gap-3 px-4 py-3 hover:bg-accent/30 transition-colors"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary text-xs font-bold font-mono">
              {layer.number}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="font-semibold text-sm">{layer.name}</span>
                <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                  PDU: {layer.pdu}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{layer.description}</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {layer.examples.map((ex) => (
                  <span
                    key={ex}
                    className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground font-mono bg-card"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ComparisonTable({
  rows,
  headers = ["Aspect", "Option A / Legacy", "Option B / Modern"],
  title,
}: {
  rows: { label: string; classful: string; cidr: string }[];
  headers?: [string, string, string];
  title?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm space-y-0">
      {title && (
        <div className="px-4 py-2.5 border-b border-border bg-secondary/30">
          <h4 className="text-xs font-bold text-foreground">{title}</h4>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-semibold w-1/4">{headers[0]}</th>
              <th className="text-left px-4 py-2.5 text-xs text-amber-400 font-semibold w-[37.5%]">{headers[1]}</th>
              <th className="text-left px-4 py-2.5 text-xs text-primary font-semibold w-[37.5%]">{headers[2]}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-border/50 last:border-0 hover:bg-accent/20 transition-colors">
                <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{row.label}</td>
                <td className="px-4 py-2.5 text-xs font-mono text-foreground/90">{row.classful}</td>
                <td className="px-4 py-2.5 text-xs font-mono text-foreground">{row.cidr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SimpleDiagramDisplay({
  title = "Simple Representation",
  textRepresentation,
}: {
  title?: string;
  textRepresentation: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm">
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4 text-primary shrink-0" />
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{title}</h3>
      </div>
      <div className="bg-secondary/60 rounded-lg border border-border p-4 font-mono text-xs text-foreground overflow-x-auto whitespace-pre leading-relaxed">
        {textRepresentation}
      </div>
    </div>
  );
}

export function ImportantTerms({ terms }: { terms: { term: string; definition: string }[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm">
      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-primary" /> Key Networking Terms
      </h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {terms.map((item) => (
          <div key={item.term} className="rounded-lg border border-border bg-secondary/20 p-3 space-y-1">
            <span className="font-mono font-semibold text-xs text-primary">{item.term}</span>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.definition}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProsAndCons({ advantages, disadvantages }: { advantages?: string[]; disadvantages?: string[] }) {
  if (!advantages?.length && !disadvantages?.length) return null;

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {advantages && advantages.length > 0 && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2 shadow-sm">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <ThumbsUp className="h-3.5 w-3.5 text-emerald-400" /> Advantages
          </h4>
          <ul className="space-y-1.5">
            {advantages.map((adv) => (
              <li key={adv} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                <span className="text-emerald-400 font-bold shrink-0">•</span>
                {adv}
              </li>
            ))}
          </ul>
        </div>
      )}

      {disadvantages && disadvantages.length > 0 && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-2 shadow-sm">
          <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <ThumbsDown className="h-3.5 w-3.5 text-rose-400" /> Limitations & Disadvantages
          </h4>
          <ul className="space-y-1.5">
            {disadvantages.map((dis) => (
              <li key={dis} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                <span className="text-rose-400 font-bold shrink-0">•</span>
                {dis}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function CommonMistakesCallout({ mistakes }: { mistakes: string[] }) {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2 shadow-sm">
      <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
        <AlertTriangle className="h-4 w-4 text-amber-400" /> Common Mistakes & Misconceptions
      </h3>
      <ul className="space-y-2">
        {mistakes.map((mistake) => (
          <li key={mistake} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
            <span className="text-amber-400 font-bold shrink-0">⚠️</span>
            {mistake}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WarningCalloutBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-rose-500/40 bg-rose-500/15 p-4 flex gap-3 shadow-sm items-start">
      <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
      <div className="space-y-1 text-xs text-rose-200 leading-relaxed font-medium">
        {message}
      </div>
    </div>
  );
}

export function AdvancedNotesBox({ notes }: { notes: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-2 shadow-sm">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Info className="h-3.5 w-3.5 text-primary" /> Advanced Notes & Protocol Details
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line font-mono">
        {notes}
      </p>
    </div>
  );
}

export function RoutingFlowDiagram() {
  const steps = [
    { label: "Host A", sub: "192.168.1.10", desc: "Creates packet to 10.0.0.5" },
    { label: "Gateway R1", sub: "192.168.1.1", desc: "LPM route lookup -> next hop" },
    { label: "Router R2", sub: "10.0.12.2", desc: "Decrements TTL, forwards packet" },
    { label: "Host B", sub: "10.0.0.5", desc: "Delivered to local interface" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm">
      <p className="text-xs font-semibold text-foreground">Packet Journey Across Network Hops</p>
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-0">
        {steps.map((step, i) => (
          <div key={step.label} className="flex md:flex-1 items-center gap-2">
            <div className="flex-1 rounded-lg border border-border bg-secondary/40 p-3 text-center">
              <p className="text-xs font-bold">{step.label}</p>
              <p className="text-[10px] font-mono text-primary">{step.sub}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{step.desc}</p>
            </div>
            {i < steps.length - 1 && (
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 hidden md:block" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Key Rule: At each router hop, the source/destination MAC addresses are rewritten for the next link, but the IP addresses stay unchanged end-to-end (unless NAT is active).
      </p>
    </div>
  );
}

export function SubnetSplitVisual() {
  const subnets = [
    { cidr: "192.168.1.0/26", range: ".0 – .63", hosts: "62 usable" },
    { cidr: "192.168.1.64/26", range: ".64 – .127", hosts: "62 usable" },
    { cidr: "192.168.1.128/26", range: ".128 – .191", hosts: "62 usable" },
    { cidr: "192.168.1.192/26", range: ".192 – .255", hosts: "62 usable" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm">
      <p className="text-xs font-semibold text-foreground">192.168.1.0/24 Subnet Division Example</p>
      <div className="flex h-10 rounded-lg overflow-hidden border border-border">
        {subnets.map((s, i) => (
          <div
            key={s.cidr}
            className={cn(
              "flex-1 flex items-center justify-center text-[10px] font-mono font-bold border-r border-border last:border-0",
              i % 2 === 0 ? "bg-primary/20 text-primary" : "bg-amber-500/15 text-amber-300"
            )}
            title={s.cidr}
          >
            /26
          </div>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {subnets.map((s) => (
          <div key={s.cidr} className="text-xs font-mono bg-secondary/40 rounded-md p-2 flex justify-between items-center border border-border/50">
            <span className="text-foreground font-semibold">{s.cidr}</span>
            <span className="text-muted-foreground">{s.hosts} ({s.range})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function KeyTakeaways({ items }: { items: string[] }) {
  return (
    <div className="rounded-xl border border-primary/25 bg-primary/10 p-4 space-y-2 shadow-sm">
      <h3 className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
        <CheckCircle2 className="h-4 w-4 text-primary" /> Key Takeaways & Points to Remember
      </h3>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
            <span className="text-primary font-bold shrink-0">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RelatedLinks({ links }: { links: NonNullable<LearningTopic["relatedLinks"]> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border bg-card hover:border-primary/50 hover:text-primary transition-all font-medium shadow-sm"
        >
          {link.label}
          <ArrowRight className="h-3 w-3" />
        </Link>
      ))}
    </div>
  );
}

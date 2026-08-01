import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, BookOpen, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/layout/app-sidebar";
import { Badge, Separator, Card, CardContent } from "@/components/ui";
import {
  LayerStack,
  ComparisonTable,
  RoutingFlowDiagram,
  SubnetSplitVisual,
  KeyTakeaways,
  RelatedLinks,
} from "@/components/learn/topic-components";
import { getLearningTopic, learningTopics } from "@/data/learning-content";

export function generateStaticParams() {
  return learningTopics.map((t) => ({ topicId: t.id }));
}

export default async function LearnTopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const topic = getLearningTopic(topicId);
  if (!topic) notFound();

  return (
    <>
      <AppHeader title={topic.title} description={topic.subtitle} />

      <article className="p-4 md:p-6 max-w-4xl space-y-8 mx-auto">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to All Guides
        </Link>

        {/* Title Header Block */}
        <header className="space-y-4 rounded-2xl border border-border bg-card/80 p-6 md:p-8 shadow-sm relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="text-xs uppercase font-mono border-primary/40 text-primary bg-primary/10">
              {topic.category}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {topic.readTime} read
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              {topic.title}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {topic.summary}
            </p>
          </div>
        </header>

        {/* Key Takeaways */}
        <KeyTakeaways items={topic.keyTakeaways} />

        {/* Layer Stack Component */}
        {topic.layers && (
          <LayerStack
            layers={topic.layers}
            title={topic.id === "osi-model" ? "OSI 7-Layer Reference Model" : "TCP/IP 4-Layer Architectural Suite"}
          />
        )}

        {/* Comparison Table */}
        {topic.comparison && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" /> Side-by-side Architectural Comparison
            </h2>
            <ComparisonTable rows={topic.comparison} />
          </section>
        )}

        {/* Subnetting Visual */}
        {topic.id === "subnetting" && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">Visual Subnet Breakdown</h2>
            <SubnetSplitVisual />
          </section>
        )}

        {/* Routing Flow Diagram */}
        {(topic.id === "routing-basics" || topic.id === "packet-encapsulation") && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">Packet Journey & Hop Traversal</h2>
            <RoutingFlowDiagram />
          </section>
        )}

        {/* Module Sections */}
        <div className="space-y-6">
          {topic.sections.map((section) => (
            <Card key={section.id} className="border-border bg-card/60 shadow-sm">
              <CardContent className="p-5 md:p-6 space-y-3">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  {section.title}
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {section.body}
                </p>
                {section.bullets && (
                  <ul className="pt-2 space-y-2 border-t border-border/40">
                    {section.bullets.map((b) => (
                      <li key={b} className="flex gap-2 text-xs md:text-sm text-foreground/90 font-mono">
                        <span className="text-primary shrink-0 font-bold">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Related Links */}
        {topic.relatedLinks && topic.relatedLinks.length > 0 && (
          <>
            <Separator className="my-6" />
            <section className="space-y-3">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Continue Learning & Interactive Simulations
              </h2>
              <RelatedLinks links={topic.relatedLinks} />
            </section>
          </>
        )}
      </article>
    </>
  );
}

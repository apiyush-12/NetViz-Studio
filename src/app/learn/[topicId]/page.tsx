import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, BookOpen, Sparkles, CheckCircle2 } from "lucide-react";
import { AppHeader } from "@/components/layout/app-sidebar";
import { Badge, Separator, Card, CardContent } from "@/components/ui";
import {
  LayerStack,
  ComparisonTable,
  RoutingFlowDiagram,
  SubnetSplitVisual,
  KeyTakeaways,
  RelatedLinks,
  SimpleDiagramDisplay,
  ImportantTerms,
  ProsAndCons,
  CommonMistakesCallout,
  WarningCalloutBox,
  AdvancedNotesBox,
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

  // Find index for prev/next topic navigation
  const currentIndex = learningTopics.findIndex((t) => t.id === topic.id);
  const prevTopic = currentIndex > 0 ? learningTopics[currentIndex - 1] : null;
  const nextTopic = currentIndex >= 0 && currentIndex < learningTopics.length - 1 ? learningTopics[currentIndex + 1] : null;

  return (
    <>
      <AppHeader title={topic.title} description={topic.subtitle} />

      <article className="p-4 md:p-6 max-w-4xl space-y-8 mx-auto">
        <div className="flex items-center justify-between">
          <Link
            href="/learn"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All Guides
          </Link>
          <span className="text-xs font-mono text-muted-foreground">
            Topic {currentIndex + 1} of {learningTopics.length}
          </span>
        </div>

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
              {topic.subtitle}
            </p>
          </div>
        </header>

        {/* Warning Callout Box if applicable (e.g. SSL warning) */}
        {topic.warningCallout && (
          <WarningCalloutBox message={topic.warningCallout} />
        )}

        {/* Introduction / Overview Summary */}
        <Card className="border-border bg-card/70 shadow-sm">
          <CardContent className="p-5 md:p-6 space-y-2">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> Introduction & Core Concept
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              {topic.summary}
            </p>
          </CardContent>
        </Card>

        {/* Key Points / Important Points to Remember */}
        <KeyTakeaways items={topic.keyTakeaways} />

        {/* Simple Diagram or Text Representation */}
        {topic.diagram && topic.diagram.textRepresentation && (
          <SimpleDiagramDisplay
            title={topic.diagram.title || "Simple Representation & Traffic Flow"}
            textRepresentation={topic.diagram.textRepresentation}
          />
        )}

        {/* Special visual components for legacy topics */}
        {topic.layers && (
          <LayerStack
            layers={topic.layers}
            title={topic.id === "osi-model" ? "OSI 7-Layer Reference Model" : "TCP/IP 4-Layer Architectural Suite"}
          />
        )}

        {topic.id === "subnetting" && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">Visual Subnet Breakdown</h2>
            <SubnetSplitVisual />
          </section>
        )}

        {(topic.id === "routing-basics" || topic.id === "packet-encapsulation") && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">Packet Journey & Hop Traversal</h2>
            <RoutingFlowDiagram />
          </section>
        )}

        {/* Key Terms */}
        {topic.importantTerms && topic.importantTerms.length > 0 && (
          <ImportantTerms terms={topic.importantTerms} />
        )}

        {/* Main Content Sections (Why needed, How it works, Working process, Real-world example, Properties, etc.) */}
        <div className="space-y-6">
          {topic.sections.map((section) => (
            <Card key={section.id} className="border-border bg-card/60 shadow-sm">
              <CardContent className="p-5 md:p-6 space-y-3">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  {section.title}
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
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

        {/* Pros & Cons / Advantages & Limitations */}
        {(topic.advantages?.length || topic.disadvantages?.length) ? (
          <ProsAndCons advantages={topic.advantages} disadvantages={topic.disadvantages} />
        ) : null}

        {/* Common Mistakes & Misconceptions */}
        {topic.commonMistakes && topic.commonMistakes.length > 0 && (
          <CommonMistakesCallout mistakes={topic.commonMistakes} />
        )}

        {/* Comparison Table */}
        {topic.comparison && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" /> Comparison with Related Concepts
            </h2>
            <ComparisonTable
              rows={Array.isArray(topic.comparison) ? topic.comparison : topic.comparison.rows}
              headers={!Array.isArray(topic.comparison) && topic.comparison.headers ? topic.comparison.headers : ["Aspect", "Option A / Related", "Option B / Key Concept"]}
              title={!Array.isArray(topic.comparison) ? topic.comparison.title : undefined}
            />
          </section>
        )}

        {/* Beginner Summary */}
        {topic.beginnerSummary && (
          <Card className="border-primary/30 bg-primary/5 shadow-sm">
            <CardContent className="p-5 md:p-6 space-y-2">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Beginner Summary
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                {topic.beginnerSummary}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Advanced Notes */}
        {topic.advancedNotes && (
          <AdvancedNotesBox notes={topic.advancedNotes} />
        )}

        <Separator className="my-6" />

        {/* Previous & Next Topic Navigation */}
        <div className="grid grid-cols-2 gap-4">
          {prevTopic ? (
            <Link
              href={`/learn/${prevTopic.id}`}
              className="flex flex-col p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all text-left group"
            >
              <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1 mb-1">
                <ArrowLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" /> Previous Topic
              </span>
              <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {prevTopic.title}
              </span>
            </Link>
          ) : <div />}

          {nextTopic ? (
            <Link
              href={`/learn/${nextTopic.id}`}
              className="flex flex-col p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all text-right group"
            >
              <span className="text-[11px] font-mono text-muted-foreground flex items-center justify-end gap-1 mb-1">
                Next Topic <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {nextTopic.title}
              </span>
            </Link>
          ) : <div />}
        </div>

        {/* Related Links */}
        {topic.relatedLinks && topic.relatedLinks.length > 0 && (
          <section className="space-y-3 pt-4">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Continue Learning & Related Topics
            </h2>
            <RelatedLinks links={topic.relatedLinks} />
          </section>
        )}
      </article>
    </>
  );
}

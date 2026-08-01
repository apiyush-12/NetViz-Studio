"use client";

import React from "react";
import { AUDIENCE_CARDS } from "@/features/landing/landing-content";
import { Card, CardContent } from "@/components/ui";
import { GraduationCap, Award, Code2, Presentation, Sparkles, CheckCircle2 } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  GraduationCap,
  Award,
  Code2,
  Presentation,
  Sparkles,
};

export function AudienceSection() {
  return (
    <section className="py-16 md:py-24 border-t border-border bg-card/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-mono uppercase tracking-widest text-primary font-bold">Tailored For Your Goals</p>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Built for every stage of networking learning
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Whether you are preparing for certification exams, teaching lectures, or debugging socket behavior below application code.
          </p>
        </div>

        {/* 5 Audience Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AUDIENCE_CARDS.map((aud) => {
            const Icon = iconMap[aud.iconName] || GraduationCap;
            return (
              <Card key={aud.id} className="border border-border bg-card/90 shadow-md hover:border-primary/50 transition-all">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">{aud.title}</h3>
                      <p className="text-[11px] text-muted-foreground font-mono">{aud.role}</p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {aud.description}
                  </p>

                  <ul className="space-y-1.5 pt-3 border-t border-border/50 text-xs">
                    {aud.benefits.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-foreground/90 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
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

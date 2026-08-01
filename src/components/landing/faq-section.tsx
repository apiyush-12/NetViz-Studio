"use client";

import React, { useState } from "react";
import { FAQS } from "@/features/landing/landing-content";
import { ChevronDown, HelpCircle } from "lucide-react";

export function FaqSection() {
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq-1");

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <section id="faq" className="py-16 md:py-24 border-t border-border">
      <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-12">
        <div className="text-center space-y-3">
          <p className="text-xs font-mono uppercase tracking-widest text-primary font-bold">Frequently Asked Questions</p>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Got questions? We have answers.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Everything you need to know about NetViz Studio&apos;s simulation capabilities, account features, and educational model.
          </p>
        </div>

        {/* Accessible Accordion FAQs */}
        <div className="space-y-3" role="tablist">
          {FAQS.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-2xl border border-border bg-card/90 shadow-sm overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  className="w-full p-4 md:p-5 text-left flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${faq.id}`}
                    role="tabpanel"
                    className="px-4 pb-5 md:px-5 md:pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3 animate-in fade-in slide-in-from-top-1"
                  >
                    {faq.answer}
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

"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, CheckCircle2, FileText } from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";

const ACCURACY_POINTS = [
  "Uses technically accurate networking terminology & RFC state machine definitions",
  "Separates Layer 2 (Ethernet MAC) and Layer 3 (IPv4) addressing explicitly",
  "Does not represent native UDP acknowledgements (preserves connectionless semantics)",
  "Treats IP classful addressing as a legacy concept while showcasing modern CIDR",
  "Displays real header structures: TCP flags, sequence numbers, ARP opcodes, ICMP types",
  "Clearly labels educational model simplifications where full RFC stack detail is trimmed",
];

export function EducationalAccuracy() {
  return (
    <section className="py-16 md:py-24 border-t border-border bg-card/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <Card className="border border-border bg-card/90 shadow-2xl overflow-hidden max-w-5xl mx-auto">
          <CardContent className="p-8 md:p-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">Pedagogical Philosophy</span>
                <h2 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-emerald-400" /> Designed for clarity without hiding important details
                </h2>
              </div>

              <Link href="/learn/educational-models">
                <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5 shrink-0">
                  <FileText className="h-3.5 w-3.5" /> View Educational Models
                </Button>
              </Link>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              NetViz Studio balances rigorous protocol accuracy with visual learning clarity. We model realistic packet headers, MAC/IP lookup tables, and state machines while avoiding unnecessary complexity that obscures core concepts.
            </p>

            {/* Accuracy Checklist */}
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              {ACCURACY_POINTS.map((pt) => (
                <div key={pt} className="p-3 rounded-xl border border-border bg-secondary/30 flex items-start gap-2.5 text-xs text-foreground/90 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

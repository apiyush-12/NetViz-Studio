"use client";

import React from "react";
import Link from "next/link";
import { INITIAL_LABS } from "@/data/lab-catalog";
import { useSafeUser, SafeSignInButton } from "@/components/auth/safe-auth";
import { useIntendedDestination } from "@/hooks/use-intended-destination";
import { Card, CardContent, Button, Badge } from "@/components/ui";
import { FlaskConical, Clock, ArrowRight, BookOpen } from "lucide-react";

// Select 8 highlighted lab cards from catalog
const HIGHLIGHTED_LAB_IDS = [
  "local-network-communication",
  "fix-wrong-subnet",
  "tcp-three-way-handshake",
  "tcp-packet-loss-retransmission",
  "cidr-fundamentals",
  "communicating-across-networks",
  "dhcp-address-assignment",
  "ospf-neighbor-formation",
];

export function LabsShowcase() {
  const { isSignedIn } = useSafeUser();
  const { saveIntendedDestination } = useIntendedDestination();

  const highlightedLabs = INITIAL_LABS.filter((lab) => HIGHLIGHTED_LAB_IDS.includes(lab.id)).slice(0, 8);

  const handleStartLabClick = (labId: string) => {
    saveIntendedDestination({
      pathname: `/labs/${labId}/run`,
      source: "lab",
    });
  };

  return (
    <section id="labs" className="py-16 md:py-24 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-mono uppercase tracking-widest text-primary font-bold">Interactive Guided Practice</p>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Learn by solving real networking scenarios
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Troubleshoot misconfigured gateways, analyze TCP handshakes, calculate subnets, and repair broken topologies with automated task validation.
          </p>
        </div>

        {/* 8 Featured Lab Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlightedLabs.map((lab) => (
            <Card
              key={lab.id}
              className="border border-border bg-card/90 shadow-md hover:border-primary/50 transition-all flex flex-col justify-between group"
            >
              <CardContent className="p-5 space-y-4">
                {/* Topic & Difficulty Badges */}
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] font-mono uppercase">
                    {lab.topic}
                  </Badge>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      lab.difficulty === "beginner"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : lab.difficulty === "intermediate"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        : "bg-purple-500/10 border-purple-500/30 text-purple-400"
                    }`}
                  >
                    {lab.difficulty}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {lab.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-3 leading-relaxed">
                    {lab.description}
                  </p>
                </div>

                {/* Lab Metadata: Tasks & Time */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border/50">
                  <span className="flex items-center gap-1 font-mono">
                    <FlaskConical className="h-3.5 w-3.5 text-primary" /> {lab.tasks.length} Tasks
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="h-3.5 w-3.5 text-amber-400" /> ~{lab.estimatedMinutes} mins
                  </span>
                </div>
              </CardContent>

              {/* Action Buttons */}
              <div className="p-5 pt-0">
                {isSignedIn ? (
                  <Link href={`/labs/${lab.id}/run`}>
                    <Button size="sm" className="w-full text-xs font-semibold gap-1.5">
                      <span>Start Interactive Lab</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                ) : (
                  <SafeSignInButton mode="modal">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStartLabClick(lab.id)}
                      className="w-full text-xs font-semibold gap-1.5 hover:bg-secondary"
                    >
                      <span>Start Lab</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </SafeSignInButton>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* CTA to browse all labs */}
        <div className="text-center pt-4">
          <Link href="/labs">
            <Button size="lg" variant="outline" className="font-bold text-xs gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>Browse All 20 Interactive Networking Labs</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

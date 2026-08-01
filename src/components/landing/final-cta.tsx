"use client";

import React from "react";
import Link from "next/link";
import { useSafeUser, SafeSignInButton } from "@/components/auth/safe-auth";
import { Button } from "@/components/ui";
import { Sparkles, ArrowRight, Play, LayoutDashboard, CheckCircle2 } from "lucide-react";

export function FinalCta() {
  const { isLoaded, isSignedIn } = useSafeUser();

  return (
    <section className="py-20 md:py-28 border-t border-border relative overflow-hidden bg-card/40">
      {/* Subtle Network Flow Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20 -z-10 grid-bg" />

      <div className="max-w-4xl mx-auto px-4 md:px-6 text-center space-y-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Interactive Browser-Based Platform</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
          Stop memorizing network diagrams. <br />
          <span className="bg-gradient-to-r from-blue-400 via-primary to-emerald-400 bg-clip-text text-transparent">
            Start watching networks work.
          </span>
        </h2>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Explore packet flow, build topologies, calculate subnets, and practice networking through interactive labs.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {!isLoaded ? (
            <div className="h-10 w-44 rounded-xl bg-secondary animate-pulse" />
          ) : isSignedIn ? (
            <>
              <Link href="/labs">
                <Button size="lg" className="w-full sm:w-auto font-bold gap-2 text-sm px-6 shadow-xl">
                  <span>Continue Learning Labs</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold text-sm gap-2">
                  <LayoutDashboard className="h-4 w-4" /> Open Dashboard
                </Button>
              </Link>
            </>
          ) : (
            <>
              <SafeSignInButton mode="modal">
                <Button size="lg" className="w-full sm:w-auto font-bold gap-2 text-sm px-6 shadow-xl">
                  <Sparkles className="h-4 w-4" /> Create Free Account
                </Button>
              </SafeSignInButton>

              <Link href="/visualizer">
                <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold text-sm gap-2">
                  <Play className="h-4 w-4 text-primary" /> Try the Visualizer
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Free to explore
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> No software downloads
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Instant access
          </span>
        </div>
      </div>
    </section>
  );
}

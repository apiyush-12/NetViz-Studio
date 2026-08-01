"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck, Play, CheckCircle2, LayoutDashboard, BookOpen } from "lucide-react";
import { useSafeUser, SafeSignInButton } from "@/components/auth/safe-auth";
import { Button } from "@/components/ui";
import { HeroNetworkDemo } from "./hero-network-demo";
import { HeroBackgroundVisuals } from "./hero-background-visuals";

export function HeroSection() {
  const { isLoaded, isSignedIn } = useSafeUser();
  const router = useRouter();

  // Auto-redirect already authenticated users away from the landing page
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <section className="relative pt-8 pb-16 md:pt-16 md:pb-24 overflow-hidden">
      <HeroBackgroundVisuals />

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & Hero Text */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Learn networking by watching it happen</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              See How Networks <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-400 via-primary to-emerald-400 bg-clip-text text-transparent">
                Actually Work
              </span>
            </h1>

            {/* Supporting Description */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
              NetViz Studio transforms abstract networking concepts into interactive simulations. Watch packets move, inspect protocol fields, configure devices, break links, troubleshoot failures, and understand every step.
            </p>

            {/* Auth-Aware Call To Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              {!isLoaded ? (
                <div className="h-10 w-44 rounded-xl bg-secondary animate-pulse" />
              ) : isSignedIn ? (
                /* Authenticated User CTAs */
                <>
                  <Link href="/dashboard">
                    <Button size="lg" className="w-full sm:w-auto font-bold gap-2 shadow-lg text-sm px-6">
                      <LayoutDashboard className="h-4 w-4" /> Continue to Dashboard
                    </Button>
                  </Link>

                  <Link href="/labs">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold gap-2 text-sm">
                      <BookOpen className="h-4 w-4" /> Resume Learning
                    </Button>
                  </Link>
                </>
              ) : (
                /* Unauthenticated Visitor CTAs */
                <>
                  <SafeSignInButton mode="modal">
                    <Button size="lg" className="w-full sm:w-auto font-bold gap-2 shadow-lg text-sm px-6">
                      Start Learning Free <ArrowRight className="h-4 w-4" />
                    </Button>
                  </SafeSignInButton>

                  <Link href="/visualizer">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold gap-2 text-sm">
                      <Play className="h-4 w-4 text-primary" /> Explore Visualizer
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Extra trust badges */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> No installation required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Interactive browser-based learning
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Save progress with a free account
              </span>
            </div>

            {/* Trust statement */}
            <div className="pt-2 border-t border-border/40 inline-block">
              <p className="text-xs text-muted-foreground flex items-center gap-2 font-medium">
                <ShieldCheck className="h-4 w-4 text-primary" /> Built for visual, hands-on networking education.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Hero Demonstration */}
          <div className="lg:col-span-6">
            <HeroNetworkDemo />
          </div>
        </div>
      </div>
    </section>
  );
}

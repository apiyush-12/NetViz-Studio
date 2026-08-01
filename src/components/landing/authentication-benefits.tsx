"use client";

import React from "react";
import Link from "next/link";
import { useSafeUser, SafeSignInButton } from "@/components/auth/safe-auth";
import { Card, CardContent, Button, Badge } from "@/components/ui";
import { ShieldCheck, CheckCircle2, LayoutDashboard, Bookmark, Sparkles, UserCheck } from "lucide-react";

const ACCOUNT_BENEFITS = [
  "Save custom network topology diagrams across sessions",
  "Save custom simulation presets and traffic parameters",
  "Resume unfinished lab exercises right where you left off",
  "Track completed labs and automatic score history",
  "View personalized learning path progress metrics",
  "Store custom UI preferences (dark/light mode, speed)",
  "Access recently opened protocol simulations",
  "Preserve achievement and task verification history",
];

export function AuthenticationBenefits() {
  const { isSignedIn, user } = useSafeUser();
  const firstName = user?.firstName || user?.username || "Learner";

  return (
    <section className="py-16 md:py-24 border-t border-border bg-card/40">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <Card className="border border-border bg-card/90 shadow-2xl overflow-hidden max-w-5xl mx-auto">
          <CardContent className="p-8 md:p-12 grid md:grid-cols-12 gap-8 items-center">
            {/* Left Column: Heading & Benefits */}
            <div className="md:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Isolated User Session Persistence</span>
              </div>

              {isSignedIn && user ? (
                <div>
                  <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                    Welcome back, <span className="text-primary">{firstName}</span>!
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                    Your lab completions, scores, and saved topology diagrams are active and synchronized to your account.
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                    Your networking lab, saved across sessions
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                    Create a free account to save topologies, resume labs, track progress, and continue simulations from any supported device.
                  </p>
                </div>
              )}

              {/* Benefits Checklist */}
              <div className="grid sm:grid-cols-2 gap-2.5 pt-2">
                {ACCOUNT_BENEFITS.map((b) => (
                  <div key={b} className="flex items-start gap-2 text-xs text-foreground/90 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                {isSignedIn ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="w-full sm:w-auto font-bold gap-2 text-xs px-6 shadow-lg">
                      <LayoutDashboard className="h-4 w-4" /> Open Personal Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <SafeSignInButton mode="modal">
                      <Button size="lg" className="w-full sm:w-auto font-bold gap-2 text-xs px-6 shadow-lg">
                        <Sparkles className="h-4 w-4" /> Create Free Account
                      </Button>
                    </SafeSignInButton>

                    <SafeSignInButton mode="modal">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold text-xs gap-1.5">
                        Log In
                      </Button>
                    </SafeSignInButton>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Authenticated Personal Summary / Marketing Preview Card */}
            <div className="md:col-span-5 bg-secondary/30 p-6 rounded-2xl border border-border space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-emerald-400" /> Account Status
                </span>
                <Badge variant={isSignedIn ? "success" : "outline"} className="text-[10px]">
                  {isSignedIn ? "Authenticated" : "Guest Mode"}
                </Badge>
              </div>

              {isSignedIn && user ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase">User Identity</span>
                    <p className="font-bold text-foreground text-sm truncate">{user?.fullName || user?.username || "Learner"}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-lg border border-border bg-card">
                      <span className="text-muted-foreground">Lab Progress:</span>
                      <p className="font-bold text-emerald-400 text-sm mt-0.5">3 / 20 Completed</p>
                    </div>
                    <div className="p-2.5 rounded-lg border border-border bg-card">
                      <span className="text-muted-foreground">Topologies:</span>
                      <p className="font-bold text-primary text-sm mt-0.5">2 Saved</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-center py-4">
                  <Bookmark className="h-10 w-10 text-primary mx-auto opacity-75" />
                  <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                    Sign in to sync your custom network diagrams, completed lab task scores, and preferences across devices.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { Network } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { useSafeUser, SafeSignInButton } from "@/components/auth/safe-auth";

export function LandingFooter() {
  const { isSignedIn } = useSafeUser();

  return (
    <footer className="border-t border-border bg-card/90 text-xs">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16 grid grid-cols-2 md:grid-cols-5 gap-8">
        {/* Brand Info Column */}
        <div className="col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
              <Network className="h-4 w-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-foreground">{APP_NAME}</span>
          </Link>

          <p className="text-muted-foreground text-xs leading-relaxed max-w-sm">
            NetViz Studio is an interactive educational platform for visualizing protocol behavior, configuring simulated networks, calculating subnets, and completing hands-on networking labs.
          </p>

          <p className="text-[11px] text-muted-foreground font-mono">
            Version v1.2.0 • Built for visual networking education
          </p>
        </div>

        {/* Column 1: Product */}
        <div className="space-y-3">
          <p className="font-bold text-foreground uppercase tracking-wider text-[11px]">Product</p>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link href="/visualizer" className="hover:text-foreground transition-colors">
                Protocol Visualizer
              </Link>
            </li>
            <li>
              <Link href="/protocols" className="hover:text-foreground transition-colors">
                Protocols Catalog
              </Link>
            </li>
            <li>
              <Link href="/cidr" className="hover:text-foreground transition-colors">
                CIDR Studio
              </Link>
            </li>
            <li>
              <Link href="/topology" className="hover:text-foreground transition-colors">
                Topology Builder
              </Link>
            </li>
            <li>
              <Link href="/labs" className="hover:text-foreground transition-colors">
                Interactive Labs
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 2: Learn */}
        <div className="space-y-3">
          <p className="font-bold text-foreground uppercase tracking-wider text-[11px]">Learn</p>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link href="/learn" className="hover:text-foreground transition-colors">
                Networking Fundamentals
              </Link>
            </li>
            <li>
              <Link href="/learn/tcp-ip-model" className="hover:text-foreground transition-colors">
                TCP & UDP Transport
              </Link>
            </li>
            <li>
              <Link href="/learn/cidr-vs-classful" className="hover:text-foreground transition-colors">
                Subnetting & CIDR
              </Link>
            </li>
            <li>
              <Link href="/learn/routing-fundamentals" className="hover:text-foreground transition-colors">
                L3 Routing Decisions
              </Link>
            </li>
            <li>
              <Link href="/learn/ethernet-arp" className="hover:text-foreground transition-colors">
                Ethernet & ARP
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Account & Resources */}
        <div className="space-y-3">
          <p className="font-bold text-foreground uppercase tracking-wider text-[11px]">Account & Resources</p>
          <ul className="space-y-2 text-muted-foreground">
            {isSignedIn ? (
              <>
                <li>
                  <Link href="/dashboard" className="hover:text-foreground transition-colors font-semibold text-primary">
                    Open Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/labs/progress" className="hover:text-foreground transition-colors">
                    My Labs & Progress
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="hover:text-foreground transition-colors">
                    Account Settings
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <SafeSignInButton mode="modal">
                    <button className="hover:text-foreground transition-colors text-left">Log In</button>
                  </SafeSignInButton>
                </li>
                <li>
                  <SafeSignInButton mode="modal">
                    <button className="hover:text-foreground transition-colors text-left font-semibold text-primary">
                      Create Free Account
                    </button>
                  </SafeSignInButton>
                </li>
              </>
            )}
            <li>
              <Link href="/learn/educational-models" className="hover:text-foreground transition-colors">
                Educational Models
              </Link>
            </li>
            <li>
              <Link href="/settings" className="hover:text-foreground transition-colors">
                Report an Issue
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Footer Copyright Row */}
      <div className="border-t border-border/60 py-6 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground">
          <p>© {new Date().getFullYear()} NetViz Studio. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <Link href="/settings" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/settings" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/settings" className="hover:text-foreground transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

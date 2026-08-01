"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Network,
  Menu,
  X,
  LayoutDashboard,
  FlaskConical,
  GitBranch,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useSafeUser, SafeUserButton, SafeSignInButton, SafeSignOutButton } from "@/components/auth/safe-auth";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#protocols", label: "Protocols" },
  { href: "#cidr", label: "CIDR" },
  { href: "#topology", label: "Topology" },
  { href: "#labs", label: "Labs" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#faq", label: "FAQ" },
];

export function LandingHeader() {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);
  const { isLoaded, isSignedIn, user } = useSafeUser();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard accessibility: Escape key closes menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const primaryEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress;

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        scrolled
          ? "bg-background/95 backdrop-blur border-b border-border shadow-md py-3"
          : "bg-transparent py-4 border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
          <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-foreground">{APP_NAME}</span>
            <span className="block text-[10px] text-muted-foreground uppercase tracking-widest -mt-1 font-mono">
              Protocol Visualizer
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main" className="hidden lg:flex items-center gap-1 bg-card/40 border border-border/50 rounded-full px-4 py-1.5 shadow-inner">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Side: Auth States */}
        <div className="hidden sm:flex items-center gap-3">
          {!isLoaded ? (
            /* Minimal loading placeholder to prevent layout flashing */
            <div className="h-8 w-24 rounded-lg bg-secondary/50 animate-pulse" />
          ) : isSignedIn && user ? (
            /* Authenticated User Menu */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-expanded={userDropdownOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-border bg-card hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-xs font-medium text-foreground"
              >
                <SafeUserButton appearance={{ elements: { avatarBox: "h-6 w-6 rounded-full" } }} />
                <span className="truncate max-w-[120px] font-semibold">{user.firstName || user.username || "Account"}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${userDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-2xl z-50 text-xs space-y-1 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="px-3 py-2 border-b border-border/60">
                    <p className="font-bold text-foreground truncate">{user.fullName || user.username || "User"}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{primaryEmail}</p>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary text-foreground font-medium transition-colors"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 text-primary" /> Open Dashboard
                  </Link>

                  <Link
                    href="/labs"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary text-foreground transition-colors"
                  >
                    <FlaskConical className="h-3.5 w-3.5 text-emerald-400" /> My Labs & Progress
                  </Link>

                  <Link
                    href="/topology"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary text-foreground transition-colors"
                  >
                    <GitBranch className="h-3.5 w-3.5 text-purple-400" /> Saved Topologies
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary text-foreground transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5 text-amber-400" /> Account Settings
                  </Link>

                  <div className="h-px bg-border/60 my-1" />

                  <SafeSignOutButton>
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-destructive/10 text-destructive text-left font-medium transition-colors">
                      <LogOut className="h-3.5 w-3.5" /> Log Out
                    </button>
                  </SafeSignOutButton>
                </div>
              )}
            </div>
          ) : (
            /* Unauthenticated Visitor CTAs */
            <div className="flex items-center gap-2">
              <SafeSignInButton mode="modal">
                <Button size="sm" variant="ghost" className="h-8 text-xs font-semibold hover:bg-secondary">
                  Log In
                </Button>
              </SafeSignInButton>

              <SafeSignInButton mode="modal">
                <Button size="sm" variant="default" className="h-8 text-xs font-semibold gap-1.5 shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" /> Create Free Account
                </Button>
              </SafeSignInButton>
            </div>
          )}
        </div>

        {/* Mobile Menu Trigger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          className="sm:hidden p-2 rounded-lg border border-border bg-card text-foreground"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-x-0 top-[60px] bg-background/98 border-b border-border p-4 space-y-3 shadow-2xl z-50 animate-in slide-in-from-top-2">
          <nav aria-label="Mobile" className="grid grid-cols-2 gap-2 pb-3 border-b border-border">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-1">
            {isSignedIn ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full text-xs font-semibold gap-2">
                  <LayoutDashboard className="h-4 w-4" /> Open Dashboard
                </Button>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <SafeSignInButton mode="modal">
                  <Button variant="outline" className="w-full text-xs font-semibold">
                    Log In
                  </Button>
                </SafeSignInButton>
                <SafeSignInButton mode="modal">
                  <Button variant="default" className="w-full text-xs font-semibold">
                    Create Free Account
                  </Button>
                </SafeSignInButton>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

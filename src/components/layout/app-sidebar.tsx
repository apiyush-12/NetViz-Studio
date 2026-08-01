"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useRef } from "react";
import {
  LayoutDashboard,
  Network,
  BookOpen,
  Calculator,
  FlaskConical,
  Settings,
  Layers,
  GitBranch,
  Menu,
  X,
  LogIn,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { useSafeUser, SafeUserButton, SafeSignInButton } from "@/components/auth/safe-auth";
import { Button } from "@/components/ui";
import { useSidebar } from "@/components/layout/sidebar-context";

const navItems = [
  { href: "/dashboard",  label: "Dashboard",        icon: LayoutDashboard },
  { href: "/visualizer", label: "Visualizer",        icon: Network },
  { href: "/protocols",  label: "Protocols",         icon: Layers },
  { href: "/cidr",       label: "CIDR Calculator",   icon: Calculator },
  { href: "/topology",   label: "Topology",          icon: GitBranch },
  { href: "/labs",       label: "Labs",              icon: FlaskConical },
  { href: "/learn",      label: "Learn",             icon: BookOpen },
  { href: "/settings",   label: "Settings",          icon: Settings },
];

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function NavTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          role="tooltip"
          className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2
            whitespace-nowrap rounded-lg border border-border bg-popover px-3 py-1.5
            text-xs font-semibold text-popover-foreground shadow-xl
            animate-in fade-in slide-in-from-left-1 duration-100"
        >
          {label}
          <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rotate-45 border-l border-b border-border bg-popover" />
        </div>
      )}
    </div>
  );
}

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────
export function AppSidebar() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn, user } = useSafeUser();
  const { collapsed, hydrated, toggle, sidebarWidth } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);

  // ── Nav link (used in desktop sidebar) ──
  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const active = pathname === item.href || pathname.startsWith(item.href + "/");
    const Icon = item.icon;

    const inner = (
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative flex items-center rounded-xl transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          collapsed
            ? "justify-center h-10 w-10 mx-auto"
            : "gap-3 px-3 py-2 w-full",
          active
            ? "bg-primary/15 text-primary font-semibold"
            : "text-sidebar-foreground hover:bg-sidebar-accent/70"
        )}
      >
        <Icon className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")} aria-hidden="true" />
        {!collapsed && <span className="truncate text-sm leading-none">{item.label}</span>}
        {/* Active pill indicator when collapsed */}
        {active && collapsed && (
          <span className="absolute -right-1 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-primary" />
        )}
      </Link>
    );

    return collapsed ? <NavTooltip label={item.label}>{inner}</NavTooltip> : inner;
  };

  // ── User footer section ──
  const UserFooter = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn("border-t border-sidebar-border shrink-0", collapsed && !mobile ? "p-2" : "p-3")}>
      {isLoaded && isSignedIn && user ? (
        collapsed && !mobile ? (
          <NavTooltip label={user.firstName || user.username || "Account"}>
            <div className="flex justify-center cursor-pointer">
              <SafeUserButton appearance={{ elements: { avatarBox: "h-8 w-8 rounded-full" } }} />
            </div>
          </NavTooltip>
        ) : (
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-card border border-border">
            <SafeUserButton appearance={{ elements: { avatarBox: "h-7 w-7 rounded-full" } }} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate leading-tight">
                {user.firstName || user.username || "User"}
              </p>
              <p className="text-[9px] text-muted-foreground truncate">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        )
      ) : collapsed && !mobile ? (
        <NavTooltip label="Sign In">
          <SafeSignInButton mode="modal">
            <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-border
              bg-card text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors mx-auto">
              <LogIn className="h-4 w-4" />
            </button>
          </SafeSignInButton>
        </NavTooltip>
      ) : (
        <SafeSignInButton mode="modal">
          <Button size="sm" variant="outline" className="w-full text-xs gap-1.5 justify-start">
            <LogIn className="h-3.5 w-3.5 text-primary" /> Sign In / Register
          </Button>
        </SafeSignInButton>
      )}
    </div>
  );

  return (
    <>
      {/* ── Desktop fixed sidebar ─────────────────────────────────────────── */}
      <aside
        style={{ width: hydrated ? sidebarWidth : 224 }}
        className={cn(
          "hidden md:flex fixed inset-y-0 left-0 z-30 flex-col",
          "border-r border-sidebar-border bg-sidebar overflow-hidden",
          "transition-[width] duration-300 ease-in-out"
        )}
        aria-label="Application navigation"
      >
        {/* Logo / Brand */}
        <div className="flex h-14 items-center border-b border-sidebar-border px-3 shrink-0 overflow-hidden">
          {!collapsed ? (
            <Link href="/dashboard" className="flex items-center gap-2 min-w-0 w-full">
              <div className="h-7 w-7 shrink-0 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                <Network className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-sidebar-foreground truncate leading-tight">{APP_NAME}</p>
                <p className="text-[9px] text-muted-foreground font-mono truncate">Protocol Visualizer</p>
              </div>
            </Link>
          ) : (
            <Link href="/dashboard" className="flex w-full items-center justify-center">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                <Network className="h-4 w-4" />
              </div>
            </Link>
          )}
        </div>

        {/* Nav */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-1",
            collapsed ? "px-2 items-center" : "px-2"
          )}
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        {/* User footer */}
        <UserFooter />

        {/* Collapse / Expand toggle pill */}
        <button
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "absolute -right-3.5 top-[72px] z-40",
            "h-7 w-7 flex items-center justify-center",
            "rounded-full border border-border bg-card shadow-md",
            "text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/10",
            "transition-all duration-200 hover:scale-110",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          {collapsed
            ? <ChevronRight className="h-3.5 w-3.5" />
            : <ChevronLeft className="h-3.5 w-3.5" />
          }
        </button>
      </aside>

      {/* ── Mobile hamburger + drawer ────────────────────────────────────── */}
      {/* Hamburger trigger */}
      <button
        className="fixed top-3 left-3 z-50 flex h-9 w-9 items-center justify-center
          rounded-xl border border-border bg-card shadow-md md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col",
          "border-r border-sidebar-border bg-sidebar md:hidden",
          "transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
      >
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4 shrink-0">
          <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <Network className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-sidebar-foreground">{APP_NAME}</p>
            <p className="text-[9px] text-muted-foreground font-mono">Protocol Visualizer</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                  active
                    ? "bg-primary/15 text-primary font-semibold"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/70"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <UserFooter mobile />
      </aside>
    </>
  );
}

// ─── App Header ───────────────────────────────────────────────────────────────
export function AppHeader({ title, description }: { title: string; description?: string }) {
  const { isLoaded, isSignedIn, user } = useSafeUser();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur
      px-4 py-3.5 md:px-6 pl-14 md:pl-6 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        {isLoaded && isSignedIn && user ? (
          <SafeUserButton appearance={{ elements: { avatarBox: "h-8 w-8 rounded-full border border-primary/40" } }} />
        ) : (
          <SafeSignInButton mode="modal">
            <Button size="sm" variant="default" className="h-8 text-xs gap-1.5 font-semibold">
              <LogIn className="h-3.5 w-3.5" /> Sign In
            </Button>
          </SafeSignInButton>
        )}
      </div>
    </header>
  );
}

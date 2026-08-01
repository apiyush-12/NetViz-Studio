"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar-context";

// Routes that are fully public — no sidebar, no auth guard
const PUBLIC_ROUTES = ["/", "/sign-in", "/sign-up"];

// ─── Inner app shell — reads sidebar width from context ───────────────────────
// Must be a child of SidebarProvider so useSidebar() is available
function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarWidth, hydrated } = useSidebar();

  return (
    <div className="flex min-h-screen">
      {/* Fixed sidebar — rendered outside flow */}
      <AppSidebar />

      {/*
       * Main content area:
       * - marginLeft matches sidebar width so content never sits under the fixed sidebar
       * - transition-[margin] syncs with sidebar's transition-[width] (both 300ms ease-in-out)
       * - overflow-y-auto makes only this pane scrollable (sidebar is fixed, never scrolls)
       */}
      <main
        style={{ marginLeft: hydrated ? sidebarWidth : 224 }}
        className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen
          transition-[margin-left] duration-300 ease-in-out bg-background"
      >
        {children}
      </main>
    </div>
  );
}

// ─── ConditionalShell — top-level layout router ───────────────────────────────
interface ConditionalShellProps {
  children: React.ReactNode;
}

export function ConditionalShell({ children }: ConditionalShellProps) {
  const pathname = usePathname();
  const isPublic = PUBLIC_ROUTES.some((r) =>
    r === "/" ? pathname === "/" : pathname.startsWith(r)
  );

  // Landing page — full-width, no sidebar, no auth check
  if (isPublic) {
    return <>{children}</>;
  }

  // App pages — sidebar (fixed) + auth protection + scrollable main
  return (
    <SidebarProvider>
      <AuthGuard>
        <AppShell>{children}</AppShell>
      </AuthGuard>
    </SidebarProvider>
  );
}

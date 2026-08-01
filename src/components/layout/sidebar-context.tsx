"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const SIDEBAR_STORAGE_KEY = "netviz_sidebar_collapsed_v1";

export const SIDEBAR_WIDTH_EXPANDED = 224; // px — w-56
export const SIDEBAR_WIDTH_COLLAPSED = 64;  // px — w-16

interface SidebarContextValue {
  collapsed: boolean;
  hydrated: boolean;
  toggle: () => void;
  sidebarWidth: number;
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  hydrated: false,
  toggle: () => {},
  sidebarWidth: SIDEBAR_WIDTH_EXPANDED,
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Read persisted state after mount to avoid SSR mismatch
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (stored !== null) setCollapsed(stored === "true");
    } catch {
      // localStorage unavailable (private mode, etc.)
    }
    setHydrated(true);
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  const sidebarWidth = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  return (
    <SidebarContext.Provider value={{ collapsed, hydrated, toggle, sidebarWidth }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}

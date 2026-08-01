"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, X, ArrowRight } from "lucide-react";

const STORAGE_KEY = "netviz_announcement_dismissed_v1";

export function AnnouncementBanner() {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch (e) {
      console.error(e);
    }
  };

  if (!visible) return null;

  return (
    <aside aria-label="Announcement" className="bg-primary/10 border-b border-primary/20 text-xs py-2 px-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold text-[10px] uppercase tracking-wider shrink-0">
            <Sparkles className="h-3 w-3" /> New Release
          </span>
          <p className="text-muted-foreground truncate">
            Now available: <strong className="text-foreground font-medium">Interactive TCP & UDP packet-flow simulations</strong>
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <Link
            href="/protocols"
            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline hover:text-primary/90 transition-colors"
          >
            Explore Protocols <ArrowRight className="h-3 w-3" />
          </Link>

          <button
            onClick={handleDismiss}
            aria-label="Dismiss announcement"
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-md hover:bg-secondary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

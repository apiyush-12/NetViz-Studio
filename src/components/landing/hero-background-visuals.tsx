"use client";

import React from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function HeroBackgroundVisuals() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.03] pointer-events-none -z-10" />;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none opacity-40">
      {/* Background SVG Network Pattern */}
      <svg className="absolute w-full h-full stroke-primary/15 [mask-image:radial-gradient(100%_100%_at_top_center,white,transparent)]">
        <defs>
          <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M.5 40V.5H40" fill="none" strokeDasharray="2 4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" strokeWidth="0" fill="url(#hero-grid)" />
      </svg>

      {/* Floating Animated Network Node Points */}
      <div className="absolute top-1/4 left-1/6 h-2 w-2 rounded-full bg-blue-500/80 shadow-[0_0_12px_rgba(59,130,246,0.8)] animate-ping" />
      <div className="absolute top-1/3 right-1/4 h-2 w-2 rounded-full bg-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse" />
      <div className="absolute bottom-1/3 left-1/3 h-1.5 w-1.5 rounded-full bg-purple-500/80 shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-ping" />

      {/* Faint Floating Binary Bits */}
      <div className="absolute top-12 right-12 font-mono text-[10px] text-primary/20 space-y-1 font-bold">
        <p className="animate-pulse">11000000.10101000</p>
        <p className="opacity-60">00000001.00001010</p>
      </div>

      <div className="absolute bottom-16 left-12 font-mono text-[10px] text-emerald-500/20 space-y-1 font-bold">
        <p className="animate-pulse">SYN → SYN-ACK → ACK</p>
        <p className="opacity-60">TTL=64 PROTOCOL=6</p>
      </div>
    </div>
  );
}

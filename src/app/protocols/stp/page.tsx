import { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-sidebar";
import { StpVisualizer } from "@/components/protocols/stp/stp-visualizer";

export const metadata: Metadata = {
  title: "STP Visualizer | Network Simulation Studio",
  description:
    "Interactive simulation of Spanning Tree Protocol (IEEE 802.1D / RSTP 802.1w), loop prevention, Root Bridge election, and rapid convergence.",
};

export default function StpPage() {
  return (
    <>
      <AppHeader
        title="STP / RSTP (Spanning Tree Protocol)"
        description="Data-Link Layer (Layer 2) — Loop Prevention, Root Bridge Election, Port Roles (RP/DP/AP), and Rapid Proposal/Agreement Synchronization"
      />
      <Suspense fallback={<div className="p-6 text-muted-foreground">Loading STP visualizer studio...</div>}>
        <StpVisualizer />
      </Suspense>
    </>
  );
}

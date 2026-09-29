import { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-sidebar";
import { RipVisualizer } from "@/components/protocols/rip/rip-visualizer";

export const metadata: Metadata = {
  title: "RIP Visualizer | Network Simulation Studio",
  description:
    "Interactive simulation of Routing Information Protocol (RFC 1058 / RFC 2453), Bellman-Ford distance-vector updates, Split Horizon, Poison Reverse, Count-to-Infinity loop visualizer, and routing tables.",
};

export default function RipPage() {
  return (
    <>
      <AppHeader
        title="RIP (Routing Information Protocol)"
        description="Distance-Vector Routing (UDP 520) — RFC 1058 / RFC 2453 Bellman-Ford Vector Updates, Split Horizon, Poison Reverse, Count-to-Infinity Loop Simulation, VLSM Subnets & Route Timers"
      />
      <Suspense fallback={<div className="p-6 text-muted-foreground">Loading RIP visualizer studio...</div>}>
        <RipVisualizer />
      </Suspense>
    </>
  );
}

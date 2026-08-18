import { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-sidebar";
import { OspfVisualizer } from "@/components/protocols/ospf/ospf-visualizer";

export const metadata: Metadata = {
  title: "OSPF Visualizer | Network Simulation Studio",
  description: "Interactive simulation of Open Shortest Path First Dijkstra SPF algorithm, link-state advertisements, and area hierarchy.",
};

export default function OspfProtocolPage() {
  return (
    <>
      <AppHeader
        title="OSPF — Open Shortest Path First"
        description="Visualize neighbor discovery, link-state advertisements, shortest-path calculation, and route convergence."
      />
      <Suspense fallback={<div className="p-6 text-muted-foreground">Loading OSPF visualizer...</div>}>
        <OspfVisualizer />
      </Suspense>
    </>
  );
}

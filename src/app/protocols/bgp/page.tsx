import { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-sidebar";
import { BgpVisualizer } from "@/components/protocols/bgp/bgp-visualizer";
import { OspfBgpComparisonModal } from "@/components/protocols/comparison/ospf-bgp-comparison-modal";

export const metadata: Metadata = {
  title: "BGP Visualizer | Network Simulation Studio",
  description: "Interactive simulation of Border Gateway Protocol autonomous systems, path attributes, best-path selection algorithm, and route filtering.",
};

export default function BgpProtocolPage() {
  return (
    <>
      <AppHeader
        title="BGP — Border Gateway Protocol"
        description="Visualize autonomous systems, route advertisements, path attributes, best-path selection, and Internet routing decisions."
        action={<OspfBgpComparisonModal />}
      />
      <Suspense fallback={<div className="p-6 text-muted-foreground">Loading BGP visualizer...</div>}>
        <BgpVisualizer />
      </Suspense>
    </>
  );
}

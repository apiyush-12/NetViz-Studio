import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-sidebar";
import { BgpVisualizer } from "@/components/protocols/bgp/bgp-visualizer";

export default function BgpProtocolPage() {
  return (
    <>
      <AppHeader
        title="BGP — Border Gateway Protocol"
        description="Visualize autonomous systems, route advertisements, path attributes, best-path selection, and Internet routing decisions."
      />
      <Suspense fallback={<div className="p-6 text-muted-foreground">Loading BGP visualizer...</div>}>
        <BgpVisualizer />
      </Suspense>
    </>
  );
}

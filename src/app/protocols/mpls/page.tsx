import { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-sidebar";
import { MplsVisualizer } from "@/components/protocols/mpls/mpls-visualizer";

export const metadata: Metadata = {
  title: "MPLS Visualizer | Network Simulation Studio",
  description:
    "Interactive simulation of Multiprotocol Label Switching (RFC 3031 / RFC 3032), 32-bit shim header inspector, Penultimate Hop Popping (PHP), BGP/MPLS L3VPN two-label stacking, and Fast Reroute (FRR).",
};

export default function MplsPage() {
  return (
    <>
      <AppHeader
        title="MPLS (Multiprotocol Label Switching)"
        description="Layer 2.5 — RFC 3031 / RFC 3032 32-Bit Shim Header, Exact-Match LFIB Indexing, Multi-Label Stacking, Penultimate Hop Popping (PHP), BGP/MPLS L3VPN, & 50ms Fast Reroute"
      />
      <Suspense fallback={<div className="p-6 text-muted-foreground">Loading MPLS visualizer studio...</div>}>
        <MplsVisualizer />
      </Suspense>
    </>
  );
}

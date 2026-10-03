import { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-sidebar";
import { IsisVisualizer } from "@/components/protocols/isis/isis-visualizer";

export const metadata: Metadata = {
  title: "IS-IS Visualizer | Network Simulation Studio",
  description:
    "Interactive simulation of Intermediate System to Intermediate System (ISO/IEC 10589 / RFC 1195 / RFC 5305 / RFC 5308 / RFC 2966), Two-Level Hierarchy, DIS Election, TLV Tree Decoder, Route Leaking, and Overload Bit.",
};

export default function IsisPage() {
  return (
    <>
      <AppHeader
        title="IS-IS (Intermediate System to Intermediate System)"
        description="Link-State Routing over Layer 2 LLC / NLPID 0x83 — ISO/IEC 10589 & RFC 1195/5305/5308: 2-Level Area Hierarchy, DIS Pseudonodes, TLV Architecture, RFC 2966 Route Leaking, Wide Metrics & Dual-Stack IPv4/IPv6"
      />
      <Suspense fallback={<div className="p-6 text-muted-foreground">Loading IS-IS visualizer studio...</div>}>
        <IsisVisualizer />
      </Suspense>
    </>
  );
}

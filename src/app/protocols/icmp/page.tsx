import { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-sidebar";
import { IcmpVisualizer } from "@/components/protocols/icmp/icmp-visualizer";

export const metadata: Metadata = {
  title: "ICMP Visualizer | Network Simulation Studio",
  description:
    "Interactive simulation of Internet Control Message Protocol (RFC 792 / RFC 1191), Ping Echo Request/Reply, Traceroute TTL Exceeded, Path MTU Discovery (PMTUD), and Destination Unreachable.",
};

export default function IcmpPage() {
  return (
    <>
      <AppHeader
        title="ICMP (Internet Control Message Protocol)"
        description="Network Layer (Layer 3) — RFC 792 / RFC 1191 Ping (Echo Request/Reply), Traceroute (TTL Exceeded), Path MTU Discovery (PMTUD), Destination Unreachable, & Router Redirects"
      />
      <Suspense fallback={<div className="p-6 text-muted-foreground">Loading ICMP visualizer studio...</div>}>
        <IcmpVisualizer />
      </Suspense>
    </>
  );
}

import { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-sidebar";
import { ArpVisualizer } from "@/components/protocols/arp/arp-visualizer";

export const metadata: Metadata = {
  title: "ARP Visualizer | Network Simulation Studio",
  description:
    "Interactive simulation of Address Resolution Protocol (RFC 826, RFC 5227), 28-byte packet decoder, broadcast flooding, unicast replies, Gratuitous ARP, Proxy ARP, and Dynamic ARP Inspection (DAI).",
};

export default function ArpPage() {
  return (
    <>
      <AppHeader
        title="ARP (Address Resolution Protocol)"
        description="Data-Link Layer (Layer 2) — 28-Byte Frame Inspector, Broadcast Flooding, Live Cache Tables (arp -a), Gratuitous ARP, and Dynamic ARP Inspection (DAI)"
      />
      <Suspense fallback={<div className="p-6 text-muted-foreground">Loading ARP visualizer studio...</div>}>
        <ArpVisualizer />
      </Suspense>
    </>
  );
}

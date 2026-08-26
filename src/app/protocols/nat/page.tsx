import { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-sidebar";
import { NatVisualizer } from "@/components/protocols/nat/nat-visualizer";

export const metadata: Metadata = {
  title: "NAT / PAT Visualizer | Network Simulation Studio",
  description: "Interactive simulation of Network Address Translation (NAT/PAT), stateful translation tables, IPv4 header rewriting, and port forwarding.",
};

export default function NatPage() {
  return (
    <>
      <AppHeader
        title="NAT / PAT (Network Address Translation)"
        description="Network Layer (Layer 3/4) Address Rewriting — PAT Port Overload, Stateful Socket Translation Tables, and Port Forwarding"
      />
      <Suspense fallback={<div className="p-6 text-muted-foreground">Loading NAT / PAT visualizer studio...</div>}>
        <NatVisualizer />
      </Suspense>
    </>
  );
}

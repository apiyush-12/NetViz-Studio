import { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-sidebar";
import { Ipv4Visualizer } from "@/components/protocols/ipv4/ipv4-visualizer";

export const metadata: Metadata = {
  title: "IPv4 Visualizer | Network Simulation Studio",
  description: "Interactive simulation of Internet Protocol version 4 (IPv4), 20-byte fixed header bitfields, in-flight MTU fragmentation, TTL decrement, and CIDR routing.",
};

export default function Ipv4Page() {
  return (
    <>
      <AppHeader
        title="IPv4 (Internet Protocol version 4)"
        description="Network Layer (Layer 3) Core Addressing — 20-Byte Header Bitfields, In-Flight MTU Fragmentation, TTL Decrement, and Subnet Routing"
      />
      <Suspense fallback={<div className="p-6 text-muted-foreground">Loading IPv4 visualizer studio...</div>}>
        <Ipv4Visualizer />
      </Suspense>
    </>
  );
}

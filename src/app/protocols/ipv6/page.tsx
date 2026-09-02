import { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-sidebar";
import { Ipv6Visualizer } from "@/components/protocols/ipv6/ipv6-visualizer";

export const metadata: Metadata = {
  title: "IPv6 Visualizer | Network Simulation Studio",
  description: "Interactive simulation of Internet Protocol version 6 (IPv6), 40-byte streamlined fixed header, 20-bit Flow Label QoS, Extension Headers chaining, and SLAAC / NDP.",
};

export default function Ipv6Page() {
  return (
    <>
      <AppHeader
        title="IPv6 (Internet Protocol version 6)"
        description="Network Layer (Layer 3) 128-Bit Addressing — 40-Byte Fixed Header, 20-Bit Flow Label QoS, Chained Extension Headers, and SLAAC / NDP"
      />
      <Suspense fallback={<div className="p-6 text-muted-foreground">Loading IPv6 visualizer studio...</div>}>
        <Ipv6Visualizer />
      </Suspense>
    </>
  );
}

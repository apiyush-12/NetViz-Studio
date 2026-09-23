import { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-sidebar";
import { VlanVisualizer } from "@/components/protocols/vlan/vlan-visualizer";

export const metadata: Metadata = {
  title: "VLAN Visualizer | Network Simulation Studio",
  description:
    "Interactive simulation of Virtual Local Area Networks (IEEE 802.1Q), 4-byte frame tag inspector, broadcast domain isolation, access vs trunk ports, Router-on-a-Stick (ROAS), and Layer 3 Switch SVIs.",
};

export default function VlanPage() {
  return (
    <>
      <AppHeader
        title="VLAN (Virtual Local Area Network)"
        description="Data-Link Layer (Layer 2) — IEEE 802.1Q 4-Byte Frame Tagging, Broadcast Domain Isolation, Trunk Multiplexing, Router-on-a-Stick, and Layer 3 Switch SVIs"
      />
      <Suspense fallback={<div className="p-6 text-muted-foreground">Loading VLAN visualizer studio...</div>}>
        <VlanVisualizer />
      </Suspense>
    </>
  );
}

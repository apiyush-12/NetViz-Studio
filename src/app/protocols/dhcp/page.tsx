import { Metadata } from "next";
import { AppHeader } from "@/components/layout/app-sidebar";
import { DhcpVisualizer } from "@/components/protocols/dhcp/dhcp-visualizer";

export const metadata: Metadata = {
  title: "DHCP Visualizer | Network Simulation Studio",
  description: "Interactive simulation of DHCP DORA handshake, 8-state client FSM, lease renewal, and address pool allocation.",
};

export default function DhcpPage() {
  return (
    <>
      <AppHeader
        title="Dynamic Host Configuration Protocol (DHCP)"
        description="Layer 7 host bootstrapping — DORA handshake, FSM transitions, and RFC 2132 options"
      />
      <DhcpVisualizer />
    </>
  );
}

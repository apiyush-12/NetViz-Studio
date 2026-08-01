import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "NetViz Studio — Interactive Network Protocol Visualizer & Simulation Platform",
  description:
    "Visualize TCP, UDP, routing, switching, CIDR subnetting, packet flow, and network topology through interactive simulations and guided networking labs.",
  openGraph: {
    title: "NetViz Studio — Interactive Network Protocol Visualizer",
    description:
      "Visualize packets, configure topologies, calculate subnets, and master network protocols interactively.",
    type: "website",
  },
};

export default function Home() {
  return <LandingPage />;
}

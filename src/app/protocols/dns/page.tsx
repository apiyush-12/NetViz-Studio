import { Metadata } from "next";
import { AppHeader } from "@/components/layout/app-sidebar";
import { DnsVisualizer } from "@/components/protocols/dns/dns-visualizer";

export const metadata: Metadata = {
  title: "DNS Visualizer | Network Simulation Studio",
  description: "Interactive simulation of Domain Name System hierarchy traversal, recursive caching, and resource record resolution.",
};

export default function DnsPage() {
  return (
    <>
      <AppHeader
        title="Domain Name System (DNS)"
        description="Layer 7 name resolution — Root to Authoritative hierarchy, TTL caching, and RFC 1035 headers"
      />
      <DnsVisualizer />
    </>
  );
}

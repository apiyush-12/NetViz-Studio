import { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-sidebar";
import { HttpVisualizer } from "@/components/protocols/http/http-visualizer";

export const metadata: Metadata = {
  title: "HTTP / HTTPS Visualizer | Network Simulation Studio",
  description: "Interactive simulation of HTTP/1.1 vs HTTP/2 multiplexing, 1-RTT TLS 1.3 cryptographic handshakes, and application layer request/response transactions.",
};

export default function HttpPage() {
  return (
    <>
      <AppHeader
        title="HTTP / HTTPS (Hypertext Transfer Protocol Secure)"
        description="Application Layer (Layer 7) Web Protocol — Request Builder, TLS 1.3 Handshake Ladder, HTTP/2 Binary Multiplexing, and Response Caching"
      />
      <Suspense fallback={<div className="p-6 text-muted-foreground">Loading HTTP / HTTPS visualizer studio...</div>}>
        <HttpVisualizer />
      </Suspense>
    </>
  );
}

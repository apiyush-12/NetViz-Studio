import { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-sidebar";
import { TlsVisualizer } from "@/components/protocols/tls/tls-visualizer";

export const metadata: Metadata = {
  title: "TLS Visualizer | Network Simulation Studio",
  description:
    "Interactive simulation of Transport Layer Security (RFC 8446 TLS 1.3 / RFC 5246 TLS 1.2), 1-RTT Handshake, 0-RTT Early Data Resumption, Mutual TLS (mTLS), X.509 PKI Chain Validation, and HKDF Cryptographic Key Schedule.",
};

export default function TlsPage() {
  return (
    <>
      <AppHeader
        title="TLS (Transport Layer Security)"
        description="IETF RFC 8446 (TLS 1.3) & RFC 5246 (TLS 1.2) — Cryptographic Handshake, HKDF Key Schedule Derivation Tree, 32-Bit Record Alignment, X.509 PKI Chain of Trust, 0-RTT Resumption & Mutual TLS"
      />
      <Suspense fallback={<div className="p-6 text-muted-foreground">Loading TLS visualizer studio...</div>}>
        <TlsVisualizer />
      </Suspense>
    </>
  );
}

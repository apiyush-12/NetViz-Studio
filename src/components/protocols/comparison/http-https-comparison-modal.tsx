"use client";

import React, { useState } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Scale, X, Lock, Unlock } from "lucide-react";

export function HttpHttpsComparisonModal() {
  const [isOpen, setIsOpen] = useState(false);

  const comparisonRows = [
    {
      dimension: "Full Name & RFC",
      http: "Hypertext Transfer Protocol (RFC 9110 / RFC 9112)",
      https: "Hypertext Transfer Protocol Secure (RFC 9110 / RFC 8446 TLS 1.3)",
    },
    {
      dimension: "Default Port",
      http: "Port 80 (Cleartext TCP)",
      https: "Port 443 (Encrypted TLS over TCP / UDP 443 for HTTP/3)",
    },
    {
      dimension: "Data Security & Privacy",
      http: "Cleartext plaintext — Vulnerable to eavesdropping, packet sniffing, and Man-in-the-Middle (MitM) tampering.",
      https: "Authenticated Encryption (AEAD: AES-256-GCM / ChaCha20-Poly1305) — Confidentiality, Integrity, and Authenticity guaranteed.",
    },
    {
      dimension: "Identity Authentication",
      http: "None — Client cannot verify whether origin server is legitimate or spoofed.",
      https: "X.509 Digital Certificates verified by trusted Root Certificate Authorities (Web PKI).",
    },
    {
      dimension: "Connection Handshake",
      http: "1-RTT: Pure 3-Way TCP Handshake (SYN → SYN-ACK → ACK)",
      https: "2-RTT: TCP Handshake + 1-RTT TLS 1.3 Handshake (ECDHE Key Exchange) / 0-RTT on resumption",
    },
    {
      dimension: "HTTP/2 & HTTP/3 Support",
      http: "Practically unsupported — All modern browsers require TLS (ALPN 'h2' / 'h3') to enable multiplexing.",
      https: "Full Support for HTTP/2 Binary Streams and HTTP/3 QUIC 0-RTT multiplexing.",
    },
    {
      dimension: "SEO & Search Ranking",
      http: "Penalized by search engines; browsers display 'Not Secure' warning badge in address bar.",
      https: "Major SEO ranking boost; required for PWA service workers, Geolocation API, and modern Web APIs.",
    },
    {
      dimension: "Performance & Overhead",
      http: "Marginally lighter CPU usage, but slower page loads due to absence of HTTP/2 multiplexing.",
      https: "Hardware-accelerated AES-NI cryptography makes encryption overhead negligible (< 1ms CPU).",
    },
  ];

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="gap-1.5 text-xs font-semibold border-primary/40 hover:bg-primary/10 text-primary cursor-pointer"
      >
        <Scale className="h-3.5 w-3.5" />
        <span>HTTP vs HTTPS Comparison</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <Card className="w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    HTTP vs HTTPS Architectural & Security Comparison
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Cleartext Web Transmission vs Cryptographic Transport Layer Security (TLS 1.3)
                  </p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Summary Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 text-xs">
                    <Unlock className="h-4 w-4" />
                    <span>HTTP (Plaintext :80)</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Transmits unencrypted data packets across internet hops. Suitable only for local debug or legacy embedded hardware.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                    <Lock className="h-4 w-4" />
                    <span>HTTPS (TLS 1.3 :443)</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    End-to-end authenticated encryption via ECDHE and AES-256-GCM. Unlocks modern HTTP/2 & HTTP/3 multiplexing.
                  </p>
                </div>
              </div>

              {/* Comprehensive Table */}
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                    <tr>
                      <th className="p-3 w-1/4">Comparison Metric</th>
                      <th className="p-3 w-3/8 text-amber-600 dark:text-amber-400">HTTP (Plaintext)</th>
                      <th className="p-3 w-3/8 text-emerald-600 dark:text-emerald-400">HTTPS (TLS Encrypted)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {comparisonRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-accent/40 transition-colors">
                        <td className="p-3 font-semibold text-foreground bg-muted/20">{row.dimension}</td>
                        <td className="p-3 text-muted-foreground leading-relaxed font-mono text-[11px]">{row.http}</td>
                        <td className="p-3 text-foreground leading-relaxed font-mono text-[11px] bg-emerald-500/5">{row.https}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

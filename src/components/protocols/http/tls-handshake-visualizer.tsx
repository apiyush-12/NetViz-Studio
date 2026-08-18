"use client";

import React from "react";
import { Shield, Lock, ArrowRight, ArrowLeft, CheckCircle2, Award } from "lucide-react";
import { Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { defaultTlsCertificate } from "@/features/protocols/http/http.defaults";
import type { TlsHandshakeStep } from "@/features/protocols/http/http.types";

interface TlsHandshakeVisualizerProps {
  steps: TlsHandshakeStep[];
  isTlsEnabled: boolean;
}

export function TlsHandshakeVisualizer({ steps, isTlsEnabled }: TlsHandshakeVisualizerProps) {
  if (!isTlsEnabled || steps.length === 0) {
    return (
      <div className="p-6 text-center border border-dashed border-border rounded-xl bg-card/40 space-y-2">
        <Shield className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
        <h4 className="text-sm font-semibold text-foreground">No TLS Encryption Active</h4>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          HTTP is operating over cleartext TCP port 80. Toggle <strong className="text-primary">HTTPS</strong> to inspect the 1-RTT cryptographic key exchange.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-xs">
      {/* Top Protocol Badge & Certificate Card */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-3">
        {/* Ladder Diagram */}
        <div className="border border-border rounded-xl bg-card p-3 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-emerald-400" />
              <span>TLS 1.3 Handshake Timeline (1-RTT)</span>
            </h4>
            <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
              RFC 8446
            </Badge>
          </div>

          <div className="space-y-3 pt-2">
            {steps.map((step) => {
              const isClientToServer = step.from.includes("Client");

              return (
                <div
                  key={step.stepNumber}
                  className="p-2.5 rounded-lg border border-border/80 bg-secondary/20 hover:bg-secondary/30 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-[10px] font-mono">
                        Step {step.stepNumber}
                      </Badge>
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        {step.name}
                        {isClientToServer ? (
                          <ArrowRight className="h-3 w-3 text-blue-400 inline" />
                        ) : (
                          <ArrowLeft className="h-3 w-3 text-emerald-400 inline" />
                        )}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      RTT ~ {step.rtt}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground">{step.summary}</p>

                  <div className="bg-background/80 p-2 rounded border border-border/40 font-mono text-[10px] space-y-0.5 text-foreground/80">
                    {step.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-1">
                        <span className="text-primary">•</span>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* X.509 Certificate Summary Card */}
        <Card className="border-border bg-card shadow-sm h-full flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-primary">
              <Award className="h-4 w-4" />
              <span>X.509 Digital Certificate</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs flex-1">
            <div>
              <span className="text-[10px] text-muted-foreground block">Common Name (CN)</span>
              <span className="font-mono font-semibold text-foreground">{defaultTlsCertificate.commonName}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Issuer Authority</span>
              <span className="font-mono text-muted-foreground">{defaultTlsCertificate.issuer}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Subject Alternative Names (SAN)</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {defaultTlsCertificate.subjectAltNames.map((san) => (
                  <Badge key={san} variant="outline" className="text-[9px] font-mono">{san}</Badge>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Cipher & Key Algorithm</span>
              <span className="font-mono text-[10px] text-emerald-400 block">{defaultTlsCertificate.keyAlgorithm}</span>
              <span className="font-mono text-[10px] text-primary">{defaultTlsCertificate.cipherSuite}</span>
            </div>
            <div className="pt-2 border-t border-border/50 flex items-center gap-1 text-[10px] text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              <span>Verified by Web PKI Trust Store</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

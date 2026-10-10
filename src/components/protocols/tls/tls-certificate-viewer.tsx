"use client";

import React, { useState } from "react";
import {
  Award,
  ShieldAlert,
  Calendar,
  Key,
  Globe,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Tabs } from "@/components/ui";
import type { TlsCertificateChain, TlsCertificate } from "@/features/protocols/tls/tls.types";
import { DEFAULT_TLS_CHAIN } from "@/features/protocols/tls/tls.defaults";

interface TlsCertificateViewerProps {
  chain?: TlsCertificateChain;
  certChain?: TlsCertificateChain;
}

export function TlsCertificateViewer({ chain: propChain, certChain }: TlsCertificateViewerProps) {
  const chain = certChain || propChain || DEFAULT_TLS_CHAIN;
  const [selectedCertLevel, setSelectedCertLevel] = useState<"leaf" | "intermediate" | "root">("leaf");

  const selectedCert: TlsCertificate =
    selectedCertLevel === "leaf"
      ? chain.leaf
      : selectedCertLevel === "intermediate"
      ? chain.intermediate
      : chain.root;

  const getStatusBadge = (cert: TlsCertificate) => {
    switch (cert.status) {
      case "expired":
        return (
          <Badge variant="default" className="bg-rose-500/20 text-rose-400 border-rose-500/30 gap-1 font-mono text-[10px]">
            <AlertTriangle className="h-3 w-3" />
            Expired (SEC_ERROR_EXPIRED_CERTIFICATE)
          </Badge>
        );
      case "self_signed":
        return (
          <Badge variant="default" className="bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1 font-mono text-[10px]">
            <AlertTriangle className="h-3 w-3" />
            Untrusted / Self-Signed (SEC_ERROR_UNKNOWN_ISSUER)
          </Badge>
        );
      case "hostname_mismatch":
        return (
          <Badge variant="default" className="bg-rose-500/20 text-rose-400 border-rose-500/30 gap-1 font-mono text-[10px]">
            <AlertTriangle className="h-3 w-3" />
            Hostname Mismatch (SSL_ERROR_BAD_CERT_DOMAIN)
          </Badge>
        );
      case "valid":
      default:
        return (
          <Badge variant="default" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1 font-mono text-[10px]">
            <CheckCircle2 className="h-3 w-3" />
            Valid & Trusted by Root CA
          </Badge>
        );
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="py-3 px-4 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                X.509 Certificate Chain of Trust
                {getStatusBadge(chain.leaf)}
              </CardTitle>
              <div className="text-[11px] text-muted-foreground font-mono">
                PKI Hierarchy: Root CA &rarr; Intermediate CA &rarr; Leaf Server Cert
              </div>
            </div>
          </div>

          <Tabs
            value={selectedCertLevel}
            onValueChange={(v) => setSelectedCertLevel(v as "leaf" | "intermediate" | "root")}
            tabs={[
              { id: "leaf", label: "Leaf (Server)" },
              { id: "intermediate", label: "Intermediate CA" },
              { id: "root", label: "Root CA (Anchor)" },
            ]}
          />
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs font-sans">
        {/* Visual Chain of Trust Hierarchy Breadcrumb */}
        <div className="p-3 rounded-lg bg-secondary/20 border border-border/60 space-y-2">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block font-sans">
            Cryptographic Certificate Path:
          </span>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <button
              onClick={() => setSelectedCertLevel("root")}
              className={`px-2.5 py-1.5 rounded border transition-colors ${
                selectedCertLevel === "root"
                  ? "bg-blue-500/20 border-blue-500 text-blue-300 font-bold"
                  : "bg-card border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              [Root] {chain.root.commonName}
            </button>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            <button
              onClick={() => setSelectedCertLevel("intermediate")}
              className={`px-2.5 py-1.5 rounded border transition-colors ${
                selectedCertLevel === "intermediate"
                  ? "bg-purple-500/20 border-purple-500 text-purple-300 font-bold"
                  : "bg-card border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              [Intermediate] {chain.intermediate.commonName}
            </button>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            <button
              onClick={() => setSelectedCertLevel("leaf")}
              className={`px-2.5 py-1.5 rounded border transition-colors ${
                selectedCertLevel === "leaf"
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                  : "bg-card border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              [Leaf] {chain.leaf.commonName}
            </button>
          </div>
        </div>

        {/* Security Alert Banner if not valid */}
        {selectedCert.statusReason && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-rose-400">
              <ShieldAlert className="h-4 w-4" />
              <span>PKI Security Warning</span>
            </div>
            <p className="text-[11px] leading-relaxed text-rose-200/90 font-mono">
              {selectedCert.statusReason}
            </p>
          </div>
        )}

        {/* Certificate Identity & Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
          {/* Subject Identity */}
          <div className="p-3 rounded-lg bg-secondary/30 border border-border/60 space-y-1.5">
            <span className="text-[10px] font-sans font-semibold text-muted-foreground uppercase flex items-center gap-1">
              <Globe className="h-3.5 w-3.5 text-blue-400" />
              Subject Identity (DN)
            </span>
            <div className="space-y-1 text-xs">
              <div>
                <span className="text-muted-foreground">CN: </span>
                <span className="font-bold text-foreground">{selectedCert.commonName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Org: </span>
                <span className="text-foreground">{selectedCert.organization}</span>
              </div>
              {selectedCert.isCa && (
                <Badge variant="outline" className="text-[9px] text-blue-400 border-blue-500/30 mt-1">
                  Basic Constraints: CA:TRUE
                </Badge>
              )}
            </div>
          </div>

          {/* Issuer Identity */}
          <div className="p-3 rounded-lg bg-secondary/30 border border-border/60 space-y-1.5">
            <span className="text-[10px] font-sans font-semibold text-muted-foreground uppercase flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-purple-400" />
              Issuing Authority (CA)
            </span>
            <div className="space-y-1 text-xs">
              <div>
                <span className="text-muted-foreground">Issuer CN: </span>
                <span className="font-bold text-foreground">{selectedCert.issuerCommonName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Issuer Org: </span>
                <span className="text-foreground">{selectedCert.issuerOrganization}</span>
              </div>
              {selectedCert.ocspStapled && (
                <Badge variant="secondary" className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mt-1">
                  ✓ OCSP Stapled (Real-Time Proof)
                </Badge>
              )}
            </div>
          </div>

          {/* Validity Period */}
          <div className="p-3 rounded-lg bg-secondary/30 border border-border/60 space-y-1.5">
            <span className="text-[10px] font-sans font-semibold text-muted-foreground uppercase flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-emerald-400" />
              Validity Period
            </span>
            <div className="space-y-1 text-[11px]">
              <div>
                <span className="text-muted-foreground">Not Before: </span>
                <span className="text-foreground">{selectedCert.validFrom}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Not After: </span>
                <span className="text-foreground">{selectedCert.validTo}</span>
              </div>
            </div>
          </div>

          {/* Public Key & Signature Algorithm */}
          <div className="p-3 rounded-lg bg-secondary/30 border border-border/60 space-y-1.5">
            <span className="text-[10px] font-sans font-semibold text-muted-foreground uppercase flex items-center gap-1">
              <Key className="h-3.5 w-3.5 text-amber-400" />
              Cryptographic Key Specs
            </span>
            <div className="space-y-1 text-[11px]">
              <div>
                <span className="text-muted-foreground">Public Key: </span>
                <span className="font-bold text-foreground">{selectedCert.publicKeyType} ({selectedCert.keySize}-bit)</span>
              </div>
              <div>
                <span className="text-muted-foreground">Signature Algo: </span>
                <span className="text-foreground">{selectedCert.signatureAlgorithm}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Alternative Names (SAN) */}
        {selectedCert.san.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Subject Alternative Names (SANs):
            </span>
            <div className="flex flex-wrap gap-1.5 font-mono">
              {selectedCert.san.map((domain: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-[11px] bg-slate-900 border border-slate-700 text-slate-200">
                  DNS:{domain}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Fingerprint & Serial Number */}
        <div className="space-y-2 pt-2 border-t border-border/50 font-mono text-[11px]">
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-sans">Serial Number:</span>
            <span className="text-foreground break-all">{selectedCert.serialNumber}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-sans">SHA-256 Fingerprint:</span>
            <span className="text-emerald-400 break-all select-all">{selectedCert.fingerprintSha256}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

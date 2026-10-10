"use client";

import React from "react";
import {
  Sliders,
  RotateCcw,
  Shield,
  Zap,
  Globe,
  Lock,
  Layers,
  FileBadge,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Switch,
  Label,
  Input,
  Badge,
} from "@/components/ui";
import type {
  TlsConfig,
  TlsScenarioId,
  TlsVersion,
  TlsCipherSuite,
  TlsNamedGroup,
  TlsCertificateStatus,
} from "@/features/protocols/tls/tls.types";
import { TLS_SCENARIOS } from "@/features/protocols/tls/tls.defaults";

interface TlsConfigPanelProps {
  config: TlsConfig;
  onUpdateConfig: (updates: Partial<TlsConfig>) => void;
  onSelectScenario: (scenarioId: TlsScenarioId) => void;
  onResetDefaults: () => void;
}

export function TlsConfigPanel({
  config,
  onUpdateConfig,
  onSelectScenario,
  onResetDefaults,
}: TlsConfigPanelProps) {
  const isTls13 = config.version === "TLS 1.3";

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="py-3 px-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                TLS Handshake Configuration
              </CardTitle>
              <span className="text-[11px] text-muted-foreground">
                Select scenarios, cryptographic parameters, and security modes
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onResetDefaults}
            className="h-7 text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Defaults</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Scenario Selection Grid */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>Pre-Configured Scenarios:</span>
          </Label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {(Object.keys(TLS_SCENARIOS) as TlsScenarioId[]).map((scId) => {
              const sc = TLS_SCENARIOS[scId];
              const isSelected = config.scenarioId === scId;

              return (
                <button
                  key={scId}
                  onClick={() => onSelectScenario(scId)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border/60 bg-secondary/20 hover:bg-secondary/40 hover:border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-foreground truncate">
                      {sc.title.split(". ")[1] || sc.title}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] px-1.5 py-0 ${
                        sc.version === "TLS 1.3"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {sc.version}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {sc.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cryptographic Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Version Selector */}
          <div className="space-y-1.5 p-3 rounded-lg border border-border/50 bg-background/50">
            <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              <span>TLS Version</span>
            </Label>
            <div className="grid grid-cols-2 gap-1.5">
              {(["TLS 1.3", "TLS 1.2"] as TlsVersion[]).map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    const newCipher: TlsCipherSuite =
                      v === "TLS 1.3"
                        ? "TLS_AES_128_GCM_SHA256"
                        : "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256";
                    onUpdateConfig({
                      version: v,
                      cipherSuite: newCipher,
                      zeroRttEnabled: v === "TLS 1.3" ? config.zeroRttEnabled : false,
                    });
                  }}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-md border transition-all ${
                    config.version === v
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/40 text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground block">
              {isTls13 ? "RFC 8446: 1-RTT & AEAD-only" : "RFC 5246: 2-RTT & CBC/RSA"}
            </span>
          </div>

          {/* Cipher Suite Selector */}
          <div className="space-y-1.5 p-3 rounded-lg border border-border/50 bg-background/50">
            <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span>Cipher Suite</span>
            </Label>
            <select
              value={config.cipherSuite}
              onChange={(e) => onUpdateConfig({ cipherSuite: e.target.value as TlsCipherSuite })}
              className="w-full text-xs bg-background border border-border rounded-md px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            >
              {isTls13 ? (
                <>
                  <option value="TLS_AES_128_GCM_SHA256">TLS_AES_128_GCM_SHA256</option>
                  <option value="TLS_AES_256_GCM_SHA384">TLS_AES_256_GCM_SHA384</option>
                  <option value="TLS_CHACHA20_POLY1305_SHA256">TLS_CHACHA20_POLY1305_SHA256</option>
                </>
              ) : (
                <>
                  <option value="TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256">
                    TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
                  </option>
                  <option value="TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384">
                    TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
                  </option>
                  <option value="TLS_RSA_WITH_AES_128_CBC_SHA">
                    TLS_RSA_WITH_AES_128_CBC_SHA (Insecure CBC)
                  </option>
                </>
              )}
            </select>
            <span className="text-[10px] text-muted-foreground block font-mono">
              AEAD Encryption & Auth
            </span>
          </div>

          {/* Key Exchange Named Group */}
          <div className="space-y-1.5 p-3 rounded-lg border border-border/50 bg-background/50">
            <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-purple-400" />
              <span>Key Share Group</span>
            </Label>
            <select
              value={config.namedGroup}
              onChange={(e) => onUpdateConfig({ namedGroup: e.target.value as TlsNamedGroup })}
              className="w-full text-xs bg-background border border-border rounded-md px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            >
              <option value="x25519">x25519 (Curve25519 — Recommended)</option>
              <option value="secp256r1">secp256r1 (NIST P-256)</option>
              <option value="secp384r1">secp384r1 (NIST P-384)</option>
            </select>
            <span className="text-[10px] text-muted-foreground block">
              Diffie-Hellman Ephemeral (DHE)
            </span>
          </div>

          {/* SNI Hostname */}
          <div className="space-y-1.5 p-3 rounded-lg border border-border/50 bg-background/50">
            <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-blue-400" />
              <span>SNI Hostname</span>
            </Label>
            <Input
              value={config.sniHostname}
              onChange={(e) => onUpdateConfig({ sniHostname: e.target.value })}
              placeholder="e.g. api.secure-bank.io"
              className="h-8 text-xs font-mono"
            />
            <span className="text-[10px] text-muted-foreground block">
              Server Name Indication extension
            </span>
          </div>
        </div>

        {/* Feature Switches & Certificate Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* 0-RTT Switch */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
            <div className="space-y-0.5 pr-2">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <span>0-RTT Early Data</span>
                {isTls13 ? (
                  <Badge variant="outline" className="text-[9px] bg-purple-500/10 text-purple-400 border-purple-500/30">
                    PSK
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[9px] bg-neutral-500/10 text-neutral-400 border-neutral-500/30">
                    TLS 1.3 only
                  </Badge>
                )}
              </Label>
              <span className="text-[10px] text-muted-foreground block">
                Transmit payload in Flight 1 before ServerHello
              </span>
            </div>
            <Switch
              checked={config.zeroRttEnabled && isTls13}
              onCheckedChange={(checked) => onUpdateConfig({ zeroRttEnabled: checked })}
              aria-label="Toggle 0-RTT Early Data"
            />
          </div>

          {/* mTLS Switch */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
            <div className="space-y-0.5 pr-2">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <span>Mutual TLS (mTLS)</span>
                <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  Client Cert
                </Badge>
              </Label>
              <span className="text-[10px] text-muted-foreground block">
                Two-way client certificate authentication
              </span>
            </div>
            <Switch
              checked={config.mTlsEnabled}
              onCheckedChange={(checked) => onUpdateConfig({ mTlsEnabled: checked })}
              aria-label="Toggle Mutual TLS"
            />
          </div>

          {/* OCSP Stapling Switch */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
            <div className="space-y-0.5 pr-2">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <span>OCSP Stapling</span>
                <Badge variant="outline" className="text-[9px] bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                  status_request
                </Badge>
              </Label>
              <span className="text-[10px] text-muted-foreground block">
                Server provides signed OCSP revocation proof
              </span>
            </div>
            <Switch
              checked={config.ocspStaplingEnabled}
              onCheckedChange={(checked) => onUpdateConfig({ ocspStaplingEnabled: checked })}
              aria-label="Toggle OCSP Stapling"
            />
          </div>

          {/* Server Certificate Status Override */}
          <div className="space-y-1.5 p-3 rounded-lg border border-border/50 bg-background/50">
            <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <FileBadge className="h-3.5 w-3.5 text-amber-400" />
              <span>Server Certificate Status</span>
            </Label>
            <select
              value={config.certStatus}
              onChange={(e) =>
                onUpdateConfig({ certStatus: e.target.value as TlsCertificateStatus })
              }
              className="w-full text-xs bg-background border border-border rounded-md px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            >
              <option value="valid">Valid (GlobalTrust CA Chain)</option>
              <option value="expired">Expired (NotAfter Date Passed)</option>
              <option value="self_signed">Self-Signed (Untrusted Root)</option>
              <option value="hostname_mismatch">Hostname Mismatch (Wrong SAN)</option>
              <option value="revoked">Revoked (OCSP Revocation Status)</option>
            </select>
            <span className="text-[10px] text-muted-foreground block">
              Simulate PKI validation failure alerts
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

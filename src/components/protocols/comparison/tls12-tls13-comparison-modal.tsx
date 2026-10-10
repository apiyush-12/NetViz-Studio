"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Zap,
  X,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import {
  Button,
  Tabs,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "@/components/ui";

interface Tls12Tls13ComparisonModalProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Tls12Tls13ComparisonModal({
  isOpen: controlledIsOpen,
  onOpenChange,
}: Tls12Tls13ComparisonModalProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("matrix");

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  const comparisonData = [
    {
      dimension: "Handshake Round Trips (Latency)",
      tls13: "1-RTT for Full Initial Handshake. Speculates key share in ClientHello. 0-RTT Early Data for PSK session resumption.",
      tls12: "2-RTT for Full Handshake (ClientHello &rarr; ServerHello & Certificate & ServerKeyExchange &rarr; ClientKeyExchange & ChangeCipherSpec &rarr; Finished).",
      impact: "50% lower initial connection latency; 100% lower latency on resumed connections.",
    },
    {
      dimension: "Forward Secrecy (PFS)",
      tls13: "Mandatory Ephemeral Diffie-Hellman (ECDHE / DHE). Static RSA key exchange is completely removed from the standard.",
      tls12: "Optional. Static RSA key exchange allowed, meaning compromising server private key decrypts past recorded traffic.",
      impact: "Guarantees past sessions cannot be decrypted even if server private key is leaked in the future.",
    },
    {
      dimension: "Key Derivation Function",
      tls13: "Cryptographically proven HKDF Tree (RFC 5869: HKDF-Extract and HKDF-Expand) with isolated Early, Handshake, and Master secrets.",
      tls12: "Ad-hoc HMAC-based Pseudo-Random Function (PRF) generating a single continuous key block split into client/server MAC and cipher keys.",
      impact: "Clean cryptographic separation prevents side-channel cross-stage key leakage.",
    },
    {
      dimension: "Symmetric Encryption Modes",
      tls13: "Authenticated Encryption with Associated Data (AEAD) ONLY: AES-128-GCM, AES-256-GCM, ChaCha20-Poly1305. CBC mode strictly forbidden.",
      tls12: "CBC mode (Cipher Block Chaining) with HMAC allowed. Subject to padding oracle attacks (POODLE, Lucky 13, Zombie POODLE).",
      impact: "Completely eliminates padding oracle vulnerabilities and guarantees message integrity + secrecy in a single primitive.",
    },
    {
      dimension: "Handshake Message Confidentiality",
      tls13: "Encrypted Handshake: Server Certificate, CertificateVerify, and Extensions are encrypted under Server Handshake Traffic Key.",
      tls12: "Cleartext Handshake: Server Certificate, Client Certificate, and ServerKeyExchange are sent entirely unencrypted in cleartext.",
      impact: "Prevents passive network eavesdroppers from discovering client identities, domain certificates, or SANs.",
    },
    {
      dimension: "Obsolete Cryptography Removal",
      tls13: "Completely removed: RSA key exchange, Diffie-Hellman static parameters, DSA, RC4, 3DES, MD5, SHA-1, TLS compression (CRIME attack).",
      tls12: "Allows legacy suites including RC4, 3DES, custom DH groups (vulnerable to Logjam), and weak hash algorithms.",
      impact: "Massive reduction in protocol attack surface; simplifies server and client cipher negotiation logic.",
    },
    {
      dimension: "Session Resumption Mechanism",
      tls13: "Unified Pre-Shared Key (PSK) architecture. Server sends NewSessionTicket; client provides PSK binder to verify integrity.",
      tls12: "Dual mechanisms: Session IDs (requires server-side cache state) and Session Tickets (RFC 5077, encrypted with server ticket key).",
      impact: "Streamlined resumption architecture supporting seamless 0-RTT data transfer.",
    },
    {
      dimension: "Downgrade Protection",
      tls13: "Embedded downgrade canary in ServerHello random bytes (RFC 8446 Section 4.1.3). Client detecting legacy version with canary aborts immediately.",
      tls12: "Vulnerable to forced downgrade attacks unless TLS_FALLBACK_SCSV is explicitly supported by both client and server.",
      impact: "Active MITM attackers cannot force modern endpoints down to TLS 1.2 or SSL 3.0.",
    },
  ];

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-8 text-xs flex items-center gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>Compare TLS 1.3 vs TLS 1.2</span>
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-card border-border shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <CardHeader className="py-4 px-6 border-b border-border/80 bg-secondary/30 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <span>TLS 1.3 (RFC 8446) vs TLS 1.2 (RFC 5246) Comparison</span>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                    IETF Standard
                  </Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Architectural, latency, and cryptographic security breakdown between modern and legacy TLS
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              tabs={[
                { id: "matrix", label: "Comparison Matrix" },
                { id: "latency", label: "Latency & 0-RTT Rationale" },
                { id: "ciphers", label: "Ciphersuite Evolution" },
              ]}
            />
          </div>
        </CardHeader>

        {/* Modal Content */}
        <CardContent className="p-6 overflow-y-auto space-y-6 text-xs">
          {activeTab === "matrix" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="grid grid-cols-12 bg-secondary/60 p-3 font-semibold text-foreground border-b border-border text-xs">
                  <div className="col-span-3">Architectural Dimension</div>
                  <div className="col-span-4 text-emerald-400">TLS 1.3 (RFC 8446)</div>
                  <div className="col-span-3 text-amber-400">TLS 1.2 (RFC 5246)</div>
                  <div className="col-span-2 text-cyan-400">Security / Latency Impact</div>
                </div>

                <div className="divide-y divide-border/60">
                  {comparisonData.map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 p-3.5 hover:bg-secondary/20 transition-colors gap-2 items-start"
                    >
                      <div className="col-span-3 font-medium text-foreground">
                        {row.dimension}
                      </div>
                      <div className="col-span-4 text-muted-foreground leading-relaxed pr-2">
                        <span className="text-emerald-300/90">{row.tls13}</span>
                      </div>
                      <div className="col-span-3 text-muted-foreground leading-relaxed pr-2">
                        <span className="text-amber-300/90">{row.tls12}</span>
                      </div>
                      <div className="col-span-2 text-[11px] text-cyan-300 leading-normal">
                        {row.impact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "latency" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* TLS 1.2 Ladder */}
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-400" />
                      <span>TLS 1.2 Legacy Handshake</span>
                    </span>
                    <Badge variant="outline" className="border-amber-500/40 text-amber-300">
                      2-RTT (Two Round Trips)
                    </Badge>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-2 rounded bg-card/60 border border-border/50">
                      <span className="text-muted-foreground">RTT 0.5: </span>
                      <span className="text-foreground">Client &rarr; Server: </span>
                      <span className="text-amber-300">ClientHello (cipher proposals)</span>
                    </div>
                    <div className="p-2 rounded bg-card/60 border border-border/50">
                      <span className="text-muted-foreground">RTT 1.0: </span>
                      <span className="text-foreground">Server &rarr; Client: </span>
                      <span className="text-amber-300">ServerHello, Certificate, ServerKeyExchange, ServerHelloDone</span>
                    </div>
                    <div className="p-2 rounded bg-card/60 border border-border/50">
                      <span className="text-muted-foreground">RTT 1.5: </span>
                      <span className="text-foreground">Client &rarr; Server: </span>
                      <span className="text-amber-300">ClientKeyExchange, ChangeCipherSpec, Finished</span>
                    </div>
                    <div className="p-2 rounded bg-card/60 border border-border/50">
                      <span className="text-muted-foreground">RTT 2.0: </span>
                      <span className="text-foreground">Server &rarr; Client: </span>
                      <span className="text-amber-300">ChangeCipherSpec, Finished</span>
                    </div>
                    <div className="p-2 rounded bg-emerald-950/20 border border-emerald-500/30">
                      <span className="text-muted-foreground">RTT 2.5+: </span>
                      <span className="text-emerald-300">First HTTP Application Data sent</span>
                    </div>
                  </div>
                </div>

                {/* TLS 1.3 Ladder */}
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-sm flex items-center gap-2">
                      <Zap className="h-4 w-4 text-emerald-400" />
                      <span>TLS 1.3 Modern Handshake</span>
                    </span>
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-300">
                      1-RTT (50% Faster)
                    </Badge>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-2 rounded bg-card/60 border border-border/50">
                      <span className="text-muted-foreground">RTT 0.5: </span>
                      <span className="text-foreground">Client &rarr; Server: </span>
                      <span className="text-emerald-300">ClientHello + key_share (X25519)</span>
                    </div>
                    <div className="p-2 rounded bg-card/60 border border-border/50">
                      <span className="text-muted-foreground">RTT 1.0: </span>
                      <span className="text-foreground">Server &rarr; Client: </span>
                      <span className="text-emerald-300">ServerHello + key_share, {`{EncryptedExtensions, Cert, CertVerify, Finished}`}</span>
                    </div>
                    <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/40">
                      <span className="text-muted-foreground">RTT 1.0: </span>
                      <span className="text-emerald-300 font-semibold">Client verifies server; Application Data can flow immediately!</span>
                    </div>
                    <div className="p-2 rounded bg-purple-950/20 border border-purple-500/30">
                      <span className="text-muted-foreground">0-RTT Mode: </span>
                      <span className="text-purple-300">Resumed clients send early application data in Flight 1!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ciphers" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border space-y-3">
                  <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Allowed in TLS 1.3 (Only 5 Ciphersuites)</span>
                  </h4>
                  <ul className="space-y-2 font-mono text-xs text-muted-foreground">
                    <li className="p-2 rounded bg-secondary/30 text-foreground flex items-center justify-between">
                      <span>TLS_AES_128_GCM_SHA256</span>
                      <Badge variant="outline" className="text-[10px] text-emerald-400">AEAD</Badge>
                    </li>
                    <li className="p-2 rounded bg-secondary/30 text-foreground flex items-center justify-between">
                      <span>TLS_AES_256_GCM_SHA384</span>
                      <Badge variant="outline" className="text-[10px] text-emerald-400">AEAD</Badge>
                    </li>
                    <li className="p-2 rounded bg-secondary/30 text-foreground flex items-center justify-between">
                      <span>TLS_CHACHA20_POLY1305_SHA256</span>
                      <Badge variant="outline" className="text-[10px] text-emerald-400">Mobile Fast</Badge>
                    </li>
                    <li className="p-2 rounded bg-secondary/30 text-foreground flex items-center justify-between">
                      <span>TLS_AES_128_CCM_SHA256</span>
                      <Badge variant="outline" className="text-[10px] text-emerald-400">IoT</Badge>
                    </li>
                    <li className="p-2 rounded bg-secondary/30 text-foreground flex items-center justify-between">
                      <span>TLS_AES_128_CCM_8_SHA256</span>
                      <Badge variant="outline" className="text-[10px] text-emerald-400">IoT</Badge>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/10 space-y-3">
                  <h4 className="font-semibold text-red-400 text-sm flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-400" />
                    <span>Purged From TLS 1.3 (Deprecated Vulnerabilities)</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="p-2 rounded bg-card/60 border border-border/40">
                      <strong className="text-foreground">Static RSA Key Exchange:</strong> No forward secrecy; Heartbleed / private key theft compromises all past recorded sessions.
                    </li>
                    <li className="p-2 rounded bg-card/60 border border-border/40">
                      <strong className="text-foreground">CBC Mode (Cipher Block Chaining):</strong> Padding oracle attacks (POODLE, Lucky 13, Zombie POODLE).
                    </li>
                    <li className="p-2 rounded bg-card/60 border border-border/40">
                      <strong className="text-foreground">RC4 Stream Cipher:</strong> Bias in keystream bytes breaks confidentiality.
                    </li>
                    <li className="p-2 rounded bg-card/60 border border-border/40">
                      <strong className="text-foreground">TLS Compression:</strong> CRIME and BREACH side-channel attacks recover session tokens.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

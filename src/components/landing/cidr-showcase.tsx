"use client";

import React, { useState } from "react";
import Link from "next/link";
import { calculateCidr } from "@/features/cidr/cidr-calculator";
import type { CidrResult } from "@/features/cidr/cidr-types";
import { Card, CardContent, Button } from "@/components/ui";
import { Calculator, ArrowRight, AlertCircle, Binary, Info } from "lucide-react";

export function CidrShowcase() {
  const [inputValue, setInputValue] = useState<string>("192.168.1.10/24");
  const calculation = calculateCidr(inputValue);

  const isValid = calculation.isValid;
  const result: CidrResult | null = isValid ? (calculation as CidrResult) : null;
  const errorMessage = !isValid ? (calculation as { message: string }).message : "";

  return (
    <section id="cidr" className="py-16 md:py-24 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-mono uppercase tracking-widest text-primary font-bold">IPv4 Address Engineering</p>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Calculate and visualize CIDR & subnetting
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Enter any IPv4 CIDR prefix below to inspect usable host ranges, wildcard masks, and 32-bit binary network vs host bit allocations live.
          </p>
        </div>

        {/* CIDR Calculator Input Panel */}
        <Card className="border border-border bg-card/90 shadow-2xl max-w-4xl mx-auto">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                  <Calculator className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g. 192.168.1.10/24 or 10.0.0.0/16"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-secondary/40 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  aria-label="IPv4 CIDR input notation"
                />
              </div>

              {/* Sample Preset Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {["192.168.1.10/24", "10.0.0.1/16", "172.16.4.1/22"].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setInputValue(preset)}
                    className="px-2.5 py-1.5 rounded-lg border border-border bg-secondary hover:bg-accent text-xs font-mono font-medium text-foreground transition-colors"
                  >
                    {preset.split("/")[1] ? `/${preset.split("/")[1]}` : preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message for Invalid Input */}
            {!isValid && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2 font-medium animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage || "Invalid IPv4 address or CIDR prefix length (e.g. 192.168.1.1/24)"}</span>
              </div>
            )}

            {/* Live Calculation Results Grid */}
            {result && (
              <div className="space-y-6 animate-in fade-in">
                {/* Core Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-border bg-secondary/30 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-muted-foreground">Network ID</span>
                    <p className="font-mono font-bold text-sm text-foreground truncate">{result.networkAddress}</p>
                  </div>
                  <div className="p-3 rounded-xl border border-border bg-secondary/30 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-muted-foreground">Broadcast ID</span>
                    <p className="font-mono font-bold text-sm text-foreground truncate">{result.broadcastAddress}</p>
                  </div>
                  <div className="p-3 rounded-xl border border-border bg-secondary/30 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-muted-foreground">Subnet Mask</span>
                    <p className="font-mono font-bold text-sm text-foreground truncate">{result.subnetMask}</p>
                  </div>
                  <div className="p-3 rounded-xl border border-border bg-secondary/30 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-muted-foreground">Wildcard Mask</span>
                    <p className="font-mono font-bold text-sm text-foreground truncate">{result.wildcardMask}</p>
                  </div>
                </div>

                {/* Extended Details */}
                <div className="grid sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">First Usable Host:</span>
                      <span className="font-bold text-emerald-400">{result.firstUsableHost || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Last Usable Host:</span>
                      <span className="font-bold text-emerald-400">{result.lastUsableHost || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border/50">
                      <span className="text-muted-foreground">Usable Host Count:</span>
                      <span className="font-bold text-foreground">{Number(result.usableHostCount).toLocaleString()} hosts</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Addresses:</span>
                      <span className="font-bold text-foreground">{Number(result.totalAddresses).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Network / Host Bits:</span>
                      <span className="font-bold text-primary">
                        {result.networkBits} net / {result.hostBits} host
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border/50">
                      <span className="text-muted-foreground">Legacy Class:</span>
                      <span className="font-bold text-amber-400">Class {result.legacyClass}</span>
                    </div>
                  </div>
                </div>

                {/* 32-Bit Binary Breakdown Visualizer */}
                <div className="p-4 rounded-xl border border-border bg-secondary/40 space-y-3 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Binary className="h-4 w-4 text-primary" /> 32-Bit Binary Network vs Host Mask Breakdown
                    </span>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="text-primary font-bold">■ Network Bits ({result.networkBits})</span>
                      <span className="text-emerald-400 font-bold">■ Host Bits ({result.hostBits})</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-background text-xs sm:text-sm font-bold tracking-widest break-all">
                    {result.ipBinary.split(".").map((octet, octetIdx) => (
                      <React.Fragment key={octetIdx}>
                        {octetIdx > 0 && <span className="text-muted-foreground mx-1">.</span>}
                        {octet.split("").map((bit, bitIdx) => {
                          const globalBitIndex = octetIdx * 8 + bitIdx;
                          const isNetworkBit = globalBitIndex < result.networkBits;
                          return (
                            <span
                              key={bitIdx}
                              className={isNetworkBit ? "text-primary" : "text-emerald-400 font-medium"}
                            >
                              {bit}
                            </span>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Educational Assumption Note */}
            <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-4 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Legacy IP class can be shown for learning, while modern addressing uses classless CIDR.</span>
              </p>

              <Link href="/cidr">
                <Button size="sm" variant="default" className="text-xs font-semibold gap-1.5 shrink-0">
                  <span>Open CIDR Studio</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

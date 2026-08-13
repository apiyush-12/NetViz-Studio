"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import type { DnsResolutionStep, DnsRcode } from "@/features/protocols/dns/dns.types";

interface DnsHierarchyViewProps {
  queryHostname: string;
  steps: DnsResolutionStep[];
  rcode?: DnsRcode;
}

export function DnsHierarchyView({
  queryHostname,
  steps,
  rcode = "NOERROR",
}: DnsHierarchyViewProps) {
  return (
    <div className="space-y-4">
      {/* 1. Resolution Summary Banner */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Hierarchical Delegation Traversal Tree</CardTitle>
            <Badge
              variant={rcode === "NOERROR" ? "success" : rcode === "NXDOMAIN" ? "outline" : "destructive"}
              className="font-mono text-xs"
            >
              RCODE: {rcode}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Query for <strong className="text-primary font-mono">{queryHostname}</strong> traverses through
            the global DNS tree via recursive delegation referrals.
          </p>
        </CardContent>
      </Card>

      {/* 2. Step-by-Step Traversal Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Iterative Traversal Sequence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-border text-left font-sans text-muted-foreground">
                  <th className="py-2">Hop</th>
                  <th className="py-2">Queried Server</th>
                  <th className="py-2">Action / Delegation</th>
                  <th className="py-2">Returned Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {steps.map((step) => (
                  <tr key={step.stepIndex} className="hover:bg-accent/40">
                    <td className="py-2 font-bold text-primary">{step.stepIndex}</td>
                    <td className="py-2 text-foreground font-medium">{step.toNodeId}</td>
                    <td className="py-2">
                      <Badge
                        variant={
                          step.responseType === "ANSWER"
                            ? "success"
                            : step.responseType === "CACHE_HIT"
                              ? "default"
                              : step.responseType === "SERVFAIL"
                                ? "destructive"
                                : "outline"
                        }
                        className="text-[10px]"
                      >
                        {step.responseType}
                      </Badge>
                    </td>
                    <td className="py-2 text-emerald-400 font-bold">
                      {step.resolvedValue ? step.resolvedValue : "Delegation Referral"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

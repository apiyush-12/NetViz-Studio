"use client";

import React from "react";
import { Label, Input, Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Network, Sliders, AlertTriangle } from "lucide-react";
import type { DnsRecordType } from "@/features/protocols/dns/dns.types";
import type { DnsValidationError } from "@/features/protocols/dns/dns.validators";

interface DnsConfigPanelProps {
  queryHostname: string;
  queryType: DnsRecordType;
  topologyPreset?: string;
  validationErrors: DnsValidationError[];
  onSelectTopologyPreset?: (preset: "iterative-hierarchy" | "recursive-caching" | "cname-chain" | "split-brain-lan") => void;
  onUpdateQuery: (hostname: string, type: DnsRecordType) => void;
  onSelectFailureScenario: (scenario: string) => void;
}

export function DnsConfigPanel({
  queryHostname,
  queryType,
  topologyPreset = "iterative-hierarchy",
  validationErrors,
  onSelectTopologyPreset,
  onUpdateQuery,
  onSelectFailureScenario,
}: DnsConfigPanelProps) {
  return (
    <div className="space-y-4">
      {/* 1. Topology Preset Selector */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">DNS Architecture Presets</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "iterative-hierarchy", name: "Iterative Hierarchy", desc: "Root (.) → TLD → Auth Server" },
              { id: "recursive-caching", name: "Resolver Caching", desc: "Cache HIT vs MISS Demonstration" },
              { id: "cname-chain", name: "CNAME Alias Chain", desc: "Multi-Step Canonical Alias Lookup" },
              { id: "split-brain-lan", name: "Split-Horizon DNS", desc: "Internal Corp vs Public Views" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() =>
                  onSelectTopologyPreset?.(
                    p.id as "iterative-hierarchy" | "recursive-caching" | "cname-chain" | "split-brain-lan"
                  )
                }
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  topologyPreset === p.id
                    ? "bg-primary/15 border-primary text-primary"
                    : "bg-secondary/40 border-border hover:bg-accent/40 text-muted-foreground"
                }`}
              >
                <span className="font-semibold text-xs text-foreground block">{p.name}</span>
                <span className="text-[11px] text-muted-foreground">{p.desc}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2. Validation Diagnosis Banner */}
      {validationErrors.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/10">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <CardTitle className="text-sm text-amber-400">
                DNS Configuration Diagnosis ({validationErrors.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {validationErrors.map((err) => (
              <div key={err.id} className="p-2 bg-card/60 rounded border border-amber-500/20">
                <span className="font-semibold text-amber-300 block">{err.title}</span>
                <p className="text-muted-foreground mt-0.5">{err.message}</p>
                <p className="text-primary mt-1 font-mono text-[11px]">→ {err.recommendation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 3. Scenario & Failure Injection */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Predefined DNS Query Conditions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => onSelectFailureScenario("none")}>
            Standard A Record Query
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectFailureScenario("cache_hit")}
          >
            Local Resolver Cache HIT (0 Hops)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectFailureScenario("nxdomain_not_found")}
          >
            Non-Existent Domain (NXDOMAIN)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectFailureScenario("cname_resolution")}
          >
            CNAME Alias Chain Resolution
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectFailureScenario("authoritative_timeout_servfail")}
          >
            Nameserver Timeout → SERVFAIL
          </Button>
        </CardContent>
      </Card>

      {/* 4. Hostname Query Input & Type Picker */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">DNS Query Generator</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div>
              <Label className="text-[11px] text-muted-foreground block mb-1">Queried Domain Name (FQDN)</Label>
              <Input
                value={queryHostname}
                onChange={(e) => onUpdateQuery(e.target.value, queryType)}
                className="h-7 text-xs font-mono"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground block mb-1">Record Type</Label>
              <select
                value={queryType}
                onChange={(e) => onUpdateQuery(queryHostname, e.target.value as DnsRecordType)}
                className="w-full bg-slate-900 border border-border rounded px-2 h-7 text-xs font-mono text-primary"
              >
                <option value="A">A (IPv4 Host Address)</option>
                <option value="AAAA">AAAA (IPv6 Host Address)</option>
                <option value="CNAME">CNAME (Canonical Name Alias)</option>
                <option value="MX">MX (Mail Exchange)</option>
                <option value="NS">NS (Authoritative Nameserver)</option>
                <option value="TXT">TXT (Text / SPF Record)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

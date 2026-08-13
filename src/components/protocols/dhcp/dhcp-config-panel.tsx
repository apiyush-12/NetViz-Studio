"use client";

import React from "react";
import { Label, Input, Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Network, Sliders, AlertTriangle } from "lucide-react";
import type { DhcpPool } from "@/features/protocols/dhcp/dhcp.types";
import type { DhcpValidationError } from "@/features/protocols/dhcp/dhcp.validators";

interface DhcpConfigPanelProps {
  pool: DhcpPool;
  topologyPreset?: string;
  clientMac?: string;
  clientHostname?: string;
  validationErrors: DhcpValidationError[];
  onSelectTopologyPreset?: (preset: "simple-lan" | "dual-server" | "relay-agent" | "exhaustion-rogue") => void;
  onUpdatePool: (updates: Partial<DhcpPool>) => void;
  onUpdateClient: (mac: string, hostname: string) => void;
  onSelectFailureScenario: (scenario: string) => void;
}

export function DhcpConfigPanel({
  pool,
  topologyPreset = "simple-lan",
  clientMac = "00:1A:2B:3C:4D:5E",
  clientHostname = "workstation-01",
  validationErrors,
  onSelectTopologyPreset,
  onUpdatePool,
  onUpdateClient,
  onSelectFailureScenario,
}: DhcpConfigPanelProps) {
  return (
    <div className="space-y-4">
      {/* 1. Topology Preset Selector */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">DHCP Network Topologies</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "simple-lan", name: "Simple LAN", desc: "Single Subnet DORA Exchange" },
              { id: "dual-server", name: "Dual-Server Redundancy", desc: "Split-Scope High-Availability" },
              { id: "relay-agent", name: "DHCP Relay Agent", desc: "Cross-Subnet IP Helper (giaddr)" },
              { id: "exhaustion-rogue", name: "Rogue / Exhaustion", desc: "Security Threat & Starvation" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() =>
                  onSelectTopologyPreset?.(
                    p.id as "simple-lan" | "dual-server" | "relay-agent" | "exhaustion-rogue"
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
                DHCP Configuration Diagnosis ({validationErrors.length})
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
          <CardTitle className="text-sm">Predefined DHCP Scenarios & Injections</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => onSelectFailureScenario("none")}>
            Normal Condition (Clean DORA)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectFailureScenario("pool_exhausted")}
          >
            Address Pool Exhaustion (Scope Full)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectFailureScenario("ip_conflict_decline")}
          >
            ARP IP Conflict → DHCPDECLINE
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectFailureScenario("rogue_server")}
          >
            Rogue DHCP Server Injection
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectFailureScenario("dhcp_nak")}
          >
            Invalid Requested IP → DHCPNAK
          </Button>
        </CardContent>
      </Card>

      {/* 4. Address Pool Scope Customizer */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">DHCP Server Scope Parameters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div>
              <Label className="text-[11px] text-muted-foreground block mb-1">Pool Start IP</Label>
              <Input
                value={pool.startAddress}
                onChange={(e) => onUpdatePool({ startAddress: e.target.value })}
                className="h-7 text-xs font-mono"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground block mb-1">Pool End IP</Label>
              <Input
                value={pool.endAddress}
                onChange={(e) => onUpdatePool({ endAddress: e.target.value })}
                className="h-7 text-xs font-mono"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground block mb-1">Default Gateway (Opt 3)</Label>
              <Input
                value={pool.gateway}
                onChange={(e) => onUpdatePool({ gateway: e.target.value })}
                className="h-7 text-xs font-mono"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground block mb-1">Lease Time (Seconds)</Label>
              <Input
                type="number"
                value={pool.leaseDurationSeconds}
                onChange={(e) => onUpdatePool({ leaseDurationSeconds: Number(e.target.value) })}
                className="h-7 text-xs font-mono"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Client Identity Customizer */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Client Machine Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div>
              <Label className="text-[11px] text-muted-foreground block mb-1">Client MAC Address</Label>
              <Input
                value={clientMac}
                onChange={(e) => onUpdateClient(e.target.value, clientHostname)}
                className="h-7 text-xs font-mono"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground block mb-1">Client Hostname (Opt 12)</Label>
              <Input
                value={clientHostname}
                onChange={(e) => onUpdateClient(clientMac, e.target.value)}
                className="h-7 text-xs font-mono"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

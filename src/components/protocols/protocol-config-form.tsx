"use client";

import Link from "next/link";
import { RotateCcw, Check } from "lucide-react";
import { useSimulationStore } from "@/features/simulation/simulation-store";
import { getProtocol, getImplementedProtocols } from "@/features/protocols/registry";
import { Label, Input, Button, Switch, Badge } from "@/components/ui";
import { defaultTcpConfig } from "@/features/protocols/tcp/tcp.config";
import { defaultUdpConfig } from "@/features/protocols/udp/udp.config";
import { TcpUdpComparisonModal } from "./comparison/tcp-udp-comparison-modal";
import { OspfBgpComparisonModal } from "./comparison/ospf-bgp-comparison-modal";
import { NetworkServicesComparisonModal } from "./comparison/network-services-comparison-modal";

export function ProtocolSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const protocols = getImplementedProtocols();
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-medium"
      aria-label="Select protocol"
    >
      {protocols.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name} — {p.layer}
        </option>
      ))}
    </select>
  );
}

export function ProtocolConfigForm() {
  const protocolId = useSimulationStore((s) => s.protocolId);
  const config = useSimulationStore((s) => s.config);
  const updateConfig = useSimulationStore((s) => s.updateConfig);
  const regenerate = useSimulationStore((s) => s.regenerate);

  const protocol = protocolId ? getProtocol(protocolId) : null;
  if (!protocol) return null;

  if (protocolId === "tcp") {
    const tcpConfig = { ...defaultTcpConfig, ...config };
    return (
      <div className="space-y-3 p-3 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-semibold">TCP Configuration</h3>
          <TcpUdpComparisonModal />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="Data packets" type="number" value={tcpConfig.packetCount}
            onChange={(v) => updateConfig({ packetCount: Number(v) })} min={1} max={10} />
          <Field label="Initial seq #" type="number" value={tcpConfig.initialSeqNum}
            onChange={(v) => updateConfig({ initialSeqNum: Number(v) })} />
          <Field label="Window size" type="number" value={tcpConfig.windowSize}
            onChange={(v) => updateConfig({ windowSize: Number(v) })} />
          <Field label="MSS" type="number" value={tcpConfig.mss}
            onChange={(v) => updateConfig({ mss: Number(v) })} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 border border-border/50">
            <Label className="text-xs">Simulate packet loss (segment 2)</Label>
            <Switch checked={tcpConfig.dropPacketIndex >= 0}
              onCheckedChange={(checked) => updateConfig({ dropPacketIndex: checked ? 1 : -1 })} />
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 border border-border/50">
            <Label className="text-xs">Simulate out-of-order</Label>
            <Switch checked={!tcpConfig.orderedDelivery}
              onCheckedChange={(checked) => updateConfig({ orderedDelivery: !checked })} />
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig(defaultTcpConfig); regenerate(); }}
            className="text-xs cursor-pointer gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={() => regenerate()}
            className="text-xs font-semibold cursor-pointer gap-1.5"
          >
            <Check className="h-3.5 w-3.5" />
            Accept & Regenerate
          </Button>
        </div>
      </div>
    );
  }

  if (protocolId === "udp") {
    const udpConfig = { ...defaultUdpConfig, ...config };
    return (
      <div className="space-y-3 p-3 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-semibold">UDP Configuration</h3>
          <TcpUdpComparisonModal />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Datagram count" type="number" value={udpConfig.datagramCount}
            onChange={(v) => updateConfig({ datagramCount: Number(v) })} min={1} max={15} />
          <Field label="Payload size (bytes)" type="number" value={udpConfig.payloadSize}
            onChange={(v) => updateConfig({ payloadSize: Number(v) })} />
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 border border-border/50">
          <Label className="text-xs">Simulate packet loss</Label>
          <Switch checked={udpConfig.dropIndices.length > 0}
            onCheckedChange={(checked) => updateConfig({ dropIndices: checked ? [1] : [] })} />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig(defaultUdpConfig); regenerate(); }}
            className="text-xs cursor-pointer gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={() => regenerate()}
            className="text-xs font-semibold cursor-pointer gap-1.5"
          >
            <Check className="h-3.5 w-3.5" />
            Accept & Regenerate
          </Button>
        </div>
      </div>
    );
  }

  if (protocolId === "ospf") {
    return (
      <div className="space-y-3 p-3 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">OSPF Dijkstra SPF & Multi-Topology Controls</h3>
            <Badge variant="default" className="text-[10px]">Area 0 Backbone</Badge>
          </div>
          <div className="flex items-center gap-2">
            <OspfBgpComparisonModal />
            <Link href="/protocols/ospf">
              <Button size="sm" variant="default" className="text-xs">
                Open Dedicated OSPF Studio →
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ failureScenario: "r2_r4_cost_high" }); regenerate(); }}
          >
            Scenario: High Link Cost (R2-R4=50)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ failureScenario: "r2_r4_break" }); regenerate(); }}
          >
            Scenario: Break Link R2-R4
          </Button>
        </div>
      </div>
    );
  }

  if (protocolId === "bgp") {
    return (
      <div className="space-y-3 p-3 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">BGP Autonomous Systems & Policy Controls</h3>
            <Badge variant="default" className="text-[10px]">4 AS Domain</Badge>
          </div>
          <div className="flex items-center gap-2">
            <OspfBgpComparisonModal />
            <Link href="/protocols/bgp">
              <Button size="sm" variant="default" className="text-xs">
                Open Dedicated BGP Studio →
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ failureScenario: "as_path_prepend_as65002" }); regenerate(); }}
          >
            Scenario: AS-Path Prepend (3x)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ failureScenario: "break_as65001_as65002" }); regenerate(); }}
          >
            Scenario: Break Peering Link
          </Button>
        </div>
      </div>
    );
  }

  if (protocolId === "dhcp") {
    return (
      <div className="space-y-3 p-3 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">DHCP Address Pool & DORA Handshake Controls</h3>
            <Badge variant="default" className="text-[10px]">RFC 2131 / 2132</Badge>
          </div>
          <div className="flex items-center gap-2">
            <NetworkServicesComparisonModal />
            <Link href="/protocols/dhcp">
              <Button size="sm" variant="default" className="text-xs">
                Open Dedicated DHCP Studio →
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ failureScenario: "pool_exhausted" }); regenerate(); }}
          >
            Scenario: Address Pool Exhaustion
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ failureScenario: "ip_conflict_decline" }); regenerate(); }}
          >
            Scenario: ARP IP Conflict → DECLINE
          </Button>
        </div>
      </div>
    );
  }

  if (protocolId === "dns") {
    return (
      <div className="space-y-3 p-3 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">DNS Hierarchy & Iterative Resolution Controls</h3>
            <Badge variant="default" className="text-[10px]">RFC 1034 / 1035</Badge>
          </div>
          <div className="flex items-center gap-2">
            <NetworkServicesComparisonModal />
            <Link href="/protocols/dns">
              <Button size="sm" variant="default" className="text-xs">
                Open Dedicated DNS Studio →
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ failureScenario: "cache_hit" }); regenerate(); }}
          >
            Scenario: Resolver Cache HIT
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ failureScenario: "cname_resolution" }); regenerate(); }}
          >
            Scenario: CNAME Alias Chain
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  min,
  max,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground mb-1 block">{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} min={min} max={max} />
    </div>
  );
}

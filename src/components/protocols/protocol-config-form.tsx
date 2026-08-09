"use client";

import Link from "next/link";
import { useSimulationStore } from "@/features/simulation/simulation-store";
import { getProtocol, getImplementedProtocols } from "@/features/protocols/registry";
import { Label, Input, Button, Switch, Badge } from "@/components/ui";
import { tcpConfigSchema, defaultTcpConfig } from "@/features/protocols/tcp/tcp.config";
import { udpConfigSchema, defaultUdpConfig } from "@/features/protocols/udp/udp.config";
import { ProtocolComparisonModal } from "./comparison/protocol-comparison-modal";

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
      className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
      aria-label="Select protocol"
    >
      {protocols.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
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
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">TCP Configuration</h3>
          <ProtocolComparisonModal />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Data packets" type="number" value={tcpConfig.packetCount}
            onChange={(v) => updateConfig({ packetCount: Number(v) })} min={1} max={10} />
          <Field label="Initial seq #" type="number" value={tcpConfig.initialSeqNum}
            onChange={(v) => updateConfig({ initialSeqNum: Number(v) })} />
          <Field label="Window size" type="number" value={tcpConfig.windowSize}
            onChange={(v) => updateConfig({ windowSize: Number(v) })} />
          <Field label="MSS" type="number" value={tcpConfig.mss}
            onChange={(v) => updateConfig({ mss: Number(v) })} />
          <Field label="Latency (ms)" type="number" value={tcpConfig.latencyMs}
            onChange={(v) => updateConfig({ latencyMs: Number(v) })} />
          <Field label="Timeout (ms)" type="number" value={tcpConfig.timeoutMs}
            onChange={(v) => updateConfig({ timeoutMs: Number(v) })} />
          <Field label="Drop packet index (-1=none)" type="number" value={tcpConfig.dropPacketIndex}
            onChange={(v) => updateConfig({ dropPacketIndex: Number(v) })} min={-1} />
          <Field label="Drop ACK index (-1=none)" type="number" value={tcpConfig.dropAckIndex}
            onChange={(v) => updateConfig({ dropAckIndex: Number(v) })} min={-1} />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={tcpConfig.includeClose}
            onCheckedChange={(v) => updateConfig({ includeClose: v })}
            aria-label="Include connection close"
          />
          <Label>Include FIN close sequence</Label>
        </div>
        <Button onClick={() => { tcpConfigSchema.parse({ ...defaultTcpConfig, ...config }); regenerate(); }} className="w-full">
          Apply & Regenerate
        </Button>
      </div>
    );
  }

  if (protocolId === "udp") {
    const udpConfig = { ...defaultUdpConfig, ...config };
    const dropStr = Array.isArray(udpConfig.dropIndices) ? udpConfig.dropIndices.join(",") : "";
    return (
      <div className="space-y-3 p-3 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">UDP Configuration</h3>
          <ProtocolComparisonModal />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Datagram count" type="number" value={udpConfig.datagramCount}
            onChange={(v) => updateConfig({ datagramCount: Number(v) })} min={1} max={15} />
          <Field label="Payload size" type="number" value={udpConfig.payloadSize}
            onChange={(v) => updateConfig({ payloadSize: Number(v) })} />
          <Field label="Latency (ms)" type="number" value={udpConfig.latencyMs}
            onChange={(v) => updateConfig({ latencyMs: Number(v) })} />
          <Field label="Send interval (ms)" type="number" value={udpConfig.sendIntervalMs}
            onChange={(v) => updateConfig({ sendIntervalMs: Number(v) })} />
        </div>
        <Field label="Drop indices (comma-separated)" type="text" value={dropStr}
          onChange={(v) => {
            const indices = v.split(",").map((s) => s.trim()).filter(Boolean).map(Number).filter((n) => !isNaN(n));
            updateConfig({ dropIndices: indices });
          }} />
        <div className="flex items-center gap-2">
          <Switch
            checked={udpConfig.outOfOrder}
            onCheckedChange={(v) => updateConfig({ outOfOrder: v })}
            aria-label="Out of order delivery"
          />
          <Label>Simulate out-of-order arrival</Label>
        </div>
        <Button onClick={() => { udpConfigSchema.parse({ ...defaultUdpConfig, ...config }); regenerate(); }} className="w-full">
          Apply & Regenerate
        </Button>
      </div>
    );
  }

  if (protocolId === "ospf") {
    return (
      <div className="space-y-3 p-3 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">OSPF Simulation & SPF Controls</h3>
            <Badge variant="default" className="text-[10px]">Area 0</Badge>
          </div>
          <div className="flex items-center gap-2">
            <ProtocolComparisonModal />
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
            <ProtocolComparisonModal />
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

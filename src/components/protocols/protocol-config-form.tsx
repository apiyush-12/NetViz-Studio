"use client";

import { useSimulationStore } from "@/features/simulation/simulation-store";
import { getProtocol, getImplementedProtocols } from "@/features/protocols/registry";
import { Label, Input, Button, Switch } from "@/components/ui";
import { tcpConfigSchema, defaultTcpConfig } from "@/features/protocols/tcp/tcp.config";
import { udpConfigSchema, defaultUdpConfig } from "@/features/protocols/udp/udp.config";

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
        <h3 className="text-sm font-semibold">TCP Configuration</h3>
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
        <h3 className="text-sm font-semibold">UDP Configuration</h3>
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

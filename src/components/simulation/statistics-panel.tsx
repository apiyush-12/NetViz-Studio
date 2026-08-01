"use client";

import { useSimulationStore } from "@/features/simulation/simulation-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

const TCP_STATES = [
  "CLOSED", "LISTEN", "SYN-SENT", "SYN-RECEIVED", "ESTABLISHED",
  "FIN-WAIT-1", "FIN-WAIT-2", "CLOSE-WAIT", "LAST-ACK", "TIME-WAIT",
] as const;

export function TcpStatePanel() {
  const protocolState = useSimulationStore((s) => s.protocolState);
  const protocolId = useSimulationStore((s) => s.protocolId);

  if (protocolId !== "tcp") return null;

  const senderState = (protocolState.senderState as string) ?? "CLOSED";
  const receiverState = (protocolState.receiverState as string) ?? "LISTEN";
  const cwnd = (protocolState.congestionWindow as number) ?? 1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">TCP State Machine</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Sender (Client)</p>
            <StateBadge state={senderState} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Receiver (Server)</p>
            <StateBadge state={receiverState} />
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Congestion Window (simplified)</p>
          <div className="flex items-end gap-0.5 h-8">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 rounded-sm ${i < cwnd ? "bg-primary" : "bg-border"}`}
                style={{ height: `${Math.min(100, (i + 1) * 10)}%` }}
                aria-hidden="true"
              />
            ))}
          </div>
          <p className="text-xs font-mono mt-1">cwnd = {cwnd}</p>
        </div>

        <div className="flex flex-wrap gap-1">
          {TCP_STATES.map((state) => (
            <span
              key={state}
              className={`text-[9px] px-1.5 py-0.5 rounded border ${
                state === senderState || state === receiverState
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border text-muted-foreground"
              }`}
            >
              {state}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StateBadge({ state }: { state: string }) {
  return (
    <span className="inline-block text-sm font-mono font-semibold text-primary bg-primary/10 border border-primary/30 rounded-md px-2 py-1">
      {state}
    </span>
  );
}

export function UdpComparisonPanel() {
  const protocolId = useSimulationStore((s) => s.protocolId);
  if (protocolId !== "udp") return null;

  const rows = [
    { feature: "Connection", tcp: "Connection-oriented (handshake)", udp: "Connectionless" },
    { feature: "Reliability", tcp: "Guaranteed delivery + retransmit", udp: "Best-effort, no retransmit" },
    { feature: "Acknowledgements", tcp: "Built-in cumulative ACKs", udp: "None (application-level only)" },
    { feature: "Header size", tcp: "20+ bytes", udp: "8 bytes" },
    { feature: "Ordering", tcp: "In-order delivery", udp: "May arrive out of order" },
    { feature: "Use cases", tcp: "Web, email, file transfer", udp: "DNS, streaming, gaming" },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">TCP vs UDP Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1.5 text-muted-foreground font-medium">Feature</th>
                <th className="text-left py-1.5 text-blue-400 font-medium">TCP</th>
                <th className="text-left py-1.5 text-amber-400 font-medium">UDP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.feature} className="border-b border-border/50">
                  <td className="py-1.5 text-muted-foreground">{row.feature}</td>
                  <td className="py-1.5">{row.tcp}</td>
                  <td className="py-1.5">{row.udp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatisticsPanel() {
  const events = useSimulationStore((s) => s.events);
  const currentStep = useSimulationStore((s) => s.currentStep);
  const packets = useSimulationStore((s) => s.packets);

  const visible = currentStep >= 0 ? events.slice(0, currentStep + 1) : [];
  const sent = visible.filter((e) => e.type === "packet-sent" || e.type === "handshake-step").length;
  const dropped = visible.filter((e) => e.type === "packet-dropped").length;
  const acks = visible.filter((e) => e.type === "acknowledgement-sent").length;
  const retrans = visible.filter((e) => e.type === "retransmission").length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Live Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-center">
          <Stat label="Packets" value={packets.length} />
          <Stat label="Sent events" value={sent} />
          <Stat label="ACKs" value={acks} />
          <Stat label="Dropped" value={dropped} />
          <Stat label="Retransmissions" value={retrans} />
          <Stat label="Events" value={`${visible.length}/${events.length}`} />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-secondary/50 p-2">
      <p className="text-lg font-semibold font-mono">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useSimulationStore } from "@/features/simulation/simulation-store";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";

export function PacketInspector() {
  const selectedPacketId = useSimulationStore((s) => s.selectedPacketId);
  const packets = useSimulationStore((s) => s.packets);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    ethernet: true,
    ipv4: true,
    tcp: true,
    udp: true,
  });

  const packet = packets.find((p) => p.id === selectedPacketId);

  if (!packet) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm">Packet Inspector</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a packet to inspect its layered headers. This is an educational representation, not a live capture.
          </p>
        </CardContent>
      </Card>
    );
  }

  const toggleLayer = (layer: string) => {
    setExpanded((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const headerLayers: { key: string; label: string; data?: Record<string, string | number> }[] = [
    { key: "application", label: "Application Layer", data: packet.headers.application },
    { key: "tcp", label: "Transport — TCP", data: packet.headers.tcp },
    { key: "udp", label: "Transport — UDP", data: packet.headers.udp },
    { key: "ipv4", label: "Network — IPv4", data: packet.headers.ipv4 },
    { key: "ethernet", label: "Data-Link — Ethernet", data: packet.headers.ethernet },
  ].filter((l) => l.data);

  return (
    <Card className="h-full overflow-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm">{packet.label}</CardTitle>
          <Badge variant="outline">{packet.protocol}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {packet.size} bytes · {packet.status}
        </p>
        <p className="text-[10px] text-amber-400/80">
          Educational header view — not a real packet capture
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {headerLayers.map((layer) => (
          <div key={layer.key} className="border border-border rounded-md overflow-hidden">
            <button
              onClick={() => toggleLayer(layer.key)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-expanded={expanded[layer.key]}
            >
              {expanded[layer.key] ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              {layer.label}
            </button>
            {expanded[layer.key] && layer.data && (
              <div className="px-3 pb-3 space-y-1">
                {Object.entries(layer.data).map(([field, value]) => (
                  <div key={field} className="flex justify-between text-xs font-mono">
                    <span className="text-muted-foreground capitalize">{field.replace(/([A-Z])/g, " $1")}</span>
                    <span className="text-foreground">{String(value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {packet.payload && (
          <div className="border border-border rounded-md p-3">
            <p className="text-xs font-semibold mb-1">Payload</p>
            <p className="text-xs font-mono text-muted-foreground">{packet.payload}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

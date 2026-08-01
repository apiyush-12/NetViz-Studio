"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Monitor, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSimulationStore } from "@/features/simulation/simulation-store";
import type { Packet } from "@/features/simulation/simulation-types";

const PACKET_COLORS: Record<string, string> = {
  syn: "packet-syn",
  ack: "packet-ack",
  data: "packet-data",
  fin: "packet-fin",
  udp: "packet-udp",
  drop: "packet-drop",
};

function getPacketClass(colorKey: string, status: Packet["status"]) {
  if (status === "dropped") return "packet-drop";
  return PACKET_COLORS[colorKey] ?? "packet-data";
}

export function SimulationCanvas() {
  const events = useSimulationStore((s) => s.events);
  const currentStep = useSimulationStore((s) => s.currentStep);
  const packets = useSimulationStore((s) => s.packets);
  const selectedPacketId = useSimulationStore((s) => s.selectedPacketId);
  const selectPacket = useSimulationStore((s) => s.selectPacket);
  const protocolId = useSimulationStore((s) => s.protocolId);
  const reducedMotion = useReducedMotion();

  const visibleEvents = currentStep >= 0 ? events.slice(0, currentStep + 1) : [];
  const activeEvent = currentStep >= 0 ? events[currentStep] : null;

  const inFlightPackets = visibleEvents
    .filter((e) => e.packetId && (e.type === "packet-sent" || e.type === "retransmission" || e.type === "handshake-step" || e.type === "acknowledgement-sent"))
    .map((e) => {
      const pkt = packets.find((p) => p.id === e.packetId);
      return pkt ? { event: e, packet: pkt } : null;
    })
    .filter(Boolean) as { event: typeof events[0]; packet: Packet }[];

  const latestPacket = activeEvent?.packetId
    ? packets.find((p) => p.id === activeEvent.packetId)
    : inFlightPackets[inFlightPackets.length - 1]?.packet;

  const isReverse = latestPacket?.direction === "reverse";
  const packetProgress = activeEvent ? 1 : 0;

  return (
    <div className="relative h-full min-h-[280px] grid-bg rounded-lg border border-border overflow-hidden" aria-label="Simulation canvas">
      <div className="absolute inset-0 flex items-center justify-between px-8 md:px-16 py-8">
        {/* Sender */}
        <div className="flex flex-col items-center gap-2 z-10">
          <div className={cn(
            "flex h-16 w-16 items-center justify-center rounded-xl border-2 bg-card",
            activeEvent?.sourceNodeId === "sender" ? "border-primary shadow-lg shadow-primary/20" : "border-border"
          )}>
            <Monitor className="h-8 w-8 text-primary" aria-hidden="true" />
          </div>
          <span className="text-sm font-medium">Sender</span>
          <span className="text-xs text-muted-foreground font-mono">192.168.1.10</span>
        </div>

        {/* Link */}
        <div className="flex-1 mx-4 relative h-1 bg-border rounded-full">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] text-muted-foreground bg-card px-2">
              {protocolId?.toUpperCase() ?? "—"} link
            </span>
          </div>

          {latestPacket && (
            <motion.div
              key={`${latestPacket.id}-${currentStep}`}
              className="absolute top-1/2 -translate-y-1/2 z-20"
              initial={{ left: isReverse ? "85%" : "15%", opacity: reducedMotion ? 1 : 0 }}
              animate={{
                left: packetProgress >= 1 ? (isReverse ? "15%" : "85%") : (isReverse ? "85%" : "15%"),
                opacity: 1,
              }}
              transition={{ duration: reducedMotion ? 0 : 0.6, ease: "easeInOut" }}
            >
              <button
                onClick={() => selectPacket(latestPacket.id)}
                className={cn(
                  "packet-capsule cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  getPacketClass(latestPacket.colorKey, latestPacket.status),
                  selectedPacketId === latestPacket.id && "ring-2 ring-primary"
                )}
                aria-label={`Packet ${latestPacket.label}`}
              >
                {latestPacket.label}
              </button>
            </motion.div>
          )}
        </div>

        {/* Receiver */}
        <div className="flex flex-col items-center gap-2 z-10">
          <div className={cn(
            "flex h-16 w-16 items-center justify-center rounded-xl border-2 bg-card",
            activeEvent?.destinationNodeId === "receiver" || activeEvent?.sourceNodeId === "receiver"
              ? "border-primary shadow-lg shadow-primary/20"
              : "border-border"
          )}>
            <Server className="h-8 w-8 text-emerald-400" aria-hidden="true" />
          </div>
          <span className="text-sm font-medium">Receiver</span>
          <span className="text-xs text-muted-foreground font-mono">192.168.1.20</span>
        </div>
      </div>

      {/* Packet tracker */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
        {packets.slice(0, 12).map((pkt) => {
          const delivered = visibleEvents.some(
            (e) => e.packetId === pkt.id && (e.type === "packet-arrived" || e.type === "acknowledgement-sent")
          );
          const dropped = visibleEvents.some(
            (e) => e.packetId === pkt.id && e.type === "packet-dropped"
          );
          return (
            <button
              key={pkt.id}
              onClick={() => selectPacket(pkt.id)}
              className={cn(
                "packet-capsule text-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                dropped ? "packet-drop" : delivered ? getPacketClass(pkt.colorKey, "delivered") : "opacity-40 border-border text-muted-foreground",
                selectedPacketId === pkt.id && "ring-2 ring-primary"
              )}
              aria-label={`${pkt.label} ${dropped ? "dropped" : delivered ? "delivered" : "pending"}`}
            >
              {pkt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

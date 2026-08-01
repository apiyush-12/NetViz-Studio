"use client";

import React, { useState, useEffect, useRef } from "react";
import { Monitor, Server, Play, Pause, RotateCcw, AlertCircle, ArrowRight, Activity } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function HeroNetworkDemo() {
  const [protocol, setProtocol] = useState<"tcp" | "udp">("tcp");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [step, setStep] = useState<number>(0);
  const [dropPacket, setDropPacket] = useState<boolean>(false);
  const reducedMotion = useReducedMotion();
  const demoRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState<boolean>(true);

  // Viewport Observer: Pause animation when outside viewport
  useEffect(() => {
    if (!demoRef.current || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(demoRef.current);
    return () => observer.disconnect();
  }, []);

  // Animation Step Cycle
  useEffect(() => {
    if (!isPlaying || !inView || reducedMotion) return;

    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 6);
    }, 1800);

    return () => clearInterval(interval);
  }, [isPlaying, inView, reducedMotion, protocol]);

  // Step explanation state descriptions
  const getTcpStatusText = (currentStep: number) => {
    switch (currentStep) {
      case 0:
        return "1. Sender initiates TCP Connection: Transmitting [SYN] segment (Seq=100)";
      case 1:
        return "2. Receiver responds: Transmitting [SYN-ACK] segment (Seq=300, Ack=101)";
      case 2:
        return "3. Connection Established: Sender transmits [ACK] segment (Ack=301)";
      case 3:
        return "4. Data Transmission: Transmitting TCP Segment #1 (Payload=1024 bytes)";
      case 4:
        return "5. Receiver acknowledges data: Transmitting [ACK #1] segment";
      case 5:
        return "6. Data Transmission: Transmitting TCP Segment #2 (Payload=1024 bytes)";
      default:
        return "TCP Connection Active";
    }
  };

  const getUdpStatusText = (currentStep: number) => {
    if (dropPacket && (currentStep === 2 || currentStep === 3)) {
      return "⚠️ Packet Dropped: UDP Datagram #2 dropped at link buffer (No native retransmission)";
    }
    switch (currentStep % 4) {
      case 0:
        return "1. Sender transmits UDP Datagram #1 (No handshake required)";
      case 1:
        return "2. Receiver processes UDP Datagram #1 (No ACK returned)";
      case 2:
        return "3. Sender transmits UDP Datagram #2 (Connectionless stream)";
      case 3:
        return "4. Sender transmits UDP Datagram #3 (Fixed 8-byte header overhead)";
      default:
        return "UDP Stream Active";
    }
  };

  return (
    <div ref={demoRef} className="w-full rounded-2xl border border-border bg-card/90 shadow-2xl p-5 md:p-6 space-y-5 relative overflow-hidden backdrop-blur">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
            Live Protocol Preview — {protocol.toUpperCase()}
          </h3>
        </div>

        {/* Controls & Protocol Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-secondary p-0.5 rounded-lg border border-border">
            <button
              onClick={() => {
                setProtocol("tcp");
                setStep(0);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                protocol === "tcp" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              TCP Mode
            </button>
            <button
              onClick={() => {
                setProtocol("udp");
                setStep(0);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                protocol === "udp" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              UDP Mode
            </button>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Pause simulation preview" : "Play simulation preview"}
            className="p-1.5 rounded-lg border border-border bg-secondary hover:bg-accent text-foreground transition-colors"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>

          <button
            onClick={() => setStep(0)}
            aria-label="Restart simulation"
            className="p-1.5 rounded-lg border border-border bg-secondary hover:bg-accent text-foreground transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Network Nodes Canvas Simulation Area */}
      <div className="relative h-44 sm:h-48 w-full bg-secondary/30 rounded-xl border border-border/80 flex items-center justify-between px-6 sm:px-12 grid-bg">
        {/* Node 1: Sender Host */}
        <div className="flex flex-col items-center space-y-2 z-10">
          <div className="h-14 w-14 rounded-2xl bg-card border-2 border-primary/60 flex items-center justify-center text-primary shadow-lg group">
            <Monitor className="h-7 w-7 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-foreground">Sender PC-1</p>
            <p className="text-[10px] font-mono text-muted-foreground">192.168.1.10</p>
          </div>
        </div>

        {/* Link Path line */}
        <div className="flex-1 relative mx-4 h-1 bg-border rounded-full flex items-center justify-center">
          {/* Active Flow Animation Line */}
          <div
            className={`absolute h-full rounded-full transition-all duration-500 ${
              protocol === "tcp" ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" : "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]"
            }`}
            style={{
              left: step % 2 === 0 ? "10%" : "50%",
              width: "40%",
            }}
          />

          {/* Animated Packet Capsule */}
          <div
            className={`absolute -top-3.5 transition-all duration-700 ${
              step % 2 === 0 ? "left-[20%] sm:left-[30%]" : "left-[60%] sm:left-[70%]"
            }`}
          >
            {protocol === "tcp" ? (
              <span className="packet-capsule packet-syn animate-bounce">
                <Activity className="h-3 w-3" />
                {step === 0 ? "SYN" : step === 1 ? "SYN-ACK" : step === 2 ? "ACK" : `SEG #${Math.floor(step / 2)}`}
              </span>
            ) : (
              <span
                className={`packet-capsule ${
                  dropPacket && (step === 2 || step === 3) ? "packet-drop" : "packet-udp"
                } animate-bounce`}
              >
                {dropPacket && (step === 2 || step === 3) ? "DROP" : `UDP #${step + 1}`}
              </span>
            )}
          </div>
        </div>

        {/* Node 2: Receiver Server */}
        <div className="flex flex-col items-center space-y-2 z-10">
          <div className="h-14 w-14 rounded-2xl bg-card border-2 border-emerald-500/60 flex items-center justify-center text-emerald-400 shadow-lg group">
            <Server className="h-7 w-7 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-foreground">Web Server</p>
            <p className="text-[10px] font-mono text-muted-foreground">192.168.2.100</p>
          </div>
        </div>
      </div>

      {/* Drop Packet Toggle for UDP Mode */}
      {protocol === "udp" && (
        <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl text-xs">
          <div className="flex items-center gap-2 text-amber-500 dark:text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Simulate UDP Link Congestion & Packet Loss</span>
          </div>
          <button
            onClick={() => setDropPacket(!dropPacket)}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors ${
              dropPacket
                ? "bg-amber-500 text-black border-amber-500"
                : "bg-card border-border text-foreground hover:bg-secondary"
            }`}
          >
            {dropPacket ? "Simulating Drop" : "Simulate Loss"}
          </button>
        </div>
      )}

      {/* Live Event Explanation Box */}
      <div className="p-3 rounded-xl border border-border bg-secondary/40 space-y-1">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-mono">
          Current Event Trace
        </p>
        <p className="text-xs font-mono font-medium text-foreground flex items-center gap-1.5">
          <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
          {protocol === "tcp" ? getTcpStatusText(step) : getUdpStatusText(step)}
        </p>
      </div>

      {/* Bottom Caption */}
      <p className="text-center text-[11px] text-muted-foreground italic">
        Preview simulation — open the full visualizer to inspect packets and events.
      </p>
    </div>
  );
}

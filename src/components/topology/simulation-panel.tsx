"use client";

import React, { useEffect } from "react";
import { useTopologyStore } from "@/features/topology/topology-store";
import { Button, Slider } from "@/components/ui";
import { EventConsole } from "./event-console";
import { PacketInspector } from "./packet-inspector";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Gauge,
  X,
  Send,
} from "lucide-react";

export function SimulationPanel() {
  const {
    mode,
    simulationEvents,
    activePackets,
    currentStepIndex,
    isPlaying,
    simulationSpeed,
    setStepIndex,
    nextStep,
    prevStep,
    togglePlayPause,
    setSpeed,
    clearSimulation,
    setTrafficSenderOpen,
  } = useTopologyStore();

  useEffect(() => {
    if (!isPlaying || simulationEvents.length === 0) return;

    const intervalMs = Math.max(200, 1000 / simulationSpeed);
    const timer = setInterval(() => {
      if (currentStepIndex < simulationEvents.length - 1) {
        nextStep();
      } else {
        togglePlayPause();
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, currentStepIndex, simulationEvents.length, simulationSpeed, nextStep, togglePlayPause]);

  if (mode !== "simulation") return null;

  const currentPacket = activePackets[0] || null;

  return (
    <div className="h-64 border-t border-border bg-card flex flex-col z-20 shadow-2xl shrink-0 select-none">
      <div className="flex items-center justify-between border-b border-border bg-accent/30 px-4 py-2">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={prevStep} disabled={currentStepIndex === 0}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="default"
            className="h-8 w-8 bg-purple-600 hover:bg-purple-500 text-white"
            onClick={togglePlayPause}
            disabled={simulationEvents.length === 0}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={nextStep} disabled={currentStepIndex >= simulationEvents.length - 1}>
            <SkipForward className="h-4 w-4" />
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          <div className="flex items-center gap-2 w-64">
            <span className="text-[10px] font-mono text-muted-foreground w-12 text-right">
              {currentStepIndex + 1}/{Math.max(1, simulationEvents.length)}
            </span>
            <Slider
              value={[currentStepIndex]}
              min={0}
              max={Math.max(0, simulationEvents.length - 1)}
              step={1}
              onValueChange={(val) => setStepIndex(val[0])}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-accent/60 px-2 py-0.5 rounded border border-border text-xs">
            <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
            {[0.5, 1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeed(spd)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  simulationSpeed === spd ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <Button size="sm" variant="default" className="h-8 text-xs gap-1 bg-emerald-600 hover:bg-emerald-500" onClick={() => setTrafficSenderOpen(true)}>
            <Send className="h-3.5 w-3.5" />
            Send Traffic
          </Button>

          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={clearSimulation} title="Clear Simulation">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 p-2 overflow-hidden">
        <div className="md:col-span-2 overflow-hidden h-full">
          <EventConsole events={simulationEvents} currentStepIndex={currentStepIndex} onSelectStep={setStepIndex} />
        </div>
        <div className="hidden md:block overflow-hidden h-full">
          <PacketInspector packet={currentPacket} />
        </div>
      </div>
    </div>
  );
}

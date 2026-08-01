"use client";

import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
} from "lucide-react";
import { Button, Slider, Badge } from "@/components/ui";
import { useSimulationStore } from "@/features/simulation/simulation-store";
import { SIMULATION_SPEEDS, type SimulationSpeed } from "@/lib/constants";

export function SimulationControls() {
  const playbackState = useSimulationStore((s) => s.playbackState);
  const speed = useSimulationStore((s) => s.speed);
  const currentStep = useSimulationStore((s) => s.currentStep);
  const events = useSimulationStore((s) => s.events);
  const play = useSimulationStore((s) => s.play);
  const pause = useSimulationStore((s) => s.pause);
  const restart = useSimulationStore((s) => s.restart);
  const stepForward = useSimulationStore((s) => s.stepForward);
  const stepBackward = useSimulationStore((s) => s.stepBackward);
  const scrubTo = useSimulationStore((s) => s.scrubTo);
  const setSpeed = useSimulationStore((s) => s.setSpeed);

  const isRunning = playbackState === "running";
  const maxStep = Math.max(0, events.length - 1);

  return (
    <div className="flex flex-col gap-3 p-3 border border-border rounded-lg bg-card">
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="icon"
          variant="outline"
          onClick={stepBackward}
          disabled={currentStep <= -1}
          aria-label="Previous step"
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        {isRunning ? (
          <Button size="icon" onClick={pause} aria-label="Pause simulation">
            <Pause className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="icon" onClick={play} aria-label="Play simulation">
            <Play className="h-4 w-4" />
          </Button>
        )}

        <Button
          size="icon"
          variant="outline"
          onClick={stepForward}
          disabled={currentStep >= maxStep}
          aria-label="Next step"
        >
          <SkipForward className="h-4 w-4" />
        </Button>

        <Button size="icon" variant="ghost" onClick={restart} aria-label="Restart simulation">
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Badge variant="secondary" className="ml-auto">
          Step {currentStep + 1} / {events.length}
        </Badge>

        <Badge
          variant={
            playbackState === "running"
              ? "success"
              : playbackState === "completed"
                ? "default"
                : "outline"
          }
        >
          {playbackState}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground shrink-0">Timeline</span>
        <Slider
          value={[Math.max(0, currentStep)]}
          onValueChange={([v]) => scrubTo(v)}
          min={0}
          max={maxStep}
          step={1}
          aria-label="Simulation timeline scrubber"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Speed:</span>
        {SIMULATION_SPEEDS.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={speed === s ? "default" : "outline"}
            onClick={() => setSpeed(s as SimulationSpeed)}
            aria-label={`Speed ${s}x`}
            aria-pressed={speed === s}
          >
            {s}x
          </Button>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground">
        Shortcuts: Space (play/pause) · ←/→ (step) · R (restart) · Esc (close inspector)
      </p>
    </div>
  );
}

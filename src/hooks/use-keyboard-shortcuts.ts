"use client";

import { useEffect } from "react";
import { useSimulationStore } from "@/features/simulation/simulation-store";

export function useKeyboardShortcuts() {
  const play = useSimulationStore((s) => s.play);
  const pause = useSimulationStore((s) => s.pause);
  const restart = useSimulationStore((s) => s.restart);
  const stepForward = useSimulationStore((s) => s.stepForward);
  const stepBackward = useSimulationStore((s) => s.stepBackward);
  const playbackState = useSimulationStore((s) => s.playbackState);
  const selectEvent = useSimulationStore((s) => s.selectEvent);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          if (playbackState === "running") pause();
          else play();
          break;
        case "ArrowRight":
          e.preventDefault();
          stepForward();
          break;
        case "ArrowLeft":
          e.preventDefault();
          stepBackward();
          break;
        case "r":
        case "R":
          restart();
          break;
        case "Escape":
          selectEvent(null);
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [play, pause, restart, stepForward, stepBackward, playbackState, selectEvent]);
}

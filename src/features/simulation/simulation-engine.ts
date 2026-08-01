import type { SimulationEvent, SimulationState, Packet } from "./simulation-types";

export interface EngineCallbacks {
  onStepChange: (step: number, event: SimulationEvent | null) => void;
  onStateChange: (state: SimulationState) => void;
  onComplete: () => void;
}

export class SimulationEngine {
  private events: SimulationEvent[] = [];
  private packets: Packet[] = [];
  private currentStep = -1;
  private playbackState: SimulationState = "idle";
  private speed = 1;
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private callbacks: EngineCallbacks;

  constructor(callbacks: EngineCallbacks) {
    this.callbacks = callbacks;
  }

  load(events: SimulationEvent[], packets: Packet[]) {
    this.stopTimer();
    this.events = events;
    this.packets = packets;
    this.currentStep = -1;
    this.playbackState = "idle";
    this.callbacks.onStateChange("idle");
    this.callbacks.onStepChange(-1, null);
  }

  getEvents(): SimulationEvent[] {
    return this.events;
  }

  getPackets(): Packet[] {
    return this.packets;
  }

  getCurrentStep(): number {
    return this.currentStep;
  }

  getPlaybackState(): SimulationState {
    return this.playbackState;
  }

  getSpeed(): number {
    return this.speed;
  }

  getVisibleEvents(): SimulationEvent[] {
    if (this.currentStep < 0) return [];
    return this.events.slice(0, this.currentStep + 1);
  }

  getActiveEvent(): SimulationEvent | null {
    if (this.currentStep < 0 || this.currentStep >= this.events.length) return null;
    return this.events[this.currentStep] ?? null;
  }

  getVisiblePackets(): Packet[] {
    const visibleEvents = this.getVisibleEvents();
    const packetIds = new Set(
      visibleEvents.filter((e) => e.packetId).map((e) => e.packetId!)
    );
    return this.packets.filter((p) => packetIds.has(p.id));
  }

  setSpeed(speed: number) {
    this.speed = speed;
    if (this.playbackState === "running") {
      this.stopTimer();
      this.scheduleNext();
    }
  }

  play() {
    if (this.events.length === 0) return;
    if (this.playbackState === "completed") {
      this.restart();
    }
    if (this.currentStep >= this.events.length - 1) {
      this.currentStep = -1;
    }
    this.playbackState = "running";
    this.callbacks.onStateChange("running");
    this.scheduleNext();
  }

  pause() {
    this.stopTimer();
    if (this.playbackState === "running") {
      this.playbackState = "paused";
      this.callbacks.onStateChange("paused");
    }
  }

  resume() {
    if (this.playbackState === "paused") {
      this.playbackState = "running";
      this.callbacks.onStateChange("running");
      this.scheduleNext();
    }
  }

  restart() {
    this.stopTimer();
    this.currentStep = -1;
    this.playbackState = "idle";
    this.callbacks.onStateChange("idle");
    this.callbacks.onStepChange(-1, null);
  }

  stepForward() {
    this.stopTimer();
    if (this.currentStep < this.events.length - 1) {
      this.currentStep++;
      const event = this.events[this.currentStep];
      this.callbacks.onStepChange(this.currentStep, event);
      if (this.currentStep >= this.events.length - 1) {
        this.playbackState = "completed";
        this.callbacks.onStateChange("completed");
        this.callbacks.onComplete();
      } else if (this.playbackState === "running") {
        this.playbackState = "paused";
        this.callbacks.onStateChange("paused");
      }
    }
  }

  stepBackward() {
    this.stopTimer();
    if (this.currentStep > 0) {
      this.currentStep--;
      const event = this.events[this.currentStep];
      this.callbacks.onStepChange(this.currentStep, event);
      if (this.playbackState === "running") {
        this.playbackState = "paused";
        this.callbacks.onStateChange("paused");
      }
    } else if (this.currentStep === 0) {
      this.currentStep = -1;
      this.callbacks.onStepChange(-1, null);
    }
  }

  scrubTo(step: number) {
    this.stopTimer();
    const clamped = Math.max(-1, Math.min(step, this.events.length - 1));
    this.currentStep = clamped;
    const event = clamped >= 0 ? this.events[clamped] : null;
    this.callbacks.onStepChange(clamped, event);
    if (clamped >= this.events.length - 1) {
      this.playbackState = "completed";
      this.callbacks.onStateChange("completed");
    } else {
      this.playbackState = "paused";
      this.callbacks.onStateChange("paused");
    }
  }

  destroy() {
    this.stopTimer();
  }

  private scheduleNext() {
    if (this.currentStep >= this.events.length - 1) {
      this.playbackState = "completed";
      this.callbacks.onStateChange("completed");
      this.callbacks.onComplete();
      return;
    }

    const nextIndex = this.currentStep + 1;
    const nextEvent = this.events[nextIndex];
    const prevEvent =
      this.currentStep >= 0 ? this.events[this.currentStep] : null;
    const delay = prevEvent
      ? Math.max(100, (nextEvent.timestamp - prevEvent.timestamp) / this.speed)
      : 300 / this.speed;

    this.timerId = setTimeout(() => {
      this.currentStep = nextIndex;
      this.callbacks.onStepChange(this.currentStep, nextEvent);
      if (this.playbackState === "running") {
        this.scheduleNext();
      }
    }, delay);
  }

  private stopTimer() {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}

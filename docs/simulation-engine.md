# Simulation Engine

## Purpose

The simulation engine manages playback of pre-generated event sequences. It does not contain protocol-specific logic.

## States

- `idle` — Loaded but not started
- `running` — Auto-advancing through events
- `paused` — Stopped mid-sequence
- `completed` — All events played
- `failed` — Error state (reserved)

## API

```typescript
engine.load(events, packets)
engine.play()
engine.pause()
engine.resume()
engine.restart()
engine.stepForward()
engine.stepBackward()
engine.scrubTo(step)
engine.setSpeed(multiplier)
```

## Event Scheduling

Delay between steps is derived from event timestamps divided by speed multiplier. Minimum delay is 100ms at 1x speed.

## Zustand Integration

`useSimulationStore` wraps the engine and exposes:
- Protocol loading via `loadProtocol(id)`
- Selected event/packet for inspector
- Protocol state extracted from event payloads

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Play/Pause |
| → | Next step |
| ← | Previous step |
| R | Restart |
| Esc | Close inspector |

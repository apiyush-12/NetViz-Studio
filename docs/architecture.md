# Architecture

## Overview

NetViz Studio uses a layered architecture separating UI, state, simulation playback, protocol logic, and pure calculations.

## Layers

1. **UI Layer** — Next.js App Router pages and React components
2. **State Layer** — Zustand stores for simulation and preferences
3. **Simulation Engine** — Generic event playback (no protocol-specific UI)
4. **Protocol Plugins** — Each protocol generates events and packets
5. **Calculation Layer** — Pure functions for CIDR, addressing, routing (future)

## Data Flow

```
User selects protocol
  → ProtocolModule.generateSimulation()
  → SimulationEvent[] + Packet[]
  → SimulationEngine.load()
  → User presses Play
  → Engine advances steps on timer
  → Zustand store updates
  → UI renders canvas, timeline, inspector
```

## Key Design Decisions

- **Plugin architecture**: Adding a protocol requires one module + registry entry
- **Deterministic simulations**: Optional seed for reproducible packet loss
- **BigInt for IPv4**: No floating-point in address calculations
- **localStorage**: Preferences and presets (backend-ready types)
- **No protocol logic in JSX**: Simulators are pure TypeScript functions

## File Organization

| Path | Purpose |
|------|---------|
| `src/features/simulation/` | Engine, store, types |
| `src/features/protocols/` | Protocol modules and registry |
| `src/features/cidr/` | IPv4 parser, calculator, classifier |
| `src/components/simulation/` | Canvas, controls, timeline, inspector |
| `src/components/cidr/` | CIDR UI components |

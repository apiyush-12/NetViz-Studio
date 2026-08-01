# Protocol Module Guide

## Creating a New Protocol

### 1. Create module folder

```
src/features/protocols/myprotocol/
  myprotocol.module.ts
  myprotocol.simulator.ts
  myprotocol.config.ts
  myprotocol.explanations.ts  (optional)
```

### 2. Define configuration schema

```typescript
import { z } from "zod";

export const myConfigSchema = z.object({
  latencyMs: z.number().default(100),
});
```

### 3. Implement simulator

```typescript
export function generateMySimulation(
  topology: TopologyDefinition,
  config: Record<string, unknown>,
  seed?: string
): SimulationResult {
  // Return { events, packets, initialState? }
}
```

### 4. Export ProtocolModule

```typescript
export const myModule: ProtocolModule = {
  id: "myprotocol",
  name: "My Protocol",
  status: "implemented",
  // ... other fields
  generateSimulation: generateMySimulation,
};
```

### 5. Register in registry.ts

```typescript
import { myModule } from "./myprotocol/myprotocol.module";

const implementedModules = [tcpModule, udpModule, myModule];
```

## Event Types

Use standard event types from `simulation-types.ts`. Add protocol-specific data in `payload` and `metadata`.

## Explanation Content

Provide `explanationSections` with beginner and advanced content for each event type.

## Testing

Add unit tests in `src/tests/unit/myprotocol.simulator.test.ts`.

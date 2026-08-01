import seedrandom from "seedrandom";
import { generateId } from "@/lib/utils";

export function createSeededRandom(seed?: string): () => number {
  if (!seed) {
    return Math.random;
  }
  const rng = seedrandom(seed);
  return () => rng();
}

export function createEventBase(
  sequenceNumber: number,
  timestamp: number,
  protocol: string
) {
  return {
    id: generateId("evt"),
    sequenceNumber,
    timestamp,
    protocol,
    status: "completed" as const,
    severity: "info" as const,
  };
}

export const DEFAULT_TWO_HOST_TOPOLOGY = {
  nodes: [
    {
      id: "sender",
      type: "host" as const,
      label: "Sender",
      position: { x: 100, y: 200 },
      config: { ip: "192.168.1.10" },
    },
    {
      id: "receiver",
      type: "host" as const,
      label: "Receiver",
      position: { x: 600, y: 200 },
      config: { ip: "192.168.1.20" },
    },
  ],
  edges: [
    {
      id: "link-1",
      source: "sender",
      target: "receiver",
      latency: 50,
      bandwidth: 1000,
      enabled: true,
    },
  ],
};

export const APP_NAME = "NetViz Studio";
export const APP_DESCRIPTION =
  "Interactive Network Protocol Visualization Platform";

export const SIMULATION_SPEEDS = [0.25, 0.5, 1, 2, 4] as const;
export type SimulationSpeed = (typeof SIMULATION_SPEEDS)[number];

export const PROTOCOL_CATEGORIES = [
  { id: "application", label: "Application Layer" },
  { id: "transport", label: "Transport Layer" },
  { id: "network", label: "Internet/Network Layer" },
  { id: "data-link", label: "Data-Link Layer" },
  { id: "routing", label: "Routing Protocols" },
  { id: "addressing", label: "Addressing & Subnetting" },
  { id: "services", label: "Network Services" },
  { id: "security", label: "Security Protocols" },
] as const;

export const STORAGE_KEYS = {
  preferences: "netviz-preferences",
  recentSimulations: "netviz-recent-simulations",
  topology: "netviz-topology",
} as const;

export const DEFAULT_PREFERENCES = {
  theme: "dark" as const,
  defaultSpeed: 1 as SimulationSpeed,
  reducedMotion: false,
  explanationMode: "beginner" as "beginner" | "advanced",
  showGrid: true,
};

import type { z } from "zod";
import type {
  SimulationResult,
  TopologyDefinition,
  ExplanationContent,
} from "@/features/simulation/simulation-types";

export type ProtocolCategory =
  | "application"
  | "transport"
  | "network"
  | "data-link"
  | "routing"
  | "addressing"
  | "services"
  | "security";

export type ImplementationStatus = "implemented" | "basic" | "planned";

export interface PacketFieldDefinition {
  layer: string;
  name: string;
  description: string;
}

export interface ExplanationSection {
  eventType: string;
  beginner: ExplanationContent;
  advanced: ExplanationContent;
}

export interface ProtocolModule {
  id: string;
  name: string;
  category: ProtocolCategory;
  layer: string;
  summary: string;
  status: ImplementationStatus;
  learningObjectives: string[];
  defaultTopology: TopologyDefinition;
  configurationSchema: z.ZodSchema;
  defaultConfiguration: Record<string, unknown>;
  generateSimulation: (
    topology: TopologyDefinition,
    config: Record<string, unknown>,
    seed?: string
  ) => SimulationResult;
  packetFields: PacketFieldDefinition[];
  explanationSections: ExplanationSection[];
  simplificationNotes: string[];
}

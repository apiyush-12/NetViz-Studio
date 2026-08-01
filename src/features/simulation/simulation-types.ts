export type SimulationState =
  | "idle"
  | "running"
  | "paused"
  | "completed"
  | "failed";

export type SimulationEventType =
  | "packet-created"
  | "packet-sent"
  | "packet-arrived"
  | "packet-dropped"
  | "acknowledgement-sent"
  | "timeout"
  | "retransmission"
  | "route-calculated"
  | "route-updated"
  | "neighbor-discovered"
  | "handshake-step"
  | "state-change"
  | "link-failed"
  | "link-restored"
  | "configuration-changed"
  | "simulation-completed";

export type EventStatus = "pending" | "active" | "completed" | "failed";
export type EventSeverity = "info" | "warning" | "error" | "success";

export interface SimulationEvent {
  id: string;
  timestamp: number;
  sequenceNumber: number;
  type: SimulationEventType;
  sourceNodeId: string;
  destinationNodeId: string;
  protocol: string;
  title: string;
  description: string;
  packetId?: string;
  payload?: Record<string, unknown>;
  status: EventStatus;
  severity: EventSeverity;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export type PacketStatus =
  | "pending"
  | "in-flight"
  | "delivered"
  | "dropped"
  | "retransmitted";

export interface PacketHeaders {
  ethernet?: Record<string, string | number>;
  ipv4?: Record<string, string | number>;
  tcp?: Record<string, string | number>;
  udp?: Record<string, string | number>;
  application?: Record<string, string | number>;
}

export interface Packet {
  id: string;
  protocol: string;
  label: string;
  source: string;
  destination: string;
  headers: PacketHeaders;
  payload?: string;
  size: number;
  ttl?: number;
  status: PacketStatus;
  colorKey: string;
  createdAt: number;
  direction?: "forward" | "reverse";
}

export interface TopologyNode {
  id: string;
  type: "host" | "router" | "switch" | "server";
  label: string;
  position: { x: number; y: number };
  config?: Record<string, unknown>;
}

export interface TopologyEdge {
  id: string;
  source: string;
  target: string;
  latency?: number;
  bandwidth?: number;
  cost?: number;
  enabled?: boolean;
}

export interface TopologyDefinition {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}

export interface SimulationResult {
  events: SimulationEvent[];
  packets: Packet[];
  initialState?: Record<string, unknown>;
}

export interface ExplanationContent {
  whatHappened: string;
  whyItHappened: string;
  protocolRule: string;
  fieldsChanged: string[];
  whatHappensNext: string;
  misconception?: string;
  realWorldUse?: string;
}

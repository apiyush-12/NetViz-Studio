import { NetworkTopology } from "@/features/topology/topology-types";

export type LabTopic =
  | "fundamentals"
  | "osi-tcpip"
  | "ipv4"
  | "cidr"
  | "ethernet"
  | "arp"
  | "icmp"
  | "tcp"
  | "udp"
  | "dhcp"
  | "dns"
  | "http"
  | "static-routing"
  | "rip"
  | "ospf"
  | "bgp"
  | "vlan"
  | "stp"
  | "nat"
  | "firewall"
  | "troubleshooting"
  | "design"
  | "ipv6";

export type LabDifficulty = "beginner" | "intermediate" | "advanced";

export type LabType =
  | "guided"
  | "challenge"
  | "troubleshooting"
  | "prediction"
  | "configuration"
  | "observation"
  | "assessment"
  | "sandbox";

export type LabTaskType =
  | "read-instruction"
  | "select-device"
  | "configure-property"
  | "configure-interface"
  | "configure-ip"
  | "configure-route"
  | "configure-protocol"
  | "send-ping"
  | "send-tcp"
  | "run-dns"
  | "run-http"
  | "predict-outcome"
  | "answer-mcq"
  | "answer-numeric"
  | "answer-text"
  | "fix-configuration"
  | "run-command"
  | "inspect-table";

export type TaskStatus = "locked" | "available" | "active" | "completed" | "incorrect" | "skipped";

export interface LabHint {
  id: string;
  level: number;
  content: string;
}

export interface LabValidatorDefinition {
  type: string;
  [key: string]: unknown;
}

export interface LabTask {
  id: string;
  order: number;
  title: string;
  instruction: string;
  description?: string;
  type: LabTaskType;
  required: boolean;
  points: number;
  dependencies?: string[];
  validator: LabValidatorDefinition;
  hints?: LabHint[];
  successMessage: string;
  failureMessage: string;
  explanation?: string;
  mcqOptions?: string[];
  correctAnswer?: string | number;
}

export interface LabCompletionCriteria {
  minScore: number;
  requiredTaskIds: string[];
}

export interface LabExplanationSection {
  title: string;
  content: string;
}

export interface LabFault {
  id: string;
  type: string;
  targetNodeId?: string;
  targetInterfaceId?: string;
  targetLinkId?: string;
  hidden: boolean;
  description: string;
}

export interface NetworkLab {
  id: string;
  slug: string;
  title: string;
  description: string;
  topic: LabTopic;
  difficulty: LabDifficulty;
  type: LabType;
  estimatedMinutes: number;
  prerequisites: string[];
  learningObjectives: string[];
  skills: string[];
  protocols: string[];
  initialTopology: NetworkTopology;
  faults?: LabFault[];
  tasks: LabTask[];
  completionCriteria: LabCompletionCriteria;
  hints: LabHint[];
  explanationSections: LabExplanationSection[];
  relatedLabIds: string[];
  version: number;
  published: boolean;
}

export interface LabProgress {
  labId: string;
  status: "not-started" | "in-progress" | "completed";
  activeTaskId?: string;
  completedTaskIds: string[];
  skippedTaskIds: string[];
  attempts: Record<string, number>;
  hintsUsed: Record<string, number>;
  score: number;
  startedAt?: string;
  completedAt?: string;
  lastOpenedAt?: string;
  elapsedSeconds: number;
  topologySnapshot?: NetworkTopology;
  seed?: number;
}

export interface LabValidationResult {
  passed: boolean;
  scoreAwarded: number;
  message: string;
  details?: string[];
  affectedNodeIds?: string[];
  affectedLinkIds?: string[];
  suggestedNextAction?: string;
}

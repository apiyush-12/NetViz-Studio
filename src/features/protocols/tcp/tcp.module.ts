import type { ProtocolModule } from "@/features/protocols/shared/protocol-types";
import { DEFAULT_TWO_HOST_TOPOLOGY } from "@/features/protocols/shared/protocol-utils";
import { tcpConfigSchema, defaultTcpConfig } from "./tcp.config";
import { generateTcpSimulation } from "./tcp.simulator";
import { tcpExplanations } from "./tcp.explanations";

export const tcpModule: ProtocolModule = {
  id: "tcp",
  name: "TCP",
  category: "transport",
  layer: "Transport (Layer 4)",
  summary:
    "Transmission Control Protocol — reliable, connection-oriented transport with handshakes, acknowledgements, flow control, and retransmission.",
  status: "implemented",
  learningObjectives: [
    "Understand the three-way handshake",
    "Observe sequence and acknowledgement numbers",
    "See how packet loss triggers retransmission",
    "Learn TCP connection states",
    "Compare flow control with sliding window",
  ],
  defaultTopology: DEFAULT_TWO_HOST_TOPOLOGY,
  configurationSchema: tcpConfigSchema,
  defaultConfiguration: defaultTcpConfig,
  generateSimulation: generateTcpSimulation,
  packetFields: [
    { layer: "Transport", name: "Source Port", description: "Sending application port" },
    { layer: "Transport", name: "Destination Port", description: "Receiving application port" },
    { layer: "Transport", name: "Sequence Number", description: "Byte offset in the stream" },
    { layer: "Transport", name: "Acknowledgement Number", description: "Next expected byte" },
    { layer: "Transport", name: "Flags", description: "SYN, ACK, FIN, RST, PSH, URG" },
    { layer: "Transport", name: "Window Size", description: "Receive window for flow control" },
  ],
  explanationSections: tcpExplanations,
  simplificationNotes: [
    "Congestion control is simplified — not full Reno/Cubic implementation",
    "Fixed ISN instead of randomized sequence numbers",
    "Single retransmission strategy (timeout-based) shown by default",
    "No selective ACK (SACK) or window scaling demonstrated",
  ],
};

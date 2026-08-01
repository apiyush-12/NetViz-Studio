import type { ProtocolModule } from "@/features/protocols/shared/protocol-types";
import { DEFAULT_TWO_HOST_TOPOLOGY } from "@/features/protocols/shared/protocol-utils";
import { udpConfigSchema, defaultUdpConfig } from "./udp.config";
import { generateUdpSimulation } from "./udp.simulator";

export const udpModule: ProtocolModule = {
  id: "udp",
  name: "UDP",
  category: "transport",
  layer: "Transport (Layer 4)",
  summary:
    "User Datagram Protocol — connectionless, lightweight transport with no handshakes, no built-in reliability, and minimal overhead.",
  status: "implemented",
  learningObjectives: [
    "Understand connectionless communication",
    "Observe fire-and-forget datagram transmission",
    "See packet loss without retransmission",
    "Compare UDP overhead with TCP",
    "Identify application-level vs transport-level responses",
  ],
  defaultTopology: DEFAULT_TWO_HOST_TOPOLOGY,
  configurationSchema: udpConfigSchema,
  defaultConfiguration: defaultUdpConfig,
  generateSimulation: generateUdpSimulation,
  packetFields: [
    { layer: "Transport", name: "Source Port", description: "Sending application port" },
    { layer: "Transport", name: "Destination Port", description: "Receiving application port" },
    { layer: "Transport", name: "Length", description: "Header + data length" },
    { layer: "Transport", name: "Checksum", description: "Optional error detection" },
  ],
  explanationSections: [
    {
      eventType: "packet-sent",
      beginner: {
        whatHappened: "A UDP datagram was sent without any prior connection setup.",
        whyItHappened: "UDP is connectionless — no handshake is needed.",
        protocolRule: "RFC 768: UDP provides port multiplexing without connection state.",
        fieldsChanged: ["Source Port", "Destination Port", "Length"],
        whatHappensNext: "The datagram travels to the destination. There is no ACK from UDP itself.",
        misconception: "UDP does not send acknowledgements — any response is application-level.",
        realWorldUse: "DNS queries, video streaming, and online gaming use UDP.",
      },
      advanced: {
        whatHappened: "Datagram encapsulated and transmitted with minimal 8-byte header.",
        whyItHappened: "Connectionless design eliminates state synchronization overhead.",
        protocolRule: "RFC 768: No connection establishment, maintenance, or teardown.",
        fieldsChanged: ["udp.length", "udp.checksum"],
        whatHappensNext: "Best-effort delivery; application handles reliability if required.",
        realWorldUse: "QUIC builds reliability on top of UDP at the application layer.",
      },
    },
    {
      eventType: "packet-dropped",
      beginner: {
        whatHappened: "A UDP datagram was lost and will not be retransmitted.",
        whyItHappened: "UDP has no built-in reliability mechanism.",
        protocolRule: "Loss recovery must be implemented by the application if needed.",
        fieldsChanged: ["Packet status → dropped"],
        whatHappensNext: "The application may timeout and retry, or accept the loss.",
        misconception: "Lost UDP packets are not automatically retransmitted by the protocol.",
        realWorldUse: "Video calls skip lost frames rather than retransmitting.",
      },
      advanced: {
        whatHappened: "Datagram dropped with no transport-layer recovery.",
        whyItHappened: "UDP provides no sequence numbers, ACKs, or retransmission timers.",
        protocolRule: "RFC 768: UDP is an unreliable datagram protocol.",
        fieldsChanged: ["status→dropped"],
        whatHappensNext: "Application-layer protocol decides whether to retry.",
        realWorldUse: "RTP over UDP uses sequence numbers at the application layer.",
      },
    },
  ],
  simplificationNotes: [
    "No UDP checksum validation failure simulation",
    "Application-level responses are labeled explicitly",
    "No multicast or broadcast scenarios",
  ],
};

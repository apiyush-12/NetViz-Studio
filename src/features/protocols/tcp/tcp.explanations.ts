import type { ExplanationSection } from "@/features/protocols/shared/protocol-types";

export const tcpExplanations: ExplanationSection[] = [
  {
    eventType: "handshake-step",
    beginner: {
      whatHappened: "The client sent a SYN segment to begin a TCP connection.",
      whyItHappened: "TCP is connection-oriented and requires a three-way handshake before data transfer.",
      protocolRule: "RFC 793: A connection is initiated with a SYN segment containing an Initial Sequence Number (ISN).",
      fieldsChanged: ["Sequence Number", "SYN flag"],
      whatHappensNext: "The server will respond with SYN-ACK to acknowledge and synchronize.",
      misconception: "SYN is not data — it only establishes the connection parameters.",
      realWorldUse: "Every HTTPS request, file download, and database query starts this way.",
    },
    advanced: {
      whatHappened: "Client transitions to SYN-SENT after transmitting SYN with ISN.",
      whyItHappened: "Connection establishment requires synchronized sequence numbers on both sides.",
      protocolRule: "RFC 793 Section 3.4: The active open sends SYN, enters SYN-SENT state.",
      fieldsChanged: ["seq", "flags.SYN=1", "senderState→SYN-SENT"],
      whatHappensNext: "Await SYN-ACK; retransmit SYN on timeout if no response.",
      misconception: "Modern stacks randomize ISN for security — this simulation uses a fixed ISN for clarity.",
      realWorldUse: "SYN cookies protect servers during SYN flood attacks.",
    },
  },
  {
    eventType: "packet-dropped",
    beginner: {
      whatHappened: "A TCP segment was lost in the network and never reached its destination.",
      whyItHappened: "Networks can drop packets due to congestion, errors, or simulated loss for testing.",
      protocolRule: "TCP detects loss via timeout or duplicate ACKs and retransmits.",
      fieldsChanged: ["Packet status → dropped"],
      whatHappensNext: "The sender's retransmission timer will expire, triggering a retransmission.",
      misconception: "Dropped packets are not silently ignored — TCP guarantees delivery.",
      realWorldUse: "Wi-Fi and mobile networks frequently experience packet loss.",
    },
    advanced: {
      whatHappened: "Segment dropped — no ACK received within RTO.",
      whyItHappened: "Simulated loss at configured drop index or network congestion.",
      protocolRule: "RFC 6298: RTO calculation determines retransmission timing.",
      fieldsChanged: ["status→dropped", "retransmission timer started"],
      whatHappensNext: "Exponential backoff on RTO; fast retransmit after 3 duplicate ACKs.",
      realWorldUse: "Loss-based congestion control reduces send rate after drops.",
    },
  },
  {
    eventType: "retransmission",
    beginner: {
      whatHappened: "The sender retransmitted a lost TCP segment.",
      whyItHappened: "The original segment was dropped and the timeout expired.",
      protocolRule: "TCP retransmits unacknowledged segments after RTO expires.",
      fieldsChanged: ["Sequence number (same as original)", "Retransmission flag"],
      whatHappensNext: "The receiver should ACK the retransmitted segment.",
      misconception: "Retransmissions use the same sequence number — they are not new data.",
      realWorldUse: "Retransmissions add latency but ensure reliable delivery.",
    },
    advanced: {
      whatHappened: "RTO expired; segment retransmitted with identical seq number.",
      whyItHappened: "No ACK received within computed RTO for the original transmission.",
      protocolRule: "RFC 793: Retransmission uses the same sequence space.",
      fieldsChanged: ["retransmission count++", "RTO doubled (backoff)"],
      whatHappensNext: "Await ACK; further duplicates trigger fast retransmit if applicable.",
      realWorldUse: "Wireshark displays retransmissions as duplicate sequence warnings.",
    },
  },
  {
    eventType: "acknowledgement-sent",
    beginner: {
      whatHappened: "The receiver sent an ACK to confirm received data.",
      whyItHappened: "TCP uses cumulative acknowledgements to confirm all data up to a sequence number.",
      protocolRule: "ACK number = next expected sequence number.",
      fieldsChanged: ["Acknowledgement Number", "ACK flag"],
      whatHappensNext: "Sender advances its send window and may transmit more data.",
      misconception: "Each packet does not need its own ACK — cumulative ACKs cover multiple segments.",
      realWorldUse: "Delayed ACKs batch acknowledgements to reduce overhead.",
    },
    advanced: {
      whatHappened: "Cumulative ACK transmitted with ack number indicating next expected byte.",
      whyItHappened: "Receiver buffer processed data through the acknowledged sequence.",
      protocolRule: "RFC 793: Acknowledgement is cumulative — ack N means all bytes < N received.",
      fieldsChanged: ["ack", "flags.ACK=1", "receive window"],
      whatHappensNext: "Sender slides congestion and send windows forward.",
      realWorldUse: "SACK option allows selective acknowledgements for out-of-order data.",
    },
  },
];

export function getTcpExplanation(
  eventType: string,
  mode: "beginner" | "advanced" = "beginner"
) {
  const section = tcpExplanations.find((s) => s.eventType === eventType);
  if (!section) {
    return {
      whatHappened: "A TCP event occurred in the simulation.",
      whyItHappened: "Part of the TCP state machine operation.",
      protocolRule: "RFC 793 TCP specification.",
      fieldsChanged: [],
      whatHappensNext: "Continue observing the simulation.",
    };
  }
  return mode === "advanced" ? section.advanced : section.beginner;
}

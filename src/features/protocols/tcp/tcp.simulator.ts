import { generateId } from "@/lib/utils";
import type {
  SimulationEvent,
  SimulationResult,
  Packet,
  TopologyDefinition,
} from "@/features/simulation/simulation-types";
import { createEventBase } from "@/features/protocols/shared/protocol-utils";
import { tcpConfigSchema, defaultTcpConfig, type TcpConfig, type TcpState } from "./tcp.config";

const SENDER = "sender";
const RECEIVER = "receiver";

function createTcpPacket(
  label: string,
  source: string,
  dest: string,
  seq: number,
  ack: number,
  flags: string[],
  size: number,
  direction: "forward" | "reverse" = "forward"
): Packet {
  return {
    id: generateId("pkt"),
    protocol: "TCP",
    label,
    source,
    destination: dest,
    headers: {
      ethernet: {
        srcMac: source === SENDER ? "AA:BB:CC:DD:EE:01" : "AA:BB:CC:DD:EE:02",
        dstMac: source === SENDER ? "AA:BB:CC:DD:EE:02" : "AA:BB:CC:DD:EE:01",
        etherType: "0x0800",
      },
      ipv4: {
        version: 4,
        ttl: 64,
        protocol: "TCP (6)",
        srcIp: source === SENDER ? "192.168.1.10" : "192.168.1.20",
        dstIp: source === SENDER ? "192.168.1.20" : "192.168.1.10",
      },
      tcp: {
        srcPort: source === SENDER ? 49152 : 80,
        dstPort: source === SENDER ? 80 : 49152,
        seq,
        ack,
        flags: flags.join(", "),
        window: 4096,
        mss: 1460,
      },
    },
    size,
    status: "pending",
    colorKey: flags.includes("SYN") ? "syn" : flags.includes("ACK") && flags.length === 1 ? "ack" : flags.includes("FIN") ? "fin" : "data",
    createdAt: Date.now(),
    direction,
  };
}

function addStateEvent(
  events: SimulationEvent[],
  seq: number,
  time: number,
  senderState: TcpState,
  receiverState: TcpState,
  title: string,
  description: string
) {
  const base = createEventBase(seq, time, "tcp");
  events.push({
    ...base,
    type: "state-change",
    sourceNodeId: SENDER,
    destinationNodeId: RECEIVER,
    title,
    description,
    payload: { senderState, receiverState },
    severity: "info",
  });
}

export function generateTcpSimulation(
  _topology: TopologyDefinition,
  rawConfig: Record<string, unknown>
): SimulationResult {
  const config: TcpConfig = tcpConfigSchema.parse({ ...defaultTcpConfig, ...rawConfig });
  const events: SimulationEvent[] = [];
  const packets: Packet[] = [];
  let seq = 0;
  let time = 0;
  const latency = config.latencyMs;

  let senderState: TcpState = "CLOSED";
  let receiverState: TcpState = "LISTEN";
  const clientSeq = config.initialSeqNum;
  const serverSeq = 5000;
  let nextDataSeq = clientSeq + 1;
  let bytesSent = 0;
  let cwnd = 1;

  const advance = (ms: number) => {
    time += ms;
  };

  // Three-way handshake
  addStateEvent(events, seq++, time, senderState, receiverState, "Initial State", "Client CLOSED, Server LISTEN");
  advance(50);

  // SYN
  senderState = "SYN-SENT";
  const synPkt = createTcpPacket("SYN", SENDER, RECEIVER, clientSeq, 0, ["SYN"], 40);
  packets.push(synPkt);
  const synBase = createEventBase(seq++, time, "tcp");
  events.push({
    ...synBase,
    type: "handshake-step",
    sourceNodeId: SENDER,
    destinationNodeId: RECEIVER,
    title: "SYN Sent",
    description: `Client sends SYN with sequence number ${clientSeq}`,
    packetId: synPkt.id,
    payload: { senderState, receiverState, seq: clientSeq, flags: ["SYN"] },
    severity: "info",
  });
  addStateEvent(events, seq++, time, senderState, receiverState, "SYN-SENT", "Client waiting for SYN-ACK");

  advance(latency);
  receiverState = "SYN-RECEIVED";
  events.push({
    ...createEventBase(seq++, time, "tcp"),
    type: "packet-arrived",
    sourceNodeId: SENDER,
    destinationNodeId: RECEIVER,
    title: "SYN Received",
    description: "Server received SYN segment",
    packetId: synPkt.id,
    payload: { senderState, receiverState },
    severity: "success",
  });

  // SYN-ACK
  const synAckPkt = createTcpPacket("SYN-ACK", RECEIVER, SENDER, serverSeq, clientSeq + 1, ["SYN", "ACK"], 40, "reverse");
  packets.push(synAckPkt);
  events.push({
    ...createEventBase(seq++, time, "tcp"),
    type: "handshake-step",
    sourceNodeId: RECEIVER,
    destinationNodeId: SENDER,
    title: "SYN-ACK Sent",
    description: `Server responds with SYN-ACK (seq=${serverSeq}, ack=${clientSeq + 1})`,
    packetId: synAckPkt.id,
    payload: { senderState, receiverState, seq: serverSeq, ack: clientSeq + 1 },
    severity: "info",
  });

  advance(latency);
  senderState = "ESTABLISHED";
  receiverState = "ESTABLISHED";
  events.push({
    ...createEventBase(seq++, time, "tcp"),
    type: "packet-arrived",
    sourceNodeId: RECEIVER,
    destinationNodeId: SENDER,
    title: "SYN-ACK Received",
    description: "Client received SYN-ACK",
    packetId: synAckPkt.id,
    payload: { senderState, receiverState },
    severity: "success",
  });

  // ACK
  const ackPkt = createTcpPacket("ACK", SENDER, RECEIVER, clientSeq + 1, serverSeq + 1, ["ACK"], 40);
  packets.push(ackPkt);
  events.push({
    ...createEventBase(seq++, time, "tcp"),
    type: "handshake-step",
    sourceNodeId: SENDER,
    destinationNodeId: RECEIVER,
    title: "ACK Sent — Connection Established",
    description: "Client completes three-way handshake with ACK",
    packetId: ackPkt.id,
    payload: { senderState, receiverState, congestionWindow: cwnd },
    severity: "success",
  });
  addStateEvent(events, seq++, time, senderState, receiverState, "ESTABLISHED", "Connection established on both sides");
  advance(latency);

  // Data transfer
  for (let i = 0; i < config.packetCount; i++) {
    advance(100);
    const dataSize = Math.min(config.mss, 100);
    const dataPkt = createTcpPacket(`DATA-${i + 1}`, SENDER, RECEIVER, nextDataSeq, serverSeq + 1, ["PSH", "ACK"], dataSize + 40);
    packets.push(dataPkt);
    const dataSeqNum = seq;

    events.push({
      ...createEventBase(seq++, time, "tcp"),
      type: "packet-created",
      sourceNodeId: SENDER,
      destinationNodeId: RECEIVER,
      title: `Data Segment ${i + 1} Created`,
      description: `Segment with seq=${nextDataSeq}, ${dataSize} bytes payload`,
      packetId: dataPkt.id,
      payload: { senderState, receiverState, seq: nextDataSeq, congestionWindow: cwnd },
      severity: "info",
    });

    events.push({
      ...createEventBase(seq++, time, "tcp"),
      type: "packet-sent",
      sourceNodeId: SENDER,
      destinationNodeId: RECEIVER,
      title: `Data Segment ${i + 1} Sent`,
      description: `Transmitting ${dataSize} bytes (seq=${nextDataSeq})`,
      packetId: dataPkt.id,
      payload: { senderState, receiverState, sendWindow: config.windowSize },
      severity: "info",
    });

    const shouldDrop = config.dropPacketIndex === i;
    advance(latency);

    if (shouldDrop) {
      dataPkt.status = "dropped";
      events.push({
        ...createEventBase(seq++, time, "tcp"),
        type: "packet-dropped",
        sourceNodeId: SENDER,
        destinationNodeId: RECEIVER,
        title: `Data Segment ${i + 1} Dropped`,
        description: "Packet lost in network — will trigger timeout and retransmission",
        packetId: dataPkt.id,
        payload: { senderState, receiverState, dropReason: "simulated loss" },
        severity: "error",
      });

      advance(config.timeoutMs);
      events.push({
        ...createEventBase(seq++, time, "tcp"),
        type: "timeout",
        sourceNodeId: SENDER,
        destinationNodeId: RECEIVER,
        title: "Retransmission Timeout (RTO)",
        description: `No ACK received within ${config.timeoutMs}ms — RTO expired`,
        packetId: dataPkt.id,
        payload: { senderState, receiverState, rto: config.timeoutMs },
        severity: "warning",
      });

      const retransPkt = createTcpPacket(`RETX-${i + 1}`, SENDER, RECEIVER, nextDataSeq, serverSeq + 1, ["PSH", "ACK"], dataSize + 40);
      retransPkt.status = "retransmitted";
      packets.push(retransPkt);
      events.push({
        ...createEventBase(seq++, time, "tcp"),
        type: "retransmission",
        sourceNodeId: SENDER,
        destinationNodeId: RECEIVER,
        title: `Data Segment ${i + 1} Retransmitted`,
        description: `Retransmitting seq=${nextDataSeq} after timeout`,
        packetId: retransPkt.id,
        payload: { senderState, receiverState, originalPacketId: dataPkt.id },
        severity: "warning",
      });

      advance(latency);
      events.push({
        ...createEventBase(seq++, time, "tcp"),
        type: "packet-arrived",
        sourceNodeId: SENDER,
        destinationNodeId: RECEIVER,
        title: `Retransmitted Segment ${i + 1} Arrived`,
        description: "Receiver got the retransmitted segment",
        packetId: retransPkt.id,
        payload: { senderState, receiverState },
        severity: "success",
      });
    } else {
      dataPkt.status = "delivered";
      events.push({
        ...createEventBase(seq++, time, "tcp"),
        type: "packet-arrived",
        sourceNodeId: SENDER,
        destinationNodeId: RECEIVER,
        title: `Data Segment ${i + 1} Arrived`,
        description: `Receiver got segment seq=${nextDataSeq}`,
        packetId: dataPkt.id,
        payload: { senderState, receiverState },
        severity: "success",
      });
    }

    advance(50);
    const ackNum = nextDataSeq + dataSize;
    const dataAckPkt = createTcpPacket(`ACK-${i + 1}`, RECEIVER, SENDER, serverSeq + 1, ackNum, ["ACK"], 40, "reverse");
    packets.push(dataAckPkt);

    const shouldDropAck = config.dropAckIndex === i;
    if (shouldDropAck) {
      events.push({
        ...createEventBase(seq++, time, "tcp"),
        type: "packet-dropped",
        sourceNodeId: RECEIVER,
        destinationNodeId: SENDER,
        title: `ACK for Segment ${i + 1} Dropped`,
        description: "ACK lost — sender may retransmit or wait for duplicate ACKs",
        packetId: dataAckPkt.id,
        payload: { senderState, receiverState },
        severity: "warning",
      });
    } else {
      events.push({
        ...createEventBase(seq++, time, "tcp"),
        type: "acknowledgement-sent",
        sourceNodeId: RECEIVER,
        destinationNodeId: SENDER,
        title: `ACK for Segment ${i + 1}`,
        description: `Cumulative ACK: ack=${ackNum}`,
        packetId: dataAckPkt.id,
        payload: { senderState, receiverState, ack: ackNum },
        severity: "success",
      });
      advance(latency);
      events.push({
        ...createEventBase(seq++, time, "tcp"),
        type: "packet-arrived",
        sourceNodeId: RECEIVER,
        destinationNodeId: SENDER,
        title: `ACK ${i + 1} Received by Sender`,
        description: `Sender acknowledges ack=${ackNum}`,
        packetId: dataAckPkt.id,
        payload: { senderState, receiverState },
        severity: "success",
      });
    }

    nextDataSeq += dataSize;
    bytesSent += dataSize;
    cwnd = Math.min(cwnd + 1, 10);
    void dataSeqNum;
  }

  // Connection close
  if (config.includeClose) {
    advance(200);
    senderState = "FIN-WAIT-1";
    const finPkt = createTcpPacket("FIN", SENDER, RECEIVER, nextDataSeq, serverSeq + 1, ["FIN", "ACK"], 40);
    packets.push(finPkt);
    events.push({
      ...createEventBase(seq++, time, "tcp"),
      type: "handshake-step",
      sourceNodeId: SENDER,
      destinationNodeId: RECEIVER,
      title: "FIN Sent",
      description: "Client initiates connection termination",
      packetId: finPkt.id,
      payload: { senderState, receiverState },
      severity: "info",
    });
    addStateEvent(events, seq++, time, senderState, receiverState, "FIN-WAIT-1", "Client sent FIN, waiting for ACK");

    advance(latency);
    receiverState = "CLOSE-WAIT";
    events.push({
      ...createEventBase(seq++, time, "tcp"),
      type: "packet-arrived",
      sourceNodeId: SENDER,
      destinationNodeId: RECEIVER,
      title: "FIN Received",
      description: "Server received FIN from client",
      packetId: finPkt.id,
      payload: { senderState, receiverState },
      severity: "info",
    });

    const finAckPkt = createTcpPacket("ACK", RECEIVER, SENDER, serverSeq + 1, nextDataSeq + 1, ["ACK"], 40, "reverse");
    packets.push(finAckPkt);
    events.push({
      ...createEventBase(seq++, time, "tcp"),
      type: "acknowledgement-sent",
      sourceNodeId: RECEIVER,
      destinationNodeId: SENDER,
      title: "FIN ACK Sent",
      description: "Server acknowledges client's FIN",
      packetId: finAckPkt.id,
      payload: { senderState, receiverState },
      severity: "success",
    });
  }

  events.push({
    ...createEventBase(seq++, time + 100, "tcp"),
    type: "simulation-completed",
    sourceNodeId: SENDER,
    destinationNodeId: RECEIVER,
    title: "Simulation Complete",
    description: `TCP simulation finished. ${config.packetCount} data segments, ${bytesSent} bytes transferred.`,
    payload: { senderState, receiverState, bytesSent },
    severity: "success",
  });

  return {
    events,
    packets,
    initialState: {
      senderState: "CLOSED",
      receiverState: "LISTEN",
      congestionWindow: 1,
    },
  };
}

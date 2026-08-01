import { generateId } from "@/lib/utils";
import type {
  SimulationEvent,
  SimulationResult,
  Packet,
  TopologyDefinition,
} from "@/features/simulation/simulation-types";
import { createEventBase } from "@/features/protocols/shared/protocol-utils";
import { udpConfigSchema, defaultUdpConfig, type UdpConfig } from "./udp.config";

const SENDER = "sender";
const RECEIVER = "receiver";

function createUdpPacket(
  label: string,
  source: string,
  dest: string,
  size: number
): Packet {
  return {
    id: generateId("pkt"),
    protocol: "UDP",
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
        protocol: "UDP (17)",
        srcIp: source === SENDER ? "192.168.1.10" : "192.168.1.20",
        dstIp: source === SENDER ? "192.168.1.20" : "192.168.1.10",
      },
      udp: {
        srcPort: source === SENDER ? 50000 : 53,
        dstPort: source === SENDER ? 53 : 50000,
        length: size + 8,
        checksum: "0x1A2B",
      },
    },
    payload: `${size} bytes of datagram payload`,
    size: size + 28,
    status: "pending",
    colorKey: "udp",
    createdAt: Date.now(),
    direction: "forward",
  };
}

export function generateUdpSimulation(
  _topology: TopologyDefinition,
  rawConfig: Record<string, unknown>
): SimulationResult {
  const config: UdpConfig = udpConfigSchema.parse({ ...defaultUdpConfig, ...rawConfig });
  const events: SimulationEvent[] = [];
  const packets: Packet[] = [];
  let seq = 0;
  let time = 0;

  events.push({
    ...createEventBase(seq++, time, "udp"),
    type: "configuration-changed",
    sourceNodeId: SENDER,
    destinationNodeId: RECEIVER,
    title: "UDP — Connectionless Mode",
    description: "UDP requires no handshake. Datagrams are sent directly without establishing a connection.",
    payload: { connectionless: true },
    severity: "info",
  });

  const arrivalOrder: number[] = [];
  for (let i = 0; i < config.datagramCount; i++) {
    if (!config.dropIndices.includes(i)) {
      arrivalOrder.push(i);
    }
  }

  if (config.outOfOrder && arrivalOrder.length > 2) {
    [arrivalOrder[0], arrivalOrder[1]] = [arrivalOrder[1], arrivalOrder[0]];
  }

  for (let i = 0; i < config.datagramCount; i++) {
    time += config.sendIntervalMs;
    const pkt = createUdpPacket(`DG-${i + 1}`, SENDER, RECEIVER, config.payloadSize);
    packets.push(pkt);

    events.push({
      ...createEventBase(seq++, time, "udp"),
      type: "packet-created",
      sourceNodeId: SENDER,
      destinationNodeId: RECEIVER,
      title: `Datagram ${i + 1} Created`,
      description: `UDP datagram #${i + 1} with ${config.payloadSize} byte payload — no connection state`,
      packetId: pkt.id,
      payload: { datagramNumber: i + 1, connectionless: true },
      severity: "info",
    });

    events.push({
      ...createEventBase(seq++, time, "udp"),
      type: "packet-sent",
      sourceNodeId: SENDER,
      destinationNodeId: RECEIVER,
      title: `Datagram ${i + 1} Sent`,
      description: `Fire-and-forget transmission — UDP provides no delivery guarantee`,
      packetId: pkt.id,
      payload: { datagramNumber: i + 1 },
      severity: "info",
    });

    const isDropped = config.dropIndices.includes(i);
    time += config.latencyMs;

    if (isDropped) {
      pkt.status = "dropped";
      events.push({
        ...createEventBase(seq++, time, "udp"),
        type: "packet-dropped",
        sourceNodeId: SENDER,
        destinationNodeId: RECEIVER,
        title: `Datagram ${i + 1} Lost`,
        description: "Datagram dropped — UDP has no built-in retransmission. Application must handle loss if needed.",
        packetId: pkt.id,
        payload: { datagramNumber: i + 1, noRetransmission: true },
        severity: "error",
      });
    } else {
      pkt.status = "delivered";
      const arrivalIndex = arrivalOrder.indexOf(i);
      const extraDelay = config.outOfOrder ? arrivalIndex * 30 : 0;
      time += extraDelay;

      events.push({
        ...createEventBase(seq++, time, "udp"),
        type: "packet-arrived",
        sourceNodeId: SENDER,
        destinationNodeId: RECEIVER,
        title: `Datagram ${i + 1} Arrived`,
        description: config.outOfOrder && i > 0
          ? `Datagram arrived out of order — UDP does not reorder`
          : `Datagram #${i + 1} delivered to receiver`,
        packetId: pkt.id,
        payload: { datagramNumber: i + 1, outOfOrder: config.outOfOrder && i > 0 },
        severity: "success",
      });
    }
  }

  // Application-level response (clearly labeled)
  time += 200;
  events.push({
    ...createEventBase(seq++, time, "udp"),
    type: "packet-sent",
    sourceNodeId: RECEIVER,
    destinationNodeId: SENDER,
    title: "Application-Level Response (not UDP ACK)",
    description: "An application-layer protocol (e.g., DNS response) may reply over UDP — this is NOT a transport-layer acknowledgement.",
    payload: { applicationLevel: true, notUdpAck: true },
    severity: "info",
  });

  events.push({
    ...createEventBase(seq++, time + 100, "udp"),
    type: "simulation-completed",
    sourceNodeId: SENDER,
    destinationNodeId: RECEIVER,
    title: "UDP Simulation Complete",
    description: `${config.datagramCount} datagrams sent. ${config.dropIndices.length} lost. No transport-layer ACKs or retransmissions.`,
    payload: {
      sent: config.datagramCount,
      dropped: config.dropIndices.length,
      connectionless: true,
    },
    severity: "success",
  });

  return {
    events,
    packets,
    initialState: { connectionless: true },
  };
}

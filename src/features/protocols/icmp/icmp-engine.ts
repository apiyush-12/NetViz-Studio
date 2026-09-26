import type {
  IcmpHeader,
  IcmpPacketData,
} from "./icmp.types";

/**
 * Calculates a simulated RFC 1071 16-bit one's complement checksum for an ICMP message.
 */
export function calculateIcmpChecksum(
  type: number,
  code: number,
  specificField: number = 0,
  payloadLength: number = 32
): number {
  let sum = (type << 8) | code;
  sum += (specificField >>> 16) & 0xffff;
  sum += specificField & 0xffff;
  sum += payloadLength;

  while (sum >> 16) {
    sum = (sum & 0xffff) + (sum >> 16);
  }
  return (~sum) & 0xffff;
}

/**
 * Returns human-readable name for an ICMP Type & Code combination per RFC 792 / RFC 1191.
 */
export function getIcmpTypeName(type: number, code: number): string {
  switch (type) {
    case 0:
      return "Echo Reply (Ping Response)";
    case 3:
      switch (code) {
        case 0:
          return "Destination Network Unreachable";
        case 1:
          return "Destination Host Unreachable";
        case 2:
          return "Destination Protocol Unreachable";
        case 3:
          return "Destination Port Unreachable";
        case 4:
          return "Fragmentation Needed and DF set (PMTUD)";
        case 9:
          return "Destination Network Administratively Prohibited";
        case 10:
          return "Destination Host Administratively Prohibited";
        case 13:
          return "Communication Administratively Prohibited";
        default:
          return `Destination Unreachable (Code ${code})`;
      }
    case 4:
      return "Source Quench (Congestion Feedback)";
    case 5:
      return code === 0 ? "Redirect for Network" : "Redirect for Host";
    case 8:
      return "Echo Request (Ping Probe)";
    case 11:
      return code === 0 ? "Time to Live Exceeded in Transit" : "Fragment Reassembly Time Exceeded";
    case 12:
      return "Parameter Problem (Bad IP Header)";
    default:
      return `ICMP Type ${type} Code ${code}`;
  }
}

/**
 * Creates an RFC 792 ICMP Header structure.
 */
export function createIcmpHeader(
  type: number,
  code: number,
  options?: {
    identifier?: number;
    sequenceNumber?: number;
    nextHopMtu?: number;
    gatewayAddress?: string;
    pointer?: number;
    originalIpHeader?: IcmpHeader["originalIpHeader"];
    originalPayloadFirst8Bytes?: string;
  }
): IcmpHeader {
  const typeName = getIcmpTypeName(type, code);
  const specificField =
    (options?.identifier ?? 0) << 16 |
    (options?.sequenceNumber ?? options?.nextHopMtu ?? options?.pointer ?? 0);

  const checksum = calculateIcmpChecksum(type, code, specificField, 32);

  return {
    type,
    code,
    checksum,
    typeName,
    identifier: options?.identifier,
    sequenceNumber: options?.sequenceNumber,
    nextHopMtu: options?.nextHopMtu,
    gatewayAddress: options?.gatewayAddress,
    pointer: options?.pointer,
    originalIpHeader: options?.originalIpHeader,
    originalPayloadFirst8Bytes: options?.originalPayloadFirst8Bytes,
  };
}

/**
 * Creates an ICMP Echo Request packet (Type 8 Code 0).
 */
export function createEchoRequest(
  id: string,
  sourceIp: string,
  destIp: string,
  identifier: number = 0x1234,
  sequenceNumber: number = 1,
  ttl: number = 64,
  packetSize: number = 64
): IcmpPacketData {
  const icmpHeader = createIcmpHeader(8, 0, { identifier, sequenceNumber });

  return {
    id,
    sourceIp,
    destIp,
    ipTtl: ttl,
    ipDontFragment: true,
    totalLengthBytes: packetSize,
    icmpHeader,
    payloadSummary: `Echo Request: ID=0x${identifier.toString(16).padStart(4, "0")} Seq=${sequenceNumber} (${packetSize - 28} bytes payload)`,
    payloadData: "abcdefghijklmnopqrstuvwabcdefghi",
    isErrorResponse: false,
  };
}

/**
 * Generates an ICMP Echo Reply (Type 0 Code 0) in response to an Echo Request.
 */
export function generateEchoReply(
  request: IcmpPacketData,
  responderIp: string,
  rttMs: number = 24
): IcmpPacketData {
  const icmpHeader = createIcmpHeader(0, 0, {
    identifier: request.icmpHeader.identifier,
    sequenceNumber: request.icmpHeader.sequenceNumber,
  });

  return {
    id: `reply-${request.id}`,
    sourceIp: responderIp,
    destIp: request.sourceIp,
    ipTtl: 64,
    ipDontFragment: true,
    totalLengthBytes: request.totalLengthBytes,
    icmpHeader,
    payloadSummary: `Echo Reply: ID=0x${(request.icmpHeader.identifier ?? 0).toString(16).padStart(4, "0")} Seq=${request.icmpHeader.sequenceNumber} RTT=${rttMs}ms`,
    payloadData: request.payloadData,
    rttMs,
    isErrorResponse: false,
  };
}

/**
 * Generates an ICMP Time to Live Exceeded (Type 11 Code 0) quoting the original datagram.
 */
export function generateTimeExceeded(
  originalPacket: IcmpPacketData,
  routerIp: string,
  rttMs: number = 15
): IcmpPacketData {
  const icmpHeader = createIcmpHeader(11, 0, {
    originalIpHeader: {
      sourceIp: originalPacket.sourceIp,
      destIp: originalPacket.destIp,
      protocol: 1, // ICMP
      protocolName: "ICMP",
      totalLength: originalPacket.totalLengthBytes,
      identification: 0x4a12,
      dontFragment: originalPacket.ipDontFragment,
      ttl: 1,
    },
    originalPayloadFirst8Bytes: `ICMP Type 8 Code 0 ID=0x${(originalPacket.icmpHeader.identifier ?? 0).toString(16)} Seq=${originalPacket.icmpHeader.sequenceNumber}`,
  });

  return {
    id: `ttl-exceeded-${originalPacket.id}`,
    sourceIp: routerIp,
    destIp: originalPacket.sourceIp,
    ipTtl: 64,
    ipDontFragment: false,
    totalLengthBytes: 56, // 20B IP + 8B ICMP + 20B Quoted IP + 8B Quoted Payload
    icmpHeader,
    payloadSummary: `ICMP Time Exceeded (TTL=0 in transit at ${routerIp})`,
    rttMs,
    isErrorResponse: true,
  };
}

/**
 * Generates an ICMP Destination Unreachable - Fragmentation Needed and DF Set (Type 3 Code 4) for PMTUD.
 */
export function generateFragNeeded(
  originalPacket: IcmpPacketData,
  nextHopMtu: number,
  routerIp: string
): IcmpPacketData {
  const icmpHeader = createIcmpHeader(3, 4, {
    nextHopMtu,
    originalIpHeader: {
      sourceIp: originalPacket.sourceIp,
      destIp: originalPacket.destIp,
      protocol: 1,
      protocolName: "ICMP",
      totalLength: originalPacket.totalLengthBytes,
      identification: 0x5b34,
      dontFragment: true,
      ttl: originalPacket.ipTtl,
    },
    originalPayloadFirst8Bytes: `Payload len: ${originalPacket.totalLengthBytes - 20}B exceeds MTU: ${nextHopMtu}`,
  });

  return {
    id: `pmtud-frag-${originalPacket.id}`,
    sourceIp: routerIp,
    destIp: originalPacket.sourceIp,
    ipTtl: 64,
    ipDontFragment: false,
    totalLengthBytes: 56,
    icmpHeader,
    payloadSummary: `Destination Unreachable: Fragmentation Needed & DF set (Next-Hop MTU: ${nextHopMtu})`,
    isErrorResponse: true,
    droppedAtNodeId: routerIp,
    dropReason: `Packet size (${originalPacket.totalLengthBytes}B) exceeds outgoing interface MTU (${nextHopMtu}B) and DF=1 is set.`,
  };
}

/**
 * Generates an ICMP Destination Port Unreachable (Type 3 Code 3) when a target UDP port is closed.
 */
export function generatePortUnreachable(
  originalPacket: IcmpPacketData,
  targetIp: string,
  targetPort: number = 33434
): IcmpPacketData {
  const icmpHeader = createIcmpHeader(3, 3, {
    originalIpHeader: {
      sourceIp: originalPacket.sourceIp,
      destIp: originalPacket.destIp,
      protocol: 17, // UDP
      protocolName: "UDP",
      totalLength: originalPacket.totalLengthBytes,
      identification: 0x6c78,
      dontFragment: true,
      ttl: originalPacket.ipTtl,
    },
    originalPayloadFirst8Bytes: `UDP Src: 52140, Dst: ${targetPort}, Len: 40`,
  });

  return {
    id: `port-unreach-${originalPacket.id}`,
    sourceIp: targetIp,
    destIp: originalPacket.sourceIp,
    ipTtl: 64,
    ipDontFragment: false,
    totalLengthBytes: 56,
    icmpHeader,
    payloadSummary: `Destination Port Unreachable: Port ${targetPort} closed on ${targetIp}`,
    isErrorResponse: true,
  };
}

/**
 * Generates an ICMP Administratively Prohibited (Type 3 Code 13) from a firewall ACL drop.
 */
export function generateAdminProhibited(
  originalPacket: IcmpPacketData,
  firewallIp: string
): IcmpPacketData {
  const icmpHeader = createIcmpHeader(3, 13, {
    originalIpHeader: {
      sourceIp: originalPacket.sourceIp,
      destIp: originalPacket.destIp,
      protocol: 1,
      protocolName: "ICMP",
      totalLength: originalPacket.totalLengthBytes,
      identification: 0x7d89,
      dontFragment: true,
      ttl: originalPacket.ipTtl,
    },
    originalPayloadFirst8Bytes: `ACL Drop Rule 101 DENY ICMP ${originalPacket.sourceIp} -> ${originalPacket.destIp}`,
  });

  return {
    id: `admin-prohibited-${originalPacket.id}`,
    sourceIp: firewallIp,
    destIp: originalPacket.sourceIp,
    ipTtl: 64,
    ipDontFragment: false,
    totalLengthBytes: 56,
    icmpHeader,
    payloadSummary: `Communication Administratively Prohibited (Firewall ACL drop at ${firewallIp})`,
    isErrorResponse: true,
    droppedAtNodeId: firewallIp,
    dropReason: "Blocked by Stateful Firewall Access Control List (Rule 101 DENY).",
  };
}

/**
 * Generates an ICMP Redirect (Type 5 Code 1) informing host of a better gateway.
 */
export function generateRedirect(
  originalPacket: IcmpPacketData,
  optimalGatewayIp: string,
  currentRouterIp: string
): IcmpPacketData {
  const icmpHeader = createIcmpHeader(5, 1, {
    gatewayAddress: optimalGatewayIp,
    originalIpHeader: {
      sourceIp: originalPacket.sourceIp,
      destIp: originalPacket.destIp,
      protocol: 1,
      protocolName: "ICMP",
      totalLength: originalPacket.totalLengthBytes,
      identification: 0x8e90,
      dontFragment: false,
      ttl: originalPacket.ipTtl,
    },
    originalPayloadFirst8Bytes: `Forward via optimal gateway ${optimalGatewayIp}`,
  });

  return {
    id: `redirect-${originalPacket.id}`,
    sourceIp: currentRouterIp,
    destIp: originalPacket.sourceIp,
    ipTtl: 64,
    ipDontFragment: false,
    totalLengthBytes: 56,
    icmpHeader,
    payloadSummary: `ICMP Redirect: Use gateway ${optimalGatewayIp} for destination ${originalPacket.destIp}`,
    isErrorResponse: true,
  };
}

/**
 * Formats a Wireshark-style RFC wire hex dump for an ICMP datagram.
 */
export function formatIcmpHexDump(packet: IcmpPacketData): string {
  const lines: string[] = [];
  const h = packet.icmpHeader;

  // Ethernet II Frame Header (14 bytes)
  lines.push("0000   00 1a 2b 3c 4d 5e  00 11 22 33 44 55  08 00");

  // IPv4 Header (20 bytes)
  lines.push(
    `000e   45 00 00 ${packet.totalLengthBytes.toString(16).padStart(2, "0")}  1a 2b ${packet.ipDontFragment ? "40" : "00"} 00  ${packet.ipTtl.toString(16).padStart(2, "0")} 01 c2 d4  [IP: ${packet.sourceIp} -> ${packet.destIp}]`
  );

  // ICMP Header (8 bytes)
  const typeHex = h.type.toString(16).padStart(2, "0");
  const codeHex = h.code.toString(16).padStart(2, "0");
  const csumHex = h.checksum.toString(16).padStart(4, "0");

  let specHex = "00 00 00 00";
  if (h.identifier !== undefined && h.sequenceNumber !== undefined) {
    const idH = h.identifier.toString(16).padStart(4, "0");
    const seqH = h.sequenceNumber.toString(16).padStart(4, "0");
    specHex = `${idH.slice(0, 2)} ${idH.slice(2, 4)} ${seqH.slice(0, 2)} ${seqH.slice(2, 4)}`;
  } else if (h.nextHopMtu !== undefined) {
    const mtuH = h.nextHopMtu.toString(16).padStart(4, "0");
    specHex = `00 00 ${mtuH.slice(0, 2)} ${mtuH.slice(2, 4)}`;
  }

  lines.push(
    `0022   ${typeHex} ${codeHex} ${csumHex.slice(0, 2)} ${csumHex.slice(2, 4)}  ${specHex}  [ICMP Type: ${h.type}, Code: ${h.code}, ${h.typeName}]`
  );

  // If Error Response: Quoted Original Header
  if (h.originalIpHeader) {
    lines.push(
      `002a   45 00 00 3c  11 22 40 00  01 01 f4 a1  [Quoted Original IP: ${h.originalIpHeader.sourceIp} -> ${h.originalIpHeader.destIp}]`
    );
    lines.push(
      `0036   08 00 f7 24  00 01 00 01  [Quoted Original Payload First 8 Bytes]`
    );
  } else {
    // Normal Payload (e.g. Ping Echo data)
    lines.push("002a   61 62 63 64  65 66 67 68  69 6a 6b 6c  6d 6e 6f 70  [Payload: \"abcdefghijklmnop\"]");
    lines.push("003a   71 72 73 74  75 76 77 61  62 63 64 65  66 67 68 69  [Payload: \"qrstuvwabcdefghi\"]");
  }

  return lines.join("\n");
}

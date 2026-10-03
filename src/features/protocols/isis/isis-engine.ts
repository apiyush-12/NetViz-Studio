/**
 * IS-IS (Intermediate System to Intermediate System - ISO/IEC 10589 / RFC 1195 / RFC 5308)
 * Pure Algorithmic Engine & PDU/TLV Builder
 */

import type {
  IsisPduData,
  IsisPduType,
  IsisTlv,
  IsisLspFlags,
  IsisRouterLevel,
  IsisGenericHeader,
} from "./isis.types";

/**
 * Creates an IS-IS Link State PDU (L1 LSP or L2 LSP) carrying TLVs.
 */
export function createIsisLspPdu(params: {
  level: "L1" | "L2";
  sourceSystemId: string;
  sourceHostname: string;
  lspNumber?: number; // default 0
  pseudonodeNumber?: number; // 0 for non-pseudonode, >0 for DIS pseudonode
  sequenceNumber?: number;
  remainingLifetime?: number;
  flags?: Partial<IsisLspFlags>;
  tlvs: IsisTlv[];
}): IsisPduData {
  const isL1 = params.level === "L1";
  const pduType: IsisPduType = isL1 ? 18 : 20;
  const pduTypeName = isL1 ? "Level 1 Link State PDU" : "Level 2 Link State PDU";

  const pseudonode = (params.pseudonodeNumber || 0).toString(16).padStart(2, "0");
  const lspNum = (params.lspNumber || 0).toString(16).padStart(2, "0");
  const lspId = `${params.sourceSystemId}.${pseudonode}-${lspNum}`;

  const flags: IsisLspFlags = {
    partitionRepair: params.flags?.partitionRepair ?? false,
    partition: false,
    attached: params.flags?.attached ?? false,
    overload: params.flags?.overload ?? false,
    isType: params.flags?.isType ?? (isL1 ? "L1" : "L2"),
  };

  // Calculate packet length (Generic Header 8B + LSP Header 19B + TLVs)
  let tlvsLength = 0;
  for (const tlv of params.tlvs) {
    tlvsLength += 2 + tlv.length;
  }
  const packetLength = 27 + tlvsLength;
  const seq = params.sequenceNumber || 1;
  const lifetime = params.remainingLifetime || 1200;
  const checksum = computeFletcherChecksum(params.sourceSystemId, seq);

  const genericHeader: IsisGenericHeader = {
    nlpid: 0x83,
    lengthIndicator: 8,
    version: 1,
    idLength: 0,
    pduType,
    version2: 1,
    reserved: 0,
    maxAreaAddresses: 3,
  };

  return {
    pduType,
    pduTypeName,
    level: params.level,
    sourceSystemId: params.sourceSystemId,
    sourceHostname: params.sourceHostname,
    lspId,
    sequenceNumber: seq,
    remainingLifetime: lifetime,
    checksum,
    flags,
    genericHeader,
    lspHeader: {
      pduLength: packetLength,
      remainingLifetime: lifetime,
      lspId,
      sequenceNumber: seq,
      checksum,
      flags,
    },
    tlvs: params.tlvs,
    packetLength,
  };
}

/**
 * Creates an IS-IS Hello PDU (Point-to-Point IIH or LAN IIH)
 */
export function createIsisHelloPdu(params: {
  circuitType: "p2p" | "broadcast";
  level: IsisRouterLevel;
  sourceSystemId: string;
  sourceHostname: string;
  disPriority?: number;
  areaId: string;
  neighborSystemId?: string;
}): IsisPduData {
  const isP2P = params.circuitType === "p2p";
  const pduType: IsisPduType = isP2P ? 17 : params.level === "L1" ? 15 : 16;
  const pduTypeName = isP2P
    ? "Point-to-Point IS-IS Hello (IIH)"
    : `${params.level} LAN IS-IS Hello (IIH)`;

  const tlvs: IsisTlv[] = [
    {
      type: 1,
      length: 3,
      name: "Area Addresses",
      description: `IS-IS Area Address: ${params.areaId}`,
      areaAddresses: [params.areaId],
      data: { area: params.areaId },
    },
    {
      type: 137,
      length: params.sourceHostname.length,
      name: "Dynamic Hostname",
      description: `RFC 5307 Hostname: ${params.sourceHostname}`,
      hostname: params.sourceHostname,
      data: { hostname: params.sourceHostname },
    },
    {
      type: 6,
      length: 4,
      name: "IPv4 Interface Addresses",
      description: "Interface IP: 10.0.1.1",
      ipInterfaces: ["10.0.1.1"],
      data: { ip: "10.0.1.1" },
    },
  ];

  if (params.neighborSystemId) {
    tlvs.push({
      type: 2,
      length: 6,
      name: "Intermediate System Neighbors",
      description: `Adjacent IS Neighbor: ${params.neighborSystemId}`,
      neighbors: [{ neighborId: params.neighborSystemId, metric: 10 }],
      data: { neighbor: params.neighborSystemId },
    });
  }

  const packetLength = isP2P ? 20 + 17 : 27 + 17;

  const genericHeader: IsisGenericHeader = {
    nlpid: 0x83,
    lengthIndicator: 8,
    version: 1,
    idLength: 0,
    pduType,
    version2: 1,
    reserved: 0,
    maxAreaAddresses: 3,
  };

  return {
    pduType,
    pduTypeName,
    level: params.level === "L2" ? "L2" : "L1",
    sourceSystemId: params.sourceSystemId,
    sourceHostname: params.sourceHostname,
    genericHeader,
    helloHeader: {
      circuitType: params.level === "L1_L2" ? 3 : params.level === "L2" ? 2 : 1,
      sourceSystemId: params.sourceSystemId,
      holdingTimer: 30,
      pduLength: packetLength,
      priority: params.disPriority || 64,
      lanIdOrCircuitId: `${params.sourceSystemId}.01`,
    },
    tlvs,
    packetLength,
  };
}

/**
 * Creates an IS-IS Complete Sequence Number PDU (CSNP) emitted by the DIS or during sync.
 */
export function createIsisCsnpPdu(params: {
  level: "L1" | "L2";
  sourceSystemId: string;
  sourceHostname: string;
  lspSummaries: { lspId: string; seqNum: number; lifetime: number; checksum: number }[];
}): IsisPduData {
  const pduType: IsisPduType = params.level === "L1" ? 24 : 25;
  const pduTypeName = `${params.level} Complete Sequence Number PDU (CSNP)`;

  const tlvs: IsisTlv[] = [
    {
      type: 9,
      length: params.lspSummaries.length * 16,
      name: "LSP Entries (CSNP Database Summary)",
      description: `Complete database sync (${params.lspSummaries.length} LSPs advertised)`,
      data: {
        lspCount: params.lspSummaries.length,
        entries: params.lspSummaries,
      },
    },
  ];

  const packetLength = 33 + params.lspSummaries.length * 16;

  const genericHeader: IsisGenericHeader = {
    nlpid: 0x83,
    lengthIndicator: 8,
    version: 1,
    idLength: 0,
    pduType,
    version2: 1,
    reserved: 0,
    maxAreaAddresses: 3,
  };

  return {
    pduType,
    pduTypeName,
    level: params.level,
    sourceSystemId: params.sourceSystemId,
    sourceHostname: params.sourceHostname,
    genericHeader,
    csnpHeader: {
      pduLength: packetLength,
      sourceSystemId: params.sourceSystemId,
      startLspId: "0000.0000.0000.00-00",
      endLspId: "FFFF.FFFF.FFFF.FF-FF",
    },
    tlvs,
    packetLength,
  };
}

/**
 * Fletcher 16-bit checksum (ISO 8473 / ISO 10589 Section 9.7)
 */
export function computeFletcherChecksum(seedText: string, seq: number): number {
  let c0 = 0;
  let c1 = 0;
  const input = `${seedText}:${seq}`;
  for (let i = 0; i < input.length; i++) {
    c0 = (c0 + input.charCodeAt(i)) % 255;
    c1 = (c1 + c0) % 255;
  }
  return (c1 << 8) | c0;
}

/**
 * Format IS-IS PDU and TLV data into Wireshark Wire Hex Dump
 */
export function formatIsisHexDump(pdu: IsisPduData): string[] {
  const lines: string[] = [];
  const bytes: number[] = [];

  // OSI LLC Header: DSAP 0xFE, SSAP 0xFE, Control 0x03
  bytes.push(0xfe, 0xfe, 0x03);

  // Intradomain Routing Protocol Discriminator (NLPID 0x83 for IS-IS)
  bytes.push(0x83);
  // Header Length
  bytes.push(pdu.pduType <= 17 ? 0x1b : 0x14);
  // Version / Protocol ID Extension (1)
  bytes.push(0x01);
  // ID Length (0 = 6 Octets System ID)
  bytes.push(0x00);
  // PDU Type (e.g. 18=L1 LSP, 20=L2 LSP)
  bytes.push(pdu.pduType & 0x1f);
  // Version (1)
  bytes.push(0x01);
  // Reserved (0)
  bytes.push(0x00);
  // Maximum Area Addresses (3)
  bytes.push(0x03);

  // LSP Header / IIH Header
  bytes.push((pdu.packetLength >> 8) & 0xff, pdu.packetLength & 0xff);

  if (pdu.remainingLifetime) {
    bytes.push((pdu.remainingLifetime >> 8) & 0xff, pdu.remainingLifetime & 0xff);
  }

  // System ID (6 bytes)
  const systemIdParts = pdu.sourceSystemId.split(".");
  for (const part of systemIdParts) {
    bytes.push(parseInt(part.slice(0, 2), 16) || 0, parseInt(part.slice(2, 4), 16) || 0);
  }

  // Sequence number (4 bytes)
  const seq = pdu.sequenceNumber || 1;
  bytes.push((seq >> 24) & 0xff, (seq >> 16) & 0xff, (seq >> 8) & 0xff, seq & 0xff);

  // Checksum (2 bytes)
  const chk = pdu.checksum || 0x4a1e;
  bytes.push((chk >> 8) & 0xff, chk & 0xff);

  // Flags (1 byte)
  let flagsByte = 0;
  if (pdu.flags?.overload) flagsByte |= 0x04;
  if (pdu.flags?.attached) flagsByte |= 0x08;
  if (pdu.flags?.isType === "L1_L2" || pdu.flags?.isType === 3) flagsByte |= 0x03;
  else if (pdu.flags?.isType === "L2" || pdu.flags?.isType === 2) flagsByte |= 0x02;
  else flagsByte |= 0x01;
  bytes.push(flagsByte);

  // TLVs
  for (const tlv of pdu.tlvs) {
    bytes.push(tlv.type, tlv.length);
    for (let i = 0; i < tlv.length; i++) {
      bytes.push((tlv.type * 7 + i * 13) & 0xff);
    }
  }

  // Format into 16-byte offset lines
  for (let i = 0; i < bytes.length; i += 16) {
    const chunk = bytes.slice(i, i + 16);
    const hex = chunk
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(" ");
    const ascii = chunk
      .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : "."))
      .join("");
    const offset = i.toString(16).padStart(4, "0");
    lines.push(`${offset}   ${hex.padEnd(48, " ")}   ${ascii}`);
  }

  return lines;
}

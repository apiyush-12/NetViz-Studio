/**
 * RIP (Routing Information Protocol - RFC 1058 / RFC 2453)
 * Pure Algorithmic Engine & Bellman-Ford Vector Logic
 */

import type {
  RipPacketData,
  RipRouteTableEntry,
  RipRoutingTableRecord,
  RipNode,
  RipInterface,
  RipVersion,
  RipAuthType,
} from "./rip.types";

/**
 * Creates a standard RFC 2453 / RFC 1058 RIP Response Packet containing Route Table Entries.
 */
export function createRipResponsePacket(params: {
  version: RipVersion;
  sourceIp: string;
  destIp?: string;
  entries: RipRouteTableEntry[];
  authType?: RipAuthType;
  routingDomain?: number;
}): RipPacketData {
  const isV1 = params.version === "ripv1";
  const defaultDestIp = isV1 ? "255.255.255.255" : "224.0.0.9";
  const versionNum = isV1 ? 1 : 2;

  // Header = 4 bytes; Each RTE = 20 bytes; Optional Auth Entry = 20 bytes
  let packetLength = 4 + params.entries.length * 20;
  if (params.authType && params.authType !== "none") {
    packetLength += 20;
  }

  return {
    command: 2, // Response
    version: versionNum,
    routingDomain: params.routingDomain || 0,
    entries: params.entries,
    auth:
      params.authType && params.authType !== "none"
        ? {
            type: params.authType,
            password: params.authType === "simple_password" ? "cisco123" : "md5_hash_key_1",
          }
        : undefined,
    sourceIp: params.sourceIp,
    destIp: params.destIp || defaultDestIp,
    sourcePort: 520,
    destPort: 520,
    packetLength,
  };
}

/**
 * Creates a RIP Request Packet (Query for full routing table or specific routes)
 */
export function createRipRequestPacket(params: {
  version: RipVersion;
  sourceIp: string;
  destIp?: string;
}): RipPacketData {
  const isV1 = params.version === "ripv1";
  const defaultDestIp = isV1 ? "255.255.255.255" : "224.0.0.9";

  // RFC 2453: A general request has AFI=0, Metric=16, IP=0.0.0.0
  const generalQueryEntry: RipRouteTableEntry = {
    addressFamily: 0,
    routeTag: 0,
    ipAddress: "0.0.0.0",
    subnetMask: "0.0.0.0",
    nextHop: "0.0.0.0",
    metric: 16,
  };

  return {
    command: 1, // Request
    version: isV1 ? 1 : 2,
    routingDomain: 0,
    entries: [generalQueryEntry],
    sourceIp: params.sourceIp,
    destIp: params.destIp || defaultDestIp,
    sourcePort: 520,
    destPort: 520,
    packetLength: 24,
  };
}

/**
 * Filter and formulate Route Table Entries for an outbound interface
 * applying RFC 2453 Section 3.4.3 Split Horizon and Poison Reverse rules.
 */
export function formulateOutboundRipEntries(params: {
  node: RipNode;
  outboundInterface: RipInterface;
  splitHorizon: boolean;
  poisonReverse: boolean;
  version: RipVersion;
}): RipRouteTableEntry[] {
  const { node, outboundInterface, splitHorizon, poisonReverse, version } = params;
  const entries: RipRouteTableEntry[] = [];

  for (const route of node.routingTable) {
    if (route.state === "flushed") continue;

    // Is this route learned on the same interface we are advertising out of?
    const learnedOnSameInterface = route.interfaceName === outboundInterface.name;

    let advertisedMetric = route.metric;

    if (learnedOnSameInterface) {
      if (splitHorizon && !poisonReverse) {
        // Plain Split Horizon: Suppress advertising this route back out
        continue;
      } else if (splitHorizon && poisonReverse) {
        // Poison Reverse: Advertise back with metric 16 (Infinity)
        advertisedMetric = 16;
      }
    }

    // RIPv1 zeroes out subnet mask and next hop
    const isV1 = version === "ripv1";

    entries.push({
      addressFamily: 2, // IP
      routeTag: isV1 ? 0 : route.tag || 0,
      ipAddress: route.network,
      subnetMask: isV1 ? "0.0.0.0" : route.subnetMask,
      nextHop: isV1 ? "0.0.0.0" : "0.0.0.0",
      metric: Math.min(16, advertisedMetric),
    });
  }

  return entries;
}

/**
 * Process incoming RIP Response updates at a router according to the Bellman-Ford algorithm.
 * Returns an array of modifications made to the router's routing table.
 */
export function processIncomingRipUpdate(params: {
  node: RipNode;
  inboundInterface: RipInterface;
  senderIp: string;
  entries: RipRouteTableEntry[];
}): {
  updatedTable: RipRoutingTableRecord[];
  changes: string[];
} {
  const { node, inboundInterface, senderIp, entries } = params;
  const updatedTable: RipRoutingTableRecord[] = JSON.parse(JSON.stringify(node.routingTable));
  const changes: string[] = [];

  for (const entry of entries) {
    if (entry.addressFamily === 0xFFFF) continue; // Skip auth entry

    // Bellman-Ford relaxation: add 1 hop cost
    const learnedMetric = Math.min(16, entry.metric + 1);
    const network = entry.ipAddress;
    const subnetMask = entry.subnetMask || "255.255.255.0";
    const prefix = `${network}/${maskToCidr(subnetMask)}`;

    const existingIndex = updatedTable.findIndex((r) => r.network === network);

    if (existingIndex === -1) {
      // New destination prefix discovered!
      if (learnedMetric < 16) {
        updatedTable.push({
          network,
          prefix,
          subnetMask,
          nextHop: entry.nextHop !== "0.0.0.0" ? entry.nextHop : senderIp,
          interfaceName: inboundInterface.name,
          metric: learnedMetric,
          routeType: "R",
          adminDistance: 120,
          ageSeconds: 0,
          state: "valid",
          tag: entry.routeTag,
        });
        changes.push(`Installed new route to ${prefix} via ${senderIp} [120/${learnedMetric}]`);
      }
    } else {
      const currentRoute = updatedTable[existingIndex];

      // Never overwrite directly connected routes (admin distance 0)
      if (currentRoute.routeType === "C") {
        continue;
      }

      const isCurrentNextHop = currentRoute.nextHop === senderIp;

      if (isCurrentNextHop) {
        // Update from the current next-hop router: always accept new metric
        if (learnedMetric === 16) {
          if (currentRoute.state !== "poisoned") {
            currentRoute.metric = 16;
            currentRoute.state = "poisoned";
            currentRoute.ageSeconds = 0;
            changes.push(`Poisoned route to ${prefix} via ${senderIp} (Metric 16 - Inaccessible)`);
          }
        } else if (currentRoute.metric !== learnedMetric) {
          const oldMetric = currentRoute.metric;
          currentRoute.metric = learnedMetric;
          currentRoute.ageSeconds = 0;
          currentRoute.state = "valid";
          changes.push(`Updated metric for ${prefix} via ${senderIp}: ${oldMetric} -> ${learnedMetric}`);
        } else {
          // Route refresh
          currentRoute.ageSeconds = 0;
        }
      } else {
        // Update from a different router: accept only if strictly better metric
        if (learnedMetric < currentRoute.metric && learnedMetric < 16) {
          const oldMetric = currentRoute.metric;
          const oldHop = currentRoute.nextHop;
          currentRoute.metric = learnedMetric;
          currentRoute.nextHop = entry.nextHop !== "0.0.0.0" ? entry.nextHop : senderIp;
          currentRoute.interfaceName = inboundInterface.name;
          currentRoute.ageSeconds = 0;
          currentRoute.state = "valid";
          changes.push(`Better route found for ${prefix}: via ${senderIp} [${learnedMetric}] (was via ${oldHop} [${oldMetric}])`);
        }
      }
    }
  }

  return { updatedTable, changes };
}

/**
 * Convert dotted decimal subnet mask to CIDR prefix length (e.g. 255.255.255.0 -> 24)
 */
export function maskToCidr(mask: string): number {
  if (!mask || mask === "0.0.0.0") return 24;
  return mask
    .split(".")
    .map(Number)
    .reduce((acc, octet) => acc + (octet.toString(2).match(/1/g) || []).length, 0);
}

/**
 * Format RIP packet data into standard Wireshark Hex Dump representation
 */
export function formatRipHexDump(packet: RipPacketData): string[] {
  const lines: string[] = [];
  const bytes: number[] = [];

  // IP Header pseudo start
  bytes.push(0x45, 0x00, 0x00, packet.packetLength + 28);
  bytes.push(0x1a, 0x2b, 0x00, 0x00);
  bytes.push(0x02, 0x11); // TTL=2, Protocol=17 (UDP)
  bytes.push(0x00, 0x00); // Checksum placeholder

  // Source IP (e.g. 10.0.1.1)
  packet.sourceIp.split(".").forEach((o) => bytes.push(Number(o)));
  // Dest IP (e.g. 224.0.0.9)
  packet.destIp.split(".").forEach((o) => bytes.push(Number(o)));

  // UDP Header: Port 520 (0x0208) -> Port 520 (0x0208)
  bytes.push(0x02, 0x08, 0x02, 0x08);
  bytes.push(0x00, packet.packetLength + 8);
  bytes.push(0x00, 0x00);

  // RIP Header: Command, Version, Domain
  bytes.push(packet.command);
  bytes.push(packet.version);
  bytes.push((packet.routingDomain >> 8) & 0xff, packet.routingDomain & 0xff);

  // RTEs
  for (const rte of packet.entries) {
    bytes.push((rte.addressFamily >> 8) & 0xff, rte.addressFamily & 0xff);
    bytes.push((rte.routeTag >> 8) & 0xff, rte.routeTag & 0xff);
    rte.ipAddress.split(".").forEach((o) => bytes.push(Number(o)));
    rte.subnetMask.split(".").forEach((o) => bytes.push(Number(o)));
    rte.nextHop.split(".").forEach((o) => bytes.push(Number(o)));
    bytes.push(
      (rte.metric >> 24) & 0xff,
      (rte.metric >> 16) & 0xff,
      (rte.metric >> 8) & 0xff,
      rte.metric & 0xff
    );
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

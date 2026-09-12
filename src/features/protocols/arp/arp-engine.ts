import type {
  ArpNode,
  ArpCacheEntry,
  ArpPacketData,
  ArpOpCode,
} from "./arp.types";

export function ipToNumber(ip: string): number {
  return ip
    .split(".")
    .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

export function isSameSubnet(ip1: string, ip2: string, mask: string = "255.255.255.0"): boolean {
  try {
    const num1 = ipToNumber(ip1);
    const num2 = ipToNumber(ip2);
    const numMask = ipToNumber(mask);
    return (num1 & numMask) === (num2 & numMask);
  } catch {
    return false;
  }
}

export function createArpPacket(params: {
  opcode: ArpOpCode;
  senderMac: string;
  senderIp: string;
  targetMac: string;
  targetIp: string;
  destEthernetMac?: string;
  sourceEthernetMac?: string;
  isGratuitous?: boolean;
  isProxy?: boolean;
  isPoisoned?: boolean;
}): ArpPacketData {
  const isRequest = params.opcode === 1 || params.opcode === 3;
  const destEth = params.destEthernetMac || (isRequest ? "FF:FF:FF:FF:FF:FF" : params.targetMac);
  const srcEth = params.sourceEthernetMac || params.senderMac;

  return {
    id: `arp-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    hardwareType: 1, // Ethernet
    protocolType: 0x0800, // IPv4
    hardwareSize: 6, // 6-byte MAC
    protocolSize: 4, // 4-byte IPv4
    opcode: params.opcode,
    senderMac: params.senderMac,
    senderIp: params.senderIp,
    targetMac: params.targetMac,
    targetIp: params.targetIp,
    destEthernetMac: destEth,
    sourceEthernetMac: srcEth,
    isGratuitous: params.isGratuitous,
    isProxy: params.isProxy,
    isPoisoned: params.isPoisoned,
  };
}

export function lookupArpCache(node: ArpNode, ip: string): ArpCacheEntry | undefined {
  return node.arpCache.find((e) => e.ipAddress === ip);
}

export function updateArpCache(
  node: ArpNode,
  update: {
    ipAddress: string;
    macAddress: string;
    interfaceName?: string;
    type?: "dynamic" | "static" | "incomplete";
    state?: "resolved" | "pending" | "poisoned" | "validated";
    ttlSeconds?: number;
  }
): void {
  const existingIndex = node.arpCache.findIndex((e) => e.ipAddress === update.ipAddress);
  const newEntry: ArpCacheEntry = {
    ipAddress: update.ipAddress,
    macAddress: update.macAddress,
    interfaceName: update.interfaceName || "eth0",
    type: update.type || "dynamic",
    state: update.state || "resolved",
    ageSeconds: 0,
    ttlSeconds: update.ttlSeconds || 300,
  };

  if (existingIndex >= 0) {
    node.arpCache[existingIndex] = newEntry;
  } else {
    node.arpCache.push(newEntry);
  }
}

export function updateSwitchMacTable(switchNode: ArpNode, port: string, mac: string): void {
  if (!switchNode.macTable) {
    switchNode.macTable = {};
  }
  switchNode.macTable[port] = mac;
}

export function formatArpSummary(packet: ArpPacketData): string {
  if (packet.isGratuitous) {
    return `Gratuitous ARP (Announcement/Probe): ${packet.senderIp} is at ${packet.senderMac}`;
  }
  if (packet.isPoisoned) {
    return `[SPOOFED] ARP Reply: ${packet.senderIp} claimed by rogue MAC ${packet.senderMac}`;
  }
  if (packet.isProxy) {
    return `Proxy ARP Reply: ${packet.senderIp} answered by Gateway Router ${packet.senderMac}`;
  }
  if (packet.opcode === 1) {
    return `ARP Request: Who has ${packet.targetIp}? Tell ${packet.senderIp} (${packet.senderMac})`;
  }
  if (packet.opcode === 2) {
    return `ARP Reply: ${packet.senderIp} is at ${packet.senderMac} (sent to ${packet.targetMac})`;
  }
  return `ARP Frame: Opcode=${packet.opcode}`;
}

export function ipToHex(ip: string): string {
  try {
    return ip
      .split(".")
      .map((octet) => parseInt(octet, 10).toString(16).padStart(2, "0").toUpperCase())
      .join("");
  } catch {
    return "00000000";
  }
}

export function macToHexBytes(mac: string): string[] {
  try {
    const cleaned = mac.replace(/[:-]/g, "");
    const bytes: string[] = [];
    for (let i = 0; i < cleaned.length; i += 2) {
      bytes.push(cleaned.substring(i, i + 2).toUpperCase());
    }
    while (bytes.length < 6) {
      bytes.push("00");
    }
    return bytes.slice(0, 6);
  } catch {
    return ["00", "00", "00", "00", "00", "00"];
  }
}


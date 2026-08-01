import type { AddressType } from "./cidr-types";
import { ipToBigInt } from "./ipv4-parser";

interface Range {
  start: bigint;
  end: bigint;
  type: AddressType;
}

const SPECIAL_RANGES: Range[] = [
  { start: 0n, end: 0n, type: "reserved" },
  { start: ipToBigInt("10.0.0.0")!, end: ipToBigInt("10.255.255.255")!, type: "private" },
  { start: ipToBigInt("127.0.0.0")!, end: ipToBigInt("127.255.255.255")!, type: "loopback" },
  { start: ipToBigInt("169.254.0.0")!, end: ipToBigInt("169.254.255.255")!, type: "link-local" },
  { start: ipToBigInt("172.16.0.0")!, end: ipToBigInt("172.31.255.255")!, type: "private" },
  { start: ipToBigInt("192.0.0.0")!, end: ipToBigInt("192.0.0.255")!, type: "reserved" },
  { start: ipToBigInt("192.0.2.0")!, end: ipToBigInt("192.0.2.255")!, type: "documentation" },
  { start: ipToBigInt("192.168.0.0")!, end: ipToBigInt("192.168.255.255")!, type: "private" },
  { start: ipToBigInt("198.18.0.0")!, end: ipToBigInt("198.19.255.255")!, type: "documentation" },
  { start: ipToBigInt("198.51.100.0")!, end: ipToBigInt("198.51.100.255")!, type: "documentation" },
  { start: ipToBigInt("203.0.113.0")!, end: ipToBigInt("203.0.113.255")!, type: "documentation" },
  { start: ipToBigInt("224.0.0.0")!, end: ipToBigInt("239.255.255.255")!, type: "multicast" },
  { start: ipToBigInt("240.0.0.0")!, end: ipToBigInt("255.255.255.254")!, type: "reserved" },
  { start: ipToBigInt("255.255.255.255")!, end: ipToBigInt("255.255.255.255")!, type: "limited-broadcast" },
];

export function classifyAddress(ip: string): AddressType[] {
  const num = ipToBigInt(ip);
  if (num === null) return ["reserved"];

  const types: AddressType[] = [];
  for (const range of SPECIAL_RANGES) {
    if (num >= range.start && num <= range.end) {
      types.push(range.type);
    }
  }

  if (types.length === 0) {
    types.push("public");
  }

  return [...new Set(types)];
}

export function getLegacyClass(firstOctet: number): "A" | "B" | "C" | "D" | "E" | "N/A" {
  if (firstOctet >= 1 && firstOctet <= 126) return "A";
  if (firstOctet === 127) return "N/A";
  if (firstOctet >= 128 && firstOctet <= 191) return "B";
  if (firstOctet >= 192 && firstOctet <= 223) return "C";
  if (firstOctet >= 224 && firstOctet <= 239) return "D";
  if (firstOctet >= 240 && firstOctet <= 255) return "E";
  return "N/A";
}

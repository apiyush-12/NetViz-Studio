import type { CidrError } from "./cidr-types";

const OCTET_REGEX = /^(\d{1,3})$/;

export function isValidOctet(octet: string): boolean {
  if (!OCTET_REGEX.test(octet)) return false;
  const num = parseInt(octet, 10);
  return num >= 0 && num <= 255;
}

export function ipToBigInt(ip: string): bigint | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  if (!parts.every(isValidOctet)) return null;

  let result = 0n;
  for (const part of parts) {
    result = (result << 8n) | BigInt(parseInt(part, 10));
  }
  return result & 0xffffffffn;
}

export function bigIntToIp(num: bigint): string {
  const n = num & 0xffffffffn;
  const o1 = Number((n >> 24n) & 0xffn);
  const o2 = Number((n >> 16n) & 0xffn);
  const o3 = Number((n >> 8n) & 0xffn);
  const o4 = Number(n & 0xffn);
  return `${o1}.${o2}.${o3}.${o4}`;
}

export function ipToBinary(ip: string): string | null {
  const num = ipToBigInt(ip);
  if (num === null) return null;
  return num.toString(2).padStart(32, "0");
}

export function binaryToDottedBinary(binary: string): string {
  const chunks: string[] = [];
  for (let i = 0; i < 32; i += 8) {
    chunks.push(binary.slice(i, i + 8));
  }
  return chunks.join(".");
}

export function parsePrefixLength(value: string | number): number | null {
  const num = typeof value === "number" ? value : parseInt(value, 10);
  if (isNaN(num) || num < 0 || num > 32) return null;
  return num;
}

export function maskToPrefix(mask: string): number | null {
  const num = ipToBigInt(mask);
  if (num === null) return null;

  let prefix = 0;
  let foundZero = false;
  for (let i = 31; i >= 0; i--) {
    const bit = (num >> BigInt(i)) & 1n;
    if (bit === 1n) {
      if (foundZero) return null;
      prefix++;
    } else {
      foundZero = true;
    }
  }
  return prefix;
}

export interface ParsedCidrInput {
  ip: string;
  prefix: number;
}

export function parseCidrInput(input: string): ParsedCidrInput | CidrError {
  const trimmed = input.trim();

  if (trimmed.includes("/")) {
    const [ipPart, prefixPart] = trimmed.split("/");
    if (!ipPart || prefixPart === undefined) {
      return { isValid: false, message: "Invalid CIDR notation", field: "input" };
    }
    const ipNum = ipToBigInt(ipPart);
    if (ipNum === null) {
      return { isValid: false, message: "Invalid IP address octets (0-255)", field: "ip" };
    }
    const prefix = parsePrefixLength(prefixPart);
    if (prefix === null) {
      return { isValid: false, message: "Prefix length must be 0-32", field: "prefix" };
    }
    return { ip: ipPart, prefix };
  }

  const ipNum = ipToBigInt(trimmed);
  if (ipNum === null) {
    return { isValid: false, message: "Invalid IP address", field: "ip" };
  }

  const prefix = maskToPrefix(trimmed);
  if (prefix !== null) {
    return { ip: "0.0.0.0", prefix };
  }

  return { isValid: false, message: "Use CIDR notation (e.g. 192.168.1.10/24) or provide prefix separately", field: "input" };
}

export function parseIpAndPrefix(
  ipInput: string,
  prefixInput: string | number
): ParsedCidrInput | CidrError {
  const ip = ipInput.trim();
  const ipNum = ipToBigInt(ip);
  if (ipNum === null) {
    return { isValid: false, message: "Invalid IP address octets (0-255)", field: "ip" };
  }

  const prefixStr = String(prefixInput).trim();
  if (prefixStr.includes(".")) {
    const prefix = maskToPrefix(prefixStr);
    if (prefix === null) {
      return { isValid: false, message: "Subnet mask must be contiguous (valid prefix mask)", field: "prefix" };
    }
    return { ip, prefix };
  }

  const prefix = parsePrefixLength(prefixStr);
  if (prefix === null) {
    return { isValid: false, message: "Prefix length must be 0-32", field: "prefix" };
  }
  return { ip, prefix };
}

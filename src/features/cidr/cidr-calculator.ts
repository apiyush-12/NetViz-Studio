import type { CidrCalculation, CidrResult } from "./cidr-types";
import {
  ipToBigInt,
  bigIntToIp,
  ipToBinary,
  binaryToDottedBinary,
  parseCidrInput,
  parseIpAndPrefix,
} from "./ipv4-parser";
import { classifyAddress, getLegacyClass } from "./address-classifier";

function prefixToMask(prefix: number): bigint {
  if (prefix === 0) return 0n;
  if (prefix === 32) return 0xffffffffn;
  return (0xffffffffn << BigInt(32 - prefix)) & 0xffffffffn;
}

function calculateUsableHosts(
  prefix: number,
  network: bigint,
  broadcast: bigint
): { first: string | null; last: string | null; count: bigint } {
  const total = prefix >= 32 ? 1n : 1n << BigInt(32 - prefix);

  if (prefix === 32) {
    return { first: bigIntToIp(network), last: bigIntToIp(network), count: 1n };
  }

  if (prefix === 31) {
    return {
      first: bigIntToIp(network),
      last: bigIntToIp(broadcast),
      count: 2n,
    };
  }

  if (prefix >= 30) {
    return {
      first: bigIntToIp(network + 1n),
      last: bigIntToIp(broadcast - 1n),
      count: total > 2n ? total - 2n : 0n,
    };
  }

  if (total <= 2n) {
    return { first: null, last: null, count: 0n };
  }

  return {
    first: bigIntToIp(network + 1n),
    last: bigIntToIp(broadcast - 1n),
    count: total - 2n,
  };
}

function buildResult(ip: string, prefix: number, inputLabel: string): CidrResult {
  const ipNum = ipToBigInt(ip)!;
  const mask = prefixToMask(prefix);
  const network = ipNum & mask;
  const wildcard = (~mask) & 0xffffffffn;
  const broadcast = network | wildcard;
  const hostBits = 32 - prefix;
  const total = hostBits >= 32 ? 1n : 1n << BigInt(hostBits);
  const usable = calculateUsableHosts(prefix, network, broadcast);
  const ipBinary = ipToBinary(ip)!;
  const maskBinary = mask.toString(2).padStart(32, "0");
  const firstOctet = parseInt(ip.split(".")[0] ?? "0", 10);

  const usableRange =
    usable.first && usable.last
      ? `${usable.first} – ${usable.last}`
      : prefix === 32
        ? bigIntToIp(network)
        : "None (network too small for traditional host assignment)";

  return {
    isValid: true,
    input: inputLabel,
    ipAddress: ip,
    prefixLength: prefix,
    cidrNotation: `${bigIntToIp(network)}/${prefix}`,
    ipBinary: binaryToDottedBinary(ipBinary),
    subnetMask: bigIntToIp(mask),
    subnetMaskBinary: binaryToDottedBinary(maskBinary),
    wildcardMask: bigIntToIp(wildcard),
    networkAddress: bigIntToIp(network),
    broadcastAddress: bigIntToIp(broadcast),
    firstUsableHost: usable.first,
    lastUsableHost: usable.last,
    totalAddresses: total.toString(),
    usableHostCount: usable.count.toString(),
    usableRange,
    networkBits: prefix,
    hostBits,
    addressTypes: classifyAddress(ip),
    legacyClass: getLegacyClass(firstOctet),
    isPointToPoint: prefix === 31,
    isHostRoute: prefix === 32,
  };
}

export function calculateCidr(input: string): CidrCalculation {
  const parsed = parseCidrInput(input);
  if ("isValid" in parsed && parsed.isValid === false) return parsed;
  const { ip, prefix } = parsed as { ip: string; prefix: number };
  return buildResult(ip, prefix, input.trim());
}

export function calculateCidrFromParts(
  ip: string,
  prefixOrMask: string | number
): CidrCalculation {
  const parsed = parseIpAndPrefix(ip, prefixOrMask);
  if ("isValid" in parsed && parsed.isValid === false) return parsed;
  const { ip: validIp, prefix } = parsed as { ip: string; prefix: number };
  const label =
    typeof prefixOrMask === "string" && prefixOrMask.includes(".")
      ? `${validIp} (mask ${prefixOrMask})`
      : `${validIp}/${prefix}`;
  return buildResult(validIp, prefix, label);
}

export function areSameSubnet(
  ip1: string,
  ip2: string,
  prefixOrMask: string | number
): CidrCalculation & { sameSubnet?: boolean; ip1Network?: string; ip2Network?: string } {
  const parsed = parseIpAndPrefix(ip1, prefixOrMask);
  if ("isValid" in parsed && parsed.isValid === false) return parsed;

  const { prefix } = parsed as { ip: string; prefix: number };
  const num1 = ipToBigInt(ip1);
  const num2 = ipToBigInt(ip2);

  if (num1 === null) {
    return { isValid: false, message: "Invalid first IP address", field: "ip1" };
  }
  if (num2 === null) {
    return { isValid: false, message: "Invalid second IP address", field: "ip2" };
  }

  const mask = prefixToMask(prefix);
  const net1 = num1 & mask;
  const net2 = num2 & mask;

  const base = buildResult(ip1, prefix, `${ip1}/${prefix}`);
  return {
    ...base,
    sameSubnet: net1 === net2,
    ip1Network: bigIntToIp(net1),
    ip2Network: bigIntToIp(net2),
  };
}

export function splitSubnet(
  baseNetwork: string,
  newPrefix: number
): CidrCalculation | { isValid: true; subnets: CidrResult[] } {
  const parsed = parseCidrInput(baseNetwork);
  if ("isValid" in parsed && parsed.isValid === false) return parsed;

  const { ip, prefix: basePrefix } = parsed as { ip: string; prefix: number };
  if (newPrefix <= basePrefix) {
    return {
      isValid: false,
      message: `New prefix /${newPrefix} must be longer than base /${basePrefix}`,
      field: "prefix",
    };
  }

  const count = 1 << (newPrefix - basePrefix);
  const baseNum = ipToBigInt(ip)!;
  const baseMask = prefixToMask(basePrefix);
  const network = baseNum & baseMask;
  const blockSize = 1n << BigInt(32 - newPrefix);

  const subnets: CidrResult[] = [];
  for (let i = 0; i < count; i++) {
    const subnetNet = network + BigInt(i) * blockSize;
    subnets.push(buildResult(bigIntToIp(subnetNet), newPrefix, `${bigIntToIp(subnetNet)}/${newPrefix}`));
  }

  return { isValid: true, subnets };
}

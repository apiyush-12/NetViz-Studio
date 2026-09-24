import type {
  MplsShimHeader,
  MplsPacketData,
  MplsNode,
  LfibEntry,
  FibEntry,
  VrfTable,
  TtlPropagationMode,
  MplsOperation,
} from "./mpls.types";

/**
 * Creates an RFC 3032 32-bit MPLS Shim Header object.
 */
export function createMplsShimHeader(
  label: number,
  trafficClass: number = 0,
  bottomOfStack: boolean = true,
  ttl: number = 64,
  labelName?: string
): MplsShimHeader {
  // Clamp values to RFC 3032 bit boundaries
  const validLabel = Math.max(0, Math.min(1048575, label));
  const validTc = Math.max(0, Math.min(7, trafficClass));
  const validTtl = Math.max(1, Math.min(255, ttl));

  return {
    label: validLabel,
    trafficClass: validTc,
    bottomOfStack,
    ttl: validTtl,
    labelName: labelName ?? `Label ${validLabel}`,
  };
}

/**
 * Pushes a new label onto the top of the label stack (Index 0 is top).
 * Updates the previous top label's bottomOfStack flag if necessary.
 */
export function pushLabel(
  currentStack: MplsShimHeader[],
  newLabel: number,
  trafficClass: number = 0,
  ttl: number = 64,
  labelName?: string
): MplsShimHeader[] {
  const isFirstLabel = currentStack.length === 0;

  // New label at top of stack is NOT bottom of stack if other labels exist below it
  const newHeader = createMplsShimHeader(
    newLabel,
    trafficClass,
    isFirstLabel,
    ttl,
    labelName
  );

  // If we already had labels, ensure the bottom label remains marked as bottom
  const updatedOldStack = currentStack.map((shim, idx) => ({
    ...shim,
    bottomOfStack: idx === currentStack.length - 1,
  }));

  return [newHeader, ...updatedOldStack];
}

/**
 * Swaps the top label in the label stack with a new label (e.g. 101 -> 201).
 */
export function swapTopLabel(
  currentStack: MplsShimHeader[],
  newLabel: number,
  labelName?: string
): MplsShimHeader[] {
  if (currentStack.length === 0) {
    return [createMplsShimHeader(newLabel, 0, true, 64, labelName)];
  }

  const [top, ...rest] = currentStack;
  const swappedTop: MplsShimHeader = {
    ...top,
    label: newLabel,
    labelName: labelName ?? `Label ${newLabel}`,
  };

  return [swappedTop, ...rest];
}

/**
 * Pops the top label from the label stack.
 */
export function popTopLabel(currentStack: MplsShimHeader[]): MplsShimHeader[] {
  if (currentStack.length <= 1) {
    return [];
  }
  const [, ...rest] = currentStack;
  return rest;
}

/**
 * Performs Penultimate Hop Popping (PHP) - removes the outer transport label.
 */
export function applyPenultimateHopPopping(currentStack: MplsShimHeader[]): MplsShimHeader[] {
  return popTopLabel(currentStack);
}

/**
 * Encodes an RFC 3032 32-bit shim header into a 4-byte integer and byte array.
 * Bits 0-19: Label (20 bits)
 * Bits 20-22: Traffic Class / EXP (3 bits)
 * Bit 23: Bottom of Stack (1 bit)
 * Bits 24-31: Time to Live (8 bits)
 */
export function encodeShimHeaderToBytes(shim: MplsShimHeader): {
  raw32: number;
  hex: string;
  bytes: [number, number, number, number];
} {
  const labelPart = (shim.label & 0xfffff) << 12;
  const expPart = (shim.trafficClass & 0x7) << 9;
  const sPart = (shim.bottomOfStack ? 1 : 0) << 8;
  const ttlPart = shim.ttl & 0xff;

  const raw32 = (labelPart | expPart | sPart | ttlPart) >>> 0;
  const b0 = (raw32 >>> 24) & 0xff;
  const b1 = (raw32 >>> 16) & 0xff;
  const b2 = (raw32 >>> 8) & 0xff;
  const b3 = raw32 & 0xff;

  const hex = raw32.toString(16).padStart(8, "0").toUpperCase();

  return {
    raw32,
    hex,
    bytes: [b0, b1, b2, b3],
  };
}

/**
 * Generates an RFC wire hex dump representation of the packet including Ethernet II, MPLS Shim(s), and IP.
 */
export function formatMplsHexDump(packet: MplsPacketData): string {
  const lines: string[] = [];

  // Ethernet II Frame Header (14 bytes)
  lines.push("0000   00 1a 2b 3c 4d 5e  00 11 22 33 44 55  88 47");
  // 88 47 = MPLS Unicast EtherType (or 08 00 for native IP if no labels)

  let offset = 14;
  if (packet.labelStack.length > 0) {
    packet.labelStack.forEach((shim, idx) => {
      const { hex } = encodeShimHeaderToBytes(shim);
      const b0 = hex.slice(0, 2);
      const b1 = hex.slice(2, 4);
      const b2 = hex.slice(4, 6);
      const b3 = hex.slice(6, 8);
      const hexLine = `${offset.toString(16).padStart(4, "0")}   ${b0} ${b1} ${b2} ${b3}  [MPLS Shim ${idx + 1}: Label=${shim.label}, TC=${shim.trafficClass}, S=${shim.bottomOfStack ? 1 : 0}, TTL=${shim.ttl}]`;
      lines.push(hexLine);
      offset += 4;
    });
  }

  // IPv4 Header (20 bytes)
  lines.push(
    `${offset.toString(16).padStart(4, "0")}   45 00 00 3c  1a 2b 00 00  ${packet.ipTtl.toString(16).padStart(2, "0")} 01 a1 b2  0a 01 01 02`
  );
  offset += 16;
  lines.push(`${offset.toString(16).padStart(4, "0")}   0a 02 02 02  08 00 f7 24  00 01 00 01  [IP: ${packet.sourceIp} -> ${packet.destIp}, Payload: ${packet.payloadType}]`);

  return lines.join("\n");
}

/**
 * Looks up incoming label in a router's LFIB table.
 */
export function lookupLfib(node: MplsNode, inLabel: number): LfibEntry | undefined {
  return node.lfib.find((entry) => entry.inLabel === inLabel);
}

/**
 * Looks up destination IP in a router's IP FIB (CEF table).
 */
export function lookupFib(node: MplsNode, destIp: string): FibEntry | undefined {
  // Exact match or default route
  return (
    node.fib.find((entry) => destIp.startsWith(entry.prefix.split("/")[0].slice(0, 7))) ||
    node.fib.find((entry) => entry.prefix === "0.0.0.0/0") ||
    node.fib[0]
  );
}

/**
 * Looks up customer destination in a VRF table on a PE router.
 */
export function lookupVrf(node: MplsNode, vrfName: string): VrfTable | undefined {
  return node.vrfs?.find((v) => v.vrfName === vrfName);
}

/**
 * Handles TTL propagation based on RFC 3443 (Uniform vs Pipe mode).
 */
export function processTtl(
  currentIpTtl: number,
  currentMplsTtl: number,
  mode: TtlPropagationMode,
  operation: MplsOperation
): { newIpTtl: number; newMplsTtl: number } {
  if (mode === "uniform") {
    if (operation === "PUSH") {
      // Ingress: IP TTL is copied into MPLS TTL
      const decrementedIpTtl = Math.max(1, currentIpTtl - 1);
      return { newIpTtl: decrementedIpTtl, newMplsTtl: decrementedIpTtl };
    } else if (operation === "SWAP") {
      // Core: MPLS TTL decremented by 1, IP TTL untouched in packet
      const decrementedMplsTtl = Math.max(1, currentMplsTtl - 1);
      return { newIpTtl: currentIpTtl, newMplsTtl: decrementedMplsTtl };
    } else if (operation === "POP" || operation === "PHP") {
      // Egress: MPLS TTL copied back to IP TTL
      const decrementedMplsTtl = Math.max(1, currentMplsTtl - 1);
      return { newIpTtl: decrementedMplsTtl, newMplsTtl: decrementedMplsTtl };
    }
  } else if (mode === "pipe") {
    if (operation === "PUSH") {
      // Ingress: IP TTL decremented once for entering provider domain; MPLS TTL starts at 255
      const decrementedIpTtl = Math.max(1, currentIpTtl - 1);
      return { newIpTtl: decrementedIpTtl, newMplsTtl: 255 };
    } else if (operation === "SWAP") {
      // Core: MPLS TTL decremented; IP TTL untouched
      return { newIpTtl: currentIpTtl, newMplsTtl: Math.max(1, currentMplsTtl - 1) };
    } else if (operation === "POP" || operation === "PHP") {
      // Egress: IP TTL preserved, core hops invisible
      return { newIpTtl: currentIpTtl, newMplsTtl: Math.max(1, currentMplsTtl - 1) };
    }
  }

  return {
    newIpTtl: Math.max(1, currentIpTtl - 1),
    newMplsTtl: Math.max(1, currentMplsTtl - 1),
  };
}

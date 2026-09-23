import type {
  VlanFrameData,
  VlanSwitchPort,
  VlanNode,
  Dot1QHeader,
} from "./vlan.types";

export function createVlanFrame(params: {
  sourceMac: string;
  destMac: string;
  sourceIp: string;
  destIp: string;
  sourceVlanId: number;
  destVlanId?: number;
  payloadSummary: string;
  isTagged?: boolean;
  dot1q?: Dot1QHeader;
  isBroadcast?: boolean;
  isDoubleTagged?: boolean;
  innerVlanId?: number;
  ttl?: number;
}): VlanFrameData {
  return {
    id: `frame-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    sourceMac: params.sourceMac,
    destMac: params.destMac,
    etherType: params.sourceIp ? 0x0800 : 0x0806,
    sourceIp: params.sourceIp,
    destIp: params.destIp,
    payloadSummary: params.payloadSummary,
    isTagged: params.isTagged || false,
    dot1q: params.dot1q,
    sourceVlanId: params.sourceVlanId,
    destVlanId: params.destVlanId || params.sourceVlanId,
    isBroadcast: params.isBroadcast || params.destMac.toUpperCase() === "FF:FF:FF:FF:FF:FF",
    isDoubleTagged: params.isDoubleTagged || false,
    innerVlanId: params.innerVlanId,
    ttl: params.ttl ?? 64,
  };
}

export function tagFrame(
  frame: VlanFrameData,
  vlanId: number,
  pcp: number = 0,
  dei: boolean = false
): VlanFrameData {
  return {
    ...frame,
    isTagged: true,
    dot1q: {
      tpid: 0x8100, // IEEE 802.1Q EtherType
      pcp: Math.min(Math.max(pcp, 0), 7),
      dei: dei,
      vlanId: vlanId,
    },
    sourceVlanId: vlanId,
  };
}

export function stripTag(frame: VlanFrameData): VlanFrameData {
  return {
    ...frame,
    isTagged: false,
    dot1q: undefined,
  };
}

export function evaluateTrunkIngress(
  port: VlanSwitchPort,
  frame: VlanFrameData
): { allowed: boolean; effectiveVlanId: number; reason: string } {
  if (port.mode === "access") {
    // Access port receives untagged frame and assigns it to port PVID
    return {
      allowed: true,
      effectiveVlanId: port.pvid,
      reason: `Access port ${port.name} mapped untagged frame to PVID ${port.pvid}.`,
    };
  }

  // Trunk port processing
  if (frame.isTagged && frame.dot1q) {
    const vid = frame.dot1q.vlanId;
    if (port.allowedVlans.includes(vid)) {
      return {
        allowed: true,
        effectiveVlanId: vid,
        reason: `Trunk port ${port.name} accepted 802.1Q tagged frame with VID ${vid}.`,
      };
    } else {
      return {
        allowed: false,
        effectiveVlanId: vid,
        reason: `Trunk port ${port.name} DROPPED frame: VLAN ${vid} is not in Allowed List [${port.allowedVlans.join(", ")}].`,
      };
    }
  } else {
    // Untagged frame received on trunk -> mapped to Native VLAN
    const nativeVid = port.nativeVlanId || 1;
    return {
      allowed: true,
      effectiveVlanId: nativeVid,
      reason: `Trunk port ${port.name} mapped untagged frame to Native VLAN ${nativeVid}.`,
    };
  }
}

export function evaluateTrunkEgress(
  port: VlanSwitchPort,
  frame: VlanFrameData
): { isTagged: boolean; frame: VlanFrameData } {
  if (port.mode === "access") {
    // Always strip 802.1Q tag on egress to access host
    return {
      isTagged: false,
      frame: stripTag(frame),
    };
  }

  // Trunk port egress
  const frameVid = frame.dot1q ? frame.dot1q.vlanId : frame.sourceVlanId;
  const isNative = frameVid === (port.nativeVlanId || 1);

  if (isNative && !port.tagNative) {
    // Native VLAN transmitted untagged unless tagNative is enabled
    return {
      isTagged: false,
      frame: stripTag(frame),
    };
  } else {
    // Tag with 802.1Q header
    return {
      isTagged: true,
      frame: tagFrame(frame, frameVid),
    };
  }
}

export function getBroadcastFloodingPorts(
  switchNode: VlanNode,
  ingressPortId: string,
  vlanId: number
): VlanSwitchPort[] {
  if (!switchNode.ports) return [];

  return switchNode.ports.filter((port) => {
    if (port.id === ingressPortId) return false; // Do not flood back to ingress port

    if (port.mode === "access") {
      // Access port floods only if PVID matches frame VLAN ID
      return port.pvid === vlanId;
    }

    if (port.mode === "trunk") {
      // Trunk port floods only if VLAN is in Allowed VLANs list
      return port.allowedVlans.includes(vlanId);
    }

    return false;
  });
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

export function format8021QHexDump(frame: VlanFrameData): {
  offset: number;
  hex: string;
  fieldKey: string;
  fieldName: string;
}[] {
  const bytes: { offset: number; hex: string; fieldKey: string; fieldName: string }[] = [];
  let currentOffset = 0;

  // 1. Destination MAC (6 bytes)
  const destBytes = macToHexBytes(frame.destMac);
  destBytes.forEach((b) => {
    bytes.push({
      offset: currentOffset++,
      hex: b,
      fieldKey: "destMac",
      fieldName: "Destination MAC (48-bit)",
    });
  });

  // 2. Source MAC (6 bytes)
  const srcBytes = macToHexBytes(frame.sourceMac);
  srcBytes.forEach((b) => {
    bytes.push({
      offset: currentOffset++,
      hex: b,
      fieldKey: "sourceMac",
      fieldName: "Source MAC (48-bit)",
    });
  });

  // 3. 802.1Q Tag (4 bytes) if tagged
  if (frame.isTagged && frame.dot1q) {
    // TPID (0x81, 0x00) - 2 bytes
    bytes.push({
      offset: currentOffset++,
      hex: "81",
      fieldKey: "tpid",
      fieldName: "TPID: 0x8100 (IEEE 802.1Q Tag Protocol ID)",
    });
    bytes.push({
      offset: currentOffset++,
      hex: "00",
      fieldKey: "tpid",
      fieldName: "TPID: 0x8100 (IEEE 802.1Q Tag Protocol ID)",
    });

    // TCI (2 bytes): [PCP 3-bit][DEI 1-bit][VID 12-bit]
    const pcp = (frame.dot1q.pcp & 0x07) << 5; // top 3 bits
    const dei = (frame.dot1q.dei ? 1 : 0) << 4; // 4th bit
    const vidHigh = (frame.dot1q.vlanId >> 8) & 0x0f; // top 4 bits of VID
    const tciByte1 = (pcp | dei | vidHigh).toString(16).padStart(2, "0").toUpperCase();
    const tciByte2 = (frame.dot1q.vlanId & 0xff).toString(16).padStart(2, "0").toUpperCase();

    bytes.push({
      offset: currentOffset++,
      hex: tciByte1,
      fieldKey: "tci",
      fieldName: `TCI Byte 1 (PCP:${frame.dot1q.pcp}, DEI:${frame.dot1q.dei ? 1 : 0}, VID_High:${vidHigh})`,
    });
    bytes.push({
      offset: currentOffset++,
      hex: tciByte2,
      fieldKey: "tci",
      fieldName: `TCI Byte 2 (VID_Low: ${frame.dot1q.vlanId})`,
    });
  }

  // 4. EtherType (2 bytes)
  bytes.push({
    offset: currentOffset++,
    hex: "08",
    fieldKey: "ethertype",
    fieldName: "EtherType: 0x0800 (IPv4)",
  });
  bytes.push({
    offset: currentOffset++,
    hex: "00",
    fieldKey: "ethertype",
    fieldName: "EtherType: 0x0800 (IPv4)",
  });

  // 5. Sample IP Payload header (Source & Dest IP)
  const srcIpHex = ipToHex(frame.sourceIp || "192.168.10.10").match(/.{1,2}/g) || ["C0", "A8", "0A", "0A"];
  srcIpHex.forEach((b) => {
    bytes.push({
      offset: currentOffset++,
      hex: b,
      fieldKey: "payload",
      fieldName: `Payload (Source IP ${frame.sourceIp})`,
    });
  });

  const destIpHex = ipToHex(frame.destIp || "192.168.10.20").match(/.{1,2}/g) || ["C0", "A8", "0A", "14"];
  destIpHex.forEach((b) => {
    bytes.push({
      offset: currentOffset++,
      hex: b,
      fieldKey: "payload",
      fieldName: `Payload (Dest IP ${frame.destIp})`,
    });
  });

  return bytes;
}

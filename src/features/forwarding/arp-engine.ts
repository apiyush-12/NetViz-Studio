import { NetworkNode, ArpEntry } from "@/features/topology/topology-types";

export interface ArpResolutionResult {
  hit: boolean;
  macAddress: string | null;
  needsArpBroadcast: boolean;
  explanation: string;
  updatedArpCache: ArpEntry[];
}

export function resolveArpAddress(
  sourceNode: NetworkNode,
  targetIp: string,
  interfaceName: string
): ArpResolutionResult {
  const arpCache: ArpEntry[] = sourceNode.arpTable || [];
  const existing = arpCache.find((entry: ArpEntry) => entry.ipAddress === targetIp);

  if (existing) {
    return {
      hit: true,
      macAddress: existing.macAddress,
      needsArpBroadcast: false,
      explanation: `ARP cache HIT for IP ${targetIp}: resolved to MAC ${existing.macAddress} on interface ${interfaceName}.`,
      updatedArpCache: arpCache,
    };
  }

  return {
    hit: false,
    macAddress: null,
    needsArpBroadcast: true,
    explanation: `ARP cache MISS for IP ${targetIp}. Generating ARP Request broadcast (Who has ${targetIp}?) to resolve destination MAC.`,
    updatedArpCache: arpCache,
  };
}

export function updateArpCache(
  node: NetworkNode,
  ipAddress: string,
  macAddress: string,
  interfaceName: string,
  type: "dynamic" | "static" = "dynamic"
): ArpEntry[] {
  const currentTable: ArpEntry[] = [...(node.arpTable || [])];
  const index = currentTable.findIndex((entry: ArpEntry) => entry.ipAddress === ipAddress);

  if (index >= 0) {
    currentTable[index] = {
      ipAddress,
      macAddress,
      interfaceName,
      type,
      ageSeconds: 0,
    };
  } else {
    currentTable.push({
      ipAddress,
      macAddress,
      interfaceName,
      type,
      ageSeconds: 0,
    });
  }

  return currentTable;
}

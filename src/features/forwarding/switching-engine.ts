import { NetworkNode, MacTableEntry } from "@/features/topology/topology-types";

export interface SwitchingDecision {
  action: "forward" | "flood" | "filter" | "drop";
  targetPortNames: string[];
  explanation: string;
  updatedMacTable: MacTableEntry[];
}

export function processSwitchFrame(
  switchNode: NetworkNode,
  ingressPortName: string,
  sourceMac: string,
  destinationMac: string,
  vlanId: number = 1
): SwitchingDecision {
  const updatedMacTable: MacTableEntry[] = [...(switchNode.macTable || [])];

  const existingEntryIndex = updatedMacTable.findIndex((entry) => entry.macAddress === sourceMac);
  if (existingEntryIndex >= 0) {
    updatedMacTable[existingEntryIndex] = {
      ...updatedMacTable[existingEntryIndex],
      portName: ingressPortName,
      vlanId,
      remainingAgeSeconds: 300,
    };
  } else {
    updatedMacTable.push({
      macAddress: sourceMac,
      vlanId,
      portName: ingressPortName,
      type: "dynamic",
      remainingAgeSeconds: 300,
    });
  }

  const connectedPorts = switchNode.interfaces
    .filter((iface) => iface.administrativeState === "up" && iface.operationalState === "up")
    .map((iface) => iface.name);

  const outboundCandidatePorts = connectedPorts.filter((port) => port !== ingressPortName);

  if (destinationMac.toLowerCase() === "ff:ff:ff:ff:ff:ff" || destinationMac.startsWith("01:00:5e")) {
    return {
      action: "flood",
      targetPortNames: outboundCandidatePorts,
      explanation: `Destination MAC ${destinationMac} is broadcast/multicast. Flooding frame to all active ports on VLAN ${vlanId} except ingress port ${ingressPortName}. Learned source MAC ${sourceMac} on port ${ingressPortName}.`,
      updatedMacTable,
    };
  }

  const destEntry = updatedMacTable.find(
    (entry) => entry.macAddress.toLowerCase() === destinationMac.toLowerCase() && entry.vlanId === vlanId
  );

  if (destEntry) {
    if (destEntry.portName === ingressPortName) {
      return {
        action: "filter",
        targetPortNames: [],
        explanation: `Destination MAC ${destinationMac} is on the same port ${ingressPortName}. Filtering frame (dropped).`,
        updatedMacTable,
      };
    }
    return {
      action: "forward",
      targetPortNames: [destEntry.portName],
      explanation: `Known unicast MAC ${destinationMac} found in MAC table. Forwarding frame directly out port ${destEntry.portName}. Learned source MAC ${sourceMac} on port ${ingressPortName}.`,
      updatedMacTable,
    };
  }

  return {
    action: "flood",
    targetPortNames: outboundCandidatePorts,
    explanation: `Destination MAC ${destinationMac} not found in switch MAC table (Unknown Unicast). Flooding frame out all active ports on VLAN ${vlanId} except ${ingressPortName}. Learned source MAC ${sourceMac} on port ${ingressPortName}.`,
    updatedMacTable,
  };
}

import { NetworkTopology } from "@/features/topology/topology-types";
import { LabFault } from "../lab-types";

export function applyLabFaults(
  initialTopology: NetworkTopology,
  faults: LabFault[] = []
): NetworkTopology {
  const modifiedTopology: NetworkTopology = JSON.parse(JSON.stringify(initialTopology));

  faults.forEach((fault) => {
    if (fault.type === "wrong-ip" && fault.targetNodeId) {
      const node = modifiedTopology.nodes.find((n) => n.id === fault.targetNodeId);
      if (node && node.interfaces[0]?.ipv4) {
        node.interfaces[0].ipv4.address = "192.168.99.99"; // Incorrect subnet
      }
    } else if (fault.type === "wrong-gateway" && fault.targetNodeId) {
      const node = modifiedTopology.nodes.find((n) => n.id === fault.targetNodeId);
      if (node) {
        node.configuration.defaultGateway = "10.0.0.1"; // Invalid gateway
      }
    } else if (fault.type === "disabled-interface" && fault.targetNodeId) {
      const node = modifiedTopology.nodes.find((n) => n.id === fault.targetNodeId);
      if (node && node.interfaces[0]) {
        node.interfaces[0].administrativeState = "down";
      }
    } else if (fault.type === "broken-link" && fault.targetLinkId) {
      const link = modifiedTopology.links.find((l) => l.id === fault.targetLinkId);
      if (link) {
        link.administrativeState = "down";
        link.operationalState = "down";
      }
    } else if (fault.type === "missing-route" && fault.targetNodeId) {
      const node = modifiedTopology.nodes.find((n) => n.id === fault.targetNodeId);
      if (node) {
        node.routingTable = [];
      }
    }
  });

  return modifiedTopology;
}

import { NetworkTopology } from "@/features/topology/topology-types";
import { LabTask, LabValidationResult, LabValidatorDefinition } from "../lab-types";
import { runForwardingSimulation } from "@/features/forwarding/forwarding-engine";
import {
  InterfaceAddressEqualsValidator,
  DefaultGatewayEqualsValidator,
  PacketDeliveredValidator,
  RouteExistsValidator,
  ArpCacheContainsValidator,
  MacTableContainsValidator,
  AnswerEqualsValidator,
  AllOfValidator,
  AnyOfValidator,
} from "./validator-types";

export function evaluateTaskValidation(
  task: LabTask,
  topology: NetworkTopology,
  userAnswer?: string | number
): LabValidationResult {
  const validator = task.validator;

  const passed = validateDefinition(validator, topology, userAnswer);

  if (passed) {
    return {
      passed: true,
      scoreAwarded: task.points,
      message: task.successMessage || "Task completed successfully!",
    };
  }

  return {
    passed: false,
    scoreAwarded: 0,
    message: task.failureMessage || "Validation failed. Please review your configuration and try again.",
    suggestedNextAction: "Check the hint or inspect device configuration in the inspector panel.",
  };
}

function validateDefinition(
  def: LabValidatorDefinition,
  topology: NetworkTopology,
  userAnswer?: string | number
): boolean {
  switch (def.type) {
    case "readInstruction":
      return true;

    case "answerEquals": {
      const v = def as AnswerEqualsValidator;
      if (userAnswer === undefined || userAnswer === null) return false;
      return String(userAnswer).trim().toLowerCase() === String(v.expected).trim().toLowerCase();
    }

    case "interfaceAddressEquals": {
      const v = def as InterfaceAddressEqualsValidator;
      const node = topology.nodes.find((n) => n.id === v.nodeId);
      if (!node) return false;
      const iface = v.interfaceName
        ? node.interfaces.find((i) => i.name === v.interfaceName)
        : node.interfaces.find((i) => i.ipv4?.address);
      if (!iface || !iface.ipv4) return false;
      if (iface.ipv4.address !== v.address) return false;
      if (v.prefixLength !== undefined && iface.ipv4.prefixLength !== v.prefixLength) return false;
      return true;
    }

    case "defaultGatewayEquals": {
      const v = def as DefaultGatewayEqualsValidator;
      const node = topology.nodes.find((n) => n.id === v.nodeId);
      if (!node) return false;
      return node.configuration.defaultGateway === v.gateway;
    }

    case "packetDelivered": {
      const v = def as PacketDeliveredValidator;
      const result = runForwardingSimulation(topology, {
        id: "val-ping",
        name: "Validation Ping",
        trafficType: "ping",
        sourceNodeId: v.sourceNodeId,
        destinationNodeId: v.destinationNodeId,
        protocol: "ICMP",
      });
      return result.success;
    }

    case "routeExists": {
      const v = def as RouteExistsValidator;
      const node = topology.nodes.find((n) => n.id === v.nodeId);
      if (!node || !node.routingTable) return false;
      return node.routingTable.some((r) => {
        const matchesNet = r.destinationPrefix === v.destinationPrefix;
        const matchesPrefix = v.prefixLength === undefined || r.prefixLength === v.prefixLength;
        const matchesNextHop = v.nextHop === undefined || r.nextHop === v.nextHop;
        return matchesNet && matchesPrefix && matchesNextHop && r.active;
      });
    }

    case "arpCacheContains": {
      const v = def as ArpCacheContainsValidator;
      const node = topology.nodes.find((n) => n.id === v.nodeId);
      if (!node || !node.arpTable) return false;
      return node.arpTable.some((e) => e.ipAddress === v.ipAddress);
    }

    case "macTableContains": {
      const v = def as MacTableContainsValidator;
      const node = topology.nodes.find((n) => n.id === v.nodeId);
      if (!node || !node.macTable) return false;
      return node.macTable.some((e) => e.macAddress.toLowerCase() === v.macAddress.toLowerCase());
    }

    case "allOf": {
      const v = def as AllOfValidator;
      return v.validators.every((sub) => validateDefinition(sub, topology, userAnswer));
    }

    case "anyOf": {
      const v = def as AnyOfValidator;
      return v.validators.some((sub) => validateDefinition(sub, topology, userAnswer));
    }

    default:
      return true;
  }
}

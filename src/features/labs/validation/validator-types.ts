import { LabValidatorDefinition } from "../lab-types";

export type ValidatorType =
  | "allOf"
  | "anyOf"
  | "interfaceAddressEquals"
  | "defaultGatewayEquals"
  | "packetDelivered"
  | "routeExists"
  | "arpCacheContains"
  | "macTableContains"
  | "ospfAdjacencyEstablished"
  | "dhcpLeaseAssigned"
  | "dnsResolved"
  | "httpStatusCodeEquals"
  | "faultResolved"
  | "answerEquals";

export interface AllOfValidator extends LabValidatorDefinition {
  type: "allOf";
  validators: LabValidatorDefinition[];
}

export interface AnyOfValidator extends LabValidatorDefinition {
  type: "anyOf";
  validators: LabValidatorDefinition[];
}

export interface InterfaceAddressEqualsValidator extends LabValidatorDefinition {
  type: "interfaceAddressEquals";
  nodeId: string;
  interfaceName?: string;
  address: string;
  prefixLength?: number;
}

export interface DefaultGatewayEqualsValidator extends LabValidatorDefinition {
  type: "defaultGatewayEquals";
  nodeId: string;
  gateway: string;
}

export interface PacketDeliveredValidator extends LabValidatorDefinition {
  type: "packetDelivered";
  sourceNodeId: string;
  destinationNodeId: string;
  protocol?: string;
}

export interface RouteExistsValidator extends LabValidatorDefinition {
  type: "routeExists";
  nodeId: string;
  destinationPrefix: string;
  prefixLength?: number;
  nextHop?: string;
}

export interface ArpCacheContainsValidator extends LabValidatorDefinition {
  type: "arpCacheContains";
  nodeId: string;
  ipAddress: string;
}

export interface MacTableContainsValidator extends LabValidatorDefinition {
  type: "macTableContains";
  nodeId: string;
  macAddress: string;
}

export interface AnswerEqualsValidator extends LabValidatorDefinition {
  type: "answerEquals";
  expected: string | number;
}

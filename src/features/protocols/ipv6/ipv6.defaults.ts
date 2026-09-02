import type {
  Ipv6Config,
  Ipv6Node,
  Ipv6Link,
  Ipv6Header,
  Ipv6ScenarioId,
} from "./ipv6.types";

export const defaultIpv6Config: Ipv6Config = {
  sourceIpv6: "2001:db8:1::10",
  destinationIpv6: "2001:db8:2::100",
  payloadSize: 1200,
  flowLabel: 98124,
  trafficClass: 0,
  initialHopLimit: 64,
  useExtensionHeader: false,
};

export const defaultIpv6Nodes: Ipv6Node[] = [
  {
    id: "host-ipv6-a",
    name: "IPv6 Client (Host A)",
    type: "host",
    ipv6Address: "2001:db8:1::10",
    linkLocalAddress: "fe80::1a2b:3c4d:5e6f",
    prefixLength: 64,
    macAddress: "00:1A:2B:3C:4D:5E",
    isDualStack: true,
    ipv4Address: "192.168.1.10",
    position: { x: 80, y: 220 },
    roleDescription: "IPv6-enabled workstation configured via SLAAC autoconfiguration.",
  },
  {
    id: "router-ipv6-1",
    name: "Dual-Stack Core Router R1",
    type: "router",
    ipv6Address: "2001:db8:1::1 / 2001:db8:trans::1",
    linkLocalAddress: "fe80::aabb:cc11:2233",
    prefixLength: 64,
    macAddress: "AA:BB:CC:11:22:33",
    isDualStack: true,
    ipv4Address: "192.168.1.1",
    position: { x: 220, y: 220 },
    roleDescription: "Core routing node evaluating 20-bit Flow Labels and decrementing Hop Limit.",
  },
  {
    id: "router-ipv6-2",
    name: "Edge Gateway Router R2",
    type: "router",
    ipv6Address: "2001:db8:trans::2 / 2001:db8:2::1",
    linkLocalAddress: "fe80::aabb:cc44:5566",
    prefixLength: 64,
    macAddress: "AA:BB:CC:44:55:66",
    isDualStack: true,
    ipv4Address: "172.16.0.1",
    position: { x: 360, y: 220 },
    roleDescription: "Egress IPv6 router performing Neighbor Discovery Protocol (NDP) resolution.",
  },
  {
    id: "server-ipv6",
    name: "IPv6 Web Server B",
    type: "server",
    ipv6Address: "2001:db8:2::100",
    linkLocalAddress: "fe80::eeff:0011:2233",
    prefixLength: 64,
    macAddress: "EE:FF:00:11:22:33",
    isDualStack: true,
    ipv4Address: "172.16.0.100",
    position: { x: 480, y: 220 },
    roleDescription: "Destination IPv6 server listening on TCP Port 443 with native 128-bit socket.",
  },
];

export const defaultIpv6Links: Ipv6Link[] = [
  {
    id: "link-ipv6-1",
    sourceNodeId: "host-ipv6-a",
    targetNodeId: "router-ipv6-1",
    mtu: 1500,
    latencyMs: 2,
    label: "Native IPv6 Ethernet (MTU 1500)",
  },
  {
    id: "link-ipv6-2",
    sourceNodeId: "router-ipv6-1",
    targetNodeId: "router-ipv6-2",
    mtu: 1500,
    latencyMs: 12,
    label: "IPv6 Optical Backbone (MTU 1500)",
  },
  {
    id: "link-ipv6-3",
    sourceNodeId: "router-ipv6-2",
    targetNodeId: "server-ipv6",
    mtu: 1500,
    latencyMs: 2,
    label: "Native IPv6 Ethernet (MTU 1500)",
  },
];

export const defaultIpv6Header: Ipv6Header = {
  version: 6,
  trafficClass: 0,
  flowLabel: 98124,
  payloadLength: 1200,
  nextHeader: 6,
  nextHeaderName: "TCP (6)",
  hopLimit: 64,
  sourceIp: "2001:db8:1::10",
  destinationIp: "2001:db8:2::100",
};

export const ipv6Scenarios: {
  id: Ipv6ScenarioId;
  name: string;
  badge: string;
  description: string;
  config?: Partial<Ipv6Config>;
}[] = [
  {
    id: "ipv6_unicast_transit",
    name: "Native IPv6 Unicast Transit",
    badge: "RFC 8200",
    description: "Fixed 40-byte IPv6 header transit with 20-bit Flow Label QoS routing and Hop Limit decrement.",
    config: { payloadSize: 1200, flowLabel: 98124, useExtensionHeader: false },
  },
  {
    id: "ipv6_extension_headers",
    name: "Extension Headers Chaining",
    badge: "RFC 8200 Sec 4",
    description: "Header chaining using Next Header pointers: IPv6 Header -> Hop-by-Hop Options -> Routing Header -> TCP.",
    config: { payloadSize: 1200, flowLabel: 98124, useExtensionHeader: true },
  },
  {
    id: "ipv6_slaac_ndp",
    name: "SLAAC & Neighbor Discovery (NDP)",
    badge: "RFC 4861 / 4862",
    description: "ICMPv6 Router Solicitation / Advertisement autoconfiguration and Neighbor Solicitation MAC resolution.",
    config: { payloadSize: 64, flowLabel: 0, useExtensionHeader: false },
  },
  {
    id: "dual_stack_transit",
    name: "Dual-Stack Native Coexistence",
    badge: "RFC 4213",
    description: "Dual-Stack router simultaneously routing independent IPv4 (32-bit) and IPv6 (128-bit) datagrams.",
    config: { payloadSize: 1200, flowLabel: 98124, useExtensionHeader: false },
  },
  {
    id: "6to4_tunneling",
    name: "6to4 Automatic Tunneling (IPv6-in-IPv4)",
    badge: "RFC 3056",
    description: "Encapsulating 128-bit IPv6 packet inside a 20-byte IPv4 packet (Protocol 41) to cross legacy IPv4 core.",
    config: { payloadSize: 1200, flowLabel: 98124, useExtensionHeader: false },
  },
];

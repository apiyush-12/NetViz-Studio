"use client";

import Link from "next/link";
import { RotateCcw, Check } from "lucide-react";
import { useSimulationStore } from "@/features/simulation/simulation-store";
import { getProtocol, getImplementedProtocols } from "@/features/protocols/registry";
import { Label, Input, Button, Switch, Badge } from "@/components/ui";
import { defaultTcpConfig } from "@/features/protocols/tcp/tcp.config";
import { defaultUdpConfig } from "@/features/protocols/udp/udp.config";
import { TcpUdpComparisonModal } from "./comparison/tcp-udp-comparison-modal";
import { OspfBgpComparisonModal } from "./comparison/ospf-bgp-comparison-modal";
import { NetworkServicesComparisonModal } from "./comparison/network-services-comparison-modal";
import { HttpHttpsComparisonModal } from "./comparison/http-https-comparison-modal";
import { NatPatComparisonModal } from "./comparison/nat-pat-comparison-modal";
import { Ipv4Ipv6ComparisonModal } from "./comparison/ipv4-ipv6-comparison-modal";
import { StpRstpComparisonModal } from "./comparison/stp-rstp-comparison-modal";
import { ArpNdpComparisonModal } from "./comparison/arp-ndp-comparison-modal";
import { VlanVxlanComparisonModal } from "./comparison/vlan-vxlan-comparison-modal";

export function ProtocolSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const protocols = getImplementedProtocols();
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-medium"
      aria-label="Select protocol"
    >
      {protocols.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name} — {p.layer}
        </option>
      ))}
    </select>
  );
}

export function ProtocolConfigForm() {
  const protocolId = useSimulationStore((s) => s.protocolId);
  const config = useSimulationStore((s) => s.config);
  const updateConfig = useSimulationStore((s) => s.updateConfig);
  const regenerate = useSimulationStore((s) => s.regenerate);

  const protocol = protocolId ? getProtocol(protocolId) : null;
  if (!protocol) return null;

  if (protocolId === "tcp") {
    const tcpConfig = { ...defaultTcpConfig, ...config };
    return (
      <div className="space-y-3 p-3 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-semibold">TCP Configuration</h3>
          <TcpUdpComparisonModal />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="Data packets" type="number" value={tcpConfig.packetCount}
            onChange={(v) => updateConfig({ packetCount: Number(v) })} min={1} max={10} />
          <Field label="Initial seq #" type="number" value={tcpConfig.initialSeqNum}
            onChange={(v) => updateConfig({ initialSeqNum: Number(v) })} />
          <Field label="Window size" type="number" value={tcpConfig.windowSize}
            onChange={(v) => updateConfig({ windowSize: Number(v) })} />
          <Field label="MSS" type="number" value={tcpConfig.mss}
            onChange={(v) => updateConfig({ mss: Number(v) })} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 border border-border/50">
            <Label className="text-xs">Simulate packet loss (segment 2)</Label>
            <Switch checked={tcpConfig.dropPacketIndex >= 0}
              onCheckedChange={(checked) => updateConfig({ dropPacketIndex: checked ? 1 : -1 })} />
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 border border-border/50">
            <Label className="text-xs">Simulate out-of-order</Label>
            <Switch checked={!tcpConfig.orderedDelivery}
              onCheckedChange={(checked) => updateConfig({ orderedDelivery: !checked })} />
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig(defaultTcpConfig); regenerate(); }}
            className="text-xs cursor-pointer gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={() => regenerate()}
            className="text-xs font-semibold cursor-pointer gap-1.5"
          >
            <Check className="h-3.5 w-3.5" />
            Accept & Regenerate
          </Button>
        </div>
      </div>
    );
  }

  if (protocolId === "udp") {
    const udpConfig = { ...defaultUdpConfig, ...config };
    return (
      <div className="space-y-3 p-3 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-semibold">UDP Configuration</h3>
          <TcpUdpComparisonModal />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Datagram count" type="number" value={udpConfig.datagramCount}
            onChange={(v) => updateConfig({ datagramCount: Number(v) })} min={1} max={15} />
          <Field label="Payload size (bytes)" type="number" value={udpConfig.payloadSize}
            onChange={(v) => updateConfig({ payloadSize: Number(v) })} />
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 border border-border/50">
          <Label className="text-xs">Simulate packet loss</Label>
          <Switch checked={udpConfig.dropIndices.length > 0}
            onCheckedChange={(checked) => updateConfig({ dropIndices: checked ? [1] : [] })} />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig(defaultUdpConfig); regenerate(); }}
            className="text-xs cursor-pointer gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={() => regenerate()}
            className="text-xs font-semibold cursor-pointer gap-1.5"
          >
            <Check className="h-3.5 w-3.5" />
            Accept & Regenerate
          </Button>
        </div>
      </div>
    );
  }

  if (protocolId === "ospf") {
    return (
      <div className="space-y-3 p-3 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">OSPF Dijkstra SPF & Multi-Topology Controls</h3>
            <Badge variant="default" className="text-[10px]">Area 0 Backbone</Badge>
          </div>
          <div className="flex items-center gap-2">
            <OspfBgpComparisonModal />
            <Link href="/protocols/ospf">
              <Button size="sm" variant="default" className="text-xs">
                Open Dedicated OSPF Studio →
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ failureScenario: "r2_r4_cost_high" }); regenerate(); }}
          >
            Scenario: High Link Cost (R2-R4=50)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ failureScenario: "r2_r4_break" }); regenerate(); }}
          >
            Scenario: Break Link R2-R4
          </Button>
        </div>
      </div>
    );
  }

  if (protocolId === "bgp") {
    return (
      <div className="space-y-3 p-3 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">BGP Autonomous Systems & Policy Controls</h3>
            <Badge variant="default" className="text-[10px]">4 AS Domain</Badge>
          </div>
          <div className="flex items-center gap-2">
            <OspfBgpComparisonModal />
            <Link href="/protocols/bgp">
              <Button size="sm" variant="default" className="text-xs">
                Open Dedicated BGP Studio →
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ failureScenario: "as_path_prepend_as65002" }); regenerate(); }}
          >
            Scenario: AS-Path Prepend (3x)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ failureScenario: "break_as65001_as65002" }); regenerate(); }}
          >
            Scenario: Break Peering Link
          </Button>
        </div>
      </div>
    );
  }

  if (protocolId === "dhcp") {
    return (
      <div className="space-y-3 p-3 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">DHCP Address Pool & DORA Handshake Controls</h3>
            <Badge variant="default" className="text-[10px]">RFC 2131 / 2132</Badge>
          </div>
          <div className="flex items-center gap-2">
            <NetworkServicesComparisonModal />
            <Link href="/protocols/dhcp">
              <Button size="sm" variant="default" className="text-xs">
                Open Dedicated DHCP Studio →
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ failureScenario: "pool_exhausted" }); regenerate(); }}
          >
            Scenario: Address Pool Exhaustion
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ failureScenario: "ip_conflict_decline" }); regenerate(); }}
          >
            Scenario: ARP IP Conflict → DECLINE
          </Button>
        </div>
      </div>
    );
  }

  if (protocolId === "dns") {
    return (
      <div className="space-y-3 p-3 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">DNS Hierarchy & Iterative Resolution Controls</h3>
            <Badge variant="default" className="text-[10px]">RFC 1034 / 1035</Badge>
          </div>
          <div className="flex items-center gap-2">
            <NetworkServicesComparisonModal />
            <Link href="/protocols/dns">
              <Button size="sm" variant="default" className="text-xs">
                Open Dedicated DNS Studio →
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ failureScenario: "cache_hit" }); regenerate(); }}
          >
            Scenario: Resolver Cache HIT
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ failureScenario: "cname_resolution" }); regenerate(); }}
          >
            Scenario: CNAME Alias Chain
          </Button>
        </div>
      </div>
    );
  }

  if (protocolId === "http" || protocolId === "https") {
    return (
      <div className="space-y-3 p-3 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">HTTP / HTTPS Request & TLS Handshake Controls</h3>
            <Badge variant="default" className="text-[10px]">RFC 9110 / RFC 8446</Badge>
          </div>
          <div className="flex items-center gap-2">
            <HttpHttpsComparisonModal />
            <Link href="/protocols/http">
              <Button size="sm" variant="default" className="text-xs">
                Open Dedicated HTTP Studio →
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ scheme: "https", method: "GET", path: "/v1/users" }); regenerate(); }}
          >
            Scenario: HTTPS TLS 1.3
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ scheme: "http", method: "GET", path: "/index.html" }); regenerate(); }}
          >
            Scenario: Plaintext HTTP :80
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ scheme: "https", method: "POST", path: "/v1/users" }); regenerate(); }}
          >
            Scenario: REST API POST (201)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ scheme: "https", method: "GET", path: "/assets/app.js" }); regenerate(); }}
          >
            Scenario: Cache 304 Revalidation
          </Button>
        </div>
      </div>
    );
  }

  if (protocolId === "nat") {
    return (
      <div className="space-y-3 p-3 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">NAT / PAT Header Rewriting & Table Controls</h3>
            <Badge variant="default" className="text-[10px]">RFC 3022 / RFC 4787</Badge>
          </div>
          <div className="flex items-center gap-2">
            <NatPatComparisonModal />
            <Link href="/protocols/nat">
              <Button size="sm" variant="default" className="text-xs">
                Open Dedicated NAT Studio →
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ mode: "pat" }); regenerate(); }}
          >
            Scenario: PAT Port Overload
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ mode: "dnat" }); regenerate(); }}
          >
            Scenario: Port Forwarding (8080)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ mode: "dynamic" }); regenerate(); }}
          >
            Scenario: Dynamic IP Pool
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ mode: "cgnat" }); regenerate(); }}
          >
            Scenario: Carrier-Grade NAT
          </Button>
        </div>
      </div>
    );
  }

  if (protocolId === "ipv4") {
    return (
      <div className="space-y-3 p-3 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">IPv4 Header & MTU Fragmentation Controls</h3>
            <Badge variant="default" className="text-[10px]">RFC 791 / RFC 815</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Ipv4Ipv6ComparisonModal />
            <Link href="/protocols/ipv4">
              <Button size="sm" variant="default" className="text-xs">
                Open Dedicated IPv4 Studio →
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ packetSize: 500, initialTtl: 64, dfFlag: false, routerMtu: 576, scenarioId: "standard_forwarding" }); regenerate(); }}
          >
            Scenario: Standard Forwarding (500B)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ packetSize: 1500, initialTtl: 64, dfFlag: false, routerMtu: 576, scenarioId: "fragmentation_mtu" }); regenerate(); }}
          >
            Scenario: MTU Fragmentation (1500B)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ packetSize: 500, initialTtl: 1, dfFlag: false, routerMtu: 576, scenarioId: "ttl_expiration" }); regenerate(); }}
          >
            Scenario: TTL=1 Expiration Drop
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ packetSize: 1500, initialTtl: 64, dfFlag: true, routerMtu: 576, scenarioId: "checksum_error" }); regenerate(); }}
          >
            Scenario: DF=1 MTU Exceeded Drop
          </Button>
        </div>
      </div>
    );
  }

  if (protocolId === "ipv6") {
    return (
      <div className="space-y-3 p-3 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">IPv6 128-Bit Routing & Flow Label Controls</h3>
            <Badge variant="default" className="text-[10px]">RFC 8200 / RFC 4861</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Ipv4Ipv6ComparisonModal />
            <Link href="/protocols/ipv6">
              <Button size="sm" variant="default" className="text-xs">
                Open Dedicated IPv6 Studio →
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ payloadSize: 1200, flowLabel: 98124, useExtensionHeader: false, scenarioId: "ipv6_unicast_transit" }); regenerate(); }}
          >
            Scenario: Native IPv6 Unicast
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ payloadSize: 1200, flowLabel: 98124, useExtensionHeader: true, scenarioId: "ipv6_extension_headers" }); regenerate(); }}
          >
            Scenario: Extension Headers
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ payloadSize: 64, flowLabel: 0, useExtensionHeader: false, scenarioId: "ipv6_slaac_ndp" }); regenerate(); }}
          >
            Scenario: SLAAC & NDP
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ payloadSize: 1200, flowLabel: 98124, useExtensionHeader: false, scenarioId: "6to4_tunneling" }); regenerate(); }}
          >
            Scenario: 6to4 Tunneling
          </Button>
        </div>
      </div>
    );
  }

  if (protocolId === "stp") {
    return (
      <div className="space-y-3 p-3 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Spanning Tree Protocol (IEEE 802.1D / RSTP)</h3>
            <Badge variant="default" className="text-[10px]">IEEE 802.1D / 802.1w</Badge>
          </div>
          <div className="flex items-center gap-2">
            <StpRstpComparisonModal />
            <Link href="/protocols/stp">
              <Button size="sm" variant="default" className="text-xs">
                Open Dedicated STP Studio →
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ scenarioId: "standard_convergence", version: "stp" }); regenerate(); }}
          >
            Scenario: 802.1D Election
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ scenarioId: "rstp_rapid_convergence", version: "rstp" }); regenerate(); }}
          >
            Scenario: RSTP Rapid Sync
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ scenarioId: "root_link_failure" }); regenerate(); }}
          >
            Scenario: Root Link Cut
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ scenarioId: "root_guard_defense" }); regenerate(); }}
          >
            Scenario: Root Guard
          </Button>
        </div>
      </div>
    );
  }

  if (protocolId === "arp") {
    return (
      <div className="space-y-3 p-3 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Address Resolution Protocol (RFC 826 / RFC 5227)</h3>
            <Badge variant="default" className="text-[10px]">Layer 2 Ethernet</Badge>
          </div>
          <div className="flex items-center gap-2">
            <ArpNdpComparisonModal />
            <Link href="/protocols/arp">
              <Button size="sm" variant="default" className="text-xs">
                Open Dedicated ARP Studio →
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ scenarioId: "standard_local_arp", topologyPreset: "standard_lan", targetIp: "192.168.1.20" }); regenerate(); }}
          >
            Scenario: Standard Local ARP
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ scenarioId: "gateway_cross_subnet", topologyPreset: "cross_subnet_router", targetIp: "192.168.2.10" }); regenerate(); }}
          >
            Scenario: Cross-Subnet Gateway
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ scenarioId: "gratuitous_arp_conflict", topologyPreset: "vrrp_failover", targetIp: "192.168.1.100" }); regenerate(); }}
          >
            Scenario: Gratuitous ARP / ACD
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ scenarioId: "arp_spoofing_dai", topologyPreset: "security_dai_lan", attackerEnabled: true, targetIp: "192.168.1.1" }); regenerate(); }}
          >
            Scenario: Poisoning & DAI
          </Button>
        </div>
      </div>
    );
  }

  if (protocolId === "vlan") {
    return (
      <div className="space-y-3 p-3 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Virtual Local Area Network (IEEE 802.1Q)</h3>
            <Badge variant="default" className="text-[10px]">Layer 2 Ethernet</Badge>
          </div>
          <div className="flex items-center gap-2">
            <VlanVxlanComparisonModal />
            <Link href="/protocols/vlan">
              <Button size="sm" variant="default" className="text-xs">
                Open Dedicated VLAN Studio →
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ scenarioId: "intra_vlan_broadcast_isolation", topologyPreset: "multi_vlan_access_switch" }); regenerate(); }}
          >
            Scenario: Broadcast Isolation
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ scenarioId: "trunk_8021q_tagging", topologyPreset: "two_switch_trunking" }); regenerate(); }}
          >
            Scenario: 802.1Q Trunk Tagging
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ scenarioId: "inter_vlan_router_on_a_stick", topologyPreset: "router_on_a_stick", routingMode: "roas" }); regenerate(); }}
          >
            Scenario: Router-on-a-Stick
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { updateConfig({ scenarioId: "inter_vlan_l3_svi", topologyPreset: "layer3_switch_svi", routingMode: "svi" }); regenerate(); }}
          >
            Scenario: Layer 3 Switch SVI
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  min,
  max,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground mb-1 block">{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} min={min} max={max} />
    </div>
  );
}

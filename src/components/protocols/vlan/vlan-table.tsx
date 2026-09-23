"use client";

import React, { useState } from "react";
import {
  Layers,
  Network,
  CheckCircle2,
  Table as TableIcon,
  Tag,
} from "lucide-react";
import { Badge, Card, CardContent } from "@/components/ui";
import type { VlanNode } from "@/features/protocols/vlan/vlan.types";
import { DEFAULT_VLANS } from "@/features/protocols/vlan/vlan.defaults";

interface VlanTableProps {
  selectedNode: VlanNode;
}

export function VlanTable({ selectedNode }: VlanTableProps) {
  const [subTab, setSubTab] = useState<"vlan" | "trunk">("vlan");

  const isSwitch = selectedNode.type === "switch" || selectedNode.type === "layer3-switch";
  const ports = selectedNode.ports || [];
  const trunkPorts = ports.filter((p) => p.mode === "trunk");

  if (!isSwitch) {
    const vlanDef = DEFAULT_VLANS.find((v) => v.vlanId === selectedNode.vlanId);
    return (
      <Card className="border-border bg-card shadow-sm overflow-hidden">
        <div className="p-3 bg-secondary/30 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-bold text-foreground">
              Host VLAN Membership
            </h4>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            Access Endpoint
          </Badge>
        </div>
        <CardContent className="p-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
          <p className="font-semibold text-foreground">
            Host operates inside VLAN {selectedNode.vlanId} ({vlanDef?.name || "VLAN"})
          </p>
          <p className="text-[11px] max-w-sm">
            End-hosts communicate via access ports without 802.1Q tags. The connected switch port automatically associates all host frames with PVID {selectedNode.vlanId}.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden">
      {/* Table Header & Sub-Tab Switcher */}
      <div className="p-3 bg-secondary/30 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TableIcon className="h-4 w-4 text-primary" />
          <h4 className="text-xs font-bold text-foreground">
            Switch VLAN & Trunking Database
          </h4>
        </div>
        <div className="flex items-center gap-1 bg-secondary/60 p-0.5 rounded-lg border border-border">
          <button
            onClick={() => setSubTab("vlan")}
            className={`px-2 py-0.5 text-[11px] rounded font-medium transition-colors cursor-pointer ${
              subTab === "vlan"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            VLAN Brief
          </button>
          <button
            onClick={() => setSubTab("trunk")}
            className={`px-2 py-0.5 text-[11px] rounded font-medium transition-colors cursor-pointer ${
              subTab === "trunk"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Trunk Interfaces ({trunkPorts.length})
          </button>
        </div>
      </div>

      <CardContent className="p-0">
        {subTab === "vlan" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-secondary/40 text-muted-foreground border-b border-border text-[10px] uppercase font-semibold">
                  <th className="py-2 px-3">VLAN ID</th>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Assigned Ports</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono text-xs">
                {DEFAULT_VLANS.map((vlan) => {
                  const assignedPorts = ports
                    .filter((p) => p.mode === "access" && p.pvid === vlan.vlanId)
                    .map((p) => p.name);

                  return (
                    <tr key={vlan.vlanId} className="hover:bg-secondary/20 transition-colors">
                      {/* VLAN ID Badge */}
                      <td className="py-2.5 px-3">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-bold border"
                          style={{
                            backgroundColor: `${vlan.color}20`,
                            color: vlan.color,
                            borderColor: `${vlan.color}50`,
                          }}
                        >
                          VLAN {vlan.vlanId}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="py-2.5 px-3 font-semibold text-foreground">
                        {vlan.name}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                          <CheckCircle2 className="h-3 w-3" /> active
                        </span>
                      </td>

                      {/* Ports */}
                      <td className="py-2.5 px-3 text-foreground font-semibold">
                        {assignedPorts.length > 0 ? (
                          assignedPorts.join(", ")
                        ) : (
                          <span className="text-muted-foreground italic text-[11px]">None</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {trunkPorts.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                <Network className="h-6 w-6 text-muted-foreground/40" />
                <p className="font-semibold text-foreground">No Trunk Ports Active</p>
                <p className="text-[11px] max-w-xs">
                  All ports on this switch are currently configured in Access mode.
                </p>
              </div>
            ) : (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/40 text-muted-foreground border-b border-border text-[10px] uppercase font-semibold">
                    <th className="py-2 px-3">Port</th>
                    <th className="py-2 px-3">Mode</th>
                    <th className="py-2 px-3">Encapsulation</th>
                    <th className="py-2 px-3">Native VLAN</th>
                    <th className="py-2 px-3">Allowed VLANs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-mono text-xs">
                  {trunkPorts.map((trunk) => (
                    <tr key={trunk.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-primary">
                        {trunk.name}
                      </td>
                      <td className="py-2.5 px-3 text-foreground">
                        <Badge variant="default" className="text-[10px]">
                          802.1Q TRUNK
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        dot1q (802.1Q)
                      </td>
                      <td className="py-2.5 px-3 font-bold text-amber-400">
                        VLAN {trunk.nativeVlanId}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-400">
                        {trunk.allowedVlans.join(", ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Cisco CLI Reference Footer */}
        <div className="p-2.5 bg-secondary/20 border-t border-border/70 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <span className="flex items-center gap-1.5">
            <Layers className="h-3 w-3 text-primary" /> Cisco CLI:
          </span>
          <span className="bg-card px-2 py-0.5 rounded border border-border text-foreground">
            `show vlan brief` &nbsp;|&nbsp; `show interfaces trunk`
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

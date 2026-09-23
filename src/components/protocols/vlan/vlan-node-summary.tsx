"use client";

import React from "react";
import {
  Monitor,
  Server,
  Network,
  Router as RouterIcon,
  ShieldAlert,
  Globe,
  Cpu,
  Layers,
  Hash,
  Tag,
} from "lucide-react";
import { Badge, Card, CardContent } from "@/components/ui";
import type { VlanNode } from "@/features/protocols/vlan/vlan.types";
import { DEFAULT_VLANS } from "@/features/protocols/vlan/vlan.defaults";

interface VlanNodeSummaryProps {
  selectedNode: VlanNode;
}

export function VlanNodeSummary({ selectedNode }: VlanNodeSummaryProps) {
  const isSwitch = selectedNode.type === "switch" || selectedNode.type === "layer3-switch";
  const isRouter = selectedNode.type === "router";

  const vlanDef = DEFAULT_VLANS.find((v) => v.vlanId === selectedNode.vlanId);
  const vlanColor = vlanDef?.color || "#3b82f6";

  const getNodeIcon = () => {
    switch (selectedNode.type) {
      case "attacker":
        return <ShieldAlert className="h-5 w-5 text-red-400" />;
      case "router":
        return <RouterIcon className="h-5 w-5 text-amber-400" />;
      case "layer3-switch":
        return <Network className="h-5 w-5 text-purple-400" />;
      case "server":
        return <Server className="h-5 w-5 text-purple-400" />;
      case "switch":
        return <Network className="h-5 w-5 text-blue-400" />;
      case "host":
      default:
        return <Monitor className="h-5 w-5 text-emerald-400" />;
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden">
      {/* Top Banner */}
      <div className="p-3.5 bg-secondary/30 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-card border border-border">
            {getNodeIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">
                {selectedNode.label || selectedNode.name}
              </h3>
              <span className="text-xs font-mono text-muted-foreground">
                ({selectedNode.id})
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground capitalize">
              {selectedNode.type.replace("-", " ")} Device · Layer {isSwitch && selectedNode.type !== "layer3-switch" ? "2" : "3"}
            </p>
          </div>
        </div>

        {/* VLAN Badge for Host / Role Badge */}
        <div>
          {!isSwitch && !isRouter ? (
            <span
              className="px-2.5 py-1 rounded-full text-xs font-bold font-mono border flex items-center gap-1 shadow-xs"
              style={{
                backgroundColor: `${vlanColor}20`,
                color: vlanColor,
                borderColor: `${vlanColor}50`,
              }}
            >
              <Tag className="h-3 w-3" />
              VLAN {selectedNode.vlanId} ({vlanDef?.name || "VLAN"})
            </span>
          ) : selectedNode.type === "layer3-switch" ? (
            <Badge variant="default" className="text-[10px] font-mono bg-purple-500/20 text-purple-300 border-purple-500/40">
              LAYER 3 MULTILAYER SVI
            </Badge>
          ) : isRouter ? (
            <Badge variant="warning" className="text-[10px] font-mono">
              ROUTER-ON-A-STICK (ROAS)
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px] font-mono">
              802.1Q ACCESS / TRUNK SWITCH
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-3.5 flex flex-col gap-3">
        {/* Network & Hardware Address Row */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* IPv4 Address */}
          <div className="p-2.5 rounded-lg bg-secondary/20 border border-border/70 flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
              <Globe className="h-3 w-3 text-primary" /> IPv4 Address
            </span>
            <span className="font-mono font-bold text-foreground text-xs">
              {selectedNode.ipAddress ? (
                <>
                  {selectedNode.ipAddress}
                  <span className="text-muted-foreground text-[10px]">
                    {" "}
                    / {selectedNode.subnetMask === "255.255.255.0" ? "24" : selectedNode.subnetMask}
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground italic">Layer 2 Only (No Host IP)</span>
              )}
            </span>
          </div>

          {/* MAC Address */}
          <div className="p-2.5 rounded-lg bg-secondary/20 border border-border/70 flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
              <Cpu className="h-3 w-3 text-emerald-400" /> MAC Address
            </span>
            <span className="font-mono font-bold text-emerald-400 text-xs tracking-wider">
              {selectedNode.macAddress}
            </span>
          </div>
        </div>

        {/* Secondary Parameters */}
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          {/* Default Gateway / Sub-interfaces */}
          <div className="p-2 rounded-md bg-secondary/10 border border-border/50 flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground">Default Gateway</span>
            <span className="font-mono text-xs text-foreground font-medium truncate">
              {selectedNode.defaultGateway || (isRouter ? "Local Router" : "None")}
            </span>
          </div>

          {/* Active Ports / Sub-interfaces */}
          <div className="p-2 rounded-md bg-secondary/10 border border-border/50 flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground">
              {isSwitch ? "Switch Ports" : isRouter ? "Sub-Interfaces" : "Port Connection"}
            </span>
            <span className="font-mono text-xs text-foreground font-medium flex items-center gap-1">
              <Hash className="h-3 w-3 text-muted-foreground" />
              {isSwitch
                ? `${selectedNode.ports?.length || 0} Ports`
                : isRouter
                ? `${selectedNode.subInterfaces?.length || 0} Sub-IFs`
                : "eth0 (Access)"}
            </span>
          </div>

          {/* Assigned Segment / SVI */}
          <div className="p-2 rounded-md bg-secondary/10 border border-border/50 flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground">Subnet Scope</span>
            <span className="font-mono text-xs text-foreground font-medium truncate">
              {vlanDef?.subnet || (isSwitch ? "Multi-VLAN" : "192.168.1.0/24")}
            </span>
          </div>
        </div>

        {/* Router-on-a-Stick Sub-interfaces List if Router */}
        {isRouter && selectedNode.subInterfaces && (
          <div className="p-2 rounded-lg bg-secondary/20 border border-border/70 space-y-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
              <Layers className="h-3 w-3 text-primary" /> 802.1Q Sub-Interfaces (`encapsulation dot1Q`)
            </span>
            <div className="grid grid-cols-2 gap-1 text-[11px] font-mono">
              {selectedNode.subInterfaces.map((sub) => {
                const subVlan = DEFAULT_VLANS.find((v) => v.vlanId === sub.vlanId);
                return (
                  <div
                    key={sub.id}
                    className="p-1.5 rounded bg-card border border-border flex items-center justify-between"
                  >
                    <span className="font-bold text-foreground">{sub.name}</span>
                    <span
                      className="px-1.5 py-0.2 rounded text-[10px] font-bold"
                      style={{
                        backgroundColor: `${subVlan?.color || "#3b82f6"}20`,
                        color: subVlan?.color || "#3b82f6",
                      }}
                    >
                      VID {sub.vlanId} ({sub.ipAddress})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Layer 3 Switch SVI List if L3 Switch */}
        {selectedNode.type === "layer3-switch" && selectedNode.sviInterfaces && (
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 space-y-1.5">
            <span className="text-[10px] font-semibold text-purple-300 uppercase flex items-center gap-1">
              <Layers className="h-3 w-3" /> Switched Virtual Interfaces (SVIs)
            </span>
            <div className="grid grid-cols-2 gap-1 text-[11px] font-mono">
              {selectedNode.sviInterfaces.map((svi) => {
                const subVlan = DEFAULT_VLANS.find((v) => v.vlanId === svi.vlanId);
                return (
                  <div
                    key={svi.name}
                    className="p-1.5 rounded bg-card border border-border flex items-center justify-between"
                  >
                    <span className="font-bold text-foreground">interface {svi.name}</span>
                    <span
                      className="px-1.5 py-0.2 rounded text-[10px] font-bold"
                      style={{
                        backgroundColor: `${subVlan?.color || "#3b82f6"}20`,
                        color: subVlan?.color || "#3b82f6",
                      }}
                    >
                      {svi.ipAddress}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

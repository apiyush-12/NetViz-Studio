"use client";

import React from "react";
import {
  Monitor,
  Server,
  Network,
  Router as RouterIcon,
  ShieldAlert,
  ShieldCheck,
  Globe,
  Cpu,
  Layers,
  Hash,
} from "lucide-react";
import { Badge, Card, CardContent } from "@/components/ui";
import type { ArpNode } from "@/features/protocols/arp/arp.types";

interface ArpNodeSummaryProps {
  selectedNode: ArpNode;
}

export function ArpNodeSummary({ selectedNode }: ArpNodeSummaryProps) {
  const getNodeIcon = () => {
    switch (selectedNode.type) {
      case "attacker":
        return <ShieldAlert className="h-5 w-5 text-red-400" />;
      case "router":
        return <RouterIcon className="h-5 w-5 text-amber-400" />;
      case "server":
        return <Server className="h-5 w-5 text-purple-400" />;
      case "switch":
        return <Network className="h-5 w-5 text-blue-400" />;
      case "host":
      default:
        return <Monitor className="h-5 w-5 text-emerald-400" />;
    }
  };

  const getNodeRoleBadge = () => {
    if (selectedNode.isAttacker) {
      return (
        <Badge variant="destructive" className="font-mono text-[10px] animate-pulse">
          ROGUE ATTACKER
        </Badge>
      );
    }
    if (selectedNode.isSource) {
      return (
        <Badge variant="default" className="font-mono text-[10px]">
          ARP REQUESTER
        </Badge>
      );
    }
    if (selectedNode.isTarget) {
      return (
        <Badge variant="success" className="font-mono text-[10px]">
          TARGET DESTINATION
        </Badge>
      );
    }
    if (selectedNode.type === "router") {
      return (
        <Badge variant="warning" className="font-mono text-[10px]">
          DEFAULT GATEWAY
        </Badge>
      );
    }
    if (selectedNode.type === "switch") {
      return (
        <Badge variant="secondary" className="font-mono text-[10px]">
          LAYER 2 SWITCH
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="font-mono text-[10px]">
        SUBNET HOST
      </Badge>
    );
  };

  const hasPoisonedCache = selectedNode.arpCache?.some((e) => e.state === "poisoned");

  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden">
      {/* Top Banner with Device Identity */}
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
              {selectedNode.type} Node · Layer {selectedNode.type === "switch" ? "2" : "3"} Device
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {getNodeRoleBadge()}
          {selectedNode.daiEnabled && (
            <Badge variant="success" className="text-[10px] gap-1 flex items-center">
              <ShieldCheck className="h-3 w-3" /> DAI Active
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-3.5 flex flex-col gap-3">
        {/* Hardware & Network Identifiers Grid */}
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
                <span className="text-muted-foreground italic">Layer 2 Only (No IP)</span>
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

        {/* Secondary Parameters Bar */}
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          {/* Default Gateway */}
          <div className="p-2 rounded-md bg-secondary/10 border border-border/50 flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground">Default Gateway</span>
            <span className="font-mono text-xs text-foreground font-medium truncate">
              {selectedNode.defaultGateway || "None / Local"}
            </span>
          </div>

          {/* Cache / CAM Size */}
          <div className="p-2 rounded-md bg-secondary/10 border border-border/50 flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground">
              {selectedNode.type === "switch" ? "CAM Entries" : "ARP Cache Entries"}
            </span>
            <span className="font-mono text-xs text-foreground font-medium flex items-center gap-1">
              <Hash className="h-3 w-3 text-muted-foreground" />
              {selectedNode.type === "switch"
                ? Object.keys(selectedNode.macTable || {}).length
                : selectedNode.arpCache?.length || 0}
            </span>
          </div>

          {/* Security Status */}
          <div className="p-2 rounded-md bg-secondary/10 border border-border/50 flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground">Integrity Status</span>
            {hasPoisonedCache ? (
              <span className="text-xs text-red-400 font-bold flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" /> POISONED
              </span>
            ) : (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Verified
              </span>
            )}
          </div>
        </div>

        {/* Dynamic ARP Inspection Notice if applicable */}
        {selectedNode.type === "switch" && (
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-400 flex items-center gap-2">
            <Layers className="h-4 w-4 shrink-0" />
            <span>
              Switch maintains CAM (Port-to-MAC) Table and inspects ARP requests against DHCP Snooping bindings.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

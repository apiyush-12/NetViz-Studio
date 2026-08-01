"use client";

import React from "react";
import { BaseNetworkNode } from "./base-network-node";
import { NetworkNodeData } from "@/features/topology/topology-types";

export function RouterNode({ data, selected }: { data: NetworkNodeData; selected?: boolean }) {
  const routerId = data.protocolConfiguration?.ospf?.routerId || data.protocolConfiguration?.bgp?.routerId || "1.1.1.1";
  const isOspfActive = data.protocolConfiguration?.ospf?.enabled;
  const isBgpActive = data.protocolConfiguration?.bgp?.enabled;

  return (
    <BaseNetworkNode
      id={data.nodeId}
      name={data.name}
      type={data.type}
      iconName="Router"
      status={data.status}
      interfaces={data.interfaces}
      selected={selected}
    >
      <div className="flex flex-col gap-0.5 text-center">
        <span className="font-mono text-[10px] text-foreground font-medium">RID: {routerId}</span>
        <div className="flex items-center justify-center gap-1 mt-0.5">
          {isOspfActive && <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[8px] font-bold text-emerald-400">OSPF</span>}
          {isBgpActive && <span className="rounded bg-purple-500/20 px-1 py-0.2 text-[8px] font-bold text-purple-400">BGP</span>}
          {!isOspfActive && !isBgpActive && <span className="text-[9px] text-muted-foreground">Static</span>}
        </div>
      </div>
    </BaseNetworkNode>
  );
}

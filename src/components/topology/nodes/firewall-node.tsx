"use client";

import React from "react";
import { BaseNetworkNode } from "./base-network-node";
import { NetworkNodeData } from "@/features/topology/topology-types";

export function FirewallNode({ data, selected }: { data: NetworkNodeData; selected?: boolean }) {
  const rulesCount = data.protocolConfiguration?.firewall?.rules?.length || 0;

  return (
    <BaseNetworkNode
      id={data.nodeId}
      name={data.name}
      type={data.type}
      iconName="Shield"
      status={data.status}
      interfaces={data.interfaces}
      selected={selected}
    >
      <div className="flex flex-col gap-0.5 text-center">
        <span className="text-[10px] font-medium text-emerald-400">Stateful Inspection</span>
        <span className="text-[9px] text-muted-foreground">{rulesCount} Active Rules</span>
      </div>
    </BaseNetworkNode>
  );
}

"use client";

import React from "react";
import { BaseNetworkNode } from "./base-network-node";
import { NetworkNodeData } from "@/features/topology/topology-types";

export function SwitchNode({ data, selected }: { data: NetworkNodeData; selected?: boolean }) {
  const activePorts = data.interfaces.filter((i) => i.administrativeState === "up" && i.operationalState === "up").length;

  return (
    <BaseNetworkNode
      id={data.nodeId}
      name={data.name}
      type={data.type}
      iconName={data.type === "l3-switch" ? "Layers" : "Network"}
      status={data.status}
      interfaces={data.interfaces}
      selected={selected}
    >
      <div className="flex flex-col gap-0.5 text-center">
        <span className="text-[10px] font-medium text-foreground">Active Ports: {activePorts}/{data.interfaces.length}</span>
        <span className="text-[9px] text-muted-foreground">VLAN 1 Default</span>
      </div>
    </BaseNetworkNode>
  );
}

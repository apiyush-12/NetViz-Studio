"use client";

import React from "react";
import { BaseNetworkNode } from "./base-network-node";
import { NetworkNodeData } from "@/features/topology/topology-types";

export function CloudNode({ data, selected }: { data: NetworkNodeData; selected?: boolean }) {
  return (
    <BaseNetworkNode
      id={data.nodeId}
      name={data.name}
      type={data.type}
      iconName={data.type === "wan-cloud" ? "CloudLightning" : "Cloud"}
      status={data.status}
      interfaces={data.interfaces}
      selected={selected}
    >
      <div className="flex flex-col gap-0.5 text-center">
        <span className="text-[10px] font-medium text-blue-400">Public Internet WAN</span>
        <span className="text-[9px] text-muted-foreground">Unmanaged Segment</span>
      </div>
    </BaseNetworkNode>
  );
}

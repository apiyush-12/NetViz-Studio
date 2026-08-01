"use client";

import React from "react";
import { BaseNetworkNode } from "./base-network-node";
import { NetworkNodeData } from "@/features/topology/topology-types";

export function AutonomousSystemNode({ data, selected }: { data: NetworkNodeData; selected?: boolean }) {
  const asn = data.asn || 65000;
  const asName = data.asName || "AS Domain";

  return (
    <BaseNetworkNode
      id={data.nodeId}
      name={data.name}
      type={data.type}
      iconName="Boxes"
      status={data.status}
      interfaces={data.interfaces}
      selected={selected}
    >
      <div className="flex flex-col gap-0.5 text-center">
        <span className="font-mono text-[10px] font-semibold text-purple-400">ASN {asn}</span>
        <span className="text-[9px] text-muted-foreground">{asName}</span>
      </div>
    </BaseNetworkNode>
  );
}

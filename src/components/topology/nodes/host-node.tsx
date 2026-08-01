"use client";

import React from "react";
import { BaseNetworkNode } from "./base-network-node";
import { NetworkNodeData } from "@/features/topology/topology-types";

export function HostNode({ data, selected }: { data: NetworkNodeData; selected?: boolean }) {
  const primaryIface = data.interfaces.find((i) => i.ipv4?.address) || data.interfaces[0];
  const ipAddress = primaryIface?.ipv4?.address || "DHCP Requesting...";
  const gateway = data.configuration?.defaultGateway || "None";

  const iconNameMap: Record<string, string> = {
    pc: "Monitor",
    laptop: "Laptop",
    mobile: "Smartphone",
    printer: "Printer",
    host: "HardDrive",
  };

  return (
    <BaseNetworkNode
      id={data.nodeId}
      name={data.name}
      type={data.type}
      iconName={iconNameMap[data.type] || "Monitor"}
      status={data.status}
      interfaces={data.interfaces}
      selected={selected}
    >
      <div className="flex flex-col gap-0.5 text-center">
        <span className="font-mono text-[10px] text-primary font-medium">{ipAddress}</span>
        <span className="text-[9px] text-muted-foreground">GW: {gateway}</span>
      </div>
    </BaseNetworkNode>
  );
}

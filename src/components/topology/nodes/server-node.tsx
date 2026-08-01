"use client";

import React from "react";
import { BaseNetworkNode } from "./base-network-node";
import { NetworkNodeData } from "@/features/topology/topology-types";

export function ServerNode({ data, selected }: { data: NetworkNodeData; selected?: boolean }) {
  const primaryIface = data.interfaces.find((i) => i.ipv4?.address) || data.interfaces[0];
  const ipAddress = primaryIface?.ipv4?.address || "192.168.1.50";

  const services: string[] = [];
  if (data.protocolConfiguration?.dhcp?.enabled) services.push("DHCP");
  if (data.protocolConfiguration?.dns?.enabled) services.push("DNS");
  if (data.protocolConfiguration?.http?.enabled) services.push(data.protocolConfiguration.http.useHttps ? "HTTPS" : "HTTP");

  const iconNameMap: Record<string, string> = {
    "web-server": "Globe",
    "dns-server": "Database",
    "dhcp-server": "ServerCog",
    "ftp-server": "FolderGit2",
    "mail-server": "Mail",
    "ntp-server": "Clock",
    server: "Server",
  };

  return (
    <BaseNetworkNode
      id={data.nodeId}
      name={data.name}
      type={data.type}
      iconName={iconNameMap[data.type] || "Server"}
      status={data.status}
      interfaces={data.interfaces}
      selected={selected}
    >
      <div className="flex flex-col gap-0.5 text-center">
        <span className="font-mono text-[10px] text-primary font-medium">{ipAddress}</span>
        <div className="flex flex-wrap items-center justify-center gap-1 mt-0.5">
          {services.length > 0 ? (
            services.map((svc) => (
              <span key={svc} className="rounded bg-primary/20 px-1 py-0.2 text-[8px] font-bold text-primary">
                {svc}
              </span>
            ))
          ) : (
            <span className="text-[9px] text-muted-foreground">App Server</span>
          )}
        </div>
      </div>
    </BaseNetworkNode>
  );
}

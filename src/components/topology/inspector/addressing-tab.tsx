"use client";

import React from "react";
import { NetworkNode } from "@/features/topology/topology-types";
import { Input, Label, Switch } from "@/components/ui";

interface AddressingTabProps {
  node: NetworkNode;
  onUpdate: (updates: Partial<NetworkNode>) => void;
}

export function AddressingTab({ node, onUpdate }: AddressingTabProps) {
  const primaryIface = node.interfaces[0];
  const isDhcpMode = node.configuration.addressMode === "dhcp";

  return (
    <div className="space-y-4 p-4 text-xs">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <Label className="font-semibold">IP Address Assignment Mode</Label>
          <p className="text-[10px] text-muted-foreground">Select Static IP or DHCP client request</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={!isDhcpMode ? "font-bold text-primary" : "text-muted-foreground"}>Static</span>
          <Switch
            checked={isDhcpMode}
            onCheckedChange={(checked) =>
              onUpdate({
                configuration: { ...node.configuration, addressMode: checked ? "dhcp" : "static" },
              })
            }
          />
          <span className={isDhcpMode ? "font-bold text-primary" : "text-muted-foreground"}>DHCP</span>
        </div>
      </div>

      {!isDhcpMode ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="ip-addr">IPv4 Address</Label>
            <Input
              id="ip-addr"
              value={primaryIface?.ipv4?.address || ""}
              placeholder="192.168.1.10"
              onChange={(e) => {
                const updatedIfaces = [...node.interfaces];
                if (updatedIfaces[0]) {
                  updatedIfaces[0].ipv4 = {
                    address: e.target.value,
                    prefixLength: updatedIfaces[0].ipv4?.prefixLength || 24,
                  };
                }
                onUpdate({ interfaces: updatedIfaces });
              }}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="default-gw">Default Gateway</Label>
            <Input
              id="default-gw"
              value={node.configuration.defaultGateway || ""}
              placeholder="192.168.1.1"
              onChange={(e) =>
                onUpdate({
                  configuration: { ...node.configuration, defaultGateway: e.target.value },
                })
              }
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="dns-server">Primary DNS Server</Label>
            <Input
              id="dns-server"
              value={node.configuration.dnsServer || ""}
              placeholder="8.8.8.8"
              onChange={(e) =>
                onUpdate({
                  configuration: { ...node.configuration, dnsServer: e.target.value },
                })
              }
            />
          </div>
        </div>
      ) : (
        <div className="rounded-md bg-accent/40 p-3 text-muted-foreground text-[11px] leading-relaxed">
          Device will issue a DHCP DISCOVER broadcast frame upon entering simulation mode to request an IPv4 lease from an available DHCP server.
        </div>
      )}
    </div>
  );
}

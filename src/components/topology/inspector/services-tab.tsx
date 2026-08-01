"use client";

import React from "react";
import { NetworkNode } from "@/features/topology/topology-types";
import { Input, Label, Switch } from "@/components/ui";

interface ServicesTabProps {
  node: NetworkNode;
  onUpdate: (updates: Partial<NetworkNode>) => void;
}

export function ServicesTab({ node, onUpdate }: ServicesTabProps) {
  const dhcp = node.protocolConfiguration.dhcp;
  const dns = node.protocolConfiguration.dns;
  const http = node.protocolConfiguration.http;
  const firewall = node.protocolConfiguration.firewall;

  return (
    <div className="space-y-4 p-4 text-xs">
      {/* DHCP Service */}
      {dhcp && (
        <div className="rounded-lg border border-border bg-card/60 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="font-semibold">DHCP Server Service</Label>
            <Switch
              checked={dhcp.enabled}
              onCheckedChange={(checked) =>
                onUpdate({
                  protocolConfiguration: {
                    ...node.protocolConfiguration,
                    dhcp: { ...dhcp, enabled: checked },
                  },
                })
              }
            />
          </div>
          {dhcp.enabled && dhcp.pools[0] && (
            <div className="space-y-2 pt-1 text-[11px]">
              <div>
                <Label className="text-[10px]">Pool Network</Label>
                <Input
                  value={dhcp.pools[0].network}
                  onChange={(e) => {
                    const pools = [...dhcp.pools];
                    pools[0] = { ...pools[0], network: e.target.value };
                    onUpdate({ protocolConfiguration: { ...node.protocolConfiguration, dhcp: { ...dhcp, pools } } });
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px]">Start IP</Label>
                  <Input
                    value={dhcp.pools[0].startAddress}
                    onChange={(e) => {
                      const pools = [...dhcp.pools];
                      pools[0] = { ...pools[0], startAddress: e.target.value };
                      onUpdate({ protocolConfiguration: { ...node.protocolConfiguration, dhcp: { ...dhcp, pools } } });
                    }}
                  />
                </div>
                <div>
                  <Label className="text-[10px]">End IP</Label>
                  <Input
                    value={dhcp.pools[0].endAddress}
                    onChange={(e) => {
                      const pools = [...dhcp.pools];
                      pools[0] = { ...pools[0], endAddress: e.target.value };
                      onUpdate({ protocolConfiguration: { ...node.protocolConfiguration, dhcp: { ...dhcp, pools } } });
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DNS Service */}
      {dns && (
        <div className="rounded-lg border border-border bg-card/60 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="font-semibold">DNS Server Service</Label>
            <Switch
              checked={dns.enabled}
              onCheckedChange={(checked) =>
                onUpdate({
                  protocolConfiguration: {
                    ...node.protocolConfiguration,
                    dns: { ...dns, enabled: checked },
                  },
                })
              }
            />
          </div>
          {dns.enabled && (
            <div className="space-y-2 pt-1 text-[11px]">
              <p className="text-[10px] text-muted-foreground">Domain A Records ({dns.records.length})</p>
              {dns.records.map((rec) => (
                <div key={rec.id} className="flex gap-2">
                  <Input value={rec.hostname} placeholder="Hostname" className="flex-1" readOnly />
                  <Input value={rec.value} placeholder="Target IP" className="flex-1 font-mono" readOnly />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* HTTP Web Service */}
      {http && (
        <div className="rounded-lg border border-border bg-card/60 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="font-semibold">HTTP Web Service</Label>
            <Switch
              checked={http.enabled}
              onCheckedChange={(checked) =>
                onUpdate({
                  protocolConfiguration: {
                    ...node.protocolConfiguration,
                    http: { ...http, enabled: checked },
                  },
                })
              }
            />
          </div>
          {http.enabled && (
            <div className="space-y-2 pt-1 text-[11px]">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px]">Port</Label>
                  <Input
                    type="number"
                    value={http.port}
                    onChange={(e) =>
                      onUpdate({
                        protocolConfiguration: {
                          ...node.protocolConfiguration,
                          http: { ...http, port: Number(e.target.value) },
                        },
                      })
                    }
                  />
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <Switch
                    checked={http.useHttps}
                    onCheckedChange={(checked) =>
                      onUpdate({
                        protocolConfiguration: {
                          ...node.protocolConfiguration,
                          http: { ...http, useHttps: checked, port: checked ? 443 : 80 },
                        },
                      })
                    }
                  />
                  <Label className="text-[10px]">Enable HTTPS</Label>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Firewall Rules */}
      {firewall && (
        <div className="rounded-lg border border-border bg-card/60 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="font-semibold">Stateful Firewall Engine</Label>
            <Switch
              checked={firewall.enabled}
              onCheckedChange={(checked) =>
                onUpdate({
                  protocolConfiguration: {
                    ...node.protocolConfiguration,
                    firewall: { ...firewall, enabled: checked },
                  },
                })
              }
            />
          </div>
          {firewall.enabled && (
            <p className="text-[10px] text-muted-foreground">{firewall.rules.length} Active ACL Rules Configured</p>
          )}
        </div>
      )}

      {!dhcp && !dns && !http && !firewall && (
        <p className="text-muted-foreground italic text-center py-4">No active network services configured for this endpoint.</p>
      )}
    </div>
  );
}

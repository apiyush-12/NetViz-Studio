"use client";

import React, { useState } from "react";
import { NetworkNode, StaticRoute } from "@/features/topology/topology-types";
import { Button, Input, Label, Switch } from "@/components/ui";
import { Plus, Trash2 } from "lucide-react";

interface RoutingTabProps {
  node: NetworkNode;
  onUpdate: (updates: Partial<NetworkNode>) => void;
}

export function RoutingTab({ node, onUpdate }: RoutingTabProps) {
  const [dest, setDest] = useState("10.0.0.0");
  const [prefix, setPrefix] = useState(24);
  const [nextHop, setNextHop] = useState("192.168.1.1");

  const staticRoutes = node.protocolConfiguration.staticRoutes || [];
  const ospf = node.protocolConfiguration.ospf;
  const bgp = node.protocolConfiguration.bgp;

  const handleAddStaticRoute = () => {
    const newRoute: StaticRoute = {
      id: `sr-${Date.now()}`,
      destinationPrefix: dest,
      prefixLength: prefix,
      nextHop,
      exitInterfaceId: node.interfaces[0]?.id,
      metric: 1,
      administrativeDistance: 1,
      enabled: true,
    };
    onUpdate({
      protocolConfiguration: {
        ...node.protocolConfiguration,
        staticRoutes: [...staticRoutes, newRoute],
      },
    });
  };

  const handleDeleteStaticRoute = (id: string) => {
    onUpdate({
      protocolConfiguration: {
        ...node.protocolConfiguration,
        staticRoutes: staticRoutes.filter((r) => r.id !== id),
      },
    });
  };

  return (
    <div className="space-y-4 p-4 text-xs">
      {/* Static Routes Section */}
      <div className="space-y-3">
        <h4 className="font-semibold text-foreground">Static Routes ({staticRoutes.length})</h4>

        <div className="rounded-lg border border-border bg-card/60 p-3 space-y-2">
          <Label className="text-[10px]">Add New Static Route</Label>
          <div className="grid grid-cols-3 gap-2">
            <Input value={dest} onChange={(e) => setDest(e.target.value)} placeholder="Dest Net" />
            <Input type="number" value={prefix} onChange={(e) => setPrefix(Number(e.target.value))} placeholder="/24" />
            <Input value={nextHop} onChange={(e) => setNextHop(e.target.value)} placeholder="Next Hop" />
          </div>
          <Button size="sm" onClick={handleAddStaticRoute} className="w-full h-7 gap-1 mt-1">
            <Plus className="h-3 w-3" /> Add Route
          </Button>
        </div>

        {staticRoutes.map((route) => (
          <div key={route.id} className="flex items-center justify-between rounded border border-border p-2 bg-accent/20">
            <div>
              <span className="font-mono font-medium text-foreground">
                {route.destinationPrefix}/{route.prefixLength}
              </span>
              <span className="text-[10px] text-muted-foreground ml-2">via {route.nextHop} (AD: 1)</span>
            </div>
            <button onClick={() => handleDeleteStaticRoute(route.id)} className="text-muted-foreground hover:text-red-400">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* OSPF Settings if Router */}
      {ospf && (
        <div className="border-t border-border pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground">OSPF Protocol</h4>
            <Switch
              checked={ospf.enabled}
              onCheckedChange={(checked) =>
                onUpdate({
                  protocolConfiguration: {
                    ...node.protocolConfiguration,
                    ospf: { ...ospf, enabled: checked },
                  },
                })
              }
            />
          </div>

          {ospf.enabled && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px]">Router ID</Label>
                <Input
                  value={ospf.routerId}
                  onChange={(e) =>
                    onUpdate({
                      protocolConfiguration: {
                        ...node.protocolConfiguration,
                        ospf: { ...ospf, routerId: e.target.value },
                      },
                    })
                  }
                  className="mt-0.5"
                />
              </div>
              <div>
                <Label className="text-[10px]">Area ID</Label>
                <Input
                  value={ospf.areaId}
                  onChange={(e) =>
                    onUpdate({
                      protocolConfiguration: {
                        ...node.protocolConfiguration,
                        ospf: { ...ospf, areaId: e.target.value },
                      },
                    })
                  }
                  className="mt-0.5"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* BGP Settings if Router */}
      {bgp && (
        <div className="border-t border-border pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground">BGP Protocol</h4>
            <Switch
              checked={bgp.enabled}
              onCheckedChange={(checked) =>
                onUpdate({
                  protocolConfiguration: {
                    ...node.protocolConfiguration,
                    bgp: { ...bgp, enabled: checked },
                  },
                })
              }
            />
          </div>

          {bgp.enabled && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px]">Local ASN</Label>
                <Input
                  type="number"
                  value={bgp.asn}
                  onChange={(e) =>
                    onUpdate({
                      protocolConfiguration: {
                        ...node.protocolConfiguration,
                        bgp: { ...bgp, asn: Number(e.target.value) },
                      },
                    })
                  }
                  className="mt-0.5 font-mono"
                />
              </div>
              <div>
                <Label className="text-[10px]">Advertised Net</Label>
                <Input
                  placeholder="192.168.1.0/24"
                  value={bgp.advertisedPrefixes[0] || ""}
                  onChange={(e) =>
                    onUpdate({
                      protocolConfiguration: {
                        ...node.protocolConfiguration,
                        bgp: { ...bgp, advertisedPrefixes: [e.target.value] },
                      },
                    })
                  }
                  className="mt-0.5 font-mono"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

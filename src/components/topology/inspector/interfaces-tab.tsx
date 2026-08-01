"use client";

import React from "react";
import { NetworkNode, NetworkInterface } from "@/features/topology/topology-types";
import { Button, Input, Label, Switch, Badge } from "@/components/ui";
import { suggestNextAvailableIp } from "@/features/addressing/address-assignment";
import { useTopologyStore } from "@/features/topology/topology-store";
import { Plus, Trash2, Wand2 } from "lucide-react";

interface InterfacesTabProps {
  node: NetworkNode;
  onUpdate: (updates: Partial<NetworkNode>) => void;
}

export function InterfacesTab({ node, onUpdate }: InterfacesTabProps) {
  const topology = useTopologyStore((state) => state.topology);

  const handleInterfaceChange = (index: number, updates: Partial<NetworkInterface>) => {
    const updated = [...node.interfaces];
    updated[index] = { ...updated[index], ...updates };
    onUpdate({ interfaces: updated });
  };

  const handleIpChange = (index: number, address: string, prefixLength: number = 24) => {
    const updated = [...node.interfaces];
    const currentIface = updated[index];
    updated[index] = {
      ...currentIface,
      ipv4: {
        address,
        prefixLength: currentIface.ipv4?.prefixLength || prefixLength,
      },
    };
    onUpdate({ interfaces: updated });
  };

  const handleSuggestIp = (index: number) => {
    const suggested = suggestNextAvailableIp(topology, "192.168.1.0", 24);
    handleIpChange(index, suggested);
  };

  const handleAddInterface = () => {
    const newIface: NetworkInterface = {
      id: `${node.id}-iface-${node.interfaces.length}`,
      deviceId: node.id,
      name: `eth${node.interfaces.length}`,
      type: "ethernet",
      macAddress: `02:00:00:00:${Math.floor(Math.random() * 89 + 10)}:${Math.floor(Math.random() * 89 + 10)}`,
      mtu: 1500,
      administrativeState: "up",
      operationalState: "up",
    };
    onUpdate({ interfaces: [...node.interfaces, newIface] });
  };

  const handleRemoveInterface = (index: number) => {
    if (node.interfaces.length <= 1) return;
    const updated = node.interfaces.filter((_, i) => i !== index);
    onUpdate({ interfaces: updated });
  };

  return (
    <div className="space-y-4 p-4 text-xs">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-foreground">Interfaces ({node.interfaces.length})</h4>
        <Button size="sm" variant="outline" onClick={handleAddInterface} className="h-7 text-[11px] gap-1">
          <Plus className="h-3 w-3" /> Add Interface
        </Button>
      </div>

      <div className="space-y-3">
        {node.interfaces.map((iface, index) => (
          <div key={iface.id} className="rounded-lg border border-border bg-card/60 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{iface.name}</span>
                <Badge variant={iface.administrativeState === "up" ? "success" : "destructive"} className="text-[9px]">
                  {iface.administrativeState.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={iface.administrativeState === "up"}
                  onCheckedChange={(checked) =>
                    handleInterfaceChange(index, { administrativeState: checked ? "up" : "down" })
                  }
                />
                {node.interfaces.length > 1 && (
                  <button onClick={() => handleRemoveInterface(index)} className="text-muted-foreground hover:text-red-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px]">IPv4 Address</Label>
                <div className="flex gap-1 mt-0.5">
                  <Input
                    value={iface.ipv4?.address || ""}
                    placeholder="192.168.1.10"
                    onChange={(e) => handleIpChange(index, e.target.value)}
                  />
                  <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={() => handleSuggestIp(index)} title="Suggest IP">
                    <Wand2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-[10px]">Prefix Length</Label>
                <Input
                  type="number"
                  min={8}
                  max={30}
                  value={iface.ipv4?.prefixLength || 24}
                  onChange={(e) =>
                    handleInterfaceChange(index, {
                      ipv4: { address: iface.ipv4?.address || "", prefixLength: Number(e.target.value) },
                    })
                  }
                  className="mt-0.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <Label className="text-[10px]">MAC Address</Label>
                <Input
                  value={iface.macAddress}
                  onChange={(e) => handleInterfaceChange(index, { macAddress: e.target.value })}
                  className="font-mono text-[10px] mt-0.5"
                />
              </div>

              <div>
                <Label className="text-[10px]">MTU (Bytes)</Label>
                <Input
                  type="number"
                  value={iface.mtu}
                  onChange={(e) => handleInterfaceChange(index, { mtu: Number(e.target.value) })}
                  className="font-mono text-[10px] mt-0.5"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

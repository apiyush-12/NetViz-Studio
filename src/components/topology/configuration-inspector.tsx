"use client";

import React, { useState } from "react";
import { useTopologyStore } from "@/features/topology/topology-store";
import { Button, Input, Label, Tabs, Badge } from "@/components/ui";
import { GeneralTab } from "./inspector/general-tab";
import { InterfacesTab } from "./inspector/interfaces-tab";
import { AddressingTab } from "./inspector/addressing-tab";
import { RoutingTab } from "./inspector/routing-tab";
import { ServicesTab } from "./inspector/services-tab";
import { TablesTab } from "./inspector/tables-tab";
import { X, Copy, Clipboard, Trash2, Sliders } from "lucide-react";

export function ConfigurationInspector() {
  const {
    topology,
    selectedNodeId,
    selectedLinkId,
    selectNode,
    selectLink,
    updateNode,
    deleteNode,
    updateLink,
    deleteLink,
    copyNodeConfig,
    pasteNodeConfig,
    copiedNodeConfig,
  } = useTopologyStore();

  const [activeTab, setActiveTab] = useState("general");

  const selectedNode = topology.nodes.find((n) => n.id === selectedNodeId);
  const selectedLink = topology.links.find((l) => l.id === selectedLinkId);

  if (!selectedNode && !selectedLink) return null;

  const nodeTabs = [
    { id: "general", label: "General" },
    { id: "interfaces", label: "Interfaces" },
    { id: "addressing", label: "Addressing" },
    { id: "routing", label: "Routing" },
    { id: "services", label: "Services" },
    { id: "tables", label: "Tables" },
  ];

  return (
    <aside className="w-80 border-l border-border bg-card flex flex-col h-full shadow-xl z-20 shrink-0">
      {/* Inspector Header */}
      <div className="flex items-center justify-between border-b border-border p-3">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">
            {selectedNode ? selectedNode.name : `Link Properties`}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {selectedNode && (
            <>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyNodeConfig(selectedNode.id)} title="Copy Config">
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                disabled={!copiedNodeConfig}
                onClick={() => pasteNodeConfig(selectedNode.id)}
                title="Paste Config"
              >
                <Clipboard className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-red-400 hover:text-red-300"
            onClick={() => {
              if (selectedNode) deleteNode(selectedNode.id);
              if (selectedLink) deleteLink(selectedLink.id);
            }}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { selectNode(null); selectLink(null); }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Selected Link Properties */}
      {selectedLink && (
        <div className="p-4 space-y-4 text-xs flex-1 overflow-y-auto">
          <div className="space-y-1">
            <Label className="text-[10px]">Link ID</Label>
            <Input value={selectedLink.id} disabled className="font-mono text-[11px] bg-accent/40" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px]">Bandwidth (Mbps)</Label>
              <Input
                type="number"
                value={selectedLink.bandwidthMbps}
                onChange={(e) => updateLink(selectedLink.id, { bandwidthMbps: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label className="text-[10px]">Latency (ms)</Label>
              <Input
                type="number"
                value={selectedLink.latencyMs}
                onChange={(e) => updateLink(selectedLink.id, { latencyMs: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px]">OSPF Cost</Label>
              <Input
                type="number"
                value={selectedLink.cost}
                onChange={(e) => updateLink(selectedLink.id, { cost: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label className="text-[10px]">Packet Loss %</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={selectedLink.packetLossPercentage}
                onChange={(e) => updateLink(selectedLink.id, { packetLossPercentage: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <Label className="text-xs font-semibold">Link Power State</Label>
            <Badge variant={selectedLink.administrativeState === "up" ? "success" : "destructive"}>
              {selectedLink.administrativeState.toUpperCase()}
            </Badge>
          </div>
          <Button
            size="sm"
            variant={selectedLink.administrativeState === "up" ? "destructive" : "default"}
            className="w-full h-8"
            onClick={() =>
              updateLink(selectedLink.id, {
                administrativeState: selectedLink.administrativeState === "up" ? "down" : "up",
                operationalState: selectedLink.administrativeState === "up" ? "down" : "up",
              })
            }
          >
            {selectedLink.administrativeState === "up" ? "Disable Link (Break)" : "Restore Link"}
          </Button>
        </div>
      )}

      {/* Selected Node Properties */}
      {selectedNode && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} tabs={nodeTabs} className="px-2 pt-1" />
          <div className="flex-1 overflow-y-auto">
            {activeTab === "general" && <GeneralTab node={selectedNode} onUpdate={(u) => updateNode(selectedNode.id, u)} />}
            {activeTab === "interfaces" && <InterfacesTab node={selectedNode} onUpdate={(u) => updateNode(selectedNode.id, u)} />}
            {activeTab === "addressing" && <AddressingTab node={selectedNode} onUpdate={(u) => updateNode(selectedNode.id, u)} />}
            {activeTab === "routing" && <RoutingTab node={selectedNode} onUpdate={(u) => updateNode(selectedNode.id, u)} />}
            {activeTab === "services" && <ServicesTab node={selectedNode} onUpdate={(u) => updateNode(selectedNode.id, u)} />}
            {activeTab === "tables" && <TablesTab node={selectedNode} />}
          </div>
        </div>
      )}
    </aside>
  );
}

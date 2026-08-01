"use client";

import React, { useState } from "react";
import { DEVICE_CATALOG } from "@/data/device-catalog";
import { DeviceCategory, NetworkNodeType } from "@/features/topology/topology-types";
import { useTopologyStore } from "@/features/topology/topology-store";
import { Input } from "@/components/ui";
import {
  Search,
  Monitor,
  Laptop,
  Smartphone,
  HardDrive,
  Printer,
  Network,
  Layers,
  Router as RouterIcon,
  Wifi,
  Shield,
  Scale,
  Server,
  Globe,
  Database,
  ServerCog,
  FolderGit2,
  Mail,
  Clock,
  Cloud,
  CloudLightning,
  Radio,
  Boxes,
  Send,
  Inbox,
  Eye,
  Zap,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Monitor,
  Laptop,
  Smartphone,
  HardDrive,
  Printer,
  Network,
  Layers,
  Router: RouterIcon,
  Wifi,
  Shield,
  Scale,
  Server,
  Globe,
  Database,
  ServerCog,
  FolderGit2,
  Mail,
  Clock,
  Cloud,
  CloudLightning,
  Radio,
  Boxes,
  Send,
  Inbox,
  Eye,
  Zap,
};

const CATEGORIES: Array<{ key: DeviceCategory; label: string }> = [
  { key: "end-device", label: "End Devices" },
  { key: "network-device", label: "Network Devices" },
  { key: "server", label: "Servers" },
  { key: "cloud-wan", label: "Cloud & WAN" },
  { key: "special", label: "Special Nodes" },
];

export function DevicePalette() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const { addNode, mode } = useTopologyStore();

  const toggleCategory = (catKey: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [catKey]: !prev[catKey] }));
  };

  const filteredCatalog = DEVICE_CATALOG.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDragStart = (event: React.DragEvent, type: NetworkNodeType) => {
    event.dataTransfer.setData("application/reactflow", type);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-full z-10 shrink-0 select-none">
      <div className="p-3 border-b border-border space-y-2">
        <h3 className="font-semibold text-sm text-foreground">Device Palette</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <div className="flex flex-wrap gap-1 pt-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              selectedCategory === "all" ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                selectedCategory === cat.key ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {CATEGORIES.map((cat) => {
          const itemsInCat = filteredCatalog.filter((item) => item.category === cat.key);
          if (itemsInCat.length === 0) return null;

          const isCollapsed = collapsedCategories[cat.key];

          return (
            <div key={cat.key} className="space-y-1">
              <button
                onClick={() => toggleCategory(cat.key)}
                className="flex items-center justify-between w-full text-xs font-semibold text-muted-foreground hover:text-foreground py-1"
              >
                <span>{cat.label} ({itemsInCat.length})</span>
                {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {!isCollapsed && (
                <div className="grid grid-cols-1 gap-1.5 pt-0.5">
                  {itemsInCat.map((item) => {
                    const IconComp = ICON_MAP[item.iconName] || Network;

                    return (
                      <div
                        key={item.type}
                        draggable={mode === "design"}
                        onDragStart={(e) => handleDragStart(e, item.type)}
                        onClick={() => {
                          if (mode === "design") {
                            addNode(item.type, { x: 400 + Math.random() * 50, y: 250 + Math.random() * 50 });
                          }
                        }}
                        className={`flex items-center gap-2.5 rounded-lg border border-border p-2 bg-card/80 hover:bg-accent/60 hover:border-primary/50 transition-all cursor-grab active:cursor-grabbing ${
                          mode === "simulation" ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        title={`${item.name} - ${item.description}`}
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-primary shrink-0">
                          <IconComp className="h-4 w-4" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { DeviceStatus, NetworkNodeType, NetworkInterface } from "@/features/topology/topology-types";
import { cn } from "@/lib/utils";
import {
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
  AlertTriangle,
  AlertCircle,
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

interface BaseNetworkNodeProps {
  id: string;
  name: string;
  type: NetworkNodeType;
  iconName: string;
  status: DeviceStatus;
  interfaces: NetworkInterface[];
  selected?: boolean;
  hasError?: boolean;
  hasWarning?: boolean;
  children?: React.ReactNode;
}

export function BaseNetworkNode({
  name,
  type,
  iconName,
  status,
  interfaces,
  selected,
  hasError,
  hasWarning,
  children,
}: BaseNetworkNodeProps) {
  const IconComponent = ICON_MAP[iconName] || Network;

  const statusColorMap: Record<DeviceStatus, string> = {
    online: "bg-emerald-500",
    offline: "bg-gray-500",
    initializing: "bg-blue-500 animate-pulse",
    converging: "bg-amber-500 animate-spin",
    warning: "bg-amber-500",
    error: "bg-red-500",
    selected: "bg-primary",
    "packet-active": "bg-purple-500 animate-ping",
  };

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-between rounded-xl border-2 bg-card p-3 shadow-md transition-all min-w-[140px]",
        selected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50",
        status === "offline" && "opacity-60 grayscale"
      )}
    >
      <div className="absolute -top-2 left-1/2 flex -translate-x-1/2 gap-2">
        {interfaces.slice(0, 2).map((iface) => (
          <Handle
            key={iface.id}
            type="target"
            position={Position.Top}
            id={iface.id}
            className="!h-3 !w-3 !border-2 !border-background !bg-primary hover:!scale-125 transition-transform"
            title={`${iface.name} (${iface.ipv4?.address || "No IP"})`}
          />
        ))}
      </div>

      <div className="flex w-full items-center justify-between gap-1 mb-1">
        <div className="flex items-center gap-1.5">
          <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", statusColorMap[status] || "bg-emerald-500")} />
          <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">{type}</span>
        </div>
        {hasError && (
          <span title="Configuration Error">
            <AlertCircle className="h-3.5 w-3.5 text-red-500" />
          </span>
        )}
        {hasWarning && !hasError && (
          <span title="Warning">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          </span>
        )}
      </div>

      <div className="flex flex-col items-center justify-center py-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/60 text-foreground mb-1">
          <IconComponent className="h-6 w-6 text-primary" />
        </div>
        <p className="text-xs font-semibold text-foreground text-center line-clamp-1">{name}</p>
      </div>

      {children && <div className="w-full text-[11px] text-muted-foreground mt-1 border-t border-border/40 pt-1">{children}</div>}

      <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 gap-2">
        {interfaces.slice(2, 4).map((iface) => (
          <Handle
            key={iface.id}
            type="source"
            position={Position.Bottom}
            id={iface.id}
            className="!h-3 !w-3 !border-2 !border-background !bg-primary hover:!scale-125 transition-transform"
            title={`${iface.name} (${iface.ipv4?.address || "No IP"})`}
          />
        ))}
        {interfaces.length === 1 && (
          <Handle
            type="source"
            position={Position.Bottom}
            id={`${interfaces[0].id}-out`}
            className="!h-3 !w-3 !border-2 !border-background !bg-primary hover:!scale-125 transition-transform"
          />
        )}
      </div>
    </div>
  );
}

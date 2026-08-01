"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  Node,
  NodeChange,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTheme } from "next-themes";

import { useTopologyStore } from "@/features/topology/topology-store";
import { HostNode } from "./nodes/host-node";
import { RouterNode } from "./nodes/router-node";
import { SwitchNode } from "./nodes/switch-node";
import { ServerNode } from "./nodes/server-node";
import { FirewallNode } from "./nodes/firewall-node";
import { CloudNode } from "./nodes/cloud-node";
import { AutonomousSystemNode } from "./nodes/autonomous-system-node";

import { NetworkLinkEdge } from "./edges/network-link-edge";
import { AnimatedPacketEdge } from "./edges/animated-packet-edge";
import { NetworkNodeType } from "@/features/topology/topology-types";

const nodeTypesMap = {
  pc: HostNode,
  laptop: HostNode,
  mobile: HostNode,
  host: HostNode,
  printer: HostNode,
  "l2-switch": SwitchNode,
  "l3-switch": SwitchNode,
  router: RouterNode,
  "access-point": SwitchNode,
  firewall: FirewallNode,
  "load-balancer": RouterNode,
  server: ServerNode,
  "web-server": ServerNode,
  "dns-server": ServerNode,
  "dhcp-server": ServerNode,
  "ftp-server": ServerNode,
  "mail-server": ServerNode,
  "ntp-server": ServerNode,
  cloud: CloudNode,
  "wan-cloud": CloudNode,
  "isp-router": RouterNode,
  "autonomous-system": AutonomousSystemNode,
  "packet-source": HostNode,
  "packet-destination": HostNode,
  "network-observer": HostNode,
  "traffic-generator": HostNode,
};

const edgeTypesMap = {
  networkLink: NetworkLinkEdge,
  animatedPacket: AnimatedPacketEdge,
};

function CanvasInner() {
  const {
    topology,
    mode,
    selectedNodeId,
    selectedLinkId,
    selectNode,
    selectLink,
    addNode,
    updateNodePosition,
    addLink,
    deleteNode,
    duplicateNode,
    copyNodeConfig,
    pasteNodeConfig,
    setTrafficSenderOpen,
    undo,
    redo,
  } = useTopologyStore();

  const { theme, resolvedTheme } = useTheme();
  const reactFlowInstance = useReactFlow();

  const colorMode = (resolvedTheme === "light" || theme === "light") ? "light" : "dark";

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId?: string;
    linkId?: string;
  } | null>(null);

  const rfNodes: Node[] = useMemo(() => {
    return topology.nodes.map((node) => ({
      id: node.id,
      type: node.type in nodeTypesMap ? node.type : "host",
      position: node.position,
      draggable: mode === "design",
      data: {
        nodeId: node.id,
        name: node.name,
        type: node.type,
        status: node.status,
        interfaces: node.interfaces,
        configuration: node.configuration,
        protocolConfiguration: node.protocolConfiguration,
        arpTable: node.arpTable || [],
        macTable: node.macTable || [],
        routingTable: node.routingTable || [],
        ospfNeighbors: node.ospfNeighbors || [],
        bgpRoutes: node.bgpRoutes || [],
        dhcpLeases: node.dhcpLeases || [],
      },
      selected: node.id === selectedNodeId,
    }));
  }, [topology.nodes, mode, selectedNodeId]);

  const rfEdges: Edge[] = useMemo(() => {
    return topology.links.map((link) => ({
      id: link.id,
      source: link.sourceNodeId,
      sourceHandle: link.sourceInterfaceId,
      target: link.targetNodeId,
      targetHandle: link.targetInterfaceId,
      type: "networkLink",
      selected: link.id === selectedLinkId,
      data: {
        bandwidthMbps: link.bandwidthMbps,
        latencyMs: link.latencyMs,
        cost: link.cost,
        administrativeState: link.administrativeState,
        operationalState: link.operationalState,
        type: link.type,
      },
    }));
  }, [topology.links, selectedLinkId]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        if (change.type === "position" && change.position && mode === "design") {
          updateNodePosition(change.id, change.position);
        }
      });
    },
    [mode, updateNodePosition]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (mode !== "design") return;
      if (params.source && params.target && params.sourceHandle && params.targetHandle) {
        addLink(params.source, params.sourceHandle, params.target, params.targetHandle);
      }
    },
    [mode, addLink]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectNode(node.id);
      setContextMenu(null);
    },
    [selectNode]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      selectLink(edge.id);
      setContextMenu(null);
    },
    [selectLink]
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
    selectLink(null);
    setContextMenu(null);
  }, [selectNode, selectLink]);

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      nodeId: node.id,
    });
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (mode !== "design") return;

      const type = event.dataTransfer.getData("application/reactflow") as NetworkNodeType;
      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [mode, reactFlowInstance, addNode]
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedNodeId) deleteNode(selectedNodeId);
      } else if ((event.ctrlKey || event.metaKey) && event.key === "d") {
        event.preventDefault();
        if (selectedNodeId) duplicateNode(selectedNodeId);
      } else if ((event.ctrlKey || event.metaKey) && event.key === "c") {
        event.preventDefault();
        if (selectedNodeId) copyNodeConfig(selectedNodeId);
      } else if ((event.ctrlKey || event.metaKey) && event.key === "v") {
        event.preventDefault();
        if (selectedNodeId) pasteNodeConfig(selectedNodeId);
      } else if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        redo();
      } else if ((event.ctrlKey || event.metaKey) && event.key === "z") {
        event.preventDefault();
        undo();
      } else if (event.key.toLowerCase() === "f") {
        reactFlowInstance.fitView();
      } else if (event.key === "Escape") {
        selectNode(null);
        selectLink(null);
        setContextMenu(null);
      }
    },
    [selectedNodeId, deleteNode, duplicateNode, copyNodeConfig, pasteNodeConfig, undo, redo, reactFlowInstance, selectNode, selectLink]
  );

  return (
    <div
      className="relative flex-1 h-full w-full bg-background overflow-hidden outline-none"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypesMap}
        edgeTypes={edgeTypesMap}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onNodeContextMenu={onNodeContextMenu}
        fitView
        colorMode={colorMode}
        snapToGrid={topology.settings.gridSnap}
        snapGrid={[15, 15]}
      >
        <Background color={colorMode === "light" ? "#cbd5e1" : "#64748b"} gap={16} size={1} />
        <Controls position="bottom-right" className="bg-card border-border text-foreground shadow-lg" />
        <MiniMap position="bottom-left" zoomable pannable className="bg-card/90 border border-border rounded-lg shadow-lg" />
      </ReactFlow>

      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 min-w-[160px] rounded-lg border border-border bg-card p-1 shadow-2xl text-xs space-y-0.5"
          onClick={() => setContextMenu(null)}
        >
          {contextMenu.nodeId && (
            <>
              <button
                onClick={() => selectNode(contextMenu.nodeId!)}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-accent text-foreground font-medium"
              >
                Configure Device
              </button>
              <button
                onClick={() => duplicateNode(contextMenu.nodeId!)}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-accent text-foreground"
              >
                Duplicate Node (Ctrl+D)
              </button>
              <button
                onClick={() => setTrafficSenderOpen(true)}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-accent text-emerald-500 dark:text-emerald-400 font-medium"
              >
                Send Test Packet
              </button>
              <div className="h-px bg-border my-1" />
              <button
                onClick={() => deleteNode(contextMenu.nodeId!)}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-red-500/10 text-red-500 dark:text-red-400 font-medium"
              >
                Delete Device
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function TopologyCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}

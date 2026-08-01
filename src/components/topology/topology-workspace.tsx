"use client";

import React from "react";
import { TopologyToolbar } from "./topology-toolbar";
import { DevicePalette } from "./device-palette";
import { TopologyCanvas } from "./topology-canvas";
import { ConfigurationInspector } from "./configuration-inspector";
import { SimulationPanel } from "./simulation-panel";
import { ValidationDrawer } from "./validation-drawer";
import { SampleTopologyDialog } from "./sample-topology-dialog";
import { SaveTopologyDialog } from "./save-topology-dialog";
import { ImportTopologyDialog } from "./import-topology-dialog";
import { TrafficSenderDialog } from "./traffic-sender-dialog";

export function TopologyWorkspace() {
  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-background text-foreground">
      {/* Region 1: Top Toolbar */}
      <TopologyToolbar />

      {/* Main Workspace Row */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Region 2: Left Device Palette */}
        <DevicePalette />

        {/* Region 3: Center Canvas & Bottom Panel Container */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <TopologyCanvas />
          {/* Region 5: Bottom Simulation Timeline Panel */}
          <SimulationPanel />
        </div>

        {/* Region 4: Right Configuration Inspector Panel */}
        <ConfigurationInspector />
      </div>

      {/* Drawers & Dialog Overlay Modals */}
      <ValidationDrawer />
      <SampleTopologyDialog />
      <SaveTopologyDialog />
      <ImportTopologyDialog />
      <TrafficSenderDialog />
    </div>
  );
}

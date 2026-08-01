import { create } from "zustand";
import {
  NetworkTopology,
  NetworkNode,
  NetworkLink,
  TopologyValidationIssue,
  SimulationEvent,
  NetworkPacket,
  SimulationScenario,
  LabelVisibilitySettings,
  NetworkNodeType,
  LinkType,
  DeviceConfiguration,
  ProtocolConfiguration,
} from "@/features/topology/topology-types";
import { createDefaultNode, createDefaultLink } from "@/features/topology/topology-defaults";
import { validateTopology } from "@/features/topology/topology-validator";
import { runForwardingSimulation } from "@/features/forwarding/forwarding-engine";
import { TopologyHistory } from "@/features/topology/topology-history";
import { SAMPLE_TOPOLOGIES } from "@/data/sample-topologies";
import { autoAssignIpAddresses } from "@/features/addressing/address-assignment";

const historyManager = new TopologyHistory();

export interface TopologyState {
  topology: NetworkTopology;
  mode: "design" | "simulation";
  selectedNodeId: string | null;
  selectedLinkId: string | null;
  copiedNodeConfig: { configuration: DeviceConfiguration; protocolConfiguration: ProtocolConfiguration } | null;

  validationIssues: TopologyValidationIssue[];
  isValidationDrawerOpen: boolean;

  simulationEvents: SimulationEvent[];
  activePackets: NetworkPacket[];
  selectedPacketId: string | null;
  currentStepIndex: number;
  isPlaying: boolean;
  simulationSpeed: number;
  currentScenario: SimulationScenario | null;

  isSampleDialogOpen: boolean;
  isSaveDialogOpen: boolean;
  isImportDialogOpen: boolean;
  isTrafficSenderOpen: boolean;

  canUndo: boolean;
  canRedo: boolean;

  setMode: (mode: "design" | "simulation") => boolean;
  selectNode: (nodeId: string | null) => void;
  selectLink: (linkId: string | null) => void;

  addNode: (type: NetworkNodeType, position: { x: number; y: number }) => void;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  updateNode: (nodeId: string, updates: Partial<NetworkNode>) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;

  addLink: (sourceNodeId: string, sourceInterfaceId: string, targetNodeId: string, targetInterfaceId: string, type?: LinkType) => void;
  updateLink: (linkId: string, updates: Partial<NetworkLink>) => void;
  deleteLink: (linkId: string) => void;

  copyNodeConfig: (nodeId: string) => void;
  pasteNodeConfig: (nodeId: string) => void;

  toggleLabelVisibility: (key: keyof LabelVisibilitySettings) => void;

  runValidation: () => TopologyValidationIssue[];
  autoFixIssue: (issueId: string) => void;

  autoAssignIps: (baseNetwork?: string) => void;

  startSimulationScenario: (scenario: SimulationScenario) => void;
  setStepIndex: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  togglePlayPause: () => void;
  setSpeed: (speed: number) => void;
  clearSimulation: () => void;

  loadSampleTopology: (sampleId: string) => void;
  loadTopology: (topology: NetworkTopology) => void;
  resetTopology: () => void;

  setSampleDialogOpen: (open: boolean) => void;
  setSaveDialogOpen: (open: boolean) => void;
  setImportDialogOpen: (open: boolean) => void;
  setTrafficSenderOpen: (open: boolean) => void;
  setValidationDrawerOpen: (open: boolean) => void;

  undo: () => void;
  redo: () => void;
}

const initialTopology = SAMPLE_TOPOLOGIES[0].getTopology();

export const useTopologyStore = create<TopologyState>((set, get) => ({
  topology: initialTopology,
  mode: "design",
  selectedNodeId: null,
  selectedLinkId: null,
  copiedNodeConfig: null,

  validationIssues: [],
  isValidationDrawerOpen: false,

  simulationEvents: [],
  activePackets: [],
  selectedPacketId: null,
  currentStepIndex: 0,
  isPlaying: false,
  simulationSpeed: 1,
  currentScenario: null,

  isSampleDialogOpen: false,
  isSaveDialogOpen: false,
  isImportDialogOpen: false,
  isTrafficSenderOpen: false,

  canUndo: false,
  canRedo: false,

  setMode: (mode) => {
    if (mode === "simulation") {
      const issues = get().runValidation();
      const criticalErrors = issues.filter((i) => i.severity === "critical" || i.severity === "error");
      if (criticalErrors.length > 0) {
        set({ isValidationDrawerOpen: true });
        return false;
      }
    }
    set({ mode });
    return true;
  },

  selectNode: (selectedNodeId) => set({ selectedNodeId, selectedLinkId: null }),
  selectLink: (selectedLinkId) => set({ selectedLinkId, selectedNodeId: null }),

  addNode: (type, position) => {
    const state = get();
    historyManager.pushState(state.topology);
    const newNode = createDefaultNode(type, position);
    const updatedNodes = [...state.topology.nodes, newNode];
    const updatedTopology = { ...state.topology, nodes: updatedNodes, updatedAt: new Date().toISOString() };
    set({
      topology: updatedTopology,
      selectedNodeId: newNode.id,
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
    });
  },

  updateNodePosition: (nodeId, position) => {
    set((state) => {
      const updatedNodes = state.topology.nodes.map((n) => (n.id === nodeId ? { ...n, position } : n));
      return { topology: { ...state.topology, nodes: updatedNodes } };
    });
  },

  updateNode: (nodeId, updates) => {
    const state = get();
    historyManager.pushState(state.topology);
    const updatedNodes = state.topology.nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n));
    set({
      topology: { ...state.topology, nodes: updatedNodes, updatedAt: new Date().toISOString() },
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
    });
  },

  deleteNode: (nodeId) => {
    const state = get();
    historyManager.pushState(state.topology);
    const updatedNodes = state.topology.nodes.filter((n) => n.id !== nodeId);
    const updatedLinks = state.topology.links.filter((l) => l.sourceNodeId !== nodeId && l.targetNodeId !== nodeId);
    set({
      topology: { ...state.topology, nodes: updatedNodes, links: updatedLinks, updatedAt: new Date().toISOString() },
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
    });
  },

  duplicateNode: (nodeId) => {
    const state = get();
    const node = state.topology.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    historyManager.pushState(state.topology);
    const newNode = createDefaultNode(node.type, { x: node.position.x + 40, y: node.position.y + 40 });
    newNode.name = `${node.name} Copy`;
    set({
      topology: { ...state.topology, nodes: [...state.topology.nodes, newNode] },
      selectedNodeId: newNode.id,
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
    });
  },

  addLink: (sourceNodeId, sourceInterfaceId, targetNodeId, targetInterfaceId, type = "ethernet") => {
    const state = get();
    if (sourceNodeId === targetNodeId) return;

    historyManager.pushState(state.topology);
    const newLink = createDefaultLink(sourceNodeId, sourceInterfaceId, targetNodeId, targetInterfaceId, type);
    const updatedLinks = [...state.topology.links, newLink];

    set({
      topology: { ...state.topology, links: updatedLinks, updatedAt: new Date().toISOString() },
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
    });
  },

  updateLink: (linkId, updates) => {
    const state = get();
    historyManager.pushState(state.topology);
    const updatedLinks = state.topology.links.map((l) => (l.id === linkId ? { ...l, ...updates } : l));
    set({
      topology: { ...state.topology, links: updatedLinks },
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
    });
  },

  deleteLink: (linkId) => {
    const state = get();
    historyManager.pushState(state.topology);
    const updatedLinks = state.topology.links.filter((l) => l.id !== linkId);
    set({
      topology: { ...state.topology, links: updatedLinks },
      selectedLinkId: state.selectedLinkId === linkId ? null : state.selectedLinkId,
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
    });
  },

  copyNodeConfig: (nodeId) => {
    const node = get().topology.nodes.find((n) => n.id === nodeId);
    if (node) {
      set({ copiedNodeConfig: { configuration: node.configuration, protocolConfiguration: node.protocolConfiguration } });
    }
  },

  pasteNodeConfig: (nodeId) => {
    const config = get().copiedNodeConfig;
    if (config) {
      get().updateNode(nodeId, {
        configuration: JSON.parse(JSON.stringify(config.configuration)),
        protocolConfiguration: JSON.parse(JSON.stringify(config.protocolConfiguration)),
      });
    }
  },

  toggleLabelVisibility: (key) => {
    set((state) => {
      const labels = state.topology.settings.labelVisibility;
      const updatedLabels = { ...labels, [key]: !labels[key] };
      return {
        topology: {
          ...state.topology,
          settings: { ...state.topology.settings, labelVisibility: updatedLabels },
        },
      };
    });
  },

  runValidation: () => {
    const issues = validateTopology(get().topology);
    set({ validationIssues: issues });
    return issues;
  },

  autoFixIssue: (issueId) => {
    const state = get();
    const issue = state.validationIssues.find((i) => i.id === issueId);
    if (!issue || !issue.canAutoFix) return;

    if (issue.nodeId && issue.category === "addressing") {
      state.autoAssignIps();
    } else if (issue.linkId) {
      state.updateLink(issue.linkId, { administrativeState: "up", operationalState: "up" });
    }
    state.runValidation();
  },

  autoAssignIps: (baseNetwork = "192.168.1.0") => {
    const state = get();
    historyManager.pushState(state.topology);
    const { updatedTopology } = autoAssignIpAddresses(state.topology, baseNetwork);
    set({
      topology: updatedTopology,
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
    });
    get().runValidation();
  },

  startSimulationScenario: (scenario) => {
    const state = get();
    const result = runForwardingSimulation(state.topology, scenario);
    set({
      mode: "simulation",
      currentScenario: scenario,
      simulationEvents: result.events,
      activePackets: [result.packet],
      selectedPacketId: result.packet.id,
      currentStepIndex: 0,
      isPlaying: true,
    });
  },

  setStepIndex: (index) => set({ currentStepIndex: index }),

  nextStep: () => {
    set((state) => ({
      currentStepIndex: Math.min(state.currentStepIndex + 1, state.simulationEvents.length - 1),
    }));
  },

  prevStep: () => {
    set((state) => ({
      currentStepIndex: Math.max(0, state.currentStepIndex - 1),
    }));
  },

  togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setSpeed: (simulationSpeed) => set({ simulationSpeed }),

  clearSimulation: () => {
    set({
      simulationEvents: [],
      activePackets: [],
      selectedPacketId: null,
      currentStepIndex: 0,
      isPlaying: false,
      currentScenario: null,
    });
  },

  loadSampleTopology: (sampleId) => {
    const sample = SAMPLE_TOPOLOGIES.find((s) => s.id === sampleId) || SAMPLE_TOPOLOGIES[0];
    const topo = sample.getTopology();
    historyManager.clear();
    set({
      topology: topo,
      mode: "design",
      selectedNodeId: null,
      selectedLinkId: null,
      simulationEvents: [],
      activePackets: [],
      isSampleDialogOpen: false,
      canUndo: false,
      canRedo: false,
    });
    get().runValidation();
  },

  loadTopology: (topology) => {
    historyManager.clear();
    set({
      topology,
      mode: "design",
      selectedNodeId: null,
      selectedLinkId: null,
      simulationEvents: [],
      activePackets: [],
      canUndo: false,
      canRedo: false,
    });
    get().runValidation();
  },

  resetTopology: () => {
    const newTopo = SAMPLE_TOPOLOGIES[0].getTopology();
    historyManager.clear();
    set({
      topology: newTopo,
      mode: "design",
      selectedNodeId: null,
      selectedLinkId: null,
      simulationEvents: [],
      activePackets: [],
      canUndo: false,
      canRedo: false,
    });
  },

  setSampleDialogOpen: (isSampleDialogOpen) => set({ isSampleDialogOpen }),
  setSaveDialogOpen: (isSaveDialogOpen) => set({ isSaveDialogOpen }),
  setImportDialogOpen: (isImportDialogOpen) => set({ isImportDialogOpen }),
  setTrafficSenderOpen: (isTrafficSenderOpen) => set({ isTrafficSenderOpen }),
  setValidationDrawerOpen: (isValidationDrawerOpen) => set({ isValidationDrawerOpen }),

  undo: () => {
    const state = get();
    if (!historyManager.canUndo()) return;
    const previous = historyManager.undo(state.topology);
    if (previous) {
      set({
        topology: previous,
        canUndo: historyManager.canUndo(),
        canRedo: historyManager.canRedo(),
      });
    }
  },

  redo: () => {
    const state = get();
    if (!historyManager.canRedo()) return;
    const next = historyManager.redo(state.topology);
    if (next) {
      set({
        topology: next,
        canUndo: historyManager.canUndo(),
        canRedo: historyManager.canRedo(),
      });
    }
  },
}));

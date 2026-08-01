import { create } from "zustand";
import type { SimulationSpeed } from "@/lib/constants";
import type {
  SimulationEvent,
  SimulationState,
  Packet,
  TopologyDefinition,
} from "./simulation-types";
import { SimulationEngine } from "./simulation-engine";
import { getProtocol } from "@/features/protocols/registry";

interface SimulationStore {
  protocolId: string | null;
  config: Record<string, unknown>;
  topology: TopologyDefinition | null;
  events: SimulationEvent[];
  packets: Packet[];
  currentStep: number;
  playbackState: SimulationState;
  speed: SimulationSpeed;
  seed: string;
  selectedEventId: string | null;
  selectedPacketId: string | null;
  engine: SimulationEngine | null;
  protocolState: Record<string, unknown>;

  loadProtocol: (protocolId: string, configOverride?: Record<string, unknown>) => void;
  play: () => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  scrubTo: (step: number) => void;
  setSpeed: (speed: SimulationSpeed) => void;
  setSeed: (seed: string) => void;
  selectEvent: (eventId: string | null) => void;
  selectPacket: (packetId: string | null) => void;
  updateConfig: (config: Record<string, unknown>) => void;
  regenerate: () => void;
  getSelectedEvent: () => SimulationEvent | null;
  getSelectedPacket: () => Packet | null;
}

function createEngine(set: (partial: Partial<SimulationStore>) => void): SimulationEngine {
  return new SimulationEngine({
    onStepChange: (step, event) => {
      set({
        currentStep: step,
        selectedEventId: event?.id ?? null,
        selectedPacketId: event?.packetId ?? null,
        protocolState: extractProtocolState(event),
      });
    },
    onStateChange: (state) => set({ playbackState: state }),
    onComplete: () => set({ playbackState: "completed" }),
  });
}

function extractProtocolState(
  event: SimulationEvent | null
): Record<string, unknown> {
  if (!event?.payload) return {};
  const state: Record<string, unknown> = {};
  if (event.payload.senderState) state.senderState = event.payload.senderState;
  if (event.payload.receiverState) state.receiverState = event.payload.receiverState;
  if (event.payload.congestionWindow) state.congestionWindow = event.payload.congestionWindow;
  if (event.payload.sendWindow) state.sendWindow = event.payload.sendWindow;
  return state;
}

export const useSimulationStore = create<SimulationStore>((set, get) => {
  const engine = createEngine((partial) => set(partial));

  return {
    protocolId: null,
    config: {},
    topology: null,
    events: [],
    packets: [],
    currentStep: -1,
    playbackState: "idle",
    speed: 1,
    seed: "netviz-default",
    selectedEventId: null,
    selectedPacketId: null,
    engine,
    protocolState: {},

    loadProtocol: (protocolId, configOverride) => {
      const protocol = getProtocol(protocolId);
      if (!protocol) return;

      const config = { ...protocol.defaultConfiguration, ...configOverride };
      const result = protocol.generateSimulation(
        protocol.defaultTopology,
        config,
        get().seed
      );

      engine.load(result.events, result.packets);

      set({
        protocolId,
        config,
        topology: protocol.defaultTopology,
        events: result.events,
        packets: result.packets,
        currentStep: -1,
        playbackState: "idle",
        selectedEventId: null,
        selectedPacketId: null,
        protocolState: result.initialState ?? {},
      });
    },

    play: () => get().engine?.play(),
    pause: () => get().engine?.pause(),
    resume: () => get().engine?.resume(),
    restart: () => {
      get().engine?.restart();
      set({ selectedEventId: null, selectedPacketId: null, protocolState: {} });
    },
    stepForward: () => get().engine?.stepForward(),
    stepBackward: () => get().engine?.stepBackward(),
    scrubTo: (step) => get().engine?.scrubTo(step),
    setSpeed: (speed) => {
      get().engine?.setSpeed(speed);
      set({ speed });
    },
    setSeed: (seed) => set({ seed }),

    selectEvent: (eventId) => {
      const event = get().events.find((e) => e.id === eventId) ?? null;
      set({
        selectedEventId: eventId,
        selectedPacketId: event?.packetId ?? null,
        protocolState: extractProtocolState(event),
      });
    },

    selectPacket: (packetId) => set({ selectedPacketId: packetId }),

    updateConfig: (config) => {
      set({ config: { ...get().config, ...config } });
    },

    regenerate: () => {
      const { protocolId, config } = get();
      if (protocolId) get().loadProtocol(protocolId, config);
    },

    getSelectedEvent: () => {
      const { selectedEventId, events } = get();
      return events.find((e) => e.id === selectedEventId) ?? null;
    },

    getSelectedPacket: () => {
      const { selectedPacketId, packets } = get();
      return packets.find((p) => p.id === selectedPacketId) ?? null;
    },
  };
});

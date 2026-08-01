import { create } from "zustand";
import { NetworkLab, LabProgress, LabValidationResult } from "./lab-types";
import { labRegistry } from "./lab-registry";
import { getLabProgress, saveLabProgress, clearLabProgress } from "./lab-persistence";
import { evaluateTaskValidation } from "./validation/validation-engine";
import { applyLabFaults } from "./faults/fault-engine";
import { useTopologyStore } from "@/features/topology/topology-store";

export interface LabStoreState {
  currentLab: NetworkLab | null;
  progress: LabProgress | null;
  activeTaskId: string | null;
  revealedHintLevels: Record<string, number>;
  taskValidationResults: Record<string, LabValidationResult>;
  elapsedSeconds: number;
  timerActive: boolean;
  isCompletionDialogOpen: boolean;

  loadLab: (labId: string) => boolean;
  startOrResumeLab: (labId: string) => void;
  setActiveTask: (taskId: string) => void;
  revealNextHint: (taskId: string) => void;
  validateTask: (taskId: string, userAnswer?: string | number) => LabValidationResult;
  skipTask: (taskId: string) => void;
  resetLabProgress: (labId: string) => void;
  tickTimer: () => void;
  setCompletionDialogOpen: (open: boolean) => void;
}

export const useLabStore = create<LabStoreState>((set, get) => ({
  currentLab: null,
  progress: null,
  activeTaskId: null,
  revealedHintLevels: {},
  taskValidationResults: {},
  elapsedSeconds: 0,
  timerActive: false,
  isCompletionDialogOpen: false,

  loadLab: (labId) => {
    const lab = labRegistry.getLab(labId);
    if (!lab) return false;

    let saved = getLabProgress(lab.id);
    if (!saved) {
      saved = {
        labId: lab.id,
        status: "not-started",
        completedTaskIds: [],
        skippedTaskIds: [],
        attempts: {},
        hintsUsed: {},
        score: 0,
        elapsedSeconds: 0,
      };
    }

    set({
      currentLab: lab,
      progress: saved,
      activeTaskId: saved.activeTaskId || lab.tasks[0]?.id || null,
      elapsedSeconds: saved.elapsedSeconds || 0,
      timerActive: false,
    });

    return true;
  },

  startOrResumeLab: (labId) => {
    const state = get();
    if (!state.currentLab || state.currentLab.id !== labId) {
      state.loadLab(labId);
    }

    const lab = get().currentLab!;
    const initialTopo = applyLabFaults(lab.initialTopology, lab.faults);

    useTopologyStore.getState().loadTopology(initialTopo);

    const now = new Date().toISOString();
    const updatedProgress: LabProgress = {
      ...get().progress!,
      status: get().progress!.status === "completed" ? "completed" : "in-progress",
      startedAt: get().progress!.startedAt || now,
      lastOpenedAt: now,
    };

    saveLabProgress(updatedProgress);

    set({
      progress: updatedProgress,
      timerActive: true,
    });
  },

  setActiveTask: (taskId) => set({ activeTaskId: taskId }),

  revealNextHint: (taskId) => {
    set((state) => {
      const currentLevel = state.revealedHintLevels[taskId] || 0;
      const nextLevel = currentLevel + 1;

      const hintsUsed = { ...state.progress?.hintsUsed, [taskId]: nextLevel };
      const updatedProgress: LabProgress = { ...state.progress!, hintsUsed };
      saveLabProgress(updatedProgress);

      return {
        revealedHintLevels: { ...state.revealedHintLevels, [taskId]: nextLevel },
        progress: updatedProgress,
      };
    });
  },

  validateTask: (taskId, userAnswer) => {
    const state = get();
    const lab = state.currentLab;
    const progress = state.progress;
    if (!lab || !progress) {
      return { passed: false, scoreAwarded: 0, message: "No active lab session." };
    }

    const task = lab.tasks.find((t) => t.id === taskId);
    if (!task) {
      return { passed: false, scoreAwarded: 0, message: "Task not found." };
    }

    const activeTopology = useTopologyStore.getState().topology;
    const result = evaluateTaskValidation(task, activeTopology, userAnswer);

    const attemptsCount = (progress.attempts[taskId] || 0) + 1;
    const updatedAttempts = { ...progress.attempts, [taskId]: attemptsCount };

    const updatedCompleted = [...progress.completedTaskIds];
    let updatedScore = progress.score;

    if (result.passed && !updatedCompleted.includes(taskId)) {
      updatedCompleted.push(taskId);
      updatedScore += result.scoreAwarded;
    }

    const isAllCompleted = lab.tasks
      .filter((t) => t.required)
      .every((t) => updatedCompleted.includes(t.id));

    const updatedProgress: LabProgress = {
      ...progress,
      status: isAllCompleted ? "completed" : "in-progress",
      completedTaskIds: updatedCompleted,
      attempts: updatedAttempts,
      score: updatedScore,
      completedAt: isAllCompleted ? new Date().toISOString() : progress.completedAt,
    };

    saveLabProgress(updatedProgress);

    set({
      progress: updatedProgress,
      taskValidationResults: { ...state.taskValidationResults, [taskId]: result },
      isCompletionDialogOpen: isAllCompleted,
    });

    return result;
  },

  skipTask: (taskId) => {
    set((state) => {
      const skipped = [...(state.progress?.skippedTaskIds || [])];
      if (!skipped.includes(taskId)) skipped.push(taskId);

      const updatedProgress: LabProgress = { ...state.progress!, skippedTaskIds: skipped };
      saveLabProgress(updatedProgress);

      return { progress: updatedProgress };
    });
  },

  resetLabProgress: (labId) => {
    clearLabProgress(labId);
    get().loadLab(labId);
  },

  tickTimer: () => {
    set((state) => {
      if (!state.timerActive || !state.progress) return state;
      const nextSeconds = state.elapsedSeconds + 1;
      const updatedProgress: LabProgress = { ...state.progress, elapsedSeconds: nextSeconds };

      if (nextSeconds % 5 === 0) {
        saveLabProgress(updatedProgress);
      }

      return { elapsedSeconds: nextSeconds, progress: updatedProgress };
    });
  },

  setCompletionDialogOpen: (open) => set({ isCompletionDialogOpen: open }),
}));

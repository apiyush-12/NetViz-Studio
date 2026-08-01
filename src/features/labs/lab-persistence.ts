import { LabProgress } from "./lab-types";

function getStorageKey(userId?: string): string {
  return `netviz_lab_progress_${userId || "guest"}_v1`;
}

export function loadAllLabProgress(userId?: string): Record<string, LabProgress> {
  if (typeof window === "undefined") return {};
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load lab progress from localStorage", e);
    return {};
  }
}

export function saveLabProgress(progress: LabProgress, userId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = getStorageKey(userId);
    const all = loadAllLabProgress(userId);
    all[progress.labId] = {
      ...progress,
      lastOpenedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(all));
  } catch (e) {
    console.error("Failed to save lab progress", e);
  }
}

export function getLabProgress(labId: string, userId?: string): LabProgress | undefined {
  const all = loadAllLabProgress(userId);
  return all[labId];
}

export function clearLabProgress(labId: string, userId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = getStorageKey(userId);
    const all = loadAllLabProgress(userId);
    delete all[labId];
    localStorage.setItem(key, JSON.stringify(all));
  } catch (e) {
    console.error("Failed to clear lab progress", e);
  }
}

export function resetAllLabProgress(userId?: string): void {
  if (typeof window === "undefined") return;
  const key = getStorageKey(userId);
  localStorage.removeItem(key);
}

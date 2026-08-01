"use client";

import { useCallback } from "react";
import { IntendedDestination } from "@/features/landing/landing-types";

const STORAGE_KEY = "netviz_intended_destination_v1";

export function useIntendedDestination() {
  const saveIntendedDestination = useCallback((destination: IntendedDestination) => {
    if (typeof window === "undefined") return;

    // Safety check: Only allow internal relative paths
    if (destination.pathname.startsWith("/") && !destination.pathname.startsWith("//")) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(destination));
      } catch (err) {
        console.error("Failed to save intended destination", err);
      }
    }
  }, []);

  const getIntendedDestination = useCallback((): IntendedDestination | null => {
    if (typeof window === "undefined") return null;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const parsed: IntendedDestination = JSON.parse(stored);
      // Validate relative path
      if (parsed.pathname && parsed.pathname.startsWith("/") && !parsed.pathname.startsWith("//")) {
        return parsed;
      }
    } catch (err) {
      console.error("Failed to retrieve intended destination", err);
    }
    return null;
  }, []);

  const clearIntendedDestination = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Failed to clear intended destination", err);
    }
  }, []);

  return {
    saveIntendedDestination,
    getIntendedDestination,
    clearIntendedDestination,
  };
}

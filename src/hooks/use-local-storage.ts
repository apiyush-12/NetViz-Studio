"use client";

import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) setStoredValue(JSON.parse(item) as T);
    } catch {
      // ignore parse errors
    }
    setIsLoaded(true);
  }, [key]);

  const setValue = (value: T | ((prev: T) => T)) => {
    const next = value instanceof Function ? value(storedValue) : value;
    setStoredValue(next);
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // ignore quota errors
    }
  };

  return [storedValue, setValue, isLoaded] as const;
}

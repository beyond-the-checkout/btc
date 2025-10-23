import { useEffect, useState } from "react";

function getItemFromLocalStorage(key: string) {
  if (typeof window === "undefined") return null;

  const item = window.localStorage.getItem(key);
  if (item === null) return null;

  try {
    return JSON.parse(item);
  } catch {
    return null;
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(
    (getItemFromLocalStorage(key) as T | null) ?? initialValue,
  );

  useEffect(() => {
    const item = getItemFromLocalStorage(key);
    if (item !== null) setStoredValue(item as T);
  }, [key]);

  const setValue = (value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const next = typeof value === "function" ? (value as (p: T) => T)(prev) : value;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next as T;
    });
  };

  return [storedValue, setValue];
}

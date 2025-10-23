import { useEffect, useState } from "react";

function getItemFromLocalStorage(key: string) {
  if (typeof window === "undefined") return null;

  const item = window.localStorage.getItem(key);
  if (item === null) return null;

  // Guard against invalid JSON values like the string "undefined"
  try {
    return JSON.parse(item);
  } catch {
    // If parsing fails, treat as missing value
    return null;
  }

  return null;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState(
    getItemFromLocalStorage(key) ?? initialValue,
  );

  useEffect(() => {
    // Retrieve from localStorage
    const item = getItemFromLocalStorage(key);
    if (item !== null) setStoredValue(item);
  }, [key]);

  const setValue = (value: T) => {
    // Save state
    setStoredValue(value);
    // Save to localStorage
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue];
}

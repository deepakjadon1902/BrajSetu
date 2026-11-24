import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const KEY = "braj-setu-saved-properties";
function readSaved(): string[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}
export function useSavedProperties() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  useEffect(() => {
    const update = () => setSavedIds(readSaved());
    update();
    window.addEventListener("storage", update);
    window.addEventListener("braj-setu-saved-change", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("braj-setu-saved-change", update);
    };
  }, []);
  const toggleSaved = useCallback((id: string) => {
    const current = readSaved();
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
      setSavedIds(next);
      window.dispatchEvent(new Event("braj-setu-saved-change"));
      toast.success(
        next.includes(id)
          ? "Property saved on this device."
          : "Property removed from saved listings.",
      );
    } catch {
      toast.error("Your browser could not save this property.");
    }
  }, []);
  return { savedIds, toggleSaved };
}

import { useCallback } from "react";
import { ICONS, SPAWN_ICONS } from "../lib/icons";
import { useGlobalSettingsStore } from "../lib/storage";

export default function useFilters() {
  const globalSettingsStore = useGlobalSettingsStore();
  const setFilters = useCallback((newFilters: string[]) => {
    newFilters = newFilters.filter((f) => f in ICONS || f in SPAWN_ICONS);
    globalSettingsStore.setFilters(newFilters);
  }, []);

  const toggleFilter = useCallback(
    (key: string) => {
      const newFilters = globalSettingsStore.filters.includes(key)
        ? globalSettingsStore.filters.filter((f) => f !== key)
        : [...globalSettingsStore.filters, key];
      setFilters(newFilters);
    },
    [globalSettingsStore.filters]
  );
  return [globalSettingsStore.filters, toggleFilter, setFilters] as const;
}

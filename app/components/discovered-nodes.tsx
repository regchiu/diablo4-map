"use client";
import { ICONS } from "../lib/icons";
import nodes from "../lib/nodes";
import { useDiscoveredNodesStore } from "../lib/storage";
import { useDict } from "./(i18n)/i18n-provider";
import useFilters from "./use-filters";

export default function DiscoveredNodes() {
  const { discoveredNodes } = useDiscoveredNodesStore();
  const dict = useDict();
  const [filters, toggleFilter] = useFilters();

  return (
    <div>
      {Object.entries(ICONS).map(([key, icon]) => (
        <button
          key={key}
          className={`flex items-center hover:bg-neutral-700 p-2 w-full ${
            !filters.includes(key) ? "text-gray-500" : ""
          }`}
          onClick={() => {
            toggleFilter(key);
          }}
        >
          <svg viewBox="0 0 100 100" fill={icon.color} className="h-5">
            <path d={icon.path} />
          </svg>
          <span className="flex-1 text-left mx-3">
            {dict.nodes[key as keyof typeof ICONS]}
          </span>
          <span>
            {discoveredNodes.filter((node) => node.startsWith(key)).length}/
            {nodes[key as keyof typeof ICONS].length}
          </span>
        </button>
      ))}
    </div>
  );
}

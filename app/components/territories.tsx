"use client";

import leaflet from "leaflet";
import { territories } from "../lib/territories";
import { useDict } from "./(i18n)/i18n-provider";
import { useMapStore } from "./(map)/map";

export default function Territories() {
  const dict = useDict();
  const localeTerritories = territories
    .map((territory) => ({
      ...territory,
      name: dict.territories[territory.id],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="grid grid-cols-2">
      {localeTerritories.map((territory) => (
        <button
          key={territory.id}
          onClick={() => {
            const polygons = leaflet.polygon(territory.points as any);
            const map = useMapStore.getState().map!;
            map.fitBounds(polygons.getBounds(), {
              duration: 1,
              maxZoom: 5,
            });
          }}
          className="text-left hover:bg-neutral-700 px-2 py-1"
        >
          {territory.name}
        </button>
      ))}
    </div>
  );
}

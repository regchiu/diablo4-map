"use client";
import Toggle from "@/app/components/toggle";
import { useSettingsStore } from "@/app/lib/storage";
import { togglePreferedWindow } from "../lib/windows";
import Hotkey from "./hotkey";

export default function AppSettings() {
  const settingsStore = useSettingsStore();

  return (
    <>
      <div className="flex">
        <span className="w-1/2">Show/Hide app</span>
        <Hotkey name="toggle_app" />
      </div>
      <div className="flex">
        <span className="w-1/2">Zoom in map</span>
        <Hotkey name="zoom_in_app" />
      </div>
      <div className="flex">
        <span className="w-1/2">Zoom out map</span>
        <Hotkey name="zoom_out_app" />
      </div>
      <div className="flex">
        <span className="w-1/2">Overlay Mode</span>
        <Toggle
          checked={!!settingsStore.overlayMode}
          onChange={(checked) => {
            settingsStore.setOverlayMode(checked);
            togglePreferedWindow();
          }}
        />
      </div>
    </>
  );
}

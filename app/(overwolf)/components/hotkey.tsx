import { useEffect, useState } from "react";
import { GAME_CLASS_ID } from "../lib/config";

export default function Hotkey({ name }: { name: string }) {
  const [hotkeyBinding, setHotkeyBinding] = useState<string>("");

  useEffect(() => {
    overwolf.settings.hotkeys.get((result) => {
      if (result.games) {
        const hotkey = result.games[GAME_CLASS_ID].find(
          (hotkey) => hotkey.name === name
        );
        if (hotkey) {
          setHotkeyBinding(hotkey.binding);
        }
      }
    });

    const handleChange = (event: overwolf.settings.hotkeys.OnChangedEvent) => {
      if (event.name === name) {
        setHotkeyBinding(event.binding);
      }
    };
    overwolf.settings.hotkeys.onChanged.addListener(handleChange);

    return () => {
      overwolf.settings.hotkeys.onChanged.removeListener(handleChange);
    };
  }, []);

  return (
    <a
      className="hotkey"
      href={`overwolf://settings/games-overlay?hotkey=${name}&gameId=${GAME_CLASS_ID}`}
    >
      {hotkeyBinding || "Unassigned"}
    </a>
  );
}

"use client";
import { API_BASE_URI } from "@/app/lib/env";
import { useAccountStore } from "@/app/lib/storage";
import { useEffect, useRef } from "react";
import { GAME_CLASS_ID, HOTKEYS, WINDOWS } from "../lib/config";
import { getRunningGameInfo } from "../lib/games";
import { waitForOverwolf } from "../lib/overwolf";
import {
  closeMainWindow,
  closeWindow,
  getPreferedWindowName,
  moveToOtherScreen,
  restoreWindow,
  toggleWindow,
} from "../lib/windows";

export default function Init() {
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) {
      return;
    }
    waitForOverwolf()
      .then(() => {
        initialized.current = true;
        initController();
      })
      .catch((error) => console.warn(error));
  }, []);

  return <></>;
}

async function initController() {
  console.log("Init controller");
  const openApp = async (
    event?: overwolf.extensions.AppLaunchTriggeredEvent
  ) => {
    if (event?.origin === "urlscheme") {
      const matched = decodeURIComponent(event.parameter).match("code=([^&]*)");
      const code = matched ? matched[1] : null;
      if (code) {
        const response = await fetch(`${API_BASE_URI}/api/patreon`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            redirectURI: `${API_BASE_URI}/patreon/exit`,
          }),
        });
        const body = response.json();
        if (!response.ok) {
          console.warn(body);
        } else {
          console.log(`Patreon successfully activated`);
          const accountStore = useAccountStore.getState();
          accountStore.setIsPatron(true);
        }
      }
    }

    const runningGameInfo = await getRunningGameInfo(GAME_CLASS_ID);
    if (runningGameInfo) {
      const preferedWindowName = await getPreferedWindowName();
      const windowId = await restoreWindow(preferedWindowName);
      if (preferedWindowName === WINDOWS.DESKTOP) {
        moveToOtherScreen(windowId, runningGameInfo.monitorHandle.value);
      }
    } else {
      restoreWindow(WINDOWS.DESKTOP);
    }
  };
  openApp();

  overwolf.extensions.onAppLaunchTriggered.addListener(openApp);

  overwolf.settings.hotkeys.onPressed.addListener(async (event) => {
    if (event.name === HOTKEYS.TOGGLE_APP) {
      const preferedWindowName = await getPreferedWindowName();
      toggleWindow(preferedWindowName);
    }
  });

  overwolf.games.onGameInfoUpdated.addListener(async (event) => {
    if (event.runningChanged && event.gameInfo?.classId === GAME_CLASS_ID) {
      const preferedWindowName = await getPreferedWindowName();
      if (event.gameInfo.isRunning) {
        if (preferedWindowName === WINDOWS.OVERLAY) {
          restoreWindow(WINDOWS.OVERLAY);
          closeWindow(WINDOWS.DESKTOP);
        } else {
          restoreWindow(WINDOWS.DESKTOP);
          closeWindow(WINDOWS.OVERLAY);
        }
      } else if (preferedWindowName === WINDOWS.OVERLAY) {
        closeMainWindow();
      }
    }
  });
}

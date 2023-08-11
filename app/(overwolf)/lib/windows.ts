import { useSettingsStore } from "@/app/lib/storage";
import { useEffect, useState } from "react";
import { GAME_CLASS_ID, WINDOWS } from "./config";
import { getRunningGameInfo } from "./games";

const declaredWindows: {
  [windowName: string]: overwolf.windows.WindowInfo;
} = {};
export async function obtainDeclaredWindow(
  windowName: string
): Promise<overwolf.windows.WindowInfo> {
  return new Promise((resolve, reject) => {
    overwolf.windows.obtainDeclaredWindow(windowName, (result) => {
      if (result.success) {
        declaredWindows[windowName] = result.window;
        resolve(result.window);
      } else {
        reject(result.error);
      }
    });
  });
}

export async function closeWindow(windowName: string): Promise<void> {
  const backgroundWindow = await obtainDeclaredWindow(windowName);
  overwolf.windows.close(backgroundWindow.id);
}

export async function closeMainWindow(): Promise<void> {
  return closeWindow(WINDOWS.CONTROLLER);
}

export async function restoreWindow(windowName: string): Promise<string> {
  const declaredWindow = await obtainDeclaredWindow(windowName);

  return new Promise((resolve, reject) => {
    if (declaredWindow.isVisible) {
      overwolf.windows.bringToFront(windowName, () => undefined);
      resolve(declaredWindow.id);
      return;
    }
    overwolf.windows.restore(windowName, async (result) => {
      if (result.success) {
        await new Promise((resolve) =>
          overwolf.windows.bringToFront(windowName, resolve)
        );
        console.log(`Window ${windowName} restored`);

        resolve(result.window_id!); // window_id is always a string if success
      } else {
        reject(result.error);
      }
    });
  });
}

export async function toggleWindow(windowName: string): Promise<void> {
  const declaredWindow = await obtainDeclaredWindow(windowName);
  if (
    ["normal", "maximized"].includes(declaredWindow.stateEx) &&
    declaredWindow.isVisible
  ) {
    console.log(`Hiding window ${windowName}`);
    overwolf.windows.hide(declaredWindow.id);
  } else {
    restoreWindow(declaredWindow.name);
  }
}

export async function getPreferedWindowName(): Promise<string> {
  const { overlayMode, setOverlayMode } = useSettingsStore.getState();
  if (overlayMode !== null) {
    return overlayMode ? WINDOWS.OVERLAY : WINDOWS.DESKTOP;
  }

  const monitors = await getMonitorsList();
  const hasSecondScreen = monitors.length > 1;
  const newOverlayMode = hasSecondScreen ? WINDOWS.DESKTOP : WINDOWS.OVERLAY;
  setOverlayMode(newOverlayMode === WINDOWS.OVERLAY);
  return newOverlayMode;
}

export function getMonitorsList(): Promise<overwolf.utils.Display[]> {
  return new Promise<overwolf.utils.Display[]>((resolve) => {
    overwolf.utils.getMonitorsList((result) => {
      resolve(result.displays);
    });
  });
}

export async function togglePreferedWindow(): Promise<void> {
  const preferedWindowName = await getPreferedWindowName();
  const overlayMode = preferedWindowName === WINDOWS.OVERLAY;
  useSettingsStore.getState().setOverlayMode(overlayMode);
  if (overlayMode) {
    const runningGameInfo = await getRunningGameInfo(GAME_CLASS_ID);
    if (runningGameInfo) {
      await restoreWindow(WINDOWS.OVERLAY);
      await closeWindow(WINDOWS.DESKTOP);
    }
  } else {
    await restoreWindow(WINDOWS.DESKTOP);
    await closeWindow(WINDOWS.OVERLAY);
  }
}

export async function getCurrentWindow(): Promise<overwolf.windows.WindowInfo> {
  return new Promise<overwolf.windows.WindowInfo>((resolve) =>
    overwolf.windows.getCurrentWindow((result) => resolve(result.window))
  );
}

export async function moveToOtherScreen(
  windowId: string,
  monitorHandleValue: number
) {
  const monitors = await getMonitorsList();
  const hasSecondScreen = monitors.length > 1;
  if (!hasSecondScreen) {
    return;
  }
  const desktopWindow = await obtainDeclaredWindow(WINDOWS.DESKTOP);
  const otherScreens = monitors.filter(
    (monitor) => monitor.handle.value !== monitorHandleValue
  );
  const secondScreen =
    otherScreens.find(
      (secondScreen) => desktopWindow.monitorId === secondScreen.id
    ) || otherScreens[0];

  if (desktopWindow.monitorId === secondScreen.id) {
    return;
  }

  const x =
    secondScreen.x +
    Math.floor(secondScreen.width / 2 - desktopWindow.width / 2);
  const y =
    secondScreen.y +
    Math.floor(secondScreen.height / 2 - desktopWindow.height / 2);
  return new Promise((resolve) =>
    overwolf.windows.changePosition(windowId, x, y, resolve)
  );
}

export function useCurrentWindow() {
  const [currentWindow, setCurrentWindow] =
    useState<overwolf.windows.WindowInfo | null>(null);

  useEffect(() => {
    if (typeof overwolf === "undefined") {
      return;
    }
    let currentWindowName = "";
    overwolf.windows.onStateChanged.addListener((event) => {
      if (event.window_name === currentWindowName) {
        getCurrentWindow().then((currentWindow) => {
          setCurrentWindow(currentWindow);
        });
      }
    });

    getCurrentWindow().then((currentWindow) => {
      currentWindowName = currentWindow.name;
      setCurrentWindow(currentWindow);
    });
  }, []);

  return currentWindow;
}

export async function setInputPassThrough(inputPassThrough: boolean) {
  const currentWindow = await getCurrentWindow();
  return new Promise<void>((resolve) => {
    if (inputPassThrough) {
      overwolf.windows.setWindowStyle(
        currentWindow.id,
        "InputPassThrough" as overwolf.windows.enums.WindowStyle.InputPassThrough,
        () => {
          resolve();
        }
      );
    } else {
      overwolf.windows.removeWindowStyle(
        currentWindow.id,
        "InputPassThrough" as overwolf.windows.enums.WindowStyle.InputPassThrough,
        () => {
          resolve();
        }
      );
    }
  });
}

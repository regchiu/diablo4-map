import { GAME_CLASS_ID } from "./config";

export function getRunningGameInfo(
  gameId: number
): Promise<overwolf.games.GetRunningGameInfoResult | null> {
  return new Promise((resolve) => {
    overwolf.games.getRunningGameInfo((result) => {
      resolve(result && result.classId === gameId ? result : null);
    });
  });
}

export function listenToGameInfo(
  callback: (gameInfo: overwolf.games.RunningGameInfo | undefined) => void
) {
  overwolf.games.onGameInfoUpdated.addListener((event) => {
    if (event.gameChanged) {
      callback(event.gameInfo);
    }
  });

  overwolf.games.getRunningGameInfo((result) => {
    callback(result);
  });
}

export function listenToGameLaunched(callback: () => void) {
  overwolf.games.onGameInfoUpdated.addListener((res) => {
    if (gameLaunched(res)) {
      callback();
    }
  });

  overwolf.games.getRunningGameInfo((res) => {
    if (gameRunning(res)) {
      callback();
    }
  });
}

export function gameLaunched(
  gameInfoResult: overwolf.games.GameInfoUpdatedEvent
) {
  if (!gameInfoResult) {
    return false;
  }

  if (!gameInfoResult.gameInfo) {
    return false;
  }

  if (!gameInfoResult.runningChanged && !gameInfoResult.gameChanged) {
    return false;
  }

  if (!gameInfoResult.gameInfo.isRunning) {
    return false;
  }

  // NOTE: we divide by 10 to get the game class id without it's sequence number
  if (Math.floor(gameInfoResult.gameInfo.id / 10) != GAME_CLASS_ID) {
    return false;
  }

  return true;
}

export function gameRunning(gameInfo: overwolf.games.RunningGameInfo) {
  if (!gameInfo) {
    return false;
  }

  if (!gameInfo.isRunning) {
    return false;
  }

  // NOTE: we divide by 10 to get the game class id without it's sequence number
  if (Math.floor(gameInfo.id / 10) != GAME_CLASS_ID) {
    return false;
  }

  return true;
}

export function listenToOverlayEnablement(
  callback: (enabled: boolean) => void
) {
  overwolf.settings.games.onOverlayEnablementChanged.addListener((event) => {
    if (event.gameId === GAME_CLASS_ID) {
      callback(event.enabled);
    }
  });

  overwolf.settings.games.getOverlayEnabled(GAME_CLASS_ID, (event) => {
    callback(event.enabled);
  });
}

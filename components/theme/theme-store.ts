"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_APP_THEME,
  THEME_STORAGE_KEY,
  isAppTheme,
  themeColorScheme,
  type AppTheme,
} from "@/components/theme/theme-config";

export { APP_THEMES, THEME_STORAGE_KEY, type AppTheme } from "@/components/theme/theme-config";
const themeChangeEvent = "ant-vigil-theme-change";

function getThemeSnapshot(): AppTheme {
  const theme = document.documentElement.dataset.theme;
  return isAppTheme(theme) ? theme : DEFAULT_APP_THEME;
}

function subscribeToTheme(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) onStoreChange();
  };

  window.addEventListener(themeChangeEvent, onStoreChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(themeChangeEvent, onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export function setAppTheme(theme: AppTheme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = themeColorScheme(theme);

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The selected theme still applies for this page when storage is blocked.
  }

  window.dispatchEvent(new Event(themeChangeEvent));
}

export function useAppTheme() {
  return useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => DEFAULT_APP_THEME,
  );
}

"use client";

import { useSyncExternalStore } from "react";

export const THEME_STORAGE_KEY = "ant-vigil-theme";

export const APP_THEMES = [
  {
    id: "midnight",
    label: "深夜监测",
    englishLabel: "MIDNIGHT",
    description: "现有黑灰监测界面",
  },
  {
    id: "warm-light",
    label: "暖纸日间",
    englishLabel: "WARM PAPER",
    description: "柔和纸色与炭黑文字",
  },
  {
    id: "warm-dark",
    label: "暖纸夜间",
    englishLabel: "WARM NIGHT",
    description: "暖灰黑底与米白文字",
  },
] as const;

export type AppTheme = (typeof APP_THEMES)[number]["id"];

const themeIds = new Set<AppTheme>(APP_THEMES.map((theme) => theme.id));
const themeChangeEvent = "ant-vigil-theme-change";

export function isAppTheme(value: string | undefined): value is AppTheme {
  return value !== undefined && themeIds.has(value as AppTheme);
}

function getThemeSnapshot(): AppTheme {
  const theme = document.documentElement.dataset.theme;
  return isAppTheme(theme) ? theme : "midnight";
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
  document.documentElement.style.colorScheme =
    theme === "warm-light" ? "light" : "dark";

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
    () => "midnight",
  );
}

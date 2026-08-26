export const THEME_STORAGE_KEY = "ant-vigil-theme";
export const DEFAULT_APP_THEME = "midnight";

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

export function isAppTheme(value: string | undefined): value is AppTheme {
  return value !== undefined && themeIds.has(value as AppTheme);
}

export function themeColorScheme(theme: AppTheme) {
  return theme === "warm-light" ? "light" : "dark";
}

export function createThemeInitializationScript() {
  const allowedThemes = APP_THEMES.map((theme) => theme.id);

  return `
    (() => {
      const fallback = ${JSON.stringify(DEFAULT_APP_THEME)};
      const allowed = new Set(${JSON.stringify(allowedThemes)});
      let theme = fallback;
      try {
        const stored = window.localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
        if (stored && allowed.has(stored)) theme = stored;
      } catch {}
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme =
        theme === "warm-light" ? "light" : "dark";
    })();
  `;
}

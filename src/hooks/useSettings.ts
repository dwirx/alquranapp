import { useLocalStorage } from "./useLocalStorage";
import { useCallback, useEffect } from "react";

export interface AppSettings {
  fontSize: "small" | "medium" | "large";
  showLatin: boolean;
  showTranslation: boolean;
  theme: "light" | "dark" | "system";
  autoPlayNext: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  fontSize: "medium",
  showLatin: true,
  showTranslation: true,
  theme: "system",
  autoPlayNext: false,
};

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<AppSettings>("quran-settings", DEFAULT_SETTINGS);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, [setSettings]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, [setSettings]);

  // Apply theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (settings.theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(settings.theme);
    }
  }, [settings.theme]);

  return {
    settings,
    updateSetting,
    resetSettings,
  };
}

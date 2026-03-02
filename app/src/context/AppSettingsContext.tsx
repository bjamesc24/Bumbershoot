import React, { createContext, useContext, useMemo, useState } from "react";

export type ThemeColor =
  | "blue"
  | "purple"
  | "pink"
  | "green"
  | "orange"
  | "black";

const THEME_COLORS: Record<ThemeColor, string> = {
  blue: "#2D7FF9",
  purple: "#7C4DFF",
  pink: "#FF4DA6",
  green: "#2ECC71",
  orange: "#FF8A00",
  black: "#111111",
};

type AppSettings = {
  themeColorKey: ThemeColor;
  themeColorHex: string;
  tabTextSize: number; 

  setThemeColorKey: (c: ThemeColor) => void;
  setTabTextSize: (size: number) => void;
};

const AppSettingsContext = createContext<AppSettings | null>(null);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [themeColorKey, setThemeColorKey] = useState<ThemeColor>("blue");
  const [tabTextSize, setTabTextSize] = useState<number>(12); 

  const value = useMemo<AppSettings>(() => {
    return {
      themeColorKey,
      themeColorHex: THEME_COLORS[themeColorKey],
      tabTextSize,
      setThemeColorKey,
      setTabTextSize,
    };
  }, [themeColorKey, tabTextSize]);

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error("useAppSettings must be used inside AppSettingsProvider");
  return ctx;
}

export const ThemePalette = THEME_COLORS;
import React, { createContext, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import type { ThemeMode } from "./tokens";
import { buildTheme, type AppTheme } from "./themes";

type ThemeContextValue = {
  theme: AppTheme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode | "system") => void;
  modeSetting: ThemeMode | "system";
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme(); // "dark" | "light" | null
  const [modeSetting, setModeSetting] = useState<ThemeMode | "system">("system");

  const resolvedMode: ThemeMode =
    modeSetting === "system" ? (systemScheme === "dark" ? "dark" : "light") : modeSetting;

  const theme = useMemo(() => buildTheme(resolvedMode), [resolvedMode]);

  const value = useMemo(
    () => ({
      theme,
      mode: resolvedMode,
      modeSetting,
      setMode: setModeSetting,
    }),
    [theme, resolvedMode, modeSetting]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
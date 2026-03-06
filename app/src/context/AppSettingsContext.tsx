import React, { createContext, useContext, useMemo, useState } from "react";
import { PixelRatio, useColorScheme } from "react-native";

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

export type ColorMode = "system" | "light" | "dark";
export type ContrastMode = "normal" | "high";

type ThemeTokens = {
  colors: {
    background: string;
    surface: string;
    surface2: string;
    text: string;
    textMuted: string;
    border: string;
    primary: string;       // accent
    primaryText: string;   // text on accent
  };
  typography: {
    h1: number;
    h3: number;
    body: number;
    caption: number;
  };
};

type AppSettings = {
  // existing
  themeColorKey: ThemeColor;
  themeColorHex: string;
  tabTextSize: number;

  setThemeColorKey: (c: ThemeColor) => void;
  setTabTextSize: (size: number) => void;

  // NEW accessibility/theme settings
  colorMode: ColorMode;
  setColorMode: (m: ColorMode) => void;

  contrastMode: ContrastMode;
  setContrastMode: (m: ContrastMode) => void;

  textScale: number; // 1.0, 1.15, 1.3...
  setTextScale: (s: number) => void;

  // NEW derived tokens
  theme: ThemeTokens;
};

const AppSettingsContext = createContext<AppSettings | null>(null);

// ---------- helpers ----------
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function scaleFont(base: number, textScale: number) {
  const fontScale = PixelRatio.getFontScale(); // respects OS accessibility
  const scaled = base * textScale * fontScale;
  return Math.round(clamp(scaled, base * 0.9, base * 2.0));
}

// Pick black/white for readable text on primary
function pickOnColor(hex: string) {
  // expects "#RRGGBB"
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // perceived luminance
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum > 0.55 ? "#0B0B0F" : "#FFFFFF";
}

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme(); // "light" | "dark" | null

  // existing state
  const [themeColorKey, setThemeColorKey] = useState<ThemeColor>("blue");
  const [tabTextSize, setTabTextSize] = useState<number>(12);

  // NEW state
  const [colorMode, setColorMode] = useState<ColorMode>("system");
  const [contrastMode, setContrastMode] = useState<ContrastMode>("normal");
  const [textScale, setTextScale] = useState<number>(1.0);

  const value = useMemo<AppSettings>(() => {
    const accent = THEME_COLORS[themeColorKey];

    const resolvedMode: "light" | "dark" =
      colorMode === "system"
        ? systemScheme === "dark"
          ? "dark"
          : "light"
        : colorMode;

    const isDark = resolvedMode === "dark";
    const high = contrastMode === "high";

    // You can tweak these anytime, but they’re a good accessible baseline
    const colors = {
      background: isDark ? "#0B0B0F" : "#FFFFFF",
      surface: isDark ? (high ? "#111118" : "#14141A") : high ? "#F3F4F6" : "#F7F7F8",
      surface2: isDark ? (high ? "#1A1A24" : "#1B1B22") : "#FFFFFF",
      text: isDark ? "#FFFFFF" : "#0B0B0F",
      textMuted: isDark ? (high ? "#E5E7EB" : "#C7C7D1") : high ? "#111827" : "#4A4A55",
      border: isDark ? (high ? "#3B3B4A" : "#2A2A34") : high ? "#111827" : "#E3E3E8",
      primary: accent,
      primaryText: pickOnColor(accent),
    };

    const typography = {
      h1: scaleFont(28, textScale),
      h3: scaleFont(18, textScale),
      body: scaleFont(16, textScale),
      caption: scaleFont(13, textScale),
    };

    return {
      themeColorKey,
      themeColorHex: accent,
      tabTextSize,
      setThemeColorKey,
      setTabTextSize,

      colorMode,
      setColorMode,
      contrastMode,
      setContrastMode,
      textScale,
      setTextScale,

      theme: { colors, typography },
    };
  }, [themeColorKey, tabTextSize, colorMode, contrastMode, textScale, systemScheme]);

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error("useAppSettings must be used inside AppSettingsProvider");
  return ctx;
}

export const ThemePalette = THEME_COLORS;
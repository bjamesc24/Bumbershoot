import type { ThemeColors, ThemeMode, ThemeRadii, ThemeSpacing } from "./tokens";
import { createTypography } from "./typography";

const spacing: ThemeSpacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
const radii: ThemeRadii = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };

const lightColors: ThemeColors = {
  background: "#FFFFFF",
  surface: "#F7F7F8",
  surface2: "#FFFFFF",
  text: "#0B0B0F",
  textMuted: "#4A4A55",
  border: "#E3E3E8",
  primary: "#111827",
  primaryText: "#FFFFFF",
  danger: "#B91C1C",
  focus: "#2563EB",
};

const darkColors: ThemeColors = {
  background: "#0B0B0F",
  surface: "#14141A",
  surface2: "#1B1B22",
  text: "#FFFFFF",
  textMuted: "#C7C7D1",
  border: "#2A2A34",
  primary: "#FFFFFF",
  primaryText: "#0B0B0F",
  danger: "#EF4444",
  focus: "#60A5FA",
};

export type AppTheme = {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radii: ThemeRadii;
  typography: ReturnType<typeof createTypography>;
};

export function buildTheme(mode: ThemeMode): AppTheme {
  return {
    mode,
    colors: mode === "dark" ? darkColors : lightColors,
    spacing,
    radii,
    typography: createTypography(),
  };
}
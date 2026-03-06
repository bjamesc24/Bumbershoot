export type ThemeMode = "light" | "dark";

export type ThemeColors = {
  background: string;   // app background
  surface: string;      // cards, sheets
  surface2: string;     // elevated surface / alt
  text: string;         // primary text
  textMuted: string;    // secondary text
  border: string;
  primary: string;      // buttons, links
  primaryText: string;  // text on primary
  danger: string;
  focus: string;        // focus ring outline
};

export type ThemeSpacing = {
  xs: number; sm: number; md: number; lg: number; xl: number;
};

export type ThemeRadii = {
  sm: number; md: number; lg: number; xl: number; pill: number;
};
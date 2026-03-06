import { PixelRatio } from "react-native";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * Scale base size with user font settings (Dynamic Type / font scale).
 * PixelRatio.getFontScale() returns a multiplier like 1.0, 1.2, 1.4...
 */
export function scaleFont(base: number) {
  const fontScale = PixelRatio.getFontScale();
  // clamp so layout doesn't explode but still respects accessibility
  const scaled = base * fontScale;
  return Math.round(clamp(scaled, base * 0.9, base * 1.8));
}

export type Typography = {
  h1: { fontSize: number; fontWeight: "700" | "800"; lineHeight: number };
  h2: { fontSize: number; fontWeight: "700" | "800"; lineHeight: number };
  body: { fontSize: number; fontWeight: "400" | "500"; lineHeight: number };
  bodyStrong: { fontSize: number; fontWeight: "600" | "700"; lineHeight: number };
  caption: { fontSize: number; fontWeight: "500" | "600"; lineHeight: number };
};

export function createTypography() : Typography {
  const h1 = scaleFont(28);
  const h2 = scaleFont(22);
  const body = scaleFont(16);
  const caption = scaleFont(13);

  return {
    h1: { fontSize: h1, fontWeight: "800", lineHeight: Math.round(h1 * 1.2) },
    h2: { fontSize: h2, fontWeight: "800", lineHeight: Math.round(h2 * 1.25) },
    body: { fontSize: body, fontWeight: "400", lineHeight: Math.round(body * 1.4) },
    bodyStrong: { fontSize: body, fontWeight: "700", lineHeight: Math.round(body * 1.4) },
    caption: { fontSize: caption, fontWeight: "600", lineHeight: Math.round(caption * 1.35) },
  };
}
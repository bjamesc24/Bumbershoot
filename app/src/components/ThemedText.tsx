import React from "react";
import { Text, TextProps, TextStyle } from "react-native";
import { useAppSettings } from "../context/AppSettingsContext";

type Variant = "h1" | "h3" | "body" | "caption";

type Props = TextProps & {
  variant?: Variant;
  muted?: boolean;
  weight?: TextStyle["fontWeight"];
};

export default function ThemedText({
  variant = "body",
  muted = false,
  weight,
  style,
  ...props
}: Props) {
  const { theme } = useAppSettings();

  const fontSize =
    variant === "h1"
      ? theme.typography.h1
      : variant === "h3"
      ? theme.typography.h3
      : variant === "caption"
      ? theme.typography.caption
      : theme.typography.body;

  return (
    <Text
      {...props}
      style={[
        {
          fontSize,
          color: muted ? theme.colors.textMuted : theme.colors.text,
          fontWeight: weight,
        },
        style,
      ]}
    />
  );
}
import React from "react";
import { View, ViewProps } from "react-native";
import { useAppSettings } from "../context/AppSettingsContext";

export default function Screen({ style, ...props }: ViewProps) {
  const { theme } = useAppSettings();
  return (
    <View
      {...props}
      style={[{ flex: 1, backgroundColor: theme.colors.background }, style]}
    />
  );
}
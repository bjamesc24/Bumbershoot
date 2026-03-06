import * as React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import ThemedText from "./ThemedText";
import { useAppSettings } from "../context/AppSettingsContext";

export default function EmptyState({
  message,
  onClear,
}: {
  message: string;
  onClear?: () => void;
}) {
  const { theme } = useAppSettings();

  return (
    <View style={s.wrap}>
      <ThemedText variant="h3" weight="800" style={{ textAlign: "center", marginBottom: 6 }}>
        No results
      </ThemedText>

      <ThemedText
        muted
        style={{
          textAlign: "center",
          marginBottom: onClear ? 12 : 0,
          lineHeight: Math.round(theme.typography.body * 1.4),
        }}
      >
        {message}
      </ThemedText>

      {onClear ? (
        <Pressable
          style={[
            s.btn,
            {
              borderColor: theme.colors.primary,
              backgroundColor: `${theme.colors.primary}15`,
            },
          ]}
          onPress={onClear}
        >
          <ThemedText variant="caption" weight="800" style={{ textAlign: "center" }}>
            Clear search
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  btn: {
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});
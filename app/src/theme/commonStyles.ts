import { StyleSheet } from "react-native";

export function createCommonStyles(theme: any) {
  return StyleSheet.create({
    screenContent: {
      paddingBottom: 24,
    },

    sectionHeader: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 8,
    },

    divider: {
      height: 1,
      marginHorizontal: 16,
      marginTop: 16,
      backgroundColor: theme.colors.border,
    },

    horizontalList: {
      paddingHorizontal: 16,
      gap: 12,
    },

    card: {
      borderRadius: 12,
      padding: 12,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    imagePlaceholder: {
      width: "100%",
      borderRadius: 8,
      marginBottom: 8,
      backgroundColor: theme.colors.border,
    },

    actionRow: {
      flexDirection: "row",
      gap: 8,
      marginTop: 8,
    },

    smallButton: {
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface2,
    },

    pillButton: {
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1.5,
      alignSelf: "flex-start",
    },

    pageBody: {
      padding: 16,
    },
  });
}
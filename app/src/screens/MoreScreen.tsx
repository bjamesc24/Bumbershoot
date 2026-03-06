import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { useAppSettings } from "../context/AppSettingsContext";
import ThemedText from "../components/ThemedText";

const { width } = Dimensions.get("window");
const PANEL_W = Math.min(340, width * 0.82);

export default function MoreScreen() {
  const navigation = useNavigation<any>();
  const { theme, textScale } = useAppSettings();

  const [open, setOpen] = useState(false);

  const x = useRef(new Animated.Value(PANEL_W)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const openPanel = useCallback(() => {
    setOpen(true);
    x.setValue(PANEL_W);
    overlayOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(x, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [overlayOpacity, x]);

  const closePanel = useCallback(() => {
    Animated.parallel([
      Animated.timing(x, { toValue: PANEL_W, duration: 200, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) {
        setOpen(false);
        navigation.navigate("Tabs", { screen: "Explore" });
      }
    });
  }, [navigation, overlayOpacity, x]);

  useFocusEffect(
    useCallback(() => {
      openPanel();
      return () => {
        setOpen(false);
        x.setValue(PANEL_W);
        overlayOpacity.setValue(0);
      };
    }, [openPanel, overlayOpacity, x])
  );

  const itemPadY = Math.round(16 * textScale);
  const itemPadX = Math.round(18 * textScale);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      {open && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {/* Overlay */}
          <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closePanel} />
          </Animated.View>

          {/* Side Panel */}
          <Animated.View
            style={[
              styles.panel,
              {
                transform: [{ translateX: x }],
                backgroundColor: theme.colors.surface2,
              },
            ]}
          >
            {/* Close Button */}
            <Pressable
              style={[styles.closeButton, { backgroundColor: theme.colors.primary }]}
              onPress={closePanel}
              accessibilityRole="button"
              accessibilityLabel="Close more menu"
            >
              <ThemedText weight="800" style={{ color: theme.colors.primaryText, fontSize: 22 }}>
                ×
              </ThemedText>
            </Pressable>

            {/* Title */}
            <ThemedText variant="h1" weight="800" style={{ marginBottom: 30 }}>
              More
            </ThemedText>

            <View style={styles.menuContainer}>
              <Pressable
                style={[
                  styles.menuButton,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    paddingVertical: itemPadY,
                    paddingHorizontal: itemPadX,
                  },
                ]}
                onPress={() => {
                  closePanel();
                  navigation.navigate("Announcements");
                }}
              >
                <ThemedText variant="body" weight="700">
                  Announcements
                </ThemedText>
              </Pressable>

              <Pressable
                style={[
                  styles.menuButton,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    paddingVertical: itemPadY,
                    paddingHorizontal: itemPadX,
                  },
                ]}
                onPress={() => {
                  closePanel();
                  navigation.navigate("Favorites");
                }}
              >
                <ThemedText variant="body" weight="700">
                  Favorites
                </ThemedText>
              </Pressable>

              <Pressable
                style={[
                  styles.menuButton,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    paddingVertical: itemPadY,
                    paddingHorizontal: itemPadX,
                  },
                ]}
                onPress={() => {
                  closePanel();
                  navigation.navigate("Settings");
                }}
              >
                <ThemedText variant="body" weight="700">
                  Settings
                </ThemedText>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  panel: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: PANEL_W,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  closeButton: {
    position: "absolute",
    left: -42,
    top: 395,
    bottom: 0,
    marginVertical: "auto",
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },

  menuButton: {
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 16,
  },

  menuContainer: {
    flex: 1,
    justifyContent: "center",
  },
});
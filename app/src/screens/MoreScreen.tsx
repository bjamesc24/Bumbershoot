import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const PANEL_W = Math.min(340, width * 0.82);

export default function MoreScreen() {
  const navigation = useNavigation<any>();
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

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      {open && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {/* Overlay */}
          <Animated.View
            style={[styles.overlay, { opacity: overlayOpacity }]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={closePanel} />
          </Animated.View>

          {/* Side Panel */}
          <Animated.View
            style={[
              styles.panel,
              { transform: [{ translateX: x }] },
            ]}
          >
            {/* Close Button (attached left side) */}
            <Pressable style={styles.closeButton} onPress={closePanel}>
              <Text style={styles.closeText}>×</Text>
            </Pressable>

            {/* Title */}
<Text style={styles.title}>More</Text>


<View style={styles.menuContainer}>
  <Pressable
    style={styles.menuButton}
    onPress={() => {
      closePanel();
      navigation.navigate("Announcements");
    }}
  >
    <Text style={styles.menuText}>Announcements</Text>
  </Pressable>

  <Pressable
    style={styles.menuButton}
    onPress={() => {
      closePanel();
      navigation.navigate("Favorites");
    }}
  >
    <Text style={styles.menuText}>Favorites</Text>
  </Pressable>

  <Pressable
    style={styles.menuButton}
    onPress={() => {
      closePanel();
      navigation.navigate("Settings");
    }}
  >
    <Text style={styles.menuText}>Settings</Text>
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
    backgroundColor: "#ffffff",
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
  backgroundColor: "#111",
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#000",
  shadowOpacity: 0.2,
  shadowRadius: 10,
  elevation: 8,
  },

  closeText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 30,
  },

  menuButton: {
    backgroundColor: "#f2f2f2",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginBottom: 16,
  },

  menuText: {
    fontSize: 16,
    fontWeight: "600",
  },
  menuContainer: {
  flex: 1,
  justifyContent: "center",
},
});
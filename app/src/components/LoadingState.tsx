import * as React from "react";
import { ActivityIndicator, Modal, View, Text, StyleSheet } from "react-native";

type Props = {
  visible: boolean;
  message?: string;
};

export default function LoadingState({ visible, message = "Loading..." }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.backdrop}>
        <View style={s.card}>
          <ActivityIndicator size="large" />
          <Text style={s.text}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center", padding: 24 },
  card: { width: "100%", maxWidth: 320, backgroundColor: "white", borderRadius: 16, padding: 20, alignItems: "center" },
  text: { marginTop: 12, fontSize: 16 },
});
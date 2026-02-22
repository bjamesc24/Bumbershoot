import React from "react";
import { ActivityIndicator, Modal, Text, View } from "react-native";

type Props = {
  visible: boolean;
  message?: string;
};

export default function LoadingState({ visible, message = "Loading..." }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.35)",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 320,
            backgroundColor: "white",
            borderRadius: 16,
            padding: 20,
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 12, fontSize: 16 }}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

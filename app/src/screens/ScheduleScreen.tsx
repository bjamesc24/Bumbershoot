import React from "react";
import { View, Text, Button } from "react-native";
import { Routes } from "../navigation/routes";

export default function ScheduleScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "600" }}>Schedule</Text>
      <Text>Placeholder schedule list</Text>
      <Button title="Open Event Details" onPress={() => navigation.navigate(Routes.EventDetails)} />
    </View>
  );
}
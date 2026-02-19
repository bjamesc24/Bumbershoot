import React from "react";
import { Button, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScheduleStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<ScheduleStackParamList, "Schedule">;

export default function ScheduleScreen({ navigation }: Props) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
      <Text>Schedule</Text>
      <Button
        title="Go to Event Details (test)"
        onPress={() => navigation.navigate("EventDetails")}
      />
    </View>
  );
}
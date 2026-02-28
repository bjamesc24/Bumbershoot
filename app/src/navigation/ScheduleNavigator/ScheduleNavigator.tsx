import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ScheduleScreen } from "../../screens/Schedule/ScheduleScreen/ScheduleScreen";
import { EventDetailScreen } from "../../screens/Schedule/EventDetailScreen/EventDetailScreen";

const Stack = createNativeStackNavigator();

export function ScheduleNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Schedule" component={ScheduleScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: "Event Details" }} />
    </Stack.Navigator>
  );
}
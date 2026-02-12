import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { Routes } from "./routes";
import ScheduleScreen from "../screens/ScheduleScreen";
import EventDetailsScreen from "../screens/EventDetailsScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import MapScreen from "../screens/MapScreen";
import AnnouncementsScreen from "../screens/AnnouncementsScreen";

const Tabs = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tabs.Navigator>
      <Tabs.Screen name={Routes.Schedule} component={ScheduleScreen} />
      <Tabs.Screen name={Routes.Favorites} component={FavoritesScreen} />
      <Tabs.Screen name={Routes.Map} component={MapScreen} />
      <Tabs.Screen name={Routes.Announcements} component={AnnouncementsScreen} />
    </Tabs.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name={Routes.EventDetails} component={EventDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
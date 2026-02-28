import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import NetInfo from "@react-native-community/netinfo";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ScheduleScreen from "../screens/ScheduleScreen";
import EventDetailsScreen  from "../screens/EventDetailsScreen";
import FavoritesScreen  from "../screens/FavoritesScreen";
import MapScreen from "../screens/MapScreen";
import AnnouncementsScreen from "../screens/AnnouncementsScreen";

import {OfflineBanner} from "../components/OfflineBanner";
import LoadingState from "../components/LoadingState";
import { apiClient } from "../services/apiClient";


export type ScheduleStackParamList = {
  Schedule: undefined;
  EventDetails: { eventId: string };
};

const ScheduleStack = createNativeStackNavigator<ScheduleStackParamList>();

function ScheduleStackNavigator() {
  return (
    <ScheduleStack.Navigator id="ScheduleStackNavigator">
      <ScheduleStack.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{ title: "Schedule" }}
      />
      <ScheduleStack.Screen
        name="EventDetails"
        component={EventDetailsScreen}
        options={{ title: "Event Details" }}
      />
    </ScheduleStack.Navigator>
  );
}

export type TabParamList = {
  Schedule: undefined;
  Favorites: undefined;
  Map: undefined;
  Announcements: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function RootNavigator() {
  const [isOffline, setIsOffline] = useState(false);
  const [isStarting, setIsStarting] = useState(true);

  useEffect(() => {
    // Proves env/config is wired and won't crash
    console.log("API base URL:", apiClient.baseUrl);

    const unsub = NetInfo.addEventListener((state) => {
      const offline = !(state.isConnected && state.isInternetReachable !== false);
      setIsOffline(offline);
    });

    // Small startup delay so LoadingState is demonstrably working
    const t = setTimeout(() => setIsStarting(false), 500);

    return () => {
      unsub();
      clearTimeout(t);
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <OfflineBanner isOffline={isOffline} />

      <NavigationContainer>
        <Tab.Navigator
          id="RootTabNavigator"
          screenOptions={{
            headerTitleAlign: "center",
            headerShown: false, 
          }}
        >
          
          <Tab.Screen
            name="Schedule"
            component={ScheduleStackNavigator}
            options={{ title: "Schedule" }}
          />
          <Tab.Screen
            name="Favorites"
            component={FavoritesScreen}
            options={{ title: "Favorites" }}
          />
          <Tab.Screen name="Map" component={MapScreen} options={{ title: "Map" }} />
          <Tab.Screen
            name="Announcements"
            component={AnnouncementsScreen}
            options={{ title: "Announcements" }}
          />
        </Tab.Navigator>
      </NavigationContainer>

      {isStarting && <LoadingState />}
    </SafeAreaView>
  );
}
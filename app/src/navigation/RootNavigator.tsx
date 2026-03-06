import React, { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ExploreScreen from "../screens/ExploreScreen";
import DetailScreen from "../screens/DetailScreen";
import ScheduleScreen from "../screens/ScheduleScreen";
import MapScreen from "../screens/MapScreen";
import AnnouncementsScreen from "../screens/AnnouncementsScreen";
import MoreScreen from "../screens/MoreScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import SettingsScreen from "../screens/SettingsScreen";

import OfflineBanner from "../components/OfflineBanner";
import LoadingState from "../components/LoadingState";
import { apiClient } from "../services/apiClient";
import { useAppSettings } from "../context/AppSettingsContext";

// ---------------------------------------------------------------------------
// Explore stack — ExploreScreen + DetailScreen
// ---------------------------------------------------------------------------

export type ExploreStackParamList = {
  ExploreMain: undefined;
  Detail: { item: any; type: string };
};

const ExploreStack = createNativeStackNavigator<ExploreStackParamList>();

function ExploreStackNavigator() {
  return (
    <ExploreStack.Navigator
      id="ExploreStackNavigator"
      screenOptions={{ headerShown: false }}
    >
      <ExploreStack.Screen
        name="ExploreMain"
        component={ExploreScreen}
        options={{ title: "Explore" }}
      />
      <ExploreStack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ headerShown: true, title: "" }}
      />
    </ExploreStack.Navigator>
  );
}

// ---------------------------------------------------------------------------
// Schedule stack — ScheduleScreen + EventDetailsScreen
// ---------------------------------------------------------------------------

export type ScheduleStackParamList = {
  ScheduleList: undefined;
  EventDetails: { item: any; type: string };
};

const ScheduleStack = createNativeStackNavigator<ScheduleStackParamList>();

function ScheduleStackNavigator() {
  return (
    <ScheduleStack.Navigator
      id="ScheduleStackNavigator"
      screenOptions={{ headerShown: false }}
    >
      <ScheduleStack.Screen name="ScheduleList" component={ScheduleScreen} />
      <ScheduleStack.Screen
        name="EventDetails"
        component={DetailScreen}
        options={{ headerShown: true, title: "" }}
      />
    </ScheduleStack.Navigator>
  );
}

// ---------------------------------------------------------------------------
// Bottom tabs
// ---------------------------------------------------------------------------

export type TabParamList = {
  Explore: undefined;
  Schedule: undefined;
  Map: undefined;
  More: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

function Tabs() {
  const { themeColorHex, tabTextSize } = useAppSettings();

  return (
    <Tab.Navigator
      id="RootTabNavigator"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: themeColorHex,
        tabBarLabelStyle: { fontSize: tabTextSize, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreStackNavigator}
        options={{ title: "Explore" }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleStackNavigator}
        options={{ title: "Schedule" }}
      />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: "Map" }} />
      <Tab.Screen name="More" component={MoreScreen} options={{ title: "More" }} />
    </Tab.Navigator>
  );
}

// ---------------------------------------------------------------------------
// Root stack — Tabs + modal screens from More panel
// ---------------------------------------------------------------------------

export type RootStackParamList = {
  Tabs: undefined;
  Favorites: undefined;
  Announcements: undefined;
  Settings: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [isOffline, setIsOffline] = useState(false);
  const [isStarting, setIsStarting] = useState(true);

  useEffect(() => {
    console.log("API base URL:", apiClient.baseUrl);

    const unsub = NetInfo.addEventListener((state) => {
      const offline = !(state.isConnected && state.isInternetReachable !== false);
      setIsOffline(offline);
    });

    const t = setTimeout(() => setIsStarting(false), 500);

    return () => {
      unsub();
      clearTimeout(t);
    };
  }, []);

  return (
    <>
      <OfflineBanner isOffline={isOffline} />

      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="Tabs" component={Tabs} />
          <RootStack.Screen name="Favorites" component={FavoritesScreen} />
          <RootStack.Screen name="Announcements" component={AnnouncementsScreen} />
          <RootStack.Screen name="Settings" component={SettingsScreen} />
        </RootStack.Navigator>
      </NavigationContainer>

      {isStarting && <LoadingState visible={true} message="Starting app..." />}
    </>
  );
}
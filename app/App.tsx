import React from "react";
import RootNavigator from "./src/navigation/RootNavigator";
import { AppSettingsProvider } from "./src/context/AppSettingsContext";
import { AttendingProvider } from "./src/context/AttendingContext";
import AutoRefreshController from "./src/components/AutoRefreshController";

export default function App() {
  return (
    <AppSettingsProvider>
      <AttendingProvider>
        <AutoRefreshController />
        <RootNavigator />
      </AttendingProvider>
    </AppSettingsProvider>
  );
}
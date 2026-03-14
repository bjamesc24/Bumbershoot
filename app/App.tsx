import React from "react";
import RootNavigator from "./src/navigation/RootNavigator";
import { AppSettingsProvider } from "./src/context/AppSettingsContext";
import { AttendingProvider } from "./src/context/AttendingContext";
import AutoRefreshController from "./src/components/AutoRefreshController";
import { ThemeProvider } from "./src/theme/ThemeProvider";

export default function App() {
  return (
    <ThemeProvider>
      <AppSettingsProvider>
        <AttendingProvider>
          <AutoRefreshController />
          <RootNavigator />
        </AttendingProvider>
      </AppSettingsProvider>
    </ThemeProvider>
  );
}
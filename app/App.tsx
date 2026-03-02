import React from "react";
import RootNavigator from "./src/navigation/RootNavigator";
import { AppSettingsProvider } from "./src/context/AppSettingsContext";

export default function App() {
  return (
    <AppSettingsProvider>
      <RootNavigator />
    </AppSettingsProvider>
  );
}
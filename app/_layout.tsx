import "../global.css";
import React, { useEffect, useState } from "react";
import { Stack, DefaultTheme, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PanelUIProvider } from "panelui-native";
import { Uniwind } from "uniwind";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useFonts,
  DMSans_400Regular,
  DMSans_600SemiBold,
} from "@expo-google-fonts/dm-sans";
import { Manrope_700Bold } from "@expo-google-fonts/manrope";
import * as NativeSplash from "expo-splash-screen";
import { CareProvider, useCare } from "../lib/store";
import { usePalette } from "../lib/theme";
import { Splash } from "../components/brand";
import { FloatingToast } from "../components/ui";
Uniwind.setTheme("light");
void NativeSplash.preventAutoHideAsync();
const queryClient = new QueryClient();
function Navigation() {
  const p = usePalette();
  const care = useCare();
  const [elapsed, setElapsed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setElapsed(true), 1500);
    void NativeSplash.hideAsync();
    return () => clearTimeout(t);
  }, []);
  if (!elapsed || care.loading || !care.state)
    return <Splash error={care.error?.message} onRetry={care.refresh} />;
  return (
    <ThemeProvider
      value={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: p.background,
          card: p.card,
          text: p.ink,
          border: p.border,
          primary: p.primary,
        },
      }}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: p.background },
        }}
      />
      <StatusBar style="dark" />
      <FloatingToast />
    </ThemeProvider>
  );
}
export default function RootLayout() {
  const [loaded, error] = useFonts({
    DMSans_400Regular,
    DMSans_600SemiBold,
    Manrope_700Bold,
  });
  if (!loaded && !error) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <PanelUIProvider>
            <CareProvider>
              <Navigation />
            </CareProvider>
          </PanelUIProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

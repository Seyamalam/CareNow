import "../global.css";
import React, { useEffect, useState } from "react";
import { useReducedMotion } from "react-native-reanimated";
import { Stack, DefaultTheme, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PanelUIProvider } from "panelui-native";
import { Uniwind } from "uniwind";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import * as NativeSplash from "expo-splash-screen";
import { CareProvider, useCare } from "../lib/store";
import { usePalette } from "../lib/theme";
import { LoadingScreen } from "../components/loading";
import { Splash } from "../components/brand";
import { FloatingToast } from "../components/ui";
Uniwind.setTheme("light");
void NativeSplash.preventAutoHideAsync();
function Navigation() {
  const reduced = useReducedMotion();
  const p = usePalette();
  const care = useCare();
  useEffect(() => {
    void NativeSplash.hideAsync();
  }, []);
  if (care.error && !care.state)
    return <Splash error={care.error.message} onRetry={care.refresh} />;
  if (care.loading || !care.state) return <LoadingScreen />;
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
          animation: reduced ? "none" : "slide_from_right",
          contentStyle: { backgroundColor: p.background },
        }}
      />
      <StatusBar style="dark" />
      <FloatingToast />
    </ThemeProvider>
  );
}
export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const [loaded, error] = useFonts({
    DMSans_400Regular: require("../assets/fonts/DMSans_400Regular.ttf"),
    DMSans_600SemiBold: require("../assets/fonts/DMSans_600SemiBold.ttf"),
    Manrope_700Bold: require("../assets/fonts/Manrope_700Bold.ttf"),
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

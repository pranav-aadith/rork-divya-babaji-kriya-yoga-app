import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { AppState, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import Colors from "@/constants/colors";
import {
  fetchCategories,
  fetchEventPosts,
  fetchProgramPages,
} from "@/services/wordpress";

SplashScreen.preventAutoHideAsync();

const ONE_HOUR = 1000 * 60 * 60;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
      staleTime: 1000 * 60 * 5,
      gcTime: ONE_HOUR,
      refetchOnWindowFocus: false,
    },
  },
});

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: Colors.light.background,
        },
        headerTintColor: Colors.light.primary,
        headerTitleStyle: {
          fontWeight: "600" as const,
          color: Colors.light.text,
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="program/[id]"
        options={{
          title: "Program Details",
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="article/[id]"
        options={{
          title: "Article",
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="event/[id]"
        options={{
          title: "Event Details",
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="wisdom/category"
        options={{
          title: "Category",
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="wisdom/books"
        options={{
          title: "Books",
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="wisdom/travel-diaries"
        options={{
          title: "Travel Diaries",
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="wisdom/page/[slug]"
        options={{
          title: "Page",
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="wisdom/kashi-yanam"
        options={{
          title: "Kashi Yanam",
          presentation: "card",
        }}
      />
      <Stack.Screen name="+not-found" options={{ title: "Not Found" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    // Warm the cache with the most commonly accessed data so tabs feel instant.
    queryClient.prefetchQuery({
      queryKey: ["wp", "categories"],
      queryFn: fetchCategories,
      staleTime: 1000 * 60 * 30,
    });
    queryClient.prefetchQuery({
      queryKey: ["wp", "programs"],
      queryFn: fetchProgramPages,
      staleTime: 1000 * 60 * 10,
    });
    queryClient.prefetchQuery({
      queryKey: ["wp", "events", 50],
      queryFn: () => fetchEventPosts(50),
      staleTime: 1000 * 60 * 5,
    });
  }, []);

  useEffect(() => {
    // Refresh queries when the app returns to the foreground.
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (Platform.OS !== "web") {
        focusManager.setFocused(nextAppState === "active");
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootLayoutNav />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

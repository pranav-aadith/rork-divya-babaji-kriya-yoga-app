import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { AppState, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import Colors from "@/constants/colors";
import {
  fetchCategories,
  fetchEventPosts,
  fetchProgramPages,
} from "@/services/wordpress";
import { restoreCache, persistCache } from "@/services/queryPersister";
import {
  CRAWLER_SEED_ENABLED,
  fetchCrawlerData,
  loadCrawlerSeed,
  transformCrawlerToPosts,
  transformCrawlerToPages,
  transformCrawlerToQuotes,
} from "@/services/crawlerSeed";
import { CRAWLER_SEED_QUERY_KEY } from "@/hooks/useCrawlerSeed";

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

// Restore the persisted cache once on module load so the first render can
// use cached data instead of waiting on the slow WordPress API.
const cacheRestored = restoreCache(queryClient);

// If the crawler seed feature is enabled, also restore the last-saved seed from
// AsyncStorage and pre-populate the list query caches so tabs render instantly
// even on a first launch with no persisted RQ cache. The live WP API then
// refreshes the data in the background.
const crawlerSeedHydrated: Promise<void> = CRAWLER_SEED_ENABLED
  ? loadCrawlerSeed().then((entries) => {
      if (!entries || entries.length === 0) return;
      const posts = transformCrawlerToPosts(entries);
      const pages = transformCrawlerToPages(entries);
      const quotes = transformCrawlerToQuotes(entries);
      if (posts.length > 0) {
        queryClient.setQueryData(["wp", "posts", undefined], posts);
        // Events come from the same posts list; seed it too so the Events tab
        // shows content before the live API responds.
        queryClient.setQueryData(["wp", "events", 50], posts);
      }
      if (pages.length > 0) {
        queryClient.setQueryData(["wp", "programs"], pages);
      }
      if (quotes.length > 0) {
        queryClient.setQueryData(["wp", "quotes", 20], quotes);
      }
    })
  : Promise.resolve();

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
        name="wisdom/music"
        options={{
          title: "Music",
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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for the persisted cache to be restored before hiding the splash
    // screen, so users see content immediately rather than empty loading
    // states on a cold start.
    let mounted = true;
    Promise.all([cacheRestored, crawlerSeedHydrated]).finally(() => {
      if (mounted) {
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    });
    return () => {
      mounted = false;
    };
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
    // Refresh the crawler seed from the hosted URL in the background. The
    // hydrated AsyncStorage seed is already visible; this updates it for the
    // next launch and picks up any newly crawled pages.
    if (CRAWLER_SEED_ENABLED) {
      queryClient.prefetchQuery({
        queryKey: CRAWLER_SEED_QUERY_KEY,
        queryFn: fetchCrawlerData,
        staleTime: 1000 * 60 * 60 * 24,
      });
    }
  }, []);

  useEffect(() => {
    // Persist the cache whenever a tracked query updates, so the next launch
    // can render instantly from storage.
    const unsubscribe = queryClient
      .getQueryCache()
      .subscribe(() => persistCache(queryClient));
    return () => unsubscribe();
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
        {isReady ? <RootLayoutNav /> : null}
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Sparkles } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useCategories } from "@/hooks/useWordPress";
import { CATEGORY_IDS } from "@/services/wordpress";
import { LoadingState, ErrorState } from "@/components/LoadingStates";
import type { WPCategory } from "@/services/wordpress";

const { width } = Dimensions.get("window");
const TILE_GAP = 12;
const TILES_PER_ROW = 2;
const TILE_WIDTH = (width - 40 - TILE_GAP) / TILES_PER_ROW;
const TILE_HEIGHT = TILE_WIDTH * 1.1;

const WISDOM_CATEGORIES = [
  {
    id: 50,
    name: "Books",
    slug: "books",
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
  },
  {
    id: 60,
    name: "Sadhak Speaks",
    slug: "sadhak-speaks",
    image:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&q=80",
  },
  {
    id: 50,
    name: "Articles",
    slug: "articles",
    image:
      "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&q=80",
  },
  {
    id: 14,
    name: "Videos",
    slug: "videos",
    image:
      "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&q=80",
  },
  {
    id: 39,
    name: "Travel Diaries",
    slug: "travel-diaries",
    image:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80",
  },
  {
    id: 3,
    name: "Quotes",
    slug: "quotes",
    image: require("@/assets/images/quotes-tile.png"),
  },
  {
    id: 8,
    name: "Music",
    slug: "music",
    image:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=80",
  },
];

export default function WisdomScreen() {
  const router = useRouter();
  const {
    data: categories,
    isLoading,
    isError,
    refetch,
  } = useCategories();

  const categoryCountMap = React.useMemo(() => {
    const map = new Map<number, number>();
    categories?.forEach((cat: WPCategory) => {
      map.set(cat.id, cat.count ?? 0);
    });
    return map;
  }, [categories]);

  const getPostCount = (category: (typeof WISDOM_CATEGORIES)[number]) => {
    if (category.slug === "books") return 2;
    if (category.slug === "travel-diaries") {
      return (
        (categoryCountMap.get(CATEGORY_IDS.himalayanam) ?? 0) +
        (categoryCountMap.get(CATEGORY_IDS.tiruchendur) ?? 0)
      );
    }
    if (category.slug === "quotes") {
      return (
        (categoryCountMap.get(CATEGORY_IDS.quoteEnglish) ?? 0) +
        (categoryCountMap.get(CATEGORY_IDS.quoteTelugu) ?? 0) +
        (categoryCountMap.get(CATEGORY_IDS.quoteHindi) ?? 0) +
        (categoryCountMap.get(CATEGORY_IDS.quoteTamil) ?? 0)
      );
    }
    if (category.slug === "music") return undefined;
    if (category.id === null) return 0;
    return categoryCountMap.get(category.id) ?? 0;
  };

  const handleCategoryPress = (category: (typeof WISDOM_CATEGORIES)[number]) => {
    if (category.slug === "books") {
      router.push("/wisdom/books");
      return;
    }
    if (category.slug === "travel-diaries") {
      router.push("/wisdom/travel-diaries");
      return;
    }
    if (category.slug === "music") {
      router.push("/wisdom/music");
      return;
    }
    const queryId = category.id ?? "articles";
    router.push(
      `/wisdom/category?id=${queryId}&name=${encodeURIComponent(
        category.name
      )}&slug=${category.slug}`
    );
  };

  if (isLoading) {
    return <LoadingState message="Loading wisdom…" />;
  }

  if (isError) {
    return (
      <ErrorState
        message="Unable to load wisdom content. Please check your connection."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Sparkles size={28} color={Colors.light.primary} />
        </View>
        <Text style={styles.headerTitle}>Wisdom</Text>
        <Text style={styles.headerSubtitle}>
          Insights, teachings, and inspiration from the Foundation
        </Text>
      </View>

      <View style={styles.grid}>
        {WISDOM_CATEGORIES.map((category) => {
          const count = getPostCount(category);
          return (
            <TouchableOpacity
              key={category.slug}
              style={styles.tile}
              activeOpacity={0.9}
              onPress={() => handleCategoryPress(category)}
            >
              <Image
                source={
                  typeof category.image === "number"
                    ? category.image
                    : { uri: category.image }
                }
                style={styles.tileImage}
              />
              <View style={styles.tileOverlay} />
              <View style={styles.tileContent}>
                <Text style={styles.tileTitle}>{category.name}</Text>
                <Text style={styles.tileCount}>
                  {count === undefined ? "Listen" : count > 0 ? `${count} items` : "Explore"}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    paddingTop: 16,
    alignItems: "center",
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(224, 123, 57, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    lineHeight: 24,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: TILE_GAP,
  },
  tile: {
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: Colors.light.cardBackground,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  tileImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  tileOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(45, 42, 38, 0.45)",
  },
  tileContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  tileTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  tileCount: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bottomPadding: {
    height: 20,
  },
});

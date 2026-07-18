import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useWisdomPosts } from "@/hooks/useWordPress";
import { CATEGORY_IDS } from "@/services/wordpress";
import { LoadingState, ErrorState } from "@/components/LoadingStates";

const DESTINATIONS = [
  {
    id: CATEGORY_IDS.himalayanam,
    name: "Himalayanam",
    slug: "himalayanam",
    description: "49-day spiritual retreat in the Himalayas",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
    type: "category" as const,
  },
  {
    id: CATEGORY_IDS.tiruchendur,
    name: "Tiruchendur",
    slug: "tiruchendur",
    description: "Sacred journeys to the Tiruchendur shrine",
    image: require("@/assets/images/tiruchendur.png"),
    type: "category" as const,
  },
  {
    id: "kasi-yanam" as const,
    name: "Kashi Yanam",
    slug: "kasi-yanam",
    description: "Pilgrimage to the holy city of Kashi",
    image:
      "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=600&q=80",
    type: "page" as const,
  },
];

export default function TravelDiariesScreen() {
  const router = useRouter();
  const { data: wisdomPosts, isLoading, isError, refetch } = useWisdomPosts(100);

  const getPostCount = (destinationId: number | string) => {
    if (!wisdomPosts || typeof destinationId === "string") return undefined;
    return wisdomPosts.filter((p) => p.categoryIds.includes(destinationId)).length;
  };

  const handlePress = (destination: (typeof DESTINATIONS)[number]) => {
    if (destination.type === "page") {
      router.push("/wisdom/kashi-yanam");
      return;
    }
    router.push(
      `/wisdom/category?id=${destination.id}&name=${encodeURIComponent(
        destination.name
      )}&slug=${destination.slug}`
    );
  };

  if (isLoading) {
    return <LoadingState message="Loading travel diaries…" />;
  }

  if (isError) {
    return (
      <ErrorState
        message="Unable to load travel diaries. Please check your connection."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Travel Diaries",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={Colors.light.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Travel Diaries</Text>
          <Text style={styles.headerSubtitle}>
            Sacred journeys, retreats, and pilgrimage experiences
          </Text>
        </View>

        <View style={styles.list}>
          {DESTINATIONS.map((destination) => {
            const count = getPostCount(destination.id);
            return (
              <TouchableOpacity
                key={destination.slug}
                style={styles.card}
                onPress={() => handlePress(destination)}
                activeOpacity={0.95}
              >
                <Image
                  source={
                    typeof destination.image === "number"
                      ? destination.image
                      : { uri: destination.image }
                  }
                  style={styles.cardImage}
                />
                <View style={styles.cardOverlay} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{destination.name}</Text>
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {destination.description}
                  </Text>
                  {typeof count === "number" && count > 0 && (
                    <Text style={styles.cardCount}>
                      {count} {count === 1 ? "post" : "posts"}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </>
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
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  header: {
    padding: 20,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    lineHeight: 24,
  },
  list: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    height: 200,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: Colors.light.cardBackground,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(45, 42, 38, 0.45)",
  },
  cardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardDescription: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 22,
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardCount: {
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

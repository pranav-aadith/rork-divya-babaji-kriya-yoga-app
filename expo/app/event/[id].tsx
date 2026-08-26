import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar, Clock, MapPin, Video } from "lucide-react-native";
import Colors from "@/constants/colors";
import { usePost } from "@/hooks/useWordPress";
import { LoadingState, ErrorState } from "@/components/LoadingStates";
import { apiErrorMessage } from "@/services/wordpress";
import { htmlToParagraphs } from "@/utils/html";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=800";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const numericId = id ? parseInt(id, 10) : null;
  const { data: event, isLoading, isError, error, refetch } = usePost(numericId);

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: "Event Details" }} />
        <LoadingState message="Loading event details…" />
      </>
    );
  }

  if (isError || !event) {
    return (
      <>
        <Stack.Screen options={{ title: "Event Details" }} />
        <ErrorState
          message={apiErrorMessage(
            error,
            "Unable to load this event. Please try again."
          )}
          onRetry={() => refetch()}
        />
      </>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const isOnline =
    (event.title + " " + event.excerpt).toLowerCase().includes("online") ||
    (event.title + " " + event.excerpt).toLowerCase().includes("zoom") ||
    (event.title + " " + event.excerpt).toLowerCase().includes("live");

  const paragraphs = htmlToParagraphs(event.content);
  const category =
    event.categories.find((c) => c !== "Event") ?? "Event";

  return (
    <>
      <Stack.Screen options={{ title: "Event Details" }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Image
            source={{ uri: event.imageUrl ?? FALLBACK_IMAGE }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.heroGradient}
          />
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              {isOnline ? (
                <>
                  <Video size={12} color="#fff" />
                  <Text style={styles.heroBadgeText}>Online Event</Text>
                </>
              ) : (
                <>
                  <MapPin size={12} color="#fff" />
                  <Text style={styles.heroBadgeText}>In-Person</Text>
                </>
              )}
            </View>
            <Text style={styles.heroTitle}>{event.title}</Text>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.detailCard}>
            <View style={styles.detailIcon}>
              <Calendar size={24} color={Colors.light.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formatDate(event.date)}</Text>
            </View>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailIcon}>
              <Clock size={24} color={Colors.light.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{formatTime(event.date)}</Text>
            </View>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailIcon}>
              {isOnline ? (
                <Video size={24} color={Colors.light.primary} />
              ) : (
                <MapPin size={24} color={Colors.light.primary} />
              )}
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>
                {isOnline ? "Online via Zoom" : category}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Event</Text>
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, index) => (
              <Text key={index} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))
          ) : event.excerpt ? (
            <Text style={styles.paragraph}>{event.excerpt}</Text>
          ) : (
            <Text style={styles.paragraph}>
              Details for this event are being updated. Please visit our website
              for more information.
            </Text>
          )}
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
  heroSection: {
    height: 280,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  heroContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#fff",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#fff",
  },
  detailsSection: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
    marginTop: 24,
  },
  detailCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  detailIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(224, 123, 57, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    lineHeight: 26,
    marginBottom: 14,
  },
  bottomPadding: {
    height: 20,
  },
});

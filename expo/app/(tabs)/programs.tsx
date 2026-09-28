import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Clock, ChevronRight } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useProgramPages } from "@/hooks/useWordPress";
import { LoadingState, ErrorState } from "@/components/LoadingStates";
import { htmlToExcerpt } from "@/utils/html";
import { apiErrorMessage, type Page } from "@/services/wordpress";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800";

const SUSHUMNA_VANI_CARD_IMAGE = require("@/assets/images/sushumna-vani-logo.png");
const GARBHA_SANSKAR_CARD_IMAGE = require("@/assets/images/garbha-sanskar.png");
const SUSHUMNA_SIKSHANA_CARD_IMAGE = require("@/assets/images/sushumna-sikshana.png");

function getProgramCardImage(program: Page) {
  if (program.slug === "sushumna-vani") {
    return SUSHUMNA_VANI_CARD_IMAGE;
  }
  if (program.slug === "gharbha-sanskar") {
    return GARBHA_SANSKAR_CARD_IMAGE;
  }
  if (program.slug === "sushumna-sikshana-2-2") {
    return SUSHUMNA_SIKSHANA_CARD_IMAGE;
  }
  return { uri: program.imageUrl ?? FALLBACK_IMAGE };
}

export default function ProgramsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: programs, isLoading, isError, error, refetch } = useProgramPages();

  if (isLoading) {
    return <LoadingState message="Loading programs…" />;
  }

  if (isError) {
    return (
      <ErrorState
        message={apiErrorMessage(
          error,
          "Unable to load programs. Please check your connection."
        )}
        onRetry={() => refetch()}
      />
    );
  }

  const programList: Page[] = programs ?? [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Programs</Text>
        <Text style={styles.headerSubtitle}>
          Transform your life through the ancient science of Kriya Yoga
        </Text>
      </View>

      <View style={styles.programsList}>
        {programList.length === 0 ? (
          <Text style={styles.emptyText}>No programs available at this time.</Text>
        ) : (
          programList.map((program) => (
            <TouchableOpacity
              key={program.id}
              style={styles.programCard}
              onPress={() => router.push(`/program/${program.id}`)}
              activeOpacity={0.95}
            >
              <Image
                source={getProgramCardImage(program)}
                style={styles.programImage}
              />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.85)"]}
                style={styles.programGradient}
              />
              <View style={styles.programContent}>
                <Text style={styles.programTitle}>{program.title}</Text>
                <Text style={styles.programSubtitle} numberOfLines={2}>
                  {program.excerpt || "Explore this sacred program"}
                </Text>
                <View style={styles.programFooter}>
                  <View style={styles.programMeta}>
                    <Clock size={14} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.programMetaText}>Learn More</Text>
                  </View>
                  <View style={styles.learnMore}>
                    <Text style={styles.learnMoreText}>View Details</Text>
                    <ChevronRight size={16} color={Colors.light.primaryLight} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
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
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "400" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    lineHeight: 24,
  },
  programsList: {
    paddingHorizontal: 20,
    gap: 20,
  },
  programCard: {
    height: 280,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: Colors.light.cardBackground,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  programImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  programGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "75%",
  },
  programContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  programTitle: {
    fontSize: 24,
    fontWeight: "400" as const,
    color: "#fff",
    marginBottom: 4,
  },
  programSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 16,
    lineHeight: 20,
  },
  programFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  programMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  programMetaText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  learnMore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  learnMoreText: {
    fontSize: 14,
    fontWeight: "400" as const,
    color: Colors.light.primaryLight,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: "center",
    paddingVertical: 40,
  },
  bottomPadding: {
    height: 20,
  },
});

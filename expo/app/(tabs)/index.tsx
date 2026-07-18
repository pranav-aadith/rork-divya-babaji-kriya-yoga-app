import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useQuotes, usePosts } from "@/hooks/useWordPress";
import { InlineLoading } from "@/components/LoadingStates";
import type { Post } from "@/services/wordpress";

const { width } = Dimensions.get("window");

/** Placeholder image used when a post/page has no featured image */
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800";

export default function HomeScreen() {
  const router = useRouter();
  const fadeAnim = useState(new Animated.Value(0))[0];

  const { data: quotesData, isLoading: quotesLoading } = useQuotes(5);
  const { data: postsData } = usePosts({ per_page: 4 });

  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Pick a random quote once data loads
  useEffect(() => {
    if (quotesData && quotesData.length > 0) {
      setQuoteIndex(Math.floor(Math.random() * quotesData.length));
    }
  }, [quotesData]);

  const currentQuote: Post | undefined = quotesData?.[quoteIndex];
  const recentPosts: Post[] = postsData ?? [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={[Colors.light.primary, Colors.light.primaryLight]}
          style={styles.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Image
                  source={require("../../assets/images/app-logo.png")}
                  style={styles.logoImage}
                  resizeMode="cover"
                />
              </View>
            </View>
            <Text style={styles.heroTitle}>Sushumna Kriya Yoga</Text>
            <Text style={styles.heroSubtitle}>Awaken Your Inner Light</Text>
          </View>
          <View style={styles.heroPattern}>
            {[...Array(6)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.patternCircle,
                  {
                    width: 100 + i * 40,
                    height: 100 + i * 40,
                    opacity: 0.1 - i * 0.015,
                  },
                ]}
              />
            ))}
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.quoteSection}>
        {quotesLoading ? (
          <View style={styles.quoteCard}>
            <InlineLoading message="Loading daily inspiration…" />
          </View>
        ) : currentQuote ? (
          <View style={styles.quoteCard}>
            <View style={styles.quoteIcon}>
              <Text style={styles.quoteIconText}>&quot;</Text>
            </View>
            <Text style={styles.quoteText}>{currentQuote.title}</Text>
            <Text style={styles.quoteAuthor}>
              — Sushumna Kriya Yoga Foundation
            </Text>
          </View>
        ) : (
          <View style={styles.quoteCard}>
            <View style={styles.quoteIcon}>
              <Text style={styles.quoteIconText}>&quot;</Text>
            </View>
            <Text style={styles.quoteText}>
              Attaining inner peace can bring peace to the world; attaining inner
              harmony can bring harmony to the world; attaining inner bliss can
              bring glory to the entire world.
            </Text>
            <Text style={styles.quoteAuthor}>
              — Pujya Guru Mahavatar Babaji
            </Text>
          </View>
        )}
      </View>

      {recentPosts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Updates</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => router.push("/(tabs)/knowledge")}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <ArrowRight size={16} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.programsScroll}
          >
            {recentPosts.slice(0, 4).map((post) => (
              <TouchableOpacity
                key={post.id}
                style={styles.updateCard}
                onPress={() => router.push(`/article/${post.id}`)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: post.imageMediumUrl ?? post.imageUrl ?? FALLBACK_IMAGE }}
                  style={styles.updateImage}
                />
                <View style={styles.updateContent}>
                  {post.categories.length > 0 && (
                    <Text style={styles.updateCategory}>
                      {post.categories[0]}
                    </Text>
                  )}
                  <Text style={styles.updateTitle} numberOfLines={3}>
                    {post.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.bannerSection}>
        <LinearGradient
          colors={[Colors.light.secondary, Colors.light.secondaryLight]}
          style={styles.banner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>New to Kriya Yoga?</Text>
            <Text style={styles.bannerText}>
              Start with our free introduction session
            </Text>
          </View>
          <View style={styles.bannerDecor}>
            <Text style={styles.bannerEmoji}>✨</Text>
          </View>
        </LinearGradient>
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
  heroSection: {
    marginBottom: 20,
  },
  heroGradient: {
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
  heroContent: {
    alignItems: "center",
    zIndex: 2,
  },
  heroPattern: {
    position: "absolute",
    right: -50,
    top: -50,
    alignItems: "center",
    justifyContent: "center",
  },
  patternCircle: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#fff",
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  logoImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 24,
  },
  quoteSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
    marginTop: -30,
  },
  quoteCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  quoteIcon: {
    position: "absolute",
    top: 12,
    left: 16,
  },
  quoteIconText: {
    fontSize: 48,
    color: Colors.light.primaryLight,
    fontWeight: "700" as const,
    opacity: 0.3,
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 26,
    color: Colors.light.text,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 12,
    paddingTop: 8,
  },
  quoteAuthor: {
    fontSize: 14,
    color: Colors.light.primary,
    textAlign: "center",
    fontWeight: "600" as const,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "600" as const,
  },
  programsScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    alignItems: "center",
  },
  quickActionGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickActionEmoji: {
    fontSize: 28,
  },
  quickActionText: {
    fontSize: 12,
    color: Colors.light.text,
    textAlign: "center",
    fontWeight: "500" as const,
  },
  updateCard: {
    width: width * 0.6,
    borderRadius: 20,
    backgroundColor: "#fff",
    overflow: "hidden",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  updateImage: {
    width: "100%",
    height: 120,
  },
  updateContent: {
    padding: 14,
  },
  updateCategory: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.light.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  updateTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    lineHeight: 20,
  },
  bannerSection: {
    paddingHorizontal: 20,
  },
  banner: {
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
  },
  bannerDecor: {
    marginLeft: 16,
  },
  bannerEmoji: {
    fontSize: 48,
  },
  bottomPadding: {
    height: 20,
  },
});

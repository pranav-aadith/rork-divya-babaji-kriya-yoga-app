import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { useQuotes } from "@/hooks/useWordPress";
import { InlineLoading } from "@/components/LoadingStates";
import type { Post } from "@/services/wordpress";

export default function HomeScreen() {
  const fadeAnim = useState(new Animated.Value(0))[0];

  const { data: quotesData, isLoading: quotesLoading } = useQuotes(5);

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
              <View style={styles.logoFrame}>
                <Image
                  source={require("../../assets/images/gurus-banner.jpg")}
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
  logoFrame: {
    width: 252,
    height: 168,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#c0392b",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  logoImage: {
    width: 252,
    height: 168,
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

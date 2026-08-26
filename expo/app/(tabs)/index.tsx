import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  TouchableOpacity,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import Colors from "@/constants/colors";
import { useQuotes } from "@/hooks/useWordPress";
import { InlineLoading } from "@/components/LoadingStates";
import type { Post } from "@/services/wordpress";

const WHATSAPP_URL = "https://api.whatsapp.com/send?phone=917337555449";

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

      <View style={styles.bottomPadding} />

      {/* Floating WhatsApp tap-to-chat widget */}
      <Animated.View
        style={[styles.chatWidgetWrap, { opacity: fadeAnim }]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          style={styles.chatWidget}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Chat with us on WhatsApp"
          onPress={() => Linking.openURL(WHATSAPP_URL).catch(() => {})}
        >
          <View style={styles.chatIconWrap}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="#25D366">
              <Path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </Svg>
            <View style={styles.chatBadge} />
          </View>
          <Text style={styles.chatWidgetText}>Tap to Chat</Text>
        </TouchableOpacity>
      </Animated.View>
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
  bottomPadding: {
    height: 20,
  },
  chatWidgetWrap: {
    position: "absolute",
    right: 16,
    bottom: 100,
    zIndex: 100,
  },
  chatWidget: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 28,
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(37, 211, 102, 0.25)",
  },
  chatIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(37, 211, 102, 0.12)",
  },
  chatBadge: {
    position: "absolute",
    top: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#e53935",
    borderWidth: 2,
    borderColor: "#fff",
  },
  chatWidgetText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#075E54",
  },
});

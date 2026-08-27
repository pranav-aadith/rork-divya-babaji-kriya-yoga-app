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

/** Hero band cropped from the reference artwork (1545x1150 source region) */
const HERO_ASPECT = 1545 / 1150;

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

  const openWhatsApp = () => {
    Linking.openURL(WHATSAPP_URL).catch(() => {});
  };

  return (
    <LinearGradient
      colors={["#F1A377", "#F6BE97", "#FBD8BC"]}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      {/* Soft bokeh lights behind the content */}
      <View style={styles.glowWrap} pointerEvents="none">
        <View style={styles.glowCircle} />
        <View style={styles.glowCircleSmall} />
        <View style={styles.bokeh1} />
        <View style={styles.bokeh2} />
        <View style={styles.bokeh3} />
        <View style={styles.bokeh4} />
        <View style={styles.bokeh5} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
          <Image
            source={require("../../assets/images/home-hero.jpg")}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <Text style={styles.heroSubtitle}>Awaken Your Inner Light</Text>
        </Animated.View>

        <Animated.View style={[styles.quoteSection, { opacity: fadeAnim }]}>
          <View style={styles.quoteCard}>
            <View style={styles.quoteIcon}>
              <Text style={styles.quoteIconText}>&ldquo;</Text>
            </View>
            {quotesLoading ? (
              <InlineLoading message="Loading daily inspiration…" />
            ) : (
              <>
                <Text style={styles.quoteText}>
                  {currentQuote ? currentQuote.title : "Attaining inner peace can bring peace to the world; attaining inner harmony can bring harmony to the world; attaining inner bliss can bring glory to the entire world."}
                </Text>
                <Text style={styles.quoteAuthor}>
                  {currentQuote
                    ? "— Sushumna Kriya Yoga Foundation"
                    : "— Pujya Guru Mahavatar Babaji"}
                </Text>
                <View style={styles.quoteDivider}>
                  <View style={styles.quoteDividerLine} />
                  <View style={styles.quoteDividerDot} />
                  <View style={styles.quoteDividerLine} />
                </View>
              </>
            )}
          </View>
        </Animated.View>

        {/* Connect with a Guide — WhatsApp pill */}
        <Animated.View style={[styles.guideWrap, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.guideButton}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Connect with a guide on WhatsApp"
            onPress={openWhatsApp}
          >
            <View style={styles.guideIconWrap}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="#fff">
                <Path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </Svg>
            </View>
            <Text style={styles.guideText}>Connect with a Guide</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  contentContainer: {
    paddingTop: 0,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: "stretch",
  },
  glowWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
  },
  glowCircle: {
    position: "absolute",
    top: 140,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: "rgba(255, 236, 200, 0.55)",
  },
  glowCircleSmall: {
    position: "absolute",
    top: 40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255, 214, 160, 0.35)",
  },
  mandala: {
    position: "absolute",
    top: 10,
    alignSelf: "center",
    opacity: 0.6,
  },
  bokeh1: {
    position: "absolute",
    top: 330,
    left: 26,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255, 226, 178, 0.5)",
  },
  bokeh2: {
    position: "absolute",
    top: 470,
    right: 30,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255, 236, 198, 0.45)",
  },
  bokeh3: {
    position: "absolute",
    top: 560,
    left: 58,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255, 240, 210, 0.55)",
  },
  bokeh4: {
    position: "absolute",
    top: 640,
    right: 62,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 230, 185, 0.4)",
  },
  bokeh5: {
    position: "absolute",
    top: 250,
    right: 48,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(255, 244, 218, 0.6)",
  },
  heroSection: {
    alignItems: "center",
    marginHorizontal: -24,
  },
  heroImage: {
    width: "100%",
    aspectRatio: HERO_ASPECT,
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 14,
    letterSpacing: 0.5,
    textShadowColor: "rgba(160, 82, 30, 0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  quoteSection: {
    marginTop: 36,
  },
  quoteCard: {
    backgroundColor: "rgba(255, 254, 250, 0.92)",
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    paddingTop: 36,
    shadowColor: "#7A3B12",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  quoteIcon: {
    position: "absolute",
    top: 10,
    left: 18,
  },
  quoteIconText: {
    fontSize: 56,
    color: "#C9921B",
    fontWeight: "700" as const,
    opacity: 0.55,
    lineHeight: 64,
  },
  quoteText: {
    fontSize: 17,
    lineHeight: 27,
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 14,
  },
  quoteAuthor: {
    fontSize: 14,
    color: Colors.light.primary,
    textAlign: "center",
    fontWeight: "600" as const,
  },
  quoteDivider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  quoteDividerLine: {
    width: 38,
    height: 1.5,
    backgroundColor: "rgba(201, 146, 27, 0.4)",
  },
  quoteDividerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(201, 146, 27, 0.7)",
    marginHorizontal: 8,
  },
  guideWrap: {
    marginTop: 56,
    alignItems: "center",
  },
  guideButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDF3E2",
    borderRadius: 32,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 26,
    shadowColor: "#7A3B12",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.7)",
  },
  guideIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#25D366",
  },
  guideText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#5B4632",
  },
  bottomPadding: {
    height: 24,
  },
});

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Animated,
  TouchableOpacity,
  Linking,
  Dimensions,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import Colors from "@/constants/colors";
import { useQuotes } from "@/hooks/useWordPress";
import { InlineLoading } from "@/components/LoadingStates";
import type { Post } from "@/services/wordpress";

const WHATSAPP_URL = "https://api.whatsapp.com/send?phone=917337555449";
const SCREEN_HEIGHT = Dimensions.get("window").height;
const ART_CLEARANCE = Math.round(SCREEN_HEIGHT * 0.42);

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
    <ImageBackground
      source={require("../../assets/images/home-peach-gurus-bg.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.artClearance} />

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
              </>
            )}
          </View>
        </Animated.View>

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
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  artClearance: {
    height: ART_CLEARANCE,
  },
  quoteSection: {
    marginTop: 8,
  },
  quoteCard: {
    backgroundColor: "#FFFEFA",
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
    color: Colors.light.primaryLight,
    fontWeight: "700" as const,
    opacity: 0.4,
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
  guideWrap: {
    marginTop: "auto" as const,
    paddingTop: 28,
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
});

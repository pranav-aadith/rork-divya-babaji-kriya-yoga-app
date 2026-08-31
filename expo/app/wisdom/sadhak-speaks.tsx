/**
 * Sadhak Speaks — a creative channel landing screen.
 *
 * Sadhak Speaks lives on YouTube (Sushumna The Inner Miracles), so instead
 * of a plain post list this screen is a branded invitation: animated hero,
 * story prompts, and a call-to-action that opens the channel.
 */

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Youtube,
  Play,
  Heart,
  Sparkles,
  MessageCircleHeart,
  Sun,
  ChevronRight,
} from "lucide-react-native";
import Colors from "@/constants/colors";

const CHANNEL_URL = "https://www.youtube.com/@SushumnaTheInnerMiracles";
const CHANNEL_NAME = "Sushumna - The Inner Miracles";
const YOUTUBE_RED = "#E62117";

/** Story themes shown as tappable prompts — all lead to the channel. */
const STORY_THEMES: { icon: typeof Heart; title: string; text: string }[] = [
  {
    icon: Sun,
    title: "Morning Miracles",
    text: "How a few quiet minutes of Kriya changed an ordinary day",
  },
  {
    icon: Heart,
    title: "Healing Journeys",
    text: "Sadhaks share moments of peace, gratitude, and inner healing",
  },
  {
    icon: Sparkles,
    title: "First Steps",
    text: "What it felt like to begin the Sushumna Kriya practice",
  },
  {
    icon: MessageCircleHeart,
    title: "Letters to Babaji",
    text: "Heartfelt words of devotion from practitioners around the world",
  },
];

function ThemeRow({
  icon: Icon,
  title,
  text,
  index,
  anim,
  onPress,
}: {
  icon: typeof Heart;
  title: string;
  text: string;
  index: number;
  anim: Animated.Value;
  onPress: () => void;
}) {
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });
  return (
    <Animated.View
      style={[
        styles.themeRow,
        { opacity: anim, transform: [{ translateX }] },
      ]}
    >
      <TouchableOpacity
        style={styles.themeCard}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Watch ${title} on YouTube`}
        onPress={onPress}
      >
        <View style={styles.themeIconWrap}>
          <Icon size={18} color={YOUTUBE_RED} />
        </View>
        <View style={styles.themeTextWrap}>
          <Text style={styles.themeTitle}>{title}</Text>
          <Text style={styles.themeText}>{text}</Text>
        </View>
        <ChevronRight size={18} color="#B09A82" />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function SadhakSpeaksScreen() {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const themesAnim = useRef(
    STORY_THEMES.map((_, i) => new Animated.Value(0))
  ).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
    const animations = themesAnim.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: 250 + i * 120,
        useNativeDriver: true,
      })
    );
    Animated.stagger(0, animations).start();
  }, [fadeAnim, themesAnim]);

  const openChannel = () => {
    Linking.openURL(CHANNEL_URL).catch(() => {});
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: insets.top + 12 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <LinearGradient
          colors={["#B31217", YOUTUBE_RED, "#F0655F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroGlow} />
          <View style={styles.playBadge}>
            <Play size={26} color={YOUTUBE_RED} fill={YOUTUBE_RED} />
          </View>
          <Text style={styles.heroKicker}>A YouTube series</Text>
          <Text style={styles.heroTitle}>Sadhak Speaks</Text>
          <Text style={styles.heroSubtitle}>
            Real stories from real practitioners — voices of transformation on
            the Sushumna path
          </Text>
          <Text style={styles.heroChannel}>{CHANNEL_NAME}</Text>
        </LinearGradient>
      </Animated.View>

      {/* CTA */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <TouchableOpacity
          style={styles.subscribeButton}
          activeOpacity={0.85}
          accessibilityRole="link"
          accessibilityLabel="Watch Sadhak Speaks on YouTube"
          onPress={openChannel}
        >
          <Youtube size={22} color="#fff" />
          <Text style={styles.subscribeText}>Watch on YouTube</Text>
        </TouchableOpacity>
        <Text style={styles.subscribeHint}>
          Free to watch · New stories added regularly
        </Text>
      </Animated.View>

      {/* Story themes */}
      <Text style={styles.sectionTitle}>Stories you&apos;ll find</Text>
      <View style={styles.themeList}>
        {STORY_THEMES.map((theme, index) => (
          <ThemeRow
            key={theme.title}
            icon={theme.icon}
            title={theme.title}
            text={theme.text}
            index={index}
            anim={themesAnim[index]}
            onPress={openChannel}
          />
        ))}
      </View>

      {/* Closing note */}
      <Animated.View style={[styles.noteCard, { opacity: fadeAnim }]}>
        <Text style={styles.noteText}>
          &ldquo;Every sadhak&apos;s journey is a lamp for another&apos;s
          path.&rdquo;
        </Text>
        <TouchableOpacity
          style={styles.noteLink}
          activeOpacity={0.8}
          accessibilityRole="link"
          accessibilityLabel="Open the YouTube channel"
          onPress={openChannel}
        >
          <Text style={styles.noteLinkText}>Visit the channel</Text>
          <ChevronRight size={14} color={YOUTUBE_RED} />
        </TouchableOpacity>
      </Animated.View>

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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  hero: {
    borderRadius: 24,
    padding: 28,
    paddingTop: 34,
    alignItems: "center",
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  playBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroKicker: {
    fontSize: 13,
    fontWeight: "400" as const,
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "400" as const,
    color: "#fff",
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.92)",
    textAlign: "center",
    marginBottom: 14,
  },
  heroChannel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    fontStyle: "italic",
  },
  subscribeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: YOUTUBE_RED,
    borderRadius: 28,
    paddingVertical: 15,
    marginTop: 20,
  },
  subscribeText: {
    fontSize: 16,
    fontWeight: "400" as const,
    color: "#fff",
  },
  subscribeHint: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "400" as const,
    color: Colors.light.text,
    marginTop: 28,
    marginBottom: 14,
  },
  themeList: {
    gap: 12,
  },
  themeRow: {},
  themeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FFFEFA",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(230, 33, 23, 0.10)",
  },
  themeIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(230, 33, 23, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  themeTextWrap: {
    flex: 1,
  },
  themeTitle: {
    fontSize: 15,
    fontWeight: "400" as const,
    color: Colors.light.text,
    marginBottom: 3,
  },
  themeText: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.light.textSecondary,
  },
  noteCard: {
    marginTop: 24,
    alignItems: "center",
    backgroundColor: "rgba(230, 33, 23, 0.05)",
    borderRadius: 18,
    padding: 20,
  },
  noteText: {
    fontSize: 15,
    lineHeight: 23,
    color: Colors.light.text,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 12,
  },
  noteLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  noteLinkText: {
    fontSize: 14,
    fontWeight: "400" as const,
    color: YOUTUBE_RED,
  },
  bottomPadding: {
    height: 20,
  },
});

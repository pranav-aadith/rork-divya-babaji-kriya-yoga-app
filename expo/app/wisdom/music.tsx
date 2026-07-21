import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Animated,
  Pressable,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Play, Music2, Headphones } from "lucide-react-native";
import Colors from "@/constants/colors";

const SOUNDCLOUD_URL = "https://soundcloud.com/divyababaji-kriyayoga";
const SOUNDCLOUD_ORANGE = "#FF5500";
const SOUNDCLOUD_ORANGE_LIGHT = "#FF7700";

/** Animated equalizer bar — each bar pulses on its own loop/phase */
function EqualizerBar({ height, delay, isPlaying }: { height: number; delay: number; isPlaying: boolean }) {
  const scaleY = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    if (!isPlaying) {
      Animated.timing(scaleY, {
        toValue: 0.35,
        duration: 300,
        useNativeDriver: true,
      }).start();
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleY, {
          toValue: 1,
          duration: 700,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(scaleY, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [isPlaying, scaleY, delay]);

  return (
    <Animated.View
      style={[
        styles.eqBar,
        {
          height,
          transform: [{ scaleY }],
        },
      ]}
    />
  );
}

/** A row of equalizer bars that pulse when playing — evokes an audio waveform */
function EqualizerWaveform({ isPlaying }: { isPlaying: boolean }) {
  const bars = [
    { height: 18, delay: 0 },
    { height: 28, delay: 120 },
    { height: 14, delay: 240 },
    { height: 32, delay: 80 },
    { height: 22, delay: 200 },
    { height: 38, delay: 320 },
    { height: 16, delay: 40 },
    { height: 26, delay: 160 },
    { height: 20, delay: 280 },
    { height: 34, delay: 360 },
    { height: 12, delay: 100 },
    { height: 30, delay: 220 },
    { height: 24, delay: 60 },
    { height: 36, delay: 180 },
    { height: 18, delay: 300 },
    { height: 28, delay: 340 },
    { height: 14, delay: 140 },
    { height: 32, delay: 260 },
    { height: 22, delay: 20 },
    { height: 38, delay: 380 },
  ];

  return (
    <View style={styles.eqContainer}>
      {bars.map((bar, index) => (
        <EqualizerBar
          key={index}
          height={bar.height}
          delay={bar.delay}
          isPlaying={isPlaying}
        />
      ))}
    </View>
  );
}

export default function MusicScreen() {
  const router = useRouter();
  const [isPressed, setIsPressed] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const pressScale = useRef(new Animated.Value(1)).current;

  const openSoundCloud = async () => {
    const canOpen = await Linking.canOpenURL(SOUNDCLOUD_URL);
    if (canOpen) {
      await Linking.openURL(SOUNDCLOUD_URL);
    } else {
      Alert.alert(
        "Unable to open",
        "Could not open SoundCloud. Please check your internet connection."
      );
    }
  };

  const handlePressIn = () => {
    setIsPressed(true);
    setIsPlaying(false);
    Animated.spring(pressScale, {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    setIsPlaying(true);
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Music",
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
          <Text style={styles.headerTitle}>Music</Text>
          <Text style={styles.headerSubtitle}>
            Meditation audio and kriya guidance from the Foundation
          </Text>
        </View>

        <View style={styles.heroWrap}>
          <Animated.View style={{ transform: [{ scale: pressScale }] }}>
            <Pressable
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={openSoundCloud}
              style={styles.heroTile}
            >
              <LinearGradient
                colors={[SOUNDCLOUD_ORANGE, SOUNDCLOUD_ORANGE_LIGHT]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGradient}
              >
                {/* Decorative glow circles */}
                <View style={styles.glowCircle1} />
                <View style={styles.glowCircle2} />

                {/* Top label row */}
                <View style={styles.topRow}>
                  <Headphones size={18} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.topLabel}>SOUNDCLOUD</Text>
                </View>

                {/* Equalizer waveform */}
                <View style={styles.eqWrap}>
                  <EqualizerWaveform isPlaying={isPlaying} />
                </View>

                {/* Play button + profile info */}
                <View style={styles.profileRow}>
                  <View style={styles.playButton}>
                    <Play
                      size={32}
                      color="#fff"
                      fill="#fff"
                      style={{ marginLeft: 3 }}
                    />
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>
                      Divya Babaji Kriya Yoga
                    </Text>
                    <Text style={styles.profileHandle}>
                      Listen on SoundCloud
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>

        <View style={styles.introSection}>
          <View style={styles.introIconWrap}>
            <Music2 size={20} color={Colors.light.primary} />
          </View>
          <Text style={styles.introTitle}>Guided Meditation Audio</Text>
          <Text style={styles.introText}>
            Explore a collection of guided Sushumna Kriya meditations, chanting,
            and kriya instruction audio on the Foundation&apos;s SoundCloud. These
            recordings support your daily practice and deepen your journey with
            Sushumna Kriya Yoga.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.85}
          onPress={openSoundCloud}
        >
          <Headphones size={20} color={Colors.light.primary} />
          <Text style={styles.secondaryButtonText}>Open SoundCloud</Text>
        </TouchableOpacity>

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
  heroWrap: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  heroTile: {
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: SOUNDCLOUD_ORANGE,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  },
  heroGradient: {
    padding: 24,
    paddingTop: 20,
    paddingBottom: 24,
    position: "relative",
    overflow: "hidden",
  },
  glowCircle1: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  glowCircle2: {
    position: "absolute",
    bottom: -80,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    zIndex: 2,
  },
  topLabel: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 2,
  },
  eqWrap: {
    marginVertical: 20,
    zIndex: 2,
  },
  eqContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    height: 44,
  },
  eqBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    zIndex: 2,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 2,
  },
  profileHandle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
  },
  introSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  introIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(224, 123, 57, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 10,
  },
  introText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    lineHeight: 26,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: Colors.light.cardBackground,
    borderWidth: 1,
    borderColor: Colors.light.border ?? "rgba(0,0,0,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  bottomPadding: {
    height: 20,
  },
});

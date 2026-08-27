import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  TouchableOpacity,
  Linking,
  Share,
  ActivityIndicator,
} from "react-native";
import Svg, {
  Path,
  Text as SvgText,
  Rect,
  Defs,
  Stop,
  LinearGradient as SvgLinearGradient,
  Image as SvgImage,
} from "react-native-svg";
import { Facebook, Instagram, Youtube, Heart, Share2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Asset } from "expo-asset";
import { File, Paths } from "expo-file-system";
import Colors from "@/constants/colors";
import { QUOTE_LANGUAGES, useLanguage } from "@/context/language";
import { useFavorites } from "@/context/favorites";
import { useQuotes } from "@/hooks/useWordPress";
import { detectLanguage, type LanguageFilter } from "@/utils/language";
import { InlineLoading } from "@/components/LoadingStates";
import type { Post } from "@/services/wordpress";

const WHATSAPP_URL = "https://api.whatsapp.com/send?phone=917337555449";
const PEACH = "#F6D2B0";

/* ── Share card (quote over the artwork) ─────────────────────────── */

const SHARE_W = 1080;
const SHARE_H = 1350;
const SHARE_FONT = 46;
const SHARE_LINE_H = 68;
const SHARE_MAX_CHARS = 34;
const SHARE_MAX_LINES = 10;
const ARTWORK_URI = Asset.fromModule(
  require("../../assets/images/home-peach-gurus-bg.png")
).uri;

type SvgHandle = React.ComponentRef<typeof Svg>;

/** Word-wrap quote text into SVG-friendly lines, capped with an ellipsis. */
function wrapQuoteLines(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > SHARE_MAX_CHARS && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  if (lines.length > SHARE_MAX_LINES) {
    return [...lines.slice(0, SHARE_MAX_LINES - 1), `${lines[SHARE_MAX_LINES - 1]}…`];
  }
  return lines;
}

const SOCIALS: { id: string; url: string; color: string; label: string }[] = [
  {
    id: "facebook",
    url: "https://www.facebook.com/DivyaBabajiSushumnaKriyayoga",
    color: "#1877F2",
    label: "Facebook",
  },
  {
    id: "whatsapp",
    url: "https://www.whatsapp.com/channel/0029Va9QlNp65yDKxRfezV2M",
    color: "#25D366",
    label: "WhatsApp channel",
  },
  {
    id: "instagram",
    url: "https://www.instagram.com/sushumna_kriyayoga",
    color: "#D6336C",
    label: "Instagram",
  },
  {
    id: "youtube",
    url: "https://www.youtube.com/channel/UCzK4acW5TVvEEDDf_mVwzzA",
    color: "#E62117",
    label: "YouTube",
  },
  {
    id: "x",
    url: "https://x.com/sushumnakriya",
    color: "#1A1A1A",
    label: "X (Twitter)",
  },
];

function SocialIcon({ id, color }: { id: string; color: string }) {
  if (id === "facebook") {
    return <Facebook size={20} color={color} strokeWidth={2.2} />;
  }
  if (id === "instagram") {
    return <Instagram size={19} color={color} strokeWidth={2.2} />;
  }
  if (id === "youtube") {
    return <Youtube size={21} color={color} strokeWidth={2.2} />;
  }
  if (id === "x") {
    return (
      <Svg width={15} height={15} viewBox="0 0 24 24" fill={color}>
        <Path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
      </Svg>
    );
  }
  return (
    <Svg width={19} height={19} viewBox="0 0 24 24" fill={color}>
      <Path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </Svg>
  );
}

export default function HomeScreen() {
  const fadeAnim = useState(new Animated.Value(0))[0];

  const { preferredLanguage, setPreferredLanguage } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { data: quotesData, isLoading: quotesLoading } = useQuotes(100);

  const [isSharing, setIsSharing] = useState(false);
  const shareSvgRef = useRef<SvgHandle | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const quotesWithLanguage = useMemo(() => {
    if (!quotesData) return [];
    return quotesData.map((post) => ({
      post,
      language: detectLanguage(
        `${post.title} ${post.excerpt}`.slice(0, 200),
        post.categories
      ),
    }));
  }, [quotesData]);

  const languagePool = useMemo(() => {
    if (preferredLanguage !== "all") {
      const filtered = quotesWithLanguage.filter(
        (q) => q.language === preferredLanguage
      );
      if (filtered.length > 0) return filtered;
    }
    return quotesWithLanguage;
  }, [quotesWithLanguage, preferredLanguage]);

  /** Quote of the day: deterministic per date, so it changes every midnight. */
  const currentQuote: Post | undefined = useMemo(() => {
    if (languagePool.length === 0) return undefined;
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
    );
    return languagePool[dayOfYear % languagePool.length].post;
  }, [languagePool]);

  const isFav = currentQuote ? isFavorite(currentQuote.id) : false;

  const quoteLines = useMemo(
    () => (currentQuote ? wrapQuoteLines(currentQuote.title) : []),
    [currentQuote]
  );

  /** Vertical anchor of the quote block on the share card (bottom-weighted). */
  const quoteStartY = useMemo(
    () => Math.max(480, 1080 - (quoteLines.length - 1) * SHARE_LINE_H),
    [quoteLines]
  );

  const onToggleFavorite = () => {
    if (!currentQuote) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    toggleFavorite({ id: currentQuote.id, title: currentQuote.title });
  };

  /** Render the quote over the artwork to a PNG and open the share sheet. */
  const shareQuoteImage = async () => {
    if (!currentQuote || isSharing) return;
    setIsSharing(true);
    const shareText = `"${currentQuote.title}" — Sushumna Kriya Yoga`;
    try {
      const svg = shareSvgRef.current;
      if (!svg) throw new Error("Share card not ready");
      const data = await new Promise<string>((resolve, reject) => {
        svg.toDataURL((base64: string) => resolve(base64), {
          width: SHARE_W,
          height: SHARE_H,
        });
      });
      const base64 = data.replace(/^data:image\/png;base64,/, "");
      const file = new File(Paths.cache, `daily-quote-${Date.now()}.png`);
      file.write(base64, { encoding: "base64" });
      await Share.share({ url: file.uri, message: shareText });
    } catch {
      // Fall back to a plain text share if image rendering fails.
      Share.share({ message: shareText }).catch(() => {});
    } finally {
      setIsSharing(false);
    }
  };

  const openWhatsApp = () => {
    Linking.openURL(WHATSAPP_URL).catch(() => {});
  };

  const openSocial = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/home-peach-gurus-bg.png")}
        style={styles.art}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />

      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.langRow}>
          {QUOTE_LANGUAGES.map((lang) => {
            const isSelected = preferredLanguage === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langChip, isSelected && styles.langChipActive]}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Show quotes in ${lang.label}`}
                accessibilityState={{ selected: isSelected }}
                onPress={() => setPreferredLanguage(lang.code)}
              >
                <Text
                  style={[
                    styles.langChipText,
                    isSelected && styles.langChipTextActive,
                  ]}
                >
                  {lang.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

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
                {currentQuote ? (
                  <View style={styles.quoteActions}>
                    <TouchableOpacity
                      style={styles.quoteAction}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel={
                        isFav ? "Remove from favorites" : "Save to favorites"
                      }
                      onPress={onToggleFavorite}
                    >
                      <Heart
                        size={18}
                        color={isFav ? "#E05555" : "#7A5B3E"}
                        fill={isFav ? "#E05555" : "none"}
                      />
                      <Text style={styles.quoteActionText}>
                        {isFav ? "Saved" : "Save"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quoteAction}
                      activeOpacity={0.8}
                      disabled={isSharing}
                      accessibilityRole="button"
                      accessibilityLabel="Share the daily quote"
                      onPress={shareQuoteImage}
                    >
                      {isSharing ? (
                        <ActivityIndicator size="small" color="#7A5B3E" />
                      ) : (
                        <Share2 size={18} color="#7A5B3E" />
                      )}
                      <Text style={styles.quoteActionText}>
                        {isSharing ? "Preparing…" : "Share"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
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

        <Animated.View style={[styles.socialRow, { opacity: fadeAnim }]}>
          {SOCIALS.map((social) => (
            <TouchableOpacity
              key={social.id}
              style={styles.socialCircle}
              activeOpacity={0.8}
              accessibilityRole="link"
              accessibilityLabel={social.label}
              onPress={() => openSocial(social.url)}
            >
              <SocialIcon id={social.id} color={social.color} />
            </TouchableOpacity>
          ))}
        </Animated.View>
      </View>

      {/* Off-screen share card: the quote rendered over the artwork as SVG,
          exported to PNG when the user taps Share. */}
      {currentQuote ? (
        <Svg
          ref={shareSvgRef}
          width={SHARE_W}
          height={SHARE_H}
          viewBox={`0 0 ${SHARE_W} ${SHARE_H}`}
          style={styles.shareCard}
          pointerEvents="none"
        >
          <Defs>
            <SvgLinearGradient id="shareScrim" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0.3" stopColor="#5A2D0A" stopOpacity="0" />
              <Stop offset="1" stopColor="#5A2D0A" stopOpacity="0.62" />
            </SvgLinearGradient>
          </Defs>
          <SvgImage
            href={ARTWORK_URI}
            width={SHARE_W}
            height={SHARE_H}
            preserveAspectRatio="xMidYMid slice"
          />
          <Rect
            x={0}
            y={0}
            width={SHARE_W}
            height={SHARE_H}
            fill="url(#shareScrim)"
          />
          {quoteLines.map((line, index) => (
            <SvgText
              key={`${line}-${index}`}
              x={SHARE_W / 2}
              y={quoteStartY + index * SHARE_LINE_H}
              fill="#FFFFFF"
              fontSize={SHARE_FONT}
              fontWeight="600"
              textAnchor="middle"
            >
              {line}
            </SvgText>
          ))}
          <SvgText
            x={SHARE_W / 2}
            y={quoteStartY + quoteLines.length * SHARE_LINE_H + 20}
            fill="#FFE9CE"
            fontSize={32}
            fontWeight="500"
            textAnchor="middle"
          >
            — Sushumna Kriya Yoga Foundation
          </SvgText>
          <SvgText
            x={SHARE_W / 2}
            y={SHARE_H - 56}
            fill="rgba(255, 255, 255, 0.92)"
            fontSize={28}
            letterSpacing={8}
            fontWeight="700"
            textAnchor="middle"
          >
            SUSHUMNA KRIYA YOGA
          </SvgText>
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PEACH,
  },
  art: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  langRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  langChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#FDF3E2",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  langChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  langChipText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#7A5B3E",
  },
  langChipTextActive: {
    color: "#fff",
  },
  quoteSection: {
    marginBottom: 18,
  },
  quoteCard: {
    backgroundColor: "#FFFEFA",
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 22,
    paddingTop: 30,
    shadowColor: "#7A3B12",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  quoteIcon: {
    position: "absolute",
    top: 6,
    left: 16,
  },
  quoteIconText: {
    fontSize: 52,
    color: Colors.light.primaryLight,
    fontWeight: "700" as const,
    opacity: 0.4,
    lineHeight: 60,
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 25,
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 12,
  },
  quoteAuthor: {
    fontSize: 14,
    color: Colors.light.primary,
    textAlign: "center",
    fontWeight: "600" as const,
  },
  quoteActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 28,
    marginTop: 16,
  },
  quoteAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  quoteActionText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#7A5B3E",
  },
  shareCard: {
    position: "absolute",
    top: -20000,
    left: 0,
    width: SHARE_W,
    height: SHARE_H,
  },
  guideWrap: {
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
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    gap: 16,
  },
  socialCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FDF3E2",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7A3B12",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
});

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Clock, Heart, Youtube, ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useFavorites } from "@/context/favorites";
import { usePosts, useQuotes } from "@/hooks/useWordPress";
import { apiErrorMessage, CATEGORY_IDS } from "@/services/wordpress";
import { LoadingState, ErrorState, EmptyState } from "@/components/LoadingStates";
import { extractContentImages } from "@/utils/html";
import {
  detectLanguage,
  getLanguageName,
  getAvailableLanguages,
  type LanguageFilter,
  type DetectedLanguage,
} from "@/utils/language";
import type { Post } from "@/services/wordpress";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800";

const SADHAK_YOUTUBE_URL = "https://www.youtube.com/@SushumnaTheInnerMiracles";

const QUOTE_GRID_GAP = 12;
const QUOTE_COLUMNS = 2;
const SCREEN_WIDTH = Dimensions.get("window").width;
const QUOTE_CARD_WIDTH =
  (SCREEN_WIDTH - 40 - QUOTE_GRID_GAP * (QUOTE_COLUMNS - 1)) / QUOTE_COLUMNS;

interface PostWithLanguage extends Post {
  language: Exclude<LanguageFilter, "all">;
}

export default function WisdomCategoryScreen() {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { id, name, slug, lang } = useLocalSearchParams<{
    id?: string;
    name?: string;
    slug?: string;
    lang?: string;
  }>();

  const categoryName = name ?? "Category";
  const categorySlug = slug ?? "";
  const categoryId =
    id && !Number.isNaN(parseInt(id, 10)) ? parseInt(id, 10) : null;
  const isArticles = categorySlug === "articles" || id === "articles";
  const isQuotes = categorySlug === "quotes";
  const isSadhakSpeaks = categorySlug === "sadhak-speaks";
  const isTravelDiary =
    categorySlug === "himalayanam" || categorySlug === "tiruchendur";

  const validLangs: DetectedLanguage[] = ["en", "hi", "te", "ta", "kn", "ml", "bn"];
  const initialLang: LanguageFilter =
    lang && validLangs.includes(lang as DetectedLanguage)
      ? (lang as DetectedLanguage)
      : "all";

  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageFilter>(initialLang);

  const postsQuery = usePosts(
    categoryId && !isQuotes
      ? { per_page: 100, categories: categoryId }
      : undefined
  );
  const quotesQuery = useQuotes(50);

  const { data: posts, isLoading, isError, error, refetch } = useMemo(() => {
    if (isQuotes) return quotesQuery;
    return postsQuery;
  }, [isQuotes, postsQuery, quotesQuery]);

  const postsWithLanguage: PostWithLanguage[] = useMemo(() => {
    if (!posts) return [];
    return posts.map((post) => {
      // Title + excerpt is enough for script detection; category names are
      // checked first by detectLanguage. Content is no longer fetched for
      // list views to keep payloads small.
      const sample = `${post.title} ${post.excerpt}`.slice(0, 200);
      const language = detectLanguage(sample, post.categories);
      return { ...post, language };
    });
  }, [posts]);

  const filteredPosts: PostWithLanguage[] = useMemo(() => {
    const withoutEvents = postsWithLanguage.filter(
      (p) =>
        !p.categoryIds.includes(CATEGORY_IDS.event) &&
        !p.categoryIds.includes(CATEGORY_IDS.upcomingEvents)
    );
    if (isArticles || isQuotes || categoryId) return withoutEvents;
    return [];
  }, [postsWithLanguage, isArticles, isQuotes, categoryId]);

  const languageWhitelist = useMemo<DetectedLanguage[]>(
    () =>
      isArticles
        ? ["en", "hi", "te"]
        : isQuotes
          ? ["en", "te", "hi", "ta"]
          : isTravelDiary
            ? ["en", "hi", "te"]
            : ["en", "hi", "te", "ta", "kn", "ml", "bn"],
    [isArticles, isQuotes, isTravelDiary]
  );

  const availableLanguages = useMemo(
    () =>
      getAvailableLanguages(
        filteredPosts.map((p) => p.language),
        languageWhitelist
      ),
    [filteredPosts, languageWhitelist]
  );

  const displayedPosts: PostWithLanguage[] = useMemo(() => {
    if (selectedLanguage === "all") return filteredPosts;
    return filteredPosts.filter((p) => p.language === selectedLanguage);
  }, [filteredPosts, selectedLanguage]);

  const showLanguageFilter =
    (isArticles || isQuotes || isTravelDiary) && availableLanguages.length > 2;

  /** For image-only posts (quote greeting cards), extract the image from content */
  const getQuoteImage = (post: PostWithLanguage): string => {
    if (post.imageUrl) return post.imageUrl;
    const contentImgs = extractContentImages(post.content);
    if (contentImgs.length > 0) return contentImgs[0];
    if (post.imageMediumUrl) return post.imageMediumUrl;
    return FALLBACK_IMAGE;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: categoryName }} />
        <LoadingState message={`Loading ${categoryName.toLowerCase()}…`} />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Stack.Screen options={{ title: categoryName }} />
        <ErrorState
          message={apiErrorMessage(
            error,
            `Unable to load ${categoryName.toLowerCase()}. Please check your connection.`
          )}
          onRetry={() => refetch()}
        />
      </>
    );
  }

  if (!displayedPosts || displayedPosts.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: categoryName }} />
        <EmptyState
          message={`No ${categoryName.toLowerCase()} available at this time.`}
        />
      </>
    );
  }

  const featured = displayedPosts[0];

  return (
    <>
      <Stack.Screen options={{ title: categoryName }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{categoryName}</Text>
          <Text style={styles.headerSubtitle}>
            {displayedPosts.length}{" "}
            {displayedPosts.length === 1 ? "item" : "items"}
          </Text>
        </View>

        {isSadhakSpeaks ? (
          <TouchableOpacity
            style={styles.youtubeBanner}
            activeOpacity={0.85}
            accessibilityRole="link"
            accessibilityLabel="Open Sadhak Speaks YouTube channel"
            onPress={() => Linking.openURL(SADHAK_YOUTUBE_URL).catch(() => {})}
          >
            <View style={styles.youtubeIconWrap}>
              <Youtube size={22} color="#fff" />
            </View>
            <View style={styles.youtubeTextWrap}>
              <Text style={styles.youtubeTitle}>Watch on YouTube</Text>
              <Text style={styles.youtubeSubtitle} numberOfLines={1}>
                @SushumnaTheInnerMiracles
              </Text>
            </View>
            <ChevronRight size={18} color="#7A5B3E" />
          </TouchableOpacity>
        ) : null}

        {showLanguageFilter && (
          <View style={styles.filterSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChips}
            >
              {availableLanguages.map((code) => {
                const isSelected = selectedLanguage === code;
                return (
                  <TouchableOpacity
                    key={code}
                    style={[
                      styles.filterChip,
                      isSelected && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedLanguage(code)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        isSelected && styles.filterChipTextActive,
                      ]}
                    >
                      {getLanguageName(code)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {isQuotes ? (
          /* Quotes: render as a grid of image-based greeting cards */
          <View style={styles.quoteGrid}>
            {displayedPosts.map((quote) => {
              const isQuoteFavorite = isFavorite(quote.id);
              return (
                <View key={quote.id} style={styles.quoteCard}>
                  <TouchableOpacity
                    style={styles.quoteCardTouchable}
                    onPress={() => router.push(`/article/${quote.id}`)}
                    activeOpacity={0.95}
                  >
                    <Image
                      source={{ uri: getQuoteImage(quote) }}
                      style={styles.quoteImage}
                      resizeMode="cover"
                    />
                    <Text style={styles.quoteTitle} numberOfLines={1}>
                      {quote.title}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quoteHeart}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={
                      isQuoteFavorite
                        ? "Remove from favorites"
                        : "Save to favorites"
                    }
                    onPress={() => {
                      Haptics.impactAsync(
                        Haptics.ImpactFeedbackStyle.Light
                      ).catch(() => {});
                      toggleFavorite({ id: quote.id, title: quote.title });
                    }}
                  >
                    <Heart
                      size={16}
                      color={isQuoteFavorite ? "#E05555" : "#7A5B3E"}
                      fill={isQuoteFavorite ? "#E05555" : "none"}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : (
          <>
            <View style={styles.featuredSection}>
              <TouchableOpacity
                style={styles.featuredCard}
                onPress={() => router.push(`/article/${featured.id}`)}
                activeOpacity={0.95}
              >
                <Image
                  source={{ uri: featured.imageUrl ?? FALLBACK_IMAGE }}
                  style={styles.featuredImage}
                />
                <View style={styles.featuredOverlay}>
                  <Text style={styles.featuredTitle}>{featured.title}</Text>
                  {featured.excerpt ? (
                    <Text style={styles.featuredExcerpt} numberOfLines={2}>
                      {featured.excerpt}
                    </Text>
                  ) : null}
                  <View style={styles.featuredMeta}>
                    <Clock size={14} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.featuredMetaText}>
                      {formatDate(featured.date)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.articlesSection}>
              <Text style={styles.sectionTitle}>Latest</Text>
              <View style={styles.articlesList}>
                {displayedPosts.slice(1).map((article) => (
                  <TouchableOpacity
                    key={article.id}
                    style={styles.articleCard}
                    onPress={() => router.push(`/article/${article.id}`)}
                    activeOpacity={0.95}
                  >
                    <Image
                      source={{
                        uri:
                          article.imageMediumUrl ?? article.imageUrl ?? FALLBACK_IMAGE,
                      }}
                      style={styles.articleImage}
                    />
                    <View style={styles.articleContent}>
                      <Text style={styles.articleTitle} numberOfLines={2}>
                        {article.title}
                      </Text>
                      {article.excerpt ? (
                        <Text style={styles.articleExcerpt} numberOfLines={2}>
                          {article.excerpt}
                        </Text>
                      ) : null}
                      <View style={styles.articleMeta}>
                        <Clock size={12} color={Colors.light.textLight} />
                        <Text style={styles.articleMetaText}>
                          {formatDate(article.date)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

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
  header: {
    padding: 20,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "400" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  youtubeBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#FDF3E2",
    borderWidth: 1,
    borderColor: "rgba(230, 33, 23, 0.15)",
    shadowColor: "#7A3B12",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  youtubeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E62117",
  },
  youtubeTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  youtubeTitle: {
    fontSize: 15,
    fontWeight: "400" as const,
    color: Colors.light.text,
  },
  youtubeSubtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterChips: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.light.border ?? "rgba(0,0,0,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "400" as const,
    color: Colors.light.text,
  },
  filterChipTextActive: {
    color: "#fff",
  },
  featuredSection: {
    marginBottom: 28,
  },
  featuredCard: {
    marginHorizontal: 20,
    height: 260,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: Colors.light.cardBackground,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  featuredOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: "400" as const,
    color: "#fff",
    marginBottom: 8,
  },
  featuredExcerpt: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 20,
    marginBottom: 12,
  },
  featuredMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  featuredMetaText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  articlesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "400" as const,
    color: Colors.light.text,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  articlesList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  articleCard: {
    flexDirection: "row",
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  articleImage: {
    width: 110,
    height: 130,
  },
  articleContent: {
    flex: 1,
    padding: 14,
    justifyContent: "center",
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: "400" as const,
    color: Colors.light.text,
    marginBottom: 6,
    lineHeight: 22,
  },
  articleExcerpt: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  articleMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  articleMetaText: {
    fontSize: 12,
    color: Colors.light.textLight,
  },
  quoteGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: QUOTE_GRID_GAP,
  },
  quoteCard: {
    width: QUOTE_CARD_WIDTH,
  },
  quoteCardTouchable: {
    width: "100%",
  },
  quoteHeart: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 254, 250, 0.92)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  quoteImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: Colors.light.cardBackground,
  },
  quoteTitle: {
    fontSize: 13,
    fontWeight: "400" as const,
    color: Colors.light.text,
    marginTop: 8,
    marginBottom: 4,
  },
  bottomPadding: {
    height: 20,
  },
});

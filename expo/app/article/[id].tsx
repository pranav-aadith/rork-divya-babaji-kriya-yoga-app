import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Clock, Calendar } from "lucide-react-native";
import Colors from "@/constants/colors";
import { usePost } from "@/hooks/useWordPress";
import { LoadingState, ErrorState } from "@/components/LoadingStates";
import {
  htmlToParagraphs,
  estimateReadTime,
  extractContentImages,
} from "@/utils/html";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800";

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const numericId = id ? parseInt(id, 10) : null;
  const { data: article, isLoading, isError, refetch } = usePost(numericId);

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: "Article" }} />
        <LoadingState message="Loading article…" />
      </>
    );
  }

  if (isError || !article) {
    return (
      <>
        <Stack.Screen options={{ title: "Article" }} />
        <ErrorState
          message="Unable to load this article. Please try again."
          onRetry={() => refetch()}
        />
      </>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const paragraphs = htmlToParagraphs(article.content);
  const contentImages = extractContentImages(article.content);
  const isImageOnly = paragraphs.length === 0 && contentImages.length > 0;
  const category = article.categories[0] ?? "Article";

  return (
    <>
      <Stack.Screen options={{ title: category }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {!isImageOnly && (
          <Image
            source={{ uri: article.imageUrl ?? FALLBACK_IMAGE }}
            style={styles.heroImage}
          />
        )}

        <View style={styles.content}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>

          <Text style={styles.title}>{article.title}</Text>

          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Calendar size={14} color={Colors.light.textLight} />
              <Text style={styles.metaText}>{formatDate(article.date)}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Clock size={14} color={Colors.light.textLight} />
              <Text style={styles.metaText}>
                {estimateReadTime(article.content)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, index) => (
              <Text key={index} style={styles.bodyText}>
                {paragraph}
              </Text>
            ))
          ) : isImageOnly ? (
            <View style={styles.contentImagesContainer}>
              {contentImages.map((imgUrl, index) => (
                <Image
                  key={index}
                  source={{ uri: imgUrl }}
                  style={styles.contentImage}
                  resizeMode="contain"
                />
              ))}
            </View>
          ) : article.excerpt ? (
            <Text style={styles.bodyText}>{article.excerpt}</Text>
          ) : (
            <Text style={styles.bodyText}>
              Content for this article is being updated. Please visit our
              website for the full story.
            </Text>
          )}
        </View>

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
  heroImage: {
    width: "100%",
    height: 250,
  },
  content: {
    padding: 20,
  },
  categoryBadge: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    lineHeight: 36,
    marginBottom: 16,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: Colors.light.textLight,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.textLight,
    marginHorizontal: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.divider,
    marginVertical: 24,
  },
  bodyText: {
    fontSize: 17,
    color: Colors.light.text,
    lineHeight: 28,
    marginBottom: 16,
  },
  contentImagesContainer: {
    gap: 16,
  },
  contentImage: {
    width: "100%",
    height: 360,
    borderRadius: 12,
  },
  bottomPadding: {
    height: 20,
  },
});

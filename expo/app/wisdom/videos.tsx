import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, Play, ExternalLink } from "lucide-react-native";
import Colors from "@/constants/colors";
import { usePosts } from "@/hooks/useWordPress";
import { CATEGORY_IDS } from "@/services/wordpress";
import { LoadingState, ErrorState, EmptyState } from "@/components/LoadingStates";
import { extractYouTubeVideos } from "@/utils/html";
import type { Post } from "@/services/wordpress";

interface VideoItem {
  id: string;
  postId: number;
  postTitle: string;
  videoId: string;
  title: string;
  watchUrl: string;
  thumbnail: string;
}

const FALLBACK_THUMBNAIL =
  "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800";

function buildVideoList(posts: Post[] | undefined): VideoItem[] {
  if (!posts) return [];
  const items: VideoItem[] = [];
  const seen = new Set<string>();

  for (const post of posts) {
    const videos = extractYouTubeVideos(post.content);
    for (const video of videos) {
      if (seen.has(video.videoId)) continue;
      seen.add(video.videoId);
      items.push({
        id: `${post.id}-${video.videoId}`,
        postId: post.id,
        postTitle: post.title,
        videoId: video.videoId,
        title: video.title || post.title,
        watchUrl: video.watchUrl,
        thumbnail: `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`,
      });
    }
  }

  return items;
}

export default function VideosScreen() {
  const router = useRouter();
  const { data: posts, isLoading, isError, refetch } = usePosts({
    per_page: 50,
    categories: CATEGORY_IDS.videos,
    includeContent: true,
  });
  const videos = useMemo(() => buildVideoList(posts), [posts]);

  const openVideo = (url: string) => {
    Linking.openURL(url).catch(() => {
      // Fallback handled silently; user can retry.
    });
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: "Videos" }} />
        <LoadingState message="Loading videos…" />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Stack.Screen options={{ title: "Videos" }} />
        <ErrorState
          message="Unable to load videos. Please check your connection."
          onRetry={() => refetch()}
        />
      </>
    );
  }

  if (videos.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: "Videos" }} />
        <EmptyState message="No videos available at this time." />
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Videos",
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
          <Text style={styles.headerTitle}>Videos</Text>
          <Text style={styles.headerSubtitle}>
            Teachings, satsangs, and guided sessions from the Foundation
          </Text>
        </View>

        <View style={styles.list}>
          {videos.map((video, index) => (
            <TouchableOpacity
              key={video.id}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => openVideo(video.watchUrl)}
            >
              <View style={styles.thumbnailWrap}>
                <Image
                  source={{ uri: video.thumbnail }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
                <View style={styles.playOverlay}>
                  <Play size={28} color="#fff" fill="#fff" />
                </View>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {video.title}
                </Text>
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {video.postTitle}
                </Text>
                <View style={styles.cardMeta}>
                  <Text style={styles.cardMetaText}>Watch on YouTube</Text>
                  <ExternalLink size={14} color={Colors.light.primary} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
  list: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  thumbnailWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    position: "relative",
    backgroundColor: Colors.light.cardBackground,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardMetaText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  bottomPadding: {
    height: 20,
  },
});

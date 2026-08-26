import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import Colors from "@/constants/colors";
import { usePageBySlug } from "@/hooks/useWordPress";
import { LoadingState, ErrorState } from "@/components/LoadingStates";
import { apiErrorMessage } from "@/services/wordpress";
import { htmlToBlocks, htmlToExcerpt, type ContentBlock } from "@/utils/html";

/** Filter out noise blocks (social media, follow/register/connect sections) */
function filterNoiseBlocks(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.filter((b) => {
    const lower = b.text.toLowerCase();
    return (
      !/spotify/i.test(lower) &&
      !/follow\s+us/i.test(lower) &&
      !/register\s+here/i.test(lower) &&
      !/connect\s+with\s+us/i.test(lower) &&
      b.text.trim().length > 0
    );
  });
}

/** A group of blocks sharing a heading */
interface ContentSection {
  heading: ContentBlock | null;
  paragraphs: ContentBlock[];
}

/** Group flat blocks into sections */
function groupBlocksIntoSections(blocks: ContentBlock[]): ContentSection[] {
  const sections: ContentSection[] = [];
  let current: ContentSection = { heading: null, paragraphs: [] };
  for (const block of blocks) {
    if (block.type === "heading") {
      if (current.heading || current.paragraphs.length > 0) {
        sections.push(current);
      }
      current = { heading: block, paragraphs: [] };
    } else {
      current.paragraphs.push(block);
    }
  }
  if (current.heading || current.paragraphs.length > 0) {
    sections.push(current);
  }
  return sections;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800";

export default function PageDetailScreen() {
  const { slug, title } = useLocalSearchParams<{
    slug?: string;
    title?: string;
  }>();
  const pageSlug = slug ?? "";
  const pageTitle = title ?? "Page";

  const { data: page, isLoading, isError, error, refetch } = usePageBySlug(pageSlug);

  const sections = useMemo<ContentSection[]>(() => {
    if (!page) return [];
    const blocks = filterNoiseBlocks(htmlToBlocks(page.content));
    return groupBlocksIntoSections(blocks);
  }, [page]);

  const excerpt = page ? page.excerpt || htmlToExcerpt(page.content, 180) : "";

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: pageTitle }} />
        <LoadingState message="Loading page…" />
      </>
    );
  }

  if (isError || !page) {
    return (
      <>
        <Stack.Screen options={{ title: pageTitle }} />
        <ErrorState
          message={apiErrorMessage(
            error,
            "Unable to load this page. Please try again."
          )}
          onRetry={() => refetch()}
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: pageTitle }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={{ uri: page.imageUrl ?? FALLBACK_IMAGE }}
          style={styles.heroImage}
        />

        <View style={styles.content}>
          <Text style={styles.title}>{page.title}</Text>

          {excerpt ? <Text style={styles.excerpt}>{excerpt}</Text> : null}

          {sections.map((section, index) => {
            const headingText = section.heading?.text ?? null;
            return (
              <View key={index} style={styles.sectionBlock}>
                {headingText && (
                  <Text style={styles.sectionHeading}>{headingText}</Text>
                )}
                {section.paragraphs.map((para, pIdx) => (
                  <Text key={pIdx} style={styles.paragraph}>
                    {para.text}
                  </Text>
                ))}
              </View>
            );
          })}

          {sections.length === 0 && !excerpt && (
            <Text style={styles.paragraph}>
              Please visit our website for the full content of this page.
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
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    lineHeight: 36,
    marginBottom: 16,
  },
  excerpt: {
    fontSize: 16,
    fontWeight: "400" as const,
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 10,
  },
  sectionBlock: {
    marginBottom: 18,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "400" as const,
    color: Colors.light.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  paragraph: {
    fontSize: 16,
    fontWeight: "400" as const,
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 10,
  },
  bottomPadding: {
    height: 20,
  },
});

import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import Colors from "@/constants/colors";
import { usePageBySlug } from "@/hooks/useWordPress";
import { LoadingState, ErrorState } from "@/components/LoadingStates";
import { apiErrorMessage } from "@/services/wordpress";
import { htmlToBlocks, type ContentBlock } from "@/utils/html";

/** Format an ISO date string as a short locale date for "Last updated". */
function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

/** Filter out noise blocks (social media, follow/register sections) */
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

export default function LegalScreen() {
  const { slug, title } = useLocalSearchParams<{
    slug?: string;
    title?: string;
  }>();
  const pageSlug = slug ?? "";
  const pageTitle = title ?? "Legal";

  const { data: page, isLoading, isError, error, refetch } = usePageBySlug(pageSlug);

  const sections = useMemo<ContentSection[]>(() => {
    if (!page) return [];
    return groupBlocksIntoSections(filterNoiseBlocks(htmlToBlocks(page.content)));
  }, [page]);

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: pageTitle }} />
        <LoadingState message="Loading…" />
      </>
    );
  }

  if (isError || !page) {
    return (
      <>
        <Stack.Screen options={{ title: pageTitle }} />
        <ErrorState
          message={apiErrorMessage(error, "Unable to load this page. Please try again.")}
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
        <View style={styles.content}>
          <Text style={styles.updated}>{`Last updated: ${formatDate(page.modified)}`}</Text>
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

          {sections.length === 0 && (
            <Text style={styles.paragraph}>
              Please visit our website for the full content of this page.
            </Text>
          )}
        </View>
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
    paddingBottom: 32,
  },
  content: {
    padding: 20,
  },
  updated: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  sectionBlock: {
    marginBottom: 18,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 22,
    marginBottom: 8,
  },
});

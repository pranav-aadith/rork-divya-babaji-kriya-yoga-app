import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { fetchPageBySlug } from "@/services/wordpress";
import { htmlToBlocks, type ContentBlock } from "@/utils/html";
import { LoadingState, ErrorState } from "@/components/LoadingStates";

/** Legal documents that can be opened from the Settings screen. */
const DOCS: Record<string, { title: string }> = {
  "privacy-policy": { title: "Privacy Policy" },
  "terms-of-service": { title: "Terms of Service" },
};

function LegalBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <>
      {blocks.map((block, index) =>
        block.type === "heading" ? (
          <Text key={index} style={[styles.heading, block.level <= 2 && styles.headingLarge]}>
            {block.text}
          </Text>
        ) : (
          <Text key={index} style={styles.paragraph}>
            {block.text}
          </Text>
        )
      )}
    </>
  );
}

export default function LegalDocumentScreen() {
  const { doc } = useLocalSearchParams<{ doc?: string }>();
  const meta = (doc && DOCS[doc]) ?? null;

  const pageQuery = useQuery({
    queryKey: ["wp", "page", doc ?? ""],
    queryFn: () => fetchPageBySlug(doc ?? ""),
    enabled: !!meta,
    // Legal text rarely changes; keep it cached for a month.
    staleTime: 1000 * 60 * 60 * 24 * 30,
    gcTime: 1000 * 60 * 60 * 24 * 30,
  });

  const blocks = useMemo(() => {
    const content = pageQuery.data?.content;
    if (!content) return [];
    return htmlToBlocks(content);
  }, [pageQuery.data]);

  if (!meta) {
    return (
      <>
        <Stack.Screen options={{ title: "Settings" }} />
        <ErrorState message="Document not found." />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: meta.title }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{pageQuery.data?.title ?? meta.title}</Text>
        {pageQuery.isLoading ? (
          <LoadingState message="Loading…" />
        ) : pageQuery.isError || !pageQuery.data ? (
          <ErrorState
            message="Could not load this document. Please check your connection and try again."
            onRetry={() => pageQuery.refetch()}
          />
        ) : (
          <LegalBlocks blocks={blocks} />
        )}
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
    padding: 20,
    paddingBottom: 48,
  },
  title: {
    fontSize: 26,
    fontWeight: "400" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  heading: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 18,
    marginBottom: 6,
  },
  headingLarge: {
    fontSize: 19,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 23,
    color: Colors.light.text,
    marginBottom: 12,
  },
});

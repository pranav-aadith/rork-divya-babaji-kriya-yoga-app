import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  type ImageSourcePropType,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import Colors from "@/constants/colors";
import { usePageBySlug } from "@/hooks/useWordPress";
import { htmlToBlocks, htmlToExcerpt, type ContentBlock } from "@/utils/html";

const BOOKS = [
  {
    slug: "kashi-a-spiritual-quest-on-guru-pournami",
    title: "Kashi – A Spiritual Quest on Guru Pournami",
    image: require("@/assets/images/kashi-book-cover.png"),
  },
  {
    slug: "book-sushumna-kriya-ypga",
    title: "Sushumna Kriya Yoga",
    image: require("@/assets/images/sushumna-kriya-yoga-book-cover.png"),
  },
];

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

/** Render a single book with its WordPress page content */
function BookSection({
  slug,
  title,
  image,
  isFirst,
}: {
  slug: string;
  title: string;
  image: ImageSourcePropType;
  isFirst: boolean;
}) {
  const { data: page, isLoading, isError } = usePageBySlug(slug);

  const sections = useMemo<ContentSection[]>(() => {
    if (!page) return [];
    const blocks = filterNoiseBlocks(htmlToBlocks(page.content));
    return groupBlocksIntoSections(blocks);
  }, [page]);

  const excerpt = page
    ? page.excerpt || htmlToExcerpt(page.content, 180)
    : "";

  return (
    <View style={[styles.bookSection, !isFirst && styles.bookSectionGap]}>
      {/* Book cover tile */}
      <View style={styles.bookCard}>
        <Image source={image} style={styles.bookImage} resizeMode="contain" />
      </View>

      {/* Book title in regular information font */}
      <Text style={styles.bookTitle}>{title}</Text>

      {/* Book content from WordPress */}
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading content…</Text>
        </View>
      ) : isError ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>
            Unable to load content. Please try again.
          </Text>
        </View>
      ) : (
        <View style={styles.contentWrap}>
          {excerpt ? (
            <Text style={styles.bookExcerpt}>{excerpt}</Text>
          ) : null}

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
              Please visit our website for the full content of this book.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

export default function BooksScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Books",
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
          <Text style={styles.headerTitle}>Books</Text>
          <Text style={styles.headerSubtitle}>
            Publications from the Foundation
          </Text>
        </View>

        {BOOKS.map((book, index) => (
          <BookSection
            key={book.slug}
            slug={book.slug}
            title={book.title}
            image={book.image}
            isFirst={index === 0}
          />
        ))}

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
  },
  bookSection: {
    paddingHorizontal: 20,
  },
  bookSectionGap: {
    marginTop: 32,
  },
  bookCard: {
    borderRadius: 24,
    overflow: "hidden",
    aspectRatio: 3 / 4,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  bookImage: {
    width: "100%",
    height: "100%",
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "400" as const,
    color: Colors.light.text,
    lineHeight: 22,
    marginTop: 14,
    marginBottom: 6,
  },
  loadingWrap: {
    paddingVertical: 32,
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  errorWrap: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  contentWrap: {
    paddingTop: 14,
  },
  bookExcerpt: {
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
    height: 32,
  },
});

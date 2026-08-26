import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, ChevronDown, ChevronUp, Youtube } from "lucide-react-native";
import Colors from "@/constants/colors";
import { usePage } from "@/hooks/useWordPress";
import { LoadingState, ErrorState } from "@/components/LoadingStates";
import { apiErrorMessage } from "@/services/wordpress";
import { htmlToBlocks, htmlToExcerpt, type ContentBlock } from "@/utils/html";

const SPOTIFY_HEADING_COLOR = "#E48241";

const YOUTUBE_LINK_GARBHA_SANSKAR = "http://youtube.com/@DivyaBabajiSushumnaKriyaYoga/playlists";
const YOUTUBE_LINK_SUSHUMNA_SIKSHANA = "";
const REGISTER_LINK_ANUDINAM = "https://forms.gle/jcQPyYpqfWw2pBoMA";
const REGISTER_LINK_YOGA_MEDITATION = "https://forms.gle/PBNX4gMzDrUJUGVv7";
const REGISTER_LINK_SLOKA = "https://forms.gle/YBB8B7M9ZHjgyGfE6";
const REGISTER_LINK_PRATHAMIK = "https://docs.google.com/forms/d/e/1FAIpQLSfqcN7eHcJLelWrV8naepnqFLxkpalfGTSnQ0o52zY4piEMsA/viewform";
const REGISTER_LINK_BALA = "https://docs.google.com/forms/d/e/1FAIpQLSdlxFsE-dpFOZDYMm1nGAQxzt1JKKnfv-vBbNqj2UQDeWWiUw/viewform";
const REGISTER_LINK_SPARKS = "https://forms.gle/gvxPdgzqLKTfBTbz6";

/** Sushumna Sikshana batch tiles (ordered as displayed) */
interface SikshanaBatch {
  name: string;
  age: string;
  schedule: string;
  language: string;
  registerUrl: string;
}

const SIKSHANA_BATCHES: SikshanaBatch[] = [
  {
    name: "Anudinam Balanandam",
    age: "5 to 14 years",
    schedule: "Everyday 6:15 AM \u2013 6:30 AM IST (15 min)",
    language: "English",
    registerUrl: REGISTER_LINK_ANUDINAM,
  },
  {
    name: "Sushumna Sikshana Yoga & Meditation",
    age: "5 to 14 years",
    schedule: "Every Friday 6:15 PM \u2013 6:45 PM IST (30 min)",
    language: "English",
    registerUrl: REGISTER_LINK_YOGA_MEDITATION,
  },
  {
    name: "Sushumna Sikshana Sloka",
    age: "5 to 14 years",
    schedule: "Every Friday 7:00 PM \u2013 7:30 PM IST (30 min)",
    language: "English",
    registerUrl: REGISTER_LINK_SLOKA,
  },
  {
    name: "Sushumna Bala Sikshana",
    age: "8 to 14 years",
    schedule: "Every Sunday 11:00 AM \u2013 12:00 PM IST (1 hr)",
    language: "English",
    registerUrl: REGISTER_LINK_BALA,
  },
  {
    name: "Sushumna Prathamika Sikshana",
    age: "5 to 8 years",
    schedule: "Every Sunday 12:15 PM \u2013 1:00 PM IST (45 min)",
    language: "Telugu",
    registerUrl: REGISTER_LINK_PRATHAMIK,
  },
  {
    name: "Sushumna Sparks",
    age: "5 to 14 years",
    schedule: "Sunday to Friday",
    language: "English",
    registerUrl: REGISTER_LINK_SPARKS,
  },
];

const VANI_PODCASTS = [
  {
    language: "English",
    image: "https://divyababajikriyayoga.org/wp-content/uploads/2023/10/A9D8D5AF-26A8-46C5-8596-C69C543F71A9_1_201_a-450x450.jpeg",
    url: "https://open.spotify.com/show/0DakIJQPLi92Cw8DLik4iD?si=c4e06ba97c0b4324&nd=1&dlsi=3956e31ea9ce4892",
  },
  {
    language: "Hindi",
    image: "https://divyababajikriyayoga.org/wp-content/uploads/2023/10/4FBE58B5-5708-4302-B7B3-C4B50313155F_1_201_a-300x300.jpeg",
    url: "https://open.spotify.com/show/7KG3pPp9WcvSjdGiRrGYvq?si=d622907e85494930",
  },
  {
    language: "Telugu",
    image: "https://divyababajikriyayoga.org/wp-content/uploads/2023/10/Screenshot-2023-10-24-at-3.32.28-PM-450x486.png",
    url: "https://open.spotify.com/show/1cNCq7wetDiaye5KixpXKW?si=248edd735e05499b",
  },
];

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/** Batch names that appear as standalone lines in content (to be filtered) */
const BATCH_NAME_PATTERNS = [
  /anudinam\s+balanandam/i,
  /sushumna\s+sikshana\s+yoga\s+&\s+meditation/i,
  /sushumna\s+sikshana\s+sloka/i,
  /sushumna\s+bala\s+sikshana/i,
  /sushumna\s+prathamika\s+sikshana/i,
  /sushumna\s+sparks/i,
];

/** Headings/paragraphs with glued schedule fields ("Age : … Schedule : … Time : …") */
const SCHEDULE_FIELD_PATTERN = /\b(age|schedule|time|language)\s*:/i;

/** Pure time-range lines: "6:15 AM -6:30 AM IST", "8:30 PM -8:45PM PT", "7 PM -7:30 PM IST" */
const TIME_RANGE_PATTERN =
  /^\d{1,2}(:\d{2})?\s*[ap]\.?m\.?\s*[-–—]\s*\d{1,2}(:\d{2})?\s*[ap]\.?m\.?\s*(ist|pt|et|est|aest)?$/i;

/** Filter out noise blocks (Spotify, duplicate labels, schedule info lines, batch names, URLs) */
function filterNoiseBlocks(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.filter((b) => {
    const lower = b.text.toLowerCase();
    const trimmed = b.text.trim();
    // Individual schedule info lines: "Age:", "Schedule", "Time:", "Language:" (with optional space before colon)
    const isScheduleLine =
      /^age\s*[:\-]/i.test(trimmed) ||
      /^schedule\s*[:\-]/i.test(trimmed) ||
      /^time\s*[:\-]/i.test(trimmed) ||
      /^language\s*[:\-]/i.test(trimmed);
    // Registration link stubs and form URLs (standalone or embedded)
    const isRegisterUrl = /(forms\.gle|docs\.google\.com\/forms)/i.test(trimmed);
    const isRegisterLabel = /^registration\s+link$/i.test(trimmed);
    // Standalone batch name lines
    const isBatchName = BATCH_NAME_PATTERNS.some((p) => p.test(trimmed));
    // Standalone time-range lines and headings embedding schedule fields
    const isTimeRange = TIME_RANGE_PATTERN.test(trimmed);
    const hasScheduleField = SCHEDULE_FIELD_PATTERN.test(trimmed);
    // "Sushumna Sikshana India Programs" section heading and "India programs" stub
    const isIndiaPrograms =
      /sushumna\s+sikshana\s+india\s+programs/i.test(trimmed) ||
      /^india\s+programs?$/i.test(trimmed);
    // Combined Age+Schedule+Language block (multi-line)
    const isScheduleInfo =
      /anudinam\s+balanandam/i.test(b.text) ||
      /sushumna\s+sikshana\s+yoga\s+&\s+meditation/i.test(b.text) ||
      /sushumna\s+sikshana\s+sloka/i.test(b.text) ||
      (/age\s*:/i.test(b.text) &&
        /schedule\s*:/i.test(b.text) &&
        /language\s*:/i.test(b.text));
    return (
      !/spotify/i.test(lower) &&
      !/sushumna\s+vani\s*\(english\)/i.test(b.text) &&
      !/sushumna\s+vani\s*\(hindi\)/i.test(b.text) &&
      !/sushumna\s+vani\s*\(telugu\)/i.test(b.text) &&
      !/follow\s+us/i.test(lower) &&
      !/register\s+here/i.test(lower) &&
      !/connect\s+with\s+us/i.test(lower) &&
      !isScheduleInfo &&
      !isScheduleLine &&
      !isRegisterUrl &&
      !isRegisterLabel &&
      !isBatchName &&
      !isTimeRange &&
      !hasScheduleField &&
      !isIndiaPrograms
    );
  });
}

/** A group of blocks that share a heading */
interface ContentSection {
  heading: ContentBlock | null;
  paragraphs: ContentBlock[];
}

/** Group flat blocks into sections: each heading starts a new section */
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

/** An interactive collapsible section with a heading button and paragraph content */
function CollapsibleSection({
  section,
  index,
  isExpanded,
  onToggle,
}: {
  section: ContentSection;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const headingText = section.heading?.text ?? "Overview";
  const fontSize = section.heading
    ? section.heading.level <= 2
      ? 18
      : section.heading.level === 3
        ? 17
        : 16
    : 18;

  return (
    <View key={index} style={styles.accordionItem}>
      <TouchableOpacity
        style={styles.accordionHeader}
        activeOpacity={0.7}
        onPress={onToggle}
      >
        <Text
          style={[
            styles.accordionHeaderText,
            { fontSize, fontWeight: "700" as const, color: SPOTIFY_HEADING_COLOR },
          ]}
          numberOfLines={2}
        >
          {headingText}
        </Text>
        <View style={styles.chevronWrap}>
          {isExpanded ? (
            <ChevronUp size={20} color={SPOTIFY_HEADING_COLOR} />
          ) : (
            <ChevronDown size={20} color={SPOTIFY_HEADING_COLOR} />
          )}
        </View>
      </TouchableOpacity>
      {isExpanded && section.paragraphs.length > 0 && (
        <View style={styles.accordionBody}>
          {section.paragraphs.map((para, pIdx) => (
            <Text key={pIdx} style={styles.contentParagraph}>
              {para.text}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800";

export default function ProgramDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const numericId = id ? parseInt(id, 10) : null;
  const { data: program, isLoading, isError, error, refetch } = usePage(numericId);

  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  const toggleSection = useCallback((index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: "Program" }} />
        <LoadingState message="Loading program details…" />
      </>
    );
  }

  if (isError || !program) {
    return (
      <>
        <Stack.Screen options={{ title: "Program" }} />
        <ErrorState
          message={apiErrorMessage(
            error,
            "Unable to load this program. Please try again."
          )}
          onRetry={() => refetch()}
        />
      </>
    );
  }

  const isSushumnaVani = program.slug === "sushumna-vani";
  const isGarbhaSanskar = program.slug === "gharbha-sanskar";
  const isSushumnaSikshana = program.slug === "sushumna-sikshana-2-2";
  const blocks = filterNoiseBlocks(htmlToBlocks(program.content));
  const garbhaSanskarImage = require("@/assets/images/garbha-sanskar.png");
const sushumnaSikshanaImage = require("@/assets/images/sushumna-sikshana.png");
  const sections = groupBlocksIntoSections(blocks);
  const displaySections = isSushumnaSikshana
    ? sections.filter(
        (section) =>
          !/batches/i.test(section.heading?.text ?? "") &&
          !/sushumna\s+prathamik\s+sikshana/i.test(section.heading?.text ?? "") &&
          !/sushumna\s+bala\s+sikshana/i.test(section.heading?.text ?? "")
      )
    : sections;
  const excerpt = program.excerpt || htmlToExcerpt(program.content, 200);

  return (
    <>
      <Stack.Screen options={{ title: program.title }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Image
            source={
              isSushumnaVani
                ? require("@/assets/images/sushumna-vani-logo.png")
                : isGarbhaSanskar
                  ? garbhaSanskarImage
                  : isSushumnaSikshana
                    ? sushumnaSikshanaImage
                    : { uri: program.imageUrl ?? FALLBACK_IMAGE }
            }
            style={styles.heroImage}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.heroGradient}
          />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{program.title}</Text>
            <Text style={styles.heroSubtitle} numberOfLines={3}>
              {isSushumnaVani
                ? "A podcast series to spread more knowledge about Sushumna Kriya Meditation and its impact on life"
                : excerpt}
            </Text>
          </View>
        </View>

        {!isSushumnaVani ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Program</Text>
            {sections.length > 0 ? (
              isSushumnaSikshana ? (
                <View style={styles.staticContentContainer}>
                  {displaySections.map((section, index) => {
                    const headingText = section.heading?.text ?? "Overview";
                    const fontSize = section.heading
                      ? section.heading.level <= 2
                        ? 22
                        : section.heading.level === 3
                          ? 19
                          : 17
                      : 22;
                    return (
                      <View key={index} style={styles.staticSection}>
                        <Text
                          style={[
                            styles.staticHeading,
                            { fontSize, color: SPOTIFY_HEADING_COLOR },
                          ]}
                        >
                          {headingText}
                        </Text>
                        {section.paragraphs.map((para, pIdx) => (
                          <Text key={pIdx} style={styles.contentParagraph}>
                            {para.text}
                          </Text>
                        ))}
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.accordionContainer}>
                  {displaySections.map((section, index) => (
                    <CollapsibleSection
                      key={index}
                      section={section}
                      index={index}
                      isExpanded={expandedSections.has(index)}
                      onToggle={() => toggleSection(index)}
                    />
                  ))}
                </View>
              )
            ) : (
              <Text style={styles.paragraph}>
                This is a sacred program from the Sushumna Kriya Yoga tradition.
                Please visit our website for full details.
              </Text>
            )}
          </View>
        ) : null}

        {isGarbhaSanskar ? (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.youtubeButton}
              activeOpacity={0.85}
              onPress={() => Linking.openURL(YOUTUBE_LINK_GARBHA_SANSKAR)}
            >
              <View style={styles.youtubeIconWrap}>
                <Youtube size={26} color="#fff" />
              </View>
              <View style={styles.youtubeTextWrap}>
                <Text style={styles.youtubeButtonText}>Watch on YouTube</Text>
                <Text style={styles.youtubeSubtext} numberOfLines={1}>
                  Sushumna Garbha Sanskar — Playlist
                </Text>
              </View>
              <ArrowRight size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : null}

        {isSushumnaSikshana && YOUTUBE_LINK_SUSHUMNA_SIKSHANA ? (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.youtubeButton}
              activeOpacity={0.85}
              onPress={() => Linking.openURL(YOUTUBE_LINK_SUSHUMNA_SIKSHANA)}
            >
              <View style={styles.youtubeIconWrap}>
                <Youtube size={26} color="#fff" />
              </View>
              <View style={styles.youtubeTextWrap}>
                <Text style={styles.youtubeButtonText}>Watch on YouTube</Text>
                <Text style={styles.youtubeSubtext} numberOfLines={1}>
                  Sushumna Sikshana — Full Video
                </Text>
              </View>
              <ArrowRight size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : null}

        {isSushumnaSikshana ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sushumna Sikshana Batches</Text>
            {SIKSHANA_BATCHES.map((batch) => (
              <View key={batch.name} style={styles.batchTile}>
                <Text style={styles.batchTileHeading}>{batch.name}</Text>
                <Text style={styles.batchTileInfo}>Age: {batch.age}</Text>
                <Text style={styles.batchTileInfo}>Schedule: {batch.schedule}</Text>
                <Text style={styles.batchTileInfo}>Language: {batch.language}</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => Linking.openURL(batch.registerUrl)}
                >
                  <Text style={styles.batchRegisterLink}>Register Here</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}

        {isSushumnaVani ? (
          <View style={styles.vaniIntroSection}>
            <Text style={styles.vaniIntroText}>
              Welcome to Sushumna Vani, a podcast dedicated to sharing the profound wisdom of Sushumna Kriya Meditation, gifted to the world by Shri Shri Shri Aathmanandamayi Mataji.
            </Text>
            <Text style={styles.vaniIntroText}>
              Our beloved Guru Maa frequently reminds us: we should begin our day with meditation and close it with introspection. How we choose to live in the space between these two practices ultimately shapes the trajectory of our spiritual evolution. Through this series, we explore various aspects of mindful living to empower and support your journey with Sushumna Kriya Yoga.
            </Text>
          </View>
        ) : null}

        {isSushumnaVani ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, styles.vaniSectionTitle]}>
              Listen on Spotify
            </Text>
            <View style={styles.podcastGrid}>
              {VANI_PODCASTS.map((podcast, index) => (
                <TouchableOpacity
                  key={podcast.language}
                  style={[
                    styles.podcastCard,
                    index < VANI_PODCASTS.length - 1 && styles.podcastCardMargin,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => Linking.openURL(podcast.url)}
                >
                  <Image
                    source={{ uri: podcast.image }}
                    style={styles.podcastImage}
                    resizeMode="cover"
                  />
                  <View style={styles.podcastLabelWrap}>
                    <Text style={styles.podcastLabel} numberOfLines={1}>
                      Sushumna Vani ({podcast.language})
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

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
  heroSection: {
    height: 300,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  heroContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
    marginTop: 24,
  },
  vaniSectionCompact: {
    marginTop: 8,
  },
  garbhaInlineImageWrap: {
    marginTop: 20,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: Colors.light.cardBackground,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  garbhaInlineImage: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    lineHeight: 26,
    marginBottom: 14,
  },
  accordionContainer: {
    gap: 12,
  },
  accordionItem: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
  accordionHeaderText: {
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  chevronWrap: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  accordionBody: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 2,
  },
  staticContentContainer: {
    gap: 20,
  },
  staticSection: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  staticHeading: {
    fontWeight: "700" as const,
    marginBottom: 10,
    lineHeight: 26,
  },
  youtubeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E48241",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
    shadowColor: "#E48241",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  batchTile: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  batchTileHeading: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: SPOTIFY_HEADING_COLOR,
    marginBottom: 8,
  },
  batchTileInfo: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    lineHeight: 22,
    marginBottom: 2,
  },
  batchRegisterLink: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: SPOTIFY_HEADING_COLOR,
    marginTop: 10,
    textDecorationLine: "underline",
  },
  youtubeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  youtubeTextWrap: {
    flex: 1,
  },
  youtubeButtonText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 2,
  },
  youtubeSubtext: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
  },
  contentHeading: {
    marginTop: 18,
    marginBottom: 10,
    lineHeight: 28,
  },
  contentParagraph: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    lineHeight: 26,
    marginBottom: 14,
  },
  vaniIntroSection: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  vaniIntroText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    lineHeight: 24,
    marginBottom: 14,
  },
  bottomPadding: {
    height: 20,
  },
  vaniSectionTitle: {
    color: SPOTIFY_HEADING_COLOR,
    fontWeight: "800" as const,
  },
  podcastGrid: {
    gap: 16,
  },
  podcastCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  podcastCardMargin: {
    marginBottom: 0,
  },
  podcastImage: {
    width: "100%",
    aspectRatio: 1,
  },
  podcastLabelWrap: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  podcastLabel: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.light.text,
    textAlign: "center",
  },
});

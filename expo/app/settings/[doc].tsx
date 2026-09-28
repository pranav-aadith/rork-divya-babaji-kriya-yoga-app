import React from "react";
import { Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import Colors from "@/constants/colors";
import { LEGAL_DOCUMENTS, type LegalDocument } from "@/constants/legal";

/** Render the sections of a bundled legal document. */
function LegalBody({ doc }: { doc: LegalDocument }) {
  return (
    <>
      {doc.intro.map((paragraph, index) => (
        <Text key={`intro-${index}`} style={styles.paragraph}>
          {paragraph}
        </Text>
      ))}
      {doc.sections.map((section) => (
        <React.Fragment key={section.heading}>
          <Text style={styles.heading}>{section.heading}</Text>
          {section.paragraphs.map((paragraph, index) => (
            <Text key={`${section.heading}-${index}`} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </React.Fragment>
      ))}
    </>
  );
}

export default function LegalDocumentScreen() {
  const { doc } = useLocalSearchParams<{ doc?: string }>();
  const router = useRouter();
  const legalDoc = (doc && LEGAL_DOCUMENTS[doc]) ?? null;

  // Full-screen modals don't render a system back button, so provide our own.
  const renderBackButton = () => (
    <TouchableOpacity
      onPress={() => router.back()}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <ChevronLeft size={26} color={Colors.light.text} />
    </TouchableOpacity>
  );

  if (!legalDoc) {
    return (
      <>
        <Stack.Screen options={{ title: "Settings", headerLeft: renderBackButton }} />
        <Text style={styles.missingMessage}>Document not found.</Text>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{ title: legalDoc.title, headerLeft: renderBackButton }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{legalDoc.title}</Text>
        <Text style={styles.updated}>Last updated: {legalDoc.updatedAt}</Text>
        <LegalBody doc={legalDoc} />
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
    marginBottom: 4,
  },
  updated: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  heading: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 18,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 23,
    color: Colors.light.text,
    marginBottom: 12,
  },
  missingMessage: {
    marginTop: 40,
    textAlign: "center",
    color: Colors.light.textSecondary,
  },
});

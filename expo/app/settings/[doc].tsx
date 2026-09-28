import React from "react";
import { Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
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
  const legalDoc = (doc && LEGAL_DOCUMENTS[doc]) ?? null;

  if (!legalDoc) {
    return (
      <>
        <Stack.Screen options={{ title: "Settings" }} />
        <Text style={styles.missingMessage}>Document not found.</Text>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: legalDoc.title }} />
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

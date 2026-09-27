import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { ShieldCheck, FileText, ChevronRight } from "lucide-react-native";
import Colors from "@/constants/colors";

const PRIVACY_SLUG = "privacy-policy";
const TERMS_SLUG = "terms-of-service";
const APP_VERSION = "1";

export default function SettingsScreen() {
  const router = useRouter();

  const openLegal = (slug: string, title: string) => {
    router.push(`/settings/legal?slug=${slug}&title=${encodeURIComponent(title)}`);
  };

  return (
    <>
      <Stack.Screen options={{ title: "Settings" }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Legal</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Open Privacy Policy"
            onPress={() => openLegal(PRIVACY_SLUG, "Privacy Policy")}
          >
            <View style={styles.rowIcon}>
              <ShieldCheck size={18} color={Colors.light.primary} />
            </View>
            <Text style={styles.rowLabel}>Privacy Policy</Text>
            <ChevronRight size={16} color={Colors.light.textSecondary} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Open Terms of Service"
            onPress={() => openLegal(TERMS_SLUG, "Terms of Service")}
          >
            <View style={styles.rowIcon}>
              <FileText size={18} color={Colors.light.primary} />
            </View>
            <Text style={styles.rowLabel}>Terms of Service</Text>
            <ChevronRight size={16} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Text style={styles.versionBadgeText}>v</Text>
            </View>
            <Text style={styles.rowLabel}>App version</Text>
            <Text style={styles.versionValue}>{APP_VERSION}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Divya Babaji Sushumna Kriya Yoga Foundation
        </Text>
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
  sectionLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 8,
    marginTop: 4,
  },
  card: {
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDF3E2",
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "400" as const,
    color: Colors.light.text,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginLeft: 58,
  },
  versionBadgeText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  versionValue: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  footer: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
});

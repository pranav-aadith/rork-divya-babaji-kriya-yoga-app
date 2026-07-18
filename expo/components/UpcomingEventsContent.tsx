import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ExternalLink,
  Phone,
  Play,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import Colors from "@/constants/colors";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80";

const MEDITATION_REGIONS = [
  {
    name: "India",
    schedule: [
      "Brahmamuhurtha: Daily, 4:00 – 5:00 AM (IST)",
      "Sayam Sandhya: Mon – Fri, 6:00 – 7:00 PM (IST)",
      "Masa Shivaratri: 12:00 – 1:00 AM (IST)",
      "Pournami: 6:00 – 7:00 PM (IST)",
    ],
    buttonLabel: "India Meditation LIVE",
    url: "https://live.divyababaji.org",
  },
  {
    name: "United Arab Emirates",
    schedule: [
      "Brahmamuhurtha: Daily, 4:00 – 5:00 AM (UAE)",
      "Sayam Sandhya: Mon – Fri, 8:00 – 9:00 PM (UAE)",
    ],
    buttonLabel: "UAE Meditation LIVE",
    url: "https://meditate.divyababaji.org",
  },
  {
    name: "Australia",
    schedule: [
      "Brahmamuhurtha: Daily, 4:00 – 5:00 AM (AEST)",
      "Sayam Sandhya: Mon – Fri, 9:00 – 10:00 PM (AEST)",
    ],
    buttonLabel: "Australia Meditation LIVE",
    url: "https://meditate.divyababaji.org",
  },
  {
    name: "United States",
    schedule: [
      "Brahmamuhurtha: Daily, 4:00 – 5:00 AM (ET)",
      "Brahmamuhurtha: Mon – Fri, 4:00 – 5:00 AM (PT)",
    ],
    buttons: [
      { label: "USA Meditation LIVE (ET)", url: "https://meditate.divyababaji.org" },
      { label: "USA Meditation LIVE (PT)", url: "https://meditate.divyababaji.org" },
    ],
  },
];

const INITIATIONS = [
  {
    language: "Telugu",
    time: "Saturday, 4:00 PM (IST)",
    buttonLabel: "Join Telugu Initiation",
    url: "https://dbsky.me/TeluguInitiation",
  },
  {
    language: "Hindi",
    time: "Saturday, 6:00 PM (IST)",
    buttonLabel: "Join Hindi Initiation",
    url: "https://dbsky.me/hindiinitiation",
  },
  {
    language: "English",
    time: "Sunday, 4:00 PM (IST)",
    buttonLabel: "Join English Initiation",
    url: "https://dbsky.me/EnglishInitiation",
  },
];

const SUPPORT_NUMBERS = [
  { language: "English", numbers: ["73375 55449", "70321 80006"] },
  {
    language: "Telugu",
    numbers: ["73375 55448", "96296 89167", "70321 80004", "94419 23160"],
  },
  { language: "Hindi", numbers: ["73375 55449", "72599 42009"] },
  { language: "Tamil", numbers: ["88070 99449", "87548 97586", "94440 41123"] },
  { language: "Kannada", numbers: ["73375 55446", "73789 79789"] },
  { language: "Malayalam", numbers: ["94470 00001", "94465 80034"] },
  { language: "Oriya", numbers: ["72599 42009", "98339 67916"] },
];

/** A single accordion card with a heading button and expandable content */
function AccordionCard({
  title,
  children,
  isExpanded,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.accordionCard}>
      <TouchableOpacity
        style={styles.accordionButton}
        activeOpacity={0.8}
        onPress={onToggle}
      >
        <Text style={styles.accordionTitle}>{title}</Text>
        {isExpanded ? (
          <ChevronUp size={20} color={Colors.light.primary} />
        ) : (
          <ChevronDown size={20} color={Colors.light.primary} />
        )}
      </TouchableOpacity>
      {isExpanded ? <View style={styles.accordionBody}>{children}</View> : null}
    </View>
  );
}

/** Primary saffron button that opens an external URL */
function PrimaryButton({
  label,
  url,
  icon: Icon = ExternalLink,
}: {
  label: string;
  url: string;
  icon?: React.ComponentType<{ size: number; color: string }>;
}) {
  return (
    <TouchableOpacity
      style={styles.primaryButton}
      activeOpacity={0.85}
      onPress={() => Linking.openURL(url)}
    >
      <Icon size={18} color="#fff" />
      <Text style={styles.primaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

/** Secondary outline button that opens an external URL */
function SecondaryButton({
  label,
  url,
  icon: Icon = ExternalLink,
}: {
  label: string;
  url: string;
  icon?: React.ComponentType<{ size: number; color: string }>;
}) {
  return (
    <TouchableOpacity
      style={styles.secondaryButton}
      activeOpacity={0.85}
      onPress={() => Linking.openURL(url)}
    >
      <Icon size={18} color={Colors.light.primary} />
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

/** Tap-to-call phone number chip */
function PhoneChip({ number }: { number: string }) {
  const clean = number.replace(/\s/g, "");
  return (
    <TouchableOpacity
      style={styles.phoneChip}
      activeOpacity={0.8}
      onPress={() => Linking.openURL(`tel:+91${clean}`)}
    >
      <Phone size={14} color={Colors.light.primary} />
      <Text style={styles.phoneChipText}>{number}</Text>
    </TouchableOpacity>
  );
}

export default function UpcomingEventsContent() {
  const [expandedRegion, setExpandedRegion] = React.useState<string | null>(
    "India"
  );

  const toggleRegion = (name: string) => {
    setExpandedRegion((current) => (current === name ? null : name));
  };

  return (
    <View style={styles.container}>
      {/* Screen 1: The Invitation */}
      <View style={styles.section}>
        <View style={styles.heroCard}>
          <Image source={{ uri: HERO_IMAGE }} style={styles.heroImage} />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.75)"]}
            style={styles.heroGradient}
          />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Welcome to the BLISSFUL journey</Text>
            <Text style={styles.heroSubtitle}>
              Take this Golden opportunity and go inside towards Self-Realization
            </Text>
          </View>
        </View>

        <View style={styles.inviteCard}>
          <Text style={styles.inviteText}>
            Learn and practice Sushumna Kriya Yoga Meditation — a simple, yet
            powerful meditative technique simplified to suit the lifestyle of the
            present generation.
          </Text>
          <Text style={styles.inviteText}>
            This Sushumna Kriya Yoga Meditation can be practiced at home and needs
            no severe penance or austerities.
          </Text>
        </View>
      </View>

      {/* Screen 2: Global Live Meditations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Global Live Meditations</Text>
        <Text style={styles.sectionSubtitle}>
          Join daily guided sessions from your region
        </Text>

        {MEDITATION_REGIONS.map((region) => (
          <AccordionCard
            key={region.name}
            title={region.name}
            isExpanded={expandedRegion === region.name}
            onToggle={() => toggleRegion(region.name)}
          >
            <View style={styles.scheduleList}>
              {region.schedule.map((item, index) => (
                <View key={index} style={styles.scheduleRow}>
                  <View style={styles.scheduleDot} />
                  <Text style={styles.scheduleText}>{item}</Text>
                </View>
              ))}
            </View>

            {"buttons" in region && region.buttons ? (
              <View style={styles.buttonGroup}>
                {region.buttons.map((button) => (
                  <PrimaryButton
                    key={button.label}
                    label={button.label}
                    url={button.url}
                    icon={Play}
                  />
                ))}
              </View>
            ) : (
              <PrimaryButton
                label={region.buttonLabel}
                url={region.url}
                icon={Play}
              />
            )}
          </AccordionCard>
        ))}
      </View>

      {/* Screen 3: Weekend Initiations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Get Started</Text>
        <Text style={styles.sectionSubtitle}>
          Weekend initiations for new practitioners
        </Text>

        <View style={styles.initiationGrid}>
          {INITIATIONS.map((initiation) => (
            <View key={initiation.language} style={styles.initiationCard}>
              <Text style={styles.initiationLanguage}>
                {initiation.language}
              </Text>
              <Text style={styles.initiationTime}>{initiation.time}</Text>
              <SecondaryButton
                label={initiation.buttonLabel}
                url={initiation.url}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Screen 4: Resources & Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resources & Support</Text>

        <PrimaryButton
          label="Main Procedure Guide"
          url="https://divyababajikriyayoga.org"
          icon={BookOpen}
        />

        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>Tap-to-Call Support</Text>
          <Text style={styles.supportSubtitle}>
            Choose your preferred language
          </Text>

          {SUPPORT_NUMBERS.map((group) => (
            <View key={group.language} style={styles.supportGroup}>
              <Text style={styles.supportLanguage}>{group.language}</Text>
              <View style={styles.phoneRow}>
                {group.numbers.map((number) => (
                  <PhoneChip key={number} number={number} />
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  heroCard: {
    height: 260,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: Colors.light.cardBackground,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "65%",
  },
  heroContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 8,
    lineHeight: 32,
  },
  heroSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 22,
  },
  inviteCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  inviteText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    lineHeight: 24,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  accordionCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 12,
    overflow: "hidden",
  },
  accordionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  accordionTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  accordionBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  scheduleList: {
    marginBottom: 14,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  scheduleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.primary,
    marginTop: 7,
    marginRight: 10,
  },
  scheduleText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.primary,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#fff",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "transparent",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  buttonGroup: {
    gap: 10,
  },
  initiationGrid: {
    gap: 12,
  },
  initiationCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  initiationLanguage: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.primary,
    marginBottom: 4,
  },
  initiationTime: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 14,
  },
  supportCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginTop: 16,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  supportSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  supportGroup: {
    marginBottom: 16,
  },
  supportLanguage: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  phoneRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  phoneChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(224, 123, 57, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  phoneChipText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
});

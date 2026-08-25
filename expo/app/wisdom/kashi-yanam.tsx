import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { Stack } from "expo-router";
import { Play } from "lucide-react-native";
import Colors from "@/constants/colors";

interface PlaylistTile {
  language: string;
  url: string;
}

const PLAYLISTS: PlaylistTile[] = [
  {
    language: "English",
    url: "https://www.youtube.com/watch?v=uY5x8a0P6EU&list=PLlsGDh-BGen_eQGQyK1zQRHRTTbPRyYZD",
  },
  {
    language: "Telugu",
    url: "https://www.youtube.com/watch?v=lg1utk9c0eU&list=PLgRFC4GmnUUM1sHooFuQtjEC22GKCWJk2",
  },
  {
    language: "Hindi",
    url: "https://www.youtube.com/watch?v=YEs9OdUPLr8&list=PLSququnG0hXcusMC6pHjn4SHhP33hJJhm",
  },
  {
    language: "Malayalam",
    url: "https://www.youtube.com/watch?v=eN4YRs4Bjig&list=PLo83ev_p7S3vaN_zeDzccZhevYZUy-HW_",
  },
  {
    language: "Kannada",
    url: "https://www.youtube.com/playlist?list=PLBDKM205gs2GEH5zDPOk1hsDiOFd0yyJy",
  },
  {
    language: "Tamil",
    url: "https://www.youtube.com/watch?v=Jrxaiswf5WY&list=PLrqpMmIaKwthTHjYt2JxgpCjKlOijakp9",
  },
];

export default function KashiYanamScreen() {
  const openPlaylist = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Unable to open", "Could not open this YouTube playlist.");
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Kashi Yanam" }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            The Journey to Kashi
          </Text>
          <Text style={styles.headerSubtitle}>
            In the footsteps of our Guru maa
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Playlist</Text>
          <View style={styles.tileGrid}>
            {PLAYLISTS.map((playlist) => (
              <TouchableOpacity
                key={playlist.language}
                style={styles.tile}
                onPress={() => openPlaylist(playlist.url)}
                activeOpacity={0.9}
              >
                <View style={styles.playIcon}>
                  <Play size={24} color="#fff" fill="#fff" />
                </View>
                <Text style={styles.tileLanguage}>{playlist.language}</Text>
                <Text style={styles.tileLabel}>YouTube Playlist</Text>
              </TouchableOpacity>
            ))}
          </View>
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
  header: {
    padding: 20,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.light.text,
    marginBottom: 4,
    lineHeight: 36,
  },
  headerSubtitle: {
    fontSize: 17,
    color: Colors.light.primary,
    fontWeight: "600" as const,
    lineHeight: 26,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  tileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  tile: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  playIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FF0000",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  tileLanguage: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  tileLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  bottomPadding: {
    height: 20,
  },
});

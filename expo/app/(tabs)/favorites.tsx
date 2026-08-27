import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Heart } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useFavorites } from "@/context/favorites";

export default function FavoritesScreen() {
  const { favorites, removeFavorite } = useFavorites();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {favorites.length === 0 ? (
          <View style={styles.empty}>
            <Heart size={48} color="rgba(224, 85, 85, 0.4)" />
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptyHint}>
              Tap the heart on the daily quote to keep it here.
            </Text>
          </View>
        ) : (
          favorites.map((favorite) => (
            <View key={favorite.id} style={styles.card}>
              <View style={styles.quoteIcon}>
                <Text style={styles.quoteIconText}>&ldquo;</Text>
              </View>
              <Text style={styles.quoteText}>{favorite.title}</Text>
              <Text style={styles.author}>
                — Sushumna Kriya Yoga Foundation
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.savedOn}>
                  Saved{" "}
                  {new Date(favorite.savedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Remove from favorites"
                  onPress={() => removeFavorite(favorite.id)}
                >
                  <Heart size={20} color="#E05555" fill="#E05555" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF3E2",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 120,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  emptyHint: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#8A6A4F",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFEFA",
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 20,
    paddingTop: 32,
    marginBottom: 14,
    shadowColor: "#7A3B12",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  quoteIcon: {
    position: "absolute",
    top: 4,
    left: 16,
  },
  quoteIconText: {
    fontSize: 44,
    color: Colors.light.primaryLight,
    fontWeight: "700" as const,
    opacity: 0.4,
    lineHeight: 52,
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 25,
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 10,
  },
  author: {
    fontSize: 13,
    color: Colors.light.primary,
    textAlign: "center",
    fontWeight: "600" as const,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(122, 59, 18, 0.08)",
  },
  savedOn: {
    fontSize: 12,
    color: "#8A6A4F",
  },
});

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Home, Search } from "lucide-react-native";
import Colors from "@/constants/colors";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Search size={64} color={Colors.light.textLight} />
      </View>
      <Text style={styles.title}>Page Not Found</Text>
      <Text style={styles.subtitle}>
        The page you are looking for does not exist or has been moved.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/")}
      >
        <Home size={20} color="#fff" />
        <Text style={styles.buttonText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.backgroundDark,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 30,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
});

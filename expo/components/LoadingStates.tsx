/**
 * Shared loading and error state components for API-driven screens.
 */

import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import Colors from "@/constants/colors";

/** Full-screen centered loading spinner */
export function LoadingState({ message = "Loading…" }: { message?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.light.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

/** Inline loading spinner (smaller, for sections) */
export function InlineLoading({ message = "Loading…" }: { message?: string }) {
  return (
    <View style={styles.inlineContainer}>
      <ActivityIndicator size="small" color={Colors.light.primary} />
      <Text style={styles.inlineText}>{message}</Text>
    </View>
  );
}

/** Full-screen error message with retry hint */
export function ErrorState({
  message = "Something went wrong",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.errorIcon}>⚠</Text>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry && (
        <Text style={styles.retryText} onPress={onRetry}>
          Tap to retry
        </Text>
      )}
    </View>
  );
}

/** Empty state when no data is available */
export function EmptyState({ message = "No content available" }: { message?: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.emptyIcon}>🕊️</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
    padding: 24,
  },
  text: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 12,
    textAlign: "center",
  },
  inlineContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  inlineText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 8,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  retryText: {
    fontSize: 15,
    color: Colors.light.primary,
    fontWeight: "600" as const,
    marginTop: 16,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
});

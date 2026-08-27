/**
 * Persisted preferred-language setting for daily quotes.
 *
 * Stores the user's choice in AsyncStorage so it survives app restarts.
 * Quote languages match the WordPress quote sub-categories:
 * English, Telugu, Hindi, and Tamil (plus "all").
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";
import type { LanguageFilter } from "@/utils/language";

const STORAGE_KEY = "preferredQuoteLanguage";

/** Languages available in the Quotes pool, in display order. */
export const QUOTE_LANGUAGES: { code: LanguageFilter; label: string }[] = [
  { code: "all", label: "All" },
  { code: "en", label: "English" },
  { code: "te", label: "తెలుగు" },
  { code: "hi", label: "हिंदी" },
  { code: "ta", label: "தமிழ்" },
];

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const [preferredLanguage, setPreferredLanguageState] =
    useState<LanguageFilter>("all");

  // Load the saved choice once on mount.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) setPreferredLanguageState(stored as LanguageFilter);
      })
      .catch(() => {});
  }, []);

  const setPreferredLanguage = (lang: LanguageFilter) => {
    setPreferredLanguageState(lang);
    AsyncStorage.setItem(STORAGE_KEY, lang).catch(() => {});
  };

  return { preferredLanguage, setPreferredLanguage };
});

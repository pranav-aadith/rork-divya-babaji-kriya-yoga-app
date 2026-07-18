/**
 * Language detection and filtering helpers for multi-language content.
 *
 * Detection is a two-stage process:
 * 1. Look for a known language category name (e.g., "English", "Hindi") on the post.
 * 2. Fall back to Unicode script detection on the title + content.
 */

export type DetectedLanguage =
  | "en"
  | "hi"
  | "te"
  | "ta"
  | "kn"
  | "ml"
  | "bn"
  | "other";

export type LanguageFilter = "all" | DetectedLanguage;

/** Map WordPress language category names to language codes. */
const LANGUAGE_CATEGORY_MAP: Record<string, DetectedLanguage> = {
  english: "en",
  hindi: "hi",
  telugu: "te",
  tamil: "ta",
  kannada: "kn",
  malayalam: "ml",
  bengali: "bn",
  marathi: "hi",
  sanskrit: "hi",
};

/** Unicode script ranges for major Indian languages. */
const SCRIPT_RANGES: Record<Exclude<DetectedLanguage, "en" | "other">, RegExp> = {
  te: /[\u0C00-\u0C7F]/,
  hi: /[\u0900-\u097F]/,
  ta: /[\u0B80-\u0BFF]/,
  kn: /[\u0C80-\u0CFF]/,
  ml: /[\u0D00-\u0D7F]/,
  bn: /[\u0980-\u09FF]/,
};

/** Display names for language chips. */
const LANGUAGE_NAMES: Record<LanguageFilter, string> = {
  all: "All",
  en: "English",
  hi: "Hindi",
  te: "Telugu",
  ta: "Tamil",
  kn: "Kannada",
  ml: "Malayalam",
  bn: "Bengali",
  other: "Other",
};

/**
 * Detect the language of a post by its categories first, then by script.
 * @param text - title + excerpt + content to inspect
 * @param categoryNames - category names assigned to the post
 */
export function detectLanguage(
  text: string,
  categoryNames: string[] = []
): DetectedLanguage {
  const normalizedCats = categoryNames.map((c) =>
    c.toLowerCase().replace(/[^a-z]/g, "")
  );

  for (const [catName, code] of Object.entries(LANGUAGE_CATEGORY_MAP)) {
    if (normalizedCats.includes(catName)) {
      return code;
    }
  }

  const combined = text.trim();
  if (!combined) return "other";

  for (const [code, regex] of Object.entries(SCRIPT_RANGES)) {
    if (regex.test(combined)) {
      return code as Exclude<DetectedLanguage, "en" | "other">;
    }
  }

  // If the text is mostly Latin/ASCII, treat it as English.
  if (
    /^[\x00-\x7F\s\u2018\u2019\u201C\u201D\u2013\u2014%]+$/.test(combined)
  ) {
    return "en";
  }

  return "other";
}

/** Get a readable label for a language filter code. */
export function getLanguageName(code: LanguageFilter): string {
  return LANGUAGE_NAMES[code] ?? "Other";
}

/** Build a sorted list of language filter options present in the data. */
export function getAvailableLanguages(
  languages: DetectedLanguage[],
  allowed: DetectedLanguage[] = ["en", "hi", "te", "ta", "kn", "ml", "bn"]
): LanguageFilter[] {
  const codes = Array.from(new Set(languages))
    .filter((c) => allowed.includes(c))
    .sort();
  return ["all", ...codes];
}

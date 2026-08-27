/**
 * Persisted favorite quotes.
 *
 * Stores the user's saved quotes in AsyncStorage so favorites survive app
 * restarts. Quotes are saved as a lightweight snapshot (id + title) so the
 * Favorites screen can render without refetching from WordPress.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";

const STORAGE_KEY = "favoriteQuotes";

export interface FavoriteQuote {
  id: number;
  title: string;
  savedAt: string;
}

export const [FavoritesProvider, useFavorites] = createContextHook(() => {
  const [favorites, setFavorites] = useState<FavoriteQuote[]>([]);

  // Load saved favorites once on mount.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored) return;
        const parsed = JSON.parse(stored) as FavoriteQuote[];
        if (Array.isArray(parsed)) setFavorites(parsed);
      })
      .catch(() => {});
  }, []);

  const persist = (next: FavoriteQuote[]) => {
    setFavorites(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  };

  const toggleFavorite = (quote: { id: number; title: string }) => {
    const exists = favorites.some((f) => f.id === quote.id);
    persist(
      exists
        ? favorites.filter((f) => f.id !== quote.id)
        : [
            {
              id: quote.id,
              title: quote.title,
              savedAt: new Date().toISOString(),
            },
            ...favorites,
          ]
    );
  };

  const removeFavorite = (id: number) => {
    persist(favorites.filter((f) => f.id !== id));
  };

  const isFavorite = (id: number) => favorites.some((f) => f.id === id);

  return { favorites, toggleFavorite, removeFavorite, isFavorite };
});

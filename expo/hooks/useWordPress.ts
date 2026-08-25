/**
 * React Query hooks for WordPress REST API data.
 * All hooks use the object API for consistent query key sharing.
 */

import { useQuery } from "@tanstack/react-query";
import {
  fetchPosts,
  fetchPostById,
  fetchPostBySlug,
  fetchPages,
  fetchPageById,
  fetchPageBySlug,
  fetchCategories,
  fetchTags,
  fetchProgramPages,
  fetchQuotes,
  fetchEventPosts,
  fetchWisdomPosts,
  splitEventsByDate,
} from "@/services/wordpress";

/** Fetch all posts (with embedded media/categories) */
export function usePosts(params?: {
  per_page?: number;
  categories?: number;
  search?: string;
  includeContent?: boolean;
}) {
  return useQuery({
    queryKey: ["wp", "posts", params],
    queryFn: () => fetchPosts(params, params?.includeContent ?? false),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/** Fetch a single post by ID */
export function usePost(id: number | null) {
  return useQuery({
    queryKey: ["wp", "post", id],
    queryFn: () => fetchPostById(id as number),
    enabled: id !== null && id !== undefined,
    staleTime: 1000 * 60 * 5,
  });
}

/** Fetch a single post by slug */
export function usePostBySlug(slug: string | null) {
  return useQuery({
    queryKey: ["wp", "post-slug", slug],
    queryFn: () => fetchPostBySlug(slug as string),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

/** Fetch all pages */
export function usePages(params?: { per_page?: number; search?: string }) {
  return useQuery({
    queryKey: ["wp", "pages", params],
    queryFn: () => fetchPages(params),
    staleTime: 1000 * 60 * 10, // 10 minutes (pages change less often)
  });
}

/** Fetch a single page by ID */
export function usePage(id: number | null) {
  return useQuery({
    queryKey: ["wp", "page", id],
    queryFn: () => fetchPageById(id as number),
    enabled: id !== null && id !== undefined,
    staleTime: 1000 * 60 * 10,
  });
}

/** Fetch a single page by slug */
export function usePageBySlug(slug: string | null) {
  return useQuery({
    queryKey: ["wp", "page-slug", slug],
    queryFn: () => fetchPageBySlug(slug as string),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });
}

/** Fetch all categories */
export function useCategories() {
  return useQuery({
    queryKey: ["wp", "categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/** Fetch all tags */
export function useTags() {
  return useQuery({
    queryKey: ["wp", "tags"],
    queryFn: fetchTags,
    staleTime: 1000 * 60 * 30,
  });
}

/** Fetch program pages (filtered by specific slugs) */
export function useProgramPages() {
  return useQuery({
    queryKey: ["wp", "programs"],
    queryFn: fetchProgramPages,
    staleTime: 1000 * 60 * 10,
  });
}

/** Fetch quote posts (from the Quotes category) */
export function useQuotes(perPage = 20) {
  return useQuery({
    queryKey: ["wp", "quotes", perPage],
    queryFn: () => fetchQuotes(perPage),
    staleTime: 1000 * 60 * 10,
  });
}

/** Fetch event posts (from the Event category) */
export function useEventPosts(perPage = 50) {
  return useQuery({
    queryKey: ["wp", "events", perPage],
    queryFn: () => fetchEventPosts(perPage),
    staleTime: 1000 * 60 * 5,
  });
}

/** Fetch wisdom posts (all posts excluding Event and Upcoming Events) */
export function useWisdomPosts(perPage = 100) {
  return useQuery({
    queryKey: ["wp", "wisdom", perPage],
    queryFn: () => fetchWisdomPosts(perPage),
    staleTime: 1000 * 60 * 5,
  });
}

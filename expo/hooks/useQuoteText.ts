/**
 * Extracted quote text for image-based quote posts.
 *
 * Quote posts on the site are greeting cards — the quote text is baked into
 * the image, so it is read with a vision model. Results live in the React
 * Query cache under the `quote-text` key family, which the cache persister
 * stores, so each image is transcribed at most once per device.
 */
import { useQuery } from "@tanstack/react-query";
import type { Post } from "@/services/wordpress";
import { extractQuoteText } from "@/services/ai";

const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;

export function useQuoteText(post: Post | undefined | null) {
  const imageUrl = post?.imageUrl ?? post?.imageMediumUrl ?? null;

  return useQuery({
    queryKey: ["quote-text", post?.id ?? 0],
    queryFn: () => extractQuoteText(imageUrl as string),
    enabled: Boolean(post && imageUrl),
    staleTime: THIRTY_DAYS,
    gcTime: THIRTY_DAYS,
    retry: 1,
  });
}

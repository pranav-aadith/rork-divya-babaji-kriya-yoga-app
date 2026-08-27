/**
 * AI helpers through the Rork Toolkit proxy (Vercel AI Gateway).
 *
 * See .rork/skills/ai — requests go to `${TOOLKIT_URL}/v2/vercel/v1/...`
 * which forwards to the gateway. The toolkit secret key is injected by the
 * Rork runtime; the browser build replaces it with a delegated token.
 */

const TOOLKIT_URL = process.env.EXPO_PUBLIC_TOOLKIT_URL;
const SECRET_KEY = process.env.EXPO_PUBLIC_RORK_TOOLKIT_SECRET_KEY;

/** Cheap, vision-capable model — sufficient for transcribing quote cards. */
const OCR_MODEL = "google/gemini-2.5-flash-lite";

const QUOTE_OCR_PROMPT =
  "This is a spiritual quote greeting card. Transcribe the exact quote text written on it. Reply with ONLY the quote text itself — no quotation marks, no commentary, no author name. Preserve the original language and script.";

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string | null } }>;
}

/**
 * Read the quote text from a quote greeting-card image.
 * The site's quote posts are images with no text fields, so the daily
 * quote is transcribed with a vision model and cached by the caller.
 */
export async function extractQuoteText(imageUrl: string): Promise<string> {
  const res = await fetch(`${TOOLKIT_URL}/v2/vercel/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SECRET_KEY}`,
    },
    body: JSON.stringify({
      model: OCR_MODEL,
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: QUOTE_OCR_PROMPT },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Quote text extraction failed: ${res.status}`);
  }

  const data = (await res.json()) as ChatCompletionResponse;
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Quote text extraction returned no text");
  return text.replace(/^["“”']+|["“”']+$/g, "").trim();
}

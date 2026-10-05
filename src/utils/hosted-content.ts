import type { ChatMessage } from "../types/graph.js";

/**
 * Attachment content type used by Teams for voice messages. The audio itself is
 * not referenced in the message body; it lives in the card JSON under
 * `media[].url`, pointing to a hostedContents `$value` endpoint.
 */
export const AUDIO_CARD_CONTENT_TYPE = "application/vnd.microsoft.card.audio";

export interface HostedContentRef {
  id: string;
  /** Where the reference was found: inline in the body or in an audio card attachment. */
  source: "body" | "audioCard";
}

const HOSTED_CONTENT_URL_REGEX = /hostedContents\/([a-zA-Z0-9_=-]+)\/\$value/i;
const BODY_HOSTED_CONTENT_REGEX = /hostedContents\/([a-zA-Z0-9_=-]+)\/\$value|itemid="([^"]+)"/gi;

function extractAudioCardIds(content: string | null | undefined): string[] {
  if (!content) return [];

  let card: unknown;
  try {
    card = JSON.parse(content);
  } catch {
    return [];
  }

  const media = (card as { media?: unknown })?.media;
  if (!Array.isArray(media)) return [];

  const ids: string[] = [];
  for (const item of media) {
    const url = (item as { url?: unknown })?.url;
    if (typeof url !== "string") continue;
    let decodedUrl = url;
    try {
      decodedUrl = decodeURIComponent(url);
    } catch {
      // Keep the raw URL when it is not valid percent-encoding
    }
    const match = HOSTED_CONTENT_URL_REGEX.exec(decodedUrl);
    if (match?.[1]) ids.push(match[1]);
  }
  return ids;
}

/**
 * Collect hosted content IDs referenced by a message, from inline body content
 * (images) and from audio card attachments (voice messages). IDs are deduplicated
 * and returned in discovery order.
 */
export function extractHostedContentRefs(message: ChatMessage): HostedContentRef[] {
  const refs: HostedContentRef[] = [];
  const seen = new Set<string>();
  const add = (id: string, source: HostedContentRef["source"]) => {
    if (!seen.has(id)) {
      seen.add(id);
      refs.push({ id, source });
    }
  };

  const bodyContent = message.body?.content || "";
  for (const match of bodyContent.matchAll(BODY_HOSTED_CONTENT_REGEX)) {
    const contentId = match[1] || match[2];
    if (contentId) add(contentId, "body");
  }

  for (const attachment of message.attachments ?? []) {
    if (attachment.contentType !== AUDIO_CARD_CONTENT_TYPE) continue;
    for (const id of extractAudioCardIds(attachment.content)) {
      add(id, "audioCard");
    }
  }

  return refs;
}

/**
 * Resolve the content type of downloaded hosted content. Voice messages are MP4
 * containers that the magic-byte detector cannot distinguish from video, so the
 * audio card origin is used to report them as audio.
 */
export function resolveHostedContentType(
  detected: string,
  source: HostedContentRef["source"] | undefined
): string {
  if (
    source === "audioCard" &&
    (detected === "video/mp4" || detected === "application/octet-stream")
  ) {
    return "audio/mp4";
  }
  return detected;
}

import type { ChatMessageMention } from "@microsoft/microsoft-graph-types";
/**
 * Converts Teams HTML content to clean Markdown.
 * Handles Teams-specific elements like @mentions, attachments, and system events.
 *
 * @param html - Raw HTML content from Microsoft Graph API
 * @param mentions - Optional mentions array from ChatMessage for multi-word name merging
 * @returns Clean Markdown string
 */
export declare function htmlToMarkdown(html: string, mentions?: ChatMessageMention[] | null): string;
/**
 * Formats message content based on the requested format.
 *
 * @param content - Raw message content from Graph API (HTML)
 * @param format - "markdown" to convert HTML to Markdown, "raw" to return as-is
 * @param mentions - Optional mentions array from ChatMessage for multi-word name merging
 * @returns Formatted content string, or the original value if null/undefined
 */
export declare function formatMessageContent(content: string | null | undefined, format: "raw" | "markdown", mentions?: ChatMessageMention[] | null): string | null | undefined;
//# sourceMappingURL=html-to-markdown.d.ts.map
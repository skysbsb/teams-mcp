import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GraphService } from "../services/graph.js";
import type { SearchHit } from "../types/graph.js";
/**
 * Maps raw SearchHit objects from the Microsoft Search API into a
 * consistent, flat shape for tool responses.
 *
 * @param hits - Array of search hits from the Microsoft Search API
 * @param contentFormat - Format for message content: "markdown" or "raw"
 */
export declare function formatSearchHits(hits: SearchHit[], contentFormat?: "raw" | "markdown"): {
    id: string;
    summary: string;
    rank: number;
    content: string | null | undefined;
    from: string | undefined;
    fromUserId: string | undefined;
    createdDateTime: string | undefined;
    importance: string | undefined;
    webLink: string | undefined;
    chatId: string | undefined;
    teamId: string | undefined;
    channelId: string | undefined;
}[];
export declare function registerSearchTools(server: McpServer, graphService: GraphService, _readOnly: boolean): void;
//# sourceMappingURL=search.d.ts.map
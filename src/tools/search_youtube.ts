import { z } from "zod";
import { type InferSchema } from "xmcp";
import { withCache } from "../utils/youtube-client";
import { youtubeApiRequest } from "../utils/youtube-api";

export const schema = {
  query: z.string().describe("The search query to find videos"),
  maxResults: z.number().min(1).max(50).default(10).describe("Maximum number of results to return (default: 10, max: 50)"),
};

export const metadata = {
  name: "search_youtube",
  description: "Search YouTube for videos",
  annotations: {
    title: "Search YouTube",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function search_youtube({ query, maxResults }: InferSchema<typeof schema>) {
  try {
    const cacheKey = `search_${query}_${maxResults}`;
    
    return await withCache(cacheKey, async () => {
      console.error(`Searching YouTube Data API for: ${query}`);
      const response = await youtubeApiRequest<any>("search", {
        part: "snippet",
        q: query,
        type: "video",
        maxResults,
      });

      if (!response || !response.items) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify([], null, 2),
            },
          ],
        };
      }

      const videos = response.items.map((item: any) => {
        return {
          videoId: item.id?.videoId || 'unknown',
          title: item.snippet?.title || 'Unknown',
          channel: item.snippet?.channelTitle || 'Unknown',
          publishedTime: item.snippet?.publishedAt || 'Unknown',
          thumbnail: item.snippet?.thumbnails?.default?.url || '',
          url: `https://www.youtube.com/watch?v=${item.id?.videoId || 'unknown'}`
        };
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(videos, null, 2),
          },
        ],
      };
    });
  } catch (error: any) {
    console.error(`Error in search_youtube for query "${query}":`, error);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: "Failed to search YouTube",
            query,
            message: error.message || String(error)
          }, null, 2),
        },
      ],
    };
  }
}

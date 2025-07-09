import { z } from "zod";
import { type InferSchema } from "xmcp";
import { Innertube } from "youtubei.js";

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
    const yt = await Innertube.create({ generate_session_locally: true });
    const search = await yt.search(query, { type: 'video' });
    
    if (!search || !search.videos) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify([], null, 2),
          },
        ],
      };
    }
    
    const videos = search.videos.slice(0, maxResults).map((video: any) => {
      return {
        videoId: video.id || 'unknown',
        title: String(video.title || 'Unknown'),
        channel: String(video.author?.name || 'Unknown'),
        duration: String(video.duration || 'Unknown'),
        views: String(video.view_count || 'Unknown'),
        publishedTime: String(video.published || 'Unknown'),
        thumbnail: video.thumbnails?.[0]?.url || '',
        url: `https://www.youtube.com/watch?v=${video.id || 'unknown'}`
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
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message || String(error)}`,
        },
      ],
    };
  }
}

import { z } from "zod";
import { type InferSchema } from "xmcp";
import { withCache } from "../utils/youtube-client";
import { youtubeApiRequest } from "../utils/youtube-api";

export const schema = {
  videoId: z.string().describe("YouTube video ID"),
  includeComments: z.boolean().default(false).describe("Include top comments"),
};

export const metadata = {
  name: "get_video_info",
  description: "Get comprehensive information about a YouTube video",
  annotations: {
    title: "Get Video Info",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function get_video_info({ videoId, includeComments }: InferSchema<typeof schema>) {
  try {
    const cacheKey = `video_info_${videoId}_${includeComments}`;
    
    return await withCache(cacheKey, async () => {
      console.error(`Getting info for video from YouTube Data API: ${videoId}`);
      const response = await youtubeApiRequest<any>("videos", {
        part: "snippet,contentDetails,statistics",
        id: videoId,
      });
      const video = response?.items?.[0];
      if (!video) {
        return {
          content: [{ type: "text", text: JSON.stringify({}, null, 2) }],
        };
      }
      const snippet = video.snippet || {};
      const stats = video.statistics || {};
      const contentDetails = video.contentDetails || {};
      const videoData: any = {
        videoId: video.id,
        title: snippet.title,
        description: snippet.description,
        duration: contentDetails.duration, // ISO 8601 duration
        viewCount: stats.viewCount,
        likeCount: stats.likeCount,
        channel: {
          name: snippet.channelTitle,
          id: snippet.channelId,
          url: `https://www.youtube.com/channel/${snippet.channelId}`,
        },
        tags: snippet.tags,
        thumbnail: snippet.thumbnails?.default?.url,
      };
      // Comments are handled by a separate tool
      return {
        content: [{ type: "text", text: JSON.stringify(videoData, null, 2) }],
      };
    });
  } catch (error) {
    console.error(`Error in get_video_info for ${videoId}:`, error);
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify({
          error: "Failed to get video info",
          videoId,
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        }, null, 2)
      }],
    };
  }
}

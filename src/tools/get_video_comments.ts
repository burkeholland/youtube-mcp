import { z } from "zod";
import { type InferSchema } from "xmcp";
import { youtubeApiRequest } from "../utils/youtube-api";

export const schema = {
  videoId: z.string().describe("YouTube video ID"),
  sortBy: z.enum(["TOP_COMMENTS", "NEWEST_FIRST"]).default("TOP_COMMENTS").describe("Sort order for comments"),
  maxResults: z.number().min(1).max(100).default(20).describe("Maximum number of comments to return"),
};

export const metadata = {
  name: "get_video_comments",
  description: "Get comments for a YouTube video",
  annotations: {
    title: "Get Video Comments",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};
export default async function get_video_comments({ videoId, sortBy, maxResults }: InferSchema<typeof schema>) {
  // Map sortBy to API's order param
  const order = sortBy === "NEWEST_FIRST" ? "time" : "relevance";
  const response = await youtubeApiRequest<any>("commentThreads", {
    part: "snippet",
    videoId,
    maxResults,
    order,
    textFormat: "plainText",
  });
  const items = (response.items || []).map((item: any) => {
    const topComment = item.snippet?.topLevelComment?.snippet || {};
    return {
      author: topComment.authorDisplayName,
      text: topComment.textDisplay,
      likeCount: topComment.likeCount,
      publishedTime: topComment.publishedAt,
    };
  });
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(items, null, 2),
      },
    ],
  };
}

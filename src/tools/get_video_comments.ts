import { z } from "zod";
import { type InferSchema } from "xmcp";
import { Innertube } from "youtubei.js";

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
  const yt = await Innertube.create({ generate_session_locally: true });
  const comments = await yt.getComments(videoId, sortBy);
  const items = comments.contents.slice(0, maxResults).map((comment: any) => ({
    author: comment.author?.name,
    text: comment.content?.text,
    likeCount: comment.vote_count,
    publishedTime: comment.published?.text,
  }));
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(items, null, 2),
      },
    ],
  };
}

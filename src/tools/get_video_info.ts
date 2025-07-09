import { z } from "zod";
import { type InferSchema } from "xmcp";
import { Innertube } from "youtubei.js";

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
  const yt = await Innertube.create({ generate_session_locally: true });
  const info = await yt.getInfo(videoId);

  const videoData: any = {
    videoId: info.basic_info.id,
    title: info.basic_info.title,
    description: info.basic_info.short_description,
    duration: info.basic_info.duration, // seconds
    viewCount: info.basic_info.view_count,
    likeCount: info.basic_info.like_count,
    channel: info.basic_info.channel
      ? {
          name: info.basic_info.channel.name,
          id: info.basic_info.channel.id,
          url: info.basic_info.channel.url,
        }
      : null,
    tags: info.basic_info.keywords,
    thumbnail: info.basic_info.thumbnail?.[0]?.url,
  };

  if (includeComments) {
    const comments = await yt.getComments(videoId, 'TOP_COMMENTS');
    videoData.topComments = comments.contents.slice(0, 10).map((comment: any) => ({
      author: comment.author?.name,
      text: comment.content?.text,
      likeCount: comment.vote_count,
      publishedTime: comment.published?.text,
    }));
  }

  return {
    content: [{ type: "text", text: JSON.stringify(videoData, null, 2) }],
  };
}

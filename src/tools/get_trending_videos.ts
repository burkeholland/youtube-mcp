import { z } from "zod";
import { type InferSchema } from "xmcp";
import { Innertube } from "youtubei.js";

export const schema = {
  limit: z.number().min(1).max(50).default(10).describe("Maximum number of trending videos to return (1-50)"),
};

export const metadata = {
  name: "get_trending_videos",
  description: "Get trending YouTube videos",
  annotations: {
    title: "Get Trending Videos",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function get_trending_videos({ limit }: InferSchema<typeof schema>) {
  const yt = await Innertube.create({ generate_session_locally: true });
  const trending = await yt.getTrending();
  const videos = trending.videos?.slice(0, limit).map((video: any) => ({
    videoId: video.id,
    title: video.title,
    author: video.author?.name,
    duration: video.duration,
    url: `https://www.youtube.com/watch?v=${video.id}`,
    thumbnails: video.thumbnails,
  })) ?? [];
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(videos, null, 2),
      },
    ],
  };
}

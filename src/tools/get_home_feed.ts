import { z } from "zod";
import { type InferSchema } from "xmcp";
import { Innertube } from "youtubei.js";

export const schema = {
  limit: z.number().min(1).max(50).default(10).describe("Maximum number of home feed videos to return (1-50)"),
};

export const metadata = {
  name: "get_home_feed",
  description: "Get the YouTube home feed (recommended videos)",
  annotations: {
    title: "Get Home Feed",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function get_home_feed({ limit }: InferSchema<typeof schema>) {
  const yt = await Innertube.create({ generate_session_locally: true });
  const home = await yt.getHomeFeed();
  const videos = home.videos?.slice(0, limit).map((video: any) => ({
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

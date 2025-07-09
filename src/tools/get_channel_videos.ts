import { z } from "zod";
import { type InferSchema } from "xmcp";
import { Innertube } from "youtubei.js";

export const schema = {
  channelId: z.string().describe("YouTube channel ID"),
  maxResults: z.number().min(1).max(50).default(10).describe("Maximum number of videos to return"),
};

export const metadata = {
  name: "get_channel_videos",
  description: "Get a list of videos from a YouTube channel",
  annotations: {
    title: "Get Channel Videos",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function get_channel_videos({ channelId, maxResults }: InferSchema<typeof schema>) {
  const yt = await Innertube.create({ generate_session_locally: true });
  const channel = await yt.getChannel(channelId);
  const videos = channel.videos?.slice(0, maxResults).map((video: any) => ({
    videoId: video.id,
    title: video.title,
    published: video.published,
    views: video.view_count,
    duration: video.duration,
    thumbnail: video.thumbnails?.[0]?.url || null,
    url: `https://www.youtube.com/watch?v=${video.id}`,
  })) || [];
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(videos, null, 2),
      },
    ],
  };
}

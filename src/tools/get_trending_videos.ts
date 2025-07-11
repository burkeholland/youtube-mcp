import { z } from "zod";
import { type InferSchema } from "xmcp";
import { youtubeApiRequest } from "../utils/youtube-api";

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
  const response = await youtubeApiRequest<any>("videos", {
    part: "snippet,contentDetails,statistics",
    chart: "mostPopular",
    maxResults: limit,
    regionCode: "US", // You can make this configurable if needed
  });
  const videos = (response.items || []).map((video: any) => ({
    videoId: video.id,
    title: video.snippet?.title || null,
    author: video.snippet?.channelTitle || null,
    duration: video.contentDetails?.duration || null,
    url: `https://www.youtube.com/watch?v=${video.id}`,
    thumbnails: video.snippet?.thumbnails || null,
  }));
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(videos, null, 2),
      },
    ],
  };
}

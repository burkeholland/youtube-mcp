import { z } from "zod";
import { type InferSchema } from "xmcp";
import { youtubeApiRequest } from "../utils/youtube-api";

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
  // Step 1: Get uploads playlist ID
  const channelResp = await youtubeApiRequest<any>("channels", {
    part: "contentDetails",
    id: channelId,
  });
  const uploadsPlaylistId = channelResp?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify([], null, 2),
        },
      ],
    };
  }

  // Step 2: Get videos from uploads playlist
  const playlistResp = await youtubeApiRequest<any>("playlistItems", {
    part: "snippet,contentDetails",
    playlistId: uploadsPlaylistId,
    maxResults,
  });
  const videos = (playlistResp.items || []).map((item: any) => ({
    videoId: item.contentDetails?.videoId || null,
    title: item.snippet?.title || null,
    published: item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt || null,
    // views and duration not available here; would require extra videos.list call
    views: null,
    duration: null,
    thumbnail: item.snippet?.thumbnails?.default?.url || null,
    url: `https://www.youtube.com/watch?v=${item.contentDetails?.videoId || ''}`,
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

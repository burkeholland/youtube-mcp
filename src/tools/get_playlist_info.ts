import { z } from "zod";
import { type InferSchema } from "xmcp";
import { youtubeApiRequest } from "../utils/youtube-api";

export const schema = {
  playlistId: z.string().describe("YouTube playlist ID"),
};

export const metadata = {
  name: "get_playlist_info",
  description: "Get information about a YouTube playlist and its videos",
  annotations: {
    title: "Get Playlist Info",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};
export default async function get_playlist_info({ playlistId }: InferSchema<typeof schema>) {
  // Get playlist info
  const playlistResp = await youtubeApiRequest<any>("playlists", {
    part: "snippet,contentDetails",
    id: playlistId,
  });
  const playlist = playlistResp?.items?.[0];
  if (!playlist) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({}, null, 2),
        },
      ],
    };
  }

  // Get videos in playlist
  const videosResp = await youtubeApiRequest<any>("playlistItems", {
    part: "snippet,contentDetails",
    playlistId,
    maxResults: 50, // API max per request
  });
  const videos = (videosResp.items || []).map((item: any) => ({
    videoId: item.contentDetails?.videoId || null,
    title: item.snippet?.title || null,
    duration: null, // Not available here; would require extra videos.list call
    url: `https://www.youtube.com/watch?v=${item.contentDetails?.videoId || ''}`,
  }));

  const info = {
    id: playlistId,
    title: playlist.snippet?.title ?? null,
    description: playlist.snippet?.description ?? null,
    videoCount: playlist.contentDetails?.itemCount ?? null,
    views: null, // Not available in API
    lastUpdated: playlist.snippet?.publishedAt ?? null,
    privacy: null, // Not available in API
    url: `https://www.youtube.com/playlist?list=${playlistId}`,
    author: playlist.snippet?.channelTitle ?? null,
    videos,
  };
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(info, null, 2),
      },
    ],
  };
}

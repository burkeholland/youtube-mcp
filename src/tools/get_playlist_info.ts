import { z } from "zod";
import { type InferSchema } from "xmcp";
import { Innertube } from "youtubei.js";

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
  const yt = await Innertube.create({ generate_session_locally: true });
  const playlist = await yt.getPlaylist(playlistId);
  const info = {
    id: playlistId,
    title: playlist.info?.title ?? null,
    description: playlist.info?.description ?? null,
    videoCount: playlist.info?.total_items ?? null,
    views: playlist.info?.views ?? null,
    lastUpdated: playlist.info?.last_updated ?? null,
    privacy: playlist.info?.privacy ?? null,
    url: `https://www.youtube.com/playlist?list=${playlistId}`,
    author: playlist.info?.author?.name ?? null,
    videos: playlist.videos?.map((video: any) => ({
      videoId: video.id,
      title: video.title,
      duration: video.duration,
      url: `https://www.youtube.com/watch?v=${video.id}`,
    })) ?? [],
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

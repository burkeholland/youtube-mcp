import { z } from "zod";
import { type InferSchema } from "xmcp";
import { Innertube } from "youtubei.js";

export const schema = {
  query: z.string().describe("Search query for playlists"),
  limit: z.number().min(1).max(50).default(10).describe("Maximum number of playlists to return (1-50)"),
};

export const metadata = {
  name: "search_playlists",
  description: "Search for YouTube playlists matching a query",
  annotations: {
    title: "Search Playlists",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function search_playlists({ query, limit }: InferSchema<typeof schema>) {
  const yt = await Innertube.create({ generate_session_locally: true });
  const search = await yt.search(query, { type: "playlist" });
  const playlists = search.results
    .filter((item: any) => item.type === "playlist")
    .slice(0, limit)
    .map((playlist: any) => ({
      playlistId: playlist.id,
      title: playlist.title,
      author: playlist.author?.name,
      videoCount: playlist.video_count,
      url: `https://www.youtube.com/playlist?list=${playlist.id}`,
      thumbnails: playlist.thumbnails,
    }));
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(playlists, null, 2),
      },
    ],
  };
}

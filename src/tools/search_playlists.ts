import { z } from "zod";
import { type InferSchema } from "xmcp";
import { youtubeApiRequest } from "../utils/youtube-api";

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
  const response = await youtubeApiRequest<any>("search", {
    part: "snippet",
    q: query,
    type: "playlist",
    maxResults: limit,
  });
  const playlists = (response.items || []).map((item: any) => ({
    playlistId: item.id?.playlistId || null,
    title: item.snippet?.title || null,
    author: item.snippet?.channelTitle || null,
    videoCount: null, // Not available in search.list
    url: `https://www.youtube.com/playlist?list=${item.id?.playlistId || ''}`,
    thumbnails: item.snippet?.thumbnails || null,
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

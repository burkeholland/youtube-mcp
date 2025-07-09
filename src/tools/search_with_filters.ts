import { z } from "zod";
import { type InferSchema } from "xmcp";
import { Innertube } from "youtubei.js";

export const schema = {
  query: z.string().describe("Search query"),
  type: z.enum(["video", "channel", "playlist", "movie"]).optional().describe("Type of result to filter by (optional)"),
  limit: z.number().min(1).max(50).default(10).describe("Maximum number of results to return (1-50)"),
};

export const metadata = {
  name: "search_with_filters",
  description: "Search YouTube with optional filters (type: video, channel, playlist, movie)",
  annotations: {
    title: "Search with Filters",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function search_with_filters({ query, type, limit }: InferSchema<typeof schema>) {
  const yt = await Innertube.create({ generate_session_locally: true });
  const search = await yt.search(query, type ? { type } : {});
  const results = search.results.slice(0, limit).map((item: any) => {
    if (item.type === "video") {
      return {
        type: "video",
        videoId: item.id,
        title: item.title,
        author: item.author?.name,
        duration: item.duration,
        url: `https://www.youtube.com/watch?v=${item.id}`,
        thumbnails: item.thumbnails,
      };
    } else if (item.type === "channel") {
      return {
        type: "channel",
        channelId: item.id,
        title: item.title,
        url: `https://www.youtube.com/channel/${item.id}`,
        thumbnails: item.thumbnails,
      };
    } else if (item.type === "playlist") {
      return {
        type: "playlist",
        playlistId: item.id,
        title: item.title,
        author: item.author?.name,
        videoCount: item.video_count,
        url: `https://www.youtube.com/playlist?list=${item.id}`,
        thumbnails: item.thumbnails,
      };
    } else if (item.type === "movie") {
      return {
        type: "movie",
        movieId: item.id,
        title: item.title,
        url: item.url,
        thumbnails: item.thumbnails,
      };
    }
    return null;
  }).filter(Boolean);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(results, null, 2),
      },
    ],
  };
}

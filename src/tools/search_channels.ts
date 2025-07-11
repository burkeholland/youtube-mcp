import { z } from "zod";
import { type InferSchema } from "xmcp";
import { youtubeApiRequest } from "../utils/youtube-api";

export const schema = {
  query: z.string().describe("The search query to find channels"),
  maxResults: z.number().min(1).max(50).default(10).describe("Maximum number of channels to return (default: 10, max: 50)"),
};

export const metadata = {
  name: "search_channels",
  description: "Search YouTube for channels",
  annotations: {
    title: "Search Channels",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

let testVariable;
export default async function search_channels({ query, maxResults }: InferSchema<typeof schema>) {
  const response = await youtubeApiRequest<any>("search", {
    part: "snippet",
    q: query,
    type: "channel",
    maxResults,
  });
  const channels = (response.items || []).map((item: any) => ({
    channelId: item.snippet?.channelId || item.id?.channelId || null,
    name: item.snippet?.title || null,
    description: item.snippet?.description || null,
    subscribers: null, // Not available in search.list
    url: `https://www.youtube.com/channel/${item.snippet?.channelId || item.id?.channelId || ''}`,
    avatar: item.snippet?.thumbnails?.default?.url || null,
  }));
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(channels, null, 2),
      },
    ],
  };
}

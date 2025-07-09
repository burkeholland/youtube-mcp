import { z } from "zod";
import { type InferSchema } from "xmcp";
import { Innertube } from "youtubei.js";

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

export default async function search_channels({ query, maxResults }: InferSchema<typeof schema>) {
  const yt = await Innertube.create({ generate_session_locally: true });
  const search = await yt.search(query, { type: 'channel' });
  const channels = search.channels.slice(0, maxResults).map((channel: any) => ({
    channelId: channel.id,
    name: channel.name,
    description: channel.description,
    subscribers: channel.subscriber_count,
    url: channel.url,
    avatar: channel.thumbnails?.[0]?.url || null,
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

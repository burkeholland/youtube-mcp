import { z } from "zod";
import { type InferSchema } from "xmcp";
import { Innertube } from "youtubei.js";

export const schema = {
  channelId: z.string().describe("YouTube channel ID"),
};

export const metadata = {
  name: "get_channel_info",
  description: "Get information about a YouTube channel",
  annotations: {
    title: "Get Channel Info",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function get_channel_info({ channelId }: InferSchema<typeof schema>) {
  const yt = await Innertube.create({ generate_session_locally: true });
  const channel = await yt.getChannel(channelId);
  const meta = channel.metadata || {};
  const info = {
    channelId: meta.external_id || null,
    name: channel.title || meta.title || null,
    description: meta.description || null,
    url: meta.url || null,
    avatar: meta.avatar?.[0]?.url || null,
    // banner and joinedDate not available in metadata
    tags: meta.keywords || [],
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

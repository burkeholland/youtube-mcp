import { z } from "zod";
import { type InferSchema } from "xmcp";
import { withCache } from "../utils/youtube-client";
import { youtubeApiRequest } from "../utils/youtube-api";

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
  try {
    const cacheKey = `channel_info_${channelId}`;
    
    return await withCache(cacheKey, async () => {
      console.error(`Getting channel info from YouTube Data API for: ${channelId}`);
      const response = await youtubeApiRequest<any>("channels", {
        part: "snippet,brandingSettings,statistics",
        id: channelId,
      });

      if (!response || !response.items || response.items.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({}, null, 2),
            },
          ],
        };
      }

      const channel = response.items[0];
      const snippet = channel.snippet || {};
      const branding = channel.brandingSettings || {};
      const info = {
        channelId: channel.id || null,
        name: snippet.title || null,
        description: snippet.description || null,
        url: `https://www.youtube.com/channel/${channel.id}`,
        avatar: snippet.thumbnails?.default?.url || null,
        banner: branding.image?.bannerExternalUrl || null,
        joinedDate: snippet.publishedAt || null,
        tags: branding.channel?.keywords ? branding.channel.keywords.split(" ") : [],
        subscriberCount: channel.statistics?.subscriberCount || null,
        videoCount: channel.statistics?.videoCount || null,
        viewCount: channel.statistics?.viewCount || null,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(info, null, 2),
          },
        ],
      };
    });
  } catch (error: any) {
    console.error(`Error in get_channel_info for ${channelId}:`, error);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: "Failed to get channel info",
            channelId,
            message: error.message || String(error)
          }, null, 2),
        },
      ],
    };
  }
}

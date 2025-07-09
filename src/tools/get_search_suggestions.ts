import { z } from "zod";
import { type InferSchema } from "xmcp";
import { Innertube } from "youtubei.js";

export const schema = {
  query: z.string().describe("Partial search query to get suggestions for"),
};

export const metadata = {
  name: "get_search_suggestions",
  description: "Get YouTube search suggestions for a given query",
  annotations: {
    title: "Get Search Suggestions",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function get_search_suggestions({ query }: InferSchema<typeof schema>) {
  const yt = await Innertube.create({ generate_session_locally: true });
  const suggestions = await yt.getSearchSuggestions(query);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(suggestions, null, 2),
      },
    ],
  };
}
